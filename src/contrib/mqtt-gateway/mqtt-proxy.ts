/* eslint-disable sort-keys */
import mqtt, { MqttClient, IClientOptions } from 'mqtt'
import { v4 } from 'uuid'
import moment from 'moment'
import { FileBox } from 'file-box'
import {
  Contact,
  Wechaty,
  Room,
  log,
  Message,
  types,
} from 'wechaty'

import CryptoJS from 'crypto-js'
import { getKeyByBasicString, encrypt, decrypt } from './crypto-use-crypto-js.js'
import { getCurrentTime, commandName, CommandInfo } from './utils.js'
import {
  handleCommandFriendship,
  handleWechaty,
  handleMessage,
  handleContact,
  handleRoom,
} from './command/mod.js'

// import { MQTTAgent } from './mqtt-agent.js'

export const formatMessageToMQTT = async (message: Message) => {
  log.info('formatMessageToMQTT message:', JSON.stringify(message))
  const talker = message.talker()
  const listener = message.listener()
  const room = message.room()
  let roomJson: any
  if (room) {
    roomJson = JSON.parse(JSON.stringify(room))
    delete roomJson.payload.memberIdList
  }
  const messageType = types.Message[message.type()]
  let text = message.text()
  switch (message.type()) {
    case types.Message.Image: {
      const file = message.toImage()
      const fileBox = await file.artwork()
      text = JSON.stringify(fileBox.toJSON())
      break
    }
    case types.Message.Attachment: {
      const file = await message.toFileBox()
      text = JSON.stringify(file.toJSON())
      break
    }
    case types.Message.Video: {
      const file = await message.toFileBox()
      text = JSON.stringify(file.toJSON())
      break
    }
    case types.Message.Audio: {
      const file = await message.toFileBox()
      text = JSON.stringify(file.toJSON())
      break
    }
    default:
      break
  }
  log.info('formatMessageToMQTT text:', text)
  const timestamp = message.payload?.timestamp ? message.payload.timestamp : new Date().getTime()
  const messageNew = {
    _id: message.id,
    data: message,
    listener: listener ?? undefined,
    room: roomJson,
    talker,
    time: getCurrentTime(timestamp),
    timestamp,
    type: messageType,
    text,
  }
  // log.info('formatMessageToMQTT messageNew:', JSON.stringify(messageNew))
  return messageNew
}

async function formatSentMessage (userSelf: Contact, text: string, talker: Contact | undefined, room: Room | undefined) {
  // console.debug('发送的消息：', text)
  const curTime = new Date().getTime()
  const timeHms = moment(curTime).format('YYYY-MM-DD HH:mm:ss')
  const record = {
    fields: {
      timeHms,
      name: userSelf.name(),
      topic: room ? (await room.topic() || '--') : (talker?.name() || '--'),
      messagePayload: text,
      wxid: room && talker ? (talker.id !== 'null' ? talker.id : '--') : userSelf.id,
      roomid: room ? (room.id || '--') : (talker?.id || '--'),
      messageType: 'selfSent',
    },
  }
  return record
}

async function send (params: any, bot: Wechaty): Promise<Message | void | { msg: string }> {

  let msg: any = ''
  let message: Message | void = {} as Message

  if (params.messageType === 'Text') {
    /* {
      "reqId":"442c1da4-9d3a-4f9b-a6e9-bfe858e4ac43",
      "method":"thing.command.invoke",
      "version":"1.0",
      "timestamp":1610430718000,
      "name":"send",
      "params":{
          "toContacts":[
              "tyutluyc",
              "5550027590@chatroom"
          ],
          "messageType":"Text",
          "messagePayload":"welcome to wechaty!"
      }
    } */
    msg = params.messagePayload

  } else if (params.messageType === 'Contact') {
    /* {
          "reqId":"442c1da4-9d3a-4f9b-a6e9-bfe858e4ac43",
          "method":"thing.command.invoke",
          "version":"1.0",
          "timestamp":1610430718000,
          "name":"send",
          "params":{
              "toContacts":[
                  "tyutluyc",
                  "5550027590@chatroom"
              ],
              "messageType":"Contact",
              "messagePayload":"tyutluyc"
          }
      } */
    const contactCard = await bot.Contact.find({ id: params.messagePayload })
    if (!contactCard) {
      return {
        msg: '无此联系人',
      }
    } else {
      msg = contactCard
    }

  } else if (params.messageType === 'Attachment') {
    /* {
        "reqId":"442c1da4-9d3a-4f9b-a6e9-bfe858e4ac43",
        "method":"thing.command.invoke",
        "version":"1.0",
        "timestamp":1610430718000,
        "name":"send",
        "params":{
            "toContacts":[
                "tyutluyc",
                "5550027590@chatroom"
            ],
            "messageType":"Attachment",
            "messagePayload":"/tmp/text.txt"
        }
    } */
    if (params.messagePayload.indexOf('http') !== -1 || params.messagePayload.indexOf('https') !== -1) {
      msg = FileBox.fromUrl(params.messagePayload)
    } else {
      msg = FileBox.fromFile(params.messagePayload)
    }

  } else if (params.messageType === 'Image') {
    /* {
        "reqId":"442c1da4-9d3a-4f9b-a6e9-bfe858e4ac43",
        "method":"thing.command.invoke",
        "version":"1.0",
        "timestamp":1610430718000,
        "name":"send",
        "params":{
            "toContacts":[
                "tyutluyc",
                "5550027590@chatroom"
            ],
            "messageType":"Image",
            "messagePayload":"https://wechaty.github.io/wechaty/images/bot-qr-code.png"
        }
    } */
    // msg = FileBox.fromUrl(params.messagePayload)
    if (params.messagePayload.indexOf('http') !== -1 || params.messagePayload.indexOf('https') !== -1) {
      log.info('图片http地址：', params.messagePayload)
      msg = FileBox.fromUrl(params.messagePayload)
    } else {
      log.info('图片本地地址：', params.messagePayload)
      msg = FileBox.fromFile(params.messagePayload)
    }

  } else if (params.messageType === 'Url') {
    /* {
        "reqId":"442c1da4-9d3a-4f9b-a6e9-bfe858e4ac43",
        "method":"thing.command.invoke",
        "version":"1.0",
        "timestamp":1610430718000,
        "name":"send",
        "params":{
            "toContacts":[
                "tyutluyc",
                "5550027590@chatroom"
            ],
            "messageType":"Url",
            "messagePayload":{
                "description":"WeChat Bot SDK for Individual Account, Powered by TypeScript, Docker, and Love",
                "thumbnailUrl":"https://avatars0.githubusercontent.com/u/25162437?s=200&v=4",
                "title":"Welcome to Wechaty",
                "url":"https://github.com/wechaty/wechaty"
            }
        }
    } */
    msg = params.messagePayload

  } else if (params.messageType === 'MiniProgram') {
    /* {
        "reqId":"442c1da4-9d3a-4f9b-a6e9-bfe858e4ac43",
        "method":"thing.command.invoke",
        "version":"1.0",
        "timestamp":1610430718000,
        "name":"send",
        "params":{
            "toContacts":[
                "tyutluyc",
                "5550027590@chatroom"
            ],
            "messageType":"MiniProgram",
            "messagePayload":{
                "appid":"wx36027ed8c62f675e",
                "description":"群组大师群管理工具",
                "title":"群组大师",
                "pagePath":"pages/start/relatedlist/index.html",
                "thumbKey":"",
                "thumbUrl":"http://mmbiz.qpic.cn/mmbiz_jpg/mLJaHznUd7O4HCW51IPGVarcVwAAAuofgAibUYIct2DBPERYIlibbuwthASJHPBfT9jpSJX4wfhGEBnqDvFHHQww/0",
                "username":"gh_6c52e2baeb2d@app"
            }
        }
    } */
    msg = params.messagePayload

  } else {
    return {
      msg: '不支持的消息类型',
    }
  }

  log.info('远程发送消息 msg:' + msg)

  const toContacts = params.toContacts

  for (let i = 0; i < toContacts.length; i++) {
    if (toContacts[i].split('@').length === 2 || toContacts[i].split(':').length === 2) {
      log.info(`向群${toContacts[i]}发消息`)
      try {
        const room: Room | undefined = await bot.Room.find({ id: toContacts[i] })
        if (room) {
          try {
            message = await room.say(msg)
            await formatSentMessage(bot.currentUser, msg, undefined, room)

            // 发送成功后向前端发送消息

          } catch (err) {
            log.error('发送群消息失败：' + err)
          }
        }
      } catch (err) {
        log.error('获取群失败：', err)
      }

    } else {
      log.info(`好友${toContacts[i]}发消息`)
      // log.info(bot)
      try {
        const contact: Contact | undefined = await bot.Contact.find({ id: toContacts[i] })
        if (contact) {
          try {
            message = await contact.say(msg)
            await formatSentMessage(bot.currentUser, msg, contact, undefined)
          } catch (err) {
            log.error('发送好友消息失败：' + err)
          }
        }
      } catch (err) {
        log.error('获取好友失败：', err)
      }
    }
  }
  return message
}

async function sendAt (params: any, bot: Wechaty): Promise<Message | void | { msg: string }> {
  let message: Message | void = {} as Message
  const atUserIdList = params.toContacts
  const room = await bot.Room.find({ id: params.room })
  const atUserList = []
  for (const userId of atUserIdList) {
    const curContact = await bot.Contact.find({ id: userId })
    atUserList.push(curContact)
  }
  message = await room?.say(params.messagePayload, ...atUserList)
  await formatSentMessage(bot.currentUser, params.messagePayload, undefined, room)
  return message
}

function getCurTime () {
  // timestamp是整数，否则要parseInt转换
  const timestamp = new Date().getTime()
  const timezone = 8 // 目标时区时间，东八区
  const offsetGMT = new Date().getTimezoneOffset() // 本地时间和格林威治的时间差，单位为分钟
  const time = timestamp + offsetGMT * 60 * 1000 + timezone * 60 * 60 * 1000
  return time
}

async function wechaty2mqtt (message: Message) {
  const curTime = getCurTime()
  const timeHms = moment(curTime).format('YYYY-MM-DD HH:mm:ss')

  let msg: any = {
    reqId: v4(),
    method: 'thing.event.post',
    version: '1.0',
    timestamp: curTime,
    events: {
    },
  }

  const talker = message.talker()

  let text = ''
  let messageType = ''
  let textBox: any = {}
  let file: any
  const msgId = message.id

  switch (message.type()) {
    // 文本消息
    case types.Message.Text:
      messageType = 'Text'
      text = message.text()
      break

    // 图片消息
    case types.Message.Image:
      messageType = 'Image'
      file = await message.toImage().artwork()
      break

    // 链接卡片消息
    case types.Message.Url:
      messageType = 'Url'
      textBox = await message.toUrlLink()
      text = JSON.stringify(JSON.parse(JSON.stringify(textBox)).payload)
      break

    // 小程序卡片消息
    case types.Message.MiniProgram:
      messageType = 'MiniProgram'
      textBox = await message.toMiniProgram()
      text = JSON.stringify(JSON.parse(JSON.stringify(textBox)).payload)
      /*
            miniProgram: 小程序卡片数据
            {
              appid: "wx363a...",
              description: "贝壳找房 - 真房源",
              title: "美国白宫，10室8厅9卫，99999刀/月",
              iconUrl: "http://mmbiz.qpic.cn/mmbiz_png/.../640?wx_fmt=png&wxfrom=200",
              pagePath: "pages/home/home.html...",
              shareId: "0_wx363afd5a1384b770_..._1615104758_0",
              thumbKey: "84db921169862291...",
              thumbUrl: "3051020100044a304802010002046296f57502033d14...",
              username: "gh_8a51...@app"
            }
           */
      break

    // 语音消息
    case types.Message.Audio:
      messageType = 'Audio'
      file = await message.toFileBox()
      break

    // 视频消息
    case types.Message.Video:
      messageType = 'Video'
      file = await message.toFileBox()
      break

    // 动图表情消息
    case types.Message.Emoticon:
      messageType = 'Emoticon'
      file = await message.toFileBox()
      break

    // 文件消息
    case types.Message.Attachment:
      messageType = 'Attachment'
      file = await message.toFileBox()
      break

    case types.Message.Contact:
      messageType = 'Contact'
      try {
        textBox = await message.toContact()
      } catch (err) {

      }
      text = '联系人卡片消息'
      break

    // 其他消息
    default:
      messageType = 'Unknown'
      text = '未知的消息类型'
      break
  }

  if (file) {
    text = file.name
  }

  // console.debug('textBox:', textBox)

  const room = message.room()
  const roomInfo: any = {}
  if (room && room.id) {
    roomInfo.id = room.id
    try {
      const roomAvatar = await room.avatar()
      // console.debug('群头像room.avatar()============')
      // console.debug(typeof roomAvatar)
      // console.debug(roomAvatar)
      // console.debug('END============')

      roomInfo.avatar = JSON.parse(JSON.stringify(roomAvatar)).url
    } catch (err) {
      //   console.debug('群头像捕获了错误============')
      // console.debug(typeof err)
      // console.debug(err)
      // console.debug('END============')
    }
    roomInfo.ownerId = room.owner()?.id || ''

    try {
      roomInfo.topic = await room.topic()
    } catch (err) {
      roomInfo.topic = room.id
    }
  }

  let memberAlias: any = ''
  try {
    memberAlias = await room?.alias(talker)
  } catch (err) {

  }

  let avatar: any = ''
  try {

    avatar = await talker.avatar()
    // console.debug('好友头像talker.avatar()============')
    // console.debug(avatar)
    // console.debug('END============')
    avatar = JSON.parse(JSON.stringify(avatar)).url

  } catch (err) {
    // console.debug('好友头像捕获了错误============')
    // console.debug(err)
    // console.debug('END============')
  }

  const content: any = {}
  content.messageType = messageType
  content.text = text
  content.raw = textBox.payload || textBox._payload || {}

  const _payload = {
    id: msgId,
    talker: {
      id: talker.id,
      gender: talker.gender() || '',
      name: talker.name() || '',
      alias: await talker.alias() || '',
      memberAlias,
      avatar,
    },
    room: roomInfo,
    content,
    timestamp: curTime,
    timeHms,
  }

  msg.events.message = _payload
  msg = JSON.stringify(msg)

  return msg

}

function propertyMessage (name: string, info: any) {
  let message: any = {
    reqId: v4(),
    method: 'thing.property.post',
    version: '1.0',
    timestamp: new Date().getTime(),
    properties: {
    },
  }
  message.properties[name] = info
  message = JSON.stringify(message)
  return message
}

function eventMessage (name: string, info: any) {
  let message: any = {
    reqId: v4(),
    method: 'thing.event.post',
    version: '1.0',
    timestamp: new Date().getTime(),
    events: {
    },
  }
  message.events[name] = info
  message = JSON.stringify(message)
  return message
}

const handleCommand = async (bot: Wechaty, mqttProxy: MqttProxy, commandInfo: CommandInfo) => {
  log.info('handleCommand commandInfo:', JSON.stringify(commandInfo))

  const { name, params } = commandInfo

  // 全局方法
  if (name === 'send') { // 发送消息
    // const res = await send(params, bot)
    // return await formatMessageToMQTT(res as Message)

    send(params, bot)
      .then(async res => {
        log.info('send res:', res)
        return await formatMessageToMQTT(res as Message)
      }).catch(err => {
        log.error('send err:', err)
      })
  }
  if (name === 'sendAt') { // 发送@消息
    // const res = await sendAt(params, bot)
    // return await formatMessageToMQTT(res as Message)
    sendAt(params, bot)
      .then(async res => {
        log.info('sendAt res:', res)
        mqttProxy.pubEvent(eventMessage('onMessage', await formatMessageToMQTT(res as Message)))
        return res

      }).catch(err => {
        log.error('sendAt err:', err)
      })
  }

  // wechaty方法
  if (name.startsWith('wechaty')) {
    await handleWechaty(bot, mqttProxy, commandInfo)
  }
  // message方法
  if (name.startsWith('message')) {
    handleMessage(bot, mqttProxy, commandInfo).catch((err) => {
      log.error('handleMessage err:', err)
    })
  }
  // room方法
  if (name.startsWith('room')) {
    await handleRoom(bot, mqttProxy, commandInfo).catch((err) => {
      log.error('handleRoom err:', err)
    })
  }
  // contact方法
  if (name.startsWith('contact')) {
    handleContact(bot, mqttProxy, commandInfo).catch((err) => {
      log.error('handleContact err:', err)
    })
  }
  // friendship方法
  if (name.startsWith('friendship')) {
    handleCommandFriendship(bot, mqttProxy, commandInfo).catch((err) => {
      log.error('handleCommandFriendship err:', err)
    })
  }

  return null
}

class MqttProxy {

  // eslint-disable-next-line no-use-before-define
  private static instance: MqttProxy | undefined
  private static chatbot: Wechaty
  bot!: Wechaty
  private mqttClient: MqttClient
  private messageQueue: Array<{ topic: string; message: string }> = []
  private isConnected: boolean = false
  propertyApi: string
  eventApi: string
  commandApi: string
  responseApi: string
  isOk: boolean
  private static key: string

  static getClientId (clientString: string) {
    // clientid加密
    const clientId = CryptoJS.SHA256(clientString).toString()
    return clientId
  }

  private constructor (config: IClientOptions) {
    this.propertyApi = `thing/chatbot/${config.clientId}/property/post`
    this.eventApi = `thing/chatbot/${config.clientId}/event/post`
    this.commandApi = `thing/chatbot/${config.clientId}/command/invoke`
    this.responseApi = `thing/chatbot/${config.clientId}/response/d2c`
    this.isOk = false

    // 重写clientID为随机id，防止重复
    config.clientId = v4()
    this.mqttClient = mqtt.connect(config)

    this.mqttClient.on('connect', () => {
      log.info('MQTT连接成功...')
      this.isConnected = true
      // 发送所有排队的消息
      this.messageQueue.forEach(({ topic, message }) => {
        try {
          this.mqttClient.publish(topic, message)
        } catch (error) {
          console.error(`Failed to publish message: ${error}`)
        }
      })
      // 清空消息队列
      this.messageQueue = []
    })

    this.mqttClient.on('error', (error) => {
      console.error('MQTT error:', error)
      this.isConnected = false
    })

    this.mqttClient.on('close', () => {
      log.info('MQTT connection closed')
      this.isConnected = false
    })

    this.mqttClient.on('disconnect', (e: any) => {
      log.info('disconnect--------', e)
      this.isConnected = false
    })

    this.mqttClient.on('message', (topic: string, message: Buffer) => {
      MqttProxy.onMessage.bind(this)(topic, message).catch((error) => {
        console.error('Error handling message:', error)
      })
    })
    this.subCommand()
    this.isOk = true
  }

  setWechaty (bot: Wechaty) {
    // log.info('bot info:', bot.currentUser.id)
    MqttProxy.chatbot = bot
    this.bot = bot
  }

  setKey (key: string) {
    log.info('setKey...', key)
    MqttProxy.key = key
  }

  getKey (key: string) {
    return getKeyByBasicString(key)
  }

  public static getInstance (config?: IClientOptions): MqttProxy | undefined {
    if (!MqttProxy.instance && config) {
      MqttProxy.instance = new MqttProxy(config)
    }
    return MqttProxy.instance
  }

  // 加密
  public static encrypt (message: string) {
    message = MqttProxy.key ? encrypt(message, MqttProxy.key) : message
    return message
  }

  // 解密
  public static decrypt (message: string) {
    message = MqttProxy.key ? decrypt(message, MqttProxy.key) : message
    return message
  }

  public publish (topic: string, message: string) {
    // 加密
    message = MqttProxy.encrypt(message)

    try {
      if (this.isConnected) {
        this.mqttClient.publish(topic, message, (error) => {
          if (error) {
            console.error(`Failed to publish message: ${error}`)
          } else {
            log.info('MQTT消息发布topic:' + topic)
            log.info('MQTT消息发布message:' + message)
          }
        })
      } else {
        log.info('MQTT client not connected. Queueing message.')
        this.messageQueue.push({ topic, message })
      }
    } catch (err) {
      log.error('publish err:', err)
    }
  }

  subCommand () {
    this.mqttClient.subscribe(this.commandApi, function (err: any) {
      if (err) {
        log.info(err)
      }
    })
  }

  pubProperty (msg: string) {
    // 加密
    msg = MqttProxy.encrypt(msg)

    try {
      this.mqttClient.publish(this.propertyApi, msg)
      log.info('MQTT消息发布topic:' + this.eventApi)
      log.info('MQTT消息发布message:' + msg)
    } catch (err) {
      console.error('pubProperty err:', err)
    }
  }

  pubEvent (msg: string) {
    // 加密
    msg = MqttProxy.encrypt(msg)

    try {
      this.mqttClient.publish(this.eventApi, msg)
      log.info('MQTT消息发布topic:' + this.eventApi)
      log.info('MQTT消息发布message:' + msg)
    } catch (err) {
      console.error('pubEvent err:', err)
    }

  }

  async pubMessage (msg: any) {
    try {
      let payload = await wechaty2mqtt(msg)
      // 加密
      payload = MqttProxy.encrypt(payload)

      this.mqttClient.publish(this.eventApi, payload)
      log.info('MQTT消息发布topic:' + this.eventApi)
      // log.info('MQTT消息发布message:' + payload)
    } catch (err) {
      console.error(err)
    }

  }

  getBot () {
    return this.bot
  }

  private static onMessage = async (topic: string, message: any) => {
    log.info('MQTT接收到消息topic:' + topic)
    log.info('MQTT接收到消息payload:' + message.toString())
    log.info('MqttProxy.chatbot', MqttProxy.chatbot)

    try {
      // 解密
      message = MqttProxy.decrypt(message.toString())
      log.info('解密后消息payload:' + message)

      const commandInfo = JSON.parse(message)
      const name: commandName | undefined = commandInfo.name
      const params: any = commandInfo.params

      if (MqttProxy.instance && name && params) {
        try {
          const res = await handleCommand(this.chatbot, MqttProxy.instance, commandInfo)
          log.info('handleCommand res:', res)
        } catch (err) {
          log.error('handleCommand err:', err)
        }
      }
      return null
    } catch (err) {
      log.error('MQTT接收到消息错误：' + err)
      return null
    }
  }

}

export { wechaty2mqtt, propertyMessage, eventMessage }

export { MqttProxy, getKeyByBasicString }
export type { IClientOptions }
export default MqttProxy

/* eslint-disable sort-keys */
import { Wechaty, log, Contact, Room, Message } from 'wechaty'
import type MqttProxy from '../mqtt-proxy'
import { CommandInfo, getResponseTemplate, ResponseInfo } from '../utils.js'
import { v4 } from 'uuid'
import moment from 'moment'

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
async function createRoom (params: any, bot: Wechaty) {
  const contactList: Contact[] = []
  for (const i in params.contactList) {
    const c = await bot.Contact.find({ name: params.contactList[i] })
    if (c) {
      contactList.push(c)
    }
  }

  const room = await bot.Room.create(contactList, params.topic)
  // log.info('Bot', 'createDingRoom() new ding room created: %s', room)
  // await room.topic(params.topic)

  await room.say('你的专属群创建完成')
  await formatSentMessage(bot.currentUser, '你的专属群创建完成', undefined, room)
}

async function getQrcod (params: any, bot: Wechaty, mqttProxy: MqttProxy) {
  const roomId = params.roomId
  const room = await bot.Room.find({ id: roomId })
  const qr = await room?.qrCode()
  const msg = eventMessage('qrcode', qr)
  mqttProxy.pubEvent(msg)
}

export const handleRoom = async (bot:Wechaty, mqttProxy:MqttProxy, commandInfo:CommandInfo) => {
  log.info('handleRoom', bot, mqttProxy, commandInfo)
  const { reqId, name, params } = commandInfo
  log.info('handleRoom', reqId, name, params)
  const payload: ResponseInfo = getResponseTemplate()
  payload.name = name
  payload.reqId = reqId
  const responseTopic = mqttProxy.responseApi + `/${reqId}`
  switch (name) {
    case 'roomCreate': { // 创建群
      // const res = createRoom(params, bot)
      // return res
      createRoom(params, bot)
        .then(res => {
          log.info('roomCreate res:', res)
          return res
        }).catch(err => {
          log.error('roomCreate err:', err)
        })
      break
    }
    case 'roomAdd': { // 添加群成员
      log.info('cmd name:' + name)
      break
    }
    case 'roomDel': { // 删除群成员
      log.info('cmd name:' + name)
      break
    }
    case 'roomAnnounceGet': { // 获取群公告
      log.info('cmd name:' + name)
      break
    }
    case 'roomAnnounceSet': { // 设置群公告
      log.info('cmd name:' + name)
      break
    }
    case 'roomQuit': { // 退出群
      log.info('cmd name:' + name)
      break
    }
    case 'roomTopicGet': { // 获取群名称
      log.info('cmd name:' + name)
      break
    }
    case 'roomTopicSet': { // 设置群名称
      log.info('cmd name:' + name)
      break
    }
    case 'roomQrcodeGet': { // 获取群二维码
      //  const res = await getQrcod(params, bot, mqttProxy)
      //  return res
      getQrcod(params, bot, mqttProxy).then(res => {
        log.info('roomQrcodeGet res:', res)
        return res

      }).catch(err => {
        log.error('roomQrcodeGet err:', err)
      })
      break
    }
    case 'roomMemberAllGet': { // 获取群成员列表
      if (!params.id && !params.topic) {
        payload.params = []
        payload.message = '群id不能为空'
        await mqttProxy.publish(responseTopic, JSON.stringify(payload))
        return
      }
      if (params.id) {
        try {
          const roomid = params.id
          const room = await bot.Room.find({ id: roomid })
          const members = await room?.memberAll()
          if (members) {
            const len = members.length
            const bacthNum = params.size || 100
            const count = Math.ceil(len / bacthNum)
            for (let i = 0; i < count; i++) {
              const start = i * bacthNum
              const end = (i + 1) * bacthNum
              const arr = members.slice(start, end)
              payload.params = {
                page: i + 1,
                size: bacthNum,
                total: len,
                items: arr,
              }
              log.info('page:', i + 1, 'size:', bacthNum, 'count:', len, 'items:', arr)
              await mqttProxy.publish(responseTopic, JSON.stringify(payload))
              // 延时0.3s
              await new Promise((resolve) => setTimeout(resolve, 300))
            }
          } else {
            payload.params = []
            await mqttProxy.publish(responseTopic, JSON.stringify(payload))
          }

        } catch (err) {
          log.error('memberAllGet err:', err)
          payload.params = []
          payload.message = '获取群成员列表失败'
          await mqttProxy.publish(responseTopic, JSON.stringify(payload))
        }
      } else {
        try {
          const topic = params.topic
          const room = await bot.Room.find({ topic })
          const members = await room?.memberAll()
          if (members) {
            const len = members.length
            const bacthNum = params.size || 100
            const count = Math.ceil(len / bacthNum)
            for (let i = 0; i < count; i++) {
              const start = i * bacthNum
              const end = (i + 1) * bacthNum
              const arr = members.slice(start, end)
              payload.params = {
                page: i + 1,
                size: bacthNum,
                total: len,
                items: arr,
              }
              log.info('page:', i + 1, 'size:', bacthNum, 'count:', len, 'items:', arr)
              await mqttProxy.publish(responseTopic, JSON.stringify(payload))
              // 延时0.3s
              await new Promise((resolve) => setTimeout(resolve, 300))
            }
          } else {
            payload.params = []
            await mqttProxy.publish(responseTopic, JSON.stringify(payload))
          }
        } catch (err) {
          log.error('memberAllGet err:', err)
          payload.params = []
          payload.message = '获取群成员列表失败'
          await mqttProxy.publish(responseTopic, JSON.stringify(payload))
        }
      }

      break
    }
    case 'roomFindAll': { // 获取群列表
      // const res = await getAllRoom(mqttProxy, bot)
      // return res
      try {
        const roomList = await bot.Room.findAll()
        payload.params = roomList
        await mqttProxy.publish(responseTopic, JSON.stringify(payload))
      } catch (err) {
        log.error('roomFindAll err:', err)
        payload.params = []
        payload.message = '获取群列表失败'
        await mqttProxy.publish(responseTopic, JSON.stringify(payload))
      }
      break
    }
    case 'roomFind': { // 获取群信息
      if (!params.id && !params.topic) {
        payload.params = {}
        payload.message = '群id和topic不能同时为空'
        await mqttProxy.publish(responseTopic, JSON.stringify(payload))

      } else if (params.id) {
        try {
          const room = await bot.Room.find({ id: params.id })
          payload.params = room
          await mqttProxy.publish(responseTopic, JSON.stringify(payload))
        } catch (err) {
          log.error('roomFind err:', err)
          payload.params = {}
          payload.message = '获取群信息失败'
          await mqttProxy.publish(responseTopic, JSON.stringify(payload))
        }
      } else {
        try {
          const room = await bot.Room.find({ topic: params.topic })
          payload.params = room
          await mqttProxy.publish(responseTopic, JSON.stringify(payload))
        } catch (err) {
          log.error('roomFind err:', err)
          payload.params = {}
          payload.message = '获取群信息失败'
          await mqttProxy.publish(responseTopic, JSON.stringify(payload))
        }
      }
      break
    }
    case 'roomSay':{
      if (params.rooms && params.rooms.length > 0 && params.messageType && params.messagePayload) {
        for (let i = 0; i < params.rooms.length; i++) {
          const roomid = params.rooms[i]
          try {
            const room = await bot.Room.find({ id: roomid })
            if (room) {
              const message: Message | void = await room.say(params.messagePayload)
              payload.params = message || { id:roomid }
              await mqttProxy.publish(responseTopic, JSON.stringify(payload))
              // 延迟0.5s
              await new Promise((resolve) => setTimeout(resolve, 500))
            }
          } catch (err) {
            log.error('获取联系人失败：', err)
          }
        }
      } else {
        payload.params = {}
        payload.message = '参数错误'
        await mqttProxy.publish(responseTopic, JSON.stringify(payload))
      }
      break
    }
    case 'roomSayAt':{
      if (params.room && params.contacts && params.contacts.length > 0 && params.messageType && params.messagePayload) {
        try {
          const room = await bot.Room.find({ id: params.room })
          if (room) {
            const atUserList = []
            const atUserIdList = params.contacts
            for (const userId of atUserIdList) {
              log.info('userId:', userId)
              const curContact = await bot.Contact.find({ id: userId })
              atUserList.push(curContact)
            }
            log.info('atUserList:', atUserList)
            try {
              payload.params = await room.say(params.messagePayload, ...atUserList)
              await mqttProxy.publish(responseTopic, JSON.stringify(payload))
            } catch (err) {
              log.error('roomSayAt err:', err)
              payload.params = {}
              payload.message = '发送失败'
              await mqttProxy.publish(responseTopic, JSON.stringify(payload))
            }
          }
        } catch (err) {
          log.error('获取群信息失败：', err)
          payload.params = {}
          payload.message = '获取群信息失败'
          await mqttProxy.publish(responseTopic, JSON.stringify(payload))
        }

      }
      break
    }
    case 'roomTopicgGet':
    case 'roomAliasGet':
    case 'roomHas':
    case 'roomMemberGet':
    case 'roomInvitationAccept':
    case 'roomInvitationFindAll':
    case 'roomInvitationInviter':
      log.info('cmd name:' + name)
      break
    default:
      log.error('Unknown command:', name)
  }
}

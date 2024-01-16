/* eslint-disable sort-keys */
import { Wechaty, log, Contact, Room } from 'wechaty'
import type MqttProxy from '../mqtt-proxy'
import { CommandInfo, getResponseTemplate, ResponseInfo } from '../utils.js'
import { v4 } from 'uuid'
import moment from 'moment'

function propertyMessage(name: string, info: any) {
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

async function getAllRoom (mqttProxy: MqttProxy, bot: Wechaty) {
  const roomList = await bot.Room.findAll()
  for (const i in roomList) {
    const room = roomList[i]
    const roomInfo: any = {}
    roomInfo.id = room?.id

    const avatar = await room?.avatar()
    roomInfo.avatar = JSON.parse(JSON.stringify(avatar)).url

    roomInfo.ownerId = room?.owner()?.id
    try {
      roomInfo.topic = await room?.topic()
    } catch (err) {
      roomInfo.topic = room?.id
    }
    roomList[i] = roomInfo
  }
  const msg = propertyMessage('roomList', roomList)
  mqttProxy.pubProperty(msg)
}
async function getAvatarUrl (params: Contact | Room) {
  try {
    return JSON.parse(JSON.stringify(await params.avatar()))['url']
  } catch (e) {
    return ''
  }
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
      log.info('cmd name:' + name)
      const resData = {
        reqId,
        method: 'thing.command.invoke',
        version: '1.0',
        timestamp: 1610430718000,
        code: 200,
        description: '获取机器人信息失败',
        params: {
          data: {} as any,
          messsage: null as any,
        },
      }
      try {
        const roomid = params.roomid
        const room = await bot.Room.find({ id: roomid })
        const members = await room?.memberAll()
        if (members) {
          const newMembers = await Promise.all(
            members.map(async (member: Contact) => ({
              avatar: await getAvatarUrl(member) || 'https://im.gzydong.club/public/media/image/avatar/20230516/c5039ad4f29de2fd2c7f5a1789e155f5_200x200.png', // 设置群组头像
              id: member.id,
              user_id: member.id,
              nickname: member.name(),
              gender: member.gender(),
              motto: '',
              leader: room?.owner()?.id === member.id ? 2 : 0,
              is_mute: 0,
              user_card: '',
            })),
          )
          log.info('memberAllGet res:', JSON.stringify(newMembers))
          resData.reqId = reqId
          resData.params.data = newMembers
          resData.description = '获取群成员列表成功'
          if (mqttProxy.responseApi) {
            mqttProxy.publish(mqttProxy.responseApi + `/${reqId}`, JSON.stringify(resData))
            log.info('发送MQTT消息:', resData.reqId, resData.description)
          }
        } else {
          resData.reqId = reqId
          resData.params.data = []
          resData.description = '获取群成员列表成功'
          if (mqttProxy.responseApi) {
            mqttProxy.publish(mqttProxy.responseApi + `/${reqId}`, JSON.stringify(resData))
            log.info('发送MQTT消息:', resData.reqId, resData.description)
          }
        }

      } catch (err) {
        log.error('memberAllGet err:', err)
        resData.reqId = reqId
        resData.params.messsage = err
        resData.description = '获取群成员列表失败'
        if (mqttProxy.responseApi) {
          mqttProxy.publish(mqttProxy.responseApi + `/${reqId}`, JSON.stringify(resData))
          log.info('发送MQTT消息:', resData.reqId, resData.description)
        }
      }
      break
    }
    case 'roomFindAll': { // 获取群列表
      // const res = await getAllRoom(mqttProxy, bot)
      // return res
      try{
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
      if(!params.id&&!params.topic){

      }else if(params.id){ 
        try{
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
        try{
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
    case 'roomSay':
    case 'roomSayAt':
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

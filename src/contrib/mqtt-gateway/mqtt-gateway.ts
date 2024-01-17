/* eslint-disable sort-keys */
/**
 * Author: LU CHAO https://github.com/atorber
 */
import {
  Wechaty,
  WechatyPlugin,
  log,
  Message,
} from 'wechaty'
import { v4 } from 'uuid'
import {
  PUPPET_EVENT_DICT,
} from 'wechaty-puppet/types'

import { MqttProxy, IClientOptions, getKeyByBasicString } from './mqtt-proxy.js'

type EventType = keyof typeof PUPPET_EVENT_DICT

type MqttType = {
    clientId: string, // 客户端id，不配置则随机生成clientId
    username: string,
    password: string,
    host: string,
    port: number,
}

type EventInfo = {
    reqId: string,
    method: string,
    version: string,
    timestamp: number,
    name: string,
    params: any,
}

// 获取mqtt配置，实现时替换为从服务端获取的配置
const getMqttConfig = (token: string) => {
  return {
    clientId: '11235813',
    host: 'mqtt://' + token + '.iot.gz.baidubce.com',
    password: token,
    port: 1883,
    username: token,
  }
}

const getEventPayload = (event:{
    eventName:string
    payload: any
  }) => {
  const eventInfo:EventInfo = {
    reqId:v4(),
    method:'event',
    version:'1.0',
    timestamp:new Date().getTime(),
    name:event.eventName,
    params:event.payload,
  }

  // log.info('WechatyPluginContrib', JSON.stringify(eventInfo, null, 2))
  return eventInfo
}

export type MqttGatewayConfig = {
    events: EventType[],
    mqtt?: MqttType,
    token?: string,
    options?: {
      eventTopic?: string, // 事件上报topic，不配置则使用默认topic
      serviceRequestTopic?: string, // 服务端请求topic，不配置则使用默认topic
      serviceResponseTopic?: string, // 服务端响应topic，不配置则使用默认topic
      secrectKey?: string, // 服务端请求密钥，不配置则不校验密钥
      simple?: boolean, // 是否使用简单模式，简单模式下消息不做处理，直接转发message事件
    }
}

export function MqttGateway (
  config: MqttGatewayConfig,
): WechatyPlugin {
  log.info('WechatyPluginContrib', 'MqttGateway("%s")', JSON.stringify(config))
  if (!config.mqtt && !config.token) {
    throw new Error('config.mqtt or config.token must be set at least one')
  }
  if (!config.options) {
    config.options = {}
  }
  if (config.token) {
    config.mqtt = getMqttConfig(config.token)
    log.info('config.mqtt', JSON.stringify(config.mqtt))
  }

  return function MqttGatewayPlugin (wechaty: Wechaty) {
    log.verbose('WechatyPluginContrib', 'MqttGateway installing on %s ...', wechaty)
    let mqttProxy:MqttProxy|undefined
    try {
      mqttProxy = MqttProxy.getInstance(config.mqtt)
      if (mqttProxy) {
        mqttProxy.setWechaty(wechaty)
        mqttProxy.setKey(config.options?.secrectKey || '')
      }
    } catch (e) {
      log.error('MQTT代理启动失败，检查mqtt配置信息是否正确...', e)
      throw new Error('MQTT代理启动失败，检查mqtt配置信息是否正确...')
    }

    for (const key of Object.keys(PUPPET_EVENT_DICT)) {
      const eventName = key as EventType
      if (config.events.length > 0 && !config.events.includes(eventName)) {
        continue
      }

      wechaty.on(eventName as any, (...args: any[]) => {
        log.info('WechatyPluginContrib', 'MqttGatewayPlugin() %s: %s', eventName, JSON.stringify(args))
        let payload:any = args
        if (eventName === 'error') {
          const error = args[0]
          log.error(error)
        }

        if (eventName === 'message') {
          if (config.options?.simple) {
            const contact = args[0]
            payload = contact

          } else {
            const message:Message = args[0]
            const talker = message.talker()
            const listener = message.listener()
            const room = message.room()
            const roomJson = room ? JSON.parse(JSON.stringify(room)) : undefined
            const text = message.text()
            const type = message.type()
            const id = message.id
            if (roomJson) {
              roomJson.payload.memberIdList = roomJson.payload.memberIdList.length
            }
            payload = {
              id,
              listener,
              talker,
              room: roomJson,
              text,
              type,
            }
          }
        }

        if (eventName === 'scan') {
          const qrcode = args[0]
          const status = args[1]
          payload = {
            qrcode,
            status,
          }
        }

        if (eventName === 'login') {
          const contact = args[0]
          payload = contact
        }

        if (eventName === 'friendship') {
          const friendship = args[0]
          const type = args[1]
          payload = {
            friendship,
            type,
          }
        }

        if (eventName === 'room-invite') {
          const roomInvitation = args[0]
          payload = roomInvitation
        }

        if (eventName === 'room-join') {
          const room = args[0]
          const inviteeList = args[1]
          const inviter = args[2]
          payload = {
            inviteeList,
            inviter,
            room,
          }
        }

        if (eventName === 'room-leave') {
          const room = args[0]
          const leaverList = args[1]
          payload = {
            leaverList,
            room,
          }
        }

        const eventPaylod = getEventPayload({
          eventName,
          payload,
        })
        // log.info('WechatyPluginContrib', 'MqttGatewayPlugin() eventPaylod: %s', JSON.stringify(eventPaylod))
        mqttProxy?.pubEvent(JSON.stringify(eventPaylod))
      })
    }
  }
}

export type {
  IClientOptions,
}
export {
  getKeyByBasicString,
}

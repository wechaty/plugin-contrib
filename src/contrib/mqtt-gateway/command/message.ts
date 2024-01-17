import { Wechaty, log, Message } from 'wechaty'
import type MqttProxy from '../mqtt-proxy'
import { CommandInfo, getResponseTemplate, ResponseInfo } from '../utils.js'

export const handleMessage = async (bot:Wechaty, mqttProxy:MqttProxy, commandInfo:CommandInfo) => {
  log.info('handleMessage', bot, mqttProxy, commandInfo)
  const { reqId, name, params } = commandInfo
  log.info('handleMessage', reqId, name, params)
  const payload: ResponseInfo = getResponseTemplate()
  payload.name = name
  payload.reqId = reqId
  const responseTopic = mqttProxy.responseApi + `/${reqId}`
  switch (name) {
    case 'messageFind':
    case 'messageFindAll':
    case 'messageSay':{
      if (params.id && params.messageType && params.messagePayload) {
        const id = params.id
        const messageSay = await bot.Message.find({ id })
        if (messageSay) {
          try {
            const message: Message | void = await messageSay.say(params.messagePayload)
            payload.params = message || { id }
            await mqttProxy.publish(responseTopic, JSON.stringify(payload))

          } catch (err) {
            payload.params = {}
            payload.message = '发送失败'
            await mqttProxy.publish(responseTopic, JSON.stringify(payload))
          }
        } else {
          payload.params = {}
          payload.message = '消息不存在'
          await mqttProxy.publish(responseTopic, JSON.stringify(payload))
        }

      } else {
        payload.params = {}
        payload.message = '参数错误'
        await mqttProxy.publish(responseTopic, JSON.stringify(payload))
      }
      break
    }

    case 'messageToRecalled':
      log.info('cmd name:' + name)
      break
    default:
      log.error('Unknown command:', name)
  }
}

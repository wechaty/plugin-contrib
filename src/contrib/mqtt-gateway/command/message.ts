import { Wechaty, log } from 'wechaty'
import type MqttProxy from '../mqtt-proxy'
import type { CommandInfo } from '../utils.js'

export const handleMessage = (bot:Wechaty, mqttProxy:MqttProxy, commandInfo:CommandInfo) => {
  log.info('handleMessage', bot, mqttProxy, commandInfo)
  const { reqId, name, params } = commandInfo
  log.info('handleMessage', reqId, name, params)
  switch (name) {
    case 'messageFind':
    case 'messageFindAll':
    case 'messageSay':
    case 'messageToRecalled':
      log.info('cmd name:' + name)
      break
    default:
      log.error('Unknown command:', name)
  }
}

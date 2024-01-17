import { Wechaty, log } from 'wechaty'
import type MqttProxy from '../mqtt-proxy'
import type { CommandInfo } from '../utils.js'

export const handleCommandFriendship = async (bot:Wechaty, mqttProxy:MqttProxy, commandInfo:CommandInfo) => {
  log.info('handleCommandFriendship', bot, mqttProxy, commandInfo)
  const { reqId, name, params } = commandInfo
  log.info('handleCommandFriendship', reqId, name, params)
  switch (name) {
    case 'friendshipAccept':
    case 'friendshipSearch':
    case 'friendshipAdd':
      log.info('cmd name:' + name)
      break
    default:
      log.error('Unknown command:', name)
  }
}

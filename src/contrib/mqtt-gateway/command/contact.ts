/* eslint-disable sort-keys */
import { Wechaty, log, Contact } from 'wechaty'
import type MqttProxy from '../mqtt-proxy'
import type { CommandInfo } from '../utils.js'
import { v4 } from 'uuid'

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

async function getAllContact (mqttProxy: MqttProxy, bot: Wechaty) {
  const contactList: Contact[] = await bot.Contact.findAll()
  let friends = []
  for (const i in contactList) {
    const contact = contactList[i]
    let avatar = ''
    try {
      avatar = JSON.parse(JSON.stringify(await contact?.avatar())).url
    } catch (err) {

    }
    const contactInfo = {
      alias: await contact?.alias() || '',
      avatar,
      gender: contact?.gender() || '',
      id: contact?.id,
      name: contact?.name() || '',
    }
    friends.push(contactInfo)

    if (friends.length === 100) {
      const msg = propertyMessage('contactList', friends)
      mqttProxy.pubProperty(msg)
      friends = []
    }
  }
  const msg = propertyMessage('contactList', friends)
  mqttProxy.pubProperty(msg)
}
export const handleContact = (bot:Wechaty, mqttProxy:MqttProxy, commandInfo:CommandInfo) => {
  log.info('handleContact', bot, mqttProxy, commandInfo)
  const { reqId, name, params } = commandInfo
  log.info('handleContact', reqId, name, params)
  switch (name) {
    case 'contactAliasGet': { // 获取好友备注
      log.info('cmd name:' + name)
      break
    }
    case 'contactAliasSet': { // 设置好友备注
      log.info('cmd name:' + name)
      break
    }
    case  'contactAdd': { // 添加好友
      log.info('cmd name:' + name)

      break
    }
    case 'contactFindAll': { // 获取好友列表
      // const res = await getAllContact(mqttProxy, bot)
      // return res
      getAllContact(mqttProxy, bot).then(res => {
        log.info('contactFindAll res:', res)
        return res

      }).catch(err => {
        log.error('contactFindAll err:', err)
      })
      break
    }
    case 'contactFind': { // 获取好友信息
      log.info('cmd name:' + name)
      break
    }
    case 'contactSay':
      log.info('cmd name:' + name)
      break
    default:
      log.error('Unknown command:', name)
  }
}

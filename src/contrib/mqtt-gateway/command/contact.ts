/* eslint-disable sort-keys */
import { Wechaty, log, Contact, Message } from 'wechaty'
import type MqttProxy from '../mqtt-proxy'
import { CommandInfo, getResponseTemplate, ResponseInfo } from '../utils.js'

async function getAllContact (bot: Wechaty) {
  const contactList: Contact[] = await bot.Contact.findAll()
  const friends = []
  for (const i in contactList) {
    const contact = contactList[i]
    // const avatar = ''
    // let alias = ''
    // try {
    //   avatar = JSON.parse(JSON.stringify(await contact?.avatar())).url
    // } catch (err) {
    //   log.error('获取头像失败：', err)
    // }
    // try {
    //   alias = await contact?.alias() || ''
    // } catch (err) {
    //   log.error('获取备注失败：', err)
    // }
    // const contactInfo = {
    //   alias,
    //   avatar,
    //   gender: contact?.gender() || '',
    //   id: contact?.id,
    //   name: contact?.name() || '',
    //   type: contact?.type(),
    // }
    // if (contact.friend()) {
    //   friends.push(contactInfo)
    // }
    if (contact?.friend()) {
      friends.push(contact)
    }
  }
  log.info('friends count:', friends.length)
  return friends
}
export const handleContact = async (bot: Wechaty, mqttProxy: MqttProxy, commandInfo: CommandInfo) => {
  log.info('handleContact', bot, mqttProxy, commandInfo)
  const { reqId, name, params } = commandInfo
  log.info('handleContact', reqId, name, params)
  const payload: ResponseInfo = getResponseTemplate()
  payload.name = name
  payload.reqId = reqId
  const responseTopic = mqttProxy.responseApi + `/${reqId}`

  switch (name) {
    case 'contactAliasGet': { // 获取好友备注
      log.info('cmd name:' + name)
      break
    }
    case 'contactAliasSet': { // 设置好友备注
      log.info('cmd name:' + name)
      break
    }
    case 'contactAdd': { // 添加好友
      log.info('cmd name:' + name)

      break
    }
    case 'contactFindAll': { // 获取好友列表
      const friends = await getAllContact(bot)
      // 每50条发送一次
      const len = friends.length
      const bacthNum = params.size || 100
      const count = Math.ceil(len / bacthNum)
      for (let i = 0; i < count; i++) {
        const start = i * bacthNum
        const end = (i + 1) * bacthNum
        const arr = friends.slice(start, end)
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
      break
    }
    case 'contactFind': { // 获取好友信息
      if (!params.id && !params.name && !params.alias) {
        payload.code = 400
        payload.message = 'params error'
        payload.params = {}
        await mqttProxy.publish(responseTopic, JSON.stringify(payload))
      } else {
        const info = params.id ? { id: params.id } : params.name ? { name: params.name } : { alias: params.alias }
        const contact = await bot.Contact.find(info)
        payload.params = contact || {}
        await mqttProxy.publish(responseTopic, JSON.stringify(payload))
      }
      break
    }
    case 'contactSay': { // 发送消息
      if (params.contacts && params.contacts.length > 0 && params.messageType && params.messagePayload) {
        for (let i = 0; i < params.contacts.length; i++) {
          try {
            const contact = await bot.Contact.find({ id: params.contacts[i] })
            if (contact) {
              const message: Message | void = await contact.say(params.messagePayload)
              payload.params = message || {}
              await mqttProxy.publish(responseTopic, JSON.stringify(payload))
              // 延迟0.5s
              await new Promise((resolve) => setTimeout(resolve, 500))
            }
          } catch (err) {
            log.error('获取联系人失败：', err)
          }
        }
      }
      break
    }
    default:
      log.error('Unknown command:', name)
  }
}

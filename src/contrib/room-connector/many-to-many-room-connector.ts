/**
 * Author: Huan LI https://github.com/huan
 * Date: May 2020
 */
import {
  Wechaty,
  WechatyPlugin,
  Message,
  log,
  Room,
}                   from 'wechaty'

import {
  MessageMatcherList,
  messageMatcher,
}                   from '../../utils/'

import {
  getMappedMessage,
  sayMappedMessage,
  MapFunction,
}                     from './map'

export interface ManyToManyRoomConnectorConfig {
  /**
   * From & To Room IDs
   */
  many: string[],

  blacklist?: MessageMatcherList,
  whitelist?: MessageMatcherList,

  map?: MapFunction,
}

export const isMatchConfig = (config: ManyToManyRoomConnectorConfig) => {
  log.verbose('WechatyPluginContrib', 'ManyToManyRoomConnector() isMatchConfig(%s)',
    JSON.stringify(config),
  )

  return async function isMatch (message: Message) {
    log.verbose('WechatyPluginContrib', 'ManyToManyRoomConnector() isMatchConfig() isMatch(%s)',
      message.toString(),
    )

    if (message.self()) {
      return
    }
    const room = message.room()
    if (!room || !config.many.includes(room.id)) {
      return
    }

    if (config.whitelist) {
      if (await messageMatcher(
        config.whitelist,
        message,
      )) {
        return true
      }
    }

    if (config.blacklist) {
      if (await messageMatcher(
        config.blacklist,
        message,
      )) {
        return false
      }
    }

    return true
  }
}

export function ManyToManyRoomConnector (
  config: ManyToManyRoomConnectorConfig
): WechatyPlugin {
  log.verbose('WechatyPluginContrib', 'ManyToManyRoomConnector(%s)',
    JSON.stringify(config),
  )

  const isMatch = isMatchConfig(config)

  const matchAndForward = (message: Message, roomList: Room[]) => {
    isMatch(message).then(async match => {
      // eslint-disable-next-line promise/always-return
      if (match) {
        const msgList = await getMappedMessage(message, config.map)
        if (msgList) {
          const otherRoomList = roomList
            .filter(room => room.id !== message.room()?.id)
          await sayMappedMessage(msgList, otherRoomList)
        }
      }
    }).catch(e => log.error('WechatyPluginContrib', 'ManyToManyRoomConnector() filterThenToManyRoom(%s, %s) rejection: %s',
      message,
      roomList.join(','),
      e,
    ))
  }

  return function ManyToManyRoomConnectorPlugin (wechaty: Wechaty) {
    log.verbose('WechatyPluginContrib', 'ManyToManyRoomConnectorPlugin(%s) installing ...', wechaty)

    let manyRoomList : Room[]

    wechaty.once('message', async onceMsg => {
      log.verbose('WechatyPluginContrib', 'ManyToManyRoomConnectorPlugin(%s) once(message) installing ...', wechaty)

      if (!manyRoomList) {
        manyRoomList = config.many.map(id => wechaty.Room.load(id))// await loadRoom(wechaty, config.many)
      }

      matchAndForward(onceMsg, manyRoomList)
      wechaty.on('message', message => matchAndForward(message, manyRoomList))
    })
  }

}

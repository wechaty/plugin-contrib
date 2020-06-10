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
  MessageMapFunction,
}                       from './map'

// import {
//   loadRoom,
// }             from '../utils'

export interface OneToManyRoomConnectorConfig {
  /**
   * From Room ID
   */
  one: string,
  /**
   * To Room IDs
   */
  many: string[],

  blacklist?: MessageMatcherList,
  whitelist?: MessageMatcherList,

  map?: MessageMapFunction,
}

export const isMatchConfig = (config: OneToManyRoomConnectorConfig) => {
  log.verbose('WechatyPluginContrib', 'OneToManyRoomConnector() isMatchConfig(%s)',
    JSON.stringify(config),
  )

  return async function isMatch (message: Message) {
    log.verbose('WechatyPluginContrib', 'OneToManyRoomConnector() isMatchConfig() isMatch(%s)',
      message.toString(),
    )

    if (message.self()) {
      return
    }
    const room = message.room()
    if (!room || room.id !== config.one) {
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

export function OneToManyRoomConnector (
  config: OneToManyRoomConnectorConfig
): WechatyPlugin {
  log.verbose('WechatyPluginContrib', 'OneToManyRoomConnector(%s)',
    JSON.stringify(config),
  )

  const isMatch = isMatchConfig(config)

  const matchAndForward = (message: Message, roomList: Room[]) => {
    isMatch(message).then(async match => {
      // eslint-disable-next-line promise/always-return
      if (match) {
        const msgList = await getMappedMessage(message, config.map)
        if (msgList) {
          await sayMappedMessage(msgList, roomList)
        }
      }
    }).catch(e => log.error('WechatyPluginContrib', 'OneToManyRoomConnector() filterThenToManyRoom(%s, %s) rejection: %s',
      message,
      roomList.join(','),
      e,
    ))
  }

  return function OneToManyRoomConnectorPlugin (wechaty: Wechaty) {
    log.verbose('WechatyPluginContrib', 'OneToManyRoomConnectorPlugin(%s) installing ...', wechaty)

    let manyRoomList : Room[]

    wechaty.once('message', async onceMsg => {
      log.verbose('WechatyPluginContrib', 'OneToManyRoomConnectorPlugin(%s) once(message) installing ...', wechaty)

      if (!manyRoomList) {
        manyRoomList = config.many.map(id => wechaty.Room.load(id))  // await loadRoom(wechaty, config.many)
      }

      matchAndForward(onceMsg, manyRoomList)
      wechaty.on('message', message => matchAndForward(message, manyRoomList))
    })
  }

}

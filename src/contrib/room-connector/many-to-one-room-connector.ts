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
}                   from '../utils/matcher'

// import {
//   loadRoom,
// }             from '../utils'

export interface ManyToOneRoomConnectorConfig {
  /**
   * To Room ID
   */
  one: string,
  /**
   * From Room IDs
   */
  many: string[],

  blacklist?: MessageMatcherList,
  whitelist?: MessageMatcherList,

  map?: (message: Message) => any,
}

export const isMatchConfig = (config: ManyToOneRoomConnectorConfig) => {
  log.verbose('WechatyPluginContrib', 'ManyToOneRoomConnector() isMatchConfig(%s)',
    JSON.stringify(config),
  )

  return async function isMatch (message: Message) {
    log.verbose('WechatyPluginContrib', 'ManyToOneRoomConnector() isMatchConfig(%s) isMatch(%s)',
      JSON.stringify(config),
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

export function ManyToOneRoomConnector (
  config: ManyToOneRoomConnectorConfig
): WechatyPlugin {
  log.verbose('WechatyPluginContrib', 'ManyToOneRoomConnector(%s)',
    JSON.stringify(config),
  )

  const isMatch = isMatchConfig(config)

  const matchAndForward = (message: Message, room: Room) => {
    isMatch(message).then(async match => {
      let ret
      if (match) {
        let newMsg: any = message
        if (config.map) {
          newMsg = await config.map(message)
        }
        ret = room.say(newMsg)
      }
      return ret
    }).catch(e => log.error('WechatyPluginContrib', 'ManyToOneRoomConnector() filterThenToManyRoom(%s, %s) rejection: %s',
      message,
      room,
      e,
    ))
  }

  return function ManyToOneRoomConnectorPlugin (wechaty: Wechaty) {
    log.verbose('WechatyPluginContrib', 'ManyToOneRoomConnectorPlugin(%s) installing ...', wechaty)

    let oneRoom : Room

    wechaty.once('message', async onceMsg => {
      log.verbose('WechatyPluginContrib', 'ManyToOneRoomConnectorPlugin(%s) once(message) installing ...', wechaty)

      if (!oneRoom) {
        oneRoom = wechaty.Room.load(config.one)  // await loadRoom(wechaty, config.one)
      }

      matchAndForward(onceMsg, oneRoom)
      wechaty.on('message', message => matchAndForward(message, oneRoom))
    })
  }

}

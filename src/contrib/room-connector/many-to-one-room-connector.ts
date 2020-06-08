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

export interface ManyToOneRoomConnectorOptions {
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

export const isMatchOptions = (options: ManyToOneRoomConnectorOptions) => {
  log.verbose('WechatyPluginContrib', 'ManyToOneRoomConnector() isMatchOptions(%s)',
    JSON.stringify(options),
  )

  return async function isMatch (message: Message) {
    log.verbose('WechatyPluginContrib', 'ManyToOneRoomConnector() isMatchOptions(%s) isMatch(%s)',
      JSON.stringify(options),
      message.toString(),
    )

    if (message.self()) {
      return
    }
    const room = message.room()
    if (!room || !options.many.includes(room.id)) {
      return
    }

    if (options.whitelist) {
      if (await messageMatcher(
        options.whitelist,
        message,
      )) {
        return true
      }
    }

    if (options.blacklist) {
      if (await messageMatcher(
        options.blacklist,
        message,
      )) {
        return false
      }
    }

    return true
  }
}

export function ManyToOneRoomConnector (
  options: ManyToOneRoomConnectorOptions
): WechatyPlugin {
  log.verbose('WechatyPluginContrib', 'ManyToOneRoomConnector(%s)',
    JSON.stringify(options),
  )

  const isMatch = isMatchOptions(options)

  const matchAndForward = (message: Message, room: Room) => {
    isMatch(message).then(async match => {
      let ret
      if (match) {
        let newMsg: any = message
        if (options.map) {
          newMsg = await options.map(message)
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
        oneRoom = wechaty.Room.load(options.one)  // await loadRoom(wechaty, options.one)
      }

      matchAndForward(onceMsg, oneRoom)
      wechaty.on('message', message => matchAndForward(message, oneRoom))
    })
  }

}

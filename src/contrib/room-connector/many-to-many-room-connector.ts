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

import {
  loadRoom,
}             from '../utils'

export interface ManyToManyRoomConnectorOptions {
  /**
   * From & To Room IDs
   */
  many: string[],

  blacklist?: MessageMatcherList,
  whitelist?: MessageMatcherList,

  map?: (message: Message) => any,
}

export const isMatchOptions = (options: ManyToManyRoomConnectorOptions) => {
  log.verbose('WechatyPluginContrib', 'ManyToManyRoomConnector() isMatchOptions(%s)',
    JSON.stringify(options),
  )

  return async function isMatch (message: Message) {
    log.verbose('WechatyPluginContrib', 'ManyToManyRoomConnector() isMatchOptions(%s) isMatch(%s)',
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

export function ManyToManyRoomConnector (
  options: ManyToManyRoomConnectorOptions
): WechatyPlugin {
  log.verbose('WechatyPluginContrib', 'ManyToManyRoomConnector(%s)',
    JSON.stringify(options),
  )

  const isMatch = isMatchOptions(options)

  const matchAndForward = (message: Message, roomList: Room[]) => {
    isMatch(message).then(async match => {
      let ret
      if (match) {
        let newMsg: any = message
        if (options.map) {
          newMsg = await options.map(message)
        }
        ret = Promise.all(
          roomList
            .filter(room => room.id !== message.room()?.id)
            .map(room => room.say(newMsg))
        )
      }
      return ret
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
        manyRoomList = await loadRoom(wechaty, options.many)
      }

      matchAndForward(onceMsg, manyRoomList)
      wechaty.on('message', message => matchAndForward(message, manyRoomList))
    })
  }

}

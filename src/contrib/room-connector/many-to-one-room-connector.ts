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
  MessageMatcherOptions,
  messageMatcher,
}                           from '../../matchers/mod'
import {
  messageMapper,
  MessageMapperOptions,
}                         from '../../mappers/mod'
import {
  roomTalker,
}                         from '../../talkers/mod'

export interface ManyToOneRoomConnectorConfig {
  /**
   * To Room ID
   */
  one: string,
  /**
   * From Room IDs
   */
  many: string[],

  blacklist?: MessageMatcherOptions,
  whitelist?: MessageMatcherOptions,

  map?: MessageMapperOptions,
}

export const isMatchConfig = (config: ManyToOneRoomConnectorConfig) => {
  log.verbose('WechatyPluginContrib', 'ManyToOneRoomConnector() isMatchConfig(%s)',
    JSON.stringify(config),
  )

  const matchWhitelist = messageMatcher(config.whitelist)
  const matchBlacklist = messageMatcher(config.blacklist)

  return async function isMatch (message: Message) {
    log.verbose('WechatyPluginContrib', 'ManyToOneRoomConnector() isMatchConfig() isMatch(%s)',
      message.toString(),
    )

    if (message.self()) {
      return
    }
    const room = message.room()
    if (!room || !config.many.includes(room.id)) {
      return
    }

    if (await matchWhitelist(message)) {
      return true
    }
    if (await matchBlacklist(message)) {
      return false
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
  const mapMessage = messageMapper(config.map)

  const matchAndForward = (message: Message, room: Room) => {
    isMatch(message).then(async match => {
      // eslint-disable-next-line promise/always-return
      if (match) {
        const msgList = await mapMessage(message)

        const talkRoom = roomTalker(msgList)
        await talkRoom(room)
      }
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

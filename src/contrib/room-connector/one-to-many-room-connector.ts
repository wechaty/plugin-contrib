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
}                           from '../../matchers/mod.js'
import {
  messageMapper,
  MessageMapperOptions,
}                         from '../../mappers/mod.js'
import {
  roomTalker,
}                         from '../../talkers/mod.js'

export interface OneToManyRoomConnectorConfig {
  /**
   * From Room ID
   */
  one: string,
  /**
   * To Room IDs
   */
  many: string[],

  blacklist?: MessageMatcherOptions,
  whitelist?: MessageMatcherOptions,

  map?: MessageMapperOptions,
}

export const isMatchConfig = (config: OneToManyRoomConnectorConfig) => {
  log.verbose('WechatyPluginContrib', 'OneToManyRoomConnector() isMatchConfig(%s)',
    JSON.stringify(config),
  )

  const matchWhitelist = messageMatcher(config.whitelist)
  const matchBlacklist = messageMatcher(config.blacklist)

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

    if (await matchWhitelist(message)) {
      return true
    }
    if (await matchBlacklist(message)) {
      return false
    }

    return true
  }
}

export function OneToManyRoomConnector (
  config: OneToManyRoomConnectorConfig,
): WechatyPlugin {
  log.verbose('WechatyPluginContrib', 'OneToManyRoomConnector(%s)',
    JSON.stringify(config),
  )

  const isMatch     = isMatchConfig(config)
  const mapMessage  = messageMapper(config.map)

  const matchAndForward = async (message: Message, roomList: Room[]) => {
    const match = await isMatch(message)
    if (!match) { return }

    try {
      const msgList = await mapMessage(message)
      const talkRoom = roomTalker(msgList)

      for (const room of roomList) {
        await talkRoom(room)
        await room.wechaty.sleep(1000)
      }

    } catch (e) {
      log.error('WechatyPluginContrib', 'OneToManyRoomConnector() filterThenToManyRoom(%s, %s) rejection: %s',
        message,
        roomList.join(','),
        e,
      )
    }
  }

  return function OneToManyRoomConnectorPlugin (wechaty: Wechaty) {
    log.verbose('WechatyPluginContrib', 'OneToManyRoomConnectorPlugin(%s) installing ...', wechaty)

    let manyRoomList : Room[]

    wechaty.once('message', async onceMsg => {
      log.verbose('WechatyPluginContrib', 'OneToManyRoomConnectorPlugin(%s) once(message) installing ...', wechaty)

      if (manyRoomList.length <= 0) {
        manyRoomList = (await Promise.all(
          config.many.map(
            id => wechaty.Room.find({ id }),
          ),
        )).filter(Boolean) as Room[]
      }

      await matchAndForward(onceMsg, manyRoomList)
      wechaty.on('message', message => matchAndForward(message, manyRoomList))
    })
  }

}

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
}                         from '../../matchers/mod'
import {
  messageMapper,
  MessageMapperOptions,
}                         from '../../mappers/mod'
import {
  roomTalker,
}                         from '../../talkers/mod'

export interface ManyToManyRoomConnectorConfig {
  /**
   * From & To Room IDs
   */
  many: string[],

  blacklist?: MessageMatcherOptions,
  whitelist?: MessageMatcherOptions,

  map?: MessageMapperOptions,
}

export const isMatchConfig = (config: ManyToManyRoomConnectorConfig) => {
  log.verbose('WechatyPluginContrib', 'ManyToManyRoomConnector() isMatchConfig(%s)',
    JSON.stringify(config),
  )

  const matchWhitelist = messageMatcher(config.whitelist)
  const matchBlacklist = messageMatcher(config.blacklist)

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

    if (await matchWhitelist(message)) {
      return true
    }
    if (await matchBlacklist(message)) {
      return false
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

  const isMatch     = isMatchConfig(config)
  const mapMessage  = messageMapper(config.map)

  const matchAndForward = async (message: Message, roomList: Room[]) => {
    const match = await isMatch(message)
    if (!match) { return }

    const msgList = await mapMessage(message)
    if (msgList.length <= 0) { return }

    for (const room of roomList) {
      if (room.id === message.room()?.id) {
        continue
      }

      const talkRoom = roomTalker(msgList)
      await talkRoom(room)
    }

  }

  return function ManyToManyRoomConnectorPlugin (wechaty: Wechaty) {
    log.verbose('WechatyPluginContrib', 'ManyToManyRoomConnectorPlugin(%s) installing ...', wechaty)

    let manyRoomList : Room[]

    /**
     * We need to wait wechaty start before we can build our manyRoomList.
     */
    wechaty.once('message', async onceMsg => {
      log.verbose('WechatyPluginContrib', 'ManyToManyRoomConnectorPlugin(%s) once(message) installing ...', wechaty)

      if (!manyRoomList) {
        manyRoomList = config.many.map(id => wechaty.Room.load(id))
      }

      await matchAndForward(onceMsg, manyRoomList)
      wechaty.on('message', message => matchAndForward(message, manyRoomList))
    })
  }

}

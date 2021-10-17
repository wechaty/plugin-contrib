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
  RoomMatcherOptions,
  roomMatcher,
}                           from '../../matchers/mod.js'
import {
  messageMapper,
  MessageMapperOptions,
}                         from '../../mappers/mod.js'
import {
  roomTalker,
}                         from '../../talkers/mod.js'
import {
  RoomFinderOptions,
  roomFinder,
}                         from '../../finders/room-finder.js'

export interface SourceToTargetRoomConnectorConfig {
  /**
   * Room Sources
   */
  source: RoomMatcherOptions,
  /**
   * Room Targets
   */
  target: RoomFinderOptions,

  blacklist?: MessageMatcherOptions,
  whitelist?: MessageMatcherOptions,

  map?: MessageMapperOptions,
}

export const isMatchConfig = (config: SourceToTargetRoomConnectorConfig) => {
  log.verbose('WechatyPluginContrib', 'SourceToTargetRoomConnector() isMatchConfig(%s)',
    JSON.stringify(config),
  )

  const matchWhitelist = messageMatcher(config.whitelist)
  const matchBlacklist = messageMatcher(config.blacklist)

  const sourceRoomMatch = roomMatcher(config.source)

  return async function isMatch (message: Message) {
    log.verbose('WechatyPluginContrib', 'SourceToTargetRoomConnector() isMatchConfig() isMatch(%s)',
      message.toString(),
    )

    if (message.self()) { return }

    const room = message.room()
    if (!(room && await sourceRoomMatch(room))) {
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

export function SourceToTargetRoomConnector (
  config: SourceToTargetRoomConnectorConfig,
): WechatyPlugin {
  log.verbose('WechatyPluginContrib', 'SourceToTargetRoomConnector(%s)',
    JSON.stringify(config),
  )

  const isMatch     = isMatchConfig(config)
  const mapMessage  = messageMapper(config.map)
  const findRoom    = roomFinder(config.target)

  const matchAndForward = (message: Message, targetRoomList: Room[]) => {
    isMatch(message).then(async match => {
      // eslint-disable-next-line promise/always-return
      if (match) {
        const msgList = await mapMessage(message)

        const talkRoom = roomTalker(msgList)
        await talkRoom(targetRoomList)
      }
    }).catch(e => log.error('WechatyPluginContrib', 'SourceToTargetRoomConnector() filterThenToManyRoom(%s, %s) rejection: %s',
      message,
      targetRoomList.join(','),
      e,
    ))
  }

  return function SourceToTargetRoomConnectorPlugin (wechaty: Wechaty) {
    log.verbose('WechatyPluginContrib', 'SourceToTargetRoomConnectorPlugin(%s) installing ...', wechaty)

    const targetRoomList: Room[] = []

    wechaty.once('message', async onceMsg => {
      log.verbose('WechatyPluginContrib', 'SourceToTargetRoomConnectorPlugin(%s) once(message) installing ...', wechaty)

      if (targetRoomList.length <= 0) {
        targetRoomList.push(
          ...await findRoom(onceMsg.wechaty),
        )
      }

      matchAndForward(onceMsg, targetRoomList)
      wechaty.on('message', message => matchAndForward(message, targetRoomList))
    })
  }

}

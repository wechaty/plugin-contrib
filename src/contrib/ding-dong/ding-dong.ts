/**
 * Author: Huan LI https://github.com/huan
 * Date: Apr 2020
 */
/* eslint-disable sort-keys */
import {
  Wechaty,
  WechatyPlugin,
  Message,
  log,
}                   from 'wechaty'

import * as matchers from '../../matchers/mod'
import * as talkers  from '../../talkers/mod'

export interface DingDongConfigObject {
  /**
   * Whether response to the self message
   */
  self: boolean,
  /**
   * Whether response the Room Message with mention self.
   * Default: true
   */
  mention: boolean,
  /**
   * Whether response to the Direct Message
   * Default: true
   */
  contact: matchers.ContactMatcherOptions,
  /**
   * Whether response in the Room
   * Default: true
   */
  room: matchers.RoomMatcherOptions,

  ding: matchers.MessageMatcherOptions,
  dong: talkers.MessageTalkerOptions,
}

export type DingDongConfig = Partial<DingDongConfigObject>

const DEFAULT_CONFIG: DingDongConfigObject = {
  ding    : 'ding',
  dong    : 'dong',

  contact : true,
  mention : false,
  room    : true,
  self    : true,
}

const isMatchConfig = (config: DingDongConfigObject) => async (message: Message) => {
  log.verbose('WechatyPluginContrib', 'DingDong isMatchConfig(%s)(%s)',
    JSON.stringify(config),
    message.toString(),
  )

  config = {
    ...DEFAULT_CONFIG,
    ...config,
  }

  const matchContact = matchers.contactMatcher(config.contact)
  const matchRoom    = matchers.roomMatcher(config.room)

  const matchDing = matchers.messageMatcher(config.ding)

  const room = message.room()
  if (room) {
    if (!matchRoom(room))                     { return false }
    if (config.mention) {
      if (!(await message.mentionSelf()))     { return false }
    }
  } else {
    if (!matchContact(message.talker()))      { return false }
  }

  if (!config.self && message.self())         { return false }
  if (!matchDing(message))                    { return false }

  return true
}

function DingDong (config?: DingDongConfig): WechatyPlugin {
  log.verbose('WechatyPluginContrib', 'DingDong(%s)',
    typeof config === 'undefined' ? ''
      : typeof config === 'function' ? 'function'
        : JSON.stringify(config)
  )

  const normalizedConfig: DingDongConfigObject = {
    ...DEFAULT_CONFIG,
    ...config,
  }

  const isMatch  = isMatchConfig(normalizedConfig)
  const talkDong = talkers.messageTalker(normalizedConfig.dong)

  return function DingDongPlugin (wechaty: Wechaty) {
    log.verbose('WechatyPluginContrib', 'DingDong installing on %s ...', wechaty)

    wechaty.on('message', async message => {
      if (message.type() !== Message.Type.Text) {
        return
      }

      if (!await isMatch(message)) {
        return
      }

      await talkDong(message)
    })
  }

}

export {
  DingDong,
  isMatchConfig,
}

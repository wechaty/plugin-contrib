/**
 * Author: Huan LI https://github.com/huan
 * Date: Apr 2020
 */
/* eslint-disable sort-keys */
import {
  Wechaty,
  WechatyPlugin,
  Message,
  types,
}                   from 'wechaty'

import {
  log,
}                   from '../../config.js'

import * as matchers from '../../matchers/mod.js'
import * as talkers  from '../../talkers/mod.js'

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

  ding: matchers.StringMatcherOptions,
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

const isMatchConfig = (config: DingDongConfigObject) => {
  log.verbose('DingDong', ' isMatchConfig(%s)', JSON.stringify(config))

  const normalizedConfig = {
    ...DEFAULT_CONFIG,
    ...config,
  }

  const matchContact = matchers.contactMatcher(normalizedConfig.contact)
  const matchRoom    = matchers.roomMatcher(normalizedConfig.room)

  const matchDing = matchers.stringMatcher(normalizedConfig.ding)

  return async function isMatch (message: Message) {
    log.verbose('DingDong', 'isMatchConfig() isMatch(%s)', message.toString())

    const room = message.room()

    if (room) {
      if (!await matchRoom(room))                   { return false }
      if (normalizedConfig.mention) {
        if (!(await message.mentionSelf()))         { return false }
      }
    } else {
      if (!await matchContact(message.talker()))    { return false }
    }

    if (!normalizedConfig.self && message.self())   { return false }

    const text = await message.mentionText()
    if (!await matchDing(text))                     { return false }

    return true
  }
}

function DingDong (config?: DingDongConfig): WechatyPlugin {
  log.verbose('DingDong', 'DingDong(%s)',
    typeof config === 'undefined' ? ''
      : typeof config === 'function' ? 'function'
        : JSON.stringify(config),
  )

  const normalizedConfig: DingDongConfigObject = {
    ...DEFAULT_CONFIG,
    ...config,
  }

  const isMatch  = isMatchConfig(normalizedConfig)
  const talkDong = talkers.messageTalker(normalizedConfig.dong)

  return function DingDongPlugin (wechaty: Wechaty) {
    log.verbose('DingDong', 'installing on %s ...', wechaty)

    wechaty.on('message', async message => {
      if (message.type() !== types.Message.Text) {
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

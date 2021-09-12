import type {
  Wechaty,
}           from 'wechaty'

import {
  log,
}                 from '../../config.js'

import type {
  EmojiOption,
}               from './options.js'

export async function getEmoji (
  event   : string,
  wechaty : Wechaty,
  emoji?  : EmojiOption,
): Promise<void | string> {
  log.verbose('WechatyPluginContrib', 'Heartbeat getEmoji(%s)', event)

  if (!emoji) {
    return
  }

  if (typeof emoji === 'string') {
    return emoji
  }

  if (typeof emoji === 'function') {
    return emoji(wechaty)
  }

  throw new Error('unknown emoji optoins type: ' + typeof emoji)
}

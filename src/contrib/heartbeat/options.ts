import {
  Wechaty,
}                   from 'wechaty'

import { Sayable } from 'wechaty/dist/src/types'

type FindTalkerFunction = (wechaty: Wechaty) => Sayable | Sayable[] | Promise<Sayable> | Promise<Sayable[]>
type HeartbeatFunction  = (wechaty: Wechaty) => string | Promise<string>

export type SayableOption = string | string[] | FindTalkerFunction
export type EmojiOption   = string | HeartbeatFunction

/**
 * heartbeat: [爱心]
 */
interface EmojiSetting {
  login     : EmojiOption,
  logout    : EmojiOption,
  ready     : EmojiOption,
  heartbeat : EmojiOption,
}

export interface HeartbeatOptions {
  contact?        : SayableOption,
  room?           : SayableOption,
  emoji           : Partial<EmojiSetting>,
  intervalSeconds : number,
}

const DEFAULT_CONTACT_ID       = 'filehelper'
const DEFAULT_INTERVAL_SECONDS = 60 * 60       // 1 Hour

const DEFAULT_HEARTBEAT_OPTIONS: HeartbeatOptions = {
  emoji: {
    heartbeat: '[爱心]',
  },
  intervalSeconds : DEFAULT_INTERVAL_SECONDS,
}

export function buildOptions (options?: Partial<HeartbeatOptions>) {

  const normalizedOptions: HeartbeatOptions = {
    ...DEFAULT_HEARTBEAT_OPTIONS,
    ...options,
    emoji: {
      ...DEFAULT_HEARTBEAT_OPTIONS.emoji,
      ...options?.emoji,
    },
  }

  /**
   * Set contact to DEFAULT_CONTACT_ID if there's nothing set
   */
  if (!normalizedOptions.room && !normalizedOptions.contact) {
    normalizedOptions.contact = DEFAULT_CONTACT_ID
  }
  return normalizedOptions

}

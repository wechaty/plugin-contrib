import {
  Wechaty,
}                   from 'wechaty'

import {
  RoomFinderOptions,
  ContactFinderOptions,
}                           from '../../finders/mod'

type HeartbeatFunction  = (wechaty: Wechaty) => string | Promise<string>
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

export interface HeartbeatConfig {
  contact?        : ContactFinderOptions, // SayableOption,
  room?           : RoomFinderOptions,    // SayableOption,
  emoji           : Partial<EmojiSetting>,
  intervalSeconds : number,
}

const DEFAULT_CONTACT_ID       = 'filehelper'
const DEFAULT_INTERVAL_SECONDS = 60 * 60       // 1 Hour

/**
 *   emoji: {
 *     heartbeat : '[爱心]',
 *     login     : '[太阳]',
 *     logout    : '[月亮]',
 *     ready     : '[拳头]',
 *   },
 */
const DEFAULT_HEARTBEAT_CONFIG: HeartbeatConfig = {
  emoji: {
    heartbeat: '[爱心]',
  },
  intervalSeconds : DEFAULT_INTERVAL_SECONDS,
}

export function buildConfig (config?: Partial<HeartbeatConfig>) {

  const normalizedConfig: HeartbeatConfig = {
    ...DEFAULT_HEARTBEAT_CONFIG,
    ...config,
    emoji: {
      ...DEFAULT_HEARTBEAT_CONFIG.emoji,
      ...config?.emoji,
    },
  }

  /**
   * Set contact to DEFAULT_CONTACT_ID if there's nothing set
   */
  if (!normalizedConfig.room && !normalizedConfig.contact) {
    normalizedConfig.contact = DEFAULT_CONTACT_ID
  }
  return normalizedConfig

}

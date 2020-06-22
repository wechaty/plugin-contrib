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
}                           from '../matchers/mod'

export interface ChatOpsConfig {
  /**
   * Chatops Room Id(s)
   */
  room: string,
  /**
   * Whether response the Room Message with mention self.
   * Default: true
   */
  at?: boolean,
  /**
   * Whether response to the Direct Message
   * Default: true
   */
  dm?: boolean,
  /**
   * Blacklist & Whitelist
   */
  blacklist?: MessageMatcherOptions,
  whitelist?: MessageMatcherOptions,
}

const DEFAULT_CONFIG: Partial<ChatOpsConfig> = {
  at : true,
  dm : true,
}

export const isMatchConfig = (config: ChatOpsConfig) => {
  log.verbose('WechatyPluginContrib', 'ChatOps isMatchConfig(%s)',
    JSON.stringify(config),
  )

  const normalizedConfig = {
    ...DEFAULT_CONFIG,
    ...config,
  } as Required<ChatOpsConfig>

  const matchWhitelist = normalizedConfig.whitelist ? messageMatcher(normalizedConfig.whitelist) : () => false
  const matchBlacklist = normalizedConfig.blacklist ? messageMatcher(normalizedConfig.blacklist) : () => false

  return async function isMatch (message: Message): Promise<boolean> {
    log.verbose('WechatyPluginContrib', 'ChatOps isMatchConfig(%s) isMatch(%s)',
      JSON.stringify(config),
      message.toString(),
    )

    if (message.self())               { return false }

    if (await matchWhitelist(message)) { return true  }
    if (await matchBlacklist(message)) { return false }

    if (normalizedConfig.dm) {
      if (!message.room()) {
        log.silly('WechatyPluginContrib', 'ChatOps isMatchConfig: match [dm]')
        return true
      }
    }
    if (normalizedConfig.at) {
      if (message.room() && await message.mentionSelf()) {
        log.silly('WechatyPluginContrib', 'ChatOps isMatchConfig: match [at]')
        return true
      }
    }

    return false
  }
}

export function ChatOps (config: ChatOpsConfig): WechatyPlugin {
  log.verbose('WechatyPluginContrib', 'ChatOps(%s)',
    typeof config === 'undefined' ? ''
      : typeof config === 'function' ? 'function'
        : JSON.stringify(config)
  )

  const isMatch = isMatchConfig(config)

  return function ChatOpsPlugin (wechaty: Wechaty) {
    log.verbose('WechatyPluginContrib', 'ChatOps installing on %s ...', wechaty)

    let chatopsRoom: undefined | Room

    wechaty.on('message', async message => {

      if (!chatopsRoom) {
        chatopsRoom = wechaty.Room.load(config.room)
        try {
          await chatopsRoom.ready()
        } catch (e) {
          log.error('WechatyPluginContrib', 'ChatOps() ChatOpsPlugin(%s) chatopsRoom.ready() rejection: %s', wechaty, e)
        }
      }

      if (await isMatch(message)) {
        try {
          await chatopsRoom.say(message.toString())
        } catch (e) {
          log.error('WechatyPluginContrib', 'ChatOps() ChatOpsPlugin(%s) rejection: %s', wechaty, e)
        }
      }

    })
  }

}

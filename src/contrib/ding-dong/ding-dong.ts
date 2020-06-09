/**
 * Author: Huan LI https://github.com/huan
 * Date: Apr 2020
 */
import {
  Wechaty,
  WechatyPlugin,
  Message,
  log,
}                   from 'wechaty'

type DingDongConfigFunction = (message: Message) => boolean | Promise<boolean>

export interface DingDongConfigObject {
  /**
   * Whether response to the self message
   */
  self: boolean,
  /**
   * Whether response the Room Message with mention self.
   * Default: true
   */
  at: boolean,
  /**
   * Whether response to the Direct Message
   * Default: true
   */
  dm: boolean,
  /**
   * Whether response in the Room
   * Default: true
   */
  room: boolean,
}

export type DingDongConfig = Partial<DingDongConfigObject> | DingDongConfigFunction

const DEFAULT_CONFIG: DingDongConfigObject = {
  at   : true,
  dm   : true,
  room : true,
  self : true,
}

export const isMatchConfig = (config?: Partial<DingDongConfigObject>) => async (message: Message) => {
  log.verbose('WechatyPluginContrib', 'DingDong isMatchConfig(%s)(%s)',
    JSON.stringify(config),
    message.toString(),
  )

  const normalizedConfig: DingDongConfigObject = {
    ...DEFAULT_CONFIG,
    ...config,
  }

  if (!normalizedConfig.self) {
    if (message.self()) {
      return false
    }
  }

  if (normalizedConfig.room) {
    if (message.room()) {
      log.silly('WechatyPluginContrib', 'DingDong isMatchConfig: match [room]')
      return true
    }
  }

  if (normalizedConfig.dm) {
    if (!message.room()) {
      log.silly('WechatyPluginContrib', 'DingDong isMatchConfig: match [dm]')
      return true
    }
  }

  if (normalizedConfig.at) {
    if (message.room() && await message.mentionSelf()) {
      log.silly('WechatyPluginContrib', 'DingDong isMatchConfig: match [at]')
      return true
    }
  }

  return false
}

export function DingDong (config?: DingDongConfig): WechatyPlugin {
  log.verbose('WechatyPluginContrib', 'DingDong(%s)',
    typeof config === 'undefined' ? ''
      : typeof config === 'function' ? 'function'
        : JSON.stringify(config)
  )

  let isMatch: (message: Message) => Promise<boolean>

  if (typeof config === 'function') {
    isMatch = (message: Message) => Promise.resolve(config(message))
  } else {
    isMatch = isMatchConfig(config)
  }

  return function DingDongPlugin (wechaty: Wechaty) {
    log.verbose('WechatyPluginContrib', 'DingDong installing on %s ...', wechaty)

    wechaty.on('message', async message => {
      if (message.type() !== Message.Type.Text) {
        return
      }

      const text = message.room()
        ? await message.mentionText()
        : message.text()

      if (!/^ding$/i.test(text)) {
        return
      }

      if (!await isMatch(message)) {
        return
      }

      await message.say('dong')
    })
  }

}

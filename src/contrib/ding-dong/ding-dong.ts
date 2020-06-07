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

type DingDongOptionsFunction = (message: Message) => boolean | Promise<boolean>

export interface DingDongOptionsObject {
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

export type DingDongOptions = Partial<DingDongOptionsObject> | DingDongOptionsFunction

const DEFAULT_OPTIONS: DingDongOptionsObject = {
  at   : true,
  dm   : true,
  room : true,
  self : false,
}

export const isMatchOptions = (options?: Partial<DingDongOptionsObject>) => async (message: Message) => {
  log.verbose('WechatyPluginContrib', 'DingDong isMatchOptions(%s)(%s)',
    JSON.stringify(options),
    message.toString(),
  )

  const normalizedOptions: DingDongOptionsObject = {
    ...DEFAULT_OPTIONS,
    ...options,
  }

  if (!normalizedOptions.self) {
    if (message.self()) {
      return false
    }
  }

  if (normalizedOptions.room) {
    if (message.room()) {
      log.silly('WechatyPluginContrib', 'DingDong isMatchOptions: match [room]')
      return true
    }
  }

  if (normalizedOptions.dm) {
    if (!message.room()) {
      log.silly('WechatyPluginContrib', 'DingDong isMatchOptions: match [dm]')
      return true
    }
  }

  if (normalizedOptions.at) {
    if (message.room() && await message.mentionSelf()) {
      log.silly('WechatyPluginContrib', 'DingDong isMatchOptions: match [at]')
      return true
    }
  }

  return false
}

export function DingDong (options?: DingDongOptions): WechatyPlugin {
  log.verbose('WechatyPluginContrib', 'DingDong(%s)',
    typeof options === 'undefined' ? ''
      : typeof options === 'function' ? 'function'
        : JSON.stringify(options)
  )

  let isMatch: (message: Message) => Promise<boolean>

  if (typeof options === 'function') {
    isMatch = (message: Message) => Promise.resolve(options(message))
  } else {
    isMatch = isMatchOptions(options)
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

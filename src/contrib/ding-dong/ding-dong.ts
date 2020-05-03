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

type DingDongOptions = Partial<DingDongOptionsObject> | DingDongOptionsFunction

const DEFAULT_OPTIONS: DingDongOptionsObject = {
  at   : true,
  dm   : true,
  room : true,
}

export const isMatchOptions = (options?: Partial<DingDongOptionsObject>) => async (message: Message) => {
  log.verbose('WechatyPluginContrib', 'DingDong isMatchOptions(%s)(%s)',
    JSON.stringify(options),
    message.toString(),
  )

  options = {
    ...DEFAULT_OPTIONS,
    ...options,
  }

  if (options.room) {
    if (message.room()) {
      log.silly('WechatyPluginContrib', 'DingDong isMatchOptions: match [room]')
      return true
    }
  }

  if (options.at) {
    if (message.room() && await message.mentionSelf()) {
      log.silly('WechatyPluginContrib', 'DingDong isMatchOptions: match [at]')
      return true
    }
  }

  if (options.dm) {
    if (!message.room()) {
      log.silly('WechatyPluginContrib', 'DingDong isMatchOptions: match [dm]')
      return true
    }
  }

  return false
}

export function DingDong (options?: DingDongOptions): WechatyPlugin {
  log.verbose('WechatyPluginContrib', 'DingDong("%s")',
    typeof options === 'function'
      ? 'function'
      : JSON.stringify(options),
  )

  let isMatch: (message: Message) => Promise<boolean>

  if (typeof options === 'function') {
    isMatch = (message: Message) => Promise.resolve(options(message))
  } else {
    isMatch = isMatchOptions(options)
  }

  return (wechaty: Wechaty) => {
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

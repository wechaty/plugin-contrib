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

export interface ChatOpsOptions {
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
}

const DEFAULT_OPTIONS: Partial<ChatOpsOptions> = {
  at : true,
  dm : true,
}

export const isMatchOptions = (options: ChatOpsOptions) => {
  log.verbose('WechatyPluginContrib', 'ChatOps isMatchOptions(%s)',
    JSON.stringify(options),
  )

  const normalizedOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
  } as Required<ChatOpsOptions>

  return async function isMatch (message: Message) {
    log.verbose('WechatyPluginContrib', 'ChatOps isMatchOptions(%s) isMatch(%s)',
      JSON.stringify(options),
      message.toString(),
    )

    if (normalizedOptions.dm) {
      if (!message.room()) {
        log.silly('WechatyPluginContrib', 'ChatOps isMatchOptions: match [dm]')
        return true
      }
    }
    if (normalizedOptions.at) {
      if (message.room() && await message.mentionSelf()) {
        log.silly('WechatyPluginContrib', 'ChatOps isMatchOptions: match [at]')
        return true
      }
    }

    return false
  }
}

export function ChatOps (options: ChatOpsOptions): WechatyPlugin {
  log.verbose('WechatyPluginContrib', 'ChatOps(%s)',
    typeof options === 'undefined' ? ''
      : typeof options === 'function' ? 'function'
        : JSON.stringify(options)
  )

  const isMatch: (message: Message) => Promise<boolean> = isMatchOptions(options)

  return function ChatOpsPlugin (wechaty: Wechaty) {
    log.verbose('WechatyPluginContrib', 'ChatOps installing on %s ...', wechaty)

    let chatopsRoom: undefined | Room

    wechaty.on('message', async message => {

      if (!chatopsRoom) {
        chatopsRoom = wechaty.Room.load(options.room)
        try {
          await chatopsRoom.ready()
        } catch (e) {
          log.error('WechatyPluginContrib', 'ChatOps() ChatOpsPlugin(%s) chatopsRoom.ready() rejection: %s', wechaty, e)
        }
      }

      if (await isMatch(message)) {
        try {
          await message.forward(chatopsRoom)
        } catch (e) {
          log.error('WechatyPluginContrib', 'ChatOps() ChatOpsPlugin(%s) rejection: %s', wechaty, e)
        }
      }

    })
  }

}

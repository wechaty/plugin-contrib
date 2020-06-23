/**
 * Author: Siyao Liu https://github.com/ssine
 * Date: June 2020
 */
import {
  Wechaty,
  WechatyPlugin,
  Message,
  log,
} from 'wechaty'

import * as matchers from '../matchers/mod'

type MessageAwaiterArgs = {
  contact?: matchers.ContactMatcherOptions,
  room?: matchers.RoomMatcherOptions,
  text?: matchers.StringMatcherOptions,
  timeoutSecond?: number
}

declare module 'wechaty' {
  class Wechaty {

    waitForMessage(args: MessageAwaiterArgs): Promise<Message>

  }
}

export function MessageAwaiter (): WechatyPlugin {
  log.verbose('WechatyPluginContrib', 'MessageAwaiter')

  return function MessageAwaiterPlugin (wechaty: Wechaty) {
    log.verbose('WechatyPluginContrib', 'MessageAwaiter installing on %s ...', wechaty)

    wechaty.waitForMessage = async (args: MessageAwaiterArgs): Promise<Message> => {
      const matchContact = matchers.contactMatcher(args.contact)
      const matchRoom = matchers.roomMatcher(args.room)
      const matchString = matchers.stringMatcher(args.text)
      const waitTime = new Date()

      return new Promise<Message>((resolve, reject) => {

        const callback = async (message: Message) => {
          const messageFrom = message.from()
          const messageRoom = message.room()
          if (message.date() < waitTime) return
          if (args.contact && !(messageFrom && await matchContact(messageFrom))) return
          if (args.room && !(messageRoom && await matchRoom(messageRoom))) return
          if (args.text && !await matchString(message.text())) return
          wechaty.off('message', callback)
          resolve(message)
        }

        wechaty.on('message', callback)

        if (args.timeoutSecond) {
          setTimeout(() => {
            wechaty.off('message', callback)
            reject(Error('timed out'))
          }, args.timeoutSecond * 1000)
        }

      })
    }
  }

}

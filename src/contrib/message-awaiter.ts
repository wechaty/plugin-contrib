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

type MessageAwaiterArgs = {
  contactId?: string,
  roomId?: string,
  regex?: RegExp,
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
      let { contactId, roomId, regex, timeoutSecond } = args
      let waitTime = new Date()

      return new Promise<Message>((resolve, reject) => {

        let callback = async (message: Message) => {
          let messageFrom = message.from()
          let messageRoom = message.room()
          if (message.date() < waitTime) return
          if (contactId && messageFrom?.id !== contactId) return
          if (roomId && messageRoom?.id !== roomId) return
          if (regex && !regex.test(message.text())) return
          wechaty.off('message', callback)
          resolve(message)
        }

        wechaty.on('message', callback)

        if (timeoutSecond) {
          setTimeout(() => {
            wechaty.off('message', callback)
            reject(Error('timed out'))
          }, timeoutSecond * 1000)
        }

        log.verbose('begin waiting for message from %s', contactId)
      })
    }
  }

}

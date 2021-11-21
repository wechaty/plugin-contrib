/**
 * Author: Siyao Liu https://github.com/ssine
 * Date: June 2020
 *
 * Changelog:
 *  - Huan(202110) Issue #60 refactoring
 *    @see https://github.com/wechaty/plugin-contrib/issues/60
 */
import type {
  Sayable,
  Message,
}                   from 'wechaty'

import * as matchers from '../matchers/mod.js'

const messagePrompter = (startMessage: Message) => {
  const startRoom       = startMessage.room()
  const matchStartRoom  = matchers.roomMatcher(startRoom?.id)

  const startTalker       = startMessage.talker()
  const matchStartTalker  = matchers.contactMatcher(startTalker.id)

  const startTime = new Date()

  return async (
    sayable : Sayable,
    timeoutSeconds = 60,
  ): Promise<undefined | Message> => {
    if (timeoutSeconds <= 0) {
      timeoutSeconds = 60
    }

    const cleanCallbackList = [] as Function[]

    // Huan(202110) FIXME: remove any
    await startMessage.say(sayable as any)

    const future = new Promise<Message>((resolve, reject) => {
      const onMessage = async (msg: Message) => {
        const talker = msg.talker()
        const room = msg.room()
        if (msg.date() < startTime) return
        if (!(await matchStartTalker(talker))) return
        if (startRoom && !(room && await matchStartRoom(room))) return

        resolve(msg)
      }

      startMessage.wechaty.on('message', onMessage)
      cleanCallbackList.push(
        () => startMessage.wechaty.off('message', onMessage),
      )

      /**
        * Reject when timeout
        */
      const timer = setTimeout(
        () => reject(new Error(`timeout after ${timeoutSeconds} seconds.`)),
        timeoutSeconds * 1000,
      )
      cleanCallbackList.push(
        () => clearTimeout(timer),
      )
    })

    try {
      const newMsg = await future
      return newMsg
    } catch (e) {
      return undefined
    } finally {
      cleanCallbackList.forEach(cb => cb())
    }
  }
}

export {
  messagePrompter,
}

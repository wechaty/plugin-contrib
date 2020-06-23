/* eslint-disable brace-style */
import {
  Message,
  log,
  FileBox,
  Contact,
  UrlLink,
  MiniProgram,
}               from 'wechaty'
import Mustache from  'mustache'

import * as mapper from '../mappers/message-mapper'

export type MessageTalkerOptions = mapper.MessageMapperOptions

export function messageTalker<T = void> (options?: MessageTalkerOptions) {
  log.verbose('WechatyPluginContrib', 'messageTalker(%s)', JSON.stringify(options))

  if (!options) {
    return () => undefined
  }

  const mapMessage = mapper.messageMapper(options)

  return async function talkMessage (message: Message, mustacheView: T): Promise<void> {
    log.silly('WechatyPluginContrib', 'messageTalker() talkMessage(%s, %s)',
      message,
      mustacheView
        ? JSON.stringify(mustacheView)
        : '',
    )

    const msgList = await mapMessage(message)

    for (const msg of msgList) {
      if (!msg) { continue }

      if (typeof msg === 'string') {
        let text = msg
        if (mustacheView) {
          text = Mustache.render(msg, mustacheView)
        }
        await message.say(text)
      } else {
        /**
         * Super verbose:
         *  https://github.com/microsoft/TypeScript/issues/14107
         */
        if (msg instanceof FileBox)           { await message.say(msg) }
        else if (msg instanceof Contact)      { await message.say(msg) }
        else if (msg instanceof UrlLink)      { await message.say(msg) }
        else if (msg instanceof MiniProgram)  { await message.say(msg) }
        else if (msg instanceof Message)      { await message.say(msg) }
        else { throw new Error('unknown msg type: ' + typeof msg) }
      }

      await message.wechaty.sleep(1000)
    }
  }
}

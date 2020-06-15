import {
  Message,
  log,
}               from 'wechaty'
import Mustache from  'mustache'

type MessageTalkerFunction        = (message: Message) => void | string | Promise<void | string>
type MessageTalkerOption          = string | MessageTalkerFunction
export type MessageTalkerOptions  = MessageTalkerOption | MessageTalkerOption[]

export function messageTalker<T = void> (options?: MessageTalkerOptions) {
  log.verbose('WechatyPluginContrib', 'messageTalker(%s)', JSON.stringify(options))

  if (!options) {
    return () => undefined
  }

  if (!Array.isArray(options)) {
    options = [ options ]
  }

  const optionList = options

  return async function talkMessage (message: Message, mustacheView: T): Promise<void> {
    log.silly('WechatyPluginContrib', 'messageTalker() talkMessage(%s, %s)',
      message,
      mustacheView
        ? JSON.stringify(mustacheView)
        : '',
    )

    for (const option of optionList) {
      let text
      if (typeof option === 'string') {
        text = option
      } else if (option instanceof Function) {
        text = await option(message)
      } else {
        throw new Error('talkMessage() option unknown: ' + option)
      }

      if (text) {
        if (mustacheView) {
          text = Mustache.render(text, mustacheView)
        }
        await message.say(text)
      }

      await message.wechaty.sleep(5 * 1000)
    }
  }
}

import {
  Message,
  log,
}                 from 'wechaty'

type MessageTalkerFunction      = (message: Message) => void | Promise<void>
type MessageTalkerOption        = string | MessageTalkerFunction
export type MessageTalkerOptions = MessageTalkerOption | MessageTalkerOption[]

export function messageTalker (options?: MessageTalkerOptions) {
  log.verbose('WechatyPluginContrib', 'messageTalker(%s)', JSON.stringify(options))

  if (!options) {
    return () => undefined
  }

  if (!Array.isArray(options)) {
    options = [ options ]
  }

  const optoinList = options

  return async function messageTalk (message: Message): Promise<void> {
    log.silly('WechatyPluginContrib', 'messageTalker() messageTalk(%s)', message)

    for (const option of optoinList) {
      if (typeof option === 'string') {
        await message.say(option)
      } else if (option instanceof Function) {
        await option(message)
      } else {
        throw new Error('messageTalk optoin unknown: ' + option)
      }
      await message.wechaty.sleep(5 * 1000)
    }
  }
}

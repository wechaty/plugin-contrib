import {
  Message,
  log,
}           from 'wechaty'

type MessageMatcherFunction = (msg: Message) => boolean | Promise<boolean>
type MessageMatcherOption = string | RegExp | MessageMatcherFunction
export type MessageMatcherOptions = MessageMatcherOption | MessageMatcherOption[]

function messageMatcher (
  matcherOptions?: MessageMatcherOptions,
) {
  log.verbose('WechatyPluginContrib', 'messageMatcher(%s)', JSON.stringify(matcherOptions))

  if (!matcherOptions) {
    return (..._: any[]) => false
  }

  if (!Array.isArray(matcherOptions)) {
    matcherOptions = [ matcherOptions ]
  }

  const matcherOptionList = matcherOptions

  return async function matchMessage (message: Message): Promise<boolean> {
    log.silly('WechatyPluginContrib', 'messageMatcher() matchMessage(%s)', message)

    let isMatch = false
    for (const matcher of matcherOptionList) {
      if (typeof matcher === 'string') {
        const idCheckList = [
          message.from()?.id,
          message.room()?.id,
        ]
        isMatch = idCheckList.includes(matcher)

      } else if (matcher instanceof RegExp) {
        const textCheckList = [
          message.text(),
          message.from()?.name(),
          await message.room()?.topic(),
        ]
        isMatch = textCheckList.some(text => text && matcher.test(text))
      } else if (typeof matcher === 'function') {
        isMatch = await matcher(message)
      } else {
        throw new Error('unknown matcher ' + matcher)
      }

      if (isMatch) {
        return true
      }
    }
    // no match
    return false
  }
}

export {
  messageMatcher,
}

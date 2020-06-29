import {
  Message,
  log,
}           from 'wechaty'

type MessageMatcherFunction       = (msg: Message) => boolean | Promise<boolean>
type MessageMatcherOption         = boolean | string | RegExp | MessageMatcherFunction
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
    for (const option of matcherOptionList) {
      if (typeof option === 'boolean') {
        isMatch = option
      } else if (typeof option === 'string') {
        const idCheckList = [
          message.from()?.id,
          message.room()?.id,
        ]
        isMatch = idCheckList.includes(option)
      } else if (option instanceof RegExp) {
        const text = await message.mentionText()
        const textCheckList = [
          text,
          message.from()?.name(),
          await message.room()?.topic(),
        ]
        isMatch = textCheckList.some(text => text && option.test(text))
      } else if (typeof option === 'function') {
        isMatch = await option(message)
      } else {
        throw new Error('unknown matcher ' + option)
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

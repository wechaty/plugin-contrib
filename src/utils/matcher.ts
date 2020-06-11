import { Message } from 'wechaty'

type MessageMatcherFunction = (msg: Message) => Promise<boolean>
export type MessageMatcherList = (string | MessageMatcherFunction)[]

async function messageMatcher (
  matcherList : MessageMatcherList,
  message     : Message,
): Promise<boolean> {
  for (const filter of matcherList) {
    if (typeof filter === 'string') {
      const checkList = [
        message.text(),
        message.from()?.id,
        message.from()?.name(),
      ]
      if (checkList.includes(filter)) {
        return true
      }
    } else if (typeof filter === 'function') {
      if (await filter(message)) { return true }
    }
  }
  return false
}

export {
  messageMatcher,
}

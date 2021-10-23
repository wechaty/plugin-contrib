import type {
  SayableMessage,
  Message,
}                   from 'wechaty'
import {
  type,
  log,
}                   from 'wechaty'

/**
 *  1. `void` & `undefined` means drop the message
 *  1. `Message` means forward the original message
 */
type TalkerMessage = void | undefined | SayableMessage

async function talkerMessageFrom (message: Message): Promise<TalkerMessage> {
  const msgType = message.type()
  switch (msgType) {
    case type.Message.Text:
      return message.text()
    case type.Message.Image:
    case type.Message.Attachment:
    case type.Message.Audio:
    case type.Message.Video:
    case type.Message.Emoticon:
      return message.toFileBox()
    case type.Message.Contact:
      return message.toContact()
    case type.Message.Url:
      return message.toUrlLink()
    case type.Message.MiniProgram:
      return message.toMiniProgram()

    default:
      log.silly('Wechaty', 'talkerMessageFrom(%s) non-convertible type: %s', message, type)
      return undefined
  }
}

export type {
  TalkerMessage,
}
export {
  talkerMessageFrom,
}

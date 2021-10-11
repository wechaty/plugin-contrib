import type {
  SayableMessage,
}                   from 'wechaty'
import {
  Message,
  log,
}                   from 'wechaty'

/**
 *  1. `void` & `undefined` means drop the message
 *  1. `Message` means forward the original message
 */
type TalkerMessage = void | undefined | SayableMessage

async function talkerMessageFrom (message: Message): Promise<TalkerMessage> {
  const type = message.type()
  switch (type) {
    case Message.Type.Text:
      return message.text()
    case Message.Type.Image:
    case Message.Type.Attachment:
    case Message.Type.Audio:
    case Message.Type.Video:
    case Message.Type.Emoticon:
      return message.toFileBox()
    case Message.Type.Contact:
      return message.toContact()
    case Message.Type.Url:
      return message.toUrlLink()
    case Message.Type.MiniProgram:
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

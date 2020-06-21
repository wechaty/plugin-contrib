import {
  Contact,
  Message,
  FileBox,
  UrlLink,
  MiniProgram,
  Room,
}               from 'wechaty'

/**
 * 1. `undefined` means drop the message
 * 1. `Message` means forward the original message
 */
type MessageMappedType = undefined | Message | string | FileBox | Contact | UrlLink | MiniProgram
type MessageMapFunction = (message: Message) => Promise<MessageMappedType | MessageMappedType[]>
type MessageMapOption = MessageMappedType | MessageMapFunction
export type MessageMapOptions = MessageMapOption | MessageMapOption[]

async function getMappedMessage (
  message: Message,
  mapFunc?: MessageMapFunction,
): Promise<MessageMappedType[]> {

  if (!mapFunc) {
    return [ message ]
  }

  let mappedMsgList = await mapFunc(message)
  if (!mappedMsgList) {
    mappedMsgList = []
  } else if (!Array.isArray(mappedMsgList)) {
    mappedMsgList = [ mappedMsgList ]
  }
  return mappedMsgList
}

async function sayMappedMessage (
  mappedMsgList: MessageMappedType[],
  roomList: Room[],
): Promise<void> {
  for (const room of roomList) {
    for (const msg of mappedMsgList) {
      if (msg) {
        if (msg instanceof Message) {
          await msg.forward(room)
        } else {
          await room.say(msg as any)
        }
        await room.wechaty.sleep(1000)
      }
    }
  }
}

export {
  getMappedMessage,
  sayMappedMessage,
}

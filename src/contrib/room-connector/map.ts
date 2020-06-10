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
type MappedMsgType = undefined | Message | string | FileBox | Contact | UrlLink | MiniProgram
export type MapFunction = (message: Message) => Promise<MappedMsgType | MappedMsgType[]>

async function getMappedMessage (
  message: Message,
  mapFunc?: MapFunction,
): Promise<MappedMsgType[]> {

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
  mappedMsgList: MappedMsgType[],
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

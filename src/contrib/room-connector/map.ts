import {
  Contact,
  Message,
  FileBox,
  UrlLink,
  MiniProgram,
  Room,
  log,
}                       from 'wechaty'

/**
 * `undefined` means drop the message
 */
type MappedMsgType = undefined | string | FileBox | Contact | UrlLink | MiniProgram
export type MapFunction = (message: Message) => Promise<MappedMsgType | MappedMsgType[]>

async function getMappedMessage (
  message: Message,
  mapFunc?: MapFunction,
): Promise<MappedMsgType[]> {

  if (mapFunc) {
    let mappedMsgList = await mapFunc(message)
    if (!mappedMsgList) {
      mappedMsgList = []
    } else if (!Array.isArray(mappedMsgList)) {
      mappedMsgList = [ mappedMsgList ]
    }
    return mappedMsgList
  }

  switch (message.type()) {
    case Message.Type.Text:         return [ message.text() ]
    case Message.Type.Url:          return [ await message.toUrlLink() ]
    case Message.Type.Contact:      return [ await message.toContact() ]
    case Message.Type.MiniProgram:  return [ await message.toMiniProgram() ]

    case Message.Type.Emoticon:
    case Message.Type.Audio:
    case Message.Type.Video:
    case Message.Type.Image:
    case Message.Type.Attachment:
      return [ await message.toFileBox() ]

    default:
      log.silly('WechatyPluginContrib', 'RoomConnector getMappedMessage() message.type() not support: ' + message.type())
      break
  }
  return []
}

async function sayMappedMessage (
  mappedMsgList: MappedMsgType[],
  roomList: Room[],
): Promise<void> {
  for (const room of roomList) {
    for (const msg of mappedMsgList) {
      if (msg) {
        await room.say(msg as any)
        await room.wechaty.sleep(1000)
      }
    }
  }
}

export {
  getMappedMessage,
  sayMappedMessage,
}

/* eslint-disable brace-style */
import {
  log,
  Room,
  Contact,
  FileBox,
  UrlLink,
  MiniProgram,
  Message,
}               from 'wechaty'
import Mustache from  'mustache'

import { MappedMessage } from '../mappers/message-mapper'

type RoomTalkerFunction       = (room: Room, contact?: Contact) => MappedMessage | Promise<MappedMessage>
type RoomTalkerOption         = MappedMessage | RoomTalkerFunction
export type RoomTalkerOptions = RoomTalkerOption | RoomTalkerOption[]

export function roomTalker<T = void> (options?: RoomTalkerOptions) {
  log.verbose('WechatyPluginContrib', 'roomTalker(%s)', JSON.stringify(options))

  if (!options) {
    return () => undefined
  }

  if (!Array.isArray(options)) {
    options = [ options ]
  }

  const optionList = options

  return async function talkRoom (room: Room, contact?: Contact, mustacheView?: T): Promise<void> {
    log.silly('WechatyPluginContrib', 'roomTalker() talkRoom(%s, %s)',
      room,
      contact,
      mustacheView
        ? JSON.stringify(mustacheView)
        : '',
    )

    for (const option of optionList) {
      let msg
      if (option instanceof Function) {
        msg = await option(room, contact)
      } else {
        msg = option
      }

      if (!msg) { continue }

      if (typeof msg === 'string') {
        if (mustacheView) {
          msg = Mustache.render(msg, mustacheView)
        }
        if (contact) {
          await room.say(msg, contact)
        } else {
          await room.say(msg)
        }
      }

      /**
       * Super verbose:
       *  https://github.com/microsoft/TypeScript/issues/14107
       */
      else if (msg instanceof FileBox)      { await room.say(msg) }
      else if (msg instanceof Contact)      { await room.say(msg) }
      else if (msg instanceof UrlLink)      { await room.say(msg) }
      else if (msg instanceof MiniProgram)  { await room.say(msg) }
      else if (msg instanceof Message)      { await room.say(msg) }

      else {
        throw new Error('talkRoom() msg unknown: ' + msg)
      }

      await room.wechaty.sleep(1000)
    }
  }
}

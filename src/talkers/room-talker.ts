/* eslint-disable brace-style */
import {
  log,
  Room,
  Contact,
}                 from 'wechaty'
import Mustache   from  'mustache'

import * as types from '../types/mod'

type RoomTalkerFunction       = (room: Room, contact?: Contact) => types.SayableMessage | Promise<types.SayableMessage>
type RoomTalkerOption         = types.SayableMessage | RoomTalkerFunction
export type RoomTalkerOptions = RoomTalkerOption | RoomTalkerOption[]

export function roomTalker<T = void> (options?: RoomTalkerOptions) {
  log.verbose('WechatyPluginContrib', 'roomTalker(%s)', JSON.stringify(options))

  if (!options) {
    return () => undefined
  }

  if (!Array.isArray(options)) {
    options = [options]
  }

  const optionList = options

  return async function talkRoom (
    rooms: Room | Room[],
    contacts?: Contact | Contact[],
    mustacheView?: T,
  ): Promise<void> {
    log.verbose('WechatyPluginContrib', 'roomTalker() talkRoom(%s, %s, %s)',
      rooms,
      contacts || '',
      mustacheView
        ? JSON.stringify(mustacheView)
        : '',
    )

    if (!Array.isArray(rooms)) {
      rooms = [rooms]
    }
    if (typeof contacts === 'undefined') {
      contacts = []
    } else if (!Array.isArray(contacts)) {
      contacts = [contacts]
    }

    for (const room of rooms) {
      await loopOptionList(room, contacts)
      await room.wechaty.sleep(1000)
    }

    async function loopOptionList (room: Room, contactList: Contact[]): Promise<void> {
      for (const option of optionList) {
        let msg
        if (option instanceof Function) {
          msg = await option(room, ...contactList)
        } else {
          msg = option
        }

        if (!msg) { continue }

        if (typeof msg === 'string') {
          if (mustacheView) {
            msg = Mustache.render(msg, mustacheView)
          }
          await room.say(msg, ...contactList)
        } else {
          /**
           *  FIXME(huan): https://github.com/microsoft/TypeScript/issues/14107
           */
          await room.say(msg as any)
        }

        await room.wechaty.sleep(1000)
      }
    }
  }
}

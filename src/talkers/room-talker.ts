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
    options = [ options ]
  }

  const optionList = options

  return async function talkRoom (room: Room, contact?: Contact, mustacheView?: T): Promise<void> {
    log.verbose('WechatyPluginContrib', 'roomTalker() talkRoom(%s, %s, %s)',
      room,
      contact || '',
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

/* eslint-disable brace-style */
import {
  log,
  Room,
  Contact,
}               from 'wechaty'
import Mustache from  'mustache'

type RoomTalkerFunction       = (room: Room, contact: void | Contact) => void | string | Promise<void | string>
type RoomTalkerOption         = string | RoomTalkerFunction
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

  return async function talkRoom (room: Room, contact: void | Contact = undefined, mustacheView: T): Promise<void> {
    log.silly('WechatyPluginContrib', 'roomTalker() talkRoom(%s, %s)',
      room,
      contact,
      mustacheView
        ? JSON.stringify(mustacheView)
        : '',
    )

    for (const option of optionList) {
      let text
      if (typeof option === 'string') {
        text = option
      } else if (option instanceof Function) {
        text = await option(room, contact)
      } else {
        throw new Error('talkRoom() option unknown: ' + option)
      }

      if (text) {
        if (mustacheView) {
          text = Mustache.render(text, mustacheView)
        }
        if (contact) {
          await room.say(text, contact)
        } else {
          await room.say(text)
        }
      }

      await room.wechaty.sleep(5 * 1000)
    }
  }
}

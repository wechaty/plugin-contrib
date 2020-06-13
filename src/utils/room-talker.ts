import {
  log,
  Room,
  Contact,
}             from 'wechaty'

type RoomTalkerFunction      = (room: Room, contact?: Contact) => void | Promise<void>
type RoomTalkerOption        = string | RoomTalkerFunction
export type RoomTalkerOptions = RoomTalkerOption | RoomTalkerOption[]

export function roomTalker (options?: RoomTalkerOptions) {
  log.verbose('WechatyPluginContrib', 'roomTalker(%s)', JSON.stringify(options))

  if (!options) {
    return () => undefined
  }

  if (!Array.isArray(options)) {
    options = [ options ]
  }

  const optoinList = options

  return async function roomTalk (room: Room, contact?: Contact): Promise<void> {
    log.silly('WechatyPluginContrib', 'roomTalker() roomTalk(%s, %s)', room, contact)

    for (const option of optoinList) {
      if (typeof option === 'string') {
        if (contact) {
          await room.say(option, contact)
        } else {
          await room.say(option)
        }
      } else if (option instanceof Function) {
        await option(room, contact)
      } else {
        throw new Error('roomTalker option unknown: ' + option)
      }
      await room.wechaty.sleep(5 * 1000)
    }
  }
}

import {
  log,
  Room,
  Wechaty,
}             from 'wechaty'

type RoomFinderOption        = string | RegExp
export type RoomFinderOptions = RoomFinderOption | RoomFinderOption[]

type RoomFinderFunction = (wechaty: Wechaty) => Room[] | Promise<Room[]>

export function roomFinder (options?: RoomFinderOptions): RoomFinderFunction {
  log.verbose('WechatyPluginContrib', 'roomFinder(%s)', JSON.stringify(options))

  if (!options) {
    return () => []
  }

  if (!Array.isArray(options)) {
    options = [ options ]
  }

  const optoinList = options

  return async function roomFind (wechaty: Wechaty): Promise<Room[]> {
    log.silly('WechatyPluginContrib', 'roomFinder() roomFind(%s)', wechaty)

    const allRoomList: Room[] = []

    for (const option of optoinList) {
      if (typeof option === 'string') {
        const room = wechaty.Room.load(option)
        await room.ready()
        allRoomList.push(room)
      } else if (option instanceof RegExp) {
        allRoomList.push(...await wechaty.Room.findAll({ topic: option }))
      } else {
        throw new Error('option is unknown: ' + option)
      }
    }

    const dedupedRoomList = [...new Set(allRoomList.filter(Boolean))]
    return dedupedRoomList
  }
}

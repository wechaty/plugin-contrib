import {
  log,
  Room,
  Wechaty,
}             from 'wechaty'

type RoomFinderFunction       = (wechaty: Wechaty) => Room[] | Promise<Room[]>
type RoomFinderOption         = string | RegExp | RoomFinderFunction
export type RoomFinderOptions = RoomFinderOption | RoomFinderOption[]

export function roomFinder (options?: RoomFinderOptions): RoomFinderFunction {
  log.verbose('WechatyPluginContrib', 'roomFinder(%s)', JSON.stringify(options))

  if (!options) {
    return () => []
  }

  if (!Array.isArray(options)) {
    options = [ options ]
  }

  const optionList = options

  return async function findRoom (wechaty: Wechaty): Promise<Room[]> {
    log.silly('WechatyPluginContrib', 'roomFinder() roomFind(%s)', wechaty)

    const allRoomList: Room[] = []

    for (const option of optionList) {
      if (typeof option === 'string') {
        const room = wechaty.Room.load(option)
        await room.ready()
        allRoomList.push(room)
      } else if (option instanceof RegExp) {
        allRoomList.push(...await wechaty.Room.findAll({ topic: option }))
      } else if (option instanceof Function) {
        allRoomList.push(...await option(wechaty))
      } else {
        throw new Error('option is unknown: ' + option)
      }
    }

    const dedupedRoomList = [...new Set(allRoomList.filter(Boolean))]
    return dedupedRoomList
  }
}

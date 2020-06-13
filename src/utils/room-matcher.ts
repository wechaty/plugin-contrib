import {
  Room,
  log,
}             from 'wechaty'

type RoomMatcherFunction      = (room: Room) => boolean | Promise<boolean>
type RoomMatcherOption        = string | RegExp | RoomMatcherFunction
export type RoomMatcherOptions = RoomMatcherOption | RoomMatcherOption[]

export function roomMatcher (
  matcherOptions?: RoomMatcherOptions,
) {
  log.verbose('WechatyPluginContrib', 'roomMatcher(%s)', JSON.stringify(matcherOptions))

  if (!matcherOptions) {
    return (..._: any[]) => false
  }

  if (!Array.isArray(matcherOptions)) {
    matcherOptions = [ matcherOptions ]
  }

  const matcherOptionList = matcherOptions

  return async function matchRoom (room: Room): Promise<boolean> {
    log.silly('WechatyPluginContrib', 'roomMatcher() matchRoom(%s)', room)

    for (const option of matcherOptionList) {
      if (typeof option === 'string') {
        return option === room.id
      } else if (option instanceof Function) {
        return option(room)
      } else if (option instanceof RegExp) {
        return option.test(await room.topic())
      } else {
        throw new Error('unknown option: ' + option)
      }
    }
    return false
  }
}

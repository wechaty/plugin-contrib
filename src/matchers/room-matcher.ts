import {
  Room,
  log,
}             from 'wechaty'

/**
 * string here should be the room id only.
 * topic should use the RegExp as the filter
 */
type RoomMatcherFunction       = (room: Room) => boolean | Promise<boolean>
type RoomMatcherOption         = boolean | string | RegExp | RoomMatcherFunction
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

    let isMatch = false
    for (const option of matcherOptionList) {
      if (typeof option === 'boolean') {
        isMatch = option
      } else if (typeof option === 'string') {
        isMatch = option === room.id
      } else if (option instanceof Function) {
        isMatch = await option(room)
      } else if (option instanceof RegExp) {
        isMatch = option.test(await room.topic())
      } else {
        throw new Error('unknown option: ' + option)
      }

      if (isMatch) {
        return true
      }

    }
    // no match
    return false
  }
}

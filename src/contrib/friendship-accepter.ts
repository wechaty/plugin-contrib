/**
 * Author: Huan LI https://github.com/huan
 * Date: Jun 2020
 */
import {
  Wechaty,
  WechatyPlugin,
  log,
  type,
}                   from 'wechaty'

import {
  StringMatcherOptions,
  stringMatcher,
}                         from '../matchers/mod.js'
import {
  contactTalker,
  ContactTalkerOptions,
}                         from '../talkers/mod.js'

export interface FriendshipAccepterConfig {
  greeting?: ContactTalkerOptions,
  keyword?: StringMatcherOptions,
}

export function FriendshipAccepter (
  config: FriendshipAccepterConfig = {},
): WechatyPlugin {
  log.verbose('WechatyPluginContrib', 'FriendshipAccepter("%s")', JSON.stringify(config))

  const doGreeting     = contactTalker(config.greeting)
  const isMatchKeyword = config.keyword
    ? stringMatcher(config.keyword)
    : () => true  // accept all invitations if there's no keyword set.

  return function FriendshipAccepterPlugin (wechaty: Wechaty) {
    log.verbose('WechatyPluginContrib', 'FriendshipAccepterPlugin installing on %s ...', wechaty)

    wechaty.on('friendship', async friendship => {
      log.verbose('WechatyPluginContrib', 'FriendshipAccepterPlugin wechaty.on(friendship) %s', friendship)

      const friendshipType = friendship.type()

      switch (friendshipType) {
        case type.Friendship.Receive:
          {
            const hello = friendship.hello()
            if (await isMatchKeyword(hello)) {
              await friendship.accept()
            }
          }
          break

        case type.Friendship.Confirm:
          {
            const contact = friendship.contact()
            await doGreeting(contact)
          }
          break

        case type.Friendship.Verify:
          // This is for when we send a message to others, but they did not accept us as a friend.
          break

        default:
          throw new Error('friendshipType unknown: ' + friendshipType)
      }
    })
  }

}

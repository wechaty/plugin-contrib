/**
 * Author: Huan LI https://github.com/huan
 * Date: Jun 2020
 */
import {
  Wechaty,
  WechatyPlugin,
  log,
  // Contact,
  Friendship,
}                   from 'wechaty'

import {
  StringMatcherOptions,
  stringMatcher,
}                         from '../matchers/'
import {
  contactTalker,
  ContactTalkerOptions,
}                         from '../talkers/'

// type GreetingFunction = (contact: Contact) => Promise<void>
// type GreetingOption   = string | GreetingFunction
// export type GreetingOptions  = GreetingOption | GreetingOption[]

// type KeywordFunction = (keyword: string) => boolean | Promise<boolean>
// export type KeywordOptions = string | RegExp | KeywordFunction

export interface FriendshipAccepterConfig {
  greeting?: ContactTalkerOptions, // GreetingOptions,
  keyword?: StringMatcherOptions,
}

// function matchKeywordConfig (config: FriendshipAccepterConfig) {
//   log.verbose('WechatyPluginContrib', 'FriendshipAccepter() MatchKeywordConfig({keyword: %s})',
//     JSON.stringify(config.keyword),
//   )

//   const configKeyword = config.keyword

//   return async function (keyword: string): Promise<boolean> {
//     if (!configKeyword) {
//       return true
//     } else if (typeof configKeyword === 'string') {
//       return keyword === configKeyword
//     } else if (configKeyword instanceof RegExp) {
//       return configKeyword.test(keyword)
//     } else if (configKeyword instanceof Function) {
//       return configKeyword(keyword)
//     }

//     throw new Error('configKeyword is unknown: ' + configKeyword)
//   }
// }

// function doGreetingConfig (config: FriendshipAccepterConfig) {
//   log.verbose('WechatyPluginContrib', 'FriendshipAccepter() doGreetingConfig({greeting: %s})',
//     JSON.stringify(config.greeting),
//   )

//   const configGreeting = config.greeting

//   return async function (contact: Contact): Promise<void> {
//     if (!configGreeting) {
//       // no Greeting
//     } else if (typeof configGreeting === 'string') {
//       await contact.say(configGreeting)
//     } else if (configGreeting instanceof Function) {
//       await configGreeting(contact)
//     } else if (Array.isArray(configGreeting)) {
//       for (const greeting of configGreeting) {
//         if (typeof greeting === 'string') {
//           await contact.say(greeting)
//         } else if (greeting instanceof Function) {
//           await greeting(contact)
//         } else {
//           throw new Error('greeting unknown: ' + greeting)
//         }
//         await new Promise(resolve => setTimeout(resolve, 1000))
//       }
//     }
//   }
// }

export function FriendshipAccepter (
  config: FriendshipAccepterConfig = {},
): WechatyPlugin {
  log.verbose('WechatyPluginContrib', 'FriendshipAccepter("%s")', JSON.stringify(config))

  const doGreeting     = contactTalker(config.greeting) // doGreetingConfig(config)
  const isMatchKeyword = stringMatcher(config.keyword) // matchKeywordConfig(config)

  return function FriendshipAccepterPlugin (wechaty: Wechaty) {
    log.verbose('WechatyPluginContrib', 'FriendshipAccepter installing on %s ...', wechaty)

    wechaty.on('friendship', async friendship => {
      log.verbose('WechatyPluginContrib', 'FriendshipAccepter wechaty.on(friendship) %s', friendship)

      const friendshipType = friendship.type()

      switch (friendshipType) {
        case Friendship.Type.Receive:
          const hello = friendship.hello()
          if (await isMatchKeyword(hello)) {
            await friendship.accept()
          }
          break

        case Friendship.Type.Confirm:
          const contact = friendship.contact()
          await doGreeting(contact)
          break

        case Friendship.Type.Verify:
          // This is for when we send a message to others, but they did not accept us as a friend.
          break

        default:
          throw new Error('friendshipType unknown: ' + friendshipType)
      }
    })
  }

}

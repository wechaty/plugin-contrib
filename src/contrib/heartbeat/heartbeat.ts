/**
 * Author: Huan LI https://github.com/huan
 * Date: May 2020
 */
import {
  Wechaty,
  WechatyPlugin,
}                   from 'wechaty'

import {
  log,
}                 from '../../config'

import { getTalkerList } from './get-talker-list'
import { getEmoji } from './get-emoji'

import {
  HeartbeatOptions,
  buildOptions,
}                     from './options'

export function Heartbeat (
  options?: Partial<HeartbeatOptions>,
): WechatyPlugin {
  log.verbose('WechatyPluginContrib', 'Heartbeat("%s")', JSON.stringify(options))

  const normalizedOptions = buildOptions(options)

  return async (wechaty: Wechaty): Promise<void> => {
    log.verbose('WechatyPluginContrib', 'Heartbeat installing on %s ...', wechaty)

    const talkerList = [
      ...await getTalkerList(wechaty, normalizedOptions.contact),
      ...await getTalkerList(wechaty, normalizedOptions.room),
    ]

    if (normalizedOptions.emoji.heartbeat) {
      setInterval(
        async () => {
          const emojiHeartbeat = await getEmoji(wechaty, normalizedOptions.emoji.heartbeat)
          if (emojiHeartbeat) {
            await Promise.all(
              talkerList.map(talker => talker.say(emojiHeartbeat)),
            )
          }
        },
        normalizedOptions.intervalSeconds * 1000,
      )
    }

    if (normalizedOptions.emoji.login) {
      wechaty.on('login', async () => {
        const emojiLogin = await getEmoji(wechaty, normalizedOptions.emoji.login)
        if (emojiLogin) {
          await Promise.all(
            talkerList.map(talker => talker.say(emojiLogin)),
          )
        }
      })

    }

    if (normalizedOptions.emoji.ready) {
      wechaty.on('ready', async () => {
        const emojiReady = await getEmoji(wechaty, normalizedOptions.emoji.ready)
        if (emojiReady) {
          await Promise.all(
            talkerList.map(talker => talker.say(emojiReady)),
          )
        }
      })
    }

    if (normalizedOptions.emoji.logout) {
      wechaty.on('logout', async () => {
        /**
         * Fail gracefully
         *  the `logout` event might received after the bot logout,
         *  for example, the bot was kicked offline by the user.
         *
         * So it might not be able to `say` anymore.
         */
        const emojiLogout = await getEmoji(wechaty, normalizedOptions.emoji.logout)
        if (emojiLogout) {
          try {
            await Promise.all(
              talkerList.map(talker => talker.say(emojiLogout)),
            )
          } catch (e) {
            log.error('WechatyPluginContrib', 'Heartbeat logout event rejection: %s', e)
            console.error(e)
          }
        }
      })
    }

  }

}

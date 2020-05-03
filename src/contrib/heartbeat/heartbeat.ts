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
import { Sayable } from 'wechaty/dist/src/types'
import { sayEmoji } from './say-emoji'

export function Heartbeat (
  options?: Partial<HeartbeatOptions>,
): WechatyPlugin {
  log.verbose('WechatyPluginContrib', 'Heartbeat("%s")', JSON.stringify(options))

  const normalizedOptions = buildOptions(options)

  return async (wechaty: Wechaty): Promise<void> => {
    log.verbose('WechatyPluginContrib', 'Heartbeat installing on %s ...', wechaty)

    let talkerList: Sayable[] = []
    wechaty.once('login', async () => {
      talkerList = [
        ...await getTalkerList(wechaty, normalizedOptions.contact),
        ...await getTalkerList(wechaty, normalizedOptions.room),
      ]
    })

    if (normalizedOptions.emoji.heartbeat) {
      setInterval(
        async () => {
          const emojiHeartbeat = await getEmoji(wechaty, normalizedOptions.emoji.heartbeat)
          if (emojiHeartbeat) {
            await Promise.all(
              talkerList.map(async talker => {
                if (talker.wechaty.logonoff()) {
                  await talker.say(emojiHeartbeat)
                }
              }),
            )
          }
        },
        normalizedOptions.intervalSeconds * 1000,
      )
    }

    if (normalizedOptions.emoji.login) {
      const emojiOption = normalizedOptions.emoji.login
      wechaty.on('login', sayEmoji(talkerList, emojiOption))
    }

    if (normalizedOptions.emoji.ready) {
      const emojiOption = normalizedOptions.emoji.ready
      wechaty.on('ready', sayEmoji(talkerList, emojiOption))
    }

    if (normalizedOptions.emoji.logout) {
      /**
       * Fail gracefully
       *  the `logout` event might received after the bot logout,
       *  for example, the bot was kicked offline by the user.
       *
       * So it might not be able to `say` anymore.
       */
      const emojiOption = normalizedOptions.emoji.logout
      wechaty.on('logout', sayEmoji(talkerList, emojiOption))
    }

  }

}

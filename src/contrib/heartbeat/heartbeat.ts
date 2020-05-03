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

import {
  HeartbeatOptions,
  buildOptions,
}                     from './options'
import { Sayable } from 'wechaty/dist/src/types'
import { sayEmoji } from './say-emoji'

function heartbeatManager () {
  let timer: undefined | NodeJS.Timer

  return (
    talkerList : Sayable[],
    options    : HeartbeatOptions,
  ) => {

    const emojiHeartbeatOption = options.emoji?.heartbeat

    if (!emojiHeartbeatOption) {
      return
    }

    if (timer) {
      clearInterval(timer)
      timer = undefined
    }

    timer = setInterval(
      sayEmoji('heartbeat', talkerList, emojiHeartbeatOption),
      options.intervalSeconds * 1000,
    )
  }

}

export function Heartbeat (
  options?: Partial<HeartbeatOptions>,
): WechatyPlugin {
  log.verbose('WechatyPluginContrib', 'Heartbeat("%s")', JSON.stringify(options))

  const normalizedOptions = buildOptions(options)

  const setupHeartbeat = heartbeatManager()

  return async (wechaty: Wechaty): Promise<void> => {
    log.verbose('WechatyPluginContrib', 'Heartbeat installing on %s ...', wechaty)

    let talkerList: Sayable[] = []

    wechaty.on('login', async () => {
      talkerList = [
        ...await getTalkerList(wechaty, normalizedOptions.contact),
        ...await getTalkerList(wechaty, normalizedOptions.room),
      ]

      setupHeartbeat(talkerList, normalizedOptions)

      /**
       * Login Heartbeat
       */
      if (normalizedOptions.emoji.login) {
        const emojiLoginOption = normalizedOptions.emoji.login
        await sayEmoji('login', talkerList, emojiLoginOption)()
      }
    })

    if (normalizedOptions.emoji.ready) {
      const emojiOption = normalizedOptions.emoji.ready
      wechaty.on('ready', sayEmoji('ready', talkerList, emojiOption))
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
      wechaty.on('logout', sayEmoji('logout', talkerList, emojiOption))
    }

  }

}

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
    log.verbose('WechatyPluginContrib', 'Heartbeat heartbeatManager...')

    const emojiHeartbeatOption = options.emoji?.heartbeat

    if (!emojiHeartbeatOption) {
      log.silly('WechatyPluginContrib', 'Heartbeat heartbeatManager no emoji heartbeat option')
      return
    }

    if (timer) {
      log.silly('WechatyPluginContrib', 'Heartbeat heartbeatManager cleaning previous timer')
      clearInterval(timer)
      timer = undefined
    }

    timer = setInterval(
      sayEmoji('heartbeat', talkerList, emojiHeartbeatOption),
      options.intervalSeconds * 1000,
    )
    log.silly('WechatyPluginContrib', 'Heartbeat heartbeatManager new timer set')
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
      log.verbose('WechatyPluginContrib', 'Heartbeat wechaty.on(login)')

      talkerList = [
        ...await getTalkerList(wechaty, normalizedOptions.contact),
        ...await getTalkerList(wechaty, normalizedOptions.room),
      ]
      log.verbose('WechatyPluginContrib', 'Heartbeat talkerList numbers: %s', talkerList.length)

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
      log.verbose('WechatyPluginContrib', 'Heartbeat setting `ready` event')

      const emojiOption = normalizedOptions.emoji.ready
      wechaty.on('ready', sayEmoji('ready', talkerList, emojiOption))
    }

    if (normalizedOptions.emoji.logout) {
      log.verbose('WechatyPluginContrib', 'Heartbeat setting `logout` event')
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

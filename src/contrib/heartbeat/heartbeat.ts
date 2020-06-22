/**
 * Author: Huan LI https://github.com/huan
 * Date: May 2020
 */
import {
  Wechaty,
  WechatyPlugin,
  Sayable,
}                   from 'wechaty'

import {
  log,
}                 from '../../config'

import {
  roomFinder,
  contactFinder,
}                           from '../../finders/mod'

import {
  HeartbeatConfig,
  buildConfig,
}                        from './options'
import { sayEmoji }       from './say-emoji'

function heart () {
  let timer: undefined | NodeJS.Timer

  const cleanTimer = () => {
    if (timer) {
      log.silly('WechatyPluginContrib', 'Heartbeat heart() cleanTimer() cleaning previous timer')
      clearInterval(timer)
      timer = undefined
    }
  }

  return (
    talkerList : Sayable[],
    config    : HeartbeatConfig,
  ) => {
    log.verbose('WechatyPluginContrib', 'Heartbeat heart()...')

    const emojiHeartbeatOption = config.emoji?.heartbeat

    if (!emojiHeartbeatOption) {
      log.silly('WechatyPluginContrib', 'Heartbeat heart() no emoji heartbeat option')
      return cleanTimer
    }

    cleanTimer()

    timer = setInterval(
      sayEmoji('heartbeat', talkerList, emojiHeartbeatOption),
      config.intervalSeconds * 1000,
    )
    log.silly('WechatyPluginContrib', 'Heartbeat heart() new timer set')

    return cleanTimer
  }

}

export function Heartbeat (
  config?: Partial<HeartbeatConfig>,
): WechatyPlugin {
  log.verbose('WechatyPluginContrib', 'Heartbeat("%s")', JSON.stringify(config))

  const normalizedConfig = buildConfig(config)

  const heartbeat = heart()

  const getContactList = contactFinder(normalizedConfig.contact)
  const getRoomList    = roomFinder(normalizedConfig.room)

  return function HeartbeatPlugin (wechaty: Wechaty): void {
    log.verbose('WechatyPluginContrib', 'Heartbeat installing on %s ...', wechaty)

    let talkerList: Sayable[] = []

    wechaty.on('login', async () => {
      log.verbose('WechatyPluginContrib', 'Heartbeat wechaty.on(login)')

      talkerList = [
        ...await getContactList(wechaty),
        ...await getRoomList(wechaty),
      ]
      log.verbose('WechatyPluginContrib', 'Heartbeat talkerList numbers: %s', talkerList.length)

      const cleanTimer = heartbeat(talkerList, normalizedConfig)
      wechaty.once('logout', cleanTimer)

      /**
       * Login Heartbeat
       */
      if (normalizedConfig.emoji.login) {
        const emojiLoginOption = normalizedConfig.emoji.login
        await sayEmoji('login', talkerList, emojiLoginOption)()
      }
    })

    if (normalizedConfig.emoji.ready) {
      log.verbose('WechatyPluginContrib', 'Heartbeat setting `ready` event')

      const emojiOption = normalizedConfig.emoji.ready
      wechaty.on('ready', sayEmoji('ready', talkerList, emojiOption))
    }

    if (normalizedConfig.emoji.logout) {
      log.verbose('WechatyPluginContrib', 'Heartbeat setting `logout` event')
      /**
       * Fail gracefully
       *  the `logout` event might received after the bot logout,
       *  for example, the bot was kicked offline by the user.
       *
       * So it might not be able to `say` anymore.
       */
      const emojiOption = normalizedConfig.emoji.logout
      wechaty.on('logout', sayEmoji('logout', talkerList, emojiOption))
    }

  }

}

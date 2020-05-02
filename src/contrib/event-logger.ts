/**
 * Author: Huan LI https://github.com/huan
 * Date: Apr 2020
 */
import {
  Wechaty,
  WechatyPlugin,
  log,
}                   from 'wechaty'

import {
  PUPPET_EVENT_DICT,
}                     from 'wechaty-puppet'

type EventType = keyof typeof PUPPET_EVENT_DICT

type EventLoggerOptions = EventType[]

export function EventLogger (
  options: EventLoggerOptions = [],
): WechatyPlugin {
  log.verbose('WechatyPluginContrib', 'EventLogger("%s")', JSON.stringify(options))

  return (wechaty: Wechaty) => {
    log.verbose('WechatyPluginContrib', 'EventLogger installing on %s ...', wechaty)

    for (const key of Object.keys(PUPPET_EVENT_DICT)) {
      const eventName = key as EventType
      if (!options.includes(eventName)) {
        continue
      }

      wechaty.on(eventName as any, (...args: any[]) => {
        log.info('WechatyPluginContrib', 'EventLogger %s: %s', eventName, String(args))
      })

    }
  }
}

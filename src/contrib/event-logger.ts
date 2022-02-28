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
}                     from 'wechaty-puppet/types'

type EventType = keyof typeof PUPPET_EVENT_DICT

export type EventLoggerConfig = EventType[]

export function EventLogger (
  config: EventLoggerConfig = [],
): WechatyPlugin {
  log.verbose('WechatyPluginContrib', 'EventLogger("%s")', JSON.stringify(config))

  return function EventLoggerPlugin (wechaty: Wechaty) {
    log.verbose('WechatyPluginContrib', 'EventLogger installing on %s ...', wechaty)

    for (const key of Object.keys(PUPPET_EVENT_DICT)) {
      const eventName = key as EventType
      if (config.length > 0 && !config.includes(eventName)) {
        continue
      }

      wechaty.on(eventName as any, (...args: any[]) => {
        log.info('WechatyPluginContrib', 'EventLoggerPlugin() %s: %s', eventName, JSON.stringify(args))
        if (eventName === 'error') {
          console.error(args[0])
        }
      })

    }
  }
}

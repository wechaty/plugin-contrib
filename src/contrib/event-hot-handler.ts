/**
 * Author: Huan LI https://github.com/huan
 * Date: Jun 2020
 */
import {
  Wechaty,
  WechatyPlugin,
  log,
}                   from 'wechaty'

import { WechatyEventName } from 'wechaty/dist/src/wechaty'

import {
  callerResolve,
  hotImport,
}                   from 'hot-import'

export type EventHotHandlerConfig = {
  [event in WechatyEventName]?: string
}

export function EventHotHandler (
  config: EventHotHandlerConfig,
): WechatyPlugin {
  log.verbose('WechatyPluginContrib', 'EventHotHandler("%s")', JSON.stringify(config))

  const absolutePathConfig: EventHotHandlerConfig = {}

  for (const key of Object.keys(config)) {
    const eventName  = key as WechatyEventName
    const modulePath = config[eventName]

    if (modulePath) {
      const absoluteFilename = callerResolve(modulePath, __filename)
      absolutePathConfig[eventName] = absoluteFilename
    }
  }

  return function EventHotHandlerPlugin (wechaty: Wechaty): void {
    log.verbose('WechatyPluginContrib', 'EventHotHandler installing on %s ...', wechaty)

    for (const key of Object.keys(absolutePathConfig)) {
      const eventName        = key as WechatyEventName
      const absoluteFilename = absolutePathConfig[eventName]

      if (absoluteFilename) {
        addEventHandler(
          wechaty,
          eventName,
          absoluteFilename,
        ).catch(e => log.error('WechatyPluginContrib', 'EventHotHandler EventHotHandlerPlugin(%s, %s, %s) rejection: %s',
          wechaty, eventName, absoluteFilename, e,
        ))
      }

    }
  }
}

async function addEventHandler (
  wechaty          : Wechaty,
  eventName        : WechatyEventName,
  absoluteFilename : string,
) {
  try {
    const eventHandler = await hotImport(absoluteFilename)
    wechaty.on(eventName as any, (...args: any[]) => {
      try {
        return eventHandler.apply(wechaty, args)
      } catch (e) {
        log.error('WechatyPluginContrib', 'EventHotHandler EventHotHandlerPlugin(%s) listener(%s) exception%s',
          wechaty, eventName, e,
        )
        wechaty.emit('error', e)
      }
    })
  } catch (e) {
    log.error('WechatyPluginContrib', 'EventHotHandler EventHotHandlerPlugin() eventName(%s) hotImport(%s) rejection: %s',
      eventName, absoluteFilename, e,
    )
    wechaty.emit('error', e)
  }
}

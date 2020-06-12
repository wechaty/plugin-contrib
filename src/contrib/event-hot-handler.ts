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

type AnyFunction = (...args: any[]) => any

export type EventHotHandlerConfig = {
  [event in WechatyEventName]: string
}

export function EventHotHandler (
  config: EventHotHandlerConfig,
): WechatyPlugin {
  log.verbose('WechatyPluginContrib', 'EventHotHandler("%s")', JSON.stringify(config))

  return function EventHotHandlerPlugin (wechaty: Wechaty) {
    log.verbose('WechatyPluginContrib', 'EventHotHandler installing on %s ...', wechaty)

    for (const key of Object.keys(config)) {
      const eventName  = key as WechatyEventName
      const modulePath = config[eventName]

      if (modulePath) {
        addListenerModuleFile(wechaty, eventName, modulePath)
      }
    }
  }
}

function addListenerModuleFile (
  wechaty    : Wechaty,
  event      : WechatyEventName,
  modulePath : string,
): void {
  const absoluteFilename = callerResolve(modulePath, __filename)
  log.verbose('WechatyPluginContrib', 'EventHotHandler addListenerModuleFile() hotImport(%s)', absoluteFilename)

  hotImport(absoluteFilename)
    .then((func: AnyFunction) => wechaty.on(event as any, (...args: any[]) => {
      try {
        return func.apply(wechaty, args)
      } catch (e) {
        log.error('WechatyPluginContrib', 'EventHotHandler addListenerModuleFile(%s, %s) listener exception: %s',
          event, modulePath, e,
        )
        wechaty.emit('error', e)
      }
    }))
    .catch(e => {
      log.error('WechatyPluginContrib', 'EventHotHandler addListenerModuleFile(%s, %s) hotImport() rejection: %s',
        event, modulePath, e,
      )
      wechaty.emit('error', e)
    })
}

import {
  Wechaty,
}                   from 'wechaty'

import { Sayable } from 'wechaty/dist/src/types'

import {
  log,
}                 from '../../config'

import {
  SayableOption,
}                 from './options'

export async function getTalkerList (
  wechaty  : Wechaty,
  config? : SayableOption,
): Promise<Sayable[]> {
  log.verbose('WechatyPluginContrib', 'Heartbeat getTalkerList(%s, %s)', wechaty, JSON.stringify(config))

  if (!config) {
    return []
  }

  let talkerList: Sayable[] = []

  if (typeof config === 'function') {
    talkerList = talkerList.concat(
      await config(wechaty)
    )
  } else if (typeof config === 'string') {
    talkerList.push(idToSayable(wechaty, config))
  } else if (Array.isArray(config)) {
    talkerList = talkerList.concat(
      idToSayable(wechaty, config)
    )
  } else {
    throw new Error('unknown config type: ' + typeof config)
  }

  return talkerList
}

function idToSayable (wechaty: Wechaty, id: string): Sayable
function idToSayable (wechaty: Wechaty, idList: string[]): Sayable[]

function idToSayable (
  wechaty: Wechaty,
  id: string | string[],
): Sayable | Sayable[] {
  if (Array.isArray(id)) {
    return id.map(id => idToSayable(wechaty, id))
  }

  /**
   * Huan(202005) FIXME: how to differenciate room & contact id here?
   */
  if (/@/.test(id)) {
    return wechaty.Room.load(id)
  } else {
    return wechaty.Contact.load(id)
  }
}

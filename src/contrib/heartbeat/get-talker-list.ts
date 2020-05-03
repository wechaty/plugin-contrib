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
  options? : SayableOption,
): Promise<Sayable[]> {
  log.verbose('WechatyPluginContrib', 'Heartbeat getTalkerList(%s, %s)', wechaty, JSON.stringify(options))

  if (!options) {
    return []
  }

  let talkerList: Sayable[] = []

  if (typeof options === 'function') {
    talkerList = talkerList.concat(
      await options(wechaty)
    )
  } else if (typeof options === 'string') {
    talkerList.push(idToSayable(wechaty, options))
  } else if (Array.isArray(options)) {
    talkerList = talkerList.concat(
      idToSayable(wechaty, options)
    )
  } else {
    throw new Error('unknown options type: ' + typeof options)
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

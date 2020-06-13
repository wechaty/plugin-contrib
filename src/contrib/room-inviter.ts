/**
 * Author: Huan LI https://github.com/huan
 * Date: Jun 2020
 */
import {
  Wechaty,
  WechatyPlugin,
  log,
  Room,
  Contact,
}                   from 'wechaty'

import {
  ContactTalkerOptions,
  RoomTalkerOptions,
  StringMatcherOptions,
  contactTalker,
  roomTalker,
  stringMatcher,
  roomFinder,
}                           from '../utils/'

type RoomOption = string | RegExp
export type RoomOptions = RoomOption | RoomOption[]

export interface RoomInviterConfig {
  password : StringMatcherOptions,
  room     : RoomOptions,

  welcome? : RoomTalkerOptions,
  rule?    : ContactTalkerOptions,
  repeat?  : ContactTalkerOptions,
}

// export function getRoomListConfig (config: RoomInviterConfig) {
//   log.verbose('WechatyPluginContrib', 'RoomInviter() getRoomConfig({room: %s})',
//     JSON.stringify(config.password),
//   )

//   const configRoom = config.room

//   const cachedRoomList = [] as Room[]

//   return async function getRoomList (wechaty: Wechaty): Promise<Room[]> {
//     log.verbose('WechatyPluginContrib', 'RoomInviter() getRoomConfig() getRoomList(%s) cachedRoomList.length=%s',
//       wechaty,
//       cachedRoomList.length,
//     )
//     if (cachedRoomList.length > 0) {
//       return cachedRoomList
//     }

//     cachedRoomList.push(...await getRawRoomList(wechaty))
//     return cachedRoomList
//   }

// async function getRawRoomList (wechaty: Wechaty): Promise<Room[]> {
//   log.verbose('WechatyPluginContrib', 'RoomInviter() getRoomConfig() getRawRoomList(%s)', wechaty)

//   if (Array.isArray(configRoom)) {
//     const list = [] as Room[]

//     for (const config of configRoom) {
//       list.push(...await roomItem(config))
//     }
//     return list
//   }

//   return [ ...await roomItem(configRoom) ]

//   async function roomItem (config: RoomOption): Promise<Room[]> {
//     log.verbose('WechatyPluginContrib', 'RoomInviter() getRoomConfig() roomItem(%s)',
//       JSON.stringify(config),
//     )

//     let localRoomList: Room[]
//     if (typeof config === 'string') {
//       localRoomList = [ wechaty.Room.load(config) ]
//     } else if (config instanceof RegExp) {
//       localRoomList = await wechaty.Room.findAll({ topic: config })
//     } else {
//       throw new Error('config is unknown: ' + config)
//     }
//     localRoomList.forEach(room => room.on('join', (inviteeList) => {
//       inviteeList.forEach(invitee => doWelcome(room, invitee))
//     }))
//     return localRoomList
//   }
// }
// }

export function RoomInviter (
  config: RoomInviterConfig,
): WechatyPlugin {
  log.verbose('WechatyPluginContrib', 'RoomInviter("%s")', JSON.stringify(config))

  const isMatchPassword = stringMatcher(config.password)
  const showRule        = contactTalker(config.rule)
  const getRoomList     = roomFinder(config.room)
  const warnRepeat      = contactTalker(config.repeat)

  const doWelcome = roomTalker(config.welcome)

  return function RoomInviterPlugin (wechaty: Wechaty) {
    log.verbose('WechatyPluginContrib', 'RoomInviter installing on %s ...', wechaty)

    const welcomeId: {
      [roomId: string]: {
        [contactId: string]: boolean
      }
    } = {}

    wechaty.on('room-join', async (room: Room, inviteeList: Contact[], inviter: Contact) => {
      if (inviter.id !== wechaty.self().id) { return }
      if (!(room.id in welcomeId))          { return }

      for (const contact of inviteeList) {
        if (contact.id in welcomeId[room.id]) {
          await doWelcome(room, contact)
          delete welcomeId[room.id][contact.id]
        }
      }
    })

    wechaty.on('message', async message => {
      log.verbose('WechatyPluginContrib', 'RoomInviterPlugin wechaty.on(message) %s', message)

      if (message.room() || message.self())               { return }
      if (message.type() !== wechaty.Message.Type.Text)   { return }
      if (!await isMatchPassword(message.text()))          { return }

      const contact = message.from()
      if (!contact) { return }

      await showRule(contact)
      await wechaty.sleep(1000)

      const roomList = await getRoomList(wechaty)
      if (roomList.length <= 0) {
        log.verbose('WechatyPluginContrib', 'RoomInviterPlugin wechaty.on(message) getRoomList() empty')
        return
      }

      for (const room of roomList) {
        log.verbose('WechatyPluginContrib', 'RoomInviterPlugin inviting %s to %s', contact, room)

        if (await room.has(contact)) {
          log.verbose('WechatyPluginContrib', 'RoomInviterPlugin %s has already in %s', contact, room)
          await warnRepeat(contact)
        } else {
          /**
            * Set to trigger the welcome message
            */
          welcomeId[room.id][contact.id] = true
          await room.add(contact)
          await wechaty.sleep(1000)
        }

        await wechaty.sleep(1000)
      }
    })
  }

}

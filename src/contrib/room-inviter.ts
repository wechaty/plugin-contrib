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
  contactTalker,
  roomTalker,
}                           from '../talkers/mod'
import {
  StringMatcherOptions,
  stringMatcher,
}                           from '../matchers/mod'
import {
  RoomFinderOptions,
  roomFinder,
}                           from '../finders/mod'

export interface RoomInviterConfig {
  password : StringMatcherOptions,
  room     : RoomFinderOptions,

  welcome? : RoomTalkerOptions,
  rule?    : ContactTalkerOptions,
  repeat?  : ContactTalkerOptions,
}

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
          await room.wechaty.sleep(1000)
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

      const targetRoom = await selectRoomWithLeastMembers(roomList)

      log.verbose('WechatyPluginContrib', 'RoomInviterPlugin inviting %s to %s', contact, targetRoom)

      if (await targetRoom.has(contact)) {
        log.verbose('WechatyPluginContrib', 'RoomInviterPlugin %s has already in %s', contact, targetRoom)
        await warnRepeat(contact, targetRoom)
      }

      /**
        * Set to trigger the welcome message
        */
      welcomeId[targetRoom.id] = {
        ...welcomeId[targetRoom.id],
        [contact.id]: true,
      }
      await targetRoom.add(contact)
      await wechaty.sleep(1000)
    })
  }

}

async function selectRoomWithLeastMembers (roomList: Room[]): Promise<Room> {
  log.verbose('WechatyPluginContrib', 'RoomInviterPlugin selectRoomWithLeastMembers(roomList.length=%s)', roomList.length)

  if (roomList.length <= 0) {
    throw new Error('roomList is empty')
  }

  const roomMemberNumList = await Promise.all(roomList.map(
    room => room.memberAll()
      .then(list => list.length)
  ))

  let info = ''
  for (let i = 0; i < roomList.length; i++) {
    const topic = await roomList[i].topic()
    const num   = roomMemberNumList[i]

    info += `${topic}(${num}),`
  }

  log.verbose('WechatyPluginContrib', 'RoomInviterPlugin selectRoomWithLeastMembers() %s', info)

  const minNum = Math.min(...roomMemberNumList)
  const minIdx = roomMemberNumList.indexOf(minNum)

  return roomList[minIdx]
}

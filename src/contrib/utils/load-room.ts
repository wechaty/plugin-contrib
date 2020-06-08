import {
  Wechaty,
  log,
  Room,
}             from 'wechaty'

async function loadRoom (wechaty: Wechaty, roomId: string)       : Promise<Room>
async function loadRoom (wechaty: Wechaty, roomIdList: string[]) : Promise<Room[]>

async function loadRoom (
  wechaty : Wechaty,
  roomId  : string | string[],
): Promise<Room | Room[]> {
  log.verbose('WechatyPuginContrib', 'loadRoom(%s, %s)', wechaty, JSON.stringify(roomId))

  if (Array.isArray(roomId)) {
    return Promise.all(roomId.map(id => loadRoom(wechaty, id)))
  }

  const room = wechaty.Room.load(roomId)
  try {
    await room.ready()
  } catch (e) {
    log.error('WechatyPluginContrib', 'loadRoom(%s, %s) room.ready() rejection: %s', wechaty, JSON.stringify(roomId), e)
  }

  return room
}

export { loadRoom }

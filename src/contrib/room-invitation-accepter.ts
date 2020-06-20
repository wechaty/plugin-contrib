/**
 * Author: Huan LI https://github.com/huan
 * Date: Jun 2020
 */
import {
  Wechaty,
  WechatyPlugin,
  log,
}                   from 'wechaty'

export function RoomInvitationAccepter (): WechatyPlugin {
  log.verbose('WechatyPluginContrib', 'RoomInvitationAccepter()')

  return function RoomInvitationAccepterPlugin (wechaty: Wechaty) {
    log.verbose('WechatyPluginContrib', 'RoomInvitationAccepter installing on %s ...', wechaty)

    wechaty.on('room-invite', async roomInvitation => {
      log.verbose('WechatyPluginContrib', 'RoomInvitationAccepter wechaty.on(room-invite) %s', roomInvitation)

      const topic = await roomInvitation.topic()
      const inviter = await roomInvitation.inviter()

      log.verbose('WechatyPluginContrib', 'RoomInvitationAccepter %s invite bot to %s room', inviter, topic)
      await roomInvitation.accept()
    })
  }

}

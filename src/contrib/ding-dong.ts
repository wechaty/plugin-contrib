import {
  Wechaty,
  WechatyPlugin,
  Message,
  log,
}                   from 'wechaty'

interface DingDongOptions {
  at   : boolean,
  dm   : boolean,
  room : boolean,
}

export function DingDong (
  options: DingDongOptions = {
    at: false,
    dm: true,
    room: true,
  },
): WechatyPlugin {
  log.verbose('WechatyPluginContrib', 'DingDong("%s")', JSON.stringify(options))

  void options

  return (wechaty: Wechaty) => {
    log.verbose('WechatyPluginContrib', 'DingDong installing on %s ...', wechaty)

    wechaty.on('message', async message => {
      if (message.type() !== Message.Type.Text) {
        return
      }

      let text = message.text()

      if (message.room()) {
        if (!options.room) {
          return
        }

        if (options.at) {
          if (!await message.mentionSelf()) {
            return
          }
          text = await message.mentionText()
        }
      } else {  // Direct Message
        if (!options.dm) {
          return
        }
      }

      if (/^ding$/i.test(text)) {
        await message.say('dong')
      }
    })
  }

}

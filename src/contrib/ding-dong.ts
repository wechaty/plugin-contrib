import {
  Wechaty,
  WechatyPlugin,
  Message,
  log,
}                   from 'wechaty'

interface DingDongOptions {
}

export function DingDong (
  options: DingDongOptions = {},
): WechatyPlugin {
  log.verbose('WechatyPlugin', 'DingDong("%s")', JSON.stringify(options))

  void options

  return (wechaty: Wechaty) => {
    log.verbose('WechatyPlugin', 'DingDong installing on %s ...', JSON.stringify(options))

    wechaty.on('message', async message => {
      if (message.type() !== Message.Type.Text) {
        return
      }

      if (/^ding$/i.test(message.text())) {
        await message.say('dong')
      }
    })
  }

}

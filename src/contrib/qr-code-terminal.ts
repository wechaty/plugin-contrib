import {
  Wechaty,
  WechatyPlugin,
  ScanStatus,
  log,
}                   from 'wechaty'

import { generate } from 'qrcode-terminal'

interface QRCodeTerminalOptions {
  small?: boolean,
}

export function QRCodeTerminal (
  options: QRCodeTerminalOptions = {
    small: false,
  },
): WechatyPlugin {
  log.verbose('WechatyPluginContrib', 'QRCodeTerminal("%s")', JSON.stringify(options))

  return (wechaty: Wechaty) => {
    log.verbose('WechatyPluginContrib', 'QRCodeTerminal installing on %s ...', wechaty)

    wechaty.on('scan', function onScan (qrcode: string, status: ScanStatus) {
      if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
        generate(qrcode, {
          small: options.small,
        })

        /**
         * Generate a QR Code online via
         *  http://goqr.me/api/doc/create-qr-code/
         */
        const qrcodeImageUrl = [
          'https://api.qrserver.com/v1/create-qr-code/?data=',
          encodeURIComponent(qrcode),
        ].join('')

        log.info('WechatyPluginContrib', 'QRCodeTerminal Login QR Code Status: %s(%s)\nQR Code Image URL: %s', ScanStatus[status], status, qrcodeImageUrl)
      } else {
        log.info('WechatyPluginContrib', 'QRCodeTerminal onScan: %s(%s)', ScanStatus[status], status)
      }
    })
  }

}

/**
 * Author: Huan LI https://github.com/huan
 * Date: Apr 2020
 */
import {
  Wechaty,
  WechatyPlugin,
  ScanStatus,
  log,
}                   from 'wechaty'

import { generate } from 'qrcode-terminal'

export interface QRCodeTerminalConfig {
  small?: boolean,
}

export function QRCodeTerminal (
  config: QRCodeTerminalConfig = {
    small: false,
  },
): WechatyPlugin {
  log.verbose('WechatyPluginContrib', 'QRCodeTerminal("%s")', JSON.stringify(config))

  return function QRCodeTerminalPlugin (wechaty: Wechaty) {
    log.verbose('WechatyPluginContrib', 'QRCodeTerminal installing on %s ...', wechaty)

    wechaty.on('scan', function onScan (qrcode: string, status: ScanStatus) {
      if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
        generate(qrcode, {
          small: config.small,
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

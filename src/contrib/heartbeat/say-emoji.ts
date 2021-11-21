import type { SayableSayer } from 'wechaty'

import { log } from '../../config.js'

import type { EmojiOption }  from './options.js'
import { getEmoji }     from './get-emoji.js'

export function sayEmoji (
  event       : string,
  talkerList  : SayableSayer[],
  emojiOption : EmojiOption,
) {
  return async () => {
    log.verbose('WechatyPluginContrib', 'Heartbeat sayEmoji(%s)', event)

    if (talkerList.length <= 0) {
      return
    }

    const wechaty = talkerList[0]!.wechaty

    const emojiText = await getEmoji(event, wechaty, emojiOption)
    if (!emojiText) {
      return
    }

    for (const talker of talkerList) {
      if (!talker.wechaty.isLoggedIn) {
        log.verbose('WechatyPluginContrib', 'Heartbeat sayEmoji %s is logoff', talker)
        continue
      }

      try {
        await talker.say(emojiText)
      } catch (e) {
        wechaty.emitError(e)
      }
    }

  }
}

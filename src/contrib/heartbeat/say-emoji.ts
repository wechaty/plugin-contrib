import { Sayable } from 'wechaty'

import { EmojiOption }  from './options'
import { getEmoji }     from './get-emoji'

export function sayEmoji (
  talkerList  : Sayable[],
  emojiOption : EmojiOption,
) {
  return async () => {

    if (talkerList.length <= 0) {
      return
    }

    const wechaty = talkerList[0].wechaty

    const emojiText = await getEmoji(wechaty, emojiOption)
    if (!emojiText) {
      return
    }

    for (const talker of talkerList) {
      try {
        await talker.say(emojiText)
      } catch (e) {
        wechaty.emit('error', e)
      }
    }

  }
}

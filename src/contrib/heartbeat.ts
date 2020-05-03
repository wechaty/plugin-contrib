/**
 * Author: Huan LI https://github.com/huan
 * Date: May 2020
 */
import {
  Wechaty,
  WechatyPlugin,
  log,
}                   from 'wechaty'

import { Sayable } from 'wechaty/dist/src/types'

type FindTalkerFunction = (wechaty: Wechaty) => Sayable | Sayable[] | Promise<Sayable> | Promise<Sayable[]>
type HeartbeatFunction  = (wechaty: Wechaty) => string | Promise<string>

type SayableOption = string | string[] | FindTalkerFunction
type EmojiOption   = string | HeartbeatFunction

/**
 * heartbeat: [爱心]
 */
interface EmojiSetting {
  login     : EmojiOption,
  logout    : EmojiOption,
  ready     : EmojiOption,
  heartbeat : EmojiOption,
}

interface HeartbeatOptions {
  contact?        : SayableOption,
  room?           : SayableOption,
  emoji           : Partial<EmojiSetting>,
  intervalSeconds : number,
}

const DEFAULT_CONTACT_ID       = 'filehelper'
const DEFAULT_INTERVAL_SECONDS = 60 * 60       // 1 Hour

const DEFAULT_HEARTBEAT_OPTIONS: HeartbeatOptions = {
  contact: DEFAULT_CONTACT_ID,
  emoji: {
    heartbeat: '[爱心]',
  },
  intervalSeconds : DEFAULT_INTERVAL_SECONDS,
}

export function Heartbeat (
  options?: Partial<HeartbeatOptions>,
): WechatyPlugin {
  log.verbose('WechatyPluginContrib', 'Heartbeat("%s")', JSON.stringify(options))

  const normalizedOptions: HeartbeatOptions = {
    ...DEFAULT_HEARTBEAT_OPTIONS,
    ...options,
    emoji: {
      ...DEFAULT_HEARTBEAT_OPTIONS.emoji,
      ...options?.emoji,
    },
  }

  return async (wechaty: Wechaty): Promise<void> => {
    log.verbose('WechatyPluginContrib', 'Heartbeat installing on %s ...', wechaty)

    const talkerList = [
      ...await getTalkerList(wechaty, options?.contact),
      ...await getTalkerList(wechaty, options?.room),
    ]

    if (normalizedOptions.emoji.heartbeat) {
      setInterval(
        async () => {
          const emojiHeartbeat = await getEmoji(wechaty, normalizedOptions.emoji.heartbeat)
          if (emojiHeartbeat) {
            await Promise.all(
              talkerList.map(talker => talker.say(emojiHeartbeat)),
            )
          }
        },
        normalizedOptions.intervalSeconds * 1000,
      )
    }

    if (normalizedOptions.emoji.login) {
      wechaty.on('login', async () => {
        const emojiLogin = await getEmoji(wechaty, normalizedOptions.emoji.login)
        if (emojiLogin) {
          await Promise.all(
            talkerList.map(talker => talker.say(emojiLogin)),
          )
        }
      })

    }

    if (normalizedOptions.emoji.ready) {
      wechaty.on('ready', async () => {
        const emojiReady = await getEmoji(wechaty, normalizedOptions.emoji.ready)
        if (emojiReady) {
          await Promise.all(
            talkerList.map(talker => talker.say(emojiReady)),
          )
        }
      })
    }

    if (normalizedOptions.emoji.logout) {
      wechaty.on('logout', async () => {
        /**
         * Fail gracefully
         *  the `logout` event might received after the bot logout,
         *  for example, the bot was kicked offline by the user.
         *
         * So it might not be able to `say` anymore.
         */
        const emojiLogout = await getEmoji(wechaty, normalizedOptions.emoji.logout)
        if (emojiLogout) {
          try {
            await Promise.all(
              talkerList.map(talker => talker.say(emojiLogout)),
            )
          } catch (e) {
            log.error('WechatyPluginContrib', 'Heartbeat logout event rejection: %s', e)
            console.error(e)
          }
        }
      })
    }

  }

}

async function getEmoji (
  wechaty : Wechaty,
  emoji?  : EmojiOption,
): Promise<void | string> {
  log.verbose('WechatyPluginContrib', 'Heartbeat getEmoji()')

  if (!emoji) {
    return
  }

  if (typeof emoji === 'string') {
    return emoji
  }

  if (typeof emoji === 'function') {
    return emoji(wechaty)
  }

  throw new Error('unknown emoji optoins type: ' + typeof emoji)
}

async function getTalkerList (
  wechaty  : Wechaty,
  options? : SayableOption,
): Promise<Sayable[]> {
  log.verbose('WechatyPluginContrib', 'Heartbeat getTalkerList(%s, %s)', wechaty, JSON.stringify(options))

  if (!options) {
    return []
  }

  let talkerList: Sayable[] = []

  if (typeof options === 'function') {
    talkerList = talkerList.concat(
      await options(wechaty)
    )
  } else if (typeof options === 'string') {
    talkerList.push(idToSayable(wechaty, options))
  } else if (Array.isArray(options)) {
    talkerList = talkerList.concat(
      idToSayable(wechaty, options)
    )
  } else {
    throw new Error('unknown options type: ' + typeof options)
  }

  return talkerList
}

function idToSayable (wechaty: Wechaty, id: string): Sayable
function idToSayable (wechaty: Wechaty, idList: string[]): Sayable[]

function idToSayable (
  wechaty: Wechaty,
  id: string | string[],
): Sayable | Sayable[] {
  if (Array.isArray(id)) {
    return id.map(id => idToSayable(wechaty, id))
  }

  /**
   * Huan(202005) FIXME: how to differenciate room & contact id here?
   */
  if (/@/.test(id)) {
    return wechaty.Room.load(id)
  } else {
    return wechaty.Contact.load(id)
  }
}

import {
  Contact,
  log,
  Room,
}               from 'wechaty'
import Mustache from  'mustache'

type ContactTalkerFunction        = (contact: Contact, room?: Room) => void | string | Promise<void | string>
type ContactTalkerOption          = string | ContactTalkerFunction
export type ContactTalkerOptions  = ContactTalkerOption | ContactTalkerOption[]

export function contactTalker<T = void> (options?: ContactTalkerOptions) {
  log.verbose('WechatyPluginContrib', 'contactTalker(%s)', JSON.stringify(options))

  if (!options) {
    return () => undefined
  }

  if (!Array.isArray(options)) {
    options = [ options ]
  }

  const optionList = options

  return async function talkContact (contact: Contact, room?: Room, mustacheView?: T): Promise<void> {
    log.silly('WechatyPluginContrib', 'contactTalker() talkContact(%s, %s)',
      contact,
      mustacheView
        ? JSON.stringify(mustacheView)
        : '',
    )

    for (const option of optionList) {
      let text
      if (typeof option === 'string') {
        text = option
      } else if (option instanceof Function) {
        text = await option(contact, room)
      } else {
        throw new Error('talkContact() option unknown: ' + option)
      }

      if (text) {
        if (mustacheView) {
          text = Mustache.render(text, mustacheView)
        }
        await contact.say(text)
      }

      await contact.wechaty.sleep(5 * 1000)
    }
  }
}

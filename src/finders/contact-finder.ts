import {
  log,
  Contact,
  Wechaty,
}             from 'wechaty'

type ContactFinderFunction        = (wechaty: Wechaty) => Contact[] | Promise<Contact[]>
type ContactFinderOption          = string | RegExp | ContactFinderFunction
export type ContactFinderOptions  = ContactFinderOption | ContactFinderOption[]

export function contactFinder (options?: ContactFinderOptions): ContactFinderFunction {
  log.verbose('WechatyPluginContrib', 'contactFinder(%s)', JSON.stringify(options))

  if (!options) {
    return () => []
  }

  if (!Array.isArray(options)) {
    options = [ options ]
  }

  const optionList = options

  return async function findContact (wechaty: Wechaty): Promise<Contact[]> {
    log.silly('WechatyPluginContrib', 'contactFinder() contactFind(%s)', wechaty)

    const allContactList: Contact[] = []

    for (const option of optionList) {
      if (typeof option === 'string') {
        const contact = wechaty.Contact.load(option)
        await contact.ready()
        allContactList.push(contact)
      } else if (option instanceof RegExp) {
        allContactList.push(...await wechaty.Contact.findAll({ name: option }))
        allContactList.push(...await wechaty.Contact.findAll({ alias: option }))
      } else if (option instanceof Function) {
        allContactList.push(...await option(wechaty))
      } else {
        throw new Error('option is unknown: ' + option)
      }
    }

    const dedupedContactList = [...new Set(allContactList.filter(Boolean))]
    return dedupedContactList
  }
}

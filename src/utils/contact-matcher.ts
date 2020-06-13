import {
  Contact,
  log,
}             from 'wechaty'

type ContactMatcherFunction = (contact: Contact) => boolean | Promise<boolean>
type ContactMatcherOption   = string | RegExp | ContactMatcherFunction
export type ContactMatcherOptions = ContactMatcherOption | ContactMatcherOption[]

export function contactMatcher (
  matcherOptions?: ContactMatcherOptions,
) {
  log.verbose('WechatyPluginContrib', 'contactMatcher(%s)', JSON.stringify(matcherOptions))

  if (!matcherOptions) {
    return (..._: any[]) => false
  }

  if (!Array.isArray(matcherOptions)) {
    matcherOptions = [ matcherOptions ]
  }

  const matcherOptionList = matcherOptions

  return async function matchContact (contact: Contact): Promise<boolean> {
    log.silly('WechatyPluginContrib', 'contactMatcher() matchContact(%s)', contact)

    for (const option of matcherOptionList) {
      if (typeof option === 'string') {
        return option === contact.id
      } else if (option instanceof Function) {
        return option(contact)
      } else if (option instanceof RegExp) {
        return option.test(contact.name())
      } else {
        throw new Error('unknown option: ' + option)
      }
    }
    return false
  }
}

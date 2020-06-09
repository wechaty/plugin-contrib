/**
 * Author: Huan LI https://github.com/huan
 * Date: Jun 2020
 */
import {
  Wechaty,
  WechatyPlugin,
  log,
  Contact,
  Room,
}                   from 'wechaty'

/**
 * string here should be the room id only.
 * topic should use the RegExp as the filter
 */
type RoomOption = string | RegExp
export type RoomOptions = RoomOption | RoomOption[]

type PasswordOption = string | RegExp
export type PasswordOptions = PasswordOption | PasswordOption[]

type WelcomeFunction = (room: Room, contact: Contact) => void | Promise<void>
type WelcomeOption = string | WelcomeFunction
export type WelcomeOptions = WelcomeOption | WelcomeOption[]

type RuleFunction = (contact: Contact) => void | Promise<void>
type RuleOption = string | RuleFunction
export type RuleOptions = RuleOption | RuleOption[]

export interface RoomInviterConfig {
  password : PasswordOptions,
  room     : RoomOptions,

  welcome? : WelcomeOptions,
  rule?    : RuleOptions,
}

export function getRoomListConfig (config: RoomInviterConfig) {
  log.verbose('WechatyPluginContrib', 'RoomInviter() getRoomConfig({room: %s})',
    JSON.stringify(config.password),
  )

  const configRoom = config.room

  const doWelcome = showWelcomeConfig(config)

  const roomList = [] as Room[]

  return async function getRoomList (wechaty: Wechaty): Promise<Room[]> {
    if (roomList.length > 0) {
      return roomList
    }

    if (Array.isArray(configRoom)) {
      for (const config of configRoom) {
        const list = await roomItem(config)
        roomList.push(...list)
      }
      return roomList
    }

    return [ ...await roomItem(configRoom) ]

    async function roomItem (config: RoomOption): Promise<Room[]> {
      let localRoomList: Room[]
      if (typeof config === 'string') {
        localRoomList = [ wechaty.Room.load(config) ]
      } else if (config instanceof RegExp) {
        localRoomList = await wechaty.Room.findAll({ topic: config })
      } else {
        throw new Error('config is unknown: ' + config)
      }
      localRoomList.forEach(room => room.on('join', (inviteeList) => {
        inviteeList.forEach(invitee => doWelcome(room, invitee))
      }))
      return localRoomList
    }
  }
}

export function matchPasswordConfig (config: RoomInviterConfig) {
  log.verbose('WechatyPluginContrib', 'RoomInviter() matchPasswordConfig({password: %s})',
    JSON.stringify(config.password),
  )

  const configPassword = config.password

  return async function matchPassword (text: string): Promise<boolean> {
    if (Array.isArray(configPassword)) {
      for (const config of configPassword) {
        if (await matchItem(config, text)) {
          return true
        }
      }
      return false
    }

    return matchItem(configPassword, text)

    async function matchItem (config: PasswordOption, text: string): Promise<boolean> {
      if (!config) {
        return false
      } else if (typeof config === 'string') {
        return text === config
      } else if (config instanceof RegExp) {
        return config.test(text)
      }
      throw new Error('configPassword is unknown: ' + config)
    }
  }
}

export function showWelcomeConfig (config: RoomInviterConfig) {
  log.verbose('WechatyPluginContrib', 'RoomInviter() showWelcomeConfig({welcome: %s})',
    JSON.stringify(config.welcome),
  )

  const configWelcome = config.welcome

  return async function (room: Room, contact: Contact): Promise<void> {
    if (!configWelcome) {
      // no Greeting
      return
    }

    if (Array.isArray(configWelcome)) {
      for (const welcome of configWelcome) {
        await welcomeItem(welcome, room, contact)
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      return
    }

    await welcomeItem(configWelcome, room, contact)

    async function welcomeItem (welcome: WelcomeOption, room: Room, contact: Contact): Promise<void> {
      if (typeof welcome === 'string') {
        await room.say(welcome, contact)
      } else if (welcome instanceof Function) {
        await welcome(room, contact)
      } else {
        throw new Error('configWelcome unknown: ' + welcome)
      }
    }
  }
}

export function showRuleConfig (config: RoomInviterConfig) {
  log.verbose('WechatyPluginContrib', 'RoomInviter() showRuleConfig({rule: %s})',
    JSON.stringify(config.rule),
  )

  const configRule = config.rule

  return async function (contact: Contact): Promise<void> {
    if (!configRule) {
      // no Greeting
      return
    }

    if (Array.isArray(configRule)) {
      for (const rule of configRule) {
        await ruleItem(rule, contact)
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      return
    }

    await ruleItem(configRule, contact)

    async function ruleItem (rule: RuleOption, contact: Contact): Promise<void> {
      if (typeof rule === 'string') {
        await contact.say(rule)
      } else if (rule instanceof Function) {
        await rule(contact)
      } else {
        throw new Error('configRule unknown: ' + rule)
      }
    }
  }
}

export function RoomInviter (
  config: RoomInviterConfig,
): WechatyPlugin {
  log.verbose('WechatyPluginContrib', 'RoomInviter("%s")', JSON.stringify(config))

  const isMatchPassword = matchPasswordConfig(config)
  const showRule        = showRuleConfig(config)
  const getRoomList     = getRoomListConfig(config)

  return function RoomInviterPlugin (wechaty: Wechaty) {
    log.verbose('WechatyPluginContrib', 'RoomInviter installing on %s ...', wechaty)

    wechaty.on('message', async message => {
      log.verbose('WechatyPluginContrib', 'RoomInviterPlugin wechaty.on(message) %s', message)

      if (message.room())                                 { return }
      if (message.type() !== wechaty.Message.Type.Text)   { return }
      if (!await isMatchPassword(message.text()))         { return }

      const roomList = await getRoomList(wechaty)
      if (roomList.length <= 0) {
        log.verbose('WechatyPluginContrib', 'RoomInviterPlugin wechaty.on(message) getRoomList() empty')
        return
      }

      const contact = message.from()
      if (!contact) { return }

      await showRule(contact)
      for (const room of roomList) {
        log.verbose('WechatyPluginContrib', 'RoomInviterPlugin inviting %s to %s', contact, room)
        await room.add(contact)
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    })
  }

}

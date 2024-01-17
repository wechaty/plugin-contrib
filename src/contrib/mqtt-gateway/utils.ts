/* eslint-disable sort-keys */
import { v4 } from 'uuid'

export function getCurrentTime (timestamp?: number) {
  const now = timestamp ? new Date(timestamp) : new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const day = now.getDate()
  const hour = now.getHours()
  const minute = now.getMinutes()
  const second = now.getSeconds()
  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`
}

// 定义枚举值commandName
export type commandName =
  'wechatyLogonoff' |
  'wechatyLogout' |
  'wechatySay' |
  'wechatyStart' |
  'wechatyStop' |
  'wechatyUserSelf' |

  'send' |
  'sendAt' |

  'messageFind' |
  'messageFindAll' |
  'messageSay' |
  'messageToRecalled' |

  'contactAdd' |
  'contactAliasSet' |
  'contactFind' |
  'contactFindAll' |
  'contactSay' |
  'contactAliasGet' |
  'contacAliasSet' |

  'roomAdd' |
  'roomAliasGet' |
  'roomAnnounceGet' |
  'roomAnnounceSet' |
  'roomCreate' |
  'roomDel' |
  'roomFind' |
  'roomFindAll' |
  'roomHas' |
  'roomInvitationAccept' |
  'roomInvitationFindAll' |
  'roomInvitationInviter' |
  'roomMemberAllGet' |
  'roomMemberGet' |
  'roomQrcodeGet' |
  'roomQuit' |
  'roomSay' |
  'roomSayAt' |
  'roomTopicGet' |
  'roomTopicSet' |
  'roomTopicgGet' |

  'friendshipAccept' |
  'friendshipAdd' |
  'friendshipSearch'

export type CommandInfo = {
  reqId: string,
  method: string,
  version: string,
  timestamp: number,
  name: commandName,
  params: any,
}

export const getCommandTemplate = () => {
  const commandInfo: CommandInfo = {
    reqId: v4(),
    method: 'response',
    version: '1.0',
    timestamp: new Date().getTime(),
    name: 'wechatyLogonoff',
    params: {},
  }
  return commandInfo
}

export type ResponseInfo = {
  reqId: string,
  method: string,
  version: string,
  timestamp: number,
  name: commandName,
  code: number,
  message: string
  params: any,
}

export const getResponseTemplate = () => {
  const responseInfo: ResponseInfo = {
    reqId: v4(),
    method: 'response',
    version: '1.0',
    timestamp: new Date().getTime(),
    name: 'wechatyLogonoff',
    code: 200,
    message: 'success',
    params: {},
  }
  return responseInfo
}

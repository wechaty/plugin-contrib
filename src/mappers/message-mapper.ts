import {
  Message,
  log,
}                 from 'wechaty'

import {
  SayableMessage,
}                 from '../types/mod'

type MessageMapperFunction = (message: Message) =>  SayableMessage
                                                  | SayableMessage[]
                                                  | Promise<
                                                        SayableMessage
                                                      | SayableMessage[]
                                                    >
type MessageMapperOption         = SayableMessage | MessageMapperFunction
export type MessageMapperOptions = MessageMapperOption | MessageMapperOption[]

function messageMapper (
  mapperOptions: MessageMapperOptions,
) {
  log.verbose('WechatyPluginContrib', 'messageMapper(%s)', JSON.stringify(mapperOptions))

  return async function mapMessage (message: Message): Promise<SayableMessage[]> {
    log.verbose('WechatyPluginContrib', 'mapMessage(%s)', message)

    return normalizeMappedMessageList(mapperOptions, message)
  }
}

async function normalizeMappedMessageList (
  options: MessageMapperOptions,
  message: Message,
): Promise<SayableMessage[]> {
  log.verbose('WechatyPluginContrib', 'normalizeMappedMessageList(%s, %s)',
    JSON.stringify(options),
    message,
  )

  let msgList = [] as SayableMessage[]

  let optionList
  if (Array.isArray(options)) {
    optionList = options
  } else {
    optionList = [ options ]
  }

  for (const option of optionList) {
    if (!option) { continue }

    if (typeof option === 'function') {
      const ret = await option(message)
      if (ret) {
        msgList.push(...await normalizeMappedMessageList(ret, message))
      }
    } else {
      msgList.push(option)
    }
  }

  return msgList
}

export {
  messageMapper,
}

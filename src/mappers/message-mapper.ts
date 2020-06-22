import {
  Contact,
  Message,
  FileBox,
  UrlLink,
  MiniProgram,
  log,
}               from 'wechaty'

/**
 * 1. `undefined` means drop the message
 * 1. `Message` means forward the original message
 */
export type MappedMessage =   undefined
                            | Message
                            | string
                            | FileBox
                            | Contact
                            | UrlLink
                            | MiniProgram
type MessageMapperFunction = (message: Message) =>  MappedMessage
                                                  | MappedMessage[]
                                                  | Promise<
                                                        MappedMessage
                                                      | MappedMessage[]
                                                    >
type MessageMapperOption         = MappedMessage | MessageMapperFunction
export type MessageMapperOptions = MessageMapperOption | MessageMapperOption[]

function messageMapper (
  mapperOptions: MessageMapperOptions,
) {
  log.verbose('WechatyPluginContrib', 'messageMapper(%s)', JSON.stringify(mapperOptions))

  return async function mapMessage (message: Message): Promise<MappedMessage[]> {
    log.verbose('WechatyPluginContrib', 'mapMessage(%s)', message)

    return normalizeMappedMessageList(mapperOptions, message)
  }
}

async function normalizeMappedMessageList (
  options: MessageMapperOptions,
  message: Message,
): Promise<MappedMessage[]> {
  log.verbose('WechatyPluginContrib', 'normalizeMappedMessageList(%s, %s)',
    JSON.stringify(options),
    message,
  )

  let msgList = [] as MappedMessage[]

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

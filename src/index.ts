import * as finders   from './finders/'
import * as matchers  from './matchers/'
import * as talkers   from './talkers/'

/**
 * Plugin utility helper functions
 */
export {
  finders,
  matchers,
  talkers,
}

export { VERSION } from './config'

export {
  validatePlugin,
}                   from './validate-plugin'

export {
  DingDong,
  DingDongConfig,
}                                     from './contrib/ding-dong/'
export {
  Heartbeat,
  HeartbeatConfig,
}                                     from './contrib/heartbeat/'
export {
  OneToManyRoomConnector,
  OneToManyRoomConnectorConfig,
  ManyToOneRoomConnector,
  ManyToOneRoomConnectorConfig,
  ManyToManyRoomConnector,
  ManyToManyRoomConnectorConfig,
  RoomConnectorMessageMapFunction,
}                                     from './contrib/room-connector/'
export {
  QRCodeTerminal,
  QRCodeTerminalConfig,
}                             from './contrib/qr-code-terminal'
export {
  EventLogger,
  EventLoggerConfig,
}                             from './contrib/event-logger'
export {
  ChatOps,
  ChatOpsConfig,
}                             from './contrib/chatops'
export {
  FriendshipAccepter,
  FriendshipAccepterConfig,
}                             from './contrib/friendship-accepter'
export {
  RoomInviter,
  RoomInviterConfig,
}                             from './contrib/room-inviter'
export {
  EventHotHandler,
  EventHotHandlerConfig,
}                             from './contrib/event-hot-handler'
export {
  RoomInvitationAccepter,
}                             from './contrib/room-invitation-accepter'

export {
  MessageAwaiter,
}                             from './contrib/message-awaiter'

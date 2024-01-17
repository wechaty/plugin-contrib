import * as finders   from './finders/mod.js'
import * as matchers  from './matchers/mod.js'
import * as talkers   from './talkers/mod.js'
import * as mappers   from './mappers/mod.js'
import * as types     from './types/mod.js'

import { VERSION } from './config.js'

import {
  validatePlugin,
}                   from './validate-plugin.js'

import {
  DingDong,
  DingDongConfig,
}                                     from './contrib/ding-dong/mod.js'
import {
  Heartbeat,
  HeartbeatConfig,
}                                     from './contrib/heartbeat/mod.js'
import {
  OneToManyRoomConnector,
  OneToManyRoomConnectorConfig,
  ManyToOneRoomConnector,
  ManyToOneRoomConnectorConfig,
  ManyToManyRoomConnector,
  ManyToManyRoomConnectorConfig,
  SourceToTargetRoomConnector,
  SourceToTargetRoomConnectorConfig,
}                                     from './contrib/room-connector/mod.js'
import {
  QRCodeTerminal,
  QRCodeTerminalConfig,
}                             from './contrib/qr-code-terminal.js'
import {
  EventLogger,
  EventLoggerConfig,
}                             from './contrib/event-logger.js'

import {
  MqttGateway,
  MqttGatewayConfig,
  getKeyByBasicString,
}                             from './contrib/mqtt-gateway/mod.js'

import {
  ChatOps,
  ChatOpsConfig,
}                             from './contrib/chatops.js'
import {
  FriendshipAccepter,
  FriendshipAccepterConfig,
}                             from './contrib/friendship-accepter.js'
import {
  RoomInviter,
  RoomInviterConfig,
}                             from './contrib/room-inviter.js'
import {
  RoomInvitationAccepter,
}                             from './contrib/room-invitation-accepter.js'
import {
  messagePrompter,
}                             from './contrib/message-prompter.js'

export type {
  ChatOpsConfig,
  DingDongConfig,
  EventLoggerConfig,
  FriendshipAccepterConfig,
  HeartbeatConfig,
  ManyToManyRoomConnectorConfig,
  ManyToOneRoomConnectorConfig,
  MqttGatewayConfig,
  OneToManyRoomConnectorConfig,
  QRCodeTerminalConfig,
  RoomInviterConfig,
  SourceToTargetRoomConnectorConfig,
}
export {
  ChatOps,
  DingDong,
  EventLogger,
  FriendshipAccepter,
  Heartbeat,
  ManyToManyRoomConnector,
  ManyToOneRoomConnector,
  MqttGateway,
  getKeyByBasicString,
  messagePrompter,
  OneToManyRoomConnector,
  QRCodeTerminal,
  RoomInvitationAccepter,
  RoomInviter,
  SourceToTargetRoomConnector,
  validatePlugin,
  VERSION,
}
/**
 * Plugin utility helper functions
 */
export {
  finders,
  matchers,
  mappers,
  talkers,
  types,
}

#!/usr/bin/env ts-node

import test  from 'tstest'

import * as contrib from './mod'

test('Make sure the module export list is expected', async (t) => {
  t.ok(contrib.DingDong, 'should has #1 DingDong')
  t.ok(contrib.EventLogger, 'should has #2 EventLogger')
  t.ok(contrib.QRCodeTerminal, 'should has #3 QRCodeTerminal')
  t.ok(contrib.Heartbeat, 'should has #4 Heartbeat')
  t.ok(contrib.ChatOps, 'should has #5 ChatOps')
  t.ok(contrib.OneToManyRoomConnector, 'should has #6.1 OneToManyRoomConnector')
  t.ok(contrib.ManyToOneRoomConnector, 'should has #6.2 ManyToOneRoomConnector')
  t.ok(contrib.ManyToManyRoomConnector, 'should has #6.3 ManyToManyRoomConnector')
  t.ok(contrib.FriendshipAccepter, 'should has #7 FriendshipAccepter')
  t.ok(contrib.RoomInviter, 'should has #8 RoomInviter')
  t.ok(contrib.EventHotHandler, 'should has #9 EventHotHandler')
})

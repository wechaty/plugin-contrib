#!/usr/bin/env ts-node

import test  from 'tstest'

import * as contrib from './index'

test('Make sure the module export list is expected', async (t) => {
  t.ok(contrib.ChatOps, 'should has ChatOps')
  t.ok(contrib.DingDong, 'should has DingDong')
  t.ok(contrib.EventLogger, 'should has EventLogger')
  t.ok(contrib.Heartbeat, 'should has Heartbeat')
  t.ok(contrib.QRCodeTerminal, 'should has QRCodeTerminal')
})

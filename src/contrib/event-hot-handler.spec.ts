#!/usr/bin/env ts-node

import test  from 'tstest'

import { Wechaty } from 'wechaty'
import { PuppetMock } from 'wechaty-puppet-mock'

import { EventHotHandler } from './event-hot-handler'

test('EventHotHandler perfect restart testing', async t => {
  const wechaty = new Wechaty({ puppet: new PuppetMock() })

  wechaty.use(EventHotHandler({ message: '../../tests/fixtures/on-message.ts' }))

  await wechaty.start()
  t.pass('should be able to start')
  await wechaty.stop()
  t.pass('should be able to stop after start')

  /**
   * Be aware at here: might leak micro tasks which will prevent the node process exit.
   */
})

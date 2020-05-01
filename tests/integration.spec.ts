#!/usr/bin/env ts-node

import {
  test,
}             from 'tstest'

import {
  DingDong,
}                               from '../src/'
import {
  Wechaty,
}                               from 'wechaty'

import {
  PuppetMock,
}                 from 'wechaty-puppet-mock'

test('integration testing', async (t) => {
  const bot = Wechaty.instance({
    puppet: new PuppetMock(),
  }).use(DingDong())
  t.ok(bot, 'should get a bot')
})

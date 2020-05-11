#!/usr/bin/env ts-node

import {
  test,
}             from 'tstest'

import * as plugins             from '../src/'

import {
  Wechaty,
}                               from 'wechaty'

import {
  PuppetMock,
}                 from 'wechaty-puppet-mock'

test('integration testing', async (t) => {
  const bot = Wechaty.instance({
    puppet: new PuppetMock(),
  }).use(plugins.DingDong())
  t.ok(bot, 'should get a bot')
})

test('plugin name', async t => {
  for (const plugin of Object.values(plugins)) {
    if (typeof plugin !== 'function') {
      continue
    }
    const name = plugin().name
    t.ok(name, 'should be set: ' + plugin.name + ' -> ' + name)
  }
})

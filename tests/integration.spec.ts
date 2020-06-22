#!/usr/bin/env ts-node

import {
  test,
}             from 'tstest'

import * as plugins             from '../src/mod'

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

    if (plugin.name === 'validatePlugin') {
      continue  // our helper functions
    }

    t.doesNotThrow(() => plugins.validatePlugin(plugin), 'plugin ' + plugin.name + ' should be valid')
  }
})

#!/usr/bin/env -S node --no-warnings --loader ts-node/esm

import {
  test,
}             from 'tstest'

import * as plugins             from '../src/mod.js'

import {
  WechatyBuilder,
}                               from 'wechaty'

import {
  PuppetMock,
}                 from 'wechaty-puppet-mock'

test('integration testing', async t => {
  const bot = new WechatyBuilder().options({
    puppet: new PuppetMock(),
  }).build()

  bot.use(plugins.DingDong())
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

    if (plugin.name === 'messagePrompter') {
      continue  // helper function
    }

    t.doesNotThrow(() => plugins.validatePlugin(plugin), 'plugin ' + plugin.name + ' should be valid')
  }
})

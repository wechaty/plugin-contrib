#!/usr/bin/env ts-node

import test  from 'tstest'
// import sinon from 'sinon'

// import { Contact } from 'wechaty'

import {
  PasswordOptions,
  matchPasswordConfig,

  // RoomOptions,
  getRoomListConfig,

  // WelcomeOptions,
  showWelcomeConfig,

  // RuleOptions,
  showRuleConfig,
}                         from './room-inviter'

test('matchPasswordConfig()', async t => {
  const EXPECTED_TEXT = 'text'

  const OPTIONS_TEXT: PasswordOptions     = EXPECTED_TEXT
  const OPTIONS_REGEXP: PasswordOptions   = new RegExp('^' + EXPECTED_TEXT + '$')

  t.true(await matchPasswordConfig({ password: OPTIONS_TEXT, room: 'id' })(EXPECTED_TEXT), 'should match for text by text')
  t.false(await matchPasswordConfig({ password: OPTIONS_TEXT, room: 'id' })(EXPECTED_TEXT + 'xx'), 'should not match for text + xx by text')

  t.true(await matchPasswordConfig({ password: [ OPTIONS_TEXT ], room: 'id' })(EXPECTED_TEXT), 'should match for text by text array')
  t.false(await matchPasswordConfig({ password: [ OPTIONS_TEXT ], room: 'id' })(EXPECTED_TEXT + 'xx'), 'should not match for text + xx by text array ')

  t.true(await matchPasswordConfig({ password: OPTIONS_REGEXP, room: 'id' })(EXPECTED_TEXT), 'should match for text by regexp')
  t.false(await matchPasswordConfig({ password: OPTIONS_REGEXP, room: 'id' })(EXPECTED_TEXT  + 'xx'), 'should not match for text + xx by regexp')

  t.true(await matchPasswordConfig({ password: [ OPTIONS_REGEXP ], room: 'id' })(EXPECTED_TEXT), 'should match for text by regexp array')
  t.false(await matchPasswordConfig({ password: [ OPTIONS_REGEXP ], room: 'id' })(EXPECTED_TEXT  + 'xx'), 'should not match for text + xx by regexp array')
})

test('getRoomListConfig()', async t => {
  void getRoomListConfig
  t.skip('tbd')
})

test('showWelcomeConfig()', async t => {
  void showWelcomeConfig
  t.skip('tbd')
})

test('showRuleConfig()', async t => {
  void showRuleConfig
  t.skip('tbd')
})

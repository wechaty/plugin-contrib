#!/usr/bin/env ts-node

import test  from 'tstest'

import {
  buildConfig,
  // HeartbeatConfig,
}                             from './options'

test('buildConfig()', async (t) => {
  const EXPECTED_CONFIG =  {
    contact: 'filehelper',
    emoji: {
      heartbeat: '[爱心]',
    },
    intervalSeconds: 3600,
  }

  const result = buildConfig()
  t.deepEqual(result, EXPECTED_CONFIG, 'should get default config')
})

test('buildConfig(config)', async (t) => {
  const CONFIG = {
    emoji: {
      heartbeat : '[爱心]',
      login     : '[太阳]',
      logout    : '[月亮]',
      ready     : '[拳头]',
    },
    intervalSeconds: 60,
    room: 'test@chatroom',
  }

  const EXPECTED_CONFIG =  {
    emoji: {
      heartbeat : '[爱心]',
      login     : '[太阳]',
      logout    : '[月亮]',
      ready     : '[拳头]',
    },
    intervalSeconds: 60,
    room: 'test@chatroom',
  }

  const result = buildConfig(CONFIG)
  t.deepEqual(result, EXPECTED_CONFIG, 'should get merged config')
})

test('buildConfig({ room: "id" })', async (t) => {
  const ROOM_ID = '43214123@chatroom'

  const CONFIG =  {
    room: ROOM_ID,
  }

  const result = buildConfig(CONFIG)
  t.equal(result.room, ROOM_ID, 'should set room id for config right')
  t.isNot(result.contact, 'should not have any contact data')
})

#!/usr/bin/env ts-node

import test  from 'tstest'

import {
  buildOptions,
  // HeartbeatOptions,
}                             from './options'

test('buildOptions()', async (t) => {
  const EXPECTED_OPTIONS =  {
    contact: 'filehelper',
    emoji: {
      heartbeat: '[爱心]',
    },
    intervalSeconds: 3600,
  }

  const result = buildOptions()
  t.deepEqual(result, EXPECTED_OPTIONS, 'should get default options')
})

test('buildOptions(options)', async (t) => {
  const OPTIONS = {
    emoji: {
      heartbeat : '[爱心]',
      login     : '[太阳]',
      logout    : '[月亮]',
      ready     : '[拳头]',
    },
    intervalSeconds: 60,
    room: 'test@chatroom',
  }

  const EXPECTED_OPTIONS =  {
    emoji: {
      heartbeat : '[爱心]',
      login     : '[太阳]',
      logout    : '[月亮]',
      ready     : '[拳头]',
    },
    intervalSeconds: 60,
    room: 'test@chatroom',
  }

  const result = buildOptions(OPTIONS)
  t.deepEqual(result, EXPECTED_OPTIONS, 'should get merged options')
})

test('buildOptions({ room: "id" })', async (t) => {
  const ROOM_ID = '43214123@chatroom'

  const OPTIONS =  {
    room: ROOM_ID,
  }

  const result = buildOptions(OPTIONS)
  t.equal(result.room, ROOM_ID, 'should set room id for options right')
  t.isNot(result.contact, 'should not have any contact data')
})

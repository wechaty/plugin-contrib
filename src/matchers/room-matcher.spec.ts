#!/usr/bin/env ts-node

import test  from 'tstest'

import { roomMatcher } from './room-matcher'
import { Room } from 'wechaty'

test('roomMatcher() smoke testing', async t => {
  const matcher = roomMatcher(/test/i)
  t.equal(typeof matcher, 'function', 'should return a match function')
})

test('roomMatcher() with string option', async t => {
  const TEXT_OK     = 'hello'
  const TEXT_NOT_OK = 'world'

  const topicOk    = () => TEXT_OK
  const topicNotOk = () => TEXT_NOT_OK

  const roomIdOk = {
    id: TEXT_OK,
    topic: topicNotOk,
  } as any as Room

  const roomTopicOk = {
    id: TEXT_NOT_OK,
    topic: topicOk,
  } as any as Room

  const roomNotOk = {
    id: TEXT_NOT_OK,
    topic: topicNotOk,
  } as any as Room

  const falseMatcher = roomMatcher()
  t.false(await falseMatcher(roomIdOk), 'should not match any room without options')
  t.false(await falseMatcher(roomTopicOk), 'should not match any room without options')

  const idMatcher = roomMatcher(TEXT_OK)

  t.false(await idMatcher(roomNotOk), 'should not match unexpected room by id')

  t.true(await idMatcher(roomIdOk), 'should match expected room by id')
  t.false(await idMatcher(roomTopicOk), 'should not match room by topic')

  const idListMatcher = roomMatcher([ TEXT_OK ])

  t.false(await idListMatcher(roomNotOk), 'should not match unexpected room by id list')

  t.true(await idListMatcher(roomIdOk), 'should match expected room by id list')
  t.false(await idListMatcher(roomTopicOk), 'should not match room by topic list')

  const regexpMatcher = roomMatcher(new RegExp(TEXT_OK))

  t.false(await regexpMatcher(roomNotOk), 'should not match unexpected room by regexp')

  t.false(await regexpMatcher(roomIdOk), 'should match room id by regexp')
  t.true(await regexpMatcher(roomTopicOk), 'should match expected room topic by regexp')

  const regexpListMatcher = roomMatcher([ new RegExp(TEXT_OK) ])

  t.false(await regexpListMatcher(roomNotOk), 'should not match unexpected room by regexp list')

  t.false(await regexpListMatcher(roomIdOk), 'should not match room id by regexp list')
  t.true(await regexpListMatcher(roomTopicOk), 'should match expected room topic by regexp list')

  const roomFilter = (room: Room) => [
    room.id,
    room.topic(),
  ].includes(TEXT_OK)

  const functionMatcher = roomMatcher(roomFilter)

  t.false(await functionMatcher(roomNotOk), 'should not match unexpected room by function')

  t.true(await functionMatcher(roomTopicOk), 'should match expected topic by function')
  t.true(await functionMatcher(roomIdOk), 'should match expected id by function')

  const functionListMatcher = roomMatcher([ roomFilter ])

  t.false(await functionListMatcher(roomNotOk), 'should not match unexpected room by function list')

  t.true(await functionListMatcher(roomTopicOk), 'should match expected topic by function list')
  t.true(await functionListMatcher(roomIdOk), 'should match expected text by function list')
})

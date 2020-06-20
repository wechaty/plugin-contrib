#!/usr/bin/env ts-node

import test  from 'tstest'
import sinon from 'sinon'

import { Contact, Room } from 'wechaty'

import {
  roomTalker,
  RoomTalkerOptions,
}                             from './room-talker'

test('roomTalker()', async t => {
  const spy2 = sinon.spy()
  const spy3 = sinon.spy()
  const spy4 = sinon.spy()

  const EXPECTED_TEXT = 'text'

  const OPTIONS_TEXT: RoomTalkerOptions = EXPECTED_TEXT
  const OPTIONS_FUNCTION_LIST: RoomTalkerOptions = [spy2, spy3]

  const mockContact = {} as any as Contact
  const mockRoom = {
    say: spy4,
    wechaty: {
      sleep: () => undefined,
    },
  } as any as Room

  let talkRoom = roomTalker(OPTIONS_TEXT)
  spy4.resetHistory()
  await talkRoom(mockRoom, mockContact)
  t.true(spy4.called, 'should called the contact.say')
  t.equal(spy4.args[0][0], EXPECTED_TEXT, 'should say the expected text')
  t.equal(spy4.args[0][1], mockContact, 'should pass contact to say')

  talkRoom = roomTalker(OPTIONS_FUNCTION_LIST)
  spy2.resetHistory()
  spy3.resetHistory()
  await talkRoom(mockRoom, mockContact)
  t.true(spy2.called, 'should called the functions 1')
  t.equal(spy2.args[0][0], mockRoom, 'should called the functions 1/1 with mockRoom')
  t.equal(spy2.args[0][1], mockContact, 'should called the functions 1/2 with mockContact')

  t.true(spy3.called, 'should called the functions 2')
  t.equal(spy3.args[0][0], mockRoom, 'should called the functions 2/1 with contact')
  t.equal(spy3.args[0][1], mockContact, 'should called the functions 2/2 with mockContact')
})

test('roomTalker() with mustache', async t => {
  const EXPECTED_TEXT = 'Hello, world!'
  const OPTIONS_TEXT: RoomTalkerOptions = 'Hello, {{ name }}!'
  const VAR = 'world'

  const spy = sinon.spy()
  const mockContact = {} as any as Contact
  const mockRoom = {
    say: spy,
    wechaty: {
      sleep: () => undefined,
    },
  } as any as Room

  const view = { name: VAR }

  const talkRoom = roomTalker<typeof view>(OPTIONS_TEXT)

  await talkRoom(mockRoom, mockContact, view)
  t.true(spy.called, 'should called the contact.say')
  t.equal(spy.args[0][0], EXPECTED_TEXT, 'should say the expected text')
  t.equal(spy.args[0][1], mockContact, 'should say with mockContact')
})

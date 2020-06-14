#!/usr/bin/env ts-node

import test  from 'tstest'
import sinon from 'sinon'

import { Contact, Room } from 'wechaty'

import {
  roomTalker,
  RoomTalkerOptions,
}                             from './room-talker'

test('roomTalker()', async t => {
  const spy1 = sinon.spy()
  const spy2 = sinon.spy()
  const spy3 = sinon.spy()
  const spy4 = sinon.spy()

  const EXPECTED_TEXT = 'text'

  const OPTIONS_TEXT: RoomTalkerOptions = EXPECTED_TEXT
  const OPTIONS_FUNCTION: RoomTalkerOptions = spy1
  const OPTIONS_FUNCTION_LIST: RoomTalkerOptions = [spy2, spy3]

  const mockContact = {} as any as Contact
  const mockRoom = {
    say: spy4,
    wechaty: {
      sleep: () => undefined,
    },
  } as any as Room

  let talkRoom = roomTalker(OPTIONS_TEXT)
  await talkRoom(mockRoom)
  t.true(spy4.called, 'should called the contact.say')
  t.equal(spy4.args[0][0], EXPECTED_TEXT, 'should say the expected text')
  t.false(spy4.args[0][1], 'should not pass the contact to say')

  spy4.resetHistory()
  await talkRoom(mockRoom, mockContact)
  t.true(spy4.called, 'should called the contact.say')
  t.equal(spy4.args[0][0], EXPECTED_TEXT, 'should say the expected text')
  t.equal(spy4.args[0][1], mockContact, 'should pass contact to say')

  await roomTalker(OPTIONS_FUNCTION)(mockRoom)
  t.true(spy1.called, 'should called the function')
  t.equal(spy1.args[0][0], mockRoom, 'should called the function with mockRoom')

  talkRoom = roomTalker(OPTIONS_FUNCTION_LIST)
  await talkRoom(mockRoom)
  t.true(spy2.called, 'should called the functions 1')
  t.true(spy3.called, 'should called the functions 2')
  t.equal(spy2.args[0][0], mockRoom, 'should called the functions 1 with mockRoom')
  t.equal(spy3.args[0][0], mockRoom, 'should called the functions 2 with mockRoom')

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

  const talkContact = roomTalker<typeof view>(OPTIONS_TEXT)

  await talkContact(mockRoom, mockContact, view)
  t.true(spy.called, 'should called the contact.say')
  t.equal(spy.args[0][0], EXPECTED_TEXT, 'should say the expected text')
  t.equal(spy.args[0][1], mockContact, 'should say with mockContact')

  spy.resetHistory()
  await talkContact(mockRoom, undefined, view)
  t.true(spy.called, 'should called the contact.say')
  t.equal(spy.args[0][0], EXPECTED_TEXT, 'should say the expected text')
  t.false(spy.args[0][1], 'should say without mockContact')

})

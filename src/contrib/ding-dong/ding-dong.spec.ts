#!/usr/bin/env ts-node

import test  from 'tstest'
import sinon from 'sinon'

import {
  Wechaty,
}             from 'wechaty'
import {
  PuppetMock,
}             from 'wechaty-puppet-mock'

import {
  isMatchOptions,
  DingDongOptionsObject,
}                             from './ding-dong'

async function * wechatyFixtures () {
  const sandbox = sinon.createSandbox()

  const wechaty = new Wechaty({ puppet: new PuppetMock() })
  await wechaty.start()
  const message = wechaty.Message.load('mock_message_id')
  const room = wechaty.Room.load('mock_room_id')

  sandbox.stub(message, 'toString').returns('MockMessage')

  yield {
    message,
    room,
    wechaty,
  }

  sandbox.restore()
  await wechaty.stop()
}

test('isMatchOptions {at: true}', async (t) => {
  for await (const {
    message,
    room,
  } of wechatyFixtures()) {
    const OPTIONS = {
      at   : true,
      room : false,
    } as DingDongOptionsObject
    const isMatch = isMatchOptions(OPTIONS)

    const sandbox = sinon.createSandbox()

    sandbox.stub(message, 'room').returns(room)
    const messageMentionSelf = sandbox.stub(message, 'mentionSelf').returns(Promise.resolve(true))

    let result: boolean = await isMatch(message)
    t.equal(result, true, 'should match for room mention self message')

    messageMentionSelf.returns(Promise.resolve(false))
    result = await isMatch(message)
    t.equal(result, false, 'should not match for room non-mention-self message')
  }
})

test('isMatchOptions {at: false}', async (t) => {
  for await (const {
    message,
    room,
  } of wechatyFixtures()) {
    const OPTIONS = {
      at: false,
      room: true,
    } as DingDongOptionsObject
    const isMatch = isMatchOptions(OPTIONS)

    const sandbox = sinon.createSandbox()

    sandbox.stub(message, 'room').returns(room)
    const messageMentionSelf = sandbox.stub(message, 'mentionSelf').returns(Promise.resolve(true))

    let result: boolean = await isMatch(message)
    t.equal(result, true, 'should match for room mention self message')

    messageMentionSelf.returns(Promise.resolve(false))
    result = await isMatch(message)
    t.equal(result, true, 'should match for room non-mention-self message')
  }
})

test('isMatchOptions {room: true}', async (t) => {
  for await (const {
    message,
    room,
  } of wechatyFixtures()) {
    const OPTIONS = {
      dm   : false,
      room : true,
    } as DingDongOptionsObject
    const isMatch = isMatchOptions(OPTIONS)

    const sandbox = sinon.createSandbox()
    const messageRoom = sandbox.stub(message, 'room').returns(room)

    let result: boolean = await isMatch(message)
    t.equal(result, true, 'should match for room message')

    messageRoom.returns(null)
    result = await isMatch(message)
    t.equal(result, false, 'should not match for non-room message')
  }
})

test('isMatchOptions {room: false}', async (t) => {
  for await (const {
    message,
    room,
  } of wechatyFixtures()) {
    const OPTIONS = {
      room: false,
    } as DingDongOptionsObject
    const isMatch = isMatchOptions(OPTIONS)

    const sandbox = sinon.createSandbox()
    sandbox.stub(message, 'mentionSelf').returns(Promise.resolve(false))
    const messageRoom = sandbox.stub(message, 'room').returns(room)

    let result: boolean = await isMatch(message)
    t.equal(result, false, 'should not match for room message')

    messageRoom.returns(null)
    result = await isMatch(message)
    t.equal(result, true, 'should match for non-room message')
  }
})

test('isMatchOptions {dm: true}', async (t) => {
  for await (const {
    message,
    room,
  } of wechatyFixtures()) {
    const OPTIONS = {
      dm   : true,
      room : false,
    } as DingDongOptionsObject
    const isMatch = isMatchOptions(OPTIONS)

    const sandbox = sinon.createSandbox()
    const messageRoom = sandbox.stub(message, 'room').returns(null)

    let result: boolean = await isMatch(message)
    t.equal(result, true, 'should match for direct message')

    sandbox.stub(message, 'mentionSelf').returns(Promise.resolve(true))
    messageRoom.returns(room)
    result = await isMatch(message)
    t.equal(result, true, 'should not match for room message')
  }
})

test('isMatchOptions {dm: false}', async (t) => {
  for await (const {
    message,
    room,
  } of wechatyFixtures()) {
    const OPTIONS = {
      dm   : false,
      room : true,
    } as DingDongOptionsObject
    const isMatch = isMatchOptions(OPTIONS)

    const sandbox = sinon.createSandbox()

    const messageRoom = sandbox.stub(message, 'room').returns(null)
    let result: boolean = await isMatch(message)
    t.equal(result, false, 'should not match for direct message')

    messageRoom.returns(room)
    result = await isMatch(message)
    t.equal(result, true, 'should match for room message')
  }
})

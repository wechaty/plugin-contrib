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
  isMatchConfig,
  DingDongConfigObject,
}                             from './ding-dong'

async function * wechatyFixtures () {
  const sandbox = sinon.createSandbox()

  const wechaty = new Wechaty({ puppet: new PuppetMock() })
  await wechaty.start()
  const message = wechaty.Message.load('mock_message_id')
  const room = wechaty.Room.load('mock_room_id')

  sandbox.stub(message, 'toString').returns('MockMessage')
  const messageSelfStub = sandbox.stub(message, 'self').returns(false)

  yield {
    message,
    messageSelfStub,
    room,
    sandbox,
    wechaty,
  }

  sandbox.restore()
  await wechaty.stop()
}

test('isMatchConfig {at: true}', async t => {
  for await (const {
    message,
    room,
    sandbox,
  } of wechatyFixtures()) {
    const CONFIG = {
      at   : true,
      room : false,
    } as DingDongConfigObject
    const isMatch = isMatchConfig(CONFIG)

    sandbox.stub(message, 'room').returns(room)
    const messageMentionSelf = sandbox.stub(message, 'mentionSelf').returns(Promise.resolve(true))

    let result: boolean = await isMatch(message)
    t.equal(result, true, 'should match for room mention self message')

    messageMentionSelf.returns(Promise.resolve(false))
    result = await isMatch(message)
    t.equal(result, false, 'should not match for room non-mention-self message')
  }
})

test('isMatchConfig {at: false}', async t => {
  for await (const {
    message,
    room,
  } of wechatyFixtures()) {
    const CONFIG = {
      at: false,
      room: true,
    } as DingDongConfigObject
    const isMatch = isMatchConfig(CONFIG)

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

test('isMatchConfig {room: true}', async t => {
  for await (const {
    message,
    room,
  } of wechatyFixtures()) {
    const CONFIG = {
      dm   : false,
      room : true,
    } as DingDongConfigObject
    const isMatch = isMatchConfig(CONFIG)

    const sandbox = sinon.createSandbox()
    const messageRoom = sandbox.stub(message, 'room').returns(room)

    let result: boolean = await isMatch(message)
    t.equal(result, true, 'should match for room message')

    messageRoom.returns(null)
    result = await isMatch(message)
    t.equal(result, false, 'should not match for non-room message')
  }
})

test('isMatchConfig {room: false}', async t => {
  for await (const {
    message,
    room,
  } of wechatyFixtures()) {
    const CONFIG = {
      room: false,
    } as DingDongConfigObject
    const isMatch = isMatchConfig(CONFIG)

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

test('isMatchConfig {dm: true}', async t => {
  for await (const {
    message,
    room,
  } of wechatyFixtures()) {
    const CONFIG = {
      dm   : true,
      room : false,
    } as DingDongConfigObject
    const isMatch = isMatchConfig(CONFIG)

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

test('isMatchConfig {dm: false}', async t => {
  for await (const {
    message,
    room,
  } of wechatyFixtures()) {
    const CONFIG = {
      dm   : false,
      room : true,
    } as DingDongConfigObject
    const isMatch = isMatchConfig(CONFIG)

    const sandbox = sinon.createSandbox()

    const messageRoom = sandbox.stub(message, 'room').returns(null)
    let result: boolean = await isMatch(message)
    t.equal(result, false, 'should not match for direct message')

    messageRoom.returns(room)
    result = await isMatch(message)
    t.equal(result, true, 'should match for room message')
  }
})

test('isMatchConfig {self: false}', async t => {
  for await (const {
    message,
    messageSelfStub,
    room,
    sandbox,
  } of wechatyFixtures()) {
    const CONFIG = {
      self : false,
    } as DingDongConfigObject
    const isMatch = isMatchConfig(CONFIG)

    /**
     * Direct Message
     */
    const messageRoom = sandbox.stub(message, 'room').returns(null)

    messageSelfStub.returns(true)
    let result: boolean = await isMatch(message)
    t.equal(result, false, 'should not match for self direct message with self:false')

    messageSelfStub.returns(false)
    result = await isMatch(message)
    t.equal(result, true, 'should not match for non-self direct message with self:false')

    /**
     * Room Message
     */
    messageRoom.returns(room)

    messageSelfStub.returns(true)
    result = await isMatch(message)
    t.equal(result, false, 'should not match for self room message with self:false')

    messageSelfStub.returns(false)
    result = await isMatch(message)
    t.equal(result, true, 'should not match for non-self room message with self:false')
  }
})

test('isMatchConfig {self: true}', async t => {
  for await (const {
    message,
    messageSelfStub,
    room,
    sandbox,
  } of wechatyFixtures()) {
    const CONFIG = {
      self : true,
    } as DingDongConfigObject
    const isMatch = isMatchConfig(CONFIG)

    messageSelfStub.returns(true)

    const messageRoom = sandbox.stub(message, 'room').returns(null)
    let result: boolean = await isMatch(message)
    t.equal(result, true, 'should not match for self direct message with self:false')

    messageRoom.returns(room)
    result = await isMatch(message)
    t.equal(result, true, 'should not match for self room message with self:false')
  }
})

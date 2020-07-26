#!/usr/bin/env ts-node

import test  from 'tstest'
// import sinon from 'sinon'

import {
  // Wechaty,
  Message,
}                   from 'wechaty'
import {
  createFixture,
}                   from 'wechaty-puppet-mock/dist/src/create-fixture'

import {
  isMatchConfig,
  DingDongConfigObject,
}                             from './ding-dong'

test('isMatchConfig {mention: true}', async t => {
  for await (const fixture of createFixture()) {
    const CONFIG = {
      mention : true,
      room    : true,
    } as DingDongConfigObject
    const isMatch = isMatchConfig(CONFIG)

    const room = fixture.wechaty.Room.load(fixture.room.id)

    const mentionMessage = await new Promise<Message>(resolve => {
      room.once('message', resolve)
      fixture.player.say('ding', [fixture.bot]).to(fixture.room)
    })
    let result: boolean = await isMatch(mentionMessage)
    t.equal(result, true, 'should match for room mention self message')

    const notMentionMessage = await new Promise<Message>(resolve => {
      room.once('message', resolve)
      fixture.player.say('ding').to(fixture.room)
    })
    result = await isMatch(notMentionMessage)
    t.equal(result, false, 'should not match for room non-mention-self message')
  }
})

test('isMatchConfig {mention: false}', async t => {
  for await (const fixture of createFixture()) {
    const CONFIG = {
      mention : false,
      room    : true,
    } as DingDongConfigObject
    const isMatch = isMatchConfig(CONFIG)

    const room = fixture.wechaty.Room.load(fixture.room.id)

    const mentionMessage = await new Promise<Message>(resolve => {
      room.once('message', resolve)
      fixture.player.say('ding', [fixture.bot]).to(fixture.room)
    })
    let result: boolean = await isMatch(mentionMessage)
    t.equal(result, true, 'should match for room mention self message')

    const notMentionMessage = await new Promise<Message>(resolve => {
      room.once('message', resolve)
      fixture.player.say('ding').to(fixture.room)
    })
    result = await isMatch(notMentionMessage)
    t.equal(result, true, 'should also match for room non-mention-self message')
  }
})

test('isMatchConfig {room: true}', async t => {
  for await (const fixture of createFixture()) {
    const CONFIG = {
      contact : false,
      ding: /.*/,
      room    : true,
    } as DingDongConfigObject
    const isMatch = isMatchConfig(CONFIG)

    const room = fixture.wechaty.Room.load(fixture.room.id)
    const bot = fixture.wechaty.userSelf()

    const roomMessage = await new Promise<Message>(resolve => {
      room.once('message', resolve)
      fixture.player.say().to(fixture.room)
    })
    const directMessage = await new Promise<Message>(resolve => {
      bot.once('message', resolve)
      fixture.player.say().to(fixture.bot)
    })
    let result: boolean = await isMatch(roomMessage)
    t.equal(result, true, 'should match for room message with {room: true}')

    result = await isMatch(directMessage)
    t.equal(result, false, 'should not match for non-room message')
  }
})

test('isMatchConfig {room: false}', async t => {
  for await (const fixture of createFixture()) {
    const CONFIG = {
      ding: /.*/,
      room: false,
    } as DingDongConfigObject
    const isMatch = isMatchConfig(CONFIG)

    const room = fixture.wechaty.Room.load(fixture.room.id)
    const bot = fixture.wechaty.userSelf()

    const roomMessage = await new Promise<Message>(resolve => {
      room.once('message', resolve)
      fixture.player.say().to(fixture.room)
    })
    const directMessage = await new Promise<Message>(resolve => {
      bot.once('message', resolve)
      fixture.player.say().to(fixture.bot)
    })

    let result: boolean = await isMatch(roomMessage)
    t.equal(result, false, 'should not match for room message')

    result = await isMatch(directMessage)
    t.equal(result, true, 'should match for non-room message')
  }
})

test('isMatchConfig {dm: true}', async t => {
  for await (const fixture of createFixture()) {
    const CONFIG = {
      contact : true,
      ding    : /.*/,
      room    : false,
    } as DingDongConfigObject
    const isMatch = isMatchConfig(CONFIG)

    const room = fixture.wechaty.Room.load(fixture.room.id)
    const bot = fixture.wechaty.userSelf()

    const roomMessage = await new Promise<Message>(resolve => {
      room.once('message', resolve)
      fixture.player.say().to(fixture.room)
    })
    const directMessage = await new Promise<Message>(resolve => {
      bot.once('message', resolve)
      fixture.player.say().to(fixture.bot)
    })

    let result: boolean = await isMatch(roomMessage)
    t.equal(result, false, 'should not match for room message')

    result = await isMatch(directMessage)
    t.equal(result, true, 'should match for non-room message')
  }
})

test('isMatchConfig {dm: false}', async t => {
  for await (const fixture of createFixture()) {
    const CONFIG = {
      contact : false,
      ding: /.*/,
      room    : true,
    } as DingDongConfigObject
    const isMatch = isMatchConfig(CONFIG)

    const room = fixture.wechaty.Room.load(fixture.room.id)
    const bot = fixture.wechaty.userSelf()

    const roomMessage = await new Promise<Message>(resolve => {
      room.once('message', resolve)
      fixture.player.say().to(fixture.room)
    })
    const directMessage = await new Promise<Message>(resolve => {
      bot.once('message', resolve)
      fixture.player.say().to(fixture.bot)
    })

    let result: boolean = await isMatch(roomMessage)
    t.equal(result, true, 'should match for room message with {dm: false}')

    result = await isMatch(directMessage)
    t.equal(result, false, 'should not match for direct message')
  }
})

test('isMatchConfig {self: false}', async t => {
  for await (const fixture of createFixture()) {
    const CONFIG = {
      ding: /.*/,
      self : false,
    } as DingDongConfigObject
    const isMatch = isMatchConfig(CONFIG)

    const room = fixture.wechaty.Room.load(fixture.room.id)
    const bot = fixture.wechaty.userSelf()

    const selfMessage = await new Promise<Message>(resolve => {
      room.once('message', resolve)
      fixture.bot.say().to(fixture.room)
    })
    const notSelfMessage = await new Promise<Message>(resolve => {
      bot.once('message', resolve)
      fixture.player.say().to(fixture.bot)
    })

    let result = await isMatch(selfMessage)
    t.equal(result, false, 'should not match for self room message with self:false')

    result = await isMatch(notSelfMessage)
    t.equal(result, true, 'should match for non-self room message with self:false')
  }
})

test('isMatchConfig {self: true}', async t => {
  for await (const fixture of createFixture()) {
    const CONFIG = {
      ding: /.*/,
      self : true,
    } as DingDongConfigObject
    const isMatch = isMatchConfig(CONFIG)

    const room = fixture.wechaty.Room.load(fixture.room.id)

    const selfMessage = await new Promise<Message>(resolve => {
      room.once('message', resolve)
      fixture.bot.say().to(fixture.room)
    })
    const notSelfMessage = await new Promise<Message>(resolve => {
      room.once('message', resolve)
      fixture.player.say().to(fixture.room)
    })

    let result = await isMatch(selfMessage)
    t.equal(result, true, 'should match for self room message with self:true')

    result = await isMatch(notSelfMessage)
    t.equal(result, true, 'should match for non-self room message with self:true')
  }
})

test('isMatchConfig {room: /ChatOps/}', async t => {
  for await (const fixture of createFixture()) {
    const CONFIG = {
      mention : false,
      room    : /ChatOps/i,
    } as DingDongConfigObject

    const isMatch = isMatchConfig(CONFIG)

    const chatopsRoomMock = fixture.mocker.createRoom({
      topic: 'ChatOps - DDR',
    })
    const otherRoomMock = fixture.mocker.createRoom({
      topic: 'other room topic',
    })

    const chatopsRoom = fixture.wechaty.Room.load(chatopsRoomMock.id)
    const otherRoom   = fixture.wechaty.Room.load(otherRoomMock.id)

    const chatopsMessage = await new Promise<Message>(resolve => {
      chatopsRoom.once('message', m => {
        console.info(m.toString())
        resolve(m)
      })
      fixture.player.say('ding').to(chatopsRoomMock)
    })
    const otherMessage = await new Promise<Message>(resolve => {
      otherRoom.once('message', resolve)
      fixture.player.say('ding').to(otherRoomMock)
    })

    let result = await isMatch(chatopsMessage)
    t.equal(result, true, 'should match for ding message in chatops room')

    result = await isMatch(otherMessage)
    t.equal(result, false, 'should not match for ding non-chatops room')
  }
})

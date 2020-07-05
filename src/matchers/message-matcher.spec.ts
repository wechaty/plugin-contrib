#!/usr/bin/env ts-node

import test  from 'tstest'

import { messageMatcher } from './message-matcher'
import { Message } from 'wechaty'

test('messageMatcher() smoke testing', async t => {
  const matcher = messageMatcher(/test/i)
  t.equal(typeof matcher, 'function', 'should return a match function')
})

test('messageMatcher() with string option', async t => {
  const TEXT_OK     = 'hello'
  const TEXT_NOT_OK = 'world'

  const textOk = () => TEXT_OK
  const roomOk = () => ({ id: TEXT_OK, topic: () => TEXT_OK })
  const fromOk = () => ({ id: TEXT_OK, name: () => TEXT_OK })

  const textNotOk = () => TEXT_NOT_OK
  const roomNotOk = () => ({ id: TEXT_NOT_OK, topic: () => TEXT_NOT_OK })
  const fromNotOk = () => ({ id: TEXT_NOT_OK, name: () => TEXT_NOT_OK })

  const messageFromOk = {
    from: fromOk,
    id: TEXT_NOT_OK,
    mentionText: textNotOk,
    room: roomNotOk,
    text: textNotOk,
  } as any as Message

  const messageTextOk = {
    from: fromNotOk,
    id: TEXT_NOT_OK,
    mentionText: textOk,
    room: roomNotOk,
    text: textOk,
  } as any as Message

  const messageTopicOk = {
    from: fromNotOk,
    id: TEXT_NOT_OK,
    mentionText: textNotOk,
    room: roomOk,
    text: textNotOk,
  } as any as Message

  const messageIdOk = {
    from: fromNotOk,
    id: TEXT_OK,
    room: roomOk,
    text: textNotOk,
  } as any as Message

  const messageNotOk = {
    from: fromNotOk,
    id: TEXT_NOT_OK,
    mentionText: textNotOk,
    room: roomNotOk,
    text: textNotOk,
  } as any as Message

  const falseMatcher = messageMatcher()
  t.false(await falseMatcher(messageFromOk), 'should not match any message: from')
  t.false(await falseMatcher(messageTopicOk), 'should not match any message: topic')
  t.false(await falseMatcher(messageIdOk), 'should not match any message: text')

  const idMatcher = messageMatcher(TEXT_OK)

  t.false(await idMatcher(messageNotOk), 'should not match unexpected message by id')

  t.true(await idMatcher(messageFromOk), 'should match expected from by id')
  t.true(await idMatcher(messageTopicOk), 'should match expected topic by id')
  t.true(await idMatcher(messageIdOk), 'should match expected text by id')

  const idListMatcher = messageMatcher([ TEXT_OK ])

  t.false(await idListMatcher(messageNotOk), 'should not match unexpected message by id list')

  t.true(await idListMatcher(messageFromOk), 'should match expected from by id list')
  t.true(await idListMatcher(messageTopicOk), 'should match expected topic by id list')
  t.true(await idListMatcher(messageIdOk), 'should match expected text by id list')

  const regexpMatcher = messageMatcher(new RegExp(TEXT_OK))

  t.false(await regexpMatcher(messageNotOk), 'should not match unexpected message by regexp')

  t.true(await regexpMatcher(messageFromOk), 'should match expected from by regexp')
  t.true(await regexpMatcher(messageTopicOk), 'should match expected topic by regexp')
  t.true(await regexpMatcher(messageTextOk), 'should match expected text by regexp')

  const regexpListMatcher = messageMatcher([ new RegExp(TEXT_OK) ])

  t.false(await regexpListMatcher(messageNotOk), 'should not match unexpected message by regexp')

  t.true(await regexpListMatcher(messageFromOk), 'should match expected from by regexp')
  t.true(await regexpListMatcher(messageTopicOk), 'should match expected topic by regexp')
  t.true(await regexpListMatcher(messageTextOk), 'should match expected text by regexp')

  const messageFilter = (message: Message) => [
    message.text(),
    message.room()?.topic(),
    message.from()?.name(),
  ].includes(TEXT_OK)

  const functionMatcher = messageMatcher(messageFilter)

  t.false(await functionMatcher(messageNotOk), 'should not match unexpected message by function')

  t.true(await functionMatcher(messageFromOk), 'should match expected from by function')
  t.true(await functionMatcher(messageTopicOk), 'should match expected topic by function')
  t.true(await functionMatcher(messageTextOk), 'should match expected text by function')

  const functionListMatcher = messageMatcher([ messageFilter ])

  t.false(await functionListMatcher(messageNotOk), 'should not match unexpected message by function list')

  t.true(await functionListMatcher(messageFromOk), 'should match expected from by function list')
  t.true(await functionListMatcher(messageTopicOk), 'should match expected topic by function list')
  t.true(await functionListMatcher(messageTextOk), 'should match expected text by function list')

})

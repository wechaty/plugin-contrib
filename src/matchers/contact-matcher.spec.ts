#!/usr/bin/env ts-node

import test  from 'tstest'

import { contactMatcher } from './contact-matcher'
import { Contact } from 'wechaty'

test('contactMatcher() smoke testing', async t => {
  const matcher = contactMatcher(/test/i)
  t.equal(typeof matcher, 'function', 'should return a match function')
})

test('contactMatcher() with string option', async t => {
  const TEXT_OK     = 'hello'
  const TEXT_NOT_OK = 'world'

  const nameOk    = () => TEXT_OK
  const nameNotOk = () => TEXT_NOT_OK

  const contactIdOk = {
    id: TEXT_OK,
    name: nameNotOk,
  } as any as Contact

  const contactNameOk = {
    id: TEXT_NOT_OK,
    name: nameOk,
  } as any as Contact

  const contactNotOk = {
    id: TEXT_NOT_OK,
    name: nameNotOk,
  } as any as Contact

  const falseMatcher = contactMatcher()
  t.false(await falseMatcher(contactIdOk), 'should not match any contact without options')
  t.false(await falseMatcher(contactNameOk), 'should not match any contact without options')

  const idMatcher = contactMatcher(TEXT_OK)

  t.false(await idMatcher(contactNotOk), 'should not match unexpected contact by id')

  t.true(await idMatcher(contactIdOk), 'should match expected contact by id')
  t.false(await idMatcher(contactNameOk), 'should not match contact by name')

  const idListMatcher = contactMatcher([ TEXT_OK ])

  t.false(await idListMatcher(contactNotOk), 'should not match unexpected contact by id list')

  t.true(await idListMatcher(contactIdOk), 'should match expected contact by id list')
  t.false(await idListMatcher(contactNameOk), 'should not match contact by name list')

  const regexpMatcher = contactMatcher(new RegExp(TEXT_OK))

  t.false(await regexpMatcher(contactNotOk), 'should not match unexpected contact by regexp')

  t.false(await regexpMatcher(contactIdOk), 'should match contact id by regexp')
  t.true(await regexpMatcher(contactNameOk), 'should match expected contact name by regexp')

  const regexpListMatcher = contactMatcher([ new RegExp(TEXT_OK) ])

  t.false(await regexpListMatcher(contactNotOk), 'should not match unexpected contact by regexp list')

  t.false(await regexpListMatcher(contactIdOk), 'should not match contact id by regexp list')
  t.true(await regexpListMatcher(contactNameOk), 'should match expected contact name by regexp list')

  const roomFilter = (room: Contact) => [
    room.id,
    room.name(),
  ].includes(TEXT_OK)

  const functionMatcher = contactMatcher(roomFilter)

  t.false(await functionMatcher(contactNotOk), 'should not match unexpected contact by function')

  t.true(await functionMatcher(contactNameOk), 'should match expected name by function')
  t.true(await functionMatcher(contactIdOk), 'should match expected id by function')

  const functionListMatcher = contactMatcher([ roomFilter ])

  t.false(await functionListMatcher(contactNotOk), 'should not match unexpected contact by function list')

  t.true(await functionListMatcher(contactNameOk), 'should match expected name by function list')
  t.true(await functionListMatcher(contactIdOk), 'should match expected text by function list')
})

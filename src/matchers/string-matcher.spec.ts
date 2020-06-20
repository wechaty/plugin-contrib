#!/usr/bin/env ts-node

import test  from 'tstest'

import { stringMatcher } from './string-matcher'

test('stringMatcher() smoke testing', async t => {
  const matcher = stringMatcher()
  t.equal(typeof matcher, 'function', 'should return a match function')
})

test('stringMatcher()', async t => {
  const TEXT_OK     = 'hello'
  const TEXT_NOT_OK = 'world'

  const falseMatcher = stringMatcher()
  t.false(await falseMatcher(TEXT_OK), 'should not match any string: TEXT_OK')
  t.false(await falseMatcher(TEXT_NOT_OK), 'should not match any string: TEXT_NOT_OK')

  const textMatcher = stringMatcher(TEXT_OK)
  t.true(await textMatcher(TEXT_OK), 'should match expected TEXT')
  t.false(await textMatcher(TEXT_NOT_OK), 'should not match unexpected string')

  const textListMatcher = stringMatcher([ TEXT_OK ])
  t.true(await textListMatcher(TEXT_OK), 'should match expected TEXT by list')
  t.false(await textListMatcher(TEXT_NOT_OK), 'should not match unexpected string by list')

  const regexpMatcher = stringMatcher(new RegExp(TEXT_OK))
  t.false(await regexpMatcher(TEXT_NOT_OK), 'should not match unexpected string by regexp')
  t.true(await regexpMatcher(TEXT_OK), 'should match expected from by regexp')

  const regexpListMatcher = stringMatcher([ new RegExp(TEXT_OK) ])
  t.false(await regexpListMatcher(TEXT_NOT_OK), 'should not match unexpected string by regexp list')
  t.true(await regexpListMatcher(TEXT_OK), 'should match expected from by regexp list')

  const stringFilter = (text: string) => text === TEXT_OK

  const functionMatcher = stringMatcher(stringFilter)
  t.false(await functionMatcher(TEXT_NOT_OK), 'should not match unexpected string by function')
  t.true(await functionMatcher(TEXT_OK), 'should match expected from by function')

  const functionListMatcher = stringMatcher([ stringFilter ])
  t.false(await functionListMatcher(TEXT_NOT_OK), 'should not match unexpected string by function list')
  t.true(await functionListMatcher(TEXT_OK), 'should match expected from by function list')
})

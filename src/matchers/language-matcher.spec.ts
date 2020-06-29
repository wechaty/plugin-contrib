#!/usr/bin/env ts-node

import test  from 'tstest'

import {
  detectLanguage,
  includeLanguage,
  languageMatcher,
}                     from './language-matcher'

test('detectLanguage()', async t => {
  const ENGLISH_TEXT = 'hello'

  const resultList = detectLanguage(ENGLISH_TEXT)
  t.true(Array.isArray(resultList), 'should return a array')
  t.true(resultList.length > 0, 'should get a non-empty array')
})

test('includeLanguage()', async t => {
  const CHINESE_TEXT = '你好'
  const ENGLISH_TEXT = 'hello'

  let resultList = detectLanguage(CHINESE_TEXT)
  // console.info(resultList)
  t.true(includeLanguage(resultList, 'chinese'), 'should detect Chinese language')

  resultList = detectLanguage(ENGLISH_TEXT)
  // console.info(resultList)
  t.true(includeLanguage(resultList, 'english'), 'should detect English language')
})

test('languageMatcher()', async t => {
  const CHINESE_TEXT = '你好'
  const ENGLISH_TEXT = 'hello'

  const matchLanguage = languageMatcher('chinese')

  let result = matchLanguage(CHINESE_TEXT)
  t.true(result, 'should match Chinese language')

  result = matchLanguage(ENGLISH_TEXT)
  t.false(result, 'should not match English language')
})

test('languageMatcher() with array options', async t => {
  const CHINESE_TEXT = '你好'
  const ENGLISH_TEXT = 'hello'

  const matchLanguage = languageMatcher(['chinese', 'english'])

  let result = matchLanguage(CHINESE_TEXT)
  t.true(result, 'should match Chinese language')

  result = matchLanguage(ENGLISH_TEXT)
  t.true(result, 'should match English language')
})

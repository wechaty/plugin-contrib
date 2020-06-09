#!/usr/bin/env ts-node

import test  from 'tstest'
import sinon from 'sinon'

import {
  GreetingOptions,
  KeywordOptions,

  matchKeywordConfig,
  doGreetingConfig,
}                             from './friendship-accepter'
import { Contact } from 'wechaty'

test('matchKeywordConfig()', async t => {
  const EXPECTED_TEXT = 'text'

  const OPTIONS_TEXT: KeywordOptions     = EXPECTED_TEXT
  const OPTIONS_REGEXP: KeywordOptions   = new RegExp('^' + EXPECTED_TEXT + '$')
  const OPTIONS_FUNCTION: KeywordOptions = async (text: string) => text === EXPECTED_TEXT

  t.true(await matchKeywordConfig({ keyword: OPTIONS_TEXT })(EXPECTED_TEXT), 'should match for text by text')
  t.false(await matchKeywordConfig({ keyword: OPTIONS_TEXT })(EXPECTED_TEXT + 'xx'), 'should not match for text + xx by text')

  t.true(await matchKeywordConfig({ keyword: OPTIONS_REGEXP })(EXPECTED_TEXT), 'should match for text by regexp')
  t.false(await matchKeywordConfig({ keyword: OPTIONS_REGEXP })(EXPECTED_TEXT  + 'xx'), 'should not match for text + xx by regexp')

  t.true(await matchKeywordConfig({ keyword: OPTIONS_FUNCTION })(EXPECTED_TEXT), 'should match for text by function')
  t.false(await matchKeywordConfig({ keyword: OPTIONS_FUNCTION })(EXPECTED_TEXT + 'xx'), 'should not match for text + xx by function')
})

test('doGreetingConfig()', async t => {
  const spy1 = sinon.spy()
  const spy2 = sinon.spy()
  const spy3 = sinon.spy()
  const spy4 = sinon.spy()

  const EXPECTED_TEXT = 'text'

  const OPTIONS_TEXT: GreetingOptions = EXPECTED_TEXT
  const OPTIONS_FUNCTION: GreetingOptions = spy1
  const OPTIONS_FUNCTION_LIST: GreetingOptions = [spy2, spy3]

  const mockContact = {
    say: spy4,
  } as any as Contact

  await doGreetingConfig({ greeting: OPTIONS_TEXT })(mockContact)
  t.true(spy4.called, 'should called the contact.say')
  t.equal(spy4.args[0][0], EXPECTED_TEXT, 'should say the expected text')

  await doGreetingConfig({ greeting: OPTIONS_FUNCTION })(mockContact)
  t.true(spy1.called, 'should called the function')
  t.equal(spy1.args[0][0], mockContact, 'should called the function with contact')

  await doGreetingConfig({ greeting: OPTIONS_FUNCTION_LIST })(mockContact)
  t.true(spy2.called, 'should called the functions 1')
  t.true(spy3.called, 'should called the functions 2')
  t.equal(spy2.args[0][0], mockContact, 'should called the functions 1 with contact')
  t.equal(spy3.args[0][0], mockContact, 'should called the functions 2 with contact')
})

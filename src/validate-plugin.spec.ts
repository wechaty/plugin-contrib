#!/usr/bin/env -S node --no-warnings --loader ts-node/esm

import { test } from 'tstest'

import { validatePlugin } from './validate-plugin.js'

test('validatePlugin() pass', async t => {

  function Test () {
    return function TestPlugin () {
    }
  }

  t.doesNotThrow(() => validatePlugin(Test), 'should pass a valid plugin')
})

test('validatePlugin() fail', async t => {
  function Test () {
    return function TestXXX () {
    }
  }

  t.throws(() => validatePlugin(Test), 'should not pass a invalid plugin')
})

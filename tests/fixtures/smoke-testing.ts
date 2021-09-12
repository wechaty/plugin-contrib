#!/usr/bin/env -S node --no-warnings --loader ts-node/esm
import {
  VERSION,
}                       from 'wechaty-plugin-contrib'

async function main () {
  if (VERSION === '0.0.0') {
    throw new Error('version should be set before publishing')
  }
  return 0
}

main()
  .then(process.exit)
  .catch(e => {
    console.error(e)
    process.exit(1)
  })

/// <reference path="./typings.d.ts" />
import { log } from 'wechaty'
import { packageJson } from './package-json.js'

const VERSION = packageJson.version || '0.0.0'

export {
  log,
  VERSION,
}

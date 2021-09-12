/**
 *   Wechaty - https://github.com/wechaty/wechaty
 *
 *   @copyright 2016-now Huan LI <zixia@zixia.net>
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 *
 */
import { Wechaty } from 'wechaty'

import {
  DingDong,
  EventLogger,
  QRCodeTerminal,
  MessageAwaiter,
} from '../src/mod.js'  // from 'wechaty-plugin-contrib'

const bot = new Wechaty({
  name: 'message-awaiter-bot',
})

bot.use(
  QRCodeTerminal(),
  DingDong(),
  EventLogger(),
  MessageAwaiter()
)

bot.on('message', async (msg) => {
  if (msg.text() === 'repeat me') {

    await msg.say('what to repeat?')
    const repeatMsg = await bot.waitForMessage({ contact: msg.talker().id, room: msg.room()?.id })
    await repeatMsg.say(repeatMsg.text())

  } else if (msg.text() === 'test') {

    await msg.say('please reply a message with digits in a minute')
    try {
      const repeatMsg = await bot.waitForMessage({
        contact: msg.talker().id,
        room: msg.room()?.id,
        text: /\d/,
        timeoutSecond: 60,
      })
      await repeatMsg.say(repeatMsg.text())
    } catch (err) {
      await msg.say(String(err))
    }

  }
})

bot.start()
  .catch(console.error)

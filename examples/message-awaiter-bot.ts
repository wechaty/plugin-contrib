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
import { WechatyBuilder } from 'wechaty'

import {
  DingDong,
  EventLogger,
  QRCodeTerminal,
  messagePrompter,
} from '../src/mod.js'  // from 'wechaty-plugin-contrib'

const bot = WechatyBuilder.build({
  name: 'message-awaiter-bot',
})

bot.use(
  QRCodeTerminal(),
  DingDong(),
  EventLogger(),
)

bot.on('message', async msg => {
  const prompter = messagePrompter(msg)

  if (msg.text() === 'repeat me') {
    const repeatMsg = await prompter('What do you want to repeat?')
    if (repeatMsg) {
      await repeatMsg.say(repeatMsg.text())
    } else {
      await msg.say('timeout')
    }

  } else if (msg.text() === 'test') {

    const repeatMsg = await prompter('please reply a message with digits in a minute')
    /**
     * Huan(202110): Issue #60 refactoring
     *  @see https://github.com/wechaty/plugin-contrib/issues/60
     */
    try {
      // const repeatMsg = await bot.waitForMessage({
      //   contact: msg.talker().id,
      //   room: msg.room()?.id,
      //   text: /\d/,
      //   timeoutSecond: 60,
      // })
      if (repeatMsg) {
        await repeatMsg.say(repeatMsg.text())
      }
    } catch (err) {
      await msg.say(String(err))
    }

  }
})

bot.start()
  .catch(console.error)

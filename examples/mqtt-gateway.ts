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
  QRCodeTerminal,
  MqttGateway,
  MqttGatewayConfig,
  // getKeyByBasicString,
}                   from '../src/mod.js'  // from 'wechaty-plugin-contrib'

const bot = WechatyBuilder.build({
  name : 'ding-dong-bot',
  puppet: 'wechaty-puppet-xp',
})
const config: MqttGatewayConfig = {
  events: [
    'login',
    'logout',
    'reset',
    'ready',
    'dirty',
    'dong',
    'error',
    // 'heartbeat',
    'friendship',
    'message', 'post',
    'room-invite', 'room-join',
    'room-leave', 'room-topic',
    'scan',
  ],
  mqtt: {
    clientId: 'wechaty-mqtt-gateway',
    host: 'broker.emqx.io',
    password: '',
    port: 1883,
    username: '',
  },
  options:{
    secrectKey: '',
    simple: false,
  },
  token: '',
}

bot.use(
  MqttGateway(config),
  QRCodeTerminal(),
)

bot.start()
  .catch(console.error)

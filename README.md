# wechaty-plugin-contrib [![Wechaty Plugin Contrib](https://img.shields.io/badge/Wechaty%20Plugin-Contrib-brightgreen.svg)](https://github.com/wechaty/wechaty-plugin-contrib)

[![NPM Version](https://img.shields.io/npm/v/wechaty-plugin-contrib?color=brightgreen)](https://www.npmjs.com/package/wechaty-plugin-contrib)
[![NPM](https://github.com/wechaty/wechaty-plugin-contrib/workflows/NPM/badge.svg)](https://github.com/wechaty/wechaty-plugin-contrib/actions?query=workflow%3ANPM)
[![ES Modules](https://img.shields.io/badge/ES-Modules-brightgreen)](https://github.com/Chatie/tsconfig/issues/16)

Wechaty Plugin Contrib Package for the Community

![Wechaty Plugin](docs/images/plugin.png)

> Image Credit: [What is Plugin](https://www.computerhope.com/jargon/p/plugin.htm)

[![Powered by Wechaty](https://img.shields.io/badge/Powered%20By-Wechaty-brightgreen.svg)](https://github.com/Wechaty/wechaty)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-blue.svg)](https://www.typescriptlang.org/)

## Introduction

When you find yourself writing repetitive code, it's time to extract it into a plugin.

Wechaty has a great support for using Plugins by calling `Wechaty.use(WechatyPlugin())`. A Wechaty Plugin is a JavaScript function that returns a function which accepts a Wechaty instance.

The first Wechaty Plugin system was design by our core team developer [@gcaufy](https://github.com/gcaufy) from issue [#1939](https://github.com/wechaty/wechaty/issues/1939)(Wechaty Plugin Support with Kick out Example) to PR [#1946](https://github.com/wechaty/wechaty/pull/1946)(feat: added wechaty plugin).

This package is for publishing the Wechaty Plugins that are very common used by the core developer team.

## Requirements

1. Wechaty v0.40 or above versions

## Plugins Contrib

- [Paka Docs](https://paka.dev/npm/wechaty-plugin-contrib)

You are welcome to send your plugin to our contrib by creating a Pull Request!

| # | Plugin | Author | Feature |
| :--- | :--- | :--- | :--- |
| 1 | DingDong | @huan | Reply `dong` if bot receives a `ding` message. |
| 2 | EventLogger | @huan | Log Wechaty Events for `'scan' \| 'login' \| 'message'` ... etc. |
| 3 | QRCodeTerminal | @huan | Show QR Code for Scan in Terminal |
| 4 | Heartbeat | @huan | Send emoji periodically |
| 5 | ChatOps | @huan | Forward DM & Mention messages to a room |
| 6 | RoomConnector | @huan | Connect rooms together with `1:N`, `M:1`, and `M:N` modes |
| 7 | FriendshipAccepter | @huan | Accept friendship automatically, and say/do something for greeting. |
| 8 | RoomInviter | @huan | Invite user to rooms by keyword |
| 9 | EventHotHandler | @huan | Hot reloading event handler module files |
| 10 | RoomInvitationAccepter | @huan | Automatically accepting any room invitations |
| 11 | MessageAwaiter | @ssine | Wait for a particular message using `await` syntax [#13](https://github.com/wechaty/wechaty-plugin-contrib/issues/13) |

### 1 DingDong

- Description: Reply `dong` if bot receives a `ding` message.
- Author: @huan

```ts
import { DingDong } from 'wechaty-plugin-contrib'

const config = {
  mention : true,    // default: true - Response to Mention Self (@/at) Message in Room
  contact : true,    // default: true - Response to Direct Message
  room    : true,    // default: true - Response to Rooms Message
  self    : true,    // default: true - Response to Message that send from the bot itself
}

wechaty.use(DingDong(config))
```

#### `config` as a Function

`config` can also be a function which receives a `message: Message` and returns a `boolean` result to decide whether response a `ding` message.

`Config: (message: Message) => boolean | Promise<boolean>`

### 2 EventLogger

- Description: Log Wechaty Events: `"dong" | "message" | "error" | "friendship" | "heartbeat" | "login" | "logout" | "ready" | "reset" | "room-invite" | "room-join" | "room-leave" | "room-topic" | "scan"`
- Author: @huan

```ts
import { EventLogger } from 'wechaty-plugin-contrib'
const config = ['login', 'ready', 'message']
// Do not provide an config will log all events.
wechaty.use(EventLogger(config))
```

### 3 QR Code Terminal

- Description: Show QR Code for Scan in Terminal
- Author: @huan

```ts
import { QRCodeTerminal } from 'wechaty-plugin-contrib'
const config = {
  small: false,   // default: false - the size of the printed QR Code in terminal
}
wechaty.use(QRCodeTerminal(config))
```

### 4 Heartbeat

- Description: Send emoji periodically
- Author: @huan

```ts
import { Heartbeat } from 'wechaty-plugin-contrib'
const config = {
  contact: 'filehelper',    // default: filehelper - Contact id who will receive the emoji
  emoji: {
    heartbeat: '[爱心]',    // default: [爱心] - Heartbeat emoji
  },
  intervalSeconds: 60 * 60, // Default: 1 hour - Send emoji for every 1 hour
}
wechaty.use(Heartbeat(config))
```

### 5 ChatOps

- Description: Forward DM & Mention messages to a ChatOps room for logging.
- Author: @huan

```ts
import { ChatOps } from 'wechaty-plugin-contrib'

const config = {
  room : 'xxx@chatroom',      // required: room id for ChatOps
  mention?  : true,                // default: true - Response to Mention Self (@/at) Message in Room
  contact?  : true,                // default: true - Response to Direct Message
  whitelist?: ChatOpsFilter,  // whitelist for messages that allow to send to ChatOps Room
  blacklist?: ChatOpsFilter,  // blacklist for messages that forbidden to send to ChatOps Room
}

wechaty.use(ChatOps(config))
```

### 6 `RoomConnector`(s)

Connect rooms together, it supports three modes:

1. `1:N` - `OneToManyRoomConnector` can broadcast the messages in one room to others.
1. `M:1` - `ManyToOneRoomConnector` can summary messages from rooms into one room.
1. `M:M` - `ManyToManyRoomConnector` will broadcast every message between rooms.
1. `M:N` - `SourceToTargetRoomConnector` will broadcast every message from source room(s) to target room(s).

The difference between `SourceToTargetRoomConnector` and `ManyToManyRoomConnector` is that:

1. `SourceToTargetRoomConnector` have two options to specify:
    1. `source`: use `RoomMatcherOptions` to specify the source rooms
    1. `target`: use `RoomFinderOptions` to specify the target rooms
1. `ManyToManyRoomConnector` have one option to specify:
    1. `many`: use `string[]` as list of room ids to broadcast to

#### 6.1 `OneToManyRoomConnector()`

```ts
import { OneToManyRoomConnector, OneToManyRoomConnectorConfig } from 'wechaty-plugin-contrib'
const config: OneToManyRoomConnectorConfig = {
  blacklist: [ async () => true ],
  many: [
    '20049383519@chatroom',     // 小句子测试
    '5611663299@chatroom',      // 'ChatOps - Mike BO'
  ],
  map: async message => message.talker().name() + '(one to many): ' + message.text(),
  one: '17237607145@chatroom',  // PreAngel 动态
  whitelist: [ async message => message.type() === Message.Type.Text ],
}
wechaty.use(OneToManyRoomConnector(config))
```

#### 6.2 `ManyToOneRoomConnector()`

```ts
import { ManyToOneRoomConnector, ManyToOneRoomConnectorConfig } from 'wechaty-plugin-contrib'
const config: ManyToOneRoomConnectorConfig = {
  blacklist: [ async () => true ],
  many: [
    '20049383519@chatroom',     // 小句子测试
    '5611663299@chatroom',      // 'ChatOps - Mike BO'
  ],
  map: async message => message.talker().name() + '(many to one): ' + message.text(),
  one: '17237607145@chatroom',  // PreAngel 动态
  whitelist: [ async message => message.type() === Message.Type.Text ],
}
wechaty.use(ManyToOneRoomConnector(config))
```

#### 6.3 `ManyToManyRoomConnector()`

```ts
import { ManyToManyRoomConnector, ManyToManyRoomConnectorConfig } from 'wechaty-plugin-contrib'
const config: ManyToManyRoomConnectorConfig = {
  blacklist: [ async () => true ],
  many: [
    '20049383519@chatroom',     // 小句子测试
    '5611663299@chatroom',      // 'ChatOps - Mike BO'
  ],
  map: async message => message.talker().name() + '(many to many): ' + message.text(),
  whitelist: [ async message => message.type() === Message.Type.Text ],
}
wechaty.use(ManyToManyRoomConnector(config))
```

#### 6.4 `SourceToTargetRoomConnector()`

```ts
import { SourceToTargetRoomConnector, SourceToTargetRoomConnectorConfig } from 'wechaty-plugin-contrib'
const config: SourceToTargetRoomConnectorConfig = {
  blacklist: [ async () => true ],
  source: [
    '5611663299@chatroom',
    /source room topic/i,
  ],
  target: [
    '20049383519@chatroom',
    /target room topic/i,
  ],

  map: async message => message.talker().name() + '(source to target): ' + message.text(),
  whitelist: [ async message => message.type() === Message.Type.Text ],
}
wechaty.use(SourceToTargetRoomConnector(config))
```

### 7 FriendshipAccepter

Accept friendship automatically, and say/do something for greeting.

```ts
import { FriendshipAccepter, FriendshipAccepterConfig } from 'wechaty-plugin-contrib'
const config: FriendshipAccepterConfig = {
  greeting: 'we are friends now!',
  keyword: '42',
}
wechaty.use(FriendshipAccepter(config))
```

1. `greeting` will be sent after the friendship has been accepted.
1. `keyword` if set, the friendship must match the `keyword` text.

### 8 RoomInviter

Invite a contact to the room with `password`, `welcome`(public message), and `rule`(private message) options supported.

```ts
import { RoomInviter, RoomInviterConfig } from 'wechaty-plugin-contrib'
const config: RoomInviterConfig = {
  password : 'wechaty',
  room     : '18171595067@chatroom',
  welcome  : 'Welcome to join the room!',
  rule     : 'Please be a good people',
  repeat   : 'You have already in our room',
}
wechaty.use(RoomInviter(config))
```

### ~~9 EventHotHandler~~ DEPRECATED after v0.15

Hot reloading event handler module files.

```ts
import { EventHotHandler, EventHotHandlerConfig } from 'wechaty-plugin-contrib'
const config: EventHotHandlerConfig = {
  login: './handlers/on-login',
  logout: './handlers/on0-logout',
}
wechaty.use(EventHotHandler(config))
```

### 10 RoomInvitationAccepter

Automatically accepting any room invitations.

```ts
import { RoomInvitationAccepter } from 'wechaty-plugin-contrib'
wechaty.use(RoomInvitationAccepter())
```

### 11 messagePrompter

- Description: Wait for a particular message using `await` syntax (`await messagePrompter(message)(...)`).
- Author: @ssine (refactored by @huan)

```ts
import { messageAwaiter } from 'wechaty-plugin-contrib'

wechaty.on('message' async (message) => {
  const prompter = messagePrompter(message)

  const reply = prompter('Hello')
  if (reply) {
    await message.say('hint message')
    // do anything you want...
  }
})
```

Other arguments ~~include `regex` which is tested on the message and~~ `timeoutSecond` which automatically rejects the dialog after specified seconds.

Learn more from:

- [New Plugin: Message Awaiter #13](https://github.com/wechaty/wechaty-plugin-contrib/issues/13)
- [Refactor the MessageAwaiter plugin #60](https://github.com/wechaty/plugin-contrib/issues/60)

## Wechaty Plugin Directory

The Wechaty Plugin Contrib will only accept simple plugins which does not dependence very heavy NPM modules, and the SLOC (Source Line Of Code) is no more than 100.

There are many great Wechaty Plugins can not be included in the contrib because they are too powerful. They will be published as a NPM by itself.

We are listing those powerful Wechaty Plugins outside the contrib as in the following list, and you are welcome to add your plugin below if you have published any!

[![Wechaty Plugin Contrib](https://img.shields.io/badge/Wechaty%20Plugin-Directory-brightgreen.svg)](https://github.com/wechaty/wechaty-plugin-contrib#wechaty-plugin-directory)

1. [VoteOut Plugin](https://github.com/Gcaufy/wechaty-voteout) by [@gcaufy](https://github.com/gcaufy) - help you to have a vote and kick out feature for you room.
1. [Schedule](https://github.com/Gcaufy/wechaty-schedule) by [@gcaufy](https://github.com/gcaufy) - easily schedule jobs for your Wechaty bots.
1. [GotKicked](https://github.com/wechaty/wechaty-got-kicked-out) by [@JesseWeb](https://github.com/JesseWeb) - monitor whether your bot got kicked out of group chat. Just few line of code to implement this instead fussy judging.
1. [WebPanel](https://github.com/gengchen528/wechaty-web-panel) by [@Leo_chen](https://github.com/gengchen528) - help you quickly access the web panel
1. [Intercom](https://github.com/wechaty/wechaty-plugin-intercom) by [@huan](https://github.com/huan) - helps you to manage your customers/leads/users in the WeChat Room, with the power of the Intercom service.
1. [Wechaty Vorpal](https://github.com/wechaty/wechaty-vorpal) by [@huan](https://github.com/huan) - CLI for Chatbot - Extensible Commands for ChatOps, Powered by Vorpal.
1. [Freshdesk](https://github.com/wechaty/wechaty-freshdesk) by [@huan](https://github.com/huan) - Managing Conversations in WeChat Rooms by Freshdesk.
1. [QnAMaker](https://github.com/wechaty/wechaty-plugin-qnamaker) by [@huan](https://github.com/huan) - Wechaty QnAMaker Plugin helps you to answer questions in WeChat with the power of <https://QnAMaker.ai>.
1. [Weixin OpenAI](https://github.com/wechaty/wechaty-weixin-openai) by [@windmemory](https://github.com/windmemory) - Wechaty Weixin OpenAI Plugin helps you to answer questions in WeChat with the power of <https://openai.weixin.qq.com>.
1. [YouDao Translate](https://github.com/chs97/wechaty-plugin-youdao) by [@Chs97](https://github.com/chs97) - Wechaty YouDao Translate Plugin helps you to translate word in WeChat with the power of <https://ai.youdao.com/>.
1. [Log Monitor](https://github.com/archywillhe/wechaty-log-monitor) by [@ArchyWillHe](https://github.com/archywillhe) - For log-related DevOps using only WeChat! Fully functional! Very loose coupling! Pretty much pure (other than side effects in I.O.)! Also contains features like QR Rescue (aka 掉线给码) for 2 Wechaties to rescue one another when one is disconnected from the grpc server.
1. [Wechaty Xyao](https://github.com/watertao/wechaty-plugin-xyao) by [@watertao](https://github.com/watertao) - Wechaty Xyao Plugin gives bot ability to execute instruction with distributed brain module.
1. [Wechaty-fanli](https://github.com/gengchen528/wechaty-fanli) by [@Leo_chen](https://github.com/gengchen528) - help you quickly access the rebate robot about taobao

## History

### master v1.0

1. Add `SourceToTargetRoomConnector` to connect a source room to a target room by forward messages to target room.
1. Support ES Modules
    1. Deprecated `EventHotHandler` due to ESM
1. Change `MessageAwaiter` plugin to `messagePrompter` helper function. ([#60](https://github.com/wechaty/plugin-contrib/issues/60))

### v0.14 master

1. Add `types.SayableMessage` and `types.toSayableMessage`
1. Normalize config option:
    1. `dm` renamed to `contact`
    1. `at` renamed to `mention`

### v0.10 (Jun 14, 2020)

1. Export `talkers.*`, `finders.*`, and `matchers.*`
1. Add [Mustache](https://github.com/janl/mustache.js) template & view support for all talkers.
1. Add `mappers.messageMapper()`
1. Add `matcher.languageMatcher()`

### v0.8 (Jun 13, 2020)

Add more helper utility functions.

1. Matchers: `RoomMatcher`, `ContactMatcher`, `MessageMatcher`
1. Talkers: `RoomTalker`, `ContactTalker`, `MessageTalker`
1. Finders: `RoomFinder`, `ContactFinder`

### v0.6 (Jun 9, 2020)

1. New Plugins: `OneToManyRoomConnector`, `ManyToOneRoomConnector`, and `ManyToManyRoomConnector`.
1. New Plugin: `FriendshipAccepter` for setting to accept friendship automatically.
1. New Plugin: `RoomInviter` for invite user to rooms with `password`, `rule`, and `welcome` options support.
1. New Plugin: `EventHotHandler` for hot reloading event handler module files.

### v0.4 (May 2020)

1. New plugin: `ChatOps`: forward all DM & Mention messages to a Room for logging.

### v0.2 (May 2020)

Added the following Wechaty Plugins:

1. DingDong
1. EventLogger
1. QRCodeTerminal
1. Heartbeat

### v0.0.1 (Apr 2020)

The `wechaty-plugin-contrib` project was kicked off by the issue [Wechaty Plugin Support with Kickout Example #1939](https://github.com/wechaty/wechaty/issues/1939) and the PR [feat: added wechaty plugin #1946](https://github.com/wechaty/wechaty/pull/1946).

## Contributors

[![contributor](https://sourcerer.io/fame/huan/wechaty/wechaty-plugin-contrib/images/0)](https://sourcerer.io/fame/huan/wechaty/wechaty-plugin-contrib/links/0)
[![contributor](https://sourcerer.io/fame/huan/wechaty/wechaty-plugin-contrib/images/1)](https://sourcerer.io/fame/huan/wechaty/wechaty-plugin-contrib/links/1)
[![contributor](https://sourcerer.io/fame/huan/wechaty/wechaty-plugin-contrib/images/2)](https://sourcerer.io/fame/huan/wechaty/wechaty-plugin-contrib/links/2)
[![contributor](https://sourcerer.io/fame/huan/wechaty/wechaty-plugin-contrib/images/3)](https://sourcerer.io/fame/huan/wechaty/wechaty-plugin-contrib/links/3)
[![contributor](https://sourcerer.io/fame/huan/wechaty/wechaty-plugin-contrib/images/4)](https://sourcerer.io/fame/huan/wechaty/wechaty-plugin-contrib/links/4)
[![contributor](https://sourcerer.io/fame/huan/wechaty/wechaty-plugin-contrib/images/5)](https://sourcerer.io/fame/huan/wechaty/wechaty-plugin-contrib/links/5)
[![contributor](https://sourcerer.io/fame/huan/wechaty/wechaty-plugin-contrib/images/6)](https://sourcerer.io/fame/huan/wechaty/wechaty-plugin-contrib/links/6)
[![contributor](https://sourcerer.io/fame/huan/wechaty/wechaty-plugin-contrib/images/7)](https://sourcerer.io/fame/huan/wechaty/wechaty-plugin-contrib/links/7)

## Maintainers

- @gcaufy - [Gcuafy](https://github.com/Gcaufy), Creator of [WePY](https://github.com/tencent/wepy)
- @huan - [Huan LI](https://github.com/huan) ([李卓桓](http://linkedin.com/in/zixia)), Tencent TVP of Chatbot

## Copyright & License

- Code & Docs © 2020 Wechaty Contributors <https://github.com/wechaty>
- Code released under the Apache-2.0 License
- Docs released under Creative Commons

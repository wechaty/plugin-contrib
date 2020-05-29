# wechaty-plugin-contrib [![Wechaty Plugin Contrib](https://img.shields.io/badge/Wechaty%20Plugin-Contrib-brightgreen.svg)](https://github.com/wechaty/wechaty-plugin-contrib)

 [![NPM Version](https://img.shields.io/npm/v/wechaty-plugin-contrib?color=brightgreen)](https://www.npmjs.com/package/wechaty-plugin-contrib) [![NPM](https://github.com/wechaty/wechaty-plugin-contrib/workflows/NPM/badge.svg)](https://github.com/wechaty/wechaty-plugin-contrib/actions?query=workflow%3ANPM)

Wechaty Plugin Contrib Package for the Community

![Wechaty Plugin](docs/images/plugin.png)

> Image Credit: [What is Plugin](https://www.computerhope.com/jargon/p/plugin.htm)

[![Powered by Wechaty](https://img.shields.io/badge/Powered%20By-Wechaty-brightgreen.svg)](https://github.com/Wechaty/wechaty)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-blue.svg)](https://www.typescriptlang.org/)

## Introduction

When you find yourself writing repetitive code, it's time to extract it into a plugin.

Wechaty has a great support for using Plugins by calling `Wechaty.use(WechatyPlugin())`. A Wechaty Plugin is a JavaScript function that returns a function which accepts a Wechaty instance.

The first Wechaty Plugin system was design by our core team developer [@gcaufy](https://github.com/gcaufy) from issue [#1939](https://github.com/wechaty/wechaty/issues/1939)(Wechaty Plugin Support with Kickout Example) to PR [#1946](https://github.com/wechaty/wechaty/pull/1946)(feat: added wechaty plugin).

This package is for publishing the Wechaty Plugins that are very common used by the core developer team.

## Requirements

1. Wechaty v0.39.25 or above versions

## Plugins Contrib

You are welcome to send your plugin to our contrib by creating a Pull Request!

| # | Plugin | Author | Feature |
| :--- | :--- | :--- | :--- |
| 1 | DingDong | @huan | Reply `dong` if bot receives a `ding` message. |
| 2 | EventLogger | @huan | Log Wechaty Events for `"scan" | "login" | "message"` ... etc. |
| 3 | QRCodeTerminal | @huan | Show QR Code for Scan in Terminal |
| 4 | Heartbeat | @huan | Send emoji periodically |
| 5 | ChatOps | @ huan | Forward DM & Mention messages to a room |

### 1 DingDong

- Description: Reply `dong` if bot receives a `ding` message.
- Author: @huan

```ts
import { DingDong } from 'wechaty-plugin-contrib'

const options = {
  at   : true,    // default: true - Response to Mention Self (@/at) Message in Room
  dm   : true,    // default: true - Response to Direct Message
  room : true,    // default: true - Response to Rooms Message
}

wechaty.use(DingDong(options))
```

#### `options` as a Function

`options` can also be a function which receives a `message: Message` and returns a `boolean` result to decide whether response a `ding` message.

`optoins: (message: Message) => boolean | Promise<boolean>`

### 2 EventLogger

- Description: Log Wechaty Events: `"dong" | "message" | "error" | "friendship" | "heartbeat" | "login" | "logout" | "ready" | "reset" | "room-invite" | "room-join" | "room-leave" | "room-topic" | "scan"`
- Author: @huan

```ts
import { EventLogger } from 'wechaty-plugin-contrib'
const options = ['login', 'ready', 'message']
// Do not provide an options will log all events.
wechaty.use(EventLogger(options))
```

### 3 QR Code Terminal

- Description: Show QR Code for Scan in Terminal
- Author: @huan

```ts
import { QRCodeTerminal } from 'wechaty-plugin-contrib'
const options = {
  small: false,   // default: false - the size of the printed QR Code in terminal
}
wechaty.use(QRCodeTerminal(options))
```

### 4 Heartbeat

- Description: Send emoji periodically
- Author: @huan

```ts
import { Heartbeat } from 'wechaty-plugin-contrib'
const options = {
  contact: 'filehelper',    // default: filehelper - Contact id who will receive the emoji
  emoji: {
    heartbeat: '[爱心]',    // default: [爱心] - Heartbeat emoji
  },
  intervalSeconds: 60 * 60, // Default: 1 hour - Send emoji for every 1 hour
}
wechaty.use(Heartbeat(options))
```

### 5 ChatOps

- Description: Forward DM & Mention messages to a ChatOps room for logging.
- Author: @huan

```ts
import { ChatOps } from 'wechaty-plugin-contrib'

const options = {
  at   : true,            // default: true - Response to Mention Self (@/at) Message in Room
  dm   : true,            // default: true - Response to Direct Message
  room : 'xxx@chatroom',  // required: room id for ChatOps
}

wechaty.use(ChatOps(options))
```

## Wechaty Plugin Directory

[![Wechaty Plugin Contrib](https://img.shields.io/badge/Wechaty%20Plugin-Directory-brightgreen.svg)](https://github.com/wechaty/wechaty-plugin-contrib#wechaty-plugin-directory)

The Wechaty Plugin Contrib will only accept simple plugins which does not dependence very heavy NPM modules, and the SLOC (Source Line Of Code) is no more than 100.

There are many great Wechaty Plugins can not be included in the contrib because they are too powerful. They will be published as a NPM by itself.

We are listing those powerful Wechaty Plugins outside the contrib as in the following list, and you are welcome to add your plugin below if you have published any!

### 1 Voteout

- Link: [Wechaty Voteout Plugin](https://github.com/Gcaufy/wechaty-voteout)
- Description: help you to have a vote and kickout feature for you room.
- Author: @gcaufy

### 2 Wechaty Schedule

- Link: [Wechaty Schedule](https://github.com/Gcaufy/wechaty-schedule)
- Description: easily schedule jobs for your Wechaty bots.
- Author: @gcaufy

### 3 GotKicked

- Link: [GotKicked](https://github.com/wechaty/wechaty-got-kicked-out)
- Description: This is a wechaty plugin to monitor whether your bot got kicked out of group chat. Just few line of code to implement this instead fussy judging.
- Author: [@LegendaryJesse](https://github.com/JesseWeb)

## History

### master

### v0.4 (May 2020)

1. New plugin `ChatOps`: forward all DM & Mention messages to a Room for logging.

### v0.2 (May 2020)

Added the following Wechaty Plugins:

1. DingDong
1. EventLogger
1. QRCodeTerminal
1. Heartbeat

### v0.0.1 (Apr 2020)

Kicked off by issue [#1939](https://github.com/wechaty/wechaty/issues/1939)(Wechaty Plugin Support with Kickout Example) and PR [#1946](https://github.com/wechaty/wechaty/pull/1946)(feat: added wechaty plugin).

## Maintainers

- @gcaufy - [Gcuafy](https://github.com/Gcaufy), Creator of [WePY](https://github.com/tencent/wepy)
- @huan - [Huan LI](https://github.com/huan) ([李卓桓](http://linkedin.com/in/zixia)), Tencent TVP of Chatbot

## Copyright & License

- Code & Docs © 2020 Wechaty (<https://github.com/wechaty>)
- Code released under the Apache-2.0 License
- Docs released under Creative Commons

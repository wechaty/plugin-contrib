# wechaty-plugin-contrib

 [![NPM Version](https://img.shields.io/npm/v/wechaty-plugin-contrib?color=brightgreen)](https://www.npmjs.com/package/wechaty-plugin-contrib) [![NPM](https://github.com/wechaty/wechaty-plugin-contrib/workflows/NPM/badge.svg)](https://github.com/wechaty/wechaty-plugin-contrib/actions?query=workflow%3ANPM)

Wechaty Plugin Contrib Package for the Community

![Wechaty Plugin](docs/images/plugin.png)

> Image: [What is Plugin](https://www.computerhope.com/jargon/p/plugin.htm)

[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-blue.svg)](https://www.typescriptlang.org/)

## Introduction

Wechaty has a great support for using Plugins by calling `Wechaty.use(plugin)`. A Wechaty Plugin is a JavaScript function that returns a function that accept a Wechaty instance.

The first Wechaty Plugin system was design by our core team developer [@gcaufy](https://github.com/gcaufy) from issue [#1939](https://github.com/wechaty/wechaty/issues/1939)(Wechaty Plugin Support with Kickout Example) to PR [#1946](https://github.com/wechaty/wechaty/pull/1946)(feat: added wechaty plugin).

This package is for publishing the Wechaty Plugins that are very common used by the core developer team.

## Requirements

1. Wechaty 0.39.21 or above versions

## Plugins

You are welcome to send your plugin to our contrib by creating a Pull Request!

1. DingDong - Reply `dong` if bot receives a `ding` message.
1. EventLogger - Log Wechaty Events for "dong" | "message" ... etc.
1. QRCodeTerminal - Show QR Code for Scan in Terminal

### DingDong

- Description: Reply `dong` if bot receives a `ding` message.
- Author: @huan - Huan LI (李卓桓)

```ts
import { DingDong } from 'wechaty-plugin-contrib'

const options = {
  at   : false,   // default: false - Only react message that mentioned self (@) in Room
  dm   : true,    // default: true - React to Direct Message
  room : true,    // default: true - React in Rooms
}

wechaty.use(DingDong(options))
```

### EventLogger

- Description: Log Wechaty Events: "dong" | "message" | "error" | "friendship" | "heartbeat" | "login" | "logout" | "ready" | "reset" | "room-invite" | "room-join" | "room-leave" | "room-topic" | "scan"
- Author: @huan - Huan LI (李卓桓)

```ts
import { EventLogger } from 'wechaty-plugin-contrib'
wechaty.use(EventLogger(['login', 'logout', 'message']))
```

### QR Code Terminal

- Description: Show QR Code for Scan in Terminal
- Author: @huan - Huan LI (李卓桓)

```ts
import { QRCodeTerminal } from 'wechaty-plugin-contrib'
const options = {
  small: false,   // default: false - the size of the printed QR Code in terminal
}
wechaty.use(QRCodeTerminal(options))
```

## Maintainers

- @gcaufy - [Gcuafy](https://github.com/Gcaufy), Creator of [WePY](https://github.com/tencent/wepy)
- @huan - [Huan LI](https://github.com/huan) ([李卓桓](http://linkedin.com/in/zixia)), Tencent TVP of Chatbot

## Copyright & License

- Code & Docs © 2020-now Wechaty
- Code released under the Apache-2.0 License
- Docs released under Creative Commons

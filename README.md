# wechaty-plugin-contrib

 [![NPM Version](https://img.shields.io/npm/v/wechaty-plugin-contrib?color=brightgreen)](https://www.npmjs.com/package/wechaty-plugin-contrib) [![NPM](https://github.com/wechaty/wechaty-plugin-contrib/workflows/NPM/badge.svg)](https://github.com/wechaty/wechaty-plugin-contrib/actions?query=workflow%3ANPM)

Wechaty Plugin Ecosystem Contrib Package

![Wechaty Plugin](docs/images/plugin.png)

> Image: [What is Plugin](https://www.computerhope.com/jargon/p/plugin.htm)

[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-blue.svg)](https://www.typescriptlang.org/)

## Background

- Issue: Wechaty Plugin Support with Kickout Example [#1939](https://github.com/wechaty/wechaty/issues/1939)
- PR: feat: added wechaty plugin [#1946](https://github.com/wechaty/wechaty/pull/1946)

## Plugins

You are welcome to send your plugin to our contrib by creating a Pull Request!

### DingDong

- Author: @huan - Huan LI (李卓桓)
- Description: Reply `dong` if bot receives a `ding` message.

```ts
import { DingDong } from 'wechaty-plugin-contrib'
wechaty.use(DingDong())
```

## Maintainers

- @gcaufy - [Cheng GONG](https://github.com/Gcaufy) (龚澄), Creator of [WePY](https://github.com/tencent/wepy)
- @huan - [Huan LI](https://github.com/huan) ([李卓桓](http://linkedin.com/in/zixia)), Tencent TVP of Chatbot

## Copyright & License

- Code & Docs © 2020-now Wechaty
- Code released under the Apache-2.0 License
- Docs released under Creative Commons

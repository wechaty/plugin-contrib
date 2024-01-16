import { Wechaty, log } from 'wechaty'
import type MqttProxy from '../mqtt-proxy'
import type { CommandInfo } from '../utils.js'

export const handleWechaty = async (bot:Wechaty, mqttProxy:MqttProxy, commandInfo:CommandInfo) => {
  log.info('handleWechaty', bot, mqttProxy, commandInfo)
  const { reqId, name, params } = commandInfo
  log.info('handleWechaty', reqId, name, params)
  switch (name) {
    case 'wechatyStart': { // 启动
      log.info('cmd name:' + name)
      try {
        await bot.start()
      } catch (err) {
        log.error('启动失败：', err)
      }
      break
    }
    case 'wechatyStop': { // 停止
      log.info('cmd name:' + name)
      try {
        await bot.stop()
      } catch (err) {
        log.error('停止失败：', err)
      }
      break
    }
    case 'wechatyLogout': { // 登出
      log.info('cmd name:' + name)
      try {
        await bot.logout()
      } catch (err) {
        log.error('登出失败：', err)
      }
      break
    }
    case 'wechatyLogonoff': { // 获取登录状态
      log.info('cmd name:' + name)
      break
    }
    case 'wechatyUserSelf': { // 获取当前登录用户信息
      log.info('cmd name:' + name)
      try {
        const userSelf = await bot.currentUser
        log.info('userSelf:', userSelf)
      } catch (err) {
        log.error('获取用户失败：', err)
      }
      break
    }

    case 'wechatySay':
      log.info('cmd name:' + name)
      break
    default:
      log.error('Unknown command:', name)
  }
}

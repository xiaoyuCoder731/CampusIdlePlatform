import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // 登录有效期常量：24小时 毫秒
  const LOGIN_DURATION = 24 * 60 * 60 * 1000

  // 状态
  const user = ref(null)
  const expiresAt = ref(null)

  // 工具：安全读取本地存储
  const safeGetStorage = (key) => {
    try {
      return localStorage.getItem(key)
    } catch (err) {
      console.error('读取存储失败', key, err)
      return null
    }
  }

  // 工具：安全写入本地存储
  const safeSetStorage = (key, value) => {
    try {
      localStorage.setItem(key, value)
    } catch (err) {
      console.error('写入存储失败', key, err)
    }
  }

  // 工具：删除存储
  const removeStorage = (key) => {
    try {
      localStorage.removeItem(key)
    } catch (err) {
      console.error('删除存储失败', key, err)
    }
  }

  // 计算属性：是否处于有效登录状态
  const isLoggedIn = computed(() => {
    if (!user.value || !expiresAt.value) return false
    return Date.now() < expiresAt.value
  })

  /**
   * 登录，保存用户信息并设置24小时有效期
   * @param {Object} userInfo 用户信息（含role）
   */
  const login = (userInfo) => {
    user.value = userInfo
    const now = Date.now()
    expiresAt.value = now + LOGIN_DURATION

    safeSetStorage('campus_user', JSON.stringify(user.value))
    safeSetStorage('campus_expiresAt', expiresAt.value.toString())
  }

  /**
   * 续期登录有效期（重新刷新24小时）
   */
  const refreshToken = () => {
    if (!isLoggedIn.value) return
    const now = Date.now()
    expiresAt.value = now + LOGIN_DURATION
    safeSetStorage('campus_expiresAt', expiresAt.value.toString())
  }

  /**
   * 退出登录，清空状态与本地缓存
   */
  const logout = () => {
    user.value = null
    expiresAt.value = null
    removeStorage('campus_user')
    removeStorage('campus_expiresAt')
  }

  /**
   * 页面初始化校验登录状态，刷新恢复登录
   * @returns {boolean} 是否有效登录
   */
  const checkLoginStatus = () => {
    const savedUserStr = safeGetStorage('campus_user')
    const savedExpiresStr = safeGetStorage('campus_expiresAt')

    // 不存在缓存直接返回未登录
    if (!savedUserStr || !savedExpiresStr) return false

    // 校验过期时间是否合法数字
    const expiresTime = Number(savedExpiresStr)
    if (isNaN(expiresTime)) {
      logout()
      return false
    }

    // 判断是否过期
    if (Date.now() >= expiresTime) {
      logout()
      return false
    }

    // 解析用户信息，捕获JSON格式错误
    try {
      user.value = JSON.parse(savedUserStr)
    } catch (err) {
      console.error('用户信息解析失败', err)
      logout()
      return false
    }

    expiresAt.value = expiresTime
    return true
  }

  return {
    user,
    expiresAt,
    isLoggedIn,
    login,
    logout,
    refreshToken,
    checkLoginStatus
  }
})
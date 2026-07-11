import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const expiresAt = ref(null)

  const isLoggedIn = computed(() => {
    if (!user.value || !expiresAt.value) return false
    return Date.now() < expiresAt.value
  })

  const login = (userInfo) => {
    user.value = userInfo
    expiresAt.value = Date.now() + 24 * 60 * 60 * 1000
    localStorage.setItem('campus_user', JSON.stringify(user.value))
    localStorage.setItem('campus_expiresAt', expiresAt.value.toString())
  }

  const logout = () => {
    user.value = null
    expiresAt.value = null
    localStorage.removeItem('campus_user')
    localStorage.removeItem('campus_expiresAt')
  }

  const checkLoginStatus = () => {
    const savedUser = localStorage.getItem('campus_user')
    const savedExpiresAt = localStorage.getItem('campus_expiresAt')
    
    if (savedUser && savedExpiresAt) {
      const expiresTime = parseInt(savedExpiresAt)
      if (Date.now() < expiresTime) {
        user.value = JSON.parse(savedUser)
        expiresAt.value = expiresTime
        return true
      } else {
        logout()
        return false
      }
    }
    return false
  }

  return {
    user,
    expiresAt,
    isLoggedIn,
    login,
    logout,
    checkLoginStatus
  }
})

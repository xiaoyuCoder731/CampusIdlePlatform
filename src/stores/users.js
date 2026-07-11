import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockUsers } from '@/data/mockData'

export const useUsersStore = defineStore('users', () => {
  const users = ref([])

  // 本地存储安全工具
  const loadStorage = (key) => {
    try {
      const str = localStorage.getItem(key)
      return str ? JSON.parse(str) : null
    } catch (err) {
      console.error(`读取${key}失败`, err)
      localStorage.removeItem(key)
      return null
    }
  }

  const saveStorage = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (err) {
      console.error(`保存${key}失败`, err)
    }
  }

  // 初始化用户列表，路由守卫仅执行一次
  const initUsers = () => {
    const saved = loadStorage('campus_users')
    if (saved && Array.isArray(saved)) {
      users.value = saved
    } else {
      users.value = [...mockUsers]
      saveStorage('campus_users', users.value)
    }
  }

  // 持久化用户列表
  const saveUsers = () => saveStorage('campus_users', users.value)

  // 根据id查找用户
  const getUserById = (id) => users.value.find(u => u.id === id)

  // 根据学号查找用户（注册登录查重）
  const getUserByStudentId = (studentId) => users.value.find(u => u.studentId === studentId)

  /**
   * 新增用户，自动校验id、学号不重复
   * @param {Object} user 用户完整信息
   * @returns {Boolean} true新增成功 / false重复
   */
  const addUser = (user) => {
    // 校验ID重复
    if (getUserById(user.id)) return false
    // 校验学号重复
    if (getUserByStudentId(user.studentId)) return false
    users.value.push(user)
    saveUsers()
    return true
  }

  /**
   * 更新用户信息
   * @param {Number} id 用户id
   * @param {Object} updateData 修改字段
   * @returns {Boolean} 是否找到并更新
   */
  const updateUser = (id, updateData) => {
    const target = getUserById(id)
    if (!target) return false
    Object.assign(target, updateData)
    saveUsers()
    return true
  }

  /**
   * 删除用户
   * @param {Number} id 用户id
   * @returns {Boolean} 是否删除成功
   */
  const deleteUser = (id) => {
    const idx = users.value.findIndex(u => u.id === id)
    if (idx === -1) return false
    users.value.splice(idx, 1)
    saveUsers()
    return true
  }

  // 筛选学生、管理员
  const studentUsers = computed(() => users.value.filter(u => u.role === 'student'))
  const adminUsers = computed(() => users.value.filter(u => u.role === 'admin'))

  // 重置仓库：清空所有用户+本地缓存
  const resetStore = () => {
    users.value = []
    localStorage.removeItem('campus_users')
  }

  return {
    users,
    initUsers,
    getUserById,
    getUserByStudentId,
    addUser,
    updateUser,
    deleteUser,
    studentUsers,
    adminUsers,
    resetStore
  }
})
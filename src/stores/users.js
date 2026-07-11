import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockUsers } from '@/data/mockData'

export const useUsersStore = defineStore('users', () => {
  const users = ref([])

  const initUsers = () => {
    const savedUsers = localStorage.getItem('campus_users')
    if (savedUsers) {
      users.value = JSON.parse(savedUsers)
    } else {
      users.value = [...mockUsers]
      localStorage.setItem('campus_users', JSON.stringify(users.value))
    }
  }

  const saveUsers = () => {
    localStorage.setItem('campus_users', JSON.stringify(users.value))
  }

  const getUserById = (id) => {
    return users.value.find(u => u.id === id)
  }

  const getUserByStudentId = (studentId) => {
    return users.value.find(u => u.studentId === studentId)
  }

  const addUser = (user) => {
    users.value.push(user)
    saveUsers()
  }

  const updateUser = (id, updateData) => {
    const index = users.value.findIndex(u => u.id === id)
    if (index !== -1) {
      users.value[index] = { ...users.value[index], ...updateData }
      saveUsers()
    }
  }

  const deleteUser = (id) => {
    const index = users.value.findIndex(u => u.id === id)
    if (index !== -1) {
      users.value.splice(index, 1)
      saveUsers()
    }
  }

  const studentUsers = computed(() => users.value.filter(u => u.role === 'student'))
  const adminUsers = computed(() => users.value.filter(u => u.role === 'admin'))

  return {
    users,
    initUsers,
    getUserById,
    getUserByStudentId,
    addUser,
    updateUser,
    deleteUser,
    studentUsers,
    adminUsers
  }
})
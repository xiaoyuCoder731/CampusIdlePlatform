<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>校园闲置物品互助平台</h1>
        <p>登录你的校园账号</p>
      </div>
      <a-form :model="form" :rules="rules" ref="formRef" layout="vertical" @submit.prevent="handleLogin">
        <a-form-item field="studentId" label="学号">
          <a-input v-model:value="form.studentId" placeholder="请输入学号" size="large">
            <template #prefix>
              <UserOutlined />
            </template>
          </a-input>
        </a-form-item>
        <a-form-item field="password" label="密码">
          <a-input-password v-model:value="form.password" placeholder="请输入密码" size="large">
            <template #prefix>
              <LockOutlined />
            </template>
          </a-input-password>
        </a-form-item>
        <a-form-item>
          <a-button 
            type="primary" 
            size="large" 
            block 
            @click="handleLogin" 
            :loading="loading"
            :disabled="loading"
          >
            登录
          </a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useUsersStore } from '@/stores/users'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const usersStore = useUsersStore()

const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  studentId: '',
  password: ''
})

// 表单校验规则
const rules = {
  studentId: [
    { required: true, message: '请输入学号', trigger: 'blur' },
    { min: 1, max: 20, message: '学号长度限制1-20位', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度6-20位', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (loading.value) return
  try {
    await formRef.value.validate()
    loading.value = true
    
    usersStore.initUsers()
    
    setTimeout(() => {
      const targetUser = usersStore.getUserByStudentId(form.studentId)
      // 账号不存在
      if (!targetUser) {
        message.error('该学号未注册，请核对学号')
        loading.value = false
        return
      }
      // 密码不匹配
      if (targetUser.password !== form.password) {
        message.error('密码输入错误')
        loading.value = false
        return
      }

      // 登录保存用户信息
      userStore.login({
        id: targetUser.id,
        studentId: targetUser.studentId,
        username: targetUser.username,
        grade: targetUser.grade,
        department: targetUser.department,
        role: targetUser.role
      })
      message.success('登录成功')

      // 回跳逻辑：优先跳转登录前页面，无则按角色跳转首页
      const redirectPath = route.query.redirect
      if (redirectPath) {
        router.push(redirectPath)
      } else {
        router.push(targetUser.role === 'admin' ? '/admin' : '/goods')
      }
      loading.value = false
    }, 400)
  } catch (error) {
    console.error('表单校验失败:', error)
    loading.value = false
  }
}

onMounted(() => {
  usersStore.initUsers()
  
  const isValid = userStore.checkLoginStatus()
  if (isValid) {
    const targetPath = userStore.user.role === 'admin' ? '/admin' : '/goods'
    router.push(targetPath)
    message.info('你已登录，无需重复操作')
  }
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  font-size: 24px;
  color: #333;
  margin: 0 0 8px;
}

.login-header p {
  font-size: 14px;
  color: #999;
  margin: 0;
}
</style>
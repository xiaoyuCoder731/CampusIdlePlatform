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
          <a-button type="primary" size="large" block @click="handleLogin" :loading="loading">
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
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useUsersStore } from '@/stores/users'

const router = useRouter()
const userStore = useUserStore()
const usersStore = useUsersStore()
const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  studentId: '',
  password: ''
})

const rules = {
  studentId: [
    { required: true, message: '请输入学号', trigger: 'blur' },
    { min: 1, max: 20, message: '学号长度在1-20之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在6-20之间', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  try {
    await formRef.value.validate()
    loading.value = true
    
    setTimeout(() => {
      const user = usersStore.getUserByStudentId(form.studentId)
      
      if (user && user.password === form.password) {
        userStore.login({
          id: user.id,
          studentId: user.studentId,
          username: user.username,
          grade: user.grade,
          department: user.department,
          role: user.role
        })
        message.success('登录成功')
        if (user.role === 'admin') {
          router.push('/admin')
        } else {
          router.push('/goods')
        }
      } else {
        message.error('学号或密码错误')
      }
      loading.value = false
    }, 500)
  } catch (error) {
    console.error('表单校验失败:', error)
  }
}

onMounted(() => {
  usersStore.initUsers()
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
  margin-bottom: 8px;
}

.login-header p {
  font-size: 14px;
  color: #999;
}

.login-tips {
  margin-top: 20px;
  text-align: center;
}

.login-tips p {
  font-size: 12px;
  color: #999;
  margin: 4px 0;
}
</style>

<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <div class="error-icon">404</div>
      <h1>页面未找到</h1>
      <p>你访问的页面不存在或已被删除</p>
      <a-button type="primary" @click="goBack">
        返回首页
      </a-button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.push('/goods')
}
</script>

<style scoped>
.not-found-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
}

.not-found-content {
  text-align: center;
  padding: 40px;
}

.error-icon {
  font-size: 80px;
  font-weight: bold;
  color: #ff4d4f;
  margin-bottom: 20px;
}

.not-found-content h1 {
  font-size: 28px;
  color: #333;
  margin-bottom: 12px;
}

.not-found-content p {
  font-size: 16px;
  color: #999;
  margin-bottom: 30px;
}
</style>

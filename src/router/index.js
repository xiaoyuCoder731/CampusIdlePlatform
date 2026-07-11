import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useGoodsStore } from '@/stores/goods'
import { useUsersStore } from '@/stores/users'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/goods',
    name: 'GoodsList',
    component: () => import('@/views/GoodsList.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/my-goods',
    name: 'MyGoods',
    component: () => import('@/views/MyGoods.vue'),
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/Admin.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/',
    redirect: '/goods'
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/goods'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

let isInitialized = false

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const goodsStore = useGoodsStore()
  const usersStore = useUsersStore()

  if (!isInitialized) {
    goodsStore.initGoods()
    usersStore.initUsers()
    isInitialized = true
  }

  userStore.checkLoginStatus()

  if (!to.meta.requiresAuth) {
    return next()
  }

  if (!userStore.isLoggedIn) {
    return next({ name: 'Login', query: { redirect: to.fullPath } })
  }

  const targetRole = to.meta.role
  if (targetRole && userStore.user.role !== targetRole) {
    return next('/goods')
  }

  next()
})

export default router
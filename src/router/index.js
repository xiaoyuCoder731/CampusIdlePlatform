import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

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
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    redirect: '/goods'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  userStore.checkLoginStatus()
  
  if (to.meta.requiresAuth) {
    if (userStore.isLoggedIn) {
      if (to.meta.role) {
        if (userStore.user.role === to.meta.role) {
          next()
        } else {
          next('/goods')
        }
      } else {
        next()
      }
    } else {
      next('/login')
    }
  } else {
    next()
  }
})

export default router

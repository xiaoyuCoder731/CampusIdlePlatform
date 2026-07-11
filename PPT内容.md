# 校园闲置物品互助平台 - 项目报告PPT

---

## 幻灯片1：封面

**标题：** 校园闲置物品互助平台

**副标题：** Vue 3 课程设计项目报告

**作者：** [你的姓名]

**学号：** [你的学号]

**日期：** [日期]

---

## 幻灯片2：项目概述

### 项目背景
- 校园内学生之间存在大量闲置物品流转需求
- 传统线下交易效率低、信息不对称
- 需要一个便捷的线上平台促进闲置物品交易

### 项目目标
- 提供校园闲置物品发布、浏览、交易的一站式服务
- 实现用户注册登录、商品管理、订单管理等核心功能
- 构建简洁美观、易于使用的Web应用

---

## 幻灯片3：技术栈

### 前端框架
- **Vue 3** - 渐进式JavaScript框架
- **Vite** - 新一代前端构建工具
- **Vue Router** - Vue官方路由管理器
- **Pinia** - Vue官方状态管理库

### UI组件库
- **Ant Design Vue** - 企业级UI组件库

### 数据存储
- **LocalStorage** - 本地存储，实现数据持久化

### 部署方式
- **GitHub Pages** - 免费静态网站托管

---

## 幻灯片4：功能架构

```
┌─────────────────────────────────────┐
│          校园闲置物品互助平台          │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────┐  ┌─────────────┐  │
│  │   商品浏览   │  │   用户登录   │  │
│  │   搜索筛选   │  │   权限控制   │  │
│  └──────┬──────┘  └──────┬──────┘  │
│         │                │          │
│  ┌──────▼──────┐  ┌──────▼──────┐  │
│  │   商品发布   │  │   管理员后台 │  │
│  │   商品管理   │  │   用户管理   │  │
│  └──────┬──────┘  │   商品管理   │  │
│         │         └─────────────┘  │
│  ┌──────▼──────┐                    │
│  │   商品购买   │                    │
│  │   订单管理   │                    │
│  └─────────────┘                    │
│                                     │
└─────────────────────────────────────┘
```

---

## 幻灯片5：核心功能 - 用户系统

### 登录功能
- 支持学号登录（代替用户名）
- 密码验证和错误提示
- Enter键快捷登录
- 登录状态持久化（刷新页面保持登录）

### 角色权限
- **学生角色**：浏览商品、发布商品、购买商品
- **管理员角色**：管理所有商品、管理所有用户

### 路由守卫
- 未登录用户自动跳转登录页
- 权限校验：学生无法访问管理员页面

---

## 幻灯片6：核心功能 - 商品管理

### 商品列表
- 商品名称、分类、价格、状态展示
- 状态筛选：在售、已售出、已下架
- 关键词搜索（支持模糊匹配）

### 发布商品
- 商品名称、分类、价格、描述
- 表单验证确保数据完整性

### 商品操作
- 编辑商品信息
- 下架商品（在售→已下架）
- 删除商品（直接执行，无确认弹窗）

---

## 幻灯片7：核心功能 - 购买功能

### 购买流程
1. 点击商品查看详情
2. 填写收货地址（必填项）
3. 确认购买
4. 商品状态变为"已售出"

### 订单管理
- 购买记录自动保存
- 订单信息包含：商品名称、价格、购买时间、收货地址

---

## 幻灯片8：核心功能 - 管理员后台

### 用户管理
- 用户列表展示：用户名、学号、年级、院系、角色
- 添加新用户（设置初始密码）
- 编辑用户信息（不可修改密码）
- 删除用户（管理员账号不可删除）

### 商品管理
- 查看所有商品
- 删除违规商品
- 查看商品状态统计

---

## 幻灯片9：项目文件结构

```
CampusIdlePlatform/
├── public/                  # 静态资源
├── src/
│   ├── components/          # 公共组件
│   ├── composables/         # 组合式函数
│   ├── data/
│   │   └── mockData.js      # 模拟数据
│   ├── router/
│   │   └── index.js         # 路由配置
│   ├── stores/              # Pinia状态管理
│   │   ├── goods.js         # 商品状态
│   │   ├── user.js          # 用户登录状态
│   │   └── users.js         # 用户列表
│   ├── views/               # 页面组件
│   │   ├── Login.vue        # 登录页
│   │   ├── GoodsList.vue    # 商品列表
│   │   ├── MyGoods.vue      # 我的商品
│   │   └── Admin.vue        # 管理员后台
│   ├── App.vue              # 根组件
│   ├── main.js              # 入口文件
│   └── style.css            # 全局样式
├── index.html
├── package.json
├── vite.config.js           # Vite配置
└── .gitignore
```

---

## 幻灯片10：关键代码展示 - 登录逻辑

```javascript
// src/views/Login.vue

const handleLogin = async () => {
  await formRef.value.validate()
  
  const targetUser = usersStore.getUserByStudentId(form.studentId)
  
  if (!targetUser) {
    message.error('该学号未注册，请核对学号')
    return
  }
  
  if (targetUser.password !== form.password) {
    message.error('密码输入错误')
    return
  }
  
  // 登录成功，保存用户信息
  userStore.login({
    id: targetUser.id,
    studentId: targetUser.studentId,
    username: targetUser.username,
    role: targetUser.role
  })
  
  // 根据角色跳转对应页面
  router.push(targetUser.role === 'admin' ? '/admin' : '/goods')
}
```

---

## 幻灯片11：关键代码展示 - 路由守卫

```javascript
// src/router/index.js

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const goodsStore = useGoodsStore()
  const usersStore = useUsersStore()
  
  // 初始化数据（仅执行一次）
  if (!isInitialized) {
    goodsStore.initGoods()
    usersStore.initUsers()
    isInitialized = true
  }
  
  // 检查登录状态
  userStore.checkLoginStatus()
  
  // 无需认证的页面直接放行
  if (!to.meta.requiresAuth) {
    return next()
  }
  
  // 未登录跳转登录页
  if (!userStore.isLoggedIn) {
    return next({ name: 'Login', query: { redirect: to.fullPath } })
  }
  
  // 权限校验
  const targetRole = to.meta.role
  if (targetRole && userStore.user.role !== targetRole) {
    return next('/goods')
  }
  
  next()
})
```

---

## 幻灯片12：关键代码展示 - 状态管理

```javascript
// src/stores/goods.js

export const useGoodsStore = defineStore('goods', () => {
  const goods = ref([])
  const orders = ref([])
  
  // 初始化商品数据
  const initGoods = () => {
    const savedGoods = loadStorage('campus_goods')
    if (savedGoods && Array.isArray(savedGoods)) {
      goods.value = savedGoods
    } else {
      goods.value = [...mockGoods]
      saveStorage('campus_goods', goods.value)
    }
  }
  
  // 购买商品
  const purchaseGoods = (goodsId, orderData) => {
    const targetGoods = getGoodsById(goodsId)
    if (!targetGoods || targetGoods.status === 'sold') return null
    
    targetGoods.status = 'sold'
    saveGoods()
    
    const newOrder = {
      id: Date.now(),
      goodsId,
      goodsName: targetGoods.name,
      goodsPrice: targetGoods.price,
      orderTime: new Date().toLocaleString('zh-CN'),
      ...orderData
    }
    orders.value.push(newOrder)
    saveOrders()
    return newOrder
  }
  
  return { goods, orders, initGoods, purchaseGoods, ... }
})
```

---

## 幻灯片13：界面展示 - 登录页面

**页面特点：**
- 简洁现代的设计风格
- 渐变紫色背景
- 圆角卡片式登录表单
- 学号和密码输入框
- 密码可见性切换
- 响应式布局

---

## 幻灯片14：界面展示 - 商品列表

**页面特点：**
- 顶部导航栏（Logo、搜索框、用户菜单）
- 商品卡片网格布局
- 分类筛选和状态筛选
- 搜索功能（支持关键词模糊匹配）
- 商品详情弹窗

---

## 幻灯片15：界面展示 - 管理员后台

**页面特点：**
- 双Tab切换（商品管理/用户管理）
- 统计数据展示（商品总数、在售、已售、用户数）
- 表格展示商品/用户列表
- 操作按钮（编辑、删除）
- 弹窗表单（添加/编辑）

---

## 幻灯片16：项目亮点

1. **角色权限控制**
   - 学生和管理员角色分离
   - 路由守卫确保权限安全

2. **数据持久化**
   - 使用LocalStorage保存所有数据
   - 页面刷新后数据不丢失

3. **用户体验优化**
   - Enter键快捷登录
   - 删除和下架操作直接执行
   - 404页面自动跳转首页

4. **代码规范**
   - 使用Vue 3 Composition API
   - Pinia状态管理
   - 组件化开发

---

## 幻灯片17：总结与展望

### 项目总结
- 完成了校园闲置物品互助平台的核心功能
- 实现了用户登录、商品管理、购买交易、后台管理等功能
- 使用Vue 3 + Vite + Ant Design Vue技术栈
- 部署到GitHub Pages，支持公网访问

### 未来展望
- 添加图片上传功能
- 实现消息通知系统
- 添加评论和评分功能
- 移动端适配优化
- 接入真实后端API

---

## 幻灯片18：致谢

**感谢老师的指导！**

**感谢同学的帮助！**

---

## 幻灯片19：演示环节

**现场演示项目功能：**
1. 用户登录（学号：admin，密码：admin123）
2. 浏览商品列表
3. 搜索商品
4. 发布商品
5. 购买商品
6. 管理员后台管理

**访问地址：**
- GitHub Pages: https://xiaoyucoder731.github.io/CampusIdlePlatform/
- 项目仓库: https://github.com/xiaoyuCoder731/CampusIdlePlatform

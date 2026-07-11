<template>
  <div class="admin-container">
    <header class="admin-header">
      <div class="header-left">
        <h1>校园闲置物品互助平台 - 管理后台</h1>
      </div>
      <div class="header-right">
        <span class="welcome-text">管理员：{{ userStore.user.username }}</span>
        <a-button @click="handleLogout">退出登录</a-button>
      </div>
    </header>

    <main class="admin-main">
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-icon">📦</div>
          <div class="stat-info">
            <div class="stat-value">{{ totalGoods }}</div>
            <div class="stat-label">商品总数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-info">
            <div class="stat-value">{{ onSaleGoods }}</div>
            <div class="stat-label">在售商品</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-info">
            <div class="stat-value">{{ soldGoods }}</div>
            <div class="stat-label">已售出商品</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-info">
            <div class="stat-value">{{ userCount }}</div>
            <div class="stat-label">注册用户</div>
          </div>
        </div>
      </div>

      <div class="admin-tabs">
        <a-tabs default-active-key="goods" @change="handleTabChange">
          <a-tab-pane key="goods" tab="商品管理">
            <div class="tab-toolbar">
              <a-input
                v-model:value="searchKeyword"
                placeholder="搜索商品名称..."
                allow-clear
                style="width: 250px"
              />
              <a-select v-model:value="statusFilter" style="width: 120px">
                <a-select-option value="all">全部状态</a-select-option>
                <a-select-option value="on_sale">在售</a-select-option>
                <a-select-option value="off_sale">已下架</a-select-option>
                <a-select-option value="sold">已售出</a-select-option>
              </a-select>
              <a-button type="primary" @click="showGoodsModal()">
                <PlusOutlined />
                添加商品
              </a-button>
            </div>
            <a-table
              :columns="goodsColumns"
              :data-source="filteredGoods"
              row-key="id"
              :pagination="{ pageSize: 10, showSizeChanger: true }"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'status'">
                  <a-tag :color="record.status === 'on_sale' ? 'green' : record.status === 'sold' ? 'orange' : 'gray'">
                    {{ record.status === 'on_sale' ? '在售' : record.status === 'off_sale' ? '已下架' : '已售出' }}
                  </a-tag>
                </template>
                <template v-if="column.key === 'category'">
                  {{ getCategoryLabel(record.category) }}
                </template>
                <template v-if="column.key === 'price'">
                  ¥{{ record.price }}
                </template>
                <template v-if="column.key === 'action'">
                  <a-button size="small" @click="handleEditGoods(record)">
                    <EditOutlined />
                    编辑
                  </a-button>
                  <a-button
                    v-if="record.status === 'on_sale'"
                    size="small"
                    @click="handleOffSaleGoods(record)"
                  >
                    <DeleteOutlined />
                    下架
                  </a-button>
                  <a-button
                    size="small"
                    danger
                    @click="handleDeleteGoods(record)"
                  >
                    <DeleteOutlined />
                    删除
                  </a-button>
                </template>
              </template>
            </a-table>
          </a-tab-pane>

          <a-tab-pane key="users" tab="用户管理">
            <div class="tab-toolbar">
              <a-input
                v-model:value="userSearchKeyword"
                placeholder="搜索用户名或学号..."
                allow-clear
                style="width: 250px"
              />
              <a-select v-model:value="roleFilter" style="width: 120px">
                <a-select-option value="all">全部角色</a-select-option>
                <a-select-option value="admin">管理员</a-select-option>
                <a-select-option value="student">学生</a-select-option>
              </a-select>
              <a-button type="primary" @click="showUserModal()">
                <PlusOutlined />
                添加用户
              </a-button>
            </div>
            <a-table
              :columns="userColumns"
              :data-source="filteredUsers"
              row-key="id"
              :pagination="{ pageSize: 10, showSizeChanger: true }"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'role'">
                  <a-tag :color="record.role === 'admin' ? 'red' : 'blue'">
                    {{ record.role === 'admin' ? '管理员' : '学生' }}
                  </a-tag>
                </template>
                <template v-if="column.key === 'action'">
                  <a-button size="small" @click="handleEditUser(record)">
                    <EditOutlined />
                    编辑
                  </a-button>
                  <a-button
                    v-if="record.role !== 'admin'"
                    size="small"
                    danger
                    @click="handleDeleteUser(record)"
                  >
                    <DeleteOutlined />
                    删除
                  </a-button>
                </template>
              </template>
            </a-table>
          </a-tab-pane>
        </a-tabs>
      </div>
    </main>

    <a-modal
      v-model:open="goodsModalVisible"
      :title="isEditingGoods ? '编辑商品' : '添加商品'"
      :footer="null"
      width="600px"
      @cancel="closeGoodsModal"
    >
      <a-form :model="goodsForm" :rules="goodsFormRules" ref="goodsFormRef" layout="vertical">
        <a-form-item field="name" label="商品名称">
          <a-input v-model:value="goodsForm.name" placeholder="请输入商品名称" />
        </a-form-item>
        <a-form-item field="category" label="商品分类">
          <a-select v-model:value="goodsForm.category" placeholder="请选择分类">
            <a-select-option
              v-for="cat in categories.filter(c => c.value !== 'all')"
              :key="cat.value"
              :value="cat.value"
            >
              {{ cat.label }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item field="price" label="价格">
          <a-input-number v-model:value="goodsForm.price" :min="0" prefix="¥" />
        </a-form-item>
        <a-form-item field="description" label="商品描述">
          <a-textarea v-model:value="goodsForm.description" rows="4" placeholder="请输入商品描述" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSubmitGoods" :loading="goodsSubmitLoading">
            {{ isEditingGoods ? '保存修改' : '添加商品' }}
          </a-button>
          <a-button @click="closeGoodsModal">取消</a-button>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:open="userModalVisible"
      :title="isEditingUser ? '编辑用户' : '添加用户'"
      :footer="null"
      width="600px"
      @cancel="closeUserModal"
    >
      <a-form :model="userForm" :rules="userFormRules" ref="userFormRef" layout="vertical">
        <a-form-item field="username" label="用户名">
          <a-input v-model:value="userForm.username" placeholder="请输入用户名" />
        </a-form-item>
        <a-form-item field="studentId" label="学号">
          <a-input v-model:value="userForm.studentId" placeholder="请输入学号" />
        </a-form-item>
        <a-form-item v-if="!isEditingUser" field="password" label="密码">
          <a-input-password v-model:value="userForm.password" placeholder="请输入密码" />
        </a-form-item>
        <a-form-item field="grade" label="年级">
          <a-input v-model:value="userForm.grade" placeholder="请输入年级" />
        </a-form-item>
        <a-form-item field="department" label="院系">
          <a-input v-model:value="userForm.department" placeholder="请输入院系" />
        </a-form-item>
        <a-form-item field="role" label="角色">
          <a-select v-model:value="userForm.role" placeholder="请选择角色">
            <a-select-option value="student">学生</a-select-option>
            <a-select-option value="admin">管理员</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSubmitUser" :loading="userSubmitLoading">
            {{ isEditingUser ? '保存修改' : '添加用户' }}
          </a-button>
          <a-button @click="closeUserModal">取消</a-button>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useUsersStore } from '@/stores/users'
import { useGoodsStore } from '@/stores/goods'
import { categories } from '@/data/mockData'

const router = useRouter()
const userStore = useUserStore()
const usersStore = useUsersStore()
const goodsStore = useGoodsStore()

// 搜索筛选
const searchKeyword = ref('')
const statusFilter = ref('all')
const userSearchKeyword = ref('')
const roleFilter = ref('all')

// 弹窗控制
const goodsModalVisible = ref(false)
const userModalVisible = ref(false)
const goodsFormRef = ref(null)
const userFormRef = ref(null)
const goodsSubmitLoading = ref(false)
const userSubmitLoading = ref(false)

// 编辑标记
const isEditingGoods = ref(false)
const isEditingUser = ref(false)
const editGoodsId = ref(null)
const editUserId = ref(null)

// 表单数据
const goodsForm = reactive({
  name: '',
  category: '',
  price: 0,
  description: ''
})

const userForm = reactive({
  username: '',
  studentId: '',
  password: '',
  grade: '',
  department: '',
  role: 'student'
})

// 商品表单校验
const goodsFormRules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择商品分类', trigger: 'change' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  description: [{ required: true, message: '请输入商品描述', trigger: 'blur' }]
}

// 动态用户表单校验规则
const userFormRules = computed(() => ({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  studentId: [{ required: true, message: '请输入学号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  grade: [{ required: true, message: '请输入年级', trigger: 'blur' }],
  department: [{ required: true, message: '请输入院系', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
}))

// 表格列配置
const goodsColumns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
  { title: '商品名称', dataIndex: 'name', key: 'name', ellipsis: true },
  { title: '分类', dataIndex: 'category', key: 'category', width: 100 },
  { title: '售价', dataIndex: 'price', key: 'price', width: 80 },
  { title: '发布人', dataIndex: 'ownerName', key: 'ownerName', width: 100 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80 },
  { title: '发布时间', dataIndex: 'publishTime', key: 'publishTime', width: 120 },
  { title: '操作', key: 'action', width: 180 }
]

const userColumns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
  { title: '用户名', dataIndex: 'username', key: 'username' },
  { title: '学号', dataIndex: 'studentId', key: 'studentId' },
  { title: '年级', dataIndex: 'grade', key: 'grade' },
  { title: '院系', dataIndex: 'department', key: 'department' },
  { title: '角色', dataIndex: 'role', key: 'role', width: 80 },
  { title: '操作', key: 'action', width: 160 }
]

// 统计数字（优化计算，只遍历一次）
const statsData = computed(() => {
  const all = goodsStore.goods
  let onSale = 0, sold = 0
  all.forEach(item => {
    if (item.status === 'on_sale') onSale++
    if (item.status === 'sold') sold++
  })
  return {
    total: all.length,
    onSale,
    sold,
    userTotal: usersStore.users.length
  }
})
const totalGoods = computed(() => statsData.value.total)
const onSaleGoods = computed(() => statsData.value.onSale)
const soldGoods = computed(() => statsData.value.sold)
const userCount = computed(() => statsData.value.userTotal)

// 筛选商品列表
const filteredGoods = computed(() => {
  let list = goodsStore.goods
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase().trim()
    list = list.filter(g =>
      g.name.toLowerCase().includes(keyword) || g.description.toLowerCase().includes(keyword)
    )
  }
  if (statusFilter.value !== 'all') {
    list = list.filter(g => g.status === statusFilter.value)
  }
  return list
})

// 筛选用户列表
const filteredUsers = computed(() => {
  let list = usersStore.users
  if (userSearchKeyword.value) {
    list = list.filter(u =>
      u.username.includes(userSearchKeyword.value) || u.studentId.includes(userSearchKeyword.value)
    )
  }
  if (roleFilter.value !== 'all') {
    list = list.filter(u => u.role === roleFilter.value)
  }
  return list
})

// 获取分类文本
const getCategoryLabel = (category) => {
  if (!category) return '未分类'
  const cat = categories.find(c => c.value === category)
  return cat ? cat.label : category
}

// ========== 商品弹窗逻辑 ==========
const showGoodsModal = () => {
  isEditingGoods.value = false
  editGoodsId.value = null
  resetGoodsForm()
  goodsModalVisible.value = true
}

const handleEditGoods = (record) => {
  isEditingGoods.value = true
  editGoodsId.value = record.id
  Object.assign(goodsForm, record)
  goodsModalVisible.value = true
}

const closeGoodsModal = () => {
  goodsModalVisible.value = false
  goodsSubmitLoading.value = false
  resetGoodsForm()
}

const resetGoodsForm = () => {
  goodsForm.name = ''
  goodsForm.category = ''
  goodsForm.price = 0
  goodsForm.description = ''
}

// 提交商品
const handleSubmitGoods = async () => {
  try {
    await goodsFormRef.value.validate()
    goodsSubmitLoading.value = true
    setTimeout(() => {
      if (isEditingGoods.value) {
        const ok = goodsStore.updateGoods(editGoodsId.value, { ...goodsForm })
        ok ? message.success('商品修改成功') : message.error('修改失败，商品不存在')
      } else {
        const newGoods = {
          id: Date.now() + Math.floor(Math.random() * 10000),
          ...goodsForm,
          ownerId: 0,
          ownerName: '管理员后台',
          ownerGrade: '管理员',
          status: 'on_sale',
          publishTime: new Date().toISOString().split('T')[0]
        }
        try {
          goodsStore.addGoods(newGoods)
          message.success('商品添加成功')
        } catch (e) {
          message.error(e.message)
        }
      }
      closeGoodsModal()
    }, 400)
  } catch (err) {
    console.log('表单校验失败', err)
  }
}

// 下架商品（改名修正语义）
const handleOffSaleGoods = (record) => {
  Modal.confirm({
    title: '确认下架',
    content: `确定要下架商品【${record.name}】吗？`,
    onOk: () => {
      goodsStore.updateGoods(record.id, { status: 'off_sale' })
      message.success('商品已下架')
    }
  })
}

// 删除商品
const handleDeleteGoods = (record) => {
  Modal.confirm({
    title: '危险操作',
    content: `确定永久删除商品【${record.name}】？删除后不可恢复`,
    okType: 'danger',
    onOk: () => {
      const ok = goodsStore.deleteGoods(record.id)
      ok ? message.success('删除成功') : message.error('删除失败')
    }
  })
}

// ========== 用户弹窗逻辑 ==========
const showUserModal = () => {
  isEditingUser.value = false
  editUserId.value = null
  resetUserForm()
  userModalVisible.value = true
}

const handleEditUser = (record) => {
  isEditingUser.value = true
  editUserId.value = record.id
  Object.assign(userForm, record)
  userModalVisible.value = true
}

const closeUserModal = () => {
  userModalVisible.value = false
  userSubmitLoading.value = false
  resetUserForm()
}

const resetUserForm = () => {
  userForm.username = ''
  userForm.studentId = ''
  userForm.password = ''
  userForm.grade = ''
  userForm.department = ''
  userForm.role = 'student'
}

// 提交用户
const handleSubmitUser = async () => {
  try {
    await userFormRef.value.validate()
    userSubmitLoading.value = true
    setTimeout(() => {
      if (isEditingUser.value) {
        const { password, ...updateData } = userForm
        const ok = usersStore.updateUser(editUserId.value, updateData)
        ok ? message.success('用户信息修改成功') : message.error('修改失败')
      } else {
        const newUser = {
          id: Date.now(),
          ...userForm
        }
        const addOk = usersStore.addUser(newUser)
        addOk ? message.success('用户添加成功') : message.error('学号/ID已存在')
      }
      closeUserModal()
    }, 400)
  } catch (err) {
    console.log('用户表单校验失败', err)
  }
}

// 删除用户
const handleDeleteUser = (record) => {
  Modal.confirm({
    title: '删除用户',
    content: `确定删除用户【${record.username} - ${record.studentId}】？`,
    okType: 'danger',
    onOk: () => {
      const ok = usersStore.deleteUser(record.id)
      ok ? message.success('用户已删除') : message.error('删除失败')
    }
  })
}

// 切换标签
const handleTabChange = () => {}

// 退出登录
const handleLogout = () => {
  Modal.confirm({
    title: '退出登录',
    content: '确认退出管理员后台？',
    onOk: () => {
      userStore.logout()
      goodsStore.resetStore()
      usersStore.resetStore()
      message.success('已退出登录')
      router.push('/login')
    }
  })
}

// 页面挂载校验角色（兜底防护）
onMounted(() => {
  if (!userStore.isLoggedIn || userStore.user?.role !== 'admin') {
    message.warning('无管理员权限')
    router.push('/goods')
  }
})
</script>

<style scoped>
.admin-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  color: #fff;
}

.admin-header h1 {
  font-size: 20px;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.welcome-text {
  font-size: 14px;
}

.admin-main {
  padding: 20px 40px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.stat-icon {
  font-size: 40px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #333;
}

.stat-label {
  font-size: 14px;
  color: #999;
}

.admin-tabs {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.tab-toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
</style>
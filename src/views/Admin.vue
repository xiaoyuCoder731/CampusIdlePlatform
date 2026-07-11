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
                <template v-if="column.key === 'image'">
                  <img
                    v-if="record.images?.[0] && (record.images[0].startsWith('data:image') || record.images[0].startsWith('/'))"
                    :src="record.images[0]"
                    style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px"
                  />
                  <span v-else>{{ record.images?.[0] || '-' }}</span>
                </template>
                <template v-if="column.key === 'status'">
                  <a-tag :color="record.status === 'on_sale' ? 'green' : 'orange'">
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
                    @click="handleSellGoods(record)"
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
        <a-form-item label="商品图片（可选）">
          <a-upload
            :list-type="'picture-card'"
            :file-list="imageFileList"
            :before-upload="beforeImageUpload"
            :custom-request="customImageUpload"
            @change="handleImageChange"
          >
            <div v-if="imageFileList.length < 1">
              <PlusOutlined />
              <div style="margin-top: 8px">上传图片</div>
            </div>
          </a-upload>
          <p style="margin-top: 8px; font-size: 12px; color: #999">未上传图片将使用默认图片</p>
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
    >
      <a-form :model="userForm" :rules="userFormRules" ref="userFormRef" layout="vertical">
        <a-form-item field="username" label="用户名">
          <a-input v-model:value="userForm.username" placeholder="请输入用户名" />
        </a-form-item>
        <a-form-item field="studentId" label="学号">
          <a-input v-model:value="userForm.studentId" placeholder="请输入学号" />
        </a-form-item>
        <a-form-item field="password" :label="isEditingUser ? '新密码（不填则保持不变）' : '密码'">
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
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useUsersStore } from '@/stores/users'
import { useGoodsStore } from '@/stores/goods'
import { categories } from '@/data/mockData'
import { useImageUpload } from '@/composables/useImageUpload'

const router = useRouter()
const userStore = useUserStore()
const usersStore = useUsersStore()
const goodsStore = useGoodsStore()

const searchKeyword = ref('')
const statusFilter = ref('all')
const userSearchKeyword = ref('')
const roleFilter = ref('all')

const goodsModalVisible = ref(false)
const userModalVisible = ref(false)

const goodsFormRef = ref(null)
const userFormRef = ref(null)

const goodsSubmitLoading = ref(false)
const userSubmitLoading = ref(false)

const isEditingGoods = ref(false)
const isEditingUser = ref(false)
const editGoodsId = ref(null)
const editUserId = ref(null)

const goodsForm = reactive({
  name: '',
  category: '',
  price: 0,
  description: ''
})

const {
  imageFileList,
  beforeImageUpload,
  customImageUpload,
  handleImageChange,
  setImage,
  resetImage,
  getImages
} = useImageUpload()

const userForm = reactive({
  username: '',
  studentId: '',
  password: '',
  grade: '',
  department: '',
  role: 'student'
})

const goodsFormRules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择商品分类', trigger: 'change' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  description: [{ required: true, message: '请输入商品描述', trigger: 'blur' }]
}

const userFormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  studentId: [{ required: true, message: '请输入学号', trigger: 'blur' }],
  password: [{ required: !isEditingUser.value, message: '请输入密码', trigger: 'blur' }],
  grade: [{ required: true, message: '请输入年级', trigger: 'blur' }],
  department: [{ required: true, message: '请输入院系', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

const goodsColumns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
  { title: '图片', key: 'image', width: 60 },
  { title: '商品名称', dataIndex: 'name', key: 'name', ellipsis: true },
  { title: '分类', dataIndex: 'category', key: 'category', width: 100 },
  { title: '售价', dataIndex: 'price', key: 'price', width: 80 },
  { title: '发布人', dataIndex: 'ownerName', key: 'ownerName', width: 100 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80 },
  { title: '发布时间', dataIndex: 'publishTime', key: 'publishTime', width: 120 },
  { title: '操作', key: 'action', width: 150 }
]

const userColumns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
  { title: '用户名', dataIndex: 'username', key: 'username' },
  { title: '学号', dataIndex: 'studentId', key: 'studentId' },
  { title: '年级', dataIndex: 'grade', key: 'grade' },
  { title: '院系', dataIndex: 'department', key: 'department' },
  { title: '角色', dataIndex: 'role', key: 'role', width: 80 },
  { title: '操作', key: 'action', width: 200 }
]

const totalGoods = computed(() => goodsStore.goods.length)
const onSaleGoods = computed(() => goodsStore.goods.filter(g => g.status === 'on_sale').length)
const soldGoods = computed(() => goodsStore.goods.filter(g => g.status === 'sold').length)
const userCount = computed(() => usersStore.users.length)

const filteredGoods = computed(() => {
  let list = goodsStore.goods
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase().trim()
    list = list.filter(g => {
      const nameLower = g.name.toLowerCase()
      const descLower = g.description.toLowerCase()
      return nameLower.includes(keyword) || descLower.includes(keyword)
    })
  }
  if (statusFilter.value !== 'all') {
    list = list.filter(g => g.status === statusFilter.value)
  }
  return list
})

const filteredUsers = computed(() => {
  let list = usersStore.users
  if (userSearchKeyword.value) {
    list = list.filter(u => 
      u.username.includes(userSearchKeyword.value) || 
      u.studentId.includes(userSearchKeyword.value)
    )
  }
  if (roleFilter.value !== 'all') {
    list = list.filter(u => u.role === roleFilter.value)
  }
  return list
})

const getCategoryLabel = (category) => {
  const cat = categories.find(c => c.value === category)
  return cat ? cat.label : category
}

const showGoodsModal = () => {
  isEditingGoods.value = false
  editGoodsId.value = null
  resetGoodsForm()
  goodsModalVisible.value = true
}

const handleEditGoods = (record) => {
  isEditingGoods.value = true
  editGoodsId.value = record.id
  goodsForm.name = record.name
  goodsForm.category = record.category
  goodsForm.price = record.price
  goodsForm.description = record.description
  setImage(record.images?.[0])
  goodsModalVisible.value = true
}

const closeGoodsModal = () => {
  goodsModalVisible.value = false
  resetGoodsForm()
}

const resetGoodsForm = () => {
  goodsForm.name = ''
  goodsForm.category = ''
  goodsForm.price = 0
  goodsForm.description = ''
  resetImage()
}

const handleSubmitGoods = async () => {
  try {
    await goodsFormRef.value.validate()
    goodsSubmitLoading.value = true

    setTimeout(() => {
      const images = getImages()
      
      if (isEditingGoods.value) {
        goodsStore.updateGoods(editGoodsId.value, { ...goodsForm, images })
        message.success('商品修改成功')
      } else {
        const newGoods = {
          id: Date.now(),
          ...goodsForm,
          ownerId: 0,
          ownerName: '管理员',
          ownerGrade: '-',
          images,
          status: 'on_sale',
          publishTime: new Date().toISOString().split('T')[0]
        }
        goodsStore.addGoods(newGoods)
        message.success('商品添加成功')
      }
      closeGoodsModal()
      goodsSubmitLoading.value = false
    }, 500)
  } catch (error) {
    console.error('表单校验失败:', error)
  }
}

const handleSellGoods = (record) => {
  goodsStore.updateGoods(record.id, { status: 'off_sale' })
}

const handleDeleteGoods = (record) => {
  goodsStore.deleteGoods(record.id)
}

const showUserModal = () => {
  isEditingUser.value = false
  editUserId.value = null
  resetUserForm()
  userModalVisible.value = true
}

const handleEditUser = (record) => {
  isEditingUser.value = true
  editUserId.value = record.id
  userForm.username = record.username
  userForm.studentId = record.studentId
  userForm.password = ''
  userForm.grade = record.grade
  userForm.department = record.department
  userForm.role = record.role
  userModalVisible.value = true
}

const closeUserModal = () => {
  userModalVisible.value = false
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

const handleSubmitUser = async () => {
  try {
    await userFormRef.value.validate()
    userSubmitLoading.value = true

    setTimeout(() => {
      if (isEditingUser.value) {
        const updateData = { ...userForm }
        if (!updateData.password) {
          delete updateData.password
        }
        usersStore.updateUser(editUserId.value, updateData)
        message.success('用户信息修改成功')
      } else {
        const newUser = {
          id: Date.now(),
          ...userForm,
          password: userForm.password || '123456'
        }
        usersStore.addUser(newUser)
        message.success('用户添加成功')
      }
      closeUserModal()
      userSubmitLoading.value = false
    }, 500)
  } catch (error) {
    console.error('表单校验失败:', error)
  }
}

const handleDeleteUser = (record) => {
  usersStore.deleteUser(record.id)
}

const handleLogout = () => {
  userStore.logout()
  message.success('已退出登录')
  router.push('/login')
}

onMounted(() => {
  goodsStore.initGoods()
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
}
</style>

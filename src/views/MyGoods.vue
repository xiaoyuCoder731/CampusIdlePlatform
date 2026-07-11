<template>
  <div class="my-goods-container">
    <header class="my-goods-header">
      <div class="header-left">
        <a-button @click="goBack">
          <ArrowLeftOutlined />
          返回商品列表
        </a-button>
        <h1>我的闲置管理</h1>
      </div>
      <div class="header-right">
        <span class="welcome-text">欢迎你，{{ userStore.user.username }}同学</span>
        <a-button @click="handleLogout">退出登录</a-button>
      </div>
    </header>

    <main class="my-goods-main">
      <div class="toolbar">
        <a-button type="primary" @click="showAddModal">
          <PlusOutlined />
          发布闲置
        </a-button>
        <a-select v-model:value="statusFilter" style="width: 120px">
          <a-select-option value="all">全部状态</a-select-option>
          <a-select-option value="on_sale">在售</a-select-option>
          <a-select-option value="off_sale">已下架</a-select-option>
          <a-select-option value="sold">已售出</a-select-option>
        </a-select>
      </div>

      <a-table
        :columns="columns"
        :data-source="myGoodsList"
        row-key="id"
        :pagination="{ pageSize: 5, showSizeChanger: true, showQuickJumper: true }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 'on_sale' ? 'green' : 'orange'">
              {{ record.status === 'on_sale' ? '在售' : record.status === 'off_sale' ? '已下架' : '已售出' }}
            </a-tag>
          </template>
          <template v-if="column.key === 'category'">
            {{ getCategoryLabel(record.category) }}
          </template>
          <template v-if="column.key === 'action'">
            <a-button size="small" @click="showEditModal(record)">
              <EditOutlined />
              编辑
            </a-button>
            <a-button
              v-if="record.status === 'on_sale'"
              size="small"
              danger
              @click="handleSell(record)"
            >
              <TagOutlined />
              下架
            </a-button>
            <a-button
              size="small"
              danger
              @click="handleDelete(record)"
            >
              <DeleteOutlined />
              删除
            </a-button>
          </template>
        </template>
      </a-table>

      <div v-if="myGoodsList.length === 0" class="empty-state">
        <UploadOutlined />
        <p>你还没有发布任何闲置物品</p>
        <a-button type="primary" @click="showAddModal">立即发布</a-button>
      </div>
    </main>

    <a-modal
      v-model:open="addModalVisible"
      :title="isEditing ? '编辑闲置物品' : '发布闲置物品'"
      :footer="null"
      width="600px"
    >
      <a-form :model="form" :rules="formRules" ref="formRef" layout="vertical">
        <a-form-item field="name" label="物品名称">
          <a-input v-model:value="form.name" placeholder="请输入物品名称" />
        </a-form-item>

        <a-form-item field="category" label="物品分类">
          <a-select v-model:value="form.category" placeholder="请选择分类">
            <a-select-option
              v-for="cat in categories.filter(c => c.value !== 'all')"
              :key="cat.value"
              :value="cat.value"
            >
              {{ cat.label }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item field="price" label="出售价格">
          <a-input-number v-model:value="form.price" :min="0" :step="1" prefix="¥" />
        </a-form-item>

        <a-form-item field="description" label="物品描述">
          <a-textarea v-model:value="form.description" rows="4" placeholder="请描述物品的成色、使用情况等" />
        </a-form-item>

        <a-form-item label="物品图片（可选）">
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
          <a-button type="primary" @click="handleSubmit" :loading="submitLoading">
            {{ isEditing ? '保存修改' : '发布商品' }}
          </a-button>
          <a-button @click="closeModal">取消</a-button>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  ArrowLeftOutlined,
  PlusOutlined,
  EditOutlined,
  TagOutlined,
  DeleteOutlined,
  UploadOutlined
} from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useGoodsStore } from '@/stores/goods'
import { categories } from '@/data/mockData'
import { useImageUpload } from '@/composables/useImageUpload'

const router = useRouter()
const userStore = useUserStore()
const goodsStore = useGoodsStore()

const addModalVisible = ref(false)
const formRef = ref(null)
const submitLoading = ref(false)
const isEditing = ref(false)
const editId = ref(null)
const statusFilter = ref('all')

const {
  imageFileList,
  beforeImageUpload,
  customImageUpload,
  handleImageChange,
  setImage,
  resetImage,
  getImages
} = useImageUpload()

const form = reactive({
  name: '',
  category: '',
  price: 0,
  description: ''
})

const formRules = {
  name: [{ required: true, message: '请输入物品名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择物品分类', trigger: 'change' }],
  price: [{ required: true, message: '请输入出售价格', trigger: 'blur' }],
  description: [{ required: true, message: '请输入物品描述', trigger: 'blur' }]
}

const columns = [
  {
    title: '物品名称',
    dataIndex: 'name',
    key: 'name',
    ellipsis: true
  },
  {
    title: '分类',
    dataIndex: 'category',
    key: 'category',
    width: 100
  },
  {
    title: '售价',
    dataIndex: 'price',
    key: 'price',
    width: 100,
    render: (price) => `¥${price}`
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100
  },
  {
    title: '发布时间',
    dataIndex: 'publishTime',
    key: 'publishTime',
    width: 120
  },
  {
    title: '操作',
    key: 'action',
    width: 200
  }
]

const myGoodsList = computed(() => {
  let list = goodsStore.goods.filter(g => g.ownerId === userStore.user?.id)
  if (statusFilter.value !== 'all') {
    list = list.filter(g => g.status === statusFilter.value)
  }
  return list
})

const getCategoryLabel = (category) => {
  const cat = categories.find(c => c.value === category)
  return cat ? cat.label : category
}

const showAddModal = () => {
  isEditing.value = false
  editId.value = null
  resetForm()
  addModalVisible.value = true
}

const showEditModal = (record) => {
  isEditing.value = true
  editId.value = record.id
  form.name = record.name
  form.category = record.category
  form.price = record.price
  form.description = record.description
  setImage(record.images?.[0])
  addModalVisible.value = true
}

const closeModal = () => {
  addModalVisible.value = false
  resetForm()
}

const resetForm = () => {
  form.name = ''
  form.category = ''
  form.price = 0
  form.description = ''
  resetImage()
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    submitLoading.value = true

    setTimeout(() => {
      const images = getImages()

      if (isEditing.value) {
        goodsStore.updateGoods(editId.value, { ...form, images })
        message.success('修改成功')
      } else {
        const newGoods = {
          id: Date.now(),
          ...form,
          ownerId: userStore.user.id,
          ownerName: userStore.user.username,
          ownerGrade: userStore.user.grade,
          images,
          status: 'on_sale',
          publishTime: new Date().toISOString().split('T')[0]
        }
        goodsStore.addGoods(newGoods)
        message.success('发布成功')
      }

      closeModal()
      submitLoading.value = false
    }, 500)
  } catch (error) {
    console.error('表单校验失败:', error)
  }
}

const handleSell = (record) => {
  goodsStore.updateGoods(record.id, { status: 'off_sale' })
}

const handleDelete = (record) => {
  goodsStore.deleteGoods(record.id)
}

const goBack = () => {
  router.push('/goods')
}

const handleLogout = () => {
  userStore.logout()
  message.success('已退出登录')
  router.push('/login')
}

onMounted(() => {
  if (!userStore.checkLoginStatus()) {
    router.push('/login')
    return
  }
  goodsStore.initGoods()
})
</script>

<style scoped>
.my-goods-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.my-goods-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-left h1 {
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
  color: #666;
}

.my-goods-main {
  padding: 20px 40px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
  color: #999;
}

.empty-state .anticon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state p {
  margin-bottom: 20px;
}
</style>

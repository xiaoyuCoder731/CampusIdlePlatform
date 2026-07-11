<template>
  <div class="goods-container">
    <header class="goods-header">
      <div class="header-left">
        <h1>校园闲置物品互助平台</h1>
        <p>让闲置物品找到新主人</p>
      </div>
      <div class="header-right">
        <template v-if="userStore.isLoggedIn">
          <span class="welcome-text">欢迎你，{{ userStore.user.username }}{{ userStore.user.role === 'admin' ? '管理员' : '同学' }}</span>
          <a-button v-if="userStore.user.role === 'admin'" type="primary" @click="goToAdmin">管理后台</a-button>
          <a-button v-else type="primary" @click="goToMyGoods">我的闲置</a-button>
          <a-button @click="handleLogout">退出登录</a-button>
        </template>
        <template v-else>
          <a-button type="primary" @click="goToLogin">登录</a-button>
        </template>
      </div>
    </header>

    <div class="content-wrapper">
      <aside class="filter-sidebar">
        <h3>筛选条件</h3>
        
        <a-form :model="filters" layout="vertical">
          <a-form-item label="物品分类">
            <a-select v-model:value="filters.category" placeholder="请选择分类" allow-clear>
              <a-select-option v-for="cat in categories" :key="cat.value" :value="cat.value">
                {{ cat.label }}
              </a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item label="发布年级">
            <a-select v-model:value="filters.grade" placeholder="请选择年级" allow-clear>
              <a-select-option v-for="g in grades" :key="g.value" :value="g.value">
                {{ g.label }}
              </a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item label="价格区间">
            <div class="price-input-group">
              <a-input-number
                v-model:value="priceMin"
                placeholder="最低价"
                :min="0"
                :max="99999"
                style="width: 100px"
              />
              <span class="price-separator">-</span>
              <a-input-number
                v-model:value="priceMax"
                placeholder="最高价"
                :min="0"
                :max="99999"
                style="width: 100px"
              />
            </div>
          </a-form-item>

          <a-form-item>
            <a-button type="primary" block @click="resetFilters">重置筛选</a-button>
          </a-form-item>
        </a-form>
      </aside>

      <main class="goods-main">
        <div class="search-bar">
          <a-input
            v-model:value="filters.keyword"
            placeholder="搜索商品名称、描述、分类或发布人..."
            allow-clear
            size="large"
          >
            <template #prefix>
              <SearchOutlined />
            </template>
          </a-input>
        </div>

        <div class="goods-grid">
          <div
            v-for="goods in filteredGoods"
            :key="goods.id"
            class="goods-card"
            @click="showDetail(goods)"
          >
            <div class="goods-image">
              <img
                v-if="goods.images[0] && (goods.images[0].startsWith('data:image') || goods.images[0].startsWith('/'))"
                :src="goods.images[0]"
                alt="商品图片"
                class="goods-img"
              />
              <span v-else class="emoji-icon">{{ goods.images[0] }}</span>
              <span v-if="goods.status !== 'on_sale'" class="sold-badge">{{ goods.status === 'off_sale' ? '已下架' : '已售出' }}</span>
            </div>
            <div class="goods-info">
              <h4 class="goods-name">{{ goods.name }}</h4>
              <p class="goods-desc">{{ goods.description }}</p>
              <div class="goods-price">
                <span class="current-price">¥{{ goods.price }}</span>
              </div>
              <div class="goods-meta">
                <span>{{ getCategoryLabel(goods.category) }}</span>
                <span>{{ goods.ownerGrade }} · {{ goods.ownerName }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="filteredGoods.length === 0" class="empty-state">
          <ShoppingCartOutlined />
          <p>暂无符合条件的商品</p>
        </div>
      </main>
    </div>

    <a-modal
      v-model:open="detailModalVisible"
      :title="selectedGoods?.name"
      :footer="null"
      width="600px"
    >
      <div v-if="selectedGoods" class="detail-content">
        <div class="detail-image">
          <img
            v-if="selectedGoods.images[0] && (selectedGoods.images[0].startsWith('data:image') || selectedGoods.images[0].startsWith('/'))"
            :src="selectedGoods.images[0]"
            alt="商品图片"
            class="detail-img"
          />
          <span v-else class="emoji-icon-large">{{ selectedGoods.images[0] }}</span>
        </div>
        <div class="detail-info">
          <div class="detail-price">
            <span class="current-price">¥{{ selectedGoods.price }}</span>
          </div>
          <div class="detail-meta">
            <a-tag color="blue">{{ getCategoryLabel(selectedGoods.category) }}</a-tag>
            <a-tag :color="selectedGoods.status === 'on_sale' ? 'green' : 'orange'">{{ selectedGoods.status === 'on_sale' ? '在售' : selectedGoods.status === 'off_sale' ? '已下架' : '已售出' }}</a-tag>
          </div>
          <div class="detail-description">
            <h4>商品描述</h4>
            <p>{{ selectedGoods.description }}</p>
          </div>
          <div class="detail-owner">
            <h4>发布信息</h4>
            <p><span>发布人：</span>{{ selectedGoods.ownerName }}</p>
            <p><span>年级：</span>{{ selectedGoods.ownerGrade }}</p>
            <p><span>发布时间：</span>{{ selectedGoods.publishTime }}</p>
          </div>
          <div class="detail-actions">
            <a-button
              v-if="selectedGoods.status === 'on_sale'"
              type="primary"
              size="large"
              @click="handlePurchase"
            >
              立即购买
            </a-button>
            <a-tag v-else :color="selectedGoods.status === 'off_sale' ? 'orange' : 'red'">{{ selectedGoods.status === 'off_sale' ? '已下架' : '已售出' }}</a-tag>
          </div>
        </div>
      </div>
    </a-modal>

    <a-modal
      v-model:open="purchaseModalVisible"
      title="购买商品"
      :footer="null"
      width="500px"
    >
      <a-form :model="purchaseForm" :rules="purchaseFormRules" ref="purchaseFormRef" layout="vertical">
        <a-form-item field="buyerName" label="收货人姓名">
          <a-input v-model:value="purchaseForm.buyerName" placeholder="请输入收货人姓名" />
        </a-form-item>
        <a-form-item field="buyerPhone" label="联系电话">
          <a-input v-model:value="purchaseForm.buyerPhone" placeholder="请输入联系电话" />
        </a-form-item>
        <a-form-item field="address" label="收货地址">
          <a-textarea v-model:value="purchaseForm.address" placeholder="请输入收货地址" :rows="3" />
        </a-form-item>
        <a-form-item field="remark" label="备注">
          <a-textarea v-model:value="purchaseForm.remark" placeholder="请输入备注信息" :rows="3" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" size="large" block @click="submitPurchase" :loading="purchaseLoading">
            确认购买
          </a-button>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { SearchOutlined, ShoppingCartOutlined } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useGoodsStore } from '@/stores/goods'
import { categories, grades } from '@/data/mockData'

const router = useRouter()
const userStore = useUserStore()
const goodsStore = useGoodsStore()

const filters = reactive({
  keyword: '',
  category: 'all',
  grade: 'all'
})

const priceMin = ref(0)
const priceMax = ref(10000)
const detailModalVisible = ref(false)
const selectedGoods = ref(null)
const purchaseModalVisible = ref(false)
const purchaseFormRef = ref(null)
const purchaseLoading = ref(false)

const purchaseForm = reactive({
  buyerName: '',
  buyerPhone: '',
  address: '',
  remark: ''
})

const purchaseFormRules = {
  buyerName: [
    { required: true, message: '请输入收货人姓名', trigger: 'blur' }
  ],
  buyerPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入收货地址', trigger: 'blur' }
  ]
}

const filteredGoods = computed(() => {
  return goodsStore.goods.filter(goods => {
    const keyword = filters.keyword.toLowerCase().trim()
    if (!keyword) {
      return true
    }
    const nameLower = goods.name.toLowerCase()
    const descLower = goods.description.toLowerCase()
    return nameLower.includes(keyword) || descLower.includes(keyword)
  }).filter(goods => {
    const matchCategory = filters.category === 'all' || goods.category === filters.category
    const matchGrade = filters.grade === 'all' || goods.ownerGrade === filters.grade
    const matchPriceMin = !priceMin.value || goods.price >= priceMin.value
    const matchPriceMax = !priceMax.value || goods.price <= priceMax.value
    return matchCategory && matchGrade && matchPriceMin && matchPriceMax
  })
})

const getCategoryLabel = (category) => {
  const cat = categories.find(c => c.value === category)
  return cat ? cat.label : category
}

const resetFilters = () => {
  filters.keyword = ''
  filters.category = 'all'
  filters.grade = 'all'
  priceMin.value = 0
  priceMax.value = 10000
  message.success('筛选条件已重置')
}

const handlePurchase = () => {
  if (!userStore.isLoggedIn) {
    message.warning('请先登录')
    router.push('/login')
    return
  }
  if (userStore.user.role !== 'student') {
    message.warning('只有学生可以购买商品')
    return
  }
  purchaseModalVisible.value = true
}

const submitPurchase = async () => {
  try {
    await purchaseFormRef.value.validate()
    purchaseLoading.value = true
    
    setTimeout(() => {
      const result = goodsStore.purchaseGoods(selectedGoods.value.id, {
        buyerId: userStore.user.id,
        buyerStudentId: userStore.user.studentId,
        ...purchaseForm
      })
      
      if (result) {
        message.success('购买成功！请联系卖家完成交易')
        selectedGoods.value.status = 'sold'
        purchaseModalVisible.value = false
        detailModalVisible.value = false
        
        purchaseForm.buyerName = ''
        purchaseForm.buyerPhone = ''
        purchaseForm.address = ''
        purchaseForm.remark = ''
      } else {
        message.error('购买失败，请重试')
      }
      purchaseLoading.value = false
    }, 500)
  } catch (error) {
    console.error('表单校验失败:', error)
  }
}

const showDetail = (goods) => {
  selectedGoods.value = goods
  detailModalVisible.value = true
}

const goToLogin = () => {
  router.push('/login')
}

const goToMyGoods = () => {
  router.push('/my-goods')
}

const goToAdmin = () => {
  router.push('/admin')
}

const handleLogout = () => {
  userStore.logout()
  message.success('已退出登录')
  router.push('/goods')
}

onMounted(() => {
  goodsStore.initGoods()
})
</script>

<style scoped>
.goods-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.goods-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.header-left h1 {
  font-size: 24px;
  margin-bottom: 4px;
}

.header-left p {
  font-size: 14px;
  opacity: 0.9;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.welcome-text {
  font-size: 14px;
}

.content-wrapper {
  display: flex;
  padding: 20px 40px;
  gap: 20px;
}

.filter-sidebar {
  width: 280px;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  flex-shrink: 0;
}

.filter-sidebar h3 {
  font-size: 16px;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.price-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-separator {
  font-size: 16px;
  color: #999;
}

.goods-main {
  flex: 1;
  min-width: 0;
}

.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.search-bar .ant-input {
  flex: 1;
}

.goods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.goods-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow 0.3s, transform 0.3s;
}

.goods-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px);
}

.goods-image {
  position: relative;
  height: 200px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.emoji-icon {
  font-size: 64px;
}

.goods-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.sold-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #ff4d4f;
  color: #fff;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
}

.goods-info {
  padding: 16px;
}

.goods-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.goods-desc {
  font-size: 13px;
  color: #999;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.goods-price {
  margin-bottom: 10px;
}

.current-price {
  font-size: 20px;
  font-weight: 700;
  color: #ff4d4f;
}



.goods-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
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

.detail-content {
  display: flex;
  gap: 24px;
}

.detail-image {
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  flex-shrink: 0;
}

.emoji-icon-large {
  font-size: 80px;
}

.detail-img {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
}

.detail-info {
  flex: 1;
}

.detail-price {
  margin-bottom: 16px;
}

.detail-price .current-price {
  font-size: 32px;
}



.detail-meta {
  margin-bottom: 20px;
}

.detail-description,
.detail-owner {
  margin-bottom: 20px;
}

.detail-description h4,
.detail-owner h4 {
  font-size: 14px;
  margin-bottom: 8px;
}

.detail-description p {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.detail-owner p {
  font-size: 14px;
  color: #666;
  margin: 4px 0;
}

.detail-owner span {
  color: #999;
}

.detail-actions {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.detail-actions .ant-btn {
  width: 100%;
}
</style>

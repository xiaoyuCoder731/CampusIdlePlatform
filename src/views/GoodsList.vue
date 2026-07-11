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
            <a-select
              v-model:value="filters.category"
              placeholder="请选择分类"
              allow-clear
              @change="handleFilterChange"
            >
              <a-select-option value="all">全部分类</a-select-option>
              <a-select-option v-for="cat in categories" :key="cat.value" :value="cat.value">
                {{ cat.label }}
              </a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item label="发布年级">
            <a-select
              v-model:value="filters.grade"
              placeholder="请选择年级"
              allow-clear
              @change="handleFilterChange"
            >
              <a-select-option value="all">全部年级</a-select-option>
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
                @change="handleFilterChange"
              />
              <span class="price-separator">-</span>
              <a-input-number
                v-model:value="priceMax"
                placeholder="最高价"
                :min="0"
                :max="99999"
                style="width: 100px"
                @change="handleFilterChange"
              />
            </div>
          </a-form-item>

          <a-form-item>
            <a-button danger block @click="resetFilters">重置筛选</a-button>
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
            @input="handleFilterChange"
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
            <span v-if="goods.status !== 'on_sale'" class="sold-badge">
              {{ goods.status === 'off_sale' ? '已下架' : '已售出' }}
            </span>
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
          <p>暂无符合条件的商品，请更换筛选条件</p>
        </div>
      </main>
    </div>

    <!-- 商品详情弹窗 -->
    <a-modal
      v-model:open="detailModalVisible"
      :title="selectedGoods?.name || '商品详情'"
      :footer="null"
      width="600px"
      @cancel="closeDetailModal"
    >
      <div v-if="selectedGoods" class="detail-content">
        <div class="detail-info">
          <div class="detail-price">
            <span class="current-price">¥{{ selectedGoods.price }}</span>
          </div>
          <div class="detail-meta">
            <a-tag color="blue">{{ getCategoryLabel(selectedGoods.category) }}</a-tag>
            <a-tag :color="selectedGoods.status === 'on_sale' ? 'green' : 'orange'">
              {{ selectedGoods.status === 'on_sale' ? '在售' : selectedGoods.status === 'off_sale' ? '已下架' : '已售出' }}
            </a-tag>
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
              block
              @click="handlePurchase"
            >
              立即购买
            </a-button>
            <a-tag v-else size="large" color="orange">
              {{ selectedGoods.status === 'off_sale' ? '已下架，无法购买' : '已售出' }}
            </a-tag>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- 下单弹窗 -->
    <a-modal
      v-model:open="purchaseModalVisible"
      title="购买商品"
      :footer="null"
      width="500px"
      @cancel="closePurchaseModal"
    >
      <a-form :model="purchaseForm" :rules="purchaseFormRules" ref="purchaseFormRef" layout="vertical">
        <a-form-item field="buyerName" label="收货人姓名">
          <a-input v-model:value="purchaseForm.buyerName" placeholder="请输入收货人姓名" />
        </a-form-item>
        <a-form-item field="buyerPhone" label="联系电话">
          <a-input v-model:value="purchaseForm.buyerPhone" placeholder="请输入11位手机号" />
        </a-form-item>
        <a-form-item field="address" label="收货地址">
          <a-textarea v-model:value="purchaseForm.address" placeholder="填写校园宿舍/自取地点" :rows="3" />
        </a-form-item>
        <a-form-item field="remark" label="备注">
          <a-textarea v-model:value="purchaseForm.remark" placeholder="交易约定备注（选填）" :rows="2" />
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
import { message, Modal } from 'ant-design-vue'
import { SearchOutlined, ShoppingCartOutlined } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useGoodsStore } from '@/stores/goods'
import { categories, grades } from '@/data/mockData'

const router = useRouter()
const userStore = useUserStore()
const goodsStore = useGoodsStore()

// 筛选条件
const filters = reactive({
  keyword: '',
  category: 'all',
  grade: 'all'
})
const priceMin = ref(null)
const priceMax = ref(null)

// 弹窗控制
const detailModalVisible = ref(false)
const selectedGoods = ref(null)
const purchaseModalVisible = ref(false)
const purchaseFormRef = ref(null)
const purchaseLoading = ref(false)

// 下单表单
const purchaseForm = reactive({
  buyerName: '',
  buyerPhone: '',
  address: '',
  remark: ''
})

// 表单校验
const purchaseFormRules = {
  buyerName: [{ required: true, message: '请输入收货人姓名', trigger: 'blur' }],
  buyerPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式错误', trigger: 'blur' }
  ],
  address: [{ required: true, message: '请输入收货地址', trigger: 'blur' }]
}

// 统一筛选逻辑（单层遍历，性能优化）
const filteredGoods = computed(() => {
  const keyword = filters.keyword.toLowerCase().trim()
  const min = priceMin.value ?? 0
  const max = priceMax.value ?? 99999

  return goodsStore.goods.filter(item => {
    // 关键词匹配
    const matchKey = !keyword
      || item.name.toLowerCase().includes(keyword)
      || item.description.toLowerCase().includes(keyword)
    if (!matchKey) return false

    // 分类、年级
    const matchCat = filters.category === 'all' || item.category === filters.category
    const matchGrade = filters.grade === 'all' || item.ownerGrade === filters.grade
    if (!matchCat || !matchGrade) return false

    // 价格区间校验：最小值不能大于最大值
    if (min > max) return false
    const matchPrice = item.price >= min && item.price <= max

    return matchPrice
  })
})

// 获取分类文本，空值兜底
const getCategoryLabel = (category) => {
  if (!category) return '未分类'
  const cat = categories.find(c => c.value === category)
  return cat ? cat.label : category
}

// 筛选变更防抖提示
const handleFilterChange = () => {}

// 重置所有筛选
const resetFilters = () => {
  filters.keyword = ''
  filters.category = 'all'
  filters.grade = 'all'
  priceMin.value = null
  priceMax.value = null
  message.info('筛选条件已清空')
}

// 打开商品详情
const showDetail = (goods) => {
  selectedGoods.value = goods
  detailModalVisible.value = true
}

// 关闭详情弹窗并清空数据
const closeDetailModal = () => {
  detailModalVisible.value = false
  selectedGoods.value = null
}

// 关闭下单弹窗，重置表单
const closePurchaseModal = () => {
  purchaseModalVisible.value = false
  purchaseLoading.value = false
  purchaseForm.buyerName = ''
  purchaseForm.buyerPhone = ''
  purchaseForm.address = ''
  purchaseForm.remark = ''
}

// 立即购买按钮校验权限
const handlePurchase = () => {
  // 未登录拦截
  if (!userStore.isLoggedIn) {
    message.warning('请先登录账号再购买商品')
    router.push({ path: '/login', query: { redirect: '/goods' } })
    return
  }
  // 管理员禁止购买
  if (userStore.user.role === 'admin') {
    message.warning('管理员账号仅可管理商品，无法下单购买')
    return
  }
  purchaseModalVisible.value = true
}

// 提交购买订单
const submitPurchase = async () => {
  try {
    await purchaseFormRef.value.validate()
    purchaseLoading.value = true

    setTimeout(() => {
      const orderInfo = {
        buyerId: userStore.user.id,
        buyerStudentId: userStore.user.studentId,
        ...purchaseForm
      }
      const orderResult = goodsStore.purchaseGoods(selectedGoods.value.id, orderInfo)

      if (orderResult) {
        message.success('下单成功！请主动联系卖家完成线下交易')
        closePurchaseModal()
        closeDetailModal()
      } else {
        message.error('下单失败，商品已售出或不存在')
      }
      purchaseLoading.value = false
    }, 400)
  } catch (err) {
    console.log('下单表单校验失败', err)
  }
}

// 页面跳转
const goToLogin = () => router.push('/login')
const goToMyGoods = () => router.push('/my-goods')
const goToAdmin = () => router.push('/admin')

// 退出登录带确认弹窗
const handleLogout = () => {
  Modal.confirm({
    title: '退出登录',
    content: '确定要退出当前账号吗？',
    onOk: () => {
      userStore.logout()
      message.success('已退出登录')
      router.push('/goods')
    }
  })
}

onMounted(() => {})
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
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
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
  margin: 0 0 20px;
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
  margin-bottom: 20px;
}

.goods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.goods-card {
  position: relative;
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

.sold-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #ff4d4f;
  color: #fff;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 2;
}

.goods-info {
  padding: 16px;
}

.goods-name {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.goods-desc {
  font-size: 13px;
  color: #999;
  margin: 0 0 12px;
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
  padding: 8px;
}

.detail-price {
  margin-bottom: 16px;
}

.detail-price .current-price {
  font-size: 32px;
}

.detail-meta {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.detail-description,
.detail-owner {
  margin-bottom: 20px;
}

.detail-description h4,
.detail-owner h4 {
  font-size: 14px;
  margin: 0 0 8px;
  color: #333;
}

.detail-description p {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 0;
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
</style>
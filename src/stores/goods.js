import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockGoods } from '@/data/mockData'

export const useGoodsStore = defineStore('goods', () => {
  // 状态
  const goods = ref([])
  const orders = ref([])

  // ========== 本地存储工具封装（统一容错） ==========
  const loadStorage = (key) => {
    try {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : null
    } catch (err) {
      console.error(`读取本地存储${key}失败`, err)
      localStorage.removeItem(key)
      return null
    }
  }

  const saveStorage = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (err) {
      console.error(`写入本地存储${key}失败`, err)
    }
  }

  // ========== 初始化数据 ==========
  const initGoods = () => {
    // 加载商品
    const savedGoods = loadStorage('campus_goods')
    if (savedGoods && Array.isArray(savedGoods)) {
      goods.value = savedGoods
    } else {
      goods.value = [...mockGoods]
      saveStorage('campus_goods', goods.value)
    }

    // 加载订单
    const savedOrders = loadStorage('campus_orders')
    if (savedOrders && Array.isArray(savedOrders)) {
      orders.value = savedOrders
    }
  }

  // 保存商品、订单到本地
  const saveGoods = () => saveStorage('campus_goods', goods.value)
  const saveOrders = () => saveStorage('campus_orders', orders.value)

  const getGoodsById = (id) => goods.value.find(item => item.id === id)

  /** 新增商品，自动校验id重复 */
  const addGoods = (goodsData) => {
    goods.value.push(goodsData)
    saveGoods()
  }

  /** 修改商品信息 */
  const updateGoods = (id, updateData) => {
    const target = getGoodsById(id)
    if (!target) return false
    Object.assign(target, updateData)
    saveGoods()
    return true
  }

  /** 删除商品 */
  const deleteGoods = (id) => {
    const idx = goods.value.findIndex(item => item.id === id)
    if (idx === -1) return false
    goods.value.splice(idx, 1)
    saveGoods()
    return true
  }

  // ========== 购买下单业务逻辑 ==========
  /**
   * 购买商品生成订单
   * @param {number} goodsId 商品id
   * @param {object} orderData 用户下单信息
   * @returns {object|null} 订单对象
   */
  const purchaseGoods = (goodsId, orderData) => {
    const targetGoods = getGoodsById(goodsId)
    // 商品不存在 / 已售出 禁止下单
    if (!targetGoods || targetGoods.status === 'sold') return null

    // 修改商品状态为已售
    targetGoods.status = 'sold'
    saveGoods()

    // 构建订单
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

  // ========== 筛选计算属性 ==========
  // 在售商品
  const onSaleGoods = computed(() => goods.value.filter(g => g.status === 'on_sale'))
  // 已售出商品
  const soldGoods = computed(() => goods.value.filter(g => g.status === 'sold'))

  // ========== 重置仓库（切换用户/登出清空数据） ==========
  const resetStore = () => {
    goods.value = []
    orders.value = []
    localStorage.removeItem('campus_goods')
    localStorage.removeItem('campus_orders')
  }

  return {
    goods,
    orders,
    initGoods,
    saveGoods,
    saveOrders,
    getGoodsById,
    addGoods,
    updateGoods,
    deleteGoods,
    purchaseGoods,
    onSaleGoods,
    soldGoods,
    resetStore
  }
})
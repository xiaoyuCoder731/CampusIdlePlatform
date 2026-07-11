import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockGoods } from '@/data/mockData'

export const useGoodsStore = defineStore('goods', () => {
  const goods = ref([])
  const orders = ref([])

  const initGoods = () => {
    const savedGoods = localStorage.getItem('campus_goods')
    if (savedGoods) {
      goods.value = JSON.parse(savedGoods)
    } else {
      goods.value = [...mockGoods]
      localStorage.setItem('campus_goods', JSON.stringify(goods.value))
    }

    const savedOrders = localStorage.getItem('campus_orders')
    if (savedOrders) {
      orders.value = JSON.parse(savedOrders)
    }
  }

  const saveGoods = () => {
    localStorage.setItem('campus_goods', JSON.stringify(goods.value))
  }

  const saveOrders = () => {
    localStorage.setItem('campus_orders', JSON.stringify(orders.value))
  }

  const getGoodsById = (id) => {
    return goods.value.find(g => g.id === id)
  }

  const addGoods = (goodsData) => {
    goods.value.push(goodsData)
    saveGoods()
  }

  const updateGoods = (id, updateData) => {
    const index = goods.value.findIndex(g => g.id === id)
    if (index !== -1) {
      goods.value[index] = { ...goods.value[index], ...updateData }
      saveGoods()
    }
  }

  const deleteGoods = (id) => {
    const index = goods.value.findIndex(g => g.id === id)
    if (index !== -1) {
      goods.value.splice(index, 1)
      saveGoods()
    }
  }

  const purchaseGoods = (id, orderData) => {
    const index = goods.value.findIndex(g => g.id === id)
    if (index !== -1) {
      goods.value[index].status = 'sold'
      saveGoods()

      const order = {
        id: Date.now(),
        goodsId: id,
        goodsName: goods.value[index].name,
        goodsPrice: goods.value[index].price,
        ...orderData,
        orderTime: new Date().toLocaleString('zh-CN')
      }
      orders.value.push(order)
      saveOrders()
      return order
    }
    return null
  }

  const onSaleGoods = computed(() => goods.value.filter(g => g.status === 'on_sale'))
  const soldGoods = computed(() => goods.value.filter(g => g.status === 'sold'))

  return {
    goods,
    orders,
    initGoods,
    getGoodsById,
    addGoods,
    updateGoods,
    deleteGoods,
    purchaseGoods,
    onSaleGoods,
    soldGoods
  }
})

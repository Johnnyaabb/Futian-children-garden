// pages/order-detail/order-detail.js
const app = getApp()

Page({
  data: {
    order: null,
    isMerchant: false,
    statusMap: {
      paid: '待商家确认',
      confirmed: '商家已接单，备餐中',
      preparing: '备餐中',
      ready: '餐品已准备好',
      delivering: '外卖员正在配送',
      completed: '订单已完成',
      cancelled: '订单已取消',
    },
    statusIconMap: {
      paid: '⏳',
      confirmed: '👨‍🍳',
      preparing: '👨‍🍳',
      ready: '✅',
      delivering: '🛵',
      completed: '🎉',
      cancelled: '❌',
    },
    statusColorMap: {
      paid: '#FF6B35',
      confirmed: '#3478F6',
      preparing: '#3478F6',
      ready: '#34C759',
      delivering: '#34C759',
      completed: '#999',
      cancelled: '#FF3B30',
    },
    steps: [],
  },

  onLoad(options) {
    const { orderId, isMerchant } = options
    this.setData({ isMerchant: isMerchant === 'true' })
    this._loadOrder(orderId)
  },

  onShow() {
    if (this.data.order) {
      this._loadOrder(this.data.order.orderId)
    }
  },

  _loadOrder(orderId) {
    const orders = app.getOrders()
    const order = orders.find(o => o.orderId === orderId)
    if (!order) return

    const steps = this._buildSteps(order.status)
    this.setData({ order, steps })
  },

  _buildSteps(status) {
    const allSteps = [
      { key: 'paid',      label: '订单已提交', icon: '📋' },
      { key: 'confirmed', label: '商家已接单', icon: '✅' },
      { key: 'preparing', label: '备餐中',     icon: '👨‍🍳' },
      { key: 'ready',     label: '餐品已就绪', icon: '🍱' },
      { key: 'delivering',label: '配送中',     icon: '🛵' },
      { key: 'completed', label: '已完成',     icon: '🎉' },
    ]
    const order = ['paid','confirmed','preparing','ready','delivering','completed']
    const curIdx = order.indexOf(status)
    return allSteps.map((step, i) => ({
      ...step,
      done: i <= curIdx,
      current: i === curIdx,
    }))
  },

  onCancelOrder() {
    wx.showModal({
      title: '取消订单',
      content: '确定要取消这个订单吗？',
      confirmColor: '#FF3B30',
      success: (res) => {
        if (res.confirm) {
          app.updateOrderStatus(this.data.order.orderId, 'cancelled')
          this._loadOrder(this.data.order.orderId)
          wx.showToast({ title: '订单已取消', icon: 'success' })
        }
      },
    })
  },

  onReorder() {
    const { items } = this.data.order
    // 将历史订单加入购物车
    app.clearCart()
    items.forEach(item => {
      for (let i = 0; i < item.quantity; i++) {
        app.addToCart({
          dishId: item.dishId,
          name: item.name,
          price: item.price,
          imageUrl: item.imageUrl,
          merchantId: 'm001',
        })
      }
    })
    wx.switchTab({ url: '/pages/cart/cart' })
  },
})

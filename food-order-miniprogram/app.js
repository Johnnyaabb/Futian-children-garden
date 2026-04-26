// app.js
App({
  globalData: {
    cart: [],           // 购物车: [{dishId, name, price, imageUrl, quantity, merchantId}]
    userRole: 'customer', // 'customer' | 'merchant' (实际项目通过登录鉴权)
    todayDishes: [],    // 今日菜品缓存
  },

  onLaunch() {
    // 从本地存储恢复购物车
    const cart = wx.getStorageSync('cart') || []
    this.globalData.cart = cart

    // 从本地存储恢复菜品数据（模拟后端）
    const dishes = wx.getStorageSync('todayDishes') || []
    this.globalData.todayDishes = dishes

    // 若无示例数据则写入
    if (dishes.length === 0) {
      this._initDemoData()
    }
  },

  // 初始化演示菜品数据
  _initDemoData() {
    const today = this._getToday()
    const demoDishe = [
      {
        dishId: 'd001',
        name: '红烧肉',
        price: 3800,  // 单位：分
        description: '五花肉慢炖2小时，色泽红亮，入口即化',
        imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400',
        category: '荤菜',
        stock: 20,
        soldCount: 0,
        isAvailable: true,
        publishedDate: today,
        merchantId: 'm001',
      },
      {
        dishId: 'd002',
        name: '清炒时蔬',
        price: 1500,
        description: '新鲜时令蔬菜，清淡爽口',
        imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
        category: '素菜',
        stock: 50,
        soldCount: 0,
        isAvailable: true,
        publishedDate: today,
        merchantId: 'm001',
      },
      {
        dishId: 'd003',
        name: '番茄鸡蛋汤',
        price: 800,
        description: '酸甜可口，营养丰富',
        imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
        category: '汤类',
        stock: 30,
        soldCount: 0,
        isAvailable: true,
        publishedDate: today,
        merchantId: 'm001',
      },
      {
        dishId: 'd004',
        name: '米饭',
        price: 200,
        description: '东北大米，粒粒饱满',
        imageUrl: 'https://images.unsplash.com/photo-1536304993881-ff86e5782afa?w=400',
        category: '主食',
        stock: 100,
        soldCount: 0,
        isAvailable: true,
        publishedDate: today,
        merchantId: 'm001',
      },
    ]
    wx.setStorageSync('todayDishes', demoDishe)
    this.globalData.todayDishes = demoDishe
  },

  // =================== 购物车操作 ===================

  addToCart(dish) {
    const cart = this.globalData.cart
    const idx = cart.findIndex(item => item.dishId === dish.dishId)
    if (idx >= 0) {
      cart[idx].quantity += 1
    } else {
      cart.push({
        dishId: dish.dishId,
        name: dish.name,
        price: dish.price,
        imageUrl: dish.imageUrl,
        quantity: 1,
        merchantId: dish.merchantId,
      })
    }
    this.globalData.cart = cart
    wx.setStorageSync('cart', cart)
  },

  removeFromCart(dishId) {
    const cart = this.globalData.cart
    const idx = cart.findIndex(item => item.dishId === dishId)
    if (idx >= 0) {
      if (cart[idx].quantity > 1) {
        cart[idx].quantity -= 1
      } else {
        cart.splice(idx, 1)
      }
    }
    this.globalData.cart = cart
    wx.setStorageSync('cart', cart)
  },

  clearCart() {
    this.globalData.cart = []
    wx.setStorageSync('cart', [])
  },

  getCartTotal() {
    return this.globalData.cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  },

  getCartCount() {
    return this.globalData.cart.reduce((sum, item) => sum + item.quantity, 0)
  },

  // =================== 菜品操作（商家） ===================

  getDishById(dishId) {
    return this.globalData.todayDishes.find(d => d.dishId === dishId)
  },

  saveDish(dish) {
    const dishes = this.globalData.todayDishes
    const idx = dishes.findIndex(d => d.dishId === dish.dishId)
    if (idx >= 0) {
      dishes[idx] = dish
    } else {
      dishes.push(dish)
    }
    this.globalData.todayDishes = dishes
    wx.setStorageSync('todayDishes', dishes)
  },

  deleteDish(dishId) {
    const dishes = this.globalData.todayDishes.filter(d => d.dishId !== dishId)
    this.globalData.todayDishes = dishes
    wx.setStorageSync('todayDishes', dishes)
  },

  toggleDishAvailable(dishId) {
    const dishes = this.globalData.todayDishes
    const idx = dishes.findIndex(d => d.dishId === dishId)
    if (idx >= 0) {
      dishes[idx].isAvailable = !dishes[idx].isAvailable
      wx.setStorageSync('todayDishes', dishes)
    }
  },

  // =================== 订单操作 ===================

  createOrder(orderData) {
    const orders = wx.getStorageSync('orders') || []
    const order = {
      orderId: 'o' + Date.now(),
      orderNo: this._genOrderNo(),
      ...orderData,
      status: 'paid',
      createdAt: new Date().toLocaleString('zh-CN'),
    }
    orders.unshift(order)
    wx.setStorageSync('orders', orders)
    return order
  },

  getOrders() {
    return wx.getStorageSync('orders') || []
  },

  updateOrderStatus(orderId, status) {
    const orders = wx.getStorageSync('orders') || []
    const idx = orders.findIndex(o => o.orderId === orderId)
    if (idx >= 0) {
      orders[idx].status = status
      wx.setStorageSync('orders', orders)
    }
  },

  // =================== 工具方法 ===================

  _getToday() {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  },

  _genOrderNo() {
    const d = new Date()
    const datePart = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`
    const seq = String(Math.floor(Math.random() * 9000) + 1000)
    return datePart + seq
  },

  formatPrice(fen) {
    return (fen / 100).toFixed(2)
  },
})

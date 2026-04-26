// pages/cart/cart.js
const app = getApp()

Page({
  data: {
    cartItems: [],
    subtotal: '0.00',
    deliveryFee: '0.00',
    total: '0.00',
    remark: '',
    address: null,
    isEmpty: true,
  },

  onShow() {
    this._refresh()
  },

  _refresh() {
    const items = app.globalData.cart
    const subtotalFen = app.getCartTotal()
    const deliveryFen = subtotalFen > 0 ? 300 : 0  // 3元配送费

    // 恢复备注和地址
    const address = wx.getStorageSync('defaultAddress') || null

    this.setData({
      cartItems: items,
      isEmpty: items.length === 0,
      subtotal: app.formatPrice(subtotalFen),
      deliveryFee: app.formatPrice(deliveryFen),
      total: app.formatPrice(subtotalFen + deliveryFen),
      address,
    })
  },

  // 增加数量
  onAdd(e) {
    const item = e.currentTarget.dataset.item
    const dish = {
      dishId: item.dishId,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl,
      merchantId: item.merchantId,
    }
    app.addToCart(dish)
    this._refresh()
  },

  // 减少数量
  onMinus(e) {
    const dishId = e.currentTarget.dataset.dishid
    app.removeFromCart(dishId)
    this._refresh()
  },

  // 清空购物车
  onClear() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空购物车吗？',
      confirmColor: '#FF6B35',
      success: (res) => {
        if (res.confirm) {
          app.clearCart()
          this._refresh()
        }
      },
    })
  },

  // 备注输入
  onRemarkInput(e) {
    this.setData({ remark: e.detail.value })
  },

  // 选择地址（模拟）
  onSelectAddress() {
    // 实际项目接入微信地址API：wx.chooseAddress
    const mockAddress = {
      name: '张三',
      phone: '138****8888',
      detail: '北京市朝阳区XX街道XX小区1号楼202室',
    }
    wx.setStorageSync('defaultAddress', mockAddress)
    this.setData({ address: mockAddress })
  },

  // 提交订单
  onCheckout() {
    if (this.data.cartItems.length === 0) return

    if (!this.data.address) {
      wx.showToast({ title: '请先选择收货地址', icon: 'none' })
      return
    }

    wx.showModal({
      title: '确认下单',
      content: `共 ${app.getCartCount()} 件商品，总计 ¥${this.data.total}`,
      confirmText: '立即支付',
      confirmColor: '#FF6B35',
      success: (res) => {
        if (res.confirm) {
          this._doCheckout()
        }
      },
    })
  },

  _doCheckout() {
    wx.showLoading({ title: '提交中...' })

    const orderData = {
      items: this.data.cartItems.map(item => ({
        dishId: item.dishId,
        name: item.name,
        price: item.price,
        imageUrl: item.imageUrl,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
      })),
      address: this.data.address,
      remark: this.data.remark,
      subtotal: Math.round(parseFloat(this.data.subtotal) * 100),
      deliveryFee: Math.round(parseFloat(this.data.deliveryFee) * 100),
      total: Math.round(parseFloat(this.data.total) * 100),
    }

    // 模拟支付延迟
    setTimeout(() => {
      wx.hideLoading()
      const order = app.createOrder(orderData)
      app.clearCart()

      wx.showToast({ title: '下单成功！', icon: 'success', duration: 1500 })

      setTimeout(() => {
        wx.navigateTo({
          url: `/pages/order-detail/order-detail?orderId=${order.orderId}`,
        })
      }, 1600)
    }, 1000)
  },
})

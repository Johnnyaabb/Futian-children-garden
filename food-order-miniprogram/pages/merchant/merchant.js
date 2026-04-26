// pages/merchant/merchant.js
const app = getApp()

Page({
  data: {
    today: '',
    todayDishes: [],
    // 弹窗表单
    showForm: false,
    editingDish: null,  // null=新增，否则=编辑中的dish
    form: {
      name: '',
      price: '',
      description: '',
      category: '荤菜',
      stock: '',
      imageUrl: '',
    },
    categories: ['荤菜', '素菜', '汤类', '主食', '饮品', '小吃'],
    categoryIndex: 0,
    orders: [],
    activeTab: 'dishes',  // 'dishes' | 'orders'
    statusMap: {
      paid: '待确认',
      confirmed: '备餐中',
      preparing: '备餐中',
      ready: '待取餐',
      delivering: '配送中',
      completed: '已完成',
      cancelled: '已取消',
    },
    statusColorMap: {
      paid: '#FF6B35',
      confirmed: '#3478F6',
      preparing: '#3478F6',
      ready: '#34C759',
      delivering: '#34C759',
      completed: '#999',
      cancelled: '#999',
    },
  },

  onLoad() {
    const d = new Date()
    this.setData({
      today: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`,
    })
  },

  onShow() {
    this._refreshDishes()
    this._refreshOrders()
  },

  _refreshDishes() {
    const today = app._getToday()
    const dishes = app.globalData.todayDishes.filter(d => d.publishedDate === today)
    this.setData({ todayDishes: dishes })
  },

  _refreshOrders() {
    const orders = app.getOrders()
    this.setData({ orders })
  },

  onTabChange(e) {
    this.setData({ activeTab: e.currentTarget.dataset.tab })
  },

  // ===== 菜品管理 =====

  onAddDish() {
    this.setData({
      showForm: true,
      editingDish: null,
      form: { name: '', price: '', description: '', category: '荤菜', stock: '20', imageUrl: '' },
      categoryIndex: 0,
    })
  },

  onEditDish(e) {
    const dish = e.currentTarget.dataset.dish
    const catIdx = this.data.categories.indexOf(dish.category)
    this.setData({
      showForm: true,
      editingDish: dish,
      form: {
        name: dish.name,
        price: (dish.price / 100).toFixed(2),
        description: dish.description,
        category: dish.category,
        stock: String(dish.stock),
        imageUrl: dish.imageUrl,
      },
      categoryIndex: catIdx >= 0 ? catIdx : 0,
    })
  },

  onFormClose() {
    this.setData({ showForm: false })
  },

  onFormNameInput(e) {
    this.setData({ 'form.name': e.detail.value })
  },

  onFormPriceInput(e) {
    this.setData({ 'form.price': e.detail.value })
  },

  onFormDescInput(e) {
    this.setData({ 'form.description': e.detail.value })
  },

  onFormStockInput(e) {
    this.setData({ 'form.stock': e.detail.value })
  },

  onCategoryChange(e) {
    const idx = parseInt(e.detail.value)
    this.setData({
      categoryIndex: idx,
      'form.category': this.data.categories[idx],
    })
  },

  // 选择图片（模拟上传）
  onChooseImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempUrl = res.tempFiles[0].tempFilePath
        // 实际项目：调用 wx.uploadFile 上传至云存储
        // 这里直接使用临时路径做演示
        this.setData({ 'form.imageUrl': tempUrl })
        wx.showToast({ title: '图片已选择', icon: 'success' })
      },
    })
  },

  onSaveDish() {
    const { form, editingDish, categories, categoryIndex } = this.data

    if (!form.name.trim()) {
      wx.showToast({ title: '请输入菜品名称', icon: 'none' }); return
    }
    if (!form.price || isNaN(parseFloat(form.price)) || parseFloat(form.price) <= 0) {
      wx.showToast({ title: '请输入正确的价格', icon: 'none' }); return
    }

    const dish = {
      dishId: editingDish ? editingDish.dishId : 'd' + Date.now(),
      merchantId: 'm001',
      name: form.name.trim(),
      price: Math.round(parseFloat(form.price) * 100),
      description: form.description.trim(),
      category: form.category,
      stock: parseInt(form.stock) || 999,
      imageUrl: form.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
      isAvailable: true,
      soldCount: editingDish ? editingDish.soldCount : 0,
      publishedDate: app._getToday(),
    }

    app.saveDish(dish)
    this._refreshDishes()
    this.setData({ showForm: false })
    wx.showToast({ title: editingDish ? '已更新' : '已上架', icon: 'success' })
  },

  onToggleAvailable(e) {
    const dishId = e.currentTarget.dataset.dishid
    app.toggleDishAvailable(dishId)
    this._refreshDishes()
  },

  onDeleteDish(e) {
    const dishId = e.currentTarget.dataset.dishid
    wx.showModal({
      title: '删除菜品',
      content: '确定要下架并删除该菜品吗？',
      confirmColor: '#FF3B30',
      success: (res) => {
        if (res.confirm) {
          app.deleteDish(dishId)
          this._refreshDishes()
          wx.showToast({ title: '已删除', icon: 'success' })
        }
      },
    })
  },

  // ===== 订单管理 =====

  onAcceptOrder(e) {
    const orderId = e.currentTarget.dataset.orderid
    app.updateOrderStatus(orderId, 'confirmed')
    this._refreshOrders()
    wx.showToast({ title: '已接单', icon: 'success' })
  },

  onCompleteOrder(e) {
    const orderId = e.currentTarget.dataset.orderid
    app.updateOrderStatus(orderId, 'completed')
    this._refreshOrders()
    wx.showToast({ title: '已完成', icon: 'success' })
  },

  onViewOrderDetail(e) {
    const orderId = e.currentTarget.dataset.orderid
    wx.navigateTo({ url: `/pages/order-detail/order-detail?orderId=${orderId}&isMerchant=true` })
  },

  formatPrice(fen) {
    return app.formatPrice(fen)
  },
})

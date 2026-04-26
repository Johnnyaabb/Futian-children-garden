// pages/home/home.js
const app = getApp()

Page({
  data: {
    today: '',
    categories: ['全部', '荤菜', '素菜', '汤类', '主食', '饮品'],
    activeCategory: '全部',
    dishes: [],
    filteredDishes: [],
    cartCount: 0,
    cartTotal: '0.00',
    // 每道菜在购物车中的数量（dishId -> qty）
    cartMap: {},
  },

  onLoad() {
    const d = new Date()
    this.setData({
      today: `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`,
    })
  },

  onShow() {
    this._refreshDishes()
    this._refreshCart()
  },

  // 刷新菜品列表
  _refreshDishes() {
    const today = app._getToday()
    const dishes = app.globalData.todayDishes.filter(
      d => d.publishedDate === today && d.isAvailable
    )
    const cartMap = {}
    app.globalData.cart.forEach(item => {
      cartMap[item.dishId] = item.quantity
    })
    this.setData({ dishes, cartMap })
    this._filterByCategory(this.data.activeCategory)
  },

  // 刷新购物车信息
  _refreshCart() {
    this.setData({
      cartCount: app.getCartCount(),
      cartTotal: app.formatPrice(app.getCartTotal()),
    })
  },

  // 切换分类
  onCategoryTap(e) {
    const cat = e.currentTarget.dataset.category
    this.setData({ activeCategory: cat })
    this._filterByCategory(cat)
  },

  _filterByCategory(cat) {
    const dishes = this.data.dishes
    const filtered = cat === '全部' ? dishes : dishes.filter(d => d.category === cat)
    this.setData({ filteredDishes: filtered })
  },

  // 加入购物车
  onAddToCart(e) {
    const dish = e.currentTarget.dataset.dish
    app.addToCart(dish)
    this._refreshCart()

    // 更新当前菜品的购物车数量
    const cartMap = { ...this.data.cartMap }
    cartMap[dish.dishId] = (cartMap[dish.dishId] || 0) + 1
    this.setData({ cartMap })

    wx.showToast({ title: '已加入购物车', icon: 'success', duration: 800 })
  },

  // 从购物车减少
  onRemoveFromCart(e) {
    const dishId = e.currentTarget.dataset.dishid
    app.removeFromCart(dishId)
    this._refreshCart()

    const cartMap = { ...this.data.cartMap }
    if (cartMap[dishId] > 1) {
      cartMap[dishId] -= 1
    } else {
      delete cartMap[dishId]
    }
    this.setData({ cartMap })
  },

  // 跳转购物车
  onGoToCart() {
    wx.switchTab({ url: '/pages/cart/cart' })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this._refreshDishes()
    this._refreshCart()
    wx.stopPullDownRefresh()
  },
})

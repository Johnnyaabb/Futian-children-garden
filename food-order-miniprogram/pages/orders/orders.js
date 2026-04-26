// pages/orders/orders.js
const app = getApp()

Page({
  data: {
    orders: [],
    statusMap: {
      paid: '待商家确认',
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

  onShow() {
    this._refresh()
  },

  _refresh() {
    const orders = app.getOrders()
    this.setData({ orders })
  },

  onOrderTap(e) {
    const orderId = e.currentTarget.dataset.orderid
    wx.navigateTo({ url: `/pages/order-detail/order-detail?orderId=${orderId}` })
  },

  formatPrice(fen) {
    return app.formatPrice(fen)
  },
})

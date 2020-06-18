// pages/business/my/my.js
var app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    userInfo: {}
  },

  /**
   * 组件的方法列表
   */
  methods: {
    signout(e) {
      wx.showModal({
        title: '提示',
        content: '确认要退出后台？',
        success: function (res) {
          if (res.confirm) {
            wx.reLaunch({
              url: '/pages/meal/index/index'
            })
          } else if (res.cancel) {

          }
        }
      })
    },

    setNavigationBarTitle() {
      app.setNavigationBarTitle('我的设置')
    },
  },
  ready() {
    this.setNavigationBarTitle()
    this.setData({
      userInfo: app.getBUserInfo()
    })
  }
})
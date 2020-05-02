var app = getApp()


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
    login: function (e) {
      var that = this;
      if (e.detail.errMsg === 'getUserInfo:ok') {

        app.getUserInfo(function (e) {
          wx.setStorageSync('userInfo', e);
          that.setData({
            userInfo: e
          })
        })
      }
    },
    signout: function (e) {
      var that = this;
      wx.showModal({
        title: '提示',
        content: '确认要退出？',
        success: function (res) {
          if (res.confirm) {
            wx.removeStorageSync('userInfo');
            that.setData({
              userInfo: ''
            })
          } else if (res.cancel) {

          }
        }
      })
    },
    toMyaddress: function (e) {

      var that = this;
      if (that.data.userInfo == '') {
        wx.showModal({
          title: '提示',
          content: '先登录',
          showCancel: false
        })
      } else {
        wx.navigateTo({
          url: '/pages/meal/uaddresslist/uaddresslist'
        });
      }
      // wx.navigateTo({
      //   url: '/pages/meal/uaddresslist/uaddresslist'
      // });


    },
    toMymember: function (e) {
      wx.showModal({
        title: '提示',
        content: '正在建设中',
        showCancel: false
      })
    },
    toMycoupon: function (e) {
      wx.showModal({
        title: '提示',
        content: '正在建设中',
        showCancel: false
      })
    },
    /**
     * 跳转商家后台登录界面
     *  
     */
    toBlogin: function (e) {
      wx.navigateTo({
        url: '/pages/meal/blogin/blogin'
      });
    }
  },




  ready() {
    var userInfo = wx.getStorageSync('userInfo');
    // console.log('userInfo:' + JSON.stringify(userInfo));
    this.setData({
      userInfo: userInfo
    })
    wx.setNavigationBarTitle({
      title: "用户中心"
    })
  }
})
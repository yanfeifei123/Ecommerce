const httpRequest = require('../../../utils/request.js');
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    area: '点击获取收货地址',
    latitude: 0,
    longitude: 0,
    city: '',
    phone: '',
    gender: '先生',
    detailed: '',
    name: ''

  },


  getArea: function (e) {
    var that = this;
    app.getPermission(that);
  },


  setdetailed: function (e) {
    this.setData({
      detailed: e.detail.value
    })
  },

  setname: function (e) {
    this.setData({
      name: e.detail.value
    })
  },

  setphone: function (e) {
    this.setData({
      phone: e.detail.value
    })
  },

  radioChange: function (e) {
    this.setData({
      gender: e.detail.value
    })
  },

  submitaddress: function (e) {

    if (this.data.area == '' || this.data.detailed == '' || this.data.name == '' || this.data.phone == '') {
      wx.showModal({
        title: '提示',
        content: '输入信息不完整',
        showCancel: false
      })
    } else {
      if (!/^1(3|4|5|7|8)\d{9}$/.test(this.data.phone)) {
        wx.showModal({
          title: '提示',
          content: '你输入的电话不符，请重新检查填写',
          showCancel: false
        })
      } else {
        var that = this;
        var u_address = {

          area: that.data.area,
          detailed: that.data.detailed,
          gender: that.data.gender,
          name: that.data.name,
          phone: that.data.phone,
          latitude: that.data.latitude,
          longitude: that.data.longitude
        };
        httpRequest._post('/updateUaddress', {
          u_address: JSON.stringify(u_address),
          openid: wx.getStorageSync('openid')
        }, function (res) {
          let pages = getCurrentPages();
          let prevpage = pages[pages.length - 2];
          console.log('submitaddress:' + prevpage.route)
          var url = '/' + prevpage.route;
          // console.log('url:'+url)
          if (res.data == 1) {
            wx.redirectTo({
              url: url
            });
          } else {
            wx.showModal({
              title: '提示',
              content: '信息提交失败',
              showCancel: false
            })
          }
        }, function (err) {

        })
      }
    }





    // console.log(this.data.phone+"   "+this.data.detailed+"   "+this.data.area+"   "+this.data.name+"   "+this.data.latitude+"   "+this.data.longitude);
  },


  getPhoneNumber: function (e) {
    var that = this;
    
    app.getPhoneNumber(e, function (data) {
      that.setData({
        phone: data.phone
      })
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
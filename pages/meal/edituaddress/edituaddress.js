

const httpRequest = require('../../../utils/request.js');

var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    uaddress: {},
    height: 0,
    area: '',
    latitude: 0,
    longitude: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    httpRequest._post(
      '/findByOneUaddress', {
        id: options.id
      },
      function (res) {
        that.setData({
          uaddress: res.data
        })
      },
      function (err) {

      }, true
    )
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          height: res.windowHeight
        })
      }
    });
  },

  getArea: function (e) {
    var that = this;
    app.getPermission(that, function () {
      that.data.uaddress.area = that.data.area;
      that.data.uaddress.latitude = that.data.latitude;
      that.data.uaddress.longitude = that.data.longitude;
      that.setData({
        uaddress: that.data.uaddress
      })
    });
  },

  setdetailed: function (e) {
    this.data.uaddress.detailed = e.detail.value;
    this.setData({
      uaddress: this.data.uaddress
    })
  },

  setname: function (e) {
    this.data.uaddress.name = e.detail.value;
    this.setData({
      name: this.data.uaddress
    })
  },

  setphone: function (e) {
    this.data.uaddress.phone = e.detail.value;
    this.setData({
      uaddress: this.data.uaddress
    })
  },

  radioChange: function (e) {
    this.data.uaddress.gender = e.detail.value;
    this.setData({
      gender: this.data.uaddress
    })
  },

  submitaddress: function (e) {
    if (this.data.uaddress.area == '' || this.data.uaddress.detailed == '' || this.data.uaddress.name == '' || this.data.uaddress.phone == '') {
      wx.showModal({
        title: '提示',
        content: '输入信息不完整',
        showCancel: false
      })
    } else {
      if (!/^1(3|4|5|7|8)\d{9}$/.test(this.data.uaddress.phone)) {
        wx.showModal({
          title: '提示',
          content: '你输入的电话不符，请重新检查填写',
          showCancel: false
        })
      } else {
        var that = this;
        var u_address = {
          id: that.data.uaddress.id,
          area: that.data.uaddress.area,
          detailed: that.data.uaddress.detailed,
          gender: that.data.uaddress.gender,
          name: that.data.uaddress.name,
          phone: that.data.uaddress.phone,
          latitude: that.data.uaddress.latitude,
          longitude: that.data.uaddress.longitude
        };
        app.getOpenid(function (openid) {
          httpRequest._post('/updateUaddress', {
            u_address: JSON.stringify(u_address),
            openid: openid
          }, function (res) {
            let pages = getCurrentPages();
            let prevpage = pages[pages.length - 2];
            var url = '/' + prevpage.route;
            if (res.data == 1) {
              wx.navigateBack({
                delta: 1,
                complete:function(){
                
                }
              })
            } else {
              wx.showModal({
                title: '提示',
                content: '信息提交失败',
                showCancel: false
              })
            }
          }, function (err) {

          }, true)
        })

      }
    }
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
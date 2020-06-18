const httpRequest = require('../../../utils/request.js');
import baseurl from '../../../utils/baseurl.js'
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    height: 0,
    userms: [],
    searchValue: '',



  },


  getSystemInfo() {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          height: res.windowHeight
        })
      }
    });
  },

  searchfValue(e) {
    this.setData({
      searchValue: e.detail.value
    })
    this.findBybranchUser();
  },

  findBybranchUser() {
    var that = this;
    httpRequest._post('/findBybranchUser', {
      branchid: app.globalData.branchid,
      name: that.data.searchValue
    }, function (res) {
      if (res.data) {
        that.setData({
          userms: res.data
        })
      }
    }, function (err) {

    }, true)
  },

  openemployees(e) {
    wx.navigateTo({
      url: '/pages/business/employees/employees'
    })
  },








  unboundUser(e) {
    var userid = e.target.dataset.id || e.currentTarget.dataset.id;

    var that = this;
    wx.showModal({
      title: '提示',
      content: '是否确定解绑',
      cancelText: '取消',
      confirmText: '确定',
      success: res => {
        if (res.confirm) {
          httpRequest._post('/unboundUser', {
            userid: userid,
            name: that.data.searchValue
          }, function (res) {
            if (res.data) {
              that.setData({
                userms: res.data
              })
            }
          }, function (err) {

          }, true)
        }
      }
    })
  },



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getSystemInfo();
    this.findBybranchUser();
    app.setNavigationBarTitle('员工管理')
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
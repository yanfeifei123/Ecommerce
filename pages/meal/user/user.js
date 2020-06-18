// pages/meal/user/user.js

const httpRequest = require('../../../utils/request.js');
import baseurl from '../../../utils/baseurl.js'
var app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    phone: '18725082372',
    orderid: '',
    isCancellogin: false
  },
  login: function (e) {
    wx.navigateTo({
      url: '/pages/login/login'
    })
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
            userInfo: null
          })
        } else if (res.cancel) {

        }
      }
    })
  },
  toMyaddress: function (e) {

    var that = this;
    if (that.data.userInfo == null) {
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
  },

  getUserInfo() {
    var userInfo = wx.getStorageSync('userInfo');
    if (userInfo == '') {
      wx.navigateTo({
        url: '/pages/login/login'
      })
    } else {
      this.setData({
        userInfo: userInfo
      })
    }
  },






  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    app.setNavigationBarTitle('用户中心')
    var that = this;
    app.findByBbranch(function (bbranch) {
      that.setData({
        phone: bbranch.phone
      })
    }, app.globalData.branchid)
    this.getUserInfo();
  },

  makePhoneCall: function (e) {
    app.makePhoneCall(this.data.phone)
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
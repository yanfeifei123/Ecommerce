// pages/meal/orderd/orderd.js
const httpRequest = require('../../../utils/request.js');
/**  订单详情 */
import baseurl from '../../../utils/baseurl.js'

var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    baseurl: baseurl.baseurl,
    suffix: '￥',
    specification: 'X',
    orderDetail: {},
    phone: ''
  },


  makePhoneCall: function (e) {
    app.makePhoneCall(this.data.phone)
  },

  updateAddress: function (e) {
    var orderid = this.data.orderDetail.orderid;
    // console.log('orderid:'+orderid)
    wx.navigateTo({
      url: '/pages/meal/uaddresslist/uaddresslist?submitorders=1&orderid=' + orderid
    });
  },

  /**
   * 
   * @param {退款申请} e 
   */
  refund: function (e) {
    
    var orderDetail = this.data.orderDetail;
    this.inspectRefund(function (data) {
      console.log(data)
      // if (data == false) {
      if (orderDetail.titlestatus == '待退款') {
        wx.navigateTo({
          url: '/pages/meal/orderrefundp/orderrefundp?orderDetail=' + JSON.stringify(orderDetail) + '&find=1'
        })
      } else if (orderDetail.titlestatus == '已退款') {
        wx.navigateTo({
          url: '/pages/meal/orderrefundp/orderrefundp?orderDetail=' + JSON.stringify(orderDetail) + '&find=3'
        })
      } else if (orderDetail.titlestatus == '未退款') {
        wx.navigateTo({
          url: '/pages/meal/orderrefundp/orderrefundp?orderDetail=' + JSON.stringify(orderDetail)
        })
      } else {
        wx.navigateTo({
          url: '/pages/meal/orderrefund/orderrefund?orderDetail=' + JSON.stringify(orderDetail)
        })

      }
    })

  },

  /**
   * 
   * @param {检查订单状态} e 
   */
  inspectRefund: function (callback) {
    var that = this;
    var orderid = this.data.orderDetail.orderid;
    httpRequest._post('/weChatPay/inspectRefund', {
      orderid: orderid
    }, function (res) {
      callback(res.data);
    }, function (err) {

    }, true)
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var orderid = options.orderid;

    var that = this;
    httpRequest._post('/order/findOrderDetailed', {
      orderid: orderid
    }, function (res) {
      var orderDetail = res.data;
      // console.log('orderDetail:'+JSON.stringify(orderDetail))
      wx.getSystemInfo({
        success: function (res) {
          that.setData({
            scrollheight: res.windowHeight - 10,
            orderDetail: orderDetail
          })
        }
      });

    }, function (err) {

    }, true)

    app.findByBbranch(function (bbranch) {
      that.setData({
        phone: bbranch.phone
      })
    }, app.globalData.branchid)

    app.setNavigationBarTitle('订单详情')

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
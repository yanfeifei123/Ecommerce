// pages/meal/orderd/orderd.js
const httpRequest = require('../../../utils/request.js');
/**  订单详情 */
const orderDetail = require('../../../utils/orderDetail.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    suffix: '￥',
    specification: 'X',
    orderDetail:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var orderid = options.orderid;
    var that = this;
    httpRequest._post('/order/findOrderDetailed', {
      orderid: orderid
    }, function(res) {
      var orderDetail = res.data;
      wx.getSystemInfo({
        success: function(res) {
          that.setData({
            scrollheight: res.windowHeight - 10,
            orderDetail: orderDetail
          })
        }
      });

    }, function(err) {

    })
    // var that = this;
    // wx.getSystemInfo({
    //     success: function(res) {
    //       that.setData({
    //         scrollheight: res.windowHeight - 10,
    //         orderDetail: orderDetail
    //       })
    //     }
    //   });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    wx.setNavigationBarTitle({
      title: "订单详情"
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})
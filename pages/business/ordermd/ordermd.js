// pages/business/ordermd/ordermd.js
const httpRequest = require('../../../utils/request.js');
import baseurl from '../../../utils/baseurl.js'
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    baseurl: baseurl.baseurl,
    suffix: '￥',
    specification: 'X',
    orderDetail: {}
  },


  iscomplete(e) {
    var v = e.detail.value;
    var that = this;
    if (v == 1) {
      wx.showModal({
        title: '提示',
        content: '是否已完成订单？',
        success: function (res) {
          if (res.confirm) {
            that.completeUorder();
          } else if (res.cancel) {
            that.setData({
              complete: false
            })
          }
        }
      })
    }

  },

  completeUorder: function () {
    var that = this;
    var orderid = this.data.orderDetail.orderid;
    httpRequest._post('/border/completeUorder', {
      orderid: orderid
    }, function (res) {
      if (res.data) {
        let pages = getCurrentPages();
        let prevpage = pages[pages.length - 2];
        wx.navigateBack({
          delta: 1,
          complete: function () {
            prevpage.onLoad();
          }
        })
      }
    }, function (err) {

    }, true)
  },

  printSmallticket: function () {
    let pages = getCurrentPages();
    let prevpage = pages[pages.length - 3];
    var url = '/' + prevpage.route;
    if (url.indexOf('business/tabBar/tabBar') != -1) {
      if (prevpage.data.bbluetoothisConnect) {
        prevpage.printSmallticket(this.data.orderDetail)
      } else {
        wx.showToast({
          title: '请设置蓝牙设备！',
          icon: 'success',
          duration: 2000
        })
      }

    }
  },
  makePhoneCall: function (e) {
    app.makePhoneCall(this.data.orderDetail.phone);
  },

  orderrefundp(e) {
    var orderDetail = this.data.orderDetail
    var find = 2;
    if (orderDetail.titlestatus == '已退款') {
      find = 3;
    }
    wx.navigateTo({
      url: '/pages/meal/orderrefundp/orderrefundp?orderDetail=' + JSON.stringify(orderDetail) + '&find=' + find
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.setNavigationBarTitle('订单详情')
    var orderid = options.orderid;
    var that = this;
    httpRequest._post('/order/findOrderDetailed', {
      orderid: orderid
    }, function (res) {
      var orderDetail = res.data;
      wx.getSystemInfo({
        success: function (res) {
          var scrollheight = res.windowHeight - 10;
          // console.log('scrollheight:' + scrollheight)
          that.setData({
            scrollheight: scrollheight,
            orderDetail: orderDetail
          })
        }
      });

    }, function (err) {

    }, true)
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
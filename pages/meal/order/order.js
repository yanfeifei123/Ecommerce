// pages/meal/components/order/order.js

const httpRequest = require('../../../utils/request.js');
const configlogin = require('../../../utils/configlogin.js');
const orderList = require('../../../utils/orderlist.js');


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
    specification: app.globalData.specification,
    suffix: app.globalData.suffix,
    orderList: []
  },

  /**
   * 组件的方法列表
   */
  methods: {

    findOrderList: function() {
      var userInfo = wx.getStorageSync('userInfo');

      if (userInfo === '') {
        wx.navigateTo({
          url: '/pages/login/login'
        })
      } else {
        var that = this;
        httpRequest._post('/order/findOrderList', {
          openid: wx.getStorageSync('openid')
        }, function(res) {
          var data = res.data;
          console.log(data);
          that.setData({
            orderList: data
          })
        }, function(err) {

        })
      }

      // this.setData({
      //   orderList: orderList
      // })
    },

    bindDownLoad: function(e) {
      console.log('下拉')
    },
    topLoad: function(e) {
      console.log('上拉')
    },

    nvlDetailed: function(e) {
      var orderid = e.currentTarget.id;
      // console.log('item:' + JSON.stringify(item));
      wx.navigateTo({
        url: '/pages/meal/orderd/orderd?orderid=' + orderid
      })
    }
  },
  ready() {

    this.findOrderList();
    var that = this;
    wx.getSystemInfo({
      success: function(res) {
        var scrollheight = res.windowHeight - 55;
        console.log('scrollheight:' + scrollheight)
        that.setData({
          scrollheight: scrollheight
        })
      }
    });
    wx.setNavigationBarTitle({
      title: "我的订单"
    })
  }
})
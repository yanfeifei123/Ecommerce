// pages/meal/order/order.js

const httpRequest = require('../../../utils/request.js');
import baseurl from '../../../utils/baseurl.js'
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    baseurl: baseurl.baseurl,
    specification: app.globalData.specification,
    suffix: app.globalData.suffix,
    orderList: [],
    pageSize: 6,
    scrollTm: {
      page: 1,
      totalPage: 10,
      emptyImg: '/images/mescroll-empty.png'
    },

  },




  findOrderList: function (page, callback) {
    let that = this
    app.getOpenid(function (openid) {
      httpRequest._post('/order/findOrderList', {
        openid: openid,
        pageNum: app.pagingAlgorithm(page, that.data.pageSize),
        pageSize: that.data.pageSize
      }, function (res) {
        callback(res.data);
      }, function (err) {

      }, false)
    })

  },

  bindDownLoad: function (e) {

  },

  refresh: function (e) {

  },



  nvlDetailed: function (e) {
    var orderid = e.currentTarget.id;
    var info = e.currentTarget.dataset.info;
    if (info != '未支付') {
      wx.navigateTo({
        url: '/pages/meal/orderd/orderd?orderid=' + orderid
      })
    }
  },


  iniscrollTm: function () {

    let that = this

    app.getOpenid(function (openid) {
      httpRequest._post('/order/countAllByUorderOAndOpenid', {
        openid: openid,
        pageSize: that.data.pageSize
      }, function (res) {
        that.data.scrollTm.totalPage = res.data;
        that.setData({
          scrollTm: that.data.scrollTm
        })
        that.getTmData('refresh', 1);
      }, function (err) {

      }, true)
    })


  },

  refreshTm: function () {
    this.getTmData('refresh', 1)
  },

  loadMoreTm: function () {
    this.getTmData('loadMore', this.data.scrollTm.page + 1)
  },


  getTmData: function (type, page) {
    let that = this

    if (type == 'refresh') {
      that.findOrderList(page, function (data) {
        // console.log('order:'+JSON.stringify(data));
        let scrollTm = that.data.scrollTm
        scrollTm.page = page
        setTimeout(() => {
          that.setData({
            orderList: data,
            scrollTm: scrollTm
          });
        }, 300);
      })
    } else {
      that.findOrderList(page, function (data) {
        setTimeout(() => {
          if (that.data.scrollTm.page < that.data.scrollTm.totalPage) {
            let scrollTm = that.data.scrollTm
            scrollTm.page = page
            that.setData({
              orderList: that.filterOrderlist(data),
              scrollTm: scrollTm
            });
          } else {
            let scrollTm = that.data.scrollTm
            scrollTm.page = page
            that.setData({
              scrollTm: scrollTm
            });
          }
        }, 1000);
      })
    }
  },

  filterOrderlist: function (data) {
    var localMap = new Map();
    var orderList = this.data.orderList;
    orderList = orderList.concat(data);
    var list = [];
    for (var i = 0; i < orderList.length; i++) {
      var item = orderList[i];
      if (!localMap.has(item.id)) {
        // console.log(item.id)
        list.push(item)
        localMap.set(item.id, item.id);
      } else {
        console.log('找到重复数据:' + item.id)
      }
    }
    console.log('list:' + list.length)
    return list;
  },

  pay: function (e) {
    var orderid = e.currentTarget.dataset.id;
    var orderList = this.data.orderList;
    for (var i = 0; i < orderList.length; i++) {
      var order = orderList[i];
      if (order.id == orderid) {
        var tradeno = order.tradeno
        var total_fee = order.totalfee * 100;
        var orderBody = '校园饭tuan外卖订单'
        var that = this;
        app.pay(tradeno, total_fee, orderBody, function () {
          that.subscribeMessage()
        })
        break;
      }
    }
  },
  subscribeMessage: function () {
    var that = this;
    var tempid = 'X4ZGAyIVgnoOKUodwioOF1ocF4x1CYpU4KoI2H8VVgE';
    wx.requestSubscribeMessage({
      tmplIds: [tempid],
      success(res) {

        wx.switchTab({
          url: '/pages/meal/index/index',
          success: function () {
            let page = getCurrentPages().pop();
            page.clearshoppingcart();
            wx.removeStorageSync('commoditys')
            wx.removeStorageSync('cart')
            wx.removeStorageSync('setmeals')
            wx.switchTab({
              url: '/pages/meal/order/order',
              success: function () {}
            })
          }
        })
      }
    });
  },

  deleteOrder: function (e) {
    var orderid = e.currentTarget.dataset.id;
    var that = this;
    httpRequest._post('/order/deleteOrder', {
      orderid: orderid,
    }, function (res) {
      that.iniscrollTm();
    }, function (err) {

    }, true)
  },



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (!wx.getStorageSync('userInfo')) {
      wx.navigateTo({
        url: '/pages/login/login'
      })
    } else {
      var that = this;
      wx.getSystemInfo({
        success: function (res) {
          var scrollheight = res.windowHeight;
          that.setData({
            scrollheight: scrollheight
          })
        }
      });

      app.setNavigationBarTitle('我的订单');
      this.iniscrollTm();
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
    this.iniscrollTm();
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

  },

  comingOrder(e) {
    var that = this;
    var orderid = e.target.dataset.id;
    // app.verificationLocation(function (dis) {
    //   if (parseFloat(dis) >= 2) {
    //     wx.showModal({
    //       title: '提示',
    //       content: '超出配送范围'
    //     });
    //     return;
    //   }
    httpRequest._post('/order/comingOrder', {
      orderid: orderid
    }, function (res) {
      var list = res.data;
      that.finByfood(list)
    }, function (err) {

    }, true)

    // })


  },

  finByfood(list) {
    var commoditys = wx.getStorageSync('commoditys');
    for (var parentIndex = 0; parentIndex < commoditys.length; parentIndex++) {
      var bproductsitems = commoditys[parentIndex].bproductsitems;
      for (var index = 0; index < bproductsitems.length; index++) {
        for (var i = 0; i < list.length; i++) {
          var item = list[i];
          if (item.id == bproductsitems[index].id) {
            //  console.log('找到商品：'+parentIndex+'  '+index+'  '+bproductsitems[index].name);
            item.parentIndex = parentIndex;
            item.index = index
          }
        }
      }
    }
    wx.switchTab({
      url: '/pages/meal/index/index',
      success: function () {
        var page = getCurrentPages().pop();
        page.comingOrder(list)
      }
    })


  }



})
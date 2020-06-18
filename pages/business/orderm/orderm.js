// pages/business/orderm/orderm.js
const httpRequest = require('../../../utils/request.js');
import baseurl from '../../../utils/baseurl.js'
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    baseurl: baseurl.baseurl,
    branchOrders: [],
    suffix: app.globalData.suffix,
    tabs: [{
      name: '未完成',
      id: 0,
      msg: false
    }, {
      name: '退款',
      id: 3,
      msg: false
    }, {
      name: '全部',
      id: 2,
      msg: false
    }],
    tabid: 0,

    pageSize: 6,
    scrollTm: {
      page: 1,
      totalPage: 10,
      emptyImg: '/images/mescroll-empty.png'
      // ,
      // refreshBackgroundImage: ''
    }

  },

  selectedTabs: function (e) {
    var id = e.target.dataset.id
    this.setData({
      tabid: id
    })
    this.getTmData('refresh', 1)
  },

  findByBranchOrder(tabid, page, callback) {
    var that = this;
    var userInfo = app.getBUserInfo();
    httpRequest._post('/border/findByBranchOrder', {
      branchid: userInfo.branchid,
      tabid: tabid,
      pageNum: app.pagingAlgorithm(page, that.data.pageSize),
      pageSize: that.data.pageSize
    }, function (res) {
      callback(res.data)
    }, function (err) {

    }, false)
  },

  refreshTm: function () {
    this.getTmData('refresh', 1)
  },

  loadMoreTm: function () {
    this.getTmData('loadMore', this.data.scrollTm.page + 1)
  },
  getTmData: function (type, page) {
    let that = this
    let tabid = this.data.tabid;
    // console.log('tabid:'+tabid)
    if (type == 'refresh') {

      this.findByBranchOrder(tabid, page, function (data) {
        let scrollTm = that.data.scrollTm
        scrollTm.page = page
        scrollTm.totalPage = data.totalPage
        setTimeout(() => {
          that.setData({
            branchOrders: data.data,
            scrollTm: scrollTm
          });
        }, 300);
      })
    } else {
      this.findByBranchOrder(tabid, page, function (data) {
        setTimeout(() => {

          if (that.data.scrollTm.page < that.data.scrollTm.totalPage) {
            let scrollTm = that.data.scrollTm
            scrollTm.page = page

            that.setData({
              branchOrders: that.filterOrderlist(data.data),
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
    var branchOrders = this.data.branchOrders;
    branchOrders = branchOrders.concat(data);
    var list = [];
    for (var i = 0; i < branchOrders.length; i++) {
      var item = branchOrders[i];
      if (!localMap.has(item.orderid)) {
        list.push(item)
        localMap.set(item.orderid, item.orderid);
      } else {
        console.log('找到重复数据:' + item.orderid)
      }
    }

    console.log('list:' + list.length)
    return list;
  },

  countBranchStayRefundOrder() {
    var userInfo = app.getBUserInfo();
    var that = this;
    httpRequest._post('/order/countAllByBranchStayRefundOrder', {
      branchid: userInfo.branchid
    }, function (res) {
      console.log('待退款信息：' + res.data);
      if (res.data != 0) {
        var tab = that.data.tabs[1];
        tab.msg = true;
        tab.num = res.data
        that.setData({
          tabs: that.data.tabs
        })
        console.log(JSON.stringify(that.data.tabs))
      }
    }, function (err) {

    }, true)
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    this.getTmData('refresh', 1)
    app.setNavigationBarTitle('我的订单')
    wx.getSystemInfo({
      success: function (res) {
        var scrollheight = res.windowHeight - 10 - 50;
        that.setData({
          scrollheight: scrollheight
        })
      }
    });
    this.countBranchStayRefundOrder();
  },



  viewordermd: function (e) {

    var orderid = e.target.id || e.currentTarget.id;
    wx.navigateTo({
      url: '/pages/business/ordermd/ordermd?orderid=' + orderid
    })
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
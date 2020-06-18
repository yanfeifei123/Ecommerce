const httpRequest = require('../../../utils/request.js');
import baseurl from '../../../utils/baseurl.js'
var app = getApp()
Page({

  data: {
    name: '',
    pageSize: 6,
    userList: [],
    height: 0,
    scrollTm: {
      page: 1,
      totalPage: 10,
      emptyImg: '/images/mescroll-empty.png'
    }
  },

  bindName(e) {
    this.setData({
      name: e.detail.value
    })
    this.initcooluiscroll();
  },



  findByUsers(page, callback) {
    var that = this;
    httpRequest._post('/findByUsers', {
      name: that.data.name,
      pageNum: app.pagingAlgorithm(page, that.data.pageSize),
      pageSize: that.data.pageSize
    }, function (res) {
      callback(res.data);
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
    if (type == 'refresh') {
      that.findByUsers(page, function (data) {
        let scrollTm = that.data.scrollTm
        scrollTm.page = page
        setTimeout(() => {
          that.setData({
            userList: data,
            scrollTm: scrollTm
          });
        }, 300);
      })
    } else {
      that.findByUsers(page, function (data) {
        setTimeout(() => {
          if (that.data.scrollTm.page < that.data.scrollTm.totalPage) {
            let scrollTm = that.data.scrollTm
            scrollTm.page = page
            that.setData({
              userList: that.filterUserList(data),
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
  filterUserList(data) {
    var localMap = new Map();
    var userList = this.data.userList;
    userList = userList.concat(data);
    var list = [];
    for (var i = 0; i < userList.length; i++) {
      var item = userList[i];
      if (!localMap.has(item.id)) {
        list.push(item)
        localMap.set(item.id, item.id);
      } else {
        console.log('找到重复数据:' + item.id)
      }
    }
    console.log('list:' + list.length)
    return list;
  },

  initcooluiscroll() {
    let that = this
    httpRequest._post('/usertotalPage', {
      name: that.data.name,
      pageSize: that.data.pageSize
    }, function (res) {
      that.data.scrollTm.totalPage = res.data;
      that.setData({
        scrollTm: that.data.scrollTm,
      })
      that.getTmData('refresh', 1);
    }, function (err) {

    }, true)
  },

  getSystemInfo() {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          height: res.windowHeight - 50
        })
      }
    });
  },
  radioChange(e) {
    var userid = e.detail.value;
    var that = this;
    httpRequest._post('/onboundUser', {
      userid: userid,
      branchid:app.globalData.branchid
    }, function (res) {
       if(res.data){
        that.routeOrderPage();
       }
    }, function (err) {

    }, true)
  },

  routeOrderPage(){
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1]; //当前页面
    var prevPage = pages[pages.length - 2]; //上一个页面
    wx.navigateBack({
      delta: 1,
      complete: function () {
        prevPage.onLoad();
      }
    })
  },




  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getSystemInfo();
    this.initcooluiscroll();
    app.setNavigationBarTitle('选择管理员')
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
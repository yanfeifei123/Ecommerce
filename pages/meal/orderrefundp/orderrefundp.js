import baseurl from '../../../utils/baseurl.js'
const httpRequest = require('../../../utils/request.js');
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
    uorderr: {},
    imgList: [],
    find: ''
  },
  findUorderrToberefunded() {
    var that = this;
    httpRequest._post('/uorderr/findUorderrToberefunded', {
      orderid: that.data.orderDetail.orderid
    }, function (res) {
      that.setData({
        uorderr: res.data
      })
      var urls = res.data.url.split(',');
      // console.log(JSON.stringify(urls) )
      if (urls[0] != '') {
        that.setData({
          imgList: urls
        })
      }

    }, function (err) {

    }, true)
  },
  /**
   * 
   * @param {允许退款} e 
   */
  refund(e) {
    var out_trade_no = this.data.orderDetail.orderno
    var total_fee = (this.data.orderDetail.totalfee * 100);
    var that = this;
    wx.showModal({
      title: '提示',
      content: '在此确认是否允许退款',
      cancelText: '取消',
      confirmText: '确定',
      success: res => {
        if (res.confirm) {
          httpRequest._post('/weChatPay/refund', {
            out_trade_no: out_trade_no,
            total_fee: total_fee
          }, function (res) {
            wx.navigateBack({
              delta: 3,
              success: function () {
                that.routeOrderPage();
              }
            })
          }, function (err) {

          }, true)
        }
      }
    })
  },

  routeOrderPage() {
    var pages = getCurrentPages();
    var prevPage4 = pages[pages.length - 4]; //上一个页面
    prevPage4.refreshData()
  },

  norefund(e) {
    var out_trade_no = this.data.orderDetail.orderno;
    var that = this;
    httpRequest._post('/weChatPay/norefund', {
      out_trade_no: out_trade_no
    }, function (res) {
      wx.navigateBack({
        delta: 3,
        success: function () {
          that.routeOrderPage();
        }
      })
    }, function (err) {

    }, true)
  },
  previewImg(e) {
    // var url = this.data.baseurl + e.currentTarget.dataset.url
    // console.log(url)
    var imgList = [];
    for (var i = 0; i < this.data.imgList.length; i++) {
      var url = this.data.baseurl + this.data.imgList[i];
      imgList.push(url)
    }
    wx.previewImage({
      current: imgList[0], // 当前显示图片的http链接
      urls: imgList // 需要预览的图片http链接列表
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    this.setData({
      orderDetail: JSON.parse(options.orderDetail),
      find: options.find
    })
    this.findUorderrToberefunded()
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          scrollheight: res.windowHeight - 30
        })
      }
    });
    app.setNavigationBarTitle('退款详情')
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
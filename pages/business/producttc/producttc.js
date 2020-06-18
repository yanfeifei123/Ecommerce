// pages/business/producttc/producttc.js

const httpRequest = require('../../../utils/request.js');
import baseurl from '../../../utils/baseurl.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bproducts: [],
    bproductid: '',
    categoryid: ''
  },


  choosePackage(bproductid, categoryid) {
    var that = this;
    this.setData({
      bproductid: bproductid,
      categoryid: categoryid
    })
    httpRequest._post('/bproduct/choosePackage', {
      bproductid: bproductid,
      categoryid: categoryid
    }, function (res) {
      if (res.data.length == 0) {
        wx.showToast({
          title: '还没有商品',
          icon: 'success',
          duration: 1500
        })
      } else {
        that.setData({
          bproducts: res.data
        })
      }
    }, function (err) {

    }, true)
  },

  checkboxChange(e) {

    // console.log(JSON.stringify(e))
    var id = e.target.id;
    var values = e.detail.value;
    var bproducts = this.data.bproducts;
    for (var i = 0; i < bproducts.length; i++) {
      var item = bproducts[i];
      if (id == item.id) {
        if (values.length == 0) {
          item.checked = false;
        } else {
          item.checked = true;
        }
      }
    }
    this.setData({
      bproducts: bproducts
    })

  },

  submit(e) {
    var that = this;
    httpRequest._post('/bproduct/updateBindingSubbproduct', {
      bproductid: that.data.bproductid,
      jsonlist: JSON.stringify(that.data.bproducts)
    }, function (res) {
      var pages = getCurrentPages();
      var currPage = pages[pages.length - 1]; //当前页面
      var prevPage = pages[pages.length - 2]; //上一个页面
      // console.log(JSON.stringify(prevPage))

      wx.navigateBack({
        delta: 1,
        complete: function () {

          prevPage.selectComponent('#product').findByBproduct(null, that.data.categoryid);
        }
      })
    }, function (err) {

    }, true)
    // console.log(JSON.stringify(this.data.bproducts))
  },

  getPageHeight() {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        var height = res.windowHeight - 70;
        that.setData({
          height: height
        })
      }
    });
  },

  cancel(e) {
    wx.navigateBack({
      delta: 1,
      complete: function () {

      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var bproductid = options.bproductid;
    var categoryid = options.categoryid;
    this.choosePackage(bproductid, categoryid)
    this.getPageHeight();
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
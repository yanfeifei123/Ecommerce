// pages/meal/setmeal/setmeal.js

const httpRequest = require('../../../utils/request.js');
const pack = require('../../../utils/pack.js');
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bproductsitems: {},
    bproduct: {},
    number: 0,
    totalprice: 0, //总价
    memberprice: 0, //会员价
    suffix: app.globalData.suffix,
    shoppingcart: []
  },

  /**
   * 套餐副类品种增加
   */
  bindtapplus: function(e) {
    var index = e.currentTarget.dataset.index;
    var item = this.data.bproductsitems[index];
    var id = item.id;
    var name = item.name;
    var num = ++item.num;

    var tprice = item.price * num;
    var totalprice = this.data.totalprice + item.price;
    var memberprice = this.data.memberprice + item.price;
    var number = this.data.number + num;

    var bool = false;
    for (var i = 0; i < this.data.shoppingcart.length; i++) {
      var obj = this.data.shoppingcart[i];
      if (obj.id == id) {
        obj.num = num;
        obj.tprice = tprice;
        bool = true;
      }
    }
    if (bool === false) {
      var obj = {
        id: id,
        num: num,
        name: name,
        tprice: tprice,
        parentIndex: this.data.parentIndex,
        index: this.data.index
      };
      this.data.shoppingcart.push(obj);
    }
    this.setData({
      number: number,
      totalprice: totalprice,
      memberprice: memberprice,
      bproductsitems: this.data.bproductsitems
    })
  },




  /**
   * 套餐副类品种减少
   */
  bindtapminus: function(e) {
    var index = e.currentTarget.dataset.index;
    var item = this.data.bproductsitems[index];
    var id = item.id;
    var name = item.name;
    var num = --item.num;
    var tprice = (item.price * num);

    if (num == 0) {
      for (var i = 0; i < this.data.shoppingcart.length; i++) {
        var obj = this.data.shoppingcart[i];
        if (id === obj.id) {

          this.data.shoppingcart.splice(i, 1);
        }
      }
    } else {
      for (var i = 0; i < this.data.shoppingcart.length; i++) {
        var obj = this.data.shoppingcart[i];
        if (id === obj.id) {
          obj.tprice = tprice;
          obj.num = num;
        }
      }
    }
    var totalprice = 0;
    var memberprice = 0;
    var number = 0;

    for (var i = 0; i < this.data.shoppingcart.length; i++) {
      var obj = this.data.shoppingcart[i];
      number += obj.num;
      totalprice += obj.tprice;
      memberprice += obj.tprice;
    }
    totalprice += this.data.bproduct.price;
    memberprice += this.data.bproduct.memberprice;

    this.setData({
      number: number,
      totalprice: totalprice,
      memberprice: memberprice,
      bproductsitems: this.data.bproductsitems
    })
  },

  isko: function() {
    // for (var i = 0; i < this.data.shoppingcart.length; i++) {
    //   var obj = this.data.shoppingcart[i];
    //   console.log(obj.id + '  ' + obj.num + '  ' + obj.name + '  ' + obj.tprice + ' parentIndex: ' + obj.parentIndex+'  index:'+obj.index)
    // }
    // wx.setStorageSync('setmeal', this.data.shoppingcart);
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1]; //当前页面
    var prevPage = pages[pages.length - 2]; //上一个页面
    var that = this;
    wx.navigateBack({
      success: function(res) {

      },
      fail: function(err) {

      },
      complete: function(res) {
        var shoppingcart = that.data.shoppingcart;
        var parentIndex = that.data.parentIndex;
        var index = that.data.index;
        var totalprice = that.data.totalprice; //总价
        var memberprice = that.data.memberprice; //会员价
        var setmeals = wx.getStorageSync('setmeals') || [];
        var object = {
          shoppingcart: shoppingcart,
          parentIndex: parentIndex,
          index: index,
          totalprice: totalprice,
          memberprice: memberprice
        }
        setmeals.push(object);
        wx.setStorageSync('setmeals', setmeals);

        prevPage.selectComponent('#userordering').calculationsetmealprice();
      }
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    var that = this;
    var pid = options.pid;
    httpRequest._post('/business/findByproductPackage', {
        pid: pid
      },
      function(res) {

        var price = res.data.price;
        var memberprice = res.data.memberprice;
        that.setData({
          bproductsitems: res.data.bproductsitems,
          totalprice: price,
          memberprice: memberprice,
          bproduct: res.data,
          parentIndex: options.parentIndex,
          index: options.index
        })
      },
      function(err) {

      }
    )


    // for (var i = 0; i < pack.bproductsitems.length; i++) {
    //   pack.bproductsitems[i].num = 0;
    // }

    // this.setData({
    //   bproductsitems: pack.bproductsitems,
    //   totalprice: pack.price,
    //   memberprice: pack.memberprice,
    //   bproduct: pack,
    //   parentIndex: options.parentIndex,
    //   index: options.index
    // })
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
      title: "套餐任意搭配"
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
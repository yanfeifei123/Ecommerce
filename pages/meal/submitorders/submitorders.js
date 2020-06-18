// pages/submitorders/submitorders.js

const httpRequest = require('../../../utils/request.js');
const util = require('../../../utils/util.js');
import baseurl from '../../../utils/baseurl.js'
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    baseurl: baseurl.baseurl,
    orderSettiing: {}, //订单配置项
    uaddress: [],
    suffix: app.globalData.suffix,
    specification: app.globalData.specification,
    shoppingcart: [],
    isuaddress: false,
    psfcost: 0,
    bzcost: 0,
    discount: 0,
    totalprice: 0,
    firstorder: 0,
    member: 0,
    orderBody: '校园饭tuan外卖订单',
    isself: 0,
    successfulPayment: false,
    orderid: '',
    payisok: false

  },


  setisself: function (e, sid) {
    var id = '';
    if (e) {
      id = e.target.dataset.id;
    } else {
      id = sid;
    }
    var that = this;
    var psfcost = 1;
    if (id == 0) {
      psfcost = 1;
    } else {
      psfcost = 0;
    }
    this.setData({
      isself: id,
      psfcost: psfcost
    })
    that.calculatePrice();
  },

  getScrollheight: function () {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        var scrollheight = res.windowHeight - 75;
        that.setData({
          scrollheight: scrollheight,
        })
      }
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    this.getaddress(function () {
      that.getOrderSettiing(function () {
        if (that.data.orderSettiing.isps == 0) {
          that.setisself(null, 1);
        } else {
          that.calculatePrice();
        }
      });
    });
    this.computingTime();
    this.getScrollheight();
  },


  addu_address: function (e) {
    // var orderid =   this.data.orderid;
    if (this.data.uaddress.length != 0) {
      wx.navigateTo({
        url: '/pages/meal/uaddresslist/uaddresslist?submitorders=1'
      });
    } else {
      wx.navigateTo({
        url: '/pages/meal/adduaddress/adduaddress'
      });
    }
  },

  checkAddress: function () {
    if (this.data.uaddress.length == 0) {
      return false;
    } else {
      return true;
    }
  },

  /**
   * 提交订单信息
   */
  generateOrder: function (callback) {
    var that = this;
    if (this.data.uaddress.length == 0) {
      wx.showModal({
        title: '提示',
        content: '增加收货地址',
        showCancel: false
      })
      return;
    }

    app.getOpenid(function (openid) {
      var shoppingcart = wx.getStorageSync('cart') || [];
      var openid = openid;
      var orderid = that.data.orderid;
      var tradeno = that.data.orderSettiing.tradeno;
      // console.log(JSON.stringify(shoppingcart))
      var orderObj = JSON.stringify({
        orderid: orderid,
        tradeno: tradeno,
        shoppingcart: shoppingcart,
        openid: openid,
        bid: app.globalData.businessid,
        branchid: app.globalData.branchid,
        isself: that.data.isself,
        discount: that.data.discount,
        totalfee: that.data.totalprice,
        uaddressid: that.data.uaddress.id,
        firstorder: that.data.firstorder,
        ismember: that.data.member
      })

      // console.log(orderObj);
      wx.request({
        method: 'POST',
        url: baseurl.baseurl + '/weChatPay/updateUserOrder',
        data: {
          orderObj: orderObj
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          if (res.data.code == -1) {
            console.log('订单重新提交');
            wx.showToast({
              title: '购物车数量过多，请分批提交',
              icon: 'success',
              duration: 1500
            })
            that.setData({
              payisok: false
            })
          } else {
            console.log('订单生成成功！');
            that.setData({
              orderid: res.data.data.id,
            })

            that.setData({
              payisok: true
            })
            callback();
          }
        },
        fail: function (err) {

        },
        complete: function (e) {

        }

      })
    })
  },



  pay: function (e) {
    if (this.data.uaddress.length == 0) {
      wx.showModal({
        title: '提示',
        content: '增加收货地址',
        showCancel: false
      })
      return;
    }
    if (!this.data.payisok) {
      wx.showToast({
        title: '购物车数量过多，请分批提交',
        icon: 'success',
        duration: 1500
      })
      return;
    }
    var tradeno = this.data.orderSettiing.tradeno;
    var total_fee = this.data.totalprice * 100;

    var orderBody = this.data.orderBody;
    var that = this;
    app.pay(tradeno, total_fee, orderBody, function () {
      that.subscribeMessage();
    })
  },







  subscribeMessage: function () {
    var that = this;
    var tempid = 'X4ZGAyIVgnoOKUodwioOF1ocF4x1CYpU4KoI2H8VVgE';
    wx.requestSubscribeMessage({
      tmplIds: [tempid],
      success(res) {
        wx.removeStorageSync('commoditys')
        wx.removeStorageSync('cart')
        wx.removeStorageSync('setmeals')
        that.routeOrderPage();
      }
    });
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
    // this.getaddress(function () {});
  },





  getaddress: function (callback) {

    var that = this;
    app.getOpenid(function (openid) {
      httpRequest._post('/findByUaddress', {
          openid: openid
        },
        function (res) {

          var uaddress = res.data;
          var isuaddress = false;
          if (uaddress.length != 0) {
            uaddress = res.data[0];
            isuaddress = true;
          }
          that.setData({
            uaddress: uaddress,
            isuaddress: isuaddress
          })
          callback();
        },
        function (err) {

        }, true
      )
    })


  },

  computingTime: function () {

    var time = new Date();
    time.setMinutes(time.getMinutes() + 15, time.getSeconds(), 0);

    var data = util.formatDateThis(new Date(time));
    var datatime = data.replace(/\-/g, "/")
    var newdata = util.formatDateThis(new Date(datatime));

    var hour = newdata.split(' ')[1];
    hour = hour.substring(0, hour.length - 3);

    this.setData({
      timedifference: hour
    })
  },



  findBymember: function (callback) {
    app.getOpenid(function (openid) {
      httpRequest._post('/findByUserid', {
        openid: openid
      }, function (res) {
        callback(res.data);
      }, function (err) {

      }, true);
    })
  },

  calculatePrice: function () {


    var shoppingcart = wx.getStorageSync('cart') || []
    var discount = 0; //优惠
    var totalprice = 0; //总价

    var member = this.data.orderSettiing.member;

    for (var i = 0; i < shoppingcart.length; i++) {
      shoppingcart[i].member = member;

      var tprice = shoppingcart[i].tprice;
      var tmemberprice = shoppingcart[i].tmemberprice;

      if (member == 0) { //不是会员
        totalprice += tprice;
      } else {
        totalprice += tmemberprice;
        discount += (tprice - tmemberprice);
      }
    }

    var firstorder = this.data.orderSettiing.firstorder;
    var psfcost = this.data.orderSettiing.psfcost;

    discount = discount + firstorder;
    if (this.data.isself == 0) {
      totalprice = parseFloat(((totalprice + psfcost) - firstorder)).toFixed(2)
    } else {
      psfcost = 0
      totalprice = parseFloat(((totalprice + psfcost) - firstorder)).toFixed(2)
    }
    this.setData({
      firstorder: firstorder,
      psfcost: psfcost,
      shoppingcart: shoppingcart,
      discount: parseFloat(discount).toFixed(2),
      totalprice: totalprice,
      member: member
    })

    this.generateOrder(function (order) {})
  },

  routeOrderPage: function () {
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1]; //当前页面
    var prevPage = pages[pages.length - 2]; //上一个页面
    wx.navigateBack({
      delta: 1,
      complete: function () {
        prevPage.clearshoppingcart();
        wx.switchTab({
          url: '/pages/meal/order/order',
          success: function () {}
        })
      }
    })

  },




  getOrderSettiing: function (callback) {
    var that = this;
    app.getOpenid(function (openid) {
      var openid = openid;
      var branchid = app.globalData.branchid;
      httpRequest._post('/order/queryOrderSettiing', {
        openid: openid,
        branchid: branchid
      }, function (res) {
        that.setData({
          orderSettiing: res.data
        })
        // console.log(JSON.stringify(res.data))
        callback();

      }, function (err) {

      }, true);
    })
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
    // app.clearMyorder();
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
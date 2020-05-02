// pages/submitorders/submitorders.js

const httpRequest = require('../../../utils/request.js');
const util = require('../../../utils/util.js');

var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    uaddress: {},
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
    successfulPayment: false
  },


  setisself: function (e) {

    var psfcost = 1;
    if (e.target.dataset.id == 0) {
      psfcost = 1;
    } else {
      psfcost = 0;
    }
    this.setData({
      // totalprice: totalprice,
      isself: e.target.dataset.id,
      psfcost: psfcost
    })
    this.calculatePrice()
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },


  addu_address: function (e) {
    wx.navigateTo({
      url: '/pages/meal/uaddresslist/uaddresslist'
    });
  },

  checkAddress: function () {
    if (this.data.uaddress.length == 0) {
      return false;
    } else {
      return true;
    }
  },


  pay: function (e) {

    if (this.checkAddress()) {
      var that = this
      var total_fee = 1;
      // var total_fee = this.data.totalprice;
      // var shoppingcart = wx.getStorageSync('cart') || [];
      var orderBody = this.data.orderBody;
      httpRequest._post('/weChatPay/doUnifiedOrder', {
        total_fee: total_fee,
        body: orderBody,
        openid: wx.getStorageSync('openid')
      }, function (res) {
        // console.log(JSON.stringify(res.data))
        that.payApi(res.data)
      }, function (err) {

      })
    } else {
      wx.showModal({
        title: '提示',
        content: '增加收货地址',
        showCancel: false
      })
    }


  },
  payApi: function (param) {
    var that = this
    wx.requestPayment({
      timeStamp: param.timeStamp,
      nonceStr: param.nonceStr,
      package: param.package,
      signType: 'MD5',
      paySign: param.paySign,
      success: function (res) {

        that.updateUserOrder(param.out_trade_no, param.prepay_id);
      },
      fail: function (res) {
        console.log("支付失败")
      },
      complete: function (res) { }
    })
  },

  updateUserOrder: function (out_trade_no, prepay_id) {

    var shoppingcart = wx.getStorageSync('cart') || [];
    var that = this;

    httpRequest._post('/weChatPay/updateUserOrder', {
      shoppingcart: JSON.stringify(shoppingcart),
      openid: wx.getStorageSync('openid'),
      bid: app.globalData.businessid,
      branchid: app.globalData.branchid,
      isself: that.data.isself,
      discount: that.data.discount,
      totalfee: that.data.totalprice,
      out_trade_no: out_trade_no,
      uaddressid: that.data.uaddress.id,
      firstorder: that.data.firstorder,
      ismember: that.data.member
    }, function (res) {

      wx.removeStorageSync('commoditys')
      wx.removeStorageSync('cart')
      wx.removeStorageSync('setmeals')
      that.data.successfulPayment = true;
      var orderid = res.data.id
      that.subscribeMessage(orderid, prepay_id);

    }, function (err) {

    })
  },


  subscribeMessage: function (orderid, prepay_id) {
    var that = this;
    var tempid = 'X4ZGAyIVgnoOKUodwioOF1ocF4x1CYpU4KoI2H8VVgE';
    wx.requestSubscribeMessage({
      tmplIds: [tempid],
      success(res) {
        //开始执行消息推送
        httpRequest._post('/message/sendOrderPayInfo', {
          orderid: orderid,
          branchid: app.globalData.branchid,
          templateId: tempid,
          page: ''
        }, function (res) {
          // console.log('res:' + JSON.stringify(res.data))
          if (res.data.errcode == 0 && res.data.errmsg == 'ok') {
            that.routeOrderPage();
          }
        }, function (err) {

        })
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
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.getaddress();
        that.pricecalculation(res);
        that.computingTime();
      }
    });
  },



  /**
   * 查询首单用户
   */
  onisfirstorder: function () {

  },

  getaddress: function () {

    // this.setData({
    //   uaddress: require('../../../utils/Uaddress.js')[0],
    //   isuaddress: true
    // })

    var that = this;
    httpRequest._post('/findByUaddress', {
      openid: wx.getStorageSync('openid')
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
      },
      function (err) {

      }
    )
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

  pricecalculation: function (res) {
    var scrollheight = res.windowHeight - 75;
    this.setData({
      scrollheight: scrollheight,
    })
    this.calculatePrice()
  },

  calculatePrice: function () {
    var shoppingcart = wx.getStorageSync('cart') || []
    var userInfo = wx.getStorageSync('userInfo');

    var discount = 0; //优惠
    var totalprice = 0; //总价

    var member = userInfo.member;
    for (var i = 0; i < shoppingcart.length; i++) {
      shoppingcart[i].member = member;

      var tprice = shoppingcart[i].tprice;
      var tmemberprice = shoppingcart[i].tmemberprice;
      // console.log(tprice + '  ' + tmemberprice);

      if (member == 0) { //不是会员
        totalprice += tprice;
      } else {
        totalprice += tmemberprice;
        discount += (tprice - tmemberprice);
      }
    }
    // console.log('firstorder:'+this.data.firstorder)


    var that = this;
    httpRequest._post('/onisfirstorder', {
      openid: wx.getStorageSync('openid'),
      branchid: app.globalData.branchid
    }, function (res) {
      var firstorder = res.data.firstorder;
      var psfcost = res.data.psfcost;

      discount = discount + firstorder;
      if (that.data.isself == 0) {
        totalprice = parseFloat(((totalprice + psfcost) - firstorder)).toFixed(2)
      } else {
        psfcost = 0
        totalprice = parseFloat(((totalprice + psfcost) - firstorder)).toFixed(2)
      }
      // console.log('member:'+member);
      that.setData({
        firstorder: firstorder,
        psfcost: psfcost,
        shoppingcart: shoppingcart,
        discount: parseFloat(discount).toFixed(2),
        totalprice: totalprice,
        member: member
      })
    }, function (err) {

    });
  },

  routeOrderPage: function () {
    wx.navigateBack({
      delta: 1
    })
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1]; //当前页面
    var prevPage = pages[pages.length - 2]; //上一个页面
    prevPage.setNavChange('order');
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
    // var pages = getCurrentPages();
    // var currPage = pages[pages.length - 1]; //当前页面
    // var prevPage = pages[pages.length - 2]; //上一个页面
    // // console.log(JSON.stringify(prevPage))
    // if (this.data.successfulPayment) {
    //   //支付成功 清空购物车和商品信息
    //   if (prevPage.route == 'pages/meal/tabBar/tabBar')
    //     prevPage.selectComponent('#userordering').pageinit();
    // }
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
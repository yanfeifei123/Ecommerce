// pages/meal/index/index.js


const httpRequest = require('../../../utils/request.js');

const configlogin = require('../../../utils/configlogin.js');

import baseurl from '../../../utils/baseurl.js';

// 右侧每一类的 bar 的高度（固定）
const RIGHT_BAR_HEIGHT = 34;
// 右侧每个子类的高度（固定）
const RIGHT_ITEM_HEIGHT = 100;

// 左侧每个类的高度（固定）
const LEFT_ITEM_HEIGHT = 40;

var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    baseurl: baseurl.baseurl,
    commoditys: [],
    HZL_leftToTop: 0,
    HZL_eachRightItemToTop: [],
    currentLeftSelect: null,
    hide_good_box: true,
    indicatorDots: true,
    autoplay: true,
    interval: 3000,
    duration: 100,
    totalprice: 0, //总金额
    suffix: '',
    shoppingcart: [],
    display: 'none',
    bottomcartbox: 'none',
    productamount: 0, //物品数量
    userInfo: null,
    bbranch: {}, //分店信息
    submitinfo: '',
    searchValue: '',
    searchButton: '搜索',
    allow: false
  },


  HZL_getEachRightItemToTop: function () {
    var obj = {};
    var totop = 0;
    if (this.data.commoditys.length != 0) {
      obj[this.data.commoditys[0].id] = totop;
      for (let i = 1; i < (this.data.commoditys.length + 1); i++) {
        totop += (RIGHT_BAR_HEIGHT + this.data.commoditys[i - 1].bproductsitems.length * RIGHT_ITEM_HEIGHT)
        obj[this.data.commoditys[i] ? this.data.commoditys[i].id : 'last'] = totop;
      }
    }

    return obj;
  },

  /**
   * 左边菜单分类点击事件
   */
  intoVieleft: function (e) {
    // console.log('intoVieleft:'+e.target.dataset.id)
    this.setData({
      toView: e.target.dataset.id
      // ,
      // currentLeftSelect: e.target.dataset.id
    })
  },
  intoVieright: function (e) {

    for (let i = 0; i < this.data.commoditys.length; i++) {
      let left = this.data.HZL_eachRightItemToTop[this.data.commoditys[i].id]
      let right = this.data.HZL_eachRightItemToTop[this.data.commoditys[i + 1] ? this.data.commoditys[i + 1].id : 'last']
      if (e.detail.scrollTop < right && e.detail.scrollTop >= left) {
        // console.log('this.data.commoditys[i].id:   ' + this.data.commoditys[i].id + '    HZL_leftToTop:' + (LEFT_ITEM_HEIGHT * i))
        this.setData({
          currentLeftSelect: this.data.commoditys[i].id,
          HZL_leftToTop: LEFT_ITEM_HEIGHT * i
        })
      }
    }

  },


  bindtapminus: function (e) {

    var index = e.currentTarget.dataset.index;
    var parentIndex = e.currentTarget.dataset.parentindex;
    this.shoppingcartminus(parentIndex, index);
  },

  bindtapplus: function (e) {
    var that = this;
    // app.verificationLocation(function (dis) {
    //   console.log('dis:' + dis)
    //   if (parseFloat(dis) >= 2) {
    //     wx.showModal({
    //       title: '提示',
    //       content: '超出配送范围'
    //     });
    //     return;
    //   }
      that.hideCart(null);
      var index = e.currentTarget.dataset.index;
      var parentIndex = e.currentTarget.dataset.parentindex;
      var packages = that.data.commoditys[parentIndex].bproductsitems[index].packages; //是否套餐
      if (packages == 1) {
        var id = that.data.commoditys[parentIndex].bproductsitems[index].id;
        that.packageView(id, parentIndex, index);
      } else {
        that.touchOnGoods(e);
        that.shoppingcartplus(parentIndex, index);
      }
    // })
  
  },
  /**
   * 实现购物车增加
   */
  shoppingcartplus: function (parentIndex, index, setmeal) {

    var commoditys = wx.getStorageSync('commoditys') || [];
    var shoppingcart = wx.getStorageSync('cart') || [];

    if (shoppingcart.length == 0) {
      commoditys = this.data.commoditys;
      shoppingcart = this.data.shoppingcart;
    }

    var item = commoditys[parentIndex].bproductsitems[index]; //通过定位找出商品
    var id = item.id;
    var name = item.name;
    var num = ++item.num;
    var imagepath = item.imagepath;
    var price = item.price;
    var memberprice = item.memberprice;


    var obj = null;

    for (var i = 0; i < shoppingcart.length; i++) {
      if (shoppingcart[i].id === id) {
        obj = shoppingcart[i];
        break;
      }
    }
    if (obj) {
      if (setmeal) {
        obj.tprice += setmeal.totalprice
        obj.tmemberprice += setmeal.memberprice
      } else {
        obj.tprice = price * num
        obj.tmemberprice = memberprice * num
      }
      obj.num = num;

    } else {
      obj = {
        id: id,
        num: num,
        name: name,
        tprice: price * num,
        tmemberprice: memberprice * num,
        index: index,
        parentIndex: parentIndex,
        imagepath: imagepath,
        items: []
      };
      if (setmeal) {
        obj.tprice = setmeal.totalprice
        obj.tmemberprice = setmeal.memberprice
      }
      shoppingcart.push(obj);

    }
    if (setmeal) {
      obj.items.push(setmeal);
    }
    var totalprice = 0;
    var productamount = 0;

    for (var i = 0; i < shoppingcart.length; i++) {
      var obj = shoppingcart[i];
      totalprice += obj.tprice;
      productamount += obj.num;
    }

    // console.log(JSON.stringify(shoppingcart))
    var submitinfo = '提交订单';
    if (this.data.bbranch.bornot == 0) {
      submitinfo = '本店打烊啦'
    } else {
      if (totalprice < this.data.bbranch.firstmoney) {
        submitinfo = this.data.bbranch.firstmoney + '元送起'
      }
    }
    this.setData({
      totalprice: parseFloat(totalprice).toFixed(2),
      commoditys: commoditys,
      shoppingcart: shoppingcart,
      display: 'flex',
      productamount: productamount,
      submitinfo: submitinfo
    })
    //  console.log(JSON.stringify(shoppingcart))

    wx.setStorageSync('commoditys', commoditys);
    wx.setStorageSync('cart', shoppingcart);


    this.callpageheight();

  },
  /**
   * 实现购物车减少
   */
  shoppingcartminus: function (parentIndex, index) {
    var display = 'flex';
    var commoditys = wx.getStorageSync('commoditys') || [];
    var shoppingcart = wx.getStorageSync('cart') || [];



    if (commoditys.length == 0 || shoppingcart.length == 0) {
      commoditys = this.data.commoditys;
      shoppingcart = this.data.shoppingcart;
    }

    var item = commoditys[parentIndex].bproductsitems[index];
    var id = item.id;
    var num = --item.num;
    var price = item.price;
    var memberprice = item.memberprice;



    if (num != 0) {
      for (var i = 0; i < shoppingcart.length; i++) {
        if (id === shoppingcart[i].id) {
          var obj = shoppingcart[i];
          if (obj.items.length != 0) {
            var child = obj.items[0]
            obj.tprice = obj.tprice - child.totalprice
            obj.tmemberprice = obj.tmemberprice - child.memberprice
            obj.items.splice(0, 1);
          } else {
            obj.tprice = price * num;
            obj.tmemberprice = memberprice * num;
          }
          obj.num = num;

          break;
        }
      }
    } else {
      for (var i = 0; i < shoppingcart.length; i++) {
        var obj = shoppingcart[i];
        if (id === obj.id) {
          shoppingcart.splice(i, 1);
        }
      }
    }

    var totalprice = 0;
    var productamount = 0;
    for (var i = 0; i < shoppingcart.length; i++) {
      var obj = shoppingcart[i];
      totalprice += obj.tprice;
      productamount += obj.num;
    }

    if (shoppingcart.length == 0) {
      display = "none";
    }

    var submitinfo = '提交订单';
    if (totalprice < this.data.bbranch.firstmoney) {
      submitinfo = this.data.bbranch.firstmoney + '元送起'
    }
    this.setData({
      totalprice: parseFloat(totalprice).toFixed(2),
      commoditys: commoditys,
      shoppingcart: shoppingcart,
      display: display,
      productamount: productamount,
      submitinfo: submitinfo
    })
    wx.setStorageSync('cart', shoppingcart);
    wx.setStorageSync('commoditys', commoditys);

    // console.log('shoppingcart:' + JSON.stringify(shoppingcart));
    this.callpageheight();
  },

  /**
   * 当购物车显示是重新计算页面高度
   */
  callpageheight: function () {
    var bottomcart = 0;
    var that = this;
    if (this.data.display === 'flex') {
      bottomcart = 50;
    }

    wx.getSystemInfo({
      success: function (res) {
        var containerheight = res.windowHeight - 48 - 55 - bottomcart;
        that.setData({
          containerheight: containerheight
        })
      }
    });
  },




  viewbottomcartbox: function (e) {
    this.setData({
      bottomcartbox: this.data.bottomcartbox === 'none' ? 'block' : 'none',
    })
  },

  /**
   * 清空购物车功能
   */
  clearshoppingcart: function (e) {

    for (var i = 0; i < this.data.shoppingcart.length; i++) {
      var acommodity = this.data.shoppingcart[i];
      this.data.commoditys[acommodity.parentIndex].bproductsitems[acommodity.index].num = 0;
    }
    this.data.shoppingcart = [];

    this.setData({
      shoppingcart: this.data.shoppingcart,
      commoditys: this.data.commoditys,
      totalprice: 0,
      bottomcartbox: 'none',
      display: 'none',
      productamount: 0
    })
    wx.setStorageSync('commoditys', this.data.commoditys)
    wx.removeStorageSync('cart')
    this.callpageheight();
    // app.clearMyorder();
  },

  /**
   *  购物车里加
   */
  cartjia: function (e) {
    var index = e.target.dataset.index;
    var parentIndex = e.target.dataset.parentindex;

    this.shoppingcartplus(parentIndex, index);
  },
  /**
   * 购物车里减
   */
  cartjian: function (e) {
    var index = e.target.dataset.index;
    var parentIndex = e.target.dataset.parentindex;
    this.shoppingcartminus(parentIndex, index);
    if (this.data.shoppingcart.length === 0) {
      this.setData({
        bottomcartbox: 'none'
      })
    }
  },

  showShopCartFn: function (e) {
    this.setData({
      bottomcartbox: 'none'
    })
  },

  /**
   * 提交订单
   */
  submitorders: function (e) {



    var firstmoney = this.data.bbranch.firstmoney;
    if (this.data.totalprice < firstmoney) {
      wx.showToast({
        title: '满' + firstmoney + '元起送',
        icon: 'success',
        duration: 1500
      })
      return false;
    }
    var that = this;
    if (wx.getStorageSync('userInfo') == '') {
      if (e.detail.errMsg === 'getUserInfo:ok') {
        app.getUserInfo(e, function (userInfo) {
          // console.log('e:' + JSON.stringify(e));
          wx.setStorageSync('userInfo', userInfo);
          that.setData({
            userInfo: e
          })
          that.switchTab()
        })
      }
    } else {
      this.switchTab()
    }
  },




  switchTab: function (e) {
    if (this.data.totalprice < this.data.bbranch.firstmoney) {
      return false;
    }
    wx.navigateTo({
      url: '/pages/meal/submitorders/submitorders'
    });
  },

  hideCart: function (e) {


  },
  cartView: function (e) {
    var query = wx.createSelectorQuery();
  },

  requestcommodityJson: function () {

  },



  /**
   * 初始化计算高度
   */
  initPage: function () {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        var containerheight = res.windowHeight - 48 - 55;
        that.setData({
          containerheight: containerheight,
        })
      }
    });
    this.busPos = {};
    this.busPos['x'] = 40; //购物车的位置
    this.busPos['y'] = 508;
  },

  initthisData: function () {
    var that = this;
    var bottomcartbox = 'none';
    var display = 'none';

    var shoppingcart = wx.getStorageSync('cart') || [];
    var searchValue = this.data.searchValue;
    httpRequest._post('/business/findbusinessAll', {
        branchid: app.globalData.branchid,
        searchValue: searchValue
      },
      function (res) {
        // console.log(JSON.stringify(res.data));
        that.data.commoditys = res.data;
        wx.setStorageSync('commoditys', res.data);
        if (shoppingcart.length != 0) {
          display = 'flex';
        }
        var totalprice = 0;
        var productamount = 0;

        for (var i = 0; i < shoppingcart.length; i++) {
          var obj = shoppingcart[i];
          totalprice += obj.tprice;
          productamount += obj.num;
        }

        var submitinfo = '提交订单';
        if (totalprice < that.data.bbranch.firstmoney) {
          submitinfo = that.data.bbranch.firstmoney + '元送起'
        }
        var currentLeftSelect = '';
        if (that.data.commoditys.length != 0)
          currentLeftSelect = that.data.commoditys[0].id;
        that.setData({
          commoditys: that.data.commoditys,
          HZL_eachRightItemToTop: that.HZL_getEachRightItemToTop(),
          currentLeftSelect: currentLeftSelect,
          shoppingcart: shoppingcart,
          bottomcartbox: bottomcartbox,
          display: display,
          totalprice: parseFloat(totalprice).toFixed(2),
          productamount: productamount,
          suffix: app.globalData.suffix,
          submitinfo: submitinfo
        })
        wx.stopPullDownRefresh();
      },
      function (err) {

      }, true);
  },

  packageView: function (id, parentIndex, index) {
    var commoditys = this.data.commoditys;
    var item = commoditys[parentIndex].bproductsitems[index];

    wx.navigateTo({
      url: '/pages/meal/setmeal/setmeal?pid=' + id + '&parentIndex=' + parentIndex + '&index=' + index + '&name=' + item.name + '&time=' + new Date()
    });
  },


  calculationsetmealprice: function (setmeal) {
    var parentIndex = setmeal.parentIndex;
    var index = setmeal.index;
    this.shoppingcartplus(parentIndex, index, setmeal);
  },










  /**
   * 点击增加到购物车的 抛物线计算
   * @param {*} e 
   */
  touchOnGoods: function (e) {
    // console.log('touchOnGoods:'+JSON.stringify(e))
    this.finger = {};
    var topPoint = {};
    this.finger['x'] = e.touches["0"].clientX; //点击的位置
    this.finger['y'] = e.touches["0"].clientY;
    if (this.finger['y'] < this.busPos['y']) {
      topPoint['y'] = this.finger['y'] - 150;
    } else {
      topPoint['y'] = this.busPos['y'] - 150;
    }
    topPoint['x'] = Math.abs(this.finger['x'] - this.busPos['x']) / 2;
    if (this.finger['x'] > this.busPos['x']) {
      topPoint['x'] = (this.finger['x'] - this.busPos['x']) / 2 + this.busPos['x'];
    } else { //
      topPoint['x'] = (this.busPos['x'] - this.finger['x']) / 2 + this.finger['x'];
    }
    this.linePos = app.bezier([this.busPos, topPoint, this.finger], 50);
    this.startAnimation(e);
  },


  startAnimation: function (e) {
    var index = 0,
      that = this,
      bezier_points = that.linePos['bezier_points'];
    this.setData({
      hide_good_box: false,
      bus_x: that.finger['x'],
      bus_y: that.finger['y']
    })
    var len = bezier_points.length;
    index = len

    this.timer = setInterval(function () {
      for (let i = index - 1; i > -1; i--) {
        that.setData({
          bus_x: bezier_points[i]['x'],
          bus_y: bezier_points[i]['y']
        })

        if (i < 1) {
          clearInterval(that.timer);
          that.setData({
            hide_good_box: true
          })
        }
      }
    }, 50);
  },

  /**
   * 商品检索
   */
  search: function (e) {


    if (this.data.searchButton == '搜索') {
      this.setData({
        searchButton: '取消'
      })
    } else {
      this.setData({
        searchButton: '搜索',
        searchValue: ''
      })
    }
    wx.removeStorageSync('commoditys')
    wx.removeStorageSync('cart')
    this.initthisData();
  },
  searchInput: function (e) {
    this.setData({
      searchValue: e.detail.value
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;

    this.setData({
      userInfo: wx.getStorageSync('userInfo')
    })
    this.initPage();

    app.findByBbranch(
      function (bbranch) {
        that.setData({
          bbranch: bbranch
        })
        app.getOpenid(function (openid) {
          that.initthisData();
        })
      }, app.globalData.branchid);

    app.setNavigationBarTitle('校园饭tuan')
    this.onCheck();

  },


  onCheck() {
    var that = this;
    app.getUserLocation(function (e) {
     
    });
  },


  refresh: function (e) {

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
    // console.log('onPullDownRefresh')
    wx.removeStorageSync('commoditys')
    this.initthisData();
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

  comingOrder: function (productList) {
    //  console.log('productList:'+JSON.stringify(productList))
    for (var i = 0; i < productList.length; i++) {
      var item = productList[i];
      var parentIndex = item.parentIndex;
      var index = item.index;

      if (item.packagetc)
        this.shoppingcartplus(parentIndex, index, item.packagetc);
      else
        this.shoppingcartplus(parentIndex, index)

    }
  },


})
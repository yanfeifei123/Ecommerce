// pages/meal/components/index/index.js

const commoditys = require('../../../utils/commodity.js');

const httpRequest = require('../../../utils/request.js');

const configlogin = require('../../../utils/configlogin.js');

// 右侧每一类的 bar 的高度（固定）
const RIGHT_BAR_HEIGHT = 34;
// 右侧每个子类的高度（固定）
const RIGHT_ITEM_HEIGHT = 100;

// 左侧每个类的高度（固定）
const LEFT_ITEM_HEIGHT = 40;

var app = getApp()


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
    submitinfo: ''
  },

  /**
   * 组件的方法列表
   */
  methods: {

    HZL_getEachRightItemToTop: function() {
      var obj = {};
      var totop = 0;
      obj[this.data.commoditys[0].id] = totop;
      for (let i = 1; i < (this.data.commoditys.length + 1); i++) {
        // console.log('HZL_getEachRightItemToTop:' + this.data.commoditys[i - 1].bproductsitems.length)
        totop += (RIGHT_BAR_HEIGHT + this.data.commoditys[i - 1].bproductsitems.length * RIGHT_ITEM_HEIGHT)
        obj[this.data.commoditys[i] ? this.data.commoditys[i].id : 'last'] = totop;
      }
      // console.log(JSON.stringify(obj))
      return obj;
    },

    /**
     * 左边菜单分类点击事件
     */
    intoVieleft: function(e) {
      // console.log('intoVieleft:'+e.target.dataset.id)
      this.setData({
        toView: e.target.dataset.id
        // ,
        // currentLeftSelect: e.target.dataset.id
      })
    },
    intoVieright: function(e) {

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


    bindtapminus: function(e) {

      var index = e.currentTarget.dataset.index;
      var parentIndex = e.currentTarget.dataset.parentindex;
      this.shoppingcartminus(parentIndex, index);
    },

    bindtapplus: function(e) {
      this.hideCart(null);
      var index = e.currentTarget.dataset.index;
      var parentIndex = e.currentTarget.dataset.parentindex;
      var packages = commoditys[parentIndex].bproductsitems[index].packages; //是否套餐
      if (packages == 1) {
        var id = commoditys[parentIndex].bproductsitems[index].id;
        this.packageView(id, parentIndex, index);
      } else {
        this.touchOnGoods(e);
        this.shoppingcartplus(parentIndex, index);
      }
    },
    /**
     * 实现购物车增加
     */
    shoppingcartplus: function(parentIndex, index) {

      var commoditys = wx.getStorageSync('commoditys') || [];
      var shoppingcart = wx.getStorageSync('cart') || [];
      var setmeals = wx.getStorageSync('setmeals') || []; //取出套餐
      if (shoppingcart.length == 0) {
        commoditys = this.data.commoditys;
        shoppingcart = this.data.shoppingcart;
      }

      var item = commoditys[parentIndex].bproductsitems[index];

      var id = item.id;
      var name = item.name;
      var num = ++item.num;
      var imagepath = item.imagepath;
      var price = item.price;
      var memberprice = item.memberprice;

      var tprice = 0;
      var tmemberprice = 0;

      var items = [];
      var issetmeal = false;
      var bool = false;
      var obj = {};
      for (var i = 0; i < setmeals.length; i++) {
        var n = setmeals[i];
        var o = commoditys[n.parentIndex].bproductsitems[n.index];
        if (item == o) {
          tprice += n.totalprice;
          tmemberprice += n.memberprice;
          issetmeal = true;
          items.push(n);
        }
      }

      if (!issetmeal) {
        tprice = (price * num);
        tmemberprice = (memberprice * num);
      }


      for (var i = 0; i < shoppingcart.length; i++) {
        if (shoppingcart[i].id === id) {
          obj = shoppingcart[i];
          bool = true;
          break;
        }
      }
      if (bool) {
        obj.tprice = tprice;
        obj.tmemberprice = tmemberprice;
        obj.num = num;
      } else {
        obj = {
          id: id,
          num: num,
          name: name,
          tprice: tprice,
          tmemberprice: tmemberprice,
          index: index,
          parentIndex: parentIndex,
          imagepath: imagepath
        };
        shoppingcart.push(obj);
      }
      if (issetmeal) {
        obj.items = items;
      }
      var totalprice = 0;
      var productamount = 0;

      for (var i = 0; i < shoppingcart.length; i++) {
        var obj = shoppingcart[i];
        totalprice += obj.tprice;
        productamount += obj.num;
      }

      var submitinfo = '提交订单';
      if (totalprice < this.data.bbranch.firstmoney) {
        submitinfo = this.data.bbranch.firstmoney + '元送起'
      }

      this.setData({
        totalprice: parseFloat(totalprice).toFixed(2),
        commoditys: commoditys,
        shoppingcart: shoppingcart,
        display: 'flex',
        productamount: productamount,
        submitinfo: submitinfo
      })
      wx.setStorageSync('commoditys', commoditys);
      wx.setStorageSync('cart', shoppingcart);
      this.callpageheight();
      // wx.removeStorageSync('setmeals');
      // console.log('shoppingcart:' + JSON.stringify(shoppingcart))
    },
    /**
     * 实现购物车减少
     */
    shoppingcartminus: function(parentIndex, index) {
      var display = 'flex';
      var commoditys = wx.getStorageSync('commoditys') || [];
      var shoppingcart = wx.getStorageSync('cart') || [];

      var setmeals = wx.getStorageSync('setmeals') || []; //取出套餐

      if (commoditys.length == 0 || shoppingcart.length == 0) {
        commoditys = this.data.commoditys;
        shoppingcart = this.data.shoppingcart;
      }

      var item = commoditys[parentIndex].bproductsitems[index];
      var id = item.id;
      var num = --item.num;
      var price = item.price;
      var memberprice = item.memberprice;

      var tprice = 0;
      var tmemberprice = 0;

      var issetmeal = false;

      for (var i = 0; i < setmeals.length; i++) {
        var n = setmeals[i];
        var o = commoditys[n.parentIndex].bproductsitems[n.index];
        if (item == o) {
          setmeals.splice(i, 1);
          for (var j = 0; j < shoppingcart.length; j++) {
            var cart = shoppingcart[j];
            if (cart.items != undefined) {
              for (var s = 0; s < cart.items.length; s++) {
                cart.items.splice(s, 1);
                break;
              }
            }
          }
          issetmeal = true;
          break;
        }
      }


      if (issetmeal) {
        for (var i = 0; i < setmeals.length; i++) {
          var n = setmeals[i];
          tprice += n.totalprice;
          tmemberprice += n.memberprice;
        }
      } else {
        tprice = (price * num);
        tmemberprice = (memberprice * num);
      }


      if (num === 0) {
        for (var i = 0; i < shoppingcart.length; i++) {
          var obj = shoppingcart[i];
          if (id === obj.id) {
            shoppingcart.splice(i, 1);
          }
        }
      } else {
        var obj = {};
        for (var i = 0; i < shoppingcart.length; i++) {
          if (id === shoppingcart[i].id) {
            obj = shoppingcart[i];
            break;
          }
        }
        if (obj) {
          obj.tprice = tprice;
          obj.num = num;
          obj.tmemberprice = tmemberprice;
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
      if (totalprice < 15) {
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
      if (setmeals.length == 0) {
        wx.removeStorageSync('setmeals');
      } else {
        wx.setStorageSync('setmeals', setmeals);
      }
      // console.log('shoppingcart:' + JSON.stringify(shoppingcart));
      this.callpageheight();
    },

    /**
     * 当购物车显示是重新计算页面高度
     */
    callpageheight: function() {
      var bottomcart = 0;
      var that = this;
      if (this.data.display === 'flex') {
        bottomcart = 50;
      }
      wx.getSystemInfo({
        success: function(res) {
          var containerheight = res.windowHeight - 48 - 40 - 55 - bottomcart;
          // console.log('containerheight: ' + containerheight);
          that.setData({
            containerheight: containerheight
          })
        }
      });
    },




    viewbottomcartbox: function(e) {
      this.setData({
        bottomcartbox: this.data.bottomcartbox === 'none' ? 'block' : 'none',
      })
    },

    /**
     * 清空购物车功能
     */
    clearshoppingcart: function(e) {

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
      wx.removeStorageSync('commoditys')
      wx.removeStorageSync('cart')
      wx.removeStorageSync('setmeals')
      this.callpageheight();
    },

    /**
     *  购物车里加
     */
    cartjia: function(e) {
      var index = e.target.dataset.index;
      var parentIndex = e.target.dataset.parentindex;

      this.shoppingcartplus(parentIndex, index);
    },
    /**
     * 购物车里减
     */
    cartjian: function(e) {
      var index = e.target.dataset.index;
      var parentIndex = e.target.dataset.parentindex;
      this.shoppingcartminus(parentIndex, index);
      if (this.data.shoppingcart.length === 0) {
        this.setData({
          bottomcartbox: 'none'
        })
      }
    },

    showShopCartFn: function(e) {
      this.setData({
        bottomcartbox: 'none'
      })
    },

    /**
     * 提交订单
     */
    submitorders: function(e) {

      if (this.data.totalprice < this.data.bbranch.firstmoney) {

        return false;
      }

      var that = this;

      // console.log('userInfo:'+wx.getStorageSync('userInfo'))

      if (wx.getStorageSync('userInfo') == '') {
        if (e.detail.errMsg === 'getUserInfo:ok') {
          app.getUserInfo(function(e) {
            // console.log('e:' + JSON.stringify(e));
            wx.setStorageSync('userInfo', e);
            that.setData({
              userInfo: e
            })
            that.switchTab()
          })
        }
      } else {
        this.switchTab()
      }


      // wx.checkSession({
      //   success: function (res) {

      //   },
      //   fail: function (res) {
      //     console.log("需要重新登录");
      //     configlogin.login(function (openid) {

      //     })
      //   }
      // })




      // that.switchTab()
    },




    switchTab: function(e) {
      if (this.data.totalprice < this.data.bbranch.firstmoney) {
        return false;
      }
      wx.navigateTo({
        url: '/pages/meal/submitorders/submitorders'
      });
    },

    hideCart: function(e) {


    },
    cartView: function(e) {
      var query = wx.createSelectorQuery();
    },

    requestcommodityJson: function() {

    },



    /**
     * 初始化计算高度
     */
    initPage: function() {
      var that = this;
      wx.getSystemInfo({
        success: function(res) {
          // var containerheight = res.windowHeight - 78 - 40 - 1 - 55;
          var containerheight = res.windowHeight - 48 - 40 - 55;
          that.setData({
            containerheight: containerheight,
          })
        }
      });
      this.busPos = {};
      this.busPos['x'] = 40; //购物车的位置
      this.busPos['y'] = 508;
    },

    initthisData: function() {
      var that = this;
      var bottomcartbox = 'none';
      var display = 'none';

      var shoppingcart = wx.getStorageSync('cart') || [];
      var storagecommoditys = wx.getStorageSync('commoditys') || [];

      // console.log(storagecommoditys.length)

      if (storagecommoditys.length == 0) {
        // 静态部分
        // this.setData({
        //   commoditys: commoditys
        // })
        // if (shoppingcart.length != 0) {
        //   display = 'flex';
        // }
        // var totalprice = 0;
        // var productamount = 0;

        // for (var i = 0; i < shoppingcart.length; i++) {
        //   var obj = shoppingcart[i];
        //   totalprice += obj.tprice;
        //   productamount += obj.num;
        // }


        // this.setData({
        //   HZL_eachRightItemToTop: that.HZL_getEachRightItemToTop(),
        //   currentLeftSelect: that.data.commoditys[0].id,
        //   shoppingcart: shoppingcart,
        //   bottomcartbox: bottomcartbox,
        //   display: display,
        //   totalprice: parseFloat(totalprice).toFixed(2),
        //   productamount: productamount,
        //   suffix: app.globalData.suffix
        // })

        //动态部分
        httpRequest._post('/business/findbusinessAll', {
            businessid: app.globalData.businessid
          },
          function(res) {
            // console.log(JSON.stringify(res.data))
            that.data.commoditys = res.data;
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
            if (totalprice < 15) {
              submitinfo = that.data.bbranch.firstmoney + '元送起'
            }

            that.setData({
              commoditys: that.data.commoditys,
              HZL_eachRightItemToTop: that.HZL_getEachRightItemToTop(),
              currentLeftSelect: that.data.commoditys[0].id,
              shoppingcart: shoppingcart,
              bottomcartbox: bottomcartbox,
              display: display,
              totalprice: parseFloat(totalprice).toFixed(2),
              productamount: productamount,
              suffix: app.globalData.suffix,
              submitinfo: submitinfo
            })

          },
          function(err) {

          }
        );
      } else {
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
        if (totalprice < 15) {
          submitinfo = this.data.bbranch.firstmoney + '元送起'
        }

        that.setData({
          commoditys: storagecommoditys
        })
        that.setData({
          HZL_eachRightItemToTop: that.HZL_getEachRightItemToTop(),
          currentLeftSelect: that.data.commoditys[0].id,
          shoppingcart: shoppingcart,
          bottomcartbox: bottomcartbox,
          display: display,
          totalprice: parseFloat(totalprice).toFixed(2),
          productamount: productamount,
          suffix: app.globalData.suffix,
          submitinfo: submitinfo
        })
      }

    },

    packageView: function(id, parentIndex, index) {
      wx.navigateTo({
        url: '/pages/meal/setmeal/setmeal?pid=' + id + '&parentIndex=' + parentIndex + '&index=' + index + '&time=' + new Date()
      });
    },


    calculationsetmealprice: function() {
      var setmeals = wx.getStorageSync('setmeals') || [];
      var parentIndex = setmeals[0].parentIndex;
      var index = setmeals[0].index;
      this.shoppingcartplus(parentIndex, index);
    },






    findByBbranch: function(callback) {
      var that = this;
      httpRequest._post('/business/findByBbranch', {
        id: app.globalData.branchid
      }, function(res) {
        // console.log(JSON.stringify(res.data))
        that.setData({
          bbranch: res.data
        })
        callback()
      }, function(err) {

      })
    },



    /**
     * 点击增加到购物车的 抛物线计算
     * @param {*} e 
     */
    touchOnGoods: function(e) {
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


    startAnimation: function(e) {
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

      this.timer = setInterval(function() {
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


    pageinit: function() {
      var that = this;
      this.setData({
        userInfo: wx.getStorageSync('userInfo')
      })

      this.initPage();
      this.findByBbranch(function() {
        if (wx.getStorageSync('openid') == '') {
          configlogin.login(function(openid) {
            that.initthisData();
          })
        } else {
          that.initthisData();
        }
      });
      // this.initthisData();

      wx.setNavigationBarTitle({
        title: "校园饭tuan"
      })
    }

  },



  /**  
   * 节点树完成，可以用setData渲染节点，但无法操作节点  
   * */
  attached(e) {


  },
  /**
   * 组件布局完成，这时可以获取节点信息，也可以操作节点
   */
  ready() {
    var that = this;
    this.setData({
      userInfo: wx.getStorageSync('userInfo')
    })

    this.initPage();
    this.findByBbranch(function() {
      if (wx.getStorageSync('openid') == '') {
        configlogin.login(function(openid) {
          that.initthisData();
        })
      } else {
        that.initthisData();
      }
    });
    // this.initthisData();

    wx.setNavigationBarTitle({
      title: "校园饭tuan"
    })
  }

})
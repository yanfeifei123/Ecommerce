// pages/business/tabBar/tabBar.js
const httpRequest = require('../../../utils/request.js');
import baseurl from '../../../utils/baseurl.js'
const bluetooth = require('../../../utils/cbluetooth.js');
const gbk = require('../../../utils/gbk.js');
const PrinterJobs = require('../../../printer/printerjobs')
const printerUtil = require('../../../printer/printerutil')

var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    PageCur: 'home',
    timer: null,
    socketTask: null,
    bbluetooth: null, //蓝牙对象
    isMsg: false,
    bbluetoothisConnect: false
  },


  NavChange(e) {

    // console.log('e.currentTarget.dataset.cur:' + e.currentTarget.dataset.cur);
    this.setData({
      PageCur: e.currentTarget.dataset.cur
    })
  },

  /**
   * 
   * @param {获取蓝牙设置} success 
   */
  findByMybbluetooth(success) {
    var userInfo = app.getBUserInfo();
    var that = this;
    httpRequest._post('/business/findByBbluetooth', {
      branchid: userInfo.branchid
    }, function (res) {

      that.setData({
        bbluetooth: res.data
      })
      success(res.data)
    }, function (err) {

    }, true)
  },

  newordervoice() {
    var url = baseurl.baseurl + '/static/voice/neworderreminder.mp3';
    var title = '新订单提醒'
    app.voicebroadcast(url, title, function () {
      console.log(title)
    });
  },

  updateAddressvoice(){
    var url = baseurl.baseurl + '/static/voice/updateAddress.mp3';
    var title = '订单修改提醒'
    app.voicebroadcast(url, title, function () {
      console.log(title)
    });
  },

  
  refundOrdersvoice(){
    var url = baseurl.baseurl + '/static/voice/refundOrder.mp3';
    var title = '订单申请退款'
    app.voicebroadcast(url, title, function () {
      console.log(title)
    });
  },


  

  viewOrderPage() {
    wx.navigateTo({
      url: '/pages/business/orderm/orderm'
    })
  },

  viewOrdermdPage(id){
    wx.navigateTo({
      url: '/pages/business/ordermd/ordermd?orderid='+id
    })
  },



  /**
   * 打开socket通讯
   */
  socket() {
    var that = this;
    var userInfo = app.getBUserInfo();
    // console.log('userInfo:'+JSON.stringify(userInfo))
    var socketTask = wx.connectSocket({
      url: baseurl.wssurl,
      header: {
        'content-type': 'application/json'
      }
    })
    socketTask.onOpen(function (res) {
      //消息发送
      socketTask.send({
        data: that.decodeUTF8(userInfo.branchid),
        success: function () {
          that.pullOut(socketTask);
        }
      });


      //监听消息接收
      socketTask.onMessage(function (ress) {
        if (ress.data) {
           that.doMessage(ress.data)
        }
      })
    })
    this.data.socketTask = socketTask;
  },

  /**
   * 消息接受监听
   */
  doMessage (data) {
    var messageTemplate = JSON.parse(data);
    if(messageTemplate.type=='order'){
      this.newOrderRemind();
    }else if(messageTemplate.type=='updateAddress'){
      // console.log('订单地址被修改')
      this.updateAddressvoice();
      this.viewOrdermdPage(messageTemplate.orderid);
    }else if(messageTemplate.type=='refundOrder'){
      this.refundOrdersvoice();
    }
   
  },
  
  /*
    *  新订单提醒
    */
  newOrderRemind(){
    this.selectComponent('#home').findByOrderSummaryitem(null, 1);
    this.selectComponent('#home').findByIsNotOrderComplete();
    this.newordervoice();
    this.refreshData();
  },


  /**
   * 消息发送监听
   */
  pullOut(socketTask) {
    var that = this;
    var userInfo = app.getBUserInfo();
    this.data.timer = setInterval(function () {
      try {
        console.log('timer:socket通信')
        socketTask.send({
          data: that.decodeUTF8(userInfo.branchid)
        });
      } catch (e) {
        console.log('socket通信通信异常：' + JSON.stringify(e));
      }
    }, 10000)
  },



  decodeUTF8(str) {
    return decodeURIComponent(escape(str));
  },

  findOrderDetailed: function (obj, callback) {

    httpRequest._post('/order/findOrderDetailed', {
      orderid: obj.orderid
    }, function (res) {
      var orderDetail = res.data;

      callback(orderDetail)
    }, function (err) {

    }, true)
  },


  /**
   * 打印小票
   */
  printSmallticket: function (orderDetail) {

    var that = this;
    var orderItems = orderDetail.orderItems
    var Price = 0

    let printerJobs = new PrinterJobs();
    printerJobs
      /*****************************商家信息 */
      .setSize(2, 2)
      .print('商家小票')
      .setSize(1, 1)
      .print(printerUtil.fillLine())
      .setSize(2, 2)
      .print("#" + orderDetail.order + "校园饭团外卖")
      .setSize(1, 1)
      .setAlign('ct')
      .print("*" + orderDetail.branchname + "*")
      .println()
      .setAlign('lt')
      .print("订单类型：" + (orderDetail.self == 1 ? "到店自取" : "外卖配送"))
      .print("下单时间：" + orderDetail.ordertime)
      .print("订单编号：" + orderDetail.orderno)
      .print("********************************") //32占一行

      /*****************************商品信息 */
      .print(printerUtil.fillAround('1号口袋'))


    for (var i = 0; i < orderItems.length; i++) {
      var item = orderItems[i];
      Price = orderDetail.ismember == 1 ? item.memberprice : item.price
      if (Price.toString().indexOf('.') != -1)
        Price = gbk.encode(Price.toString())
      else
        Price = gbk.encode(Price.toString() + '.0')
      if (item.orderItems.length != 0) {

        printerJobs.print(printerUtil.inline(item.name + '        *' + item.number, Price))

        var childs = item.orderItems;
        for (var j = 0; j < childs.length; j++) {
          var child = childs[j]
          Price = orderDetail.ismember == 1 ? child.memberprice : child.price
          if (Price.toString().indexOf('.') != -1) {
            Price = gbk.encode(Price.toString())
          } else {
            Price = gbk.encode(Price.toString() + '.0')
          }
          printerJobs.print(printerUtil.inline('        ' + child.name + '        *' + child.number, Price))
        }
      } else {
        printerJobs.print(printerUtil.inline(item.name + '           *' + item.number, Price))
      }
    }

    printerJobs.print(printerUtil.fillAround('其他'))

      .print(printerUtil.inline('餐盒费', '0.0'))
      .print(printerUtil.inline('配送费', (orderDetail.self == 1 ? '0.0' : gbk.encode(orderDetail.deliveryfee.toString()))))
      .print(printerUtil.fillAround("*"))
      .setAlign('rt')
    if (orderDetail.firstorder != 0) {
      printerJobs.print('首单客户立减：' + gbk.encode(orderDetail.firstorder.toString()))
    }
    printerJobs.print('优惠：￥' + orderDetail.discount)
      .setSize(2, 2)
      .print('实际支付￥' + orderDetail.totalfee)
      /*****************************用户信息 */
      .setSize(1, 1)
      .print('(' + orderDetail.paym + ')')
      .print(printerUtil.fillLine())
      .setSize(2, 2)
      .setAlign('lt')
      .print(orderDetail.receiver + '电话：' + orderDetail.phone)
      .print((orderDetail.self == 1 ? "" : orderDetail.address))
      .setSize(1, 1)
      .print("*************#" + orderDetail.order + "完*************")
      .println()
      .println()

    ///***************************** 第二份*/ 
    Price = 0
    printerJobs.setSize(2, 2)
      .print('商家小票')
      .setSize(1, 1)
      .print(printerUtil.fillLine())
      .setSize(2, 2)
      .print("#" + orderDetail.order + "校园饭团外卖")
      .setSize(1, 1)
      .setAlign('ct')
      .print("*" + orderDetail.branchname + "*")
      .println()
      .setAlign('lt')
      .print("订单类型：" + (orderDetail.self == 1 ? "到店自取" : "外卖配送"))
      .print("下单时间：" + orderDetail.ordertime)
      .print("订单编号：" + orderDetail.orderno)
      .print("********************************") //32占一行

      /*****************************商品信息 */
      .print(printerUtil.fillAround('1号口袋'))


    for (var i = 0; i < orderItems.length; i++) {
      var item = orderItems[i];
      Price = orderDetail.ismember == 1 ? item.memberprice : item.price
      if (Price.toString().indexOf('.') != -1)
        Price = gbk.encode(Price.toString())
      else
        Price = gbk.encode(Price.toString() + '.0')
      if (item.orderItems.length != 0) {

        printerJobs.print(printerUtil.inline(item.name + '        *' + item.number, Price))

        var childs = item.orderItems;
        for (var j = 0; j < childs.length; j++) {
          var child = childs[j]
          Price = orderDetail.ismember == 1 ? child.memberprice : child.price
          if (Price.toString().indexOf('.') != -1) {
            Price = gbk.encode(Price.toString())
          } else {
            Price = gbk.encode(Price.toString() + '.0')
          }
          printerJobs.print(printerUtil.inline('        ' + child.name + '        *' + child.number, Price))
        }
      } else {
        printerJobs.print(printerUtil.inline(item.name + '           *' + item.number, Price))
      }
    }



    printerJobs.print(printerUtil.fillAround('其他'))

      .print(printerUtil.inline('餐盒费', '0.0'))
      .print(printerUtil.inline('配送费', (orderDetail.self == 1 ? '0.0' : gbk.encode(orderDetail.deliveryfee.toString()))))
      .print(printerUtil.fillAround("*"))
      .setAlign('rt')
    if (orderDetail.firstorder != 0) {
      printerJobs.print('首单客户立减：' + gbk.encode(orderDetail.firstorder.toString()))
    }
    printerJobs.print('优惠：￥' + orderDetail.discount)
      .setSize(2, 2)
      .print('实际支付￥' + orderDetail.totalfee)
      /*****************************用户信息 */
      .setSize(1, 1)
      .print('(' + orderDetail.paym + ')')
      .print(printerUtil.fillLine())
      .setSize(2, 2)
      .setAlign('lt')
      .print(orderDetail.receiver + '电话：' + orderDetail.phone)
      .print((orderDetail.self == 1 ? "" : orderDetail.address))
      .setSize(1, 1)
      .print("*************#" + orderDetail.order + "完*************")
      .println()
      .println();


    let buffer = printerJobs.buffer();

    const maxChunk = 20;
    const delay = 20;
    for (let i = 0, j = 0, length = buffer.byteLength; i < length; i += maxChunk, j++) {
      let subPackage = buffer.slice(i, i + maxChunk <= length ? (i + maxChunk) : length);
      setTimeout(that.printOrder, j * delay, subPackage);
    }
  },
  /**
   * 
   * @param {单子打印} orderDetail 
   */
  writeBLECharacteristicValue: function (obj) {
    // console.log('writeBLECharacteristicValue:'+JSON.stringify(obj))
    var that = this;


    this.findOrderDetailed(obj, function (orderDetail) {

      var orderItems = orderDetail.orderItems
      var Price = 0

      let printerJobs = new PrinterJobs();
      printerJobs
        /*****************************商家信息 */
        .setSize(2, 2)
        .print('商家小票')
        .setSize(1, 1)
        .print(printerUtil.fillLine())
        .setSize(2, 2)
        .print("#" + orderDetail.order + "校园饭团外卖")
        .setSize(1, 1)
        .setAlign('ct')
        .print("*" + orderDetail.branchname + "*")
        .println()
        .setAlign('lt')
        .print("下单时间：" + orderDetail.ordertime)
        .print("订单类型：" + (orderDetail.self == 1 ? "到店自取" : "外卖配送"))
        .print("********************************") //32占一行

        /*****************************商品信息 */
        .print(printerUtil.fillAround('1号口袋'))


      for (var i = 0; i < orderItems.length; i++) {
        var item = orderItems[i];
        Price = orderDetail.ismember == 1 ? item.memberprice : item.price
        if (Price.toString().indexOf('.') != -1)
          Price = gbk.encode(Price.toString())
        else
          Price = gbk.encode(Price.toString() + '.0')
        if (item.orderItems.length != 0) {

          printerJobs.print(printerUtil.inline(item.name + '(套餐)        *' + item.number, Price))

          var childs = item.orderItems;
          for (var j = 0; j < childs.length; j++) {
            var child = childs[j]
            Price = orderDetail.ismember == 1 ? child.memberprice : child.price
            if (Price.toString().indexOf('.') != -1) {
              Price = gbk.encode(Price.toString())
            } else {
              Price = gbk.encode(Price.toString() + '.0')
            }
            printerJobs.print(printerUtil.inline('        ' + child.name + '        *' + child.number, Price))
          }
        } else {
          printerJobs.print(printerUtil.inline(item.name + '           *' + item.number, Price))
        }
      }



      printerJobs.print(printerUtil.fillAround('其他'))

        .print(printerUtil.inline('餐盒费', '0.0'))
        .print(printerUtil.inline('配送费', (orderDetail.self == 1 ? '0.0' : gbk.encode(orderDetail.deliveryfee.toString())) + '.0'))
        .print(printerUtil.fillAround("*"))
        .setAlign('rt')
      if (orderDetail.firstorder != 0) {
        printerJobs.print('首单客户立减：' + gbk.encode(orderDetail.firstorder.toString()))
      }
      printerJobs.print('优惠：￥' + orderDetail.discount)
        .setSize(2, 2)
        .print('实际支付￥' + orderDetail.totalfee)
        /*****************************用户信息 */
        .setSize(1, 1)
        .print('(' + orderDetail.paym + ')')
        .print(printerUtil.fillLine())
        .setSize(2, 2)
        .setAlign('lt')
        .print(orderDetail.receiver + '电话：' + orderDetail.phone)
        .print((orderDetail.self == 1 ? "" : orderDetail.address))
        .setSize(1, 1)
        .print("*************#" + orderDetail.order + "完*************")
        .println()
        .println()

      ///***************************** 第二份*/ 
      Price = 0
      printerJobs.setSize(2, 2)
        .print('商家小票')
        .setSize(1, 1)
        .print(printerUtil.fillLine())
        .setSize(2, 2)
        .print("#" + orderDetail.order + "校园饭团外卖")
        .setSize(1, 1)
        .setAlign('ct')
        .print("*" + orderDetail.branchname + "*")
        .println()
        .setAlign('lt')
        .print("下单时间：" + orderDetail.ordertime)
        .print("订单类型：" + (orderDetail.self == 1 ? "到店自取" : "外卖配送"))
        .print("********************************") //32占一行

        /*****************************商品信息 */
        .print(printerUtil.fillAround('1号口袋'))


      for (var i = 0; i < orderItems.length; i++) {
        var item = orderItems[i];
        Price = orderDetail.ismember == 1 ? item.memberprice : item.price
        if (Price.toString().indexOf('.') != -1)
          Price = gbk.encode(Price.toString())
        else
          Price = gbk.encode(Price.toString() + '.0')
        if (item.orderItems.length != 0) {

          printerJobs.print(printerUtil.inline(item.name + '(套餐)        *' + item.number, Price))

          var childs = item.orderItems;
          for (var j = 0; j < childs.length; j++) {
            var child = childs[j]
            Price = orderDetail.ismember == 1 ? child.memberprice : child.price
            if (Price.toString().indexOf('.') != -1) {
              Price = gbk.encode(Price.toString())
            } else {
              Price = gbk.encode(Price.toString() + '.0')
            }
            printerJobs.print(printerUtil.inline('        ' + child.name + '        *' + child.number, Price))
          }
        } else {
          printerJobs.print(printerUtil.inline(item.name + '           *' + item.number, Price))
        }
      }



      printerJobs.print(printerUtil.fillAround('其他'))

        .print(printerUtil.inline('餐盒费', '0.0'))
        .print(printerUtil.inline('配送费', (orderDetail.self == 1 ? '0.0' : gbk.encode(orderDetail.deliveryfee.toString())) + '.0'))
        .print(printerUtil.fillAround("*"))
        .setAlign('rt')
      if (orderDetail.firstorder != 0) {
        printerJobs.print('首单客户立减：' + gbk.encode(orderDetail.firstorder.toString()))
      }
      printerJobs.print('优惠：￥' + orderDetail.discount)
        .setSize(2, 2)
        .print('实际支付￥' + orderDetail.totalfee)
        /*****************************用户信息 */
        .setSize(1, 1)
        .print('(' + orderDetail.paym + ')')
        .print(printerUtil.fillLine())
        .setSize(2, 2)
        .setAlign('lt')
        .print(orderDetail.receiver + '电话：' + orderDetail.phone)
        .print((orderDetail.self == 1 ? "" : orderDetail.address))
        .setSize(1, 1)
        .print("*************#" + orderDetail.order + "完*************")
        .println()
        .println();


      let buffer = printerJobs.buffer();

      const maxChunk = 20;
      const delay = 20;
      for (let i = 0, j = 0, length = buffer.byteLength; i < length; i += maxChunk, j++) {
        let subPackage = buffer.slice(i, i + maxChunk <= length ? (i + maxChunk) : length);
        setTimeout(that.printOrder, j * delay, subPackage);
      }


    })
  },
  printOrder: function (buffer) {
    var deviceId = this.data.bbluetooth.deviceId,
      serviceId = this.data.bbluetooth.serviceId,
      characteristicId = this.data.bbluetooth.characteristicId;
    bluetooth.bluetoothPrinting(deviceId, serviceId, characteristicId, buffer, function (res) {

    }, function (err) {

    })
  },


  openMybbluetooth() {
    var that = this;
    this.findByMybbluetooth(function (params) {
      if (!params) {
        if (!that.data.isMsg) {
          this.data.isMsg = true;
          wx.showModal({
            title: '提示',
            content: '未设置小票打印机，是否前往设置？',
            success: function (res) {
              if (res.confirm) {
                wx.navigateTo({
                  url: '/pages/business/bluetooth/bluetooth'
                })
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        }
      } else {
        that.autoLinkBluetooth()
      }
    })
  },



  /**
   * 自动链接蓝牙
   */
  autoLinkBluetooth() {

    var that = this;
    var bbluetooth = this.data.bbluetooth;
    bluetooth.openBluetoothAdapter(function (devices) {
      // console.log('查找蓝牙设备:'+JSON.stringify(devices));

      for (var i = 0; i < devices.length; i++) {
        var item = devices[i];
        if (item.deviceId == bbluetooth.deviceId) { //找到之前设置的蓝牙
          that.startConnectDevices(item.deviceId)
          break;
        } else {
          if (!that.data.isMsg) {
            that.data.isMsg = true;
            wx.showModal({
              title: '提示',
              content: '未设置小票打印机，是否前往设置？',
              success: function (res) {
                if (res.confirm) {
                  wx.navigateTo({
                    url: '/pages/business/bluetooth/bluetooth'
                  })
                } else if (res.cancel) {
                  console.log('用户点击取消')
                }
              }
            })
          }
        }
      }
    })
  },
  /**
   * 
   * @param {连接蓝牙} deviceId 
   */
  startConnectDevices(deviceId) {
    var that = this;
    bluetooth.startConnectDevices(deviceId, function (res) {
      var characteristics = res.characteristics;
      for (var i = 0; i < characteristics.length; i++) {
        var item = characteristics[i];
        if (item.properties.write) { //找到那个写入口
          bluetooth.stopBluetoothDevicesDiscovery(function (res) {
            wx.showToast({
              title: '蓝牙连接成功！',
              icon: 'success',
              duration: 2000
            })
            that.setData({
              bbluetoothisConnect: true
            })
          })
        }
      }
    })
  },

  closesocketTask(callback) {
    try {
      var that = this;
      this.data.socketTask.close({
        code: 1000,
        reason: 'onUnload',
        success: function () {
          clearInterval(that.data.timer);
        }
      })
      wx.onSocketClose((result) => {
        console.log('socket链接关闭！')
        callback()
      })
    } catch (ex) {
      console.log('ex:' + ex);
    }
  },
  closeConnections() {
    try {
      var that = this;
      this.data.socketTask.close({
        code: 1000,
        reason: 'onUnload',
        success: function () {
          clearInterval(that.data.timer);
        }
      })
      wx.onSocketClose((result) => {
        console.log('socket链接关闭！')
      })
      bluetooth.stopBluetoothDevicesDiscovery(function (params) {});
    } catch (ex) {
      console.log('ex:' + ex);
    }

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
     
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
    wx.hideHomeButton();
    this.socket();
    this.openMybbluetooth() //打开蓝牙
  },



  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    //  console.log('小程序切入后台');
    this.closeConnections()
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.closeConnections()
  },
  
  refreshData:function(){
    if (this.data.PageCur == 'home') {
      this.selectComponent('#home').initNavigationBarTitle();
      this.selectComponent('#home').findByOrderSummaryitem(null,1);
      this.selectComponent('#home').findByIsNotOrderComplete();
    }
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

    if (this.data.PageCur == 'home') {
      this.selectComponent('#home').initNavigationBarTitle();
      this.selectComponent('#home').findByOrderSummaryitem(null,1);
      this.selectComponent('#home').findByIsNotOrderComplete();
      // console.log('tabBar:下拉刷新'+this.data.PageCur)
    }
    wx.stopPullDownRefresh();
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
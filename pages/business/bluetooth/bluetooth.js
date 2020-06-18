const bluetooth = require('../../../utils/cbluetooth.js');
const httpRequest = require('../../../utils/request.js');
const PrinterJobs = require('../../../printer/printerjobs')
const printerUtil = require('../../../printer/printerutil')

var app = getApp();

function inArray(arr, key, val) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][key] === val) {
      return i
    }
  }
  return -1
}

Page({

  /**
   * 页面的初始数据
   */
  data: {

    bbluetooth: null, //蓝牙对象
    isAutoLink: false,
    devices: [],
    bluetoothNo: true,
    _characteristicId: '',
    deviceId: '',
    serviceId: '',
    
    isConnect: false,
    ispriint: false,
    localMap: null
  },


  findByMybbluetooth: function (success) {
    var userInfo = wx.getStorageSync('userInfo');
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

  startConnect: function () {
    this.data.localMap = new Map();

    bluetooth.stopBluetoothDevicesDiscovery(function (params) {});
    var that = this;
    if (!this.data.bbluetooth) {
      this.findByMybbluetooth(function (bbluetooth) {
        bluetooth.openBluetoothAdapter(function (devices) {
          that.filterdevices(devices);
        })
      })
    } else {
      bluetooth.openBluetoothAdapter(function (devices) {
        that.filterdevices(devices);
      })
    }
  },

  /**
   * 
   * @param {蓝牙打开关闭操作} e 
   */
  bluetoothNoChange: function (e) {
    var checkedValue = e.detail.value;
    if (!checkedValue) {
      this.closebluetooth();
    } else {
      this.startConnect();
    }
    this.setData({
      bluetoothNo: checkedValue
    })
  },

  /**
   * 关闭
   */
  closebluetooth: function () {
    var that = this;
    bluetooth.stopBluetoothDevicesDiscovery(function (res) {
      that.setData({
        devices: [],
        isConnect: false,
        isAutoLink: false,
        localMap: null
      })
    })
  },


  /**
   *  不停止
   * @param {蓝牙查找回调函数} devices 
   */
  filterdevices: function (devices) {
    
    var thdevices = this.data.devices;
    var localMap = this.data.localMap;
    for (var i = 0; i < devices.length; i++) {
      var item = devices[i];

      if (!localMap.has(item.deviceId)) {
        localMap.set(item.deviceId, item);
        thdevices.push(item);
      }
    }
    this.setData({
      devices: thdevices
    })
    if (!this.data.isAutoLink) {
      this.autoLinkbluetooth()
    }
  },

  autoLinkbluetooth: function () {

    var devices = this.data.devices;
    var bbluetooth = this.data.bbluetooth;

    for (var i = 0; i < devices.length; i++) {
      var item = devices[i];
      if (item.deviceId == bbluetooth.deviceId) {
        this.setData({
          isAutoLink: true
        })
        this.conbluetooth(null, item.deviceId);
        break;
      }
    }
  },

  /**
   * 蓝牙连接
   * @param {*} e 
   * @param {*} deId 
   */
  conbluetooth: function (e, deId) {

    wx.showLoading({
      title: '正在连接'
    });
    var deviceId = '';
    if (e) {
      deviceId = e.target.id
    } else {
      deviceId = deId;
    }

    var f = this.checkLink(deviceId)
    if (f) {
      wx.hideLoading();
      wx.showToast({
        title: '该蓝牙已经连接!',
        icon: 'success',
        duration: 2000
      })
      console.log('该蓝牙已经连接')
      return;
    }
    var that = this;

    bluetooth.startConnectDevices(deviceId, function (res) {
      // console.log('startConnectDevices:'+JSON.stringify(res));

      var characteristics = res.characteristics;
      for (var i = 0; i < characteristics.length; i++) {
        var item = characteristics[i];
        if (item.properties.write) { //找到那个写入口
          that.setData({
            write: true,
            _characteristicId: item.uuid,
            deviceId: res.deviceId,
            serviceId: res.serviceId,
            isConnect: true
          })
          that.setBluetoothcon()
          console.log('找到设备并且链接成功！' + that.data._characteristicId)
        }
      }
    })
  },
  /**
   * 验证蓝牙是否已连接
   * @param {*} deviceId 
   */
  checkLink: function (deviceId) {
    var f = false;
    var devices = this.data.devices;
    for (var i = 0; i < devices.length; i++) {
      var item = devices[i];
      if (item.deviceId == deviceId) {
        if (item.isConnect) {
          f = true;
          break;
        }
      }
    }
    return f;
  },

  /**
   * 设置蓝牙list链接状态
   */
  setBluetoothcon: function () {
    var devices = this.data.devices;
    var deviceId = this.data.deviceId;
    for (var i = 0; i < devices.length; i++) {
      var item = devices[i];
      if (item.deviceId == deviceId) {
        item.isConnect = true;
      } else {
        item.isConnect = false; //设置其他蓝牙断开
      }
    }
    this.setData({
      devices: devices
    })
    this.updateBbluetooth();
  },

  updateBbluetooth: function () {
    var userInfo = wx.getStorageSync('userInfo');
    var device_id = this.data.deviceId;
    var service_id = this.data.serviceId;
    var characteristic_id = this.data._characteristicId;
    var device = this.data.localMap.get(device_id);
    console.log('updateBbluetooth:' + JSON.stringify(device))
    var name = ''
    if (device)
      name = device.name
    var id = '';
    if (this.data.bbluetooth) {
      id = this.data.bbluetooth.id;
    }
    var bbluetooth = {
      id: id,
      branchid: userInfo.branchid,
      userid: userInfo.id,
      device_id: device_id,
      service_id: service_id,
      characteristic_id: characteristic_id,
      name: name
    }
    var that = this;
    httpRequest._post('/business/updateBbluetooth', {
      bbluetooth: JSON.stringify(bbluetooth)
    }, function (res) {
      that.setData({
        bbluetooth: res.data
      })
      wx.hideLoading();
    }, function (err) {

    }, true)

  },

  testprintln: function (e) {
    this.writeBLECharacteristicValue()
  },
  writeBLECharacteristicValue: function () {
    this.setData({
      ispriint:true
    })
    let printerJobs = new PrinterJobs();
    printerJobs
     /*****************************商家信息 */
      .setSize(2, 2)
      .print('商家小票')
      .setSize(1, 1)
      .print(printerUtil.fillLine())
      .setSize(2, 2)
      .print("#212校园饭团外卖")
      .setSize(1, 1)
      .setAlign('ct')
      .print("*饭团商务学院分店*")
      .println()
      .setAlign('lt')
      .print("下单时间：18:08:08")
      .print("********************************") //32占一行
     
       /*****************************商品信息 */
      .print(printerUtil.fillAround('1号口袋'))
      printerJobs.print(printerUtil.inline('手抓饼(套餐) * 1', '4.0'))
      printerJobs.print(printerUtil.inline('        培根 * 1', '2.0'))
      printerJobs.print(printerUtil.inline('        鸡排 * 1', '4.0'))
      printerJobs.print(printerUtil.inline('      煎鸡蛋 * 1', '2.0'))
      printerJobs.print(printerUtil.inline('        鸡柳 * 1', '2.0'))
      printerJobs.print(printerUtil.inline('        热狗 * 1', '2.0'))
      printerJobs.print(printerUtil.inline('奥尔良鸡肉饭团 * 1', '9.0'))
      printerJobs.print(printerUtil.inline('芝士饭团 * 1', '7.5'))
      .print(printerUtil.fillAround('其他'))
      .print(printerUtil.inline('餐盒费', '0.0'))
      .print(printerUtil.inline('配送费', '1.0'))
      .print(printerUtil.fillAround("*"))
      .setAlign('rt')
      .print('原价：￥30.5')
      .setSize(2, 2)
      .print('￥27.72')
      /*****************************用户信息 */
      .setSize(1, 1)
      .print('(在线支付)')
      .print(printerUtil.fillLine())
      .setSize(2,2)
      .setAlign('lt')
      .print('严先生手机尾号3741')
      .print('和谐世纪19栋(2301)')
      .setSize(1,1)
      .print("*************#212完*************")
      .println()
      .println();

    let buffer = printerJobs.buffer();

    const maxChunk = 20;
    const delay = 20;
    for (let i = 0, j = 0, length = buffer.byteLength; i < length; i += maxChunk, j++) {
      let subPackage = buffer.slice(i, i + maxChunk <= length ? (i + maxChunk) : length);
      setTimeout(this.printText, j * delay, subPackage);
    }
    this.setData({
      ispriint:false
    })
  },
  printText: function (buffer) {

    var deviceId = this.data.deviceId,
      serviceId = this.data.serviceId,
      characteristicId = this.data._characteristicId;
    bluetooth.bluetoothPrinting(deviceId, serviceId, characteristicId, buffer, function (res) {

    }, function (err) {

    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.startConnect();
    app.setNavigationBarTitle('蓝牙设备')

    let that =this;
    wx.getSystemInfo({
      success: function (res) {
        var height =   res.windowHeight -5;
        that.setData({
          height: height
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
    bluetooth.stopBluetoothDevicesDiscovery(function (params) {});
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
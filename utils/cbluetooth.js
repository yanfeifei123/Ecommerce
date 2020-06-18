 
 /**
  * 开启蓝牙适配功能
  */
 function openBluetoothAdapter(callback) {

   wx.openBluetoothAdapter({
     success: function (res) {
       getBluetoothAdapterState(callback);
     },
     fail: function (err) {
       console.log(err);
       wx.showToast({
         title: '蓝牙初始化失败,请开启手机蓝牙',
         icon: 'success',
         duration: 2000
       })
       setTimeout(function () {
         wx.hideToast()
       }, 2000)
     }
   });
 }

 function getBluetoothAdapterState(callback) {
   wx.getBluetoothAdapterState({
     success: function (res) {
       var available = res.available,
         discovering = res.discovering;
       if (!available) {
         wx.showToast({
           title: '设备无法开启蓝牙连接',
           icon: 'success',
           duration: 2000
         })
         setTimeout(function () {
           wx.hideToast()
         }, 2000)
       } else {
         if (!discovering) {
           startBluetoothDevicesDiscovery(callback);
         }
       }
     }
   })
 }

 function startBluetoothDevicesDiscovery(callback) {

   wx.startBluetoothDevicesDiscovery({
     services: [],
     allowDuplicatesKey: false,
     success: function (res) {
       if (!res.isDiscovering) {
         getBluetoothAdapterState(callback);
       } else {
         onBluetoothDeviceFound(callback);
       }
     },
     fail: function (err) {
       console.log(err);
     }
   });
 }

 function onBluetoothDeviceFound(callback) {
   wx.onBluetoothDeviceFound(function (res) {
     if (res.devices[0]) {
       var name = res.devices[0]['name'];
       if (name != '') { //设备名称不等于空
         if (res.devices[0].advertisServiceUUIDs) {
           // console.log('新设备列表已创建：' + JSON.stringify(res));
           callback(res.devices) //回调函数获取蓝牙设备信息  
         }
       }
     }
   })
 }
 /**
  * 停止搜索蓝牙
  */
 function stopBluetoothDevicesDiscovery(callback) {
   wx.stopBluetoothDevicesDiscovery({
     success: function (res) {
       callback(callback(res))
     }
   })
 }
 /**
  * 
  * @param {链接蓝牙设备} deviceId 
  */
 function startConnectDevices(deviceId, callback) {
   wx.createBLEConnection({
     deviceId: deviceId,
     success: function (res) {
       if (res.errCode == 0) {
         console.log('蓝牙链接：' + JSON.stringify(res));

         getService(deviceId, callback)
       }
     },
     fail: function (err) {
       //  console.log('连接失败：' + deviceId + '  err:' + JSON.stringify(err));
       wx.showToast({
         title: '设备链接异常：' + JSON.stringify(err),
         icon: 'success',
         duration: 2000
       })
       console.log('设备链接异常：'+JSON.stringify(err));
       wx.stopBluetoothDevicesDiscovery({
        success: function (res) {
          console.log('蓝牙连接已关闭!');
        }
      })
     },
     complete: function () {
       console.log('complete connect devices');
     }
   });
 }

 function getService(deviceId, callback) {
   wx.getBLEDeviceServices({
     deviceId: deviceId,
     success: function (res) {
       getCharacter(deviceId, res.services, callback);
     }
   })
 }

 function getCharacter(deviceId, services, callback) {
   var serviceId = '';
   for (var i = 0; i < services.length; i++) {
     let item = services[i];
     if (item.isPrimary) {
       serviceId = item.uuid;
       break;
     }
   }
   wx.getBLEDeviceCharacteristics({
     deviceId: deviceId,
     serviceId: serviceId,
     success: function (res) {

       callback(res)
     },
     fail: function (err) {
       console.log(err);
     },
     complete: function () {
       console.log('complete');
     }
   })
 }


function getBluetoothDevices(callback) {
  wx.getBluetoothDevices({
    success:function (res) {
       callback(res.devices)
    },
    fail: function (err) {
      console.log(err);
    },
    complete: function () {
      // console.log('complete');
    }
  })
}


 /**
  * 打印输出
  * @param {*} deviceId 
  * @param {*} serviceId 
  * @param {*} characteristicId 
  * @param {*} bufferstr 
  * @param {*} success 
  * @param {*} fail 
  */
 function bluetoothPrinting(deviceId, serviceId, characteristicId, bufferstr, success, fail) {
   wx.writeBLECharacteristicValue({
     deviceId: deviceId,
     serviceId: serviceId,
     characteristicId: characteristicId,
     value: bufferstr,
     success: function (res) {
       success(res);
     },
     failed: function (res) {
       fail(res)
       console.log("数据发送失败:" + JSON.stringify(res))
     },
     complete: function (res) {
       console.log("发送完成:" + JSON.stringify(res))
     }
   })
 }

 function getUint8Value(e, callback) {
  for (var a = e, i = new DataView(a), n = "", s = 0; s < i.byteLength; s++) {
    n += String.fromCharCode(i.getUint8(s));
    callback(n)
  }
}

 module.exports = {
   openBluetoothAdapter: openBluetoothAdapter,
   stopBluetoothDevicesDiscovery: stopBluetoothDevicesDiscovery,
   startConnectDevices: startConnectDevices,
   bluetoothPrinting: bluetoothPrinting,
   getBluetoothDevices:getBluetoothDevices
 }
//app.js

const httpRequest = require('utils/request.js');

import touch from 'utils/touch.js'//新加

App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())

    wx.setStorageSync('logs', logs)

    // console.log('openid:'+wx.getStorageSync('openid'));
  },
  /**
   * 获取定位授权
   */
  getPermission:function(obj){
    wx.chooseLocation({
      success: function (res) {    
          obj.setData({
            area: res.name,
            latitude: res.latitude,
            longitude: res.longitude
          })                
      },
      fail:function(){
          wx.getSetting({
              success: function (res) {
                  var statu = res.authSetting;
                  if (!statu['scope.userLocation']) {
                      wx.showModal({
                          title: '是否授权当前位置',
                          content: '需要获取您的地理位置，请确认授权，否则地图功能将无法使用',
                          success: function (tip) {
                              if (tip.confirm) {
                                  wx.openSetting({
                                      success: function (data) {
                                          if (data.authSetting["scope.userLocation"] === true) {
                                              wx.showToast({
                                                  title: '授权成功',
                                                  icon: 'success',
                                                  duration: 1000
                                              })
                                              //授权成功之后，再调用chooseLocation选择地方
                                              wx.chooseLocation({
                                                  success: function(res) {
                                                    obj.setData({
                                                      area: res.name,
                                                      latitude: res.latitude,
                                                      longitude: res.longitude
                                                    })     
                                                  },
                                              })
                                          } else {
                                              wx.showToast({
                                                  title: '授权失败',
                                                  icon: 'success',
                                                  duration: 1000
                                              })
                                          }
                                      }
                                  })
                              }
                          }
                      })
                  }
              },
              fail: function (res) {
                  wx.showToast({
                      title: '调用授权窗口失败',
                      icon: 'success',
                      duration: 1000
                  })
              }
          })
      }
  })        
 },


  getUserInfo:function(callback){
    
      wx.getUserInfo({
        withCredentials: true,
        success: function (res) {
          
          var userInfo = res.userInfo;
          // console.log('app:'+JSON.stringify(userInfo));
          httpRequest._post('/uLogin', {
              userInfo: JSON.stringify(userInfo),
              openid: wx.getStorageSync('openid')
            },
            function (res) {
              callback(res.data);
            },
            function (err) {

            })
        }
      })
  },

  getPhoneNumber: function (e, callback) {
    var that = this;
    if (e.detail.errMsg == "getPhoneNumber:ok") {
      var data = {
        iv: e.detail.iv,
        encryptedData: e.detail.encryptedData,
        session_key: wx.getStorageSync('session_key'),
        openid: wx.getStorageSync('openid')
      }
      httpRequest._post('/binding/mobilePhone', data, function (res) {
        
        callback(res.data);
      }, function (err) {

      });
    }
  },

  bezier: function (pots, amount) {
    var pot;
    var lines;
    var ret = [];
    var points;
    for (var i = 0; i <= amount; i++) {
      points = pots.slice(0);
      lines = [];
      while (pot = points.shift()) {
        if (points.length) {
          lines.push(pointLine([pot, points[0]], i / amount));
        } else if (lines.length > 1) {
          points = lines;
          lines = [];
        } else {
          break;
        }
      }
      ret.push(lines[0]);
    }

    function pointLine(points, rate) {
      var pointA, pointB, pointDistance, xDistance, yDistance, tan, radian, tmpPointDistance;
      var ret = [];
      pointA = points[0]; //点击
      pointB = points[1]; //中间
      xDistance = pointB.x - pointA.x;
      yDistance = pointB.y - pointA.y;
      pointDistance = Math.pow(Math.pow(xDistance, 2) + Math.pow(yDistance, 2), 1 / 2);
      tan = yDistance / xDistance;
      radian = Math.atan(tan);
      tmpPointDistance = pointDistance * rate;
      ret = {
        x: pointA.x + tmpPointDistance * Math.cos(radian),
        y: pointA.y + tmpPointDistance * Math.sin(radian)
      };
      return ret;
    }
    return {
      'bezier_points': ret
    };
  },

  globalData: {
    userInfo: null,
    suffix: '￥',
    specification: 'X',
    businessid:1, //商家id
    branchid:2 //分店id 
  },

  touch: new touch()

})



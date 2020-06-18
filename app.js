//app.js

const httpRequest = require('utils/request.js');
import touch from 'utils/touch.js' //新加

App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())

    wx.setStorageSync('logs', logs)

  },


  /**
   * 获取定位授权
   */
  getPermission: function (obj, callback) {
    wx.chooseLocation({
      success: function (res) {

        obj.setData({
          area: res.name,
          latitude: res.latitude,
          longitude: res.longitude
        })
        callback();
      },
      fail: function () {
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
                            success: function (res) {
                              obj.setData({
                                area: res.name,
                                latitude: res.latitude,
                                longitude: res.longitude
                              })
                              callback();
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



  login: function (callback) {
    wx.login({
      success: function (res) {

        if (res.code) {
          var data = {
            code: res.code
          }
          // console.log('获取openid,session_key');
          httpRequest._post('/auth',
            data,
            function (res) {
              wx.setStorageSync('openid', res.data.openid);
              wx.setStorageSync('session_key', res.data.session_key);

              callback();
            },
            function (err) {

            }, true)
        }
      }
    })
  },

  getUserInfo: function (e, callback) {
    this.getOpenid(function (openid) {

      if (e.detail.userInfo) {
        var userInfo = e.detail.userInfo;
        // console.log(JSON.stringify(userInfo))

        httpRequest._post('/uLogin', {
            userInfo: JSON.stringify(userInfo),
            openid: openid
          },
          function (res) {
            wx.setStorageSync('userInfo', res.data);
            callback(e);
          },
          function (err) {

          }, true)
      }
    })
  },


  makePhoneCall: function (phoneNumber) {
    wx.makePhoneCall({
      phoneNumber: phoneNumber,
    })
  },
  /**
   * 
   * @param {商家登录} callback 
   */
  merchantLogin: function (callback) {
    this.getOpenid(function (openid) {
      httpRequest._post('/bLogin', {
          openid: openid
        },
        function (res) {
          if (res.data.err == 0) {
            wx.setStorageSync('userInfo', res.data.data);
          } else {
            wx.showToast({
              title: '无权限',
              icon: 'success',
              duration: 1500
            })
          }
          callback(res.data)
        },
        function (err) {

        })
    })
  },

  getBUserInfo() {
    var userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      wx.navigateTo({
        url: '/pages/meal/blogin/blogin'
      });
    } else {
      return userInfo
    }
  },

  setNavigationBarTitle(name) {
    wx.setNavigationBarTitle({
      title: name
    })
  },

  /**
   * 支付   tradeno 商户号，total_fee金额，body主题 callback回调函数
   */
  pay: function (tradeno, total_fee, body, callback) {
    var that = this;
    this.getOpenid(function (openid) {
      httpRequest._post('/weChatPay/doUnifiedOrder', {
        tradeno: tradeno,
        total_fee: total_fee,
        body: body,
        openid: openid
      }, function (res) {
        that.payApi(res.data, callback)

      }, function (err) {

      }, true)
    })
  },

  payApi: function (param, callback) {
    wx.requestPayment({
      timeStamp: param.timeStamp,
      nonceStr: param.nonceStr,
      package: param.package,
      signType: 'MD5',
      paySign: param.paySign,
      success: function (res) {
        console.log("支付成功")
      },
      fail: function (res) {
        console.log("支付失败")
        wx.showModal({
          title: '提示',
          content: '支付取消'
        });
      },
      complete: function (res) {
        if (res.errMsg == 'requestPayment:ok') {
          callback()
        } else {

        }
      }
    })
  },





  getPhoneNumber: function (e, callback) {
    var that = this;

    if (e.detail.errMsg == "getPhoneNumber:ok") {

      this.login(function () {
        var openid = wx.getStorageSync('openid');
        var session_key = wx.getStorageSync('session_key')
        // console.log('session_key:'+session_key);
        var data = {
          iv: e.detail.iv,
          encryptedData: e.detail.encryptedData,
          session_key: session_key,
          openid: openid
        }
        httpRequest._post('/binding/mobilePhone', data, function (res) {

          callback(res.data);
        }, function (err) {

        }, true);
      })
    }
  },
  getOpenid: function (callback) {
    var openid = wx.getStorageSync('openid');
    // console.log('openid:'+openid)
    if (!openid) {
      this.login(function () {
        // console.log('openid:' + openid)
        openid = wx.getStorageSync('openid');
        callback(openid);
      })
    } else {
      callback(openid);
    }
  },
  /**
   * 
   * @param {获取商家配置信息} callback 
   */
  findByBbranch: function (callback, id) {

    httpRequest._post('/business/findByBbranch', {
      id: id
    }, function (res) {
      callback(res.data)
    }, function (err) {

    }, true)
  },


  getUserLocation(callback) {
    var that = this;
    wx.getLocation({
      // type: 'gcj02',//默认wgs84
      success: function (location) {
        that.globalData.location = location;
        // console.log(location);
        if (callback) {
          callback(location);
        }
      },
      fail: function () {
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
                            success: function (res) {
                              obj.setData({
                                area: res.name,
                                latitude: res.latitude,
                                longitude: res.longitude
                              })
                              callback();
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

  /**
   * 验证商家与你的距离
   */
  verificationLocation(callback) {
    var that = this;
    this.findByBbranch(function (e) {
      var la1 = e.latitude;
      var lo1 = e.longitude;
      if (that.globalData.location) {
        var la2 = that.globalData.location.latitude;
        var lo2 = that.globalData.location.longitude;
        var dis = that.distance(la1, lo1, la2, lo2);
        callback(dis);
      } else {
        wx.showModal({
          title: '提示',
          content: '请打允许微信定位'
        });
      }

    }, that.globalData.branchid)
  },

  /**
   * 计算距离
   */
  distance: function (la1, lo1, la2, lo2) {
    var La1 = la1 * Math.PI / 180.0;
    var La2 = la2 * Math.PI / 180.0;
    var La3 = La1 - La2;
    var Lb3 = lo1 * Math.PI / 180.0 - lo2 * Math.PI / 180.0;
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(La3 / 2), 2) + Math.cos(La1) * Math.cos(La2) * Math.pow(Math.sin(Lb3 / 2), 2)));
    s = s * 6378.137;
    s = Math.round(s * 10000) / 10000;
    s = s.toFixed(2);
    return s;
  },


  pagingAlgorithm: function (pageNum, pageSize) {
    return (pageNum - 1) * pageSize;
  },

  voicebroadcast: function (url, title, Csuccess) {
    wx.playBackgroundAudio({
      dataUrl: url,
      title: title,
      coverImgUrl: '',
      success(res) {
        Csuccess()
      },
      fail(res) {

      }
    })
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
    businessid: 1, //商家id
    branchid: 1 //分店id 
  },

  touch: new touch()

})
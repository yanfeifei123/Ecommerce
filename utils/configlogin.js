import baseurl from 'baseurl.js'

function login(callback) {

  wx.login({
    success: res => {
      // 发送 res.code 到后台换取 openId, sessionKey, unionId
      if (res.code) {
        var data = {
          code: res.code
        }
        wx.request({
          method: 'POST',
          url: baseurl + '/auth',
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          data: data,
          success: res => {
            wx.setStorageSync('openid', res.data.openid);
            wx.setStorageSync('session_key', res.data.session_key);
            wx.setStorageSync('token', res.data.token);
            console.log('configlogin:openid session_key token')
            callback(res.data.openid)
          },
          fail: err => {

          },
          complete: info => {

          }

        })
      }
    }
  })
}

module.exports = {
  login: login
}
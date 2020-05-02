import baseurl from 'baseurl.js'

const configlogin = require('configlogin.js');

const http = (method, url, data, response, error) => {

  wx.showLoading({
    title: '正在玩命加载中...',
    mask: true
  })

  wx.request({
    method: method,
    url: baseurl + url,
    header: {
      'content-type': 'application/x-www-form-urlencoded',
      'Authorization': 'Bearer' + wx.getStorageSync("token")
    },
    data: data,
    success: res => {
      if (res.header['sessionstatus'] == 'tokenexpired') {
        console.log('token过期')
        configlogin.login(function(openid){
          return response(res)
        })
      }else{
        return response(res)
      }
    },
    fail: err => {
      return error(err)
    },
    complete: info => {
      wx.hideLoading();
    }
  })
}





module.exports = {
  _get: (url, data, response, error) => http('GET', url, data, response, error),
  _post: (url, data, response, error) => http('POST', url, data, response, error),
  _put: (url, data, response, error) => http('PUT', url, data, response, error),
  _delete: (url, data, response, error) => http('DELETE', url, data, response, error),
}
import baseurl from 'baseurl.js'

// const configlogin = require('configlogin.js');

const http = (method, url, data, response, error,isShowLoading) => {
  // console.log(method)
  if(isShowLoading){
    wx.showLoading({
      title: '正在玩命加载中...',
      mask: true
    })
  }
  

  wx.request({
    method: method,
    url: baseurl.baseurl + url,
    header: {
      'content-type': 'application/x-www-form-urlencoded',
      // 'content-type': 'application/json',
      // 'Authorization': 'Bearer' + wx.getStorageSync("token")
    },
    data: data,
    success: res => {
      // if (res.header['sessionstatus'] == 'tokenexpired') {
      //   console.log('token过期')
      //   configlogin.login(function(openid){
      //     return response(res)
      //   })
      // }else{
      //   return response(res)
      // }
      return response(res)
    },
    fail: err => {
      return error(err)
    },
    complete: info => {
      if(isShowLoading){
         wx.hideLoading();
      }
    }
  })
}





module.exports = {
  _get: (url, data, response, error,isShowLoading) => http('GET', url, data, response, error,isShowLoading),
  _post: (url, data, response, error,isShowLoading) => http('POST', url, data, response, error,isShowLoading),
  _put: (url, data, response, error,isShowLoading) => http('PUT', url, data, response, error,isShowLoading),
  _delete: (url, data, response, error,isShowLoading) => http('DELETE', url, data, response, error,isShowLoading),
}
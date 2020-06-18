// pages/meal/blogin/blogin.js

const CryptoJS = require('../../../utils/aes.js');
const httpRequest = require('../../../utils/request.js');
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sessionKey: '',
    iv: '',
    account: '',
    password: '',
    error: '',
    pwd: '',
    userInfo: {}
  },


  setaccount: function (e) {
    this.setData({
      account: e.detail.value
    })
  },

  setpassword: function (e) {
    this.setData({
      password: e.detail.value
    })
  },

  submitbLogin: function (e) {
     
    if (wx.getStorageSync('userInfo')) {
      app.merchantLogin(function (data) {
        if (data.err == 0) {
          wx.setStorageSync('userInfo', data.data);
          wx.reLaunch({
            url: '/pages/business/tabBar/tabBar'
          })
        }
      })
    }else{
      wx.navigateTo({
        url: '/pages/login/login'
      })
    }

  },
  /**
   * 解密
   *  
   */
  Decrypt: function (word, key, iv) {
    var encryptedHexStr = CryptoJS.enc.Hex.parse(word);
    var srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
    var decrypt = CryptoJS.AES.decrypt(srcs, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    var decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
    return decryptedStr.toString();
  },
  /**
   * 加密
   *  
   */
  Encrypt: function (word, key, iv) {
    key = CryptoJS.enc.Utf8.parse(key);
    iv = CryptoJS.enc.Utf8.parse(iv);
    var srcs = CryptoJS.enc.Utf8.parse(word);
    var encrypted = CryptoJS.AES.encrypt(srcs, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.ciphertext.toString().toUpperCase();
  },



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    wx.getSystemInfo({
      success: function (res) {
        var height = res.windowHeight;
        that.setData({
          height: height
        })
      }
    });
    if (!wx.getStorageSync('userInfo')) {
      wx.navigateTo({
        url: '/pages/login/login'
      })
    } else {
      this.setData({
        userInfo: wx.getStorageSync('userInfo')
      })
    }
  },

  setUserInfo(){
    this.setData({
      userInfo: wx.getStorageSync('userInfo')
    })
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
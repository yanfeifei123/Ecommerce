// pages/meal/blogin/blogin.js

const CryptoJS = require('../../../utils/aes.js');
const httpRequest = require('../../../utils/request.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sessionKey: '',
    iv: '',
    account: '',
    password: '',
    error: ''
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

    if (this.data.password == '' || this.data.account == '') {
      this.setData({
        error: '账号密码不能为空！'
      })
    } else {
      var a = this.Encrypt(this.data.account, this.data.sessionKey, this.data.iv);
      var p = this.Encrypt(this.data.password, this.data.sessionKey, this.data.iv);
      var that = this;
      var sessionKey = this.data.sessionKey;
      var iv = this.data.iv;
      httpRequest._post('/bLogin', {account:a,password:p,sessionKey:sessionKey,iv:iv},
        function (res) {
          console.log('res:'+JSON.stringify(res.data));
            if(res.data.err==0){
              wx.setStorageSync('token', res.header['Authorization']);
              wx.setStorageSync('userInfo', res.data.data);
              wx.reLaunch ({
                url: '/pages/business/tabBar/tabBar'
              })
            }else{
              that.setData({
                error:res.data.data
              })
            }
        },
        function (err) {

        })
    }

    // wx.reLaunch ({
    //   url: '/pages/business/tabBar/tabBar'
    // })
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
    key=CryptoJS.enc.Utf8.parse(key);
    iv=CryptoJS.enc.Utf8.parse(iv);
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
    var that = this;
    httpRequest._post('/bauth', {},
      function (res) {
        console.log('bauth:'+JSON.stringify(res.data));
        that.data.sessionKey =   res.data.sessionKey;
        that.data.iv = res.data.iv
         
        console.log('sessionKey:' + that.data.sessionKey + '   iv:' + that.data.iv)
        
      },
      function (err) {

      })
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
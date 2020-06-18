 // 门店管理

 const httpRequest = require('../../../utils/request.js');
 var app = getApp()
 Page({

   /**
    * 页面的初始数据
    */
   data: {
     height: 0,
     area: '',
     latitude: 0,
     longitude: 0,
     bbranch: {
       id: '',
       area: '',
       detailed: '',
       latitude: '',
       longitude: '',
       name: '',
       firstmoney: '',
       firstorder: '',
       psfcost: '',
       phone: '',
       isps: 0
     }
   },

   getArea: function (e) {
     var that = this;
     app.getPermission(that, function () {
       var bbranch = that.data.bbranch;
       bbranch.area = that.data.area;
       bbranch.latitude = that.data.latitude;
       bbranch.longitude = that.data.longitude;
       that.setData({
         bbranch: bbranch
       })
       //  console.log(JSON.stringify(bbranch))
     });
   },

   getPhoneNumber: function (e) {
     var that = this;

     app.getPhoneNumber(e, function (data) {
       var bbranch = that.data.bbranch;
       bbranch.phone = data.phone;
       that.setData({
         bbranch: bbranch
       })
     })
   },

    
   setisps: function (e) {
     var v = e.detail.value;


     if (v.length == 0) {
       this.data.bbranch.isps = 0;
     } else {
       this.data.bbranch.isps = 1;
     }
     //  console.log(JSON.stringify(this.data.bbranch))
   },

   /**
    * 生命周期函数--监听页面加载
    */
   onLoad: function (options) {
     var that = this;
     wx.getSystemInfo({
       success: function (res) {
         that.setData({
           height: res.windowHeight
         })
       }
     });
     app.setNavigationBarTitle('门店管理')

     var userInfo = app.getBUserInfo();

     app.findByBbranch(function (bbranch) {
       that.setData({
         bbranch: bbranch
       })
     }, userInfo.branchid);
   },

   setattrbbranch: function (e) {
     var bbranch = this.data.bbranch;
     bbranch[e.target.id] = e.detail.value;
     this.setData({
       bbranch: bbranch
     })
   },

   submitbbranch: function (e) {

     if (this.data.bbranch.area == '' || this.data.bbranch.detailed == '' || this.data.bbranch.name == '' || this.data.bbranch.phone == '') {
       wx.showModal({
         title: '提示',
         content: '带*号必须填写',
         showCancel: false
       })
       return;
     }

     if (!/^1(3|4|5|7|8)\d{9}$/.test(this.data.bbranch.phone)) {
       wx.showModal({
         title: '提示',
         content: '你输入的电话不符，请重新检查填写',
         showCancel: false
       })
       return;
     }
     var that = this;
     httpRequest._post('/business/updateBbranch', {
         bbranch: JSON.stringify(that.data.bbranch)
       },
       function (res) {
         wx.navigateBack({
           delta: 1,
           complete: function () {

           }
         })
       },
       function (err) {

       }, true)


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
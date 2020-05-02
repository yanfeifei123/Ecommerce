 const httpRequest = require('../../../utils/request.js');


 var app = getApp();

 Page({

   /**
    *   用户收货地址
    */
   data: {
     uaddress: []
   },

   adduaddress: function (e) {
     //  console.log('adduaddress')
     wx.navigateTo({
       url: '/pages/meal/adduaddress/adduaddress'
     });

   },
   selectuuaddress: function (e) {
     let pages = getCurrentPages();
     let prevpage = pages[pages.length - 2];
     if( prevpage.route=='pages/meal/tabBar/tabBar'){
       return;
     }
     var id = e.currentTarget.dataset.id;
     httpRequest._post(
       '/selectAddress', {
         id: id
       },
       function (res) {
         console.log('res:' + res.data)
         if (res.data == 1) {

           wx.navigateTo({
             url: '/pages/meal/submitorders/submitorders'
           });
         }
       },
       function (err) {

       }
     )

   },


   touchstart: function (e) {
     let data = app.touch._touchstart(e, this.data.uaddress)
     this.setData({
       uaddress: data
     })
   },

   touchmove: function (e) {
     let data = app.touch._touchmove(e, this.data.uaddress)
     this.setData({
       uaddress: data
     })
   },


   del: function (e) {
     var that = this;
     wx.showModal({
       title: '提示',
       content: '确认要删除此条信息么？',
       success: function (res) {
         if (res.confirm) {
           var uaddres = that.data.uaddress[e.currentTarget.dataset.index];
           httpRequest._post(
             '/delAddress', {
               id: uaddres.id,
               openid: wx.getStorageSync('openid')
             },
             function (res) {
               that.setData({
                 uaddress: res.data
               })
             },
             function (err) {

             }
           )
         } else if (res.cancel) {
           console.log('用户点击取消')
         }
       }
     })
   },

   updateu_address: function (e) {
     //  console.log('e:' + e.currentTarget.dataset.id);
     wx.navigateTo({
       url: '/pages/meal/edituaddress/edituaddress?id=' + e.currentTarget.dataset.id
     });

   },

   noneEnoughPeople: function (e) {
     console.log('啥也不干就行，空函数哈哈哈');
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
      // this.setData({
      //   uaddress: require('../../../utils/Uaddress.js')
      // })
     var that = this;
     httpRequest._post(
       '/findByUaddress', {
         openid: wx.getStorageSync('openid')
       },
       function (res) {
         //  console.log('uaddress:' + JSON.stringify(res.data))
         that.setData({
           uaddress: res.data
         })
       },
       function (err) {

       }
     )

     
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
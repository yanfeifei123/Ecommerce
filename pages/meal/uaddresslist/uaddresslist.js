 const httpRequest = require('../../../utils/request.js');


 var app = getApp();

 Page({

   /**
    *   用户收货地址
    */
   data: {
     uaddress: [],
     submitorders: 0,
     orderid: ''
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
     if (prevpage.route == 'pages/meal/tabBar/tabBar') {
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

       }, true
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
           app.getOpenid(function (openid) {
             httpRequest._post(
               '/delAddress', {
                 id: uaddres.id,
                 openid: openid
               },
               function (res) {
                 that.setData({
                   uaddress: res.data
                 })
               },
               function (err) {

               }, true
             )
           })

         } else if (res.cancel) {
           console.log('用户点击取消')
         }
       }
     })
   },
   radioChange: function (e) {
     var id = e.detail.value
     var orderid = this.data.orderid;
    //  console.log('orderid:'+orderid);
     if(!orderid){
      this.selectAddress(id);
     }else{
      this.updateAddress(id);
     }
   },

   updateAddress(id){
    var orderid = this.data.orderid;
    httpRequest._post(
      '/updateAddress', {
        uaddressid: id,
        orderid: orderid
      },
      function (res) {
        if (res.data) {
          let pages = getCurrentPages();
          let prevpage = pages[pages.length - 2];
          var url = '/' + prevpage.route;
          console.log('url:'+url)
          wx.navigateBack({
            delta: 2,
            complete: function () {
              wx.navigateTo({
                url: '/pages/meal/orderd/orderd?orderid=' + orderid
              })
            }
          })
        }
      },
      function (err) {

      }, true
    )
   },

   selectAddress:function(id){
    httpRequest._post(
      '/selectAddress', {
        id: id
      },
      function (res) {
        if (res.data) {
          let pages = getCurrentPages();
          let prevpage = pages[pages.length - 2];
          var url = '/' + prevpage.route;
          console.log('url:' + url);
          wx.navigateBack({
            delta: 1,
            complete: function () {
              if (url.indexOf('submitorders') != -1) {
                prevpage.onLoad();
              }
            }
          })
        }
      },
      function (err) {

      }, true
    )
   },

   updateu_address: function (e) {
     //  console.log('e:' + e.currentTarget.dataset.id);
     wx.navigateTo({
       url: '/pages/meal/edituaddress/edituaddress?id=' + e.currentTarget.dataset.id ||  e.target.dataset.id
     });

   },

   noneEnoughPeople: function (e) {
     console.log('啥也不干就行，空函数哈哈哈');
   },

   /**
    * 生命周期函数--监听页面加载
    */
   onLoad: function (options) {
    //  console.log(JSON.stringify(options))
     if (options.submitorders) {
       this.setData({
         submitorders: options.submitorders
       })
     }
     if (options.orderid) {
       this.setData({
         orderid: options.orderid
       })
     }

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
     app.getOpenid(function (openid) {
       httpRequest._post(
         '/findByUaddress', {
           openid: openid
         },
         function (res) {
           that.setData({
             uaddress: res.data
           })
         },
         function (err) {

         }, true
       )
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
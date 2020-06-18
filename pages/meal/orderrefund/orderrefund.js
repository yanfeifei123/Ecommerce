 /**  订单退款描述 */
 import baseurl from '../../../utils/baseurl.js'
 const httpRequest = require('../../../utils/request.js');
 var app = getApp()
 Page({

   /**
    * 页面的初始数据
    */
   data: {
     baseurl: baseurl.baseurl,
     suffix: '￥',
     specification: 'X',
     orderDetail: {},
     imgList: [],
     uorderr: {
       id: '',
       buildtime: '',
       openid: '',
       orderid: '',
       reason: '',
       url: '',
       userid: '',
       agree: 0
     },
     urllength: 0,
     timer: null
   },

   bindTextAreaBlur(e) {
     var uorderr = this.data.uorderr;
     uorderr.reason = e.detail.value;
     this.data.uorderr = uorderr;
   },

   ChooseImage() {
     wx.chooseImage({
       count: 4, //默认9
       sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
       sourceType: ['album', 'camera'], //从相册选择
       success: (res) => {
         if (this.data.imgList.length != 0) {
           this.setData({
             imgList: this.data.imgList.concat(res.tempFilePaths)
           })
         } else {
           this.setData({
             imgList: res.tempFilePaths
           })
         }
       }
     });
   },

   DelImg(e) {
     wx.showModal({
       title: '提示',
       content: '确定要删除吗？',
       cancelText: '取消',
       confirmText: '确定',
       success: res => {
         if (res.confirm) {
           this.data.imgList.splice(e.currentTarget.dataset.index, 1);
           this.setData({
             imgList: this.data.imgList
           })
         }
       }
     })
   },

   submitUorderr(e) {
     var reason = this.data.uorderr.reason;
     if(reason==''){
      wx.showModal({
        title: '提示',
        content: '填写退款原因',
        showCancel: false
      })
      return;
     }

     wx.showLoading({
       title: '正在玩命加载中...',
       mask: true
     })
     var imgList = this.data.imgList;
     var that = this;
     this.setUorderr(function () {
       if (imgList.length != 0) {
         var url = imgList[0];

         that.uploadFileUorderr(url, that.data.uorderr, function () {
           for (var i = 1; i < imgList.length; i++) {
             that.uploadFileUorderr(imgList[i], that.data.uorderr, function () {});
           }
         });

         that.data.timer = setInterval(function () {
           console.log(that.data.urllength + '  ' + imgList.length)
           if (that.data.urllength = imgList.length) {
             clearInterval(that.data.timer);
             wx.navigateBack({
               delta: 2,
               success: function () {
                 wx.hideLoading();
                 wx.navigateTo({
                   url: '/pages/meal/orderrefundp/orderrefundp?orderDetail=' + JSON.stringify(that.data.orderDetail) + '&find=1'
                 })
               }
             })
           }
         }, 2000)
       } else {
         that.updateUorderr();
       }
     })
   },
   updateUorderr() {
     var that = this;
     httpRequest._post('/weChatPay/uorderrRefundnofile', {
       uorderr: JSON.stringify(that.data.uorderr)
     }, function (res) {
       wx.navigateBack({
         delta: 2,
         success: function () {
           wx.hideLoading();
           wx.navigateTo({
             url: '/pages/meal/orderrefundp/orderrefundp?orderDetail=' + JSON.stringify(that.data.orderDetail) + '&find=1'
           })
         }
       })
     }, function (err) {

     }, true)
   },



   uploadFileUorderr(filePath, uorderr, callback) {
     //  console.log('多个文件上传:'+JSON.stringify(this.data.imgList))
     var that = this;
     wx.uploadFile({
       url: baseurl.baseurl + '/weChatPay/uorderrRefund', //仅为示例，非真实的接口地址
       filePath: filePath,
       name: 'file',
       header: {
         'Content-Type': 'multipart/form-data'
       },
       formData: {
         'uorderr': JSON.stringify(uorderr)
       },
       success(res) {
         var obj = JSON.parse(res.data)
         if (obj) {
           that.data.uorderr = obj;
           that.data.urllength += 1;
           callback();
         }
       }
     })
   },


   setUorderr(callback) {
     var uorderr = this.data.uorderr;
     var that = this;
     app.getOpenid(function (openid) {
       uorderr.openid = openid;
       uorderr.orderid = that.data.orderDetail.orderid;
       that.data.uorderr = uorderr;

       callback()
     })
   },
   cancel(e) {
     wx.navigateBack({
       delta: 1,
       complete: function () {

       }
     })
   },


   /**
    * 生命周期函数--监听页面加载
    */
   onLoad: function (options) {
     this.setData({
       orderDetail: JSON.parse(options.orderDetail)
     })
     var that = this;
     wx.getSystemInfo({
       success: function (res) {
         that.setData({
           scrollheight: res.windowHeight - 30
         })
       }
     });
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
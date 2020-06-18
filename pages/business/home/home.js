// pages/business/home/home.js

const httpRequest = require('../../../utils/request.js');
import baseurl from '../../../utils/baseurl.js'
var app = getApp()

Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },


  /**
   * 组件的初始数据
   */
  data: {
    suffix: app.globalData.suffix,
    orderSummary: null,
    orderSummaryitem: 1,
    orderisNotNum: 0,
    bornot: true
  },

  /**
   * 组件的方法列表
   */
  methods: {

    initNavigationBarTitle() {
      app.setNavigationBarTitle('商家后台')
    },

    findBybornot() {
      var that = this;
      var userInfo = wx.getStorageSync('userInfo');
      httpRequest._post('/business/findBybornot', {
        branchid: userInfo.branchid
      }, function (res) {
        if (res.data) {
          var bornot = res.data.bornot == 0 ? false : true;
          that.setData({
            bornot:bornot
          })
        }
      }, function (err) {

      }, true)
    },
    commuteChange(e) {
      var checkedValue = e.detail.value;
      var url = '';
      var title = '';
      var bornot = 0;
      if (checkedValue) {
        bornot = 1;
        url = baseurl.baseurl + '/static/voice/startedbusiness.mp3',
          title = '开始营业了';
      } else {
        url = baseurl.baseurl + '/static/voice/finishedwork.mp3',
          title = '下班收工了'
      }

      app.voicebroadcast(url, title, function () {
        console.log(title);
        var userInfo = wx.getStorageSync('userInfo');
        httpRequest._post('/business/setbranchbornot', {
          branchid: userInfo.branchid,
          bornot: bornot
        }, function (res) {

        }, function (err) {

        }, true)
      });
    },



    findByOrderSummary(orderSummaryitem) {
      // console.log('orderSummaryitem:'+orderSummaryitem)
      var that = this;

      var userInfo = app.getBUserInfo();

      httpRequest._post('/border/findByOrderSummary', {
        branchid: userInfo.branchid,
        orderSummaryitem: orderSummaryitem
      }, function (res) {
        that.setData({
          orderSummary: res.data
        })
      }, function (err) {

      }, true)
    },





    findByOrderSummaryitem(e,id) {
      // console.log('e:'+JSON.stringify(e));
      var orderSummaryitem = ''
      if(e){
        orderSummaryitem = e.target.dataset.id  
      }else{
        orderSummaryitem=id;
      }
       

      this.findByOrderSummary(orderSummaryitem);


      this.setData({
        orderSummaryitem: orderSummaryitem
      })
    },

    findByIsNotOrderComplete() {
      var that = this;
      var userInfo = wx.getStorageSync('userInfo');

      httpRequest._post('/border/findByIsNotOrderComplete', {
        branchid: userInfo.branchid

      }, function (res) {
        // console.log('订单未完成：'+res.data);
        that.setData({
          orderisNotNum: res.data
        })

      }, function (err) {

      }, true)
    },

    viewOrderPage() {
      wx.navigateTo({
        url: '/pages/business/orderm/orderm'
      })
    },
    viewMdPage(){
      wx.navigateTo({
        url: '/pages/business/mdgl/mdgl'
      })
    },

    viewbluetooth:function(e){
      wx.navigateTo({
        url: '/pages/business/bluetooth/bluetooth'
      })
    },

    employee(e){
      wx.navigateTo({
        url: '/pages/business/employee/employee'
      })
    }
  },

  ready() {
    this.findBybornot();
    this.initNavigationBarTitle();
    this.findByOrderSummaryitem(null,1);
    this.findByIsNotOrderComplete();
  }
})
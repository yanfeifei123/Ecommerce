// pages/business/home/home.js

const httpRequest = require('../../../utils/request.js');
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
    suffix:app.globalData.suffix
  },

  /**
   * 组件的方法列表
   */
  methods: {

  },

  ready() {
    wx.setNavigationBarTitle({
      title: '商家后台' 
    })
  }
})

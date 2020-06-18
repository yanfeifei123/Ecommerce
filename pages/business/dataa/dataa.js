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
    clickObj:{}
  },

  /**
   * 组件的方法列表
   */
  methods: {

    initdataana(){
      var that = this;
      httpRequest._post('/dataana/samedayclick', {
        
      }, function (res) {
        if (res.data) {
          // console.log(JSON.stringify(res.data))
          that.setData({
            clickObj:res.data
          })
        }
      }, function (err) {

      }, true)
    },
    dataanafx(e){
      wx.showModal({
        title: '提示',
        content: '正在建设中',
        showCancel: false
      })
    }
  },
  ready(){
    app.setNavigationBarTitle('数据分析');
    this.initdataana();
  }
})

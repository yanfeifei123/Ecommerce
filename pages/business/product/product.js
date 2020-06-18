// pages/business/product/product.js
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
    baseurl: baseurl.baseurl,
    height: 0,
    bcategorys: [],
    bproducts: [],
    bproduct: { //商品对象
      id: '',
      businessid: '',
      categoryid: '',
      memberprice: '',
      name: '',
      price: '',
      packages: 0,
      branchid: '',
      bproductsitems: [],
      imagepath: ''
    },
    selectbcategoryid: '',
    suffix: app.globalData.suffix,
    categoryopt: false,
    bcategoryisdel: false,
    bproductshow: false,
    bcategory: {
      name: '',
      odr: ''
    },
    tempFilePaths: [],
    delsrc: '/images/busin/imgadd.png',
    searchValue: ''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    getPageHeight() {
      var that = this;
      wx.getSystemInfo({
        success: function (res) {
          var height = res.windowHeight - 50 - 40.5 - 50;
          that.setData({
            height: height
          })
        }
      });
    },
    setNavigationBarTitle() {
      app.setNavigationBarTitle('商品信息管理')
    },

    findByBproduct(e, categoryid) {
      var that = this;

      var id = '';
      if (e) {
        id = e.target.dataset.id
      } else {
        id = categoryid
      }

      this.selectbcategory(id);

      httpRequest._post('/business/findByBproduct', {
        categoryid: id,
        searchValue: that.data.searchValue
      }, function (res) {

        that.setData({
          bproducts: res.data,
          selectbcategoryid: id,
          categoryopt: false,
          bproductshow: false
        })
      }, function (err) {

      }, true)


      this.setData({
        selectbcategoryid: id
      })
    },
    findByBcategory() {
      var that = this;
      var userInfo = app.getBUserInfo();
      var searchValue = this.data.searchValue;
      httpRequest._post('/business/findByBcategory', {
        branchid: userInfo.branchid,
        searchValue: searchValue
      }, function (res) {
        var selectbcategoryid = '-1';
        if (res.data.length != 0) {
          selectbcategoryid = res.data[0].id;
          that.setData({
            bcategorys: res.data,
            selectbcategoryid: selectbcategoryid
          })
        }
        // console.log('selectbcategoryid:'+selectbcategoryid)
        that.findByBproduct(null, selectbcategoryid);
      }, function (err) {

      }, true)
    },

    showbcategory(e) {
      var bcategory = this.data.bcategory;
      bcategory.id = '';
      bcategory.name = '';
      bcategory.odr = 0;
      this.setData({
        categoryopt: true,
        bproductshow: false,
        bcategory: bcategory,
        bcategoryisdel: false
      })
    },

    hidebcategory(e) {
      this.setData({
        categoryopt: false
      })
    },

    bcategoryattr(e) {
      //  console.log(JSON.stringify(e))
      var bcategory = this.data.bcategory;
      if (e.target.id == 'cname') {
        bcategory.name = e.detail.value;
      } else if (e.target.id == 'codr') {
        bcategory.odr = e.detail.value;
      }
      this.setData({
        bcategory: bcategory
      })

    },

    searchfValue(e) {
      this.setData({
        searchValue: e.detail.value
      })
      this.findByBcategory();

    },


    //提交商品类型
    submitbcategory(e) {
      var that = this;
      var userInfo = app.getBUserInfo();
      var bcategory = this.data.bcategory;
      if (bcategory.name == '' || bcategory.odr == '') {
        wx.showToast({
          title: '填写分类名称或序号!',
          icon: 'success',
          duration: 1500
        })
        return;
      }
      bcategory.businessid = app.globalData.businessid;
      bcategory.branchid = userInfo.branchid;

      var str = JSON.stringify(bcategory);
      // console.log(str)
      httpRequest._post('/business/updatebcategory', {
        bcategory: str
      }, function (res) {
        // console.log(JSON.stringify(res.data.data));
        if (res.data.code == 1) {

          that.setData({
            bcategorys: res.data.data.bcategories,
            selectbcategoryid: res.data.data.id,
            categoryopt: false
          })
          that.findByBproduct(null, res.data.data.id)

        } else {
          wx.showToast({
            title: '更新失败！',
            icon: 'success',
            duration: 1500
          })
        }

      }, function (err) {

      }, true)
    },
    editbcategory(e) {
      var id = e.target.dataset.id
      this.selectbcategory(id);
      this.setData({
        categoryopt: true,
        bcategoryisdel: true
      })
    },
    /**
     * 
     * @param {选中类别} id 
     */
    selectbcategory(id) {
      var bcategory = {};
      var bcategorys = this.data.bcategorys;
      for (var i = 0; i < bcategorys.length; i++) {
        var item = bcategorys[i];
        if (item.id == id) {
          bcategory.id = item.id;
          bcategory.name = item.name;
          bcategory.odr = item.odr;
          this.setData({
            bcategory: bcategory
          })
          break;
        }
      }
    },

    deletebcategory(e) {
      var that = this;
      var bcategory = this.data.bcategory;

      wx.showModal({
        title: '提示',
        content: '确认要删除此条信息么？',
        success: function (res) {
          if (res.confirm) {
            httpRequest._post('/business/deletebcategory', {
              bcategoryid: bcategory.id
            }, function (res) {

              if (res.data == 1) {
                that.setData({
                  categoryopt: false
                })
                that.findByBcategory();
              } else {
                wx.showToast({
                  title: '先删除商品',
                  icon: 'success',
                  duration: 1500
                })
              }

            }, function (err) {

            }, false)

          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    },

    showbproduct(e) {
      var bproduct = {
        id: '',
        businessid: '',
        categoryid: '',
        memberprice: '',
        name: '',
        price: '',
        packages: 0,
        branchid: '',
        bproductsitems: [],
        imagepath: ''
      };

      this.setData({
        categoryopt: false,
        bproductshow: true,
        bproduct: bproduct,
        tempFilePaths: []
      })
    },

    hidebproduct(e) {
      this.setData({
        bproductshow: false,
        tempFilePaths: []
      })
    },

    chooseImage(e) {
      // console.log(JSON.stringify(e))
      var that = this;
      wx.chooseImage({
        sizeType: ['original', 'compressed'], //可选择原图或压缩后的图片
        sourceType: ['album', 'camera'], //可选择性开放访问相册、相机
        success: res => {
          var item = res.tempFilePaths[0];
          var tempFilePaths = new Array();
          tempFilePaths.push(item);
          var bproduct = this.data.bproduct;
          bproduct.imagepath = item;
          that.setData({
            tempFilePaths: tempFilePaths,
            bproduct: bproduct
          })
        }
      })
    },
    bproductattr(e) {
      var bproduct = this.data.bproduct;

      if (e.target.id == 'price' || e.target.id == 'memberprice') {
        this.formatNum(e);
        bproduct[e.target.id] = parseFloat(e.detail.value).toFixed(2);
      } else {
        bproduct[e.target.id] = e.detail.value;
      }
      this.setData({
        bproduct: bproduct
      })
    },
    /**
     * 
     * @param {商品提交} e 
     */
    submitBproduct(e) {
      // debugger
      var that = this;
      var bproduct = this.data.bproduct;
      bproduct.businessid = app.globalData.businessid;
      var userInfo = app.getBUserInfo();
      bproduct.branchid = userInfo.branchid;
      bproduct.categoryid = this.data.bcategory.id;
      if (!bproduct.categoryid || !bproduct.name || !bproduct.price || !bproduct.memberprice) {
        wx.showToast({
          title: '信息不全',
          icon: 'success',
          duration: 1500
        })
        return;
      } else {
        if (bproduct.price == 'NaN' || bproduct.memberprice == 'NaN') {
          wx.showToast({
            title: '数据不符合规范',
            icon: 'success',
            duration: 1500
          })
          return;
        }
      }
      var tempFilePaths = this.data.tempFilePaths;

      if (tempFilePaths.length == 0) {
        this.updatebproduct(bproduct);
      } else {
        if (tempFilePaths[0].indexOf('xyfantuan') != -1) {
          this.updatebproduct(bproduct);
        } else {
          this.updatebproductUpLoadFile(userInfo, tempFilePaths, bproduct);
        }
      }

    },

    updatebproductUpLoadFile(userInfo, tempFilePaths, bproduct) {
      console.log('tempFilePaths:' + JSON.stringify(tempFilePaths))

      var that = this;
      wx.uploadFile({
        url: baseurl.baseurl + '/bproduct/updatebproductUpLoadFile', //仅为示例，非真实的接口地址
        filePath: tempFilePaths[0],
        name: 'file',
        header: {
          'Content-Type': 'multipart/form-data'
        },
        formData: {
          'bproduct': JSON.stringify(bproduct),
          'openid': userInfo.openid
        },
        success(res) {
          // console.log(JSON.stringify(res.data))
          var obj = JSON.parse(res.data)
          if (obj.code == 1) {
            wx.showToast({
              title: '数据更新成功！',
              icon: 'success',
              duration: 1500
            })
            that.findByBproduct(null, bproduct.categoryid);
            that.setData({
              bproduct: obj.data
            })
          }
        }
      })
    },

    updatebproduct(bproduct) {
      var that = this;
      httpRequest._post('/bproduct/updatebproduct', {
        bproduct: JSON.stringify(bproduct)
      }, function (res) {
        var msg = '数据更新成功！'
        if (res.data.code == 1) {
          that.findByBproduct(null, bproduct.categoryid);
          that.setData({
            bproduct: res.data.data
          })
        } else {
          msg = '数据更新失败！'
        }
        wx.showToast({
          title: msg,
          icon: 'success',
          duration: 1500
        })
      }, function (err) {

      }, false)
    },

    editproduct(e) {
      var id = e.target.dataset.id
      var bproduct = this.findidbproduct(id);
      // console.log(JSON.stringify(bproduct))
      var tempFilePaths = [];
      if (bproduct.imagepath) {
        tempFilePaths.push(this.data.baseurl + bproduct.imagepath);
      }
      this.setData({
        tempFilePaths: tempFilePaths,
        bproduct: bproduct,
        categoryopt: false,
        bproductshow: true
      })
    },

    findidbproduct(id) {
      var bproducts = this.data.bproducts;
      var bproduct = null;
      for (var i = 0; i < bproducts.length; i++) {
        var item = bproducts[i];
        if (item.id == id) {
          bproduct = item;
          break;
        }
      }
      return bproduct;
    },

    deleteproduct(e) {
      var id = e.currentTarget.dataset.id;
      var bproduct = this.findidbproduct(id);
      var that = this;
      wx.showModal({
        title: '提示',
        content: '确认要删除' + bproduct.name + '？',
        success: function (res) {
          if (res.confirm) {
            httpRequest._post('/bproduct/deleteBproduct', {
              bproductid: id
            }, function (res) {
              if (res.data == 1) {
                that.findByBproduct(null, bproduct.categoryid);
              } else {
                wx.showToast({
                  title: '先删除子类商品',
                  icon: 'success',
                  duration: 1500
                })
              }
            }, function (err) {

            }, false)

          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    },

    choosePackage(e) {
      var id = e.target.dataset.id
      var bproduct = this.findidbproduct(id);

      wx.navigateTo({
        url: '/pages/business/producttc/producttc?categoryid=' + bproduct.categoryid + '&bproductid=' + bproduct.id
      })
    },

    formatNum(e) {
      if (!e.detail.value) {
        return;
      }
      e.detail.value = e.detail.value.replace(/^(\-)*(\d+)\.(\d{6}).*$/, '$1$2.$3')
      e.detail.value = e.detail.value.replace(/[\u4e00-\u9fa5]+/g, ""); //清除汉字
      e.detail.value = e.detail.value.replace(/[^\d.]/g, ""); //清楚非数字和小数点
      e.detail.value = e.detail.value.replace(/^\./g, ""); //验证第一个字符是数字而不是  
      e.detail.value = e.detail.value.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
    }




  },
  ready() {
    this.getPageHeight();
    this.setNavigationBarTitle();
    this.findByBcategory();
  }


})
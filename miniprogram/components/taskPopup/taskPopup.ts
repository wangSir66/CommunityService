// Componet/Componet.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    propArray: {
      type: Array,
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    btnList: [{
      id: 0,
      btnName: '超市代购'
    }, {
      id: 1,
      btnName: '快递代取'
    }, {
      id: 2,
      btnName: '取外卖'
    }, {
      id: 3,
      btnName: '小区遛狗'
    }, {
      id: 4,
      btnName: '扔垃圾'
    }, {
      id: 5,
      btnName: '到店取餐'
    }, {
      id: 6,
      btnName: '生鲜代购'
    }, {
      id: 7,
      btnName: '蛋糕代购'
    }, {
      id: 9,
      btnName: '其他'
    }],
    imageUrl: ""
  },
  /**
   * 组件的方法列表
   */
  methods: {
    addImg() {
      var self = this;
      wx.chooseImage({
        count: 1,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success(res) {
          const tempFilePaths = res.tempFilePaths
          wx.uploadFile({
            url: 'https://example.weixin.qq.com/upload', //仅为示例，非真实的接口地址
            filePath: tempFilePaths[0],
            name: 'file',
            formData: {
              'user': 'test'
            },
            success(res) {
              const data = res.data
              //do something
              self.setData({ imageUrl: data })
            }
          })
        }
      })
    }
  }
})
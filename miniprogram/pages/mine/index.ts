Component({
  /**
   * 组件的初始数据
   */
  data: {
    headUrl:'../../static/rwdt_icon_head.png',
    nickName:'我的名字',
    id:'123555',
  },
  lifetimes: {
    attached() {
      const rect = wx.getMenuButtonBoundingClientRect()
      wx.getSystemInfo({
        success: (res) => {
          const isAndroid = res.platform === 'android'
          const isDevtools = res.platform === 'devtools'
          this.setData({
            safeAreaTop: isDevtools || isAndroid ? `padding-top: ${res.safeArea.top + rect.height}px` : ``
          })
        }
      })
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
  },
})

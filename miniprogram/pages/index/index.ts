Component({
  data: {
    selectArray: [{
      "id": "10",
      "text": "会计类"
    }, {
      "id": "21",
      "text": "工程类"
    }],
    list: [
      {
        indx: 0,
        img: '../../static/rwdt_item_bg.png',
        status: 0,
        time: '12:35',
        name:'超市代购',
        area: '小区名字不超过十个字',
        nickName: '哼着哼着就跑掉了',
        head: ''
      },
      {
        indx: 1,
        img: '../../static/rwdt_item_bg.png',
        status: 0,
        time: '12:35',
        name:'超市代购',
        area: '小区名字不超过十个字',
        nickName: '哼着哼着就跑掉了',
        head: ''
      },
      {
        indx: 2,
        img: '../../static/rwdt_item_bg.png',
        status: 0,
        time: '12:35',
        name:'超市代购',
        area: '小区名字不超过十个字',
        nickName: '哼着哼着就跑掉了',
        head: ''
      },
      {
        indx: 3,
        img: '../../static/rwdt_item_bg.png',
        status: 0,
        time: '12:35',
        name:'超市代购',
        area: '小区名字不超过十个字',
        nickName: '哼着哼着就跑掉了',
        head: ''
      },
      {
        indx: 4,
        img: '../../static/rwdt_item_bg.png',
        status: 0,
        time: '12:35',
        name:'超市代购',
        area: '小区名字不超过十个字',
        nickName: '哼着哼着就跑掉了',
        head: ''
      },
      {
        indx: 5,
        img: '../../static/rwdt_item_bg.png',
        status: 0,
        time: '12:35',
        name:'超市代购',
        area: '小区名字不超过十个字',
        nickName: '哼着哼着就跑掉了',
        head: ''
      }
    ]
  },
  lifetimes: {
    attached() {
      const rect = wx.getMenuButtonBoundingClientRect()
      wx.getSystemInfo({
        success: (res) => {
          const isAndroid = res.platform === 'android'
          const isDevtools = res.platform === 'devtools'
          this.setData({
            innerPaddingRight: `padding-left: ${res.windowWidth - rect.right}px; padding-right: ${res.windowWidth - rect.right}px`,
            safeAreaTop: isDevtools || isAndroid ? `padding-top: ${res.safeArea.top + 5}px` : ``
          })
        }
      })
    },
  },
  methods: {
    onItemBuild(evt: any) {
      console.log('build', evt.detail.index)
    },

    onItemDispose(evt: any) {
      console.log('dispose', evt.detail.index)
    },
  },
})

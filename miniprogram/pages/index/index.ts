Component({
  data: {
    list: [0,1,2,3,4,5,6,7,8,9]
  },
  methods: {
    onItemBuild(evt:any) {
      console.log('build', evt.detail.index)
    },

    onItemDispose(evt:any) {
      console.log('dispose', evt.detail.index)
    },
  },
})

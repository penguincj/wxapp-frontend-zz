Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的属性列表
   */
  properties: {
    list: {
      type: Array,
      value: [],
    },
    selectedId: {
      type: Number,
      value: -1,
    },
    iconline: {
      type: String,
      value: ""
    },
  },
  /**
   * 组件的初始数据
   */
  data: {
    scrollLeft: '0rpx',
    toView: 'green',
    selectId: 1,
    selectName: '',
  },
  lifetimes: {
    created() {
      
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    upper(e: any) {
      console.log(e)
    },

    lower(e: any) {
      console.log(e)
    },

    scroll(e: any) {
      console.log(e)
    },

    selectItem(e: any) {
      console.log('selectItem', e);
      const { id, name } = e.currentTarget.dataset;
        // this.setData({
        //   selectId: id,
        //   selectName: name,
        // });
        this.triggerEvent('ChangeUnit', {
          selectId: id,
          // selectName: name,
        })
    },

    tap() {
      for (let i = 0; i < order.length; ++i) {
        if (order[i] === this.data.toView) {
          this.setData({
            toView: order[i + 1],
            scrollTop: (i + 1) * 200
          })
          break
        }
      }
    },

  },
  pageLifetimes: {
    async show() {
      console.log('this.data.selectId', this.data.selectedId)
      const s_left = (Number(this.data.selectedId - 1) * 110) + 'rpx';
      this.setData({
        scrollLeft: s_left
      })
    }
  }
})

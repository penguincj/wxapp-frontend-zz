Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的属性列表
   */
  properties: {
    title: {
      type: String,
      value: '',
    },
    list: {
      type: Array,
      value: [],
    },
    len: {
      type: Number,
      value: 0,
    },
  },
  /**
   * 组件的初始数据
   */
  data: {
    indicatorDots: true,
    vertical: false,
    autoplay: false,
    interval: 2000,
    duration: 500
  },
  lifetimes: {
    attached() {
      
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    handleClickItem(e: any) {
      const { idx, name } = e.currentTarget.dataset;
      // @ts-ignore
      // this.tracker.report('index_museum_e4', {id: idx, name,});
      this.triggerEvent('ClickItem', {
        id: idx,
      })
    },
    handleClickMore() {
      this.triggerEvent('ClickMore')
    },
  },
})

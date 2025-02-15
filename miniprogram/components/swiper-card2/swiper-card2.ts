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
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    background: ['demo-text-1', 'demo-text-2', 'demo-text-3'],
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
      const { idx } = e.currentTarget.dataset;
      this.triggerEvent('ClickItem', {
        id: idx,
      })
    },
  },
})

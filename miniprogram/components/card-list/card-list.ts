
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
      type: Object,
      value: [] as any,
    },
  },
  /**
   * 组件的初始数据
   */
  data: {
    
  },
  lifetimes: {
    attached() {
      
    },
    detached() {
    },

  },
  pageLifetimes: {
    hide() {
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    handleClickCard(event: any) {
      const { idx } = event.currentTarget.dataset;
      this.triggerEvent('ClickCard', { id: idx });
    }
  },
})

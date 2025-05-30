
Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的属性列表
   */
  properties: {
    leftList: {
      type: Array,
      value: [],
    },
    rightList: {
      type: Array,
      value: [],
    },
    loading: {
      type: Boolean,
      value: false,
    },
    hasMore: {
      type: Boolean,
      value: true,
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    
  },
  lifetimes: {
    attached() {
      
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    handleClose() {
      this.triggerEvent('CloseLoading');
    },

    handleClickItem(e: any) {
      const { idx } = e.currentTarget.dataset;
      this.triggerEvent('ClickItem', {id: idx});
    },
  },
})

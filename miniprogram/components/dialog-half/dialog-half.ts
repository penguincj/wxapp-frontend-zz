
Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的属性列表
   */
  properties: {
    showDialog: {
      type: Boolean,
      value: false,
    },
    showIcon: {
      type: Boolean,
      value: true,
    },
    fullHeight: {
      type: Boolean,
      value: false,
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
      console.log('handleClose')
      this.triggerEvent('CloseDialog');
    }
  },
})

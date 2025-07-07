
Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的属性列表
   */
  properties: {
    showPupup: {
      type: Boolean,
      value: false,
    },
    popupStyle: {
      type: String,
      value: "",
    },
    image: {
      type: String,
      value: ""
    },

  },
  /**
   * 组件的初始数据
   */
  data: {
    scale: 1,
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
      console.log(this.data.scale)
      this.triggerEvent('ClosePopup');
    },
    onScale(e: any) {
      // this.setData({ scale: e.detail.scale });
      console.log("当前缩放比例:", e.detail.scale);
    }
  },
})

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
    currentIdx: {
      type: Number,
      value: 0,
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    indicatorDots: false,
    vertical: false,
    autoplay: false,
    interval: 2000,
    duration: 500,
    current: 0,
  },
  lifetimes: {
    attached() {
      
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    handleChangeItem(event: any) {
      const { current } = event.detail;
      console.log(current);
      this.triggerEvent('SwiperItemChange', {
        current,
      });
    }
  },
})

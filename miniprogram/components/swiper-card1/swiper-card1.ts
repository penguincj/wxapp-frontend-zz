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
    title: {
      type: String,
      value: ''
    },
    dateData: {
      type: Object,
      value: {},
    }

  },
  /**
   * 组件的初始数据
   */
  data: {
    indicatorDots: true,
    vertical: false,
    autoplay: false,
    interval: 2000,
    duration: 500,
    swiperCurrent: 0,
  },
  lifetimes: {
    attached() {
      
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    swiperChange: function(e: any){    
      this.setData({
        swiperCurrent: e.detail.current
      })
    },
    handleClickItem(e: any) {      
      const { idx } = e.currentTarget.dataset;
      this.triggerEvent('ClickItem', {
        id: idx,
      })
    }
  },
})

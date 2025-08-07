
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
      value: []
    },
    isCollected: {
      type: Boolean,
      value: false,
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
    handleClickColIcon() {
      this.triggerEvent('ClickColIcon');
    },
    swiperChange: function(e: any){    
      this.setData({
        swiperCurrent: e.detail.current
      })
    },
    changeIndicatorDots() {
      this.setData({
        indicatorDots: !this.data.indicatorDots
      })
    },
  
    changeAutoplay() {
      this.setData({
        autoplay: !this.data.autoplay
      })
    },
  
    intervalChange(e: any) {
      this.setData({
        interval: e.detail.value
      })
    },
  
    durationChange(e: any) {
      this.setData({
        duration: e.detail.value
      })
    }
  },
})

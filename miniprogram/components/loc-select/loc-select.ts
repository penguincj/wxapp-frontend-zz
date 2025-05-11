Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的属性列表
   */
  properties: {
    currentkey: {
      type: Number,
      value: 0,
    },
    locStyle: {
      type: String,
      value: "",
    },
    pannelStyle: {
      type: String,
      value: "",
    },
    list: {
      type: Array,
      value: []
    },
    selectedName: {
      type: String,
      value: ''
    },
    selectedId: {
      type: Number,
      value: -1,
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    isPannelOpen: false,
    // selectedId: 999,
    // selectedName: '',
  },
  lifetimes: {
    attached() {
        // this.setData({
        //   selectedId: cityConfig[0].id,
        //   selectedName: cityConfig[0].name,
        // })
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    handleClosePannel() {
      this.setData({
        isPannelOpen: false,
      })
    },
    handleOpenPannel() {
      console.log('handleClosePannel', this.data.isPannelOpen)

      this.setData({
        isPannelOpen: !this.data.isPannelOpen,
      })
    },
    handleCityChange(event: any) {
      if (event && event.target && event.target.dataset) {
        const { citykey, cityname } = event.target.dataset;
        console.log('handleCityChange', citykey, cityname);
        this.setData({
          isPannelOpen: false,
        })
        this.triggerEvent('CityChange', {
          selectedId: citykey,
          selectedName: cityname,
        })
      }

    }
  },
})

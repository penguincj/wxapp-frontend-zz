const cityConfig2 = [
  {
    id: 0,
    name: '北京',
  },
  {
    id: 1,
    name: '上海',
  },
  {
    id: 2,
    name: '西安',
  },
  {
    id: 3,
    name: '兰州',
  },
  {
    id: 4,
    name: '北京',
  },
  {
    id: 5,
    name: '上海',
  },
  {
    id: 6,
    name: '西安',
  },
  {
    id: 7,
    name: '哈尔滨',
  },
  {
    id: 8,
    name: '哈尔滨',
  },
]
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
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    cityConfig: cityConfig2,
    isPannelOpen: false,
    selectedId: 999,
    selectedName: '',
    defaultArr: [] as any,
  },
  lifetimes: {
    attached() {
      if (cityConfig2 && cityConfig2.length) {
        const defaultArr = [];
        const cc = this.data.cityConfig;
        for (let i = 0; i< cc.length; i++) {
          if (i < 4) {
            defaultArr.push(cc[i]);
          }
        }
        console.log('defaultArrdefaultArr', defaultArr)
        this.setData({
          selectedId: cc[0].id,
          selectedName: cc[0].name,
          defaultArr,
        })
      }
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
      console.log('handleOpenPannel', this.data.isPannelOpen)

      this.setData({
        isPannelOpen: !this.data.isPannelOpen,
      })
    },
    handleSelectCity(event: any) {
      console.log('handleSelectCity', event);

      if (event && event.target && event.target.dataset) {
        const { citykey, cityname } = event.target.dataset;
        const selectItemInArr = this.data.defaultArr.find((i:any) => i.id === Number(citykey));
        if (!selectItemInArr) {
          const defaultArr = [];
          const data_arr = this.data.defaultArr;
          defaultArr.push({
            id: Number(citykey),
            name: cityname,
          });
          console.log('defaultArrdefaultArr', defaultArr)
          for (let i = 0; i<data_arr.length -1 ;i++) {
            defaultArr.push(data_arr[i]);
          } 
          this.setData({
            defaultArr,
          })
        }
        console.log('handleSelectCity', citykey, cityname);
        this.setData({
          selectedId: citykey,
          selectedName: cityname,
          isPannelOpen: false,
        })
      }

    }
  },
})

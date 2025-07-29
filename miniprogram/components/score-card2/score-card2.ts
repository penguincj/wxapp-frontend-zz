Component({
  options: {
  },
  /**
   * 组件的属性列表
   */
  properties: {
    score: {
      type: Object,
      value: {},
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    starArr: [
      [1,1,1,1,1],
      [1,1,1,1],
      [1,1,1],
      [1,1],
      [1]
    ],
    starTemArr: [{"item0":2},{"item1":4},{"item2":6},{"item3":8},{"item4":10}],
  },
  lifetimes: {
    attached() {
      
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    handleClickCard() {
      this.triggerEvent('ClickCommentIcon')
    },
  },
})

const order = ['demo1', 'demo2', 'demo3'];

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
    selectedId: {
      type: Number,
      value: -1,
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    scrollTop: 0,
    toView: 'green',
    order,
    selectId: 1,
    selectName: '',
  },
  lifetimes: {
    attached() {

    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    upper(e: any) {
      console.log(e)
    },

    lower(e: any) {
      console.log(e)
    },

    scroll(e: any) {
      console.log(e)
    },

    selectItem(e: any) {
      console.log('selectItem', e.target.dataset);
      const { id, name } = e.target.dataset;
        // this.setData({
        //   selectId: id,
        //   selectName: name,
        // });
        //@ts-ignore
        this.tracker.report('exhibit_unit_click_e27', {
          id,
          name,
        })
        this.triggerEvent('ChangeUnit', {
          selectId: id,
          // selectName: name,
        })
    },

    tap() {
      for (let i = 0; i < order.length; ++i) {
        if (order[i] === this.data.toView) {
          this.setData({
            toView: order[i + 1],
            scrollTop: (i + 1) * 200
          })
          break
        }
      }
    },

    tapMove() {
      this.setData({
        scrollTop: this.data.scrollTop + 10
      })
    },

    scrollToTop() {
      this.setData({
        scrollTop: 0
      })
    },

  },
})


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
      const { id, guideid } = e.currentTarget.dataset;
        // this.setData({
        //   selectId: id,
        //   selectName: name,
        // });
        this.triggerEvent('SelectItem', {
          selectId: id,
          guideId: guideid,
          // selectName: name,
        })
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

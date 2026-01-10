import { generateNewUrlParams, getCurrentPageUrl } from "../../utils/util";

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
    totalLen: {
      type: Number,
      value: 0,
    },
    museum: {
      type: Object,
      value: {},
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

    selectMuseumItem(e: any) {
      console.log(e);
      const { idx } = e.currentTarget.dataset;
      const url_params = generateNewUrlParams({
        city_id: idx,
      })
      wx.navigateTo({
        url: '/pages/museum-ranklist/index'+ url_params
      })
    },

    selectItem(e: any) {
      console.log('selectItem', e.currentTarget.dataset);
      const { idx, slug, scopeType } = e.currentTarget.dataset;
        // this.setData({
        //   selectId: id,
        //   selectName: name,
        // });
        this.triggerEvent('ClickItem', {
          selectId: idx,
          slug,
          scopeType,
          // selectName: name,
        })
    },

    handleClickMore() {
      this.triggerEvent('ClickMore');
    }

    // tap() {
    //   for (let i = 0; i < order.length; ++i) {
    //     if (order[i] === this.data.toView) {
    //       this.setData({
    //         toView: order[i + 1],
    //         scrollTop: (i + 1) * 200
    //       })
    //       break
    //     }
    //   }
    // },

    // tapMove() {
    //   this.setData({
    //     scrollTop: this.data.scrollTop + 10
    //   })
    // },

    // scrollToTop() {
    //   this.setData({
    //     scrollTop: 0
    //   })
    // },

  },
})

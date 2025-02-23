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
  },
  /**
   * 组件的初始数据
   */
  data: {
    selectId: 999,
    selectName: "",
    keyword: "",
    toView: "",
  },
  lifetimes: {
    attached() {
      
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    scroll(e : any) {
      // console.log(e)
    },
    selectItem(e: any) {
      console.log('selectItem', e.target.dataset);
      const {id , name} = e.target.dataset;
      if(id && name) {
        this.setData({
          selectId: id,
          selectName: name,
        });
        this.triggerEvent('ChangeUnit', {
          selectId: id,
          selectName: name,
        })
      }
    },

    handleScrollUpper(e: any) {
      const { idx } = e.currentTarget.dataset;
      this.setData({
        toView: 'operation'+idx
      });
    },
    handleScrollLower(e: any) {
      const { idx } = e.currentTarget.dataset;

      this.setData({
        toView: 'image'+idx
      });
    },
    handleDeleteItem(e: any) {
      const { idx } = e.currentTarget.dataset;

      this.triggerEvent('DeleteItem', {
        id: idx
      })
    }

  },
})

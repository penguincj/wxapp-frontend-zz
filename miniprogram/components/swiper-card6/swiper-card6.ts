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
    showType: {
      type: String,
      value: "",
    },
    showInput: {
      type: Boolean,
      value: false,
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    selectId: 999,
    selectName: "",
    keyword: "",
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
      console.log(e)
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
    confirmTap() {
      console.log('按下完成触发');
      this.triggerEvent('ClickSearch', {
        keyword: this.data.keyword,
      })
    },
    handInput(event: any) {
      const { value } = event.detail;
      console.log('value', value);
      this.setData({
        keyword: value
      })
    }
  },
})

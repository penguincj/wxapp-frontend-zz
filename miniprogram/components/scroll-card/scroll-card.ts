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
      value: [] as any,
    },
    cardStyle: {
      type: String,
      value: '',
    }
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
      console.log('selectItem', e);
      const {idx, museumid, cityid, infos} = e.currentTarget.dataset;
      if(idx) {
        this.setData({
          selectId: idx,
          // selectName: name,
        });
        this.triggerEvent('ClickItem', {
          selectId: idx,
          museumid,
          cityid,
          infos,
          // selectName: name,
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
      const { id } = e.currentTarget.dataset;

      this.triggerEvent('DeleteItem', {
        id: id
      })
    },



    /**
     * 处理touchstart事件
     */
  // handleTouchStart(e) {
  //   this.startX = e.touches[0].pageX
  // },


  /**
   * 处理touchend事件
   */
  // handleTouchEnd(e) {
  //   if (e.changedTouches[0].pageX < this.startX && e.changedTouches[0].pageX - this.startX <= -30) {
  //     this.showDeleteButton(e)
  //   } else if (e.changedTouches[0].pageX > this.startX && e.changedTouches[0].pageX - this.startX < 30) {
  //     this.showDeleteButton(e)
  //   } else {
  //     this.hideDeleteButton(e)
  //   }
  // },
  /**
     * 显示删除按钮
     */
  showDeleteButton: function (e: any) {
    let index = e.currentTarget.dataset.index;
    this.setXmove(index, -125);
  },


  /**
   * 隐藏删除按钮
   */
  hideDeleteButton: function (e: any) {
    let index = e.currentTarget.dataset.index;
    this.setXmove(index, 0);
  },


  /**
   * 设置movable-view位移
   */
  setXmove: function (index: any, xmove: any) {
    let { list } = this.data;
    list[index].xmove = xmove;
    this.setData({
      list: list
    })
    console.log(this.data.list)
  },


  /**
   * 处理movable-view移动事件
   */
  handleMovableChange: function (e: any) {
    if (e.detail.source === 'friction') {
      if (e.detail.x < -30) {
        this.showDeleteButton(e)
      } else {
        this.hideDeleteButton(e)
      }
    } else if (e.detail.source === 'out-of-bounds' && e.detail.x === 0) {
      this.hideDeleteButton(e)
    }
  },

  handleDelete(e: any) {
    let { id } = e.currentTarget.dataset;
    this.itemDel(id)
  },
  itemDel(id: any) {
    // this.data.list.forEach((item, index) => {
    //   if (item.id == id) {
    //     this.data.list.splice(index, 1)
    //   }
    //   this.setData({
    //     list: this.data.list
    //   })
    //   wx.showToast({
    //     title: '删除成功',
    //     icon: 'success'
    //   })
    // })
    console.log('itemDel', id)
  }


  },
})

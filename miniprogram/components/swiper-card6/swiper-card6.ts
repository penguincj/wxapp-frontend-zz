Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的属性列表
   */
  properties: {
    title: {
      type: String,
      value: "",
    },
    isSearch: {
      type: Boolean,
      value: false
    },
    emptyMessage: {
      type: String,
      value: "",
    },
    listenedExhibitList: {
      type: Object,
      value: {},
    },
    isListType: {
      type: Boolean,
      value: true
    },
    list: {
      type: Array,
      value: []
    },
    audiolist: {
      type: Array,
      value: [],
    },
    showType: {
      type: String,
      value: "",
    },
    showInput: {
      type: Boolean,
      value: false,
    },
    scrollStyle: {
      type: String,
      value: 'height: 1030rpx'
    },
    playingIndex: {
      type: Number,
      value: -1,
    },
    playingExhibitId: {
      type: Number,
      value: -1,
    },
    scrollTop: {
      type: String,
      value: '0rpx',
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    selectId: 999,
    selectName: "",
    keyword: "",
    isKeepPlayingActive: getApp().globalData.audio.isKeepPlaying,
  },
  lifetimes: {
    attached() {
      
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    selectItem(e: any) {
      console.log('selectItem', e);
      const { idx, name } = e.currentTarget.dataset;
      this.setData({
        selectId: idx,
      });
      this.triggerEvent('ChangeItem', {
        selectId: idx,
      })
      if (getApp().globalData.audio && getApp().globalData.audio.bgAudio) {
        //@ts-ignore
        this.tracker.report('list_play_e24', {
          status: getApp().globalData.audio.bgAudio.paused ? 'paused': 'play',
          id: idx,
          name,
        })
      }
    },
    clickItemImg(e: any) {
      console.log('clickItemImg', e);
      const { idx } = e.currentTarget.dataset;
      this.setData({
        selectId: idx,
      });
      // @ts-ignore
      this.tracker.report('list_item_click_e25', {id: idx})
      this.triggerEvent('ClickItemImage', {
        selectId: idx,
      })
    },
    handleClickRepeatPlaying() {
      console.log('handleClickRepeatPlaying')
      if (getApp().globalData.audio.isKeepPlaying) {
        getApp().globalData.audio.isKeepPlaying = false;
        this.setData({
          isKeepPlayingActive: false
        })
        wx.showToast({
          title: '已为您关闭连续播放',
          icon: 'none',
          duration: 2000
        })
        
      } else {
        getApp().globalData.audio.isKeepPlaying = true;
        this.setData({
          isKeepPlayingActive: true
        })
        wx.showToast({
          title: '已为您开启连续播放',
          icon: 'none',
          duration: 2000
        })
        
      }
      // this.triggerEvent('ClickRepeatChange')
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
  pageLifetimes: {
    show() {
      if (getApp().globalData.audio.isKeepPlaying) {
        this.setData({
          isKeepPlayingActive: true
        })
      } else {
        this.setData({
          isKeepPlayingActive: false
        })
      }
    },
  }
})

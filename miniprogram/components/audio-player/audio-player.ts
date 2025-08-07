// const backgroundAudioManager = wx.getBackgroundAudioManager()

// backgroundAudioManager.title = '此时此刻'
// backgroundAudioManager.epname = '此时此刻'
// backgroundAudioManager.singer = '许巍'
// backgroundAudioManager.coverImgUrl = 'http://y.gtimg.cn/music/photo_new/T002R300x300M000003rsKF44GyaSk.jpg?max_age=2592000'
// 设置了 src 之后会自动播放

Component({
  properties: {
    isPlay: {
      type: Boolean,
      value: false
    },
    //是否自动播放
    autoplay: {
      type: Boolean,
      value: false
    },
    // 音频title
    videotitle: {
      type: String,
      value: 'unknown'
    },
    // 音频封面图片url地址
    coverurl: {
      type: String,
      value: "",
    },
    // wangye
    sliderIndex: {
      type: Number,
      value: 0,
    },
    duration: {
      type: Number,
      value: 0,
    },
    currentTimeText: {
      type: String,
      value: '00:00'
    },
    totalTimeText: {
      type: String,
      value: '00:00'
    },
    isKeepPlayingActive: {
      type: Boolean,
      value: getApp().globalData.audio.isKeepPlaying,
    },
    curRate: {
      type: Number,
      value: 1,
    },
    playingIndex: {
      type: Number,
      value: 0,
    },
    audioList: {
      type: Array,
      value: [],
    }
  },
  data: {
    // totalTimeText: '00:00', //视频总长度文字
    // currentTimeText: '00:00:00', //视频已播放长度文字

    isPlaying: false, //播放状态

    // sliderIndex: 0, //滑块当前值
    maxSliderIndex: 100, //滑块最大值

    isReadyPlay: false, //是否已经准备好可以播放了

    isLoop: false, //是否循环播放

    speedValue: [0.5, 0.8, 1.0, 1.25, 1.5, 2.0],
    speedValueIndex: 2,
    playSpeed: '1.0', //播放倍速 可取值：0.5/0.8/1.0/1.25/1.5/2.0

    // stringObject: (data) => {
    // 	return typeof(data)
    // },
    // innerAudioContext: uni.createInnerAudioContext(),
    lastAudioUrl: '',
    bgAudioManager: null as any,
  },
  methods: {
    handleClickRepeatPlaying() {
      // const curKeep = getApp().globalData.audio.isKeepPlaying;
      // getApp().globalData.audio.isKeepPlaying = !curKeep;
      // this.setData({
      //   isKeepPlayingActive: false,
      // })
      this.triggerEvent('ClickRepeatPlaying');
    },
    handleClickShowMenuList() {
      this.triggerEvent('ClickShowMenuList');
    },
    handleClickBeisu() {
      this.triggerEvent('ClickBeisu');
    },
    handlePlayChange() {
      console.log('in compont audio player', this.data.isPlaying);
      this.setData({
        isPlaying: !this.data.isPlaying,
      });
      this.triggerEvent('PlayStateChange', {
        state: !this.properties.isPlay,
      })
    },
    handleSliderChange(e: any) {
      const { value } = e.detail;
      this.triggerEvent('OnSliderChange', {value});
    },
    // handleBackProgress() {
    //   console.log('in compont audio player handleBackProgress');
    //   this.triggerEvent('BackProgress');

    // },
    // handleForwordProgress() {
    //   console.log('in compont audio player handleForwordProgress');
    //   this.triggerEvent('ForwordProgress');
    // },
    handlePlayNext() {
      console.log('in compont audio player handlePlayNext');
      this.triggerEvent('PlayNext');
    },
    handlePlayPrev() {
      console.log('in compont audio player handlePlayPrev');
      this.triggerEvent('PlayPrev');
    },
    handlePlayRate() {
      console.log('in compont audio player handlePlayRate');
      this.triggerEvent('PlayRate', {
        rate: 1,
      });
    }
  },

  lifetimes: {
    attached() {

    },
  },

})

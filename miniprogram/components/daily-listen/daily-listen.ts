
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
      value: '',
    },
    exhibition: {
      type: Object,
      value: {} as any,
    },
  },
  /**
   * 组件的初始数据
   */
  data: {
    innerAudioContext: null as any,
    isPlay: false,
  },
  lifetimes: {
    attached() {
      
    },
    detached() {
    },

  },
  pageLifetimes: {
    hide() {
      this.handleClickPause();
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    handleClickPlay() {
      this.triggerEvent('PlayDailyListen')
      if (this.data.exhibition && this.data.exhibition.audio_url) {
        const innerAudioContext = wx.createInnerAudioContext({
          useWebAudioImplement: false // 是否使用 WebAudio 作为底层音频驱动，默认关闭。对于短音频、播放频繁的音频建议开启此选项，开启后将获得更优的性能表现。由于开启此选项后也会带来一定的内存增长，因此对于长音频建议关闭此选项
        })
        innerAudioContext.src = this.data.exhibition.audio_url;
        innerAudioContext.play();
        this.setData({
          innerAudioContext,
          isPlay: true,
        })
        this.onEnded();

      }
    },
    onEnded() {
      if (this.data.innerAudioContext) {
        this.data.innerAudioContext.onEnded(() => {
          console.log('音频已停止');
          this.setData({
            isPlay: false
          });
        });
      }
    },
    handleClickPause() {
      if (this.data.innerAudioContext) {
        this.data.innerAudioContext.stop();
        try {
          if (this.data.innerAudioContext && typeof this.data.innerAudioContext.destroy === 'function') {
            this.data.innerAudioContext.destroy(); // 释放音频资源
          }
        } catch (error) {
          console.log(error)
        }
       
        
      }
      this.setData({
        isPlay: false,
      })
    },
  },
})

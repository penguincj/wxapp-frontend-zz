// index.ts
// 获取应用实例
// const app = getApp<IAppOption>()
import { base_url } from '../../utils/util';

Component({
  properties: {
    list: {
      type: Array,
      value: [],
    },
    playingindex: {
      type: Number,
      value: -1,
    },
    duration: {
      type: Number,
      value: 0,
    }
  },
  data: {
    base_url: 'https://wx.ajioang.cn',
  },
  methods: {
    handleChangeAudioStateToPlay(e: any) {
      console.log('handleChangeAudioState', e);
      const { index, item } = e.currentTarget.dataset
      this.triggerEvent('changeAudioState', {playingIdx: index, item,})
    },
    handleChangeAudioStateToPause(e: any) {
      console.log('handleChangeAudioState', e);
      this.triggerEvent('changeAudioState', {playingIdx: -1})
    },
  },

  lifetimes: {
    attached() {
      

    },
  },

})

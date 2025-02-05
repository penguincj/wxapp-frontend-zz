// index.ts
// 获取应用实例
// const app = getApp<IAppOption>()
import { audioList, exhibitionList } from './mock';
const base_url = "http://gewugo.com";
// let bgAudio = wx.getBackgroundAudioManager();

const audioItem = {
  "id": 121,
  "type": 0,
  "dyid": 14,
  "lmid": 18,
  "tagstr": ",1,",
  "videocontent": "",
  "audiourl": "https://gewugo.com/storage/file/CB26976399343756.mp3",
  "imagepath": "https://gewugo.com/storage/image/NC06525637302482.jpg",
  "title": "单元介绍",
  "desc": "",
  "content": "",
  "sort": 100,
  "is_show": 1,
  "zannum": 0,
  "pinglunnum": 0,
  "lookcount": 999,
  "shoucangnum": 0,
  "createtime": "2024-11-26 13:08:40",
  "duration_format": "00:38"
}

Component({
  data: {
    exhibitionList: audioList,
    exhibitInfo: audioItem,
    playingIndex: -1, // 当前播放index
    lastPlayIndex: -1, // 之前播放index
    sliderIndex: 0, // 当前播放进度
    duration: 0, // 当前audio时长
    currentTimeText: '00:00',
    totalTimeText: '00:00',
    topBarHeight: 0,
    safeHeight: 0,
    windowHeight: 0,
    statusBarHeight: 0,
    bgAudio: null as any,
    isAutoPlay: false,
    stored_audio: [] as string[],
    isPlay: false, // 当前是否播放
    currentTime: 0,


    showDialog: false,
    rateSlider: 2,
    rateMax: 4,

  },
  methods: {
    handleReadyPlay(event: any) {
      const { duration, totalTimeText, isPlay } = event.detail;
      this.setData({
        isPlay,
        duration,
        totalTimeText,
      })
    },
    handleTimeUpdate(event: any) {
      const { sliderIndex, currentTimeText, currentTime } = event.detail;
      this.setData({
        currentTime,
        sliderIndex,
        currentTimeText,
      })
    },









    handlePlayStateChange(event: any) {
      console.log('handlePlayStateChange', event);

      const { state } = event.detail;
      this.setData({
        isPlay: state, 
      })
      if (state) {
        this.handleAudioPlay();
      } else {
        this.handleAudioPause();
      }
    },
    handleBackProgress() {
      const curtime = this.data.currentTime;
    
      const jumptime = (curtime - 15) < 1 ? 0 : (curtime - 15);
      var player = this.selectComponent("#player");
      player.handleSeekPlay(jumptime);
      
    },
    ForwordProgress() {
      const curtime = this.data.currentTime;
      const duration = this.data.duration;
      const jumptime = (curtime + 15) > duration ? duration : (curtime + 15);
      var player = this.selectComponent("#player");
      player.handleSeekPlay(jumptime);
      // this.data.bgAudio.seek(jumptime);
    },
    handlePlayNext() {
      var player = this.selectComponent("#player");
      player.playNextAudio();
    },
    handlePlayPrev() {
      var player = this.selectComponent("#player");
      player.playPrevAudio();
    },
    handlePlayRate(rate: number) {
      var player = this.selectComponent("#player");
      player.playRate(rate);
    },
    handleClickOpenRate() {
      console.log('handleClickOpenRate');
      this.setData({
        showDialog: true,
      })
    },
    handleCloseDialog() {
      console.log('handleCloseDialog');
      this.setData({
        showDialog: false,
      })
    },
    handleRateSliderChange(event: any) {
      console.log('handleRateSliderChange', event);
      const value = event.detail.value;

      this.handlePlayRate(value/2)
    },















    
    drawCanvas() {
      wx.createSelectorQuery()
        .select('#myCanvas') // 在 WXML 中填入的 id
        .fields({ node: true, size: true })
        .exec((res) => {
          // Canvas 对象
          const canvas = res[0].node
          // 渲染上下文
          const ctx = canvas.getContext('2d')

          // Canvas 画布的实际绘制宽高
          const width = res[0].width
          const height = res[0].height

          // 初始化画布大小
          const dpr = wx.getWindowInfo().pixelRatio
          canvas.width = width * dpr
          canvas.height = height * dpr
          ctx.scale(dpr, dpr)
          // 省略上面初始化步骤，已经获取到 canvas 对象和 ctx 渲染上下文

          // 清空画布
          ctx.clearRect(0, 0, width, height)

          // // 绘制红色正方形
          // ctx.fillStyle = 'rgb(200, 0, 0)';
          // ctx.fillRect(10, 10, 50, 50);

          // // 绘制蓝色半透明正方形
          // ctx.fillStyle = 'rgba(0, 0, 200, 0.5)';
          // ctx.fillRect(30, 30, 50, 50);

          // 虚线
          ctx.setLineDash([5, 15]);
          ctx.moveTo(50, 50);
          ctx.lineTo(60, 50);
          ctx.lineTo(70, 50);
          ctx.lineTo(80, 50);
          ctx.lineTo(250, 50);
          ctx.lineTo(250, 60);
          ctx.lineTo(250, 70);
          ctx.lineTo(250, 100);
          ctx.lineTo(240, 100);
          ctx.lineTo(50, 100);
          ctx.stroke();

        })
    },
    handleAudioEnd() {
      console.log('handleAudioEnd');
    },
    handleAudioPlay() {
      console.log('handleAudioPlay');
      var player = this.selectComponent("#player")
      player.handleAudioPlay();
      // const audio = this.selectComponent('#audio')
      // debugger;
      // this.setData({
      //   playingIndex: this.data.currentIndex
      // })
      // 	setTimeout(() => {
      // 		try {
      // 			const dur = audio.bgAudioManager.duration;
      //       this.setData({
      //         duration_fmt: audio.getFormateTime2(dur)
      //       })
      // 		} catch (error) {
      // 			console.log('error', error);
      // 		}
      // 	}, 1000)
    },
    handleAudioChange(e: any) {
      console.log(e.detail.state);
    },
    handleAudioPause() {
      console.log('handleAudioPause');
      var player = this.selectComponent("#player")
      player.handleAudioPause();
      // this.setData({
      //   playingIndex: -1,
      // })
    },
    handleAudioError(e: any) {
      console.log(e.detail.data);
    },
    handleAudioNext() {
      console.log('handleAudioNext');

      // const next_index = this.data.currentIndex + 1 > this.data.detail.list.length - 1 ? this.data.currentIndex : this.data.currentIndex + 1;
      // const next_item = this.data.detail.list[next_index];
      // console.log('handleAudioNext', this.data.currentIndex, next_index);

      // this.handleChangeAudioState(next_item, next_index);
    },
    handleAudioPre() {
      console.log('handleAudioPre');
      // const pre_index = this.data.currentIndex - 1 < 0 ? this.data.currentIndex : this.data.currentIndex - 1;
      // 	const pre_item = this.data.detail.list[pre_index];
      // 	this.handleChangeAudioState(pre_item, pre_index);
    },
    handleAudioCollec() {
      console.log('handleAudioCollec')
    },
    handleAudioShare() {
      console.log('handleAudioShare')
    },


    async findLocalAudio(_url: string) {
      const stored_audio_arr = this.data.stored_audio;
      const file_name = _url.split('/file/')[1].split('.mp3')[0];

      if (!stored_audio_arr.length) {
        try {
          const stored_audio = await wx.getStorageSync('audios');
          this.setData({
            stored_audio,
          });
          if (!stored_audio) {
            return "";
          }
        } catch (error) {
          console.log(error)
        }
      }
      return stored_audio_arr.find((item) => item.includes(file_name))

    },

  },
  pageLifetimes: {
    async show() {
      // this.drawCanvas();
      this.setData({
        loading: true,
      })
      try {
        const stored_audio = await wx.getStorageSync('audios');
        this.setData({
          stored_audio,
        })
      } catch (error) {
        console.log(error)
      }

      console.log('show');
      const info = wx.getMenuButtonBoundingClientRect();
      const windowInfo = wx.getWindowInfo();
      if (info && info.bottom) {
        this.setData({
          topBarHeight: info.bottom,
          safeHeight: windowInfo.safeArea.height,
          windowHeight: windowInfo.screenHeight,
          statusBarHeight: windowInfo.statusBarHeight,
        })
      }

      console.log('info', info);
      console.log('windowInfo', windowInfo);
      // wx.showModal({
      //   title: '提示',
      //   content: '这是一个模态弹窗',
      //   success (res) {
      //     if (res.confirm) {
      //       console.log('用户点击确定')
      //     } else if (res.cancel) {
      //       console.log('用户点击取消')
      //     }
      //   }
      // })
      

      // setTimeout(() => {
      //   this.initPageAudio(this.data.exhibitInfo);
      // }, 300)

    },
  },
  lifetimes: {
    attached() {
      setTimeout(() => {
        this.setData({
          loading: false,
        })
      }, 1000)
    },
  },

})

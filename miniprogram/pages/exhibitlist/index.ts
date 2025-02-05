// index.ts
// 获取应用实例
// const app = getApp<IAppOption>()
import { audioList, exhibitionList } from './mock';
const base_url = "http://gewugo.com";
// let bgAudio = wx.getBackgroundAudioManager();

Component({
  data: {
    exhibitList: audioList,
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
  },
  methods: {
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
    generateAudioItem(item: any) {
      const { audiourl, imagepath, title, duration_format } = item;

      return {
        src: base_url + audiourl,
        startTime: 0,
        title,
        epname: title,
        singer: 'gewugo',
        coverImgUrl: base_url + imagepath,
      }
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
    async initPageAudio(audio_item: any) {
      const audio_i = this.generateAudioItem(audio_item);
      const { src, startTime, title, epname, singer, coverImgUrl } = audio_i;

      let local_audio = await this.findLocalAudio(src);
      // wx.getStorage({
      //   key: 'audios',
      //   success(res){
      //     console.log('storage', res)
      //     tmp_src = res.data;
      //   }
      // });

      if (!this.data.bgAudio) {
        const bgAudio = wx.getBackgroundAudioManager();
        // const bgAudio = wx.createInnerAudioContext();
        // bgAudio.src = src;
        bgAudio.title = title;
        bgAudio.startTime = startTime;
        bgAudio.epname = epname;
        bgAudio.coverImgUrl = coverImgUrl;
        bgAudio.singer = singer;
        if (local_audio) {
          bgAudio.src = local_audio;
          console.log('local_audio', local_audio)

        } else {
          bgAudio.src = src;
          console.log('not local_audio', src)

        }

        // bgAudio.play();
        this.setData({
          bgAudio,
          lastPlayIndex: this.data.playingIndex,
        })
      } else {
        const bgAudio = this.data.bgAudio;
        // bgAudio.src = src;

        bgAudio.title = title;
        bgAudio.startTime = startTime;
        bgAudio.epname = epname;
        bgAudio.coverImgUrl = coverImgUrl;
        bgAudio.singer = singer;
        // bgAudio.src = "http://tmp/pohVj8ecqWnGc8d75f04958ff2a793a71a9eea580e4b.mp3";
        if (local_audio) {
          bgAudio.src = local_audio;
          console.log('local_audio', local_audio)
        } else {
          bgAudio.src = src;
          console.log('not local_audio', src)

        }


        // bgAudio.play();
        this.setData({
          bgAudio,
          lastPlayIndex: this.data.playingIndex,
        })
      }
      setTimeout(() => {
        let duration = this.data.bgAudio.duration;
        if (!duration || !isFinite(duration)) {
          const duration_fmt = audio_item.duration_format;
          duration = Number(duration_fmt.split(':')[0]) * 60 + Number(duration_fmt.split(':')[1]);
        }
        console.log('this.data.bgAudio.duration', duration)

        const dur = Math.round(duration);
        const durTxt = this.calTimeTxt(dur);
        console.log('this..bgAudio.durTxt', durTxt)
        console.log('this.data.bgAudio', this.data.bgAudio)

        this.setData({
          duration: dur,
          totalTimeText: durTxt,
        })
      }, 300)
      this.onBgTimeUpdate();

    },
    calTimeTxt(_time: number) {
      if (_time < 3600) {
        return Math.floor(_time / 60) + ':' + (_time % 60)
      } else {
        return Math.floor(_time / 3600) + ':' + Math.floor((_time % 3600) / 60) + ':' + ((_time % 3600) % 60)
      }
    },
    onBgTimeUpdate() {
      this.data.bgAudio.onTimeUpdate(() => {
        const time = Number(parseFloat(this.data.bgAudio.currentTime).toFixed(2));
        const dur = this.data.bgAudio.duration;

        const timeTxt = this.calTimeTxt(Math.floor(time));
        this.setData({
          sliderIndex: time,
          currentTimeText: timeTxt,
        })
      })
    },
    handleChangeAudioState(e: any) {
      const pIdx = e.detail.playingIdx;
      const item = e.detail.item;
      this.setData({
        playingIndex: pIdx,
      })
      if ((pIdx !== -1) && item) {
        this.initPageAudio(item)
      } else {
        this.data.bgAudio.pause();
      }
      console.log('pIndex', pIdx)
    }
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

      // setTimeout(() => {
      //   this.initPageAudio(exhibitionList[0]);
      // }, 3000)

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

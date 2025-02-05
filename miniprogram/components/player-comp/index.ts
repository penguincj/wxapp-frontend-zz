// @ts-nocheck
import { audioList } from './mock';
import { throttle } from '../../utils/util';

const app = getApp();
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
        //音频地址
        audiourl: {
            type: String,
            value: ''
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
    },
    data: {
      // audioList: audioList,
      // bgAudio: null as any,
      // playingIndex: 0,
      // stored_audio: [] as string[],
      // curExhibit: audioList[0],

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
      handleAudioPause() {
        app.globalData.audio.bgAudio.pause();
        // this.setData({
        //   playingIndex: -1,
        // })
      },
      handleAudioPlay() {
        app.globalData.audio.bgAudio.play();
        // this.setData({
        //   playingIndex: -1,
        // })
      },
      handleSeekPlay(jumptime) {
        app.globalData.audio.bgAudio.seek(jumptime);
      },
      playNextAudio() {
        const {playingIndex, audioList} = app.globalData.audio;
        if (playingIndex + 1 >= audioList) {
          console.log('last one')
        } else {
          getApp().globalData.audio.playingIndex = playingIndex + 1;
          this.handlePlayOtherAudio(audioList[playingIndex + 1])
        }
      },
      playPrevAudio() {
        const {playingIndex, audioList} = app.globalData.audio;
        if (playingIndex <= 0) {
          console.log('first one')
        } else {
          getApp().globalData.audio.playingIndex = playingIndex - 1;
          this.handlePlayOtherAudio(audioList[playingIndex - 1])
        }
      },
      playRate(_rate) {
        let rate = 1;
        if (_rate < 0.75) {
          rate = 0.5;
        } else if ((0.75 <= _rate) && (_rate < 1.25)) {
          rate = 1;
        } else if ((1.25 <= _rate) && (_rate < 1.75)) {
          rate = 1.5;
        } else if (_rate >= 1.75) {
          rate = 2;
        }
        const { currentTime, src } = getApp().globalData.audio.bgAudio;
        console.log('rate rate rate', currentTime, src);
        
        getApp().globalData.audio.bgAudio.playbackRate = rate;
        // getApp().globalData.audio.bgAudio.stop();
        getApp().globalData.audio.bgAudio.src = src;
        getApp().globalData.audio.bgAudio.seek(currentTime);
        // getApp().globalData.audio.bgAudio.play();
      },
      handlePlayOtherAudio(_audio) {
        getApp().globalData.audio.curExhibit = _audio;
        this.initPageAudio(_audio);
      },
      generateAudioItem(item: any) {
        const { audiourl, imagepath, title, duration_format } = item;
  console.log('item;;;;;;;', item)
        return {
          src: audiourl,
          startTime: 0,
          title,
          epname: title,
          singer: 'gewugo',
          coverImgUrl: imagepath,
        }
      },
      async findLocalAudio(_url: string) {
        const stored_audio_arr = app.globalData.audio.stored_audio;
        const file_name = _url.split('/file/')[1].split('.mp3')[0];
  
        if (!stored_audio_arr.length) {
          try {
            const stored_audio = await wx.getStorageSync('audios');
            getApp().globalData.audio.stored_audio = stored_audio;
            // this.setData({
            //   stored_audio,
            // });
            if (!stored_audio) {
              return "";
            }
          } catch (error) {
            console.log(error)
          }
        }
        return stored_audio_arr.find((item) => item.includes(file_name))
  
      },
      calTimeTxt(_time: number) {
        if (_time < 3600) {
          const min = Math.floor(_time / 60);
          const min_str = (min < 10) ? ('0'+min) : min;
          const sec = (_time % 60);
          const sec_str = (sec < 10) ? ('0'+sec) : sec;
          return min_str + ':' + sec_str
        } else {
          const hour = Math.floor(_time / 3600);
          const hour_str = (hour < 10) ? ('0'+hour) : hour;
  
          const minute = Math.floor((_time % 3600) / 60);
          const minute_str = (minute < 10) ? ('0'+minute) : minute;
          
          const second = ((_time % 3600) % 60);
          const second_str = (second < 10) ? ('0'+second) : second;
  
          return hour_str + ':' + minute_str + ':' + second_str;
        }
      },
      onEndAudio() {
        app.globalData.audio.bgAudio.onEnded(() => {
          console.log('end');
          getApp().globalData.audio.isPlay = false;
          // this.setData({
          //   isPlay: false,
          // })
        })
      },
      onBgTimeUpdate() {
        
        app.globalData.audio.bgAudio.onTimeUpdate(throttle(() => {
          console.log('2')
          const time = Number(parseFloat(app.globalData.audio.bgAudio.currentTime).toFixed(2));
          const dur = app.globalData.audio.bgAudio.duration;
  
          const timeTxt = this.calTimeTxt(Math.floor(time));
          getApp().globalData.audio.sliderIndex = time;
          getApp().globalData.audio.currentTimeText = timeTxt;

          // this.setData({
          //   sliderIndex: time,
          //   currentTimeText: timeTxt,
          // })
          this.triggerEvent('TimeUpdate', {
            currentTime: time,
            sliderIndex: time,
            currentTimeText: timeTxt,
          })
        }, 1000))
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
  
        if (!app.globalData.audio.bgAudio) {
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
          getApp().globalData.audio.bgAudio = bgAudio;
          getApp().globalData.audio.isPlay = true;
          getApp().globalData.audio.lastPlayIndex = app.globalData.audio.playingIndex;
          // this.setData({
          //   isPlay: true,
          //   bgAudio,
          //   lastPlayIndex: app.globalData.audio.playingIndex,
          // });
        } else {
          getApp().globalData.audio.bgAudio = null;
          const bgAudio = wx.getBackgroundAudioManager();
          // const bgAudio = app.globalData.bgAudio;
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
          getApp().globalData.audio.bgAudio = bgAudio;
          getApp().globalData.audio.isPlay = true;
          getApp().globalData.audio.lastPlayIndex = app.globalData.audio.playingIndex;

          // this.setData({
          //   isPlay: true,
          //   bgAudio,
          //   lastPlayIndex: app.globalData.audio.playingIndex,
          // })
        }
        setTimeout(() => {
          let duration = app.globalData.audio.bgAudio.duration;
          if (!duration || !isFinite(duration)) {
            const duration_fmt = audio_item.duration_format;
            duration = Number(duration_fmt.split(':')[0]) * 60 + Number(duration_fmt.split(':')[1]);
          }
          console.log('app.globalData.bgAudio.duration', duration)
  
          const dur = Math.round(duration);
          const durTxt = this.calTimeTxt(dur);
          console.log('this..bgAudio.durTxt', durTxt)
          console.log('app.globalData.bgAudio', app.globalData.audio.bgAudio)
  
          getApp().globalData.audio.duration = dur;
          getApp().globalData.audio.totalTimeText = durTxt;

          // this.setData({
          //   duration: dur,
          //   totalTimeText: durTxt,
          // })
          this.triggerEvent('ReadyPlay', {
            isPlay: true,
            duration: dur,
            totalTimeText: durTxt,
          })
          console.log(app.globalData.audio.bgAudio);
          this.onEndAudio();
  
        }, 300)
        this.onBgTimeUpdate();
  
      },
      
    },

    lifetimes: {
        async attached() {
            // console.log("mounted src = ", app.globalData.audio.audiourl)

            // const video_src = typeof (app.globalData.audio.audiourl) == 'string' ? app.globalData.audio.audiourl : app.globalData.audio.audiourl[0];
            // if (!app.globalData.bgAudioManager) {
            //     this.backgroundAudioInit(video_src);
            //     setTimeout(() => {
            //         // this.audioPause();
            //     }, 300)

            // }
          

            try {
              getApp().globalData.audio.audioList = audioList;
              getApp().globalData.audio.curExhibit = audioList[0];

              const stored_audio = await wx.getStorageSync('audios');
              getApp().globalData.audio.stored_audio = stored_audio;
              // this.setData({
              //   stored_audio,
              // })
            } catch (error) {
              console.log(error)
            }
            setTimeout(() => {
              this.initPageAudio(app.globalData.audio.curExhibit);
            }, 300)
        },
    },

})

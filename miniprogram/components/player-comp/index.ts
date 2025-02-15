// @ts-nocheck
import { audioList } from './mock';
import { throttle } from '../../utils/util';

const global_audio = getApp().globalData.audio;
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
        global_audio.bgAudio.pause();
        // this.setData({
        //   playingIndex: -1,
        // })
      },
      handleAudioPlay() {
        global_audio.bgAudio.play();
        // this.setData({
        //   playingIndex: -1,
        // })
      },
      handleSeekPlay(jumptime) {
        global_audio.bgAudio.seek(jumptime);
      },
      playNextAudio() {
        const {playingIndex, audioList} = global_audio;
        if (playingIndex + 1 >= audioList) {
          console.log('last one')
        } else {
          global_audio.playingIndex = playingIndex + 1;
          this.handlePlayOtherAudio(audioList[playingIndex + 1])
        }
      },
      playPrevAudio() {
        const {playingIndex, audioList} = global_audio;
        if (playingIndex <= 0) {
          console.log('first one')
        } else {
          global_audio.playingIndex = playingIndex - 1;
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
        const { currentTime, src } = global_audio.bgAudio;
        global_audio.bgAudio.playbackRate = rate;
        global_audio.bgAudio.stop();
       
        setTimeout(async () => {
          await this.initPageAudio(global_audio.curExhibit);
          console.log('rate rate rate', src, currentTime);
          global_audio.bgAudio.seek(currentTime);
        }, 300)
        
      },
      async handlePlayOtherAudioById(_id) {

        const audio = global_audio.audioList.find(i=>i.id === _id);
        await this.handlePlayOtherAudio(audio);
      },
      async handlePlayOtherAudioByPlayingIdx(_playingidx) {
        const audio = global_audio.audioList[_playingidx];
        await this.handlePlayOtherAudio(audio);
      },
      async handlePlayOtherAudio(_audio) {
        global_audio.curExhibit = _audio;
        await this.initPageAudio(_audio);
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
        return false;
        const stored_audio_arr = global_audio.stored_audio;
        const file_name = _url.split('/file/')[1].split('.mp3')[0];
  
        if (!stored_audio_arr.length) {
          try {
            const stored_audio = await wx.getStorageSync('audios');
            global_audio.stored_audio = stored_audio;
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
        global_audio.bgAudio.onEnded(() => {
          console.log('end');
          global_audio.isPlay = false;
          this.triggerEvent('EndAudio')
          // this.setData({
          //   isPlay: false,
          // })
        })
      },
      refreshPageStatusFromCurrentPlayingStatus() {
        const paused = global_audio.bgAudio.paused;
        this.triggerEvent('GetCurPlayingStatus', {
          isPlay: !paused,
        })
      },
      pageTimeUpateContinue() {
        if(global_audio && global_audio.bgAudio) {
          console.log('audio continue', global_audio.bgAudio.paused);
          this.refreshPageStatusFromCurrentPlayingStatus();
          this.onBgTimeUpdate();
        } else {
          console.log('no audio continue');
        }
      },
      onBgTimeUpdate() {
        
        global_audio.bgAudio.onTimeUpdate(throttle(() => {
          console.log('2')
          const time = Number(parseFloat(global_audio.bgAudio.currentTime).toFixed(2));
          const dur = global_audio.bgAudio.duration;
  
          const timeTxt = this.calTimeTxt(Math.floor(time));
          global_audio.sliderIndex = time;
          global_audio.currentTimeText = timeTxt;

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
        console.log('in initPageAudio')
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
  
        if (!global_audio.bgAudio) {
          console.log('in !global_audio.bgAudio')

          const bgAudio = wx.getBackgroundAudioManager();
          // const bgAudio = wx.createInnerAudioContext();
          // bgAudio.src = src;
          bgAudio.title = title;
          bgAudio.startTime = startTime;
          bgAudio.epname = epname;
          bgAudio.coverImgUrl = coverImgUrl;
          bgAudio.singer = singer;
          if (false && local_audio) {
            bgAudio.src = local_audio;
            console.log('local_audio', local_audio)
  
          } else {
            bgAudio.src = src;
            console.log('not local_audio', src)
  
          }
  
          // bgAudio.play();
          global_audio.bgAudio = bgAudio;
          global_audio.isPlay = true;
          global_audio.lastPlayIndex = global_audio.playingIndex;
          // this.setData({
          //   isPlay: true,
          //   bgAudio,
          //   lastPlayIndex: global_audio.playingIndex,
          // });
        } else {
          console.log('in global_audio.bgAudio')
          global_audio.bgAudio = null;
          const bgAudio = wx.getBackgroundAudioManager();
          // const bgAudio = app.globalData.bgAudio;
          // bgAudio.src = src;
  
          bgAudio.title = title;
          bgAudio.startTime = startTime;
          bgAudio.epname = epname;
          bgAudio.coverImgUrl = coverImgUrl;
          bgAudio.singer = singer;
          // bgAudio.src = "http://tmp/pohVj8ecqWnGc8d75f04958ff2a793a71a9eea580e4b.mp3";
          if (false && local_audio) {
            bgAudio.src = local_audio;
            console.log('local_audio', local_audio)
          } else {
            bgAudio.src = src;
            console.log('not local_audio', src)
          }
  
          // bgAudio.play();
          global_audio.bgAudio = bgAudio;
          global_audio.isPlay = true;
          global_audio.lastPlayIndex = global_audio.playingIndex;

          // this.setData({
          //   isPlay: true,
          //   bgAudio,
          //   lastPlayIndex: global_audio.playingIndex,
          // })
        }
        setTimeout(() => {
          let duration = global_audio.bgAudio.duration;
          if (!duration || !isFinite(duration)) {
            const duration_fmt = audio_item.duration_format;
            duration = Number(duration_fmt.split(':')[0]) * 60 + Number(duration_fmt.split(':')[1]);
          }
          const playingIdx = global_audio.audioList.findIndex(i => i.id === global_audio.curExhibit.id);
          global_audio.playingIndex = playingIdx;
          console.log('app.globalData.bgAudio.playingIdx', playingIdx)

          const dur = Math.round(duration);
          const durTxt = this.calTimeTxt(dur);
          console.log('this..bgAudio.durTxt', durTxt)
          console.log('app.globalData.bgAudio', global_audio)
  
          global_audio.bgAudio.duration = dur;
          global_audio.totalTimeText = durTxt;

          // this.setData({
          //   duration: dur,
          //   totalTimeText: durTxt,
          // })
          this.triggerEvent('ReadyPlay', {
            isPlay: true,
            duration: dur,
            totalTimeText: durTxt,
            playingIndex: global_audio.playingIndex,
            curExhibit: global_audio.curExhibit,
          })
          console.log(global_audio);
          this.onEndAudio();
  
        }, 300)
        this.onBgTimeUpdate();
  
      },
      
    },

    lifetimes: {
        async attached() {
           
            console.log('in attached player comp', (global_audio.bgAudio || {}).currentTime, global_audio.curExhibit);
            if (global_audio && global_audio.bgAudio) {
              this.triggerEvent('ContinuePlay', {
                isPlay: true,
                duration: global_audio.bgAudio.duration,
                totalTimeText: global_audio.totalTimeText,
              });
              setTimeout(()=> {
              this.onBgTimeUpdate();

              }, 1000)
              
            } else {
              try {
                global_audio.audioList = audioList;
                global_audio.curExhibit = audioList[0];
  
                const stored_audio = await wx.getStorageSync('audios');
                global_audio.stored_audio = stored_audio;
                // this.setData({
                //   stored_audio,
                // })
              } catch (error) {
                console.error(error)
              }
              await this.initPageAudio(audioList[0]);
              setTimeout(async () => {
                
                console.log('in player comp initPageAudio', global_audio)
  
              }, 300)
            }
            
        },
    },

})

// @ts-nocheck
// import { audioList } from './mock';
import { throttle, getCurrentPageParamStr } from '../../utils/util';
import { getExhibitList, sendListenAudioAction, getContinueListen, sendListenedAudioAction } from '../../api/api';
import { destroy } from 'XrFrame/kanata/lib/frontend';

const global_audio = getApp().globalData.audio;
Component({
  properties: {
    isShowPlayer: {
      type: Boolean,
      value: true,
    },
    isNewStyle: {
      type: Boolean,
      value: false
    },
    exhibitName: {
      type: String,
      value: '',
    },
    exhibitImg: {
      type: String,
      value: '',
    },
    isMoveable: {
      type: Boolean,
      value: true,
    },
    showShareTextDialog: {
      type: Boolean,
      value: false,
    },
    shareTextList: {
      type: Array,
      value: [],
    },
    exhibitIdList: {
      type: Array,
      value: [],
    }
  },
  data: {
    // audioList: audioList,
    // bgAudio: null as any,
    // playingIndex: 0,
    // stored_audio: [] as string[],
    // curExhibit: {},

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
    isShow: false,
    movex: getApp().globalData.ai.x,
    movey: getApp().globalData.ai.y,
    moveplayx: getApp().globalData.play.x,
    moveplayy: getApp().globalData.play.y,
    screenWidth:0,
    screenHeight:0, //手机屏幕高度
    continueListen: false, // 60分钟内 首页重启
    continueObj: {} as any,
    exhibit_name: '',
    exhibit_img: '', 
    curExhibit: {} as any,
    duration: getApp().globalData.audio.bgAudio?.duration,
    currentTime: getApp().globalData.audio.bgAudio?.currentTime,
    manStop: false,
    countdown: 10,
    countdownTimer: null as any, // 倒计时定时器
    popup_type: 'exhibitlist',
    popup_text: '',
  },
  observers: {
    'showShareTextDialog': function(newVal) {
      if (newVal) {
        this.startCountdown();
      } else {
        this.stopCountdown();
      }
    }
  },
  methods: {
    // 开始倒计时
    startCountdown() {
      this.setData({
        countdown: 10
      });
      
      this.data.countdownTimer = setInterval(() => {
        const currentCountdown = this.data.countdown - 1;
        this.setData({
          countdown: currentCountdown
        });
        
        if (currentCountdown <= 0) {
          this.handleClickClosePopup();
        }
      }, 1000);
    },
    
    // 停止并清除倒计时
    stopCountdown() {
      if (this.data.countdownTimer) {
        clearInterval(this.data.countdownTimer);
        this.setData({
          countdownTimer: null
        });
      }
    },
    handleClickClosePopup() {
      this.stopCountdown();
      this.triggerEvent('CountdownEnd', {});
    },
    handleClickPopup() {
      this.triggerEvent('ClickAIPopup', { popup_type: this.data.popup_type });
    },
    // sendListenAction(_packageid: any, _packageexhibitid: any) {
    //   try {
    //     sendListenAudioAction(_packageid, _packageexhibitid)
    //   } catch (error) {
    //     console.log(error);
    //   }
    // },
    handleAudioPause() {
      global_audio.bgAudio.pause();
      this.setData({
        isPlaying: false
      })
      // this.setData({
      //   playingIndex: -1,
      // })
    },
    handleAudioPlay() {
      const { playingIndex, audioList } = global_audio;

      console.log('global_audio.bgAudio', JSON.stringify(global_audio.bgAudio));

      if (global_audio.bgAudio && global_audio.bgAudio.src && !this.data.manStop) {
        global_audio.bgAudio.play();
      } else {
        this.handlePlayOtherAudio(audioList[playingIndex]);
        this.setData({
          manStop: false,
        })
      }
      
      this.setData({
        isPlaying: true,
      })
      // this.setData({
      //   playingIndex: -1,
      // })
    },
    handleSeekPlay(jumptime) {
      global_audio.bgAudio.seek(jumptime);
    },
    playNextAudio() {
      const { playingIndex, audioList } = global_audio;
      if (playingIndex + 1 >= audioList.length) {
        console.log('last one');
        wx.showToast({
          title: '本单元已播放完毕～',
          icon: 'none',
          duration: 2000
        })
      } else {
        this.triggerEvent('UpatePlayingIndex', {
          playingIndex: playingIndex + 1,
        })
        global_audio.playingIndex = playingIndex + 1;
        this.handlePlayOtherAudio(audioList[playingIndex + 1])
      }
    },
    playPrevAudio() {
      const { playingIndex, audioList } = global_audio;
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

      const audio = global_audio.audioList.find(i => i.id === _id);
      await this.handlePlayOtherAudio(audio);
    },
    async handlePlayOtherAudioByPlayingIdx(_playingidx) {
      const audio = global_audio.audioList[_playingidx];
      await this.handlePlayOtherAudio(audio);
    },
    async handlePlayOtherAudio(_audio) {
      const { bgAudio: { currentTime, duration }, curExhibit: {id, name} } = global_audio;
      // @ts-ignore
      this.tracker.report('audio_listen_time_e26', {
        id,
        name,
        currentTime,
        duration,
        percent: Number(((currentTime/duration) * 100).toFixed(2)),
      })
      global_audio.curExhibit = _audio;
      await this.initPageAudio(_audio);
    },
    generateAudioItem(_item: any) {
      // const audioitem = _item.audio_infos.find(i => i.narration_id == this.data.narrationId);
      // console.log('initPageAudio item;;;;;;;', audioitem, this.data.narrationId)
      
      const { audio_url, duration, audio_id } = _item.audioitem || {};
      const { name, image_url} = _item;
      return {
        src: audio_url,
        startTime: 0,
        title: name,
        epname: name,
        singer: 'gewugo',
        coverImgUrl: image_url,
        audio_id,
      }
    },
    async findLocalAudio(_url: string) {
      return false;
      const stored_audio_arr = global_audio.stored_audio;
      const file_name = _url.split('/audio/')[1].split('.mp3')[0];
      const stored_audio = await wx.getStorageSync('audios');
      global_audio.stored_audio = stored_audio;

      if (!stored_audio) {
        return "";
      }
      console.log('global_audio.stored_audio',global_audio.stored_audio)
      return global_audio.stored_audio.find((item) => item.includes(file_name))

    },
    calTimeTxt(_time: number) {
      if (_time < 3600) {
        const min = Math.floor(_time / 60);
        const min_str = (min < 10) ? ('0' + min) : min;
        const sec = (_time % 60);
        const sec_str = (sec < 10) ? ('0' + sec) : sec;
        return min_str + ':' + sec_str
      } else {
        const hour = Math.floor(_time / 3600);
        const hour_str = (hour < 10) ? ('0' + hour) : hour;

        const minute = Math.floor((_time % 3600) / 60);
        const minute_str = (minute < 10) ? ('0' + minute) : minute;

        const second = ((_time % 3600) % 60);
        const second_str = (second < 10) ? ('0' + second) : second;

        return hour_str + ':' + minute_str + ':' + second_str;
      }
    },
    // onEndAudio() {
    //   global_audio.bgAudio.onEnded(() => {
    //     console.log('end----------------------------');
    //     global_audio.isPlay = false;
    //     this.triggerEvent('EndAudio');
    //     this.setData({
    //       isPlaying: false,
    //     })
    //   })
    // },
    checkIsAudioPlaying() {
      if (global_audio && global_audio.bgAudio) {
        if (global_audio.bgAudio.paused) {
          return {
            isAudioExist: true,
            isPlay: false,
            playingIndex: global_audio.playingIndex,
            totalTimeText: global_audio.totalTimeText,
            duration: global_audio.bgAudio.duration,
          }
        } else {
          return {
            isAudioExist: true,
            isPlay: true,
            playingIndex: global_audio.playingIndex,
            totalTimeText: global_audio.totalTimeText,
            duration: global_audio.bgAudio.duration,
          }
        }
      }
      return {
        isAudioExist: false,
      }
    },
    refreshPageStatusFromCurrentPlayingStatus() {
      const paused = global_audio.bgAudio.paused;
      console.log('refreshPageStatusFromCurrentPlayingStatus', global_audio.playingIndex);

      this.triggerEvent('GetCurPlayingStatus', {
        isPlay: !paused,
        playingIndex: global_audio.playingIndex,
        totalTimeText: global_audio.totalTimeText,
        duration: global_audio.bgAudio.duration,
      })
      this.setData({
        isPlaying: !paused
      })
    },
    pageTimeUpateContinue() {
      if (global_audio && global_audio.bgAudio) {
        this.refreshPageStatusFromCurrentPlayingStatus();
        this.onBgTimeUpdate();
        console.log('audio continue');
      } else {
        console.log('no audio continue');
      }
    },
    onBgTimeUpdate() {
      let id_flag = false;
      // const isLastExhibit = global_audio.curExhibit.id === this.data.lastExhibitId;
      const cur_exhibit_idx = this.data.exhibitIdList.findIndex(i => i === global_audio.curExhibit.id);
      const need_popup_idx = Math.floor(this.data.exhibitIdList.length * 0.85);
      const isNeedPopup = cur_exhibit_idx >= need_popup_idx;
      console.log('isNeedPopup.isNeedPopup', isNeedPopup, cur_exhibit_idx, need_popup_idx)
      global_audio.bgAudio.onTimeUpdate(throttle(() => {
       
        const time = Number(parseFloat(global_audio.bgAudio.currentTime).toFixed(2));
        const dur = global_audio.bgAudio.duration;

        const timeTxt = this.calTimeTxt(Math.floor(time));
        global_audio.sliderIndex = time;
        global_audio.currentTimeText = timeTxt;

        // this.setData({
        //   sliderIndex: time,
        //   currentTimeText: timeTxt,
        // })
        if (time > 1 && time > dur / 3 && (time < ((dur / 3) + 1.9))) {
          // todo
          const curAudio: any = global_audio.curExhibit;
          if (curAudio && curAudio.audioitem && curAudio.audioitem.audio_id) {
            // TODO: 需要传入正确的 packageid 和 packageexhibitid 参数
            sendListenedAudioAction(global_audio.curPackageId, global_audio.curExhibit.id)
            console.log('需要更新为新的套餐展品收听接口参数')
            // this.setData({
            //   listenedExhibitList: {
            //     ...this.data.listenedExhibitList,
            //     [curAudio.id]: true,
            //   }
            // })
            console.log('> 1/3', this.data.listenedExhibitList)
    
          }
        }
        if (isNeedPopup) {
          // if (!id_flag && (time < dur -25) && (time > dur - 35) && (global_audio.curExhibit.share_texts && global_audio.curExhibit.share_texts.length > 0)) {
          if (!id_flag && (time < dur -25) && (time > dur - 35) && (global_audio.curExhibit.share_texts && global_audio.curExhibit.share_texts.length > 0)) {
            // todo
            this.setData({
              popup_type: 'exhibitlist',
              popup_text: `进入分享页，分享《${global_audio.curExhibit.name}》的创作由来`,
            })
            this.triggerEvent('ShareTextTimeUp', {
              share_texts: global_audio.curExhibit.share_texts,
            })
          }
          if (!id_flag && (time < dur -5) && (time > dur - 15)) {
            // todo
            id_flag = true;
            this.setData({
              popup_type: 'package',
              popup_text: `讲解尾声，一定有很多值得带走的记忆～查看我的专属观展记录`,
            })
            this.triggerEvent('ShareTextTimeUp', {
              share_texts: [''],
            })
          }
        } else {
          if (!id_flag && (time < dur -5) && (time > dur - 15) && (global_audio.curExhibit.share_texts && global_audio.curExhibit.share_texts.length > 0)) {
          // if (!id_flag && (time < dur -5) && (time > dur - 100) && (global_audio.curExhibit.share_texts && global_audio.curExhibit.share_texts.length > 0)) {
            // todo
            id_flag = true;
             this.setData({
              popup_type: 'exhibitlist',
              popup_text: `进入分享页，分享《${global_audio.curExhibit.name}》的创作由来`,
            })
            this.triggerEvent('ShareTextTimeUp', {
              share_texts: global_audio.curExhibit.share_texts,
            })
          }
        }
        
        
        this.setData({
          currentTime: time,
          isPlaying: !global_audio.bgAudio.paused,
        })
        
        this.triggerEvent('TimeUpdate', {
          currentTime: time,
          sliderIndex: time,
          currentTimeText: timeTxt,
        })
      }, 1000));

      global_audio.bgAudio.onPause(() => {
        console.log('onPause')
        this.triggerEvent('OnPlayerPause');
        this.setData({
          isPlaying: false,
        })
      })

      global_audio.bgAudio.onPlay(() => {
        console.log('onPlay')
        this.triggerEvent('OnPlayerPlay');
        this.setData({
          isPlaying: true,
        })
      })

      global_audio.bgAudio.onEnded(() => {
        console.log('onEnded')
        this.triggerEvent('OnPlayerEnded');
        this.setData({
          isPlaying: false,
        })
      })
      global_audio.bgAudio.onStop(() => {
        console.log('onStop')
        this.triggerEvent('OnPlayerStop');
        this.setData({
          isPlaying: false,
          manStop: true,
        })
      })
      global_audio.bgAudio.onError(() => {
        console.log('onError')
        
      })
      
    },
    async initPageAudio(audio_item: any) {
      const audio_i = this.generateAudioItem(audio_item);
      const { src, startTime, title, epname, singer, coverImgUrl, audio_id } = audio_i;      

      let local_audio = await this.findLocalAudio(src);
      
      console.log('audio_iaudio_i', audio_i)
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
        global_audio.bgAudio.manualStop = false;
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
        global_audio.bgAudio.manualStop = false;
        console.log('bgAudiobgAudiobgAudiobgAudiobgAudio', bgAudio)
        // this.setData({
        //   isPlay: true,
        //   bgAudio,
        //   lastPlayIndex: global_audio.playingIndex,
        // })
      }
      setTimeout(() => {
        let duration = global_audio.bgAudio.duration;

        if (!duration || !isFinite(duration)) {
          duration = audio_item.audioitem.duration;
          // duration = Number(duration_fmt.split(':')[0]) * 60 + Number(duration_fmt.split(':')[1]);
        }
        console.log('global_audio.audioList', global_audio.audioList);
        const playingIdx = global_audio.audioList.findIndex(i => i.id === global_audio.curExhibit.id);
        global_audio.playingIndex = playingIdx;

        const dur = Math.round(duration);
        const durTxt = this.calTimeTxt(dur);
        
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
        });

        // 更新首页继续播放浮窗字段
  
        

        this.setData({
          isPlaying: true,
        })
        console.log(global_audio);
        // this.onEndAudio();

      }, 300)
      this.onBgTimeUpdate();
      this.setData({
        isShow: true,
      })
      try {
        // TODO: 需要传入正确的 packageid 和 packageexhibitid 参数
        console.log('global_audio----', global_audio.curPackageId);
        sendListenAudioAction(global_audio.curPackageId, global_audio.curExhibit.id);
        console.log('需要更新为新的套餐展品收听接口参数', title, coverImgUrl)
      } catch (error) {
        console.error(error)
      }
    },

    async initAudioListNotPlay(_audioList) {
      try {
        // const res = await getExhibitList(this.data.unitId);
        console.log('initAudioListNotPlay', _audioList);
        global_audio.audioList = _audioList;

      } catch (error) {
        console.error(error)
      }
    },

    async initAudioList(_audioList, _curExhibit) {
      try {
        // const res = await getExhibitList(this.data.unitId);
        console.log('initAudioList', _audioList, _curExhibit);
        global_audio.audioList = _audioList;
        global_audio.curExhibit = _curExhibit;
        global_audio.playingIndex = _audioList.findIndex(i => i.id === _curExhibit.exhibit_id);
        // const stored_audio = await wx.getStorageSync('audios');
        // global_audio.stored_audio = stored_audio;
        // this.setData({
        //   stored_audio,
        // })
      } catch (error) {
        console.error(error)
      }
      await this.initPageAudio(_curExhibit);
    },

    destroyBgAudio () {
      if (global_audio.bgAudio) {
        global_audio.bgAudio.stop();
        global_audio.bgAudio.manualStop = true;
        this.setData({
          isShow: false,
        })
      } else if (this.data.continueListen) {
        this.setData({
          isShow: false,
        })
      }
    },

    handleClickPlayerComp() {
      const params = this.data.continueListen ? {
        continueListen: this.data.continueListen,
        continueObj: this.data.continueObj,
      }: {
        continueListen: this.data.continueListen,
      }
      this.triggerEvent('ClickPlayerComp',params)
    },
    
  handleClickAiRobot() {
    console.log('handleClickAiRobot')
    const params = getCurrentPageParamStr();
    const targetPage = "/pages/agent/index";
    wx.navigateTo({
      url: targetPage + params
    })
  },

  handleChange(e: any) {
    // console.log(e);
    const { x, y} = e.detail;
      // this.setData({
      //   x,
      //   y,
      // })
    getApp().globalData.ai.x = x;
    getApp().globalData.ai.y = y;
    // setTimeout(() => {
    //   const { x, y} = e.detail;
    //   // this.setData({
    //   //   x,
    //   //   y,
    //     // })
    //   getApp().globalData.ai.x = x;
    //   getApp().globalData.ai.y = y;
    //   console.log('change', getApp().globalData.ai.x)
    // }, 100)
    
  },
  handlePlayIconChange(e: any) {
    // console.log(e);
      const { x, y} = e.detail;

      getApp().globalData.play.x = x;
      getApp().globalData.play.y = y;  
    
  },

  handleClickClosePlayer() {
    console.log('handleClickClosePlayer');
    this.destroyBgAudio();
  },

  async getContinueListenContent() {
    const res: any = await getContinueListen();
    if (res && res.code === 0 && res.data && res.data.exhibit_id) {
      console.log('getContinueListenContent', res.data.exhibit_id)
      this.setData({
        exhibitName: res.data.exhibit_name,
        exhibitImg: res.data.exhibit_img_url,
        isShow: true,
        continueListen: true,
        continueObj: res.data,
      })
    }
  },



  },


  



  lifetimes: {
    async attached() { 
      const systemInfo = wx.getSystemInfoSync();
      console.log('attached: ', getApp().globalData.ai.x, getApp().globalData.ai.y)
      this.setData({
        screenWidth: systemInfo.screenWidth,
        screenHeight: systemInfo.screenHeight,
        movex: getApp().globalData.ai.x,
        movey: getApp().globalData.ai.y
        // y: systemInfo.screenHeight - 200
      });

      if (global_audio && global_audio.bgAudio) {
      console.log('in attached player comp',global_audio.bgAudio.paused);

        this.setData({
          isShow: !global_audio.bgAudio.manualStop,
          moveplayx: getApp().globalData.play.x,
          moveplayy: getApp().globalData.play.y
        })
        this.triggerEvent('ContinuePlay', {
          isPlay: true,
          duration: global_audio.bgAudio.duration,
          totalTimeText: global_audio.totalTimeText,
        });
        setTimeout(() => {
          this.onBgTimeUpdate();

        }, 1000)

      } else {
        try {
          // const res = await getExhibitList(this.data.unitId);
          // console.log('not in attached player comp', this.data.audioList);
          // global_audio.audioList = this.data.audioList;
          // global_audio.curExhibit = this.data.curExhibit;

          // const stored_audio = await wx.getStorageSync('audios');
          // global_audio.stored_audio = stored_audio;
          // this.setData({
          //   stored_audio,
          // })
          this.setData({
            isShow: false,
          })
        } catch (error) {
          console.error(error)
        }
        // await this.initPageAudio(audioList[0]);

      }

    },
    detached() {
      // 组件销毁时清理倒计时定时器
      this.stopCountdown();
    }
  },
  pageLifetimes: {
    show() {
      console.log('in attached player comp show', global_audio.bgAudio?.duration);
      if (global_audio && global_audio.bgAudio) {
        const { bgAudio: {manualStop, paused, currentTime }, curExhibit, duration } = global_audio;
        this.setData({
          isShow: !manualStop,
          isPlaying: !paused,
          moveplayx: getApp().globalData.play.x,
          moveplayy: getApp().globalData.play.y,
          continueListen: false,
          curExhibit: curExhibit,
          duration: getApp().globalData.audio.bgAudio?.duration,
          currentTime: currentTime,
        });
        this.onBgTimeUpdate();
      } else if(this.data.isNewStyle) {
        this.getContinueListenContent();
      } else {
        this.setData({
          isShow: false,
          continueListen: false,
        })
      }

      this.setData({
        movex: getApp().globalData.ai.x,
        movey: getApp().globalData.ai.y
      })
    }
  }

})

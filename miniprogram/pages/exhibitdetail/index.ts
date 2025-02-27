import { getExhibitById, getExhibitList, likeExhibit, collectExhibit } from '../../api/api';
import { getCurrentPageParamStr, backToTargetPage } from '../../utils/util';

const listConfig = [
  {
    id: 1,
    name: '播放',
  },
  {
    id: 2,
    name: '讲词',
  },

]


Page({
  data: {
    exhibitInfo: {} as any,
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
    currentTime: 0,

    exhibitList: [] as any,
    isPlay: false, // 当前是否播放
    showDialog: false,
    showMenuDialog: false,
    rateSlider: 2,
    rateMax: 4,
    rateMin: 1,
    curRate: "1.0",
    listConfig,
    topSwiperSelectIdx: 1,
    audioList: [],
    isCollected: 0,
    isLiked: 0,
    narrationId: -1,
    unitId: -1,
    userid: -1,
    exhibitId: -1,
  },

  handleReadyPlay(event: any) {
    const { duration, totalTimeText, isPlay, playingIndex } = event.detail;
    this.setData({
      isPlay,
      duration,
      totalTimeText,
      playingIndex,
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
  handleContinuePlay(event: any) {
    const { isPlay, duration, sliderIndex, totalTimeText } = event.detail;
    this.setData({
      isPlay,
      duration,
      sliderIndex,
      totalTimeText,
    })
  },
  handleUpatePlayingIndex(event: any) {
    const { playingIndex } = event.detail;
    this.setData({
      playingIndex,
    })
  },
  handleEndAudio() {
    this.setData({
      isPlay: false,

    })
  },
  handleClickPlayerComp() {
    const targetPage = "pages/exhibitlist/index";
    backToTargetPage(targetPage);
  },
  // handleChangeUnit(e: any) {
  //   const { selectId } = e.detail;
  //   this.setData({
  //     topSwiperSelectIdx: Number(selectId),
  //   })
  // },



  // swiper-unit组件
  handleChangePannelId(event: any) {
    const { selectId } = event.detail;
    console.log('handleChangePannelId', selectId);
    this.setData({
      topSwiperSelectIdx: selectId,
    });
  },

  // swiper-card 4
  async handleClickExhibitItem(event: any) {
    this.setData({
      isPlay: false,
    });
    const { selectId } = event.detail;
    const player = this.selectComponent("#player")
    await player.handlePlayOtherAudioById(selectId);
  },



  handleCloseDialog() {
    console.log('handleCloseDialog');
    this.setData({
      showDialog: false,
    })
  },
  handleCloseMenuDialog() {
    console.log('handleCloseDialog');
    this.setData({
      showMenuDialog: false,
    })
  },
  handleClickMenu() {
    this.setData({
      showMenuDialog: true,
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
    const curPlayIdx = this.data.playingIndex;
    console.log('handlePlayNext', curPlayIdx, this.data.exhibitList.length)

    if (curPlayIdx + 1 < this.data.exhibitList.length) {
      const next_exhibit = this.data.exhibitList[curPlayIdx + 1];
      this.setData({
        exhibitInfo: next_exhibit,
      })
      const player = this.selectComponent("#player");
      player.playNextAudio();
    }
  },
  handlePlayPrev() {
    const curPlayIdx = this.data.playingIndex;
    if (curPlayIdx > 0) {
      const prev_exhibit = this.data.exhibitList[curPlayIdx - 1];
      this.setData({
        exhibitInfo: prev_exhibit,
      })
      var player = this.selectComponent("#player");
      player.playPrevAudio();
    }
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

  handleRateSliderChange(event: any) {
    console.log('handleRateSliderChange', event);
    const value = event.detail.value;
    this.setData({
      curRate: (value / 2).toFixed(1),
    })
    this.handlePlayRate(value / 2)
  },
  async handleClickCollect() {
    const isCollected = + !this.data.isCollected;
    const {userid, exhibitId } = this.data;
    let options = { method: 'POST'};
    if (!isCollected) {
      options = { method: 'DELETE'};
    }
    const res: any = await collectExhibit(userid, exhibitId, options);
    console.log('res---', res);
    if (res && res.code === 200) {
      this.setData({
        isCollected: + !this.data.isCollected,
      })
    }
  },
  async handleClickLike() {
    const isLiked = + !this.data.isLiked;
    const {userid, exhibitId } = this.data;
    let options = { method: 'POST'};
    if (!isLiked) {
      options = { method: 'DELETE'};
    }
    const res: any = await likeExhibit(userid, exhibitId, options);
    console.log('res---', res);
    if (res && res.code === 200) {
      this.setData({
        isLiked: + !this.data.isLiked,
      })
    }
  },

  // 业务逻辑

  formatExhibitData(_exhibit: any, _narrationid: any) {
      const audioitem = _exhibit.audio_infos.find((i:any) => i.narration_id == _narrationid);
      console.log('initPage formatExhibitData', audioitem)

      return {
        ..._exhibit,
        audioitem,
      }
  },

  formatExhibitList(_exhibitlist: any, _narrationid: any) {
    return _exhibitlist.map((exhibit: any) => {
      return this.formatExhibitData(exhibit, _narrationid)
    })
  },

  async initPage(_exhibitid: any) {
    this.setData({
      loading: true,
    })
    
    try {
      const res: any = await getExhibitById(_exhibitid);
      const exhibit_info = this.formatExhibitData(res.exhibit, this.data.narrationId);
      const unit_id = exhibit_info.unit_id;
      const res_exhibitlist: any = await getExhibitList(unit_id);

      const exhibit_list = this.formatExhibitList(res_exhibitlist.exhibits, this.data.narrationId);
      console.log('exhibit_info 111', res.exhibit);

      const player = this.selectComponent("#player");
      player.initAudioList(exhibit_list, exhibit_info);
      this.setData({
        exhibitInfo: exhibit_info,
        exhibitList: exhibit_list,
        isCollected: exhibit_info.collected,
        isLiked: exhibit_info.liked,
        loading: false,
      })
    } catch (error) {
      console.error(error); 
      this.setData({
        loading: false,
      })
    }
  },
  handleGetCurPlayingStatus(event: any) {
    const { isPlay } = event.detail;
    console.log('handleGetCurPlayingStatus', isPlay)
    this.setData({
      isPlay,
    })
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

  async onShow() {

    const { userid= 0 } = await wx.getStorageSync('userinfo'); 
    if (userid) {
      this.setData({
        userid,
      })
    }
    const player = this.selectComponent("#player");
    player.pageTimeUpateContinue();
    this.setData({
      loading: false,
    })
  },
  onLoad(options) {
    if (options) {
      this.setData({
        narrationId: Number(options.narration_id),
        unitId: Number(options.unit_id),
        exhibitId: Number(options.exhibit_id),
      }, () => {
        this.initPage(options.exhibit_id);
      })

    }
    
  },
  onShareAppMessage(){
    const defaultUrl = 'https://gewugo.com/storage/image/GC07356611338310.jpg';
    console.log(this.data.exhibitInfo.image_url);
    const str = getCurrentPageParamStr();
    const imageUrl = (this.data.exhibitInfo && this.data.exhibitInfo.image_url) ? this.data.exhibitInfo.image_url : defaultUrl ;
    const title = (this.data.exhibitInfo.name) ? `格物观展|${this.data.exhibitInfo.name}` : '【格物观展：让您的博物馆之旅不虚此行】' ;
    var shareObj = {
      title,
      path: '/pages/museum/museumdetail/index'+str,
      imageUrl: imageUrl,
      success: function(res: any){
        if(res.errMsg == 'shareAppMessage:ok'){
          console.log('share success')
        }
      },
      fail: function(res: any){
        if(res.errMsg == 'shareAppMessage:fail cancel'){
          console.log('share cancel')
        }else if(res.errMsg == 'shareAppMessage:fail'){
          console.log('share fail')
        }
      },
    }
    return shareObj;
  },

})

import { getUnitList, getExhibitList, queryExhibitListAll } from '../../api/api';
import { generateNewUrlParams, getCurrentPageParamStr, getCurrentPageParam, transferObjToUrlParams, calTimeTxt } from '../../utils/util';
import { Exhpoints } from './points';

const base_url = "http://gewugo.com";

Page({
  data: {
    exhibitList: [],
    lastPlayIndex: -1, // 之前播放index
    topBarHeight: 0,
    safeHeight: 0,
    windowHeight: 0,
    statusBarHeight: 0,
    bgAudio: null as any,
    isAutoPlay: false,
    stored_audio: [] as string[],
    unitList: [],
    searchList: [] as any,
    showFindDialog: false,
    showMapDialog: false,
    showInput: true,

    // 一定用到的
    isPlay: false,
    duration: 0, // 当前audio时长
    totalTimeText: '00:00',
    currentTime: 0,
    currentTimeText: '00:00',
    sliderIndex: 0, // 当前播放进度
    playingIndex: -1, // 当前播放index
    curExhibit: {} as any, // 当前播放展览
    curUnitId: -1, // 当前单元id
    narrationId: -1, // 页面params语音包id
    exhibitionId: -1,
    listAreaHeight: '0px', // 播放列表区域高度
    lastExhibitionId: -1,
    audiolist: [],
    mapPoints: Exhpoints, // 地图点
    currentPointIdx: 0, // 当前点index
   
    // playProgress: 0,
  },

  // player-comp
  handleReadyPlay(event: any) {
    const { duration, totalTimeText, isPlay, playingIndex, curExhibit } = event.detail;
    this.setData({
      isPlay,
      duration,
      totalTimeText,
      playingIndex,
      curExhibit,
    });
    console.log('curExhibit', curExhibit)
  },
  handleTimeUpdate(event: any) {
    const { sliderIndex, currentTimeText, currentTime } = event.detail;
    this.setData({
      currentTime,
      sliderIndex,
      currentTimeText,
    })

  },
  handleEndAudio() {
    this.setData({
      isPlay: false,
    })
  },
  playSelectedAudio() {
    console.log('playSelectedAudio');

  },
  handleGetCurPlayingStatus(event: any) {
    const { isPlay, playingIndex, totalTimeText, duration } = event.detail;
    console.log('handleGetCurPlayingStatus', isPlay);
    
    this.setData({
      isPlay,
      playingIndex,
      totalTimeText,
      duration
    })
  },


  // swiper-card6 list
  async handleClickExhibitItem(event: any) {
    this.setData({
      isPlay: false,
    });
    const { selectId } = event.detail;
    const player = this.selectComponent("#player");
    await player.handlePlayOtherAudioById(selectId);
  },
  async handleClickItemImage(event: any) {
    console.log('handleClickItemImage')
    this.setData({
      isPlay: false,
    });
    const { selectId } = event.detail;
    const player = this.selectComponent("#player")
    await player.handlePlayOtherAudioById(selectId);
    const url_params = generateNewUrlParams({
      exhibit_id: selectId
    })
    wx.navigateTo({
      url: '/pages/exhibitdetail/index' + url_params
    });
  },

  handleAudioPlay() {
    console.log('handleAudioPlay');
    this.setData({
      isPlay: true,
    })
    const player = this.selectComponent("#player")
    player.handleAudioPlay();

  },
  handleAudioPause() {
    console.log('handleAudioPause');
    this.setData({
      isPlay: false,
    })
    const player = this.selectComponent("#player")
    player.handleAudioPause();
  },
  handlePlayNext() {
    const player = this.selectComponent("#player");
    player.playNextAudio();
  },
  handlePlayPrev() {
    const player = this.selectComponent("#player");
    player.playPrevAudio();
  },



  // swiper-card4 
  handleSwiperItemChange(event: any) {
    const { current } = event.detail;
    const player = this.selectComponent("#player")
    player.handlePlayOtherAudioByPlayingIdx(current);
  },

  handleSwiperItemClick(event: any) {
    const { id } = event.detail;
    const url_params = generateNewUrlParams({
      exhibit_id: id
    })
    wx.navigateTo({
      url: '/pages/exhibitdetail/index' + url_params
    });
  },

  handleCloseFindDialog() {
    this.setData({
      showFindDialog: false,
    })
  },
  handleCloseMapDialog() {
    const map = this.selectComponent("#map")
    map.clearCanvas();
    this.setData({
      showMapDialog: false,
    })
    
  },
  handleOpenFindDialog() {
    this.setData({
      showFindDialog: true,
      showInput: true,
      searchList: [],
    })
  },
  handleOpenMapDialog() {
    console.log('exhibitionId', this.data.exhibitionId)
    if (this.data.exhibitionId !== 26) {
     return 
    }
    this.getCurrentPointIdx(this.data.mapPoints);
    this.setData({
      showMapDialog: true,
    })
    const map = this.selectComponent("#map")
    map.drawCanvas();
    // this.drawCanvas();
  },
  async handleClickSearch(event: any) {
    const { keyword } = event.detail;
    console.log('keyword', keyword);
    const { userid } = getApp().globalData.userinfo;
    this.setData({
      showInput: false,
    });
    try {
      const url_params = transferObjToUrlParams({
        keyword: keyword,
        exhibitionID: this.data.exhibitionId,
      })
      const res:any = await queryExhibitListAll(userid, url_params)
      if( res && res.exhibits) {
        const f_exhibitlist = this.formatExhibitData(res.exhibits, this.data.narrationId);
        this.setData({
          searchList: f_exhibitlist,
        })
      }
    } catch (error) {
      console.error(error)
    }
    
  },
  async getAudioListAll() {
    const { userid } = getApp().globalData.userinfo;
    try {
      const url_params = transferObjToUrlParams({
        exhibitionID: this.data.exhibitionId,
      })
      const res:any = await queryExhibitListAll(userid, url_params)
      if( res && res.exhibits) {
        const f_exhibitlist = this.formatExhibitData(res.exhibits, this.data.narrationId);
        const audiolist = f_exhibitlist.map((i: any) => i.audioitem.audio_url.replace('http', 'https'));
        this.setData({
          audiolist,
        })
      }
    } catch (error) {
      console.error(error)
    }
  },
  async handleClickSearchExhibitItem(event: any) {
    this.setData({
      isPlay: false,
    });
    const { selectId } = event.detail;
    const player = this.selectComponent("#player")

    const search_item = this.data.searchList.find((i:any) => i.id === selectId);
    console.log('search item', selectId, search_item);
    if (search_item.unit_id !== this.data.curUnitId) {
      await this.playOtherUnit(search_item.unit_id);
      setTimeout(async () => {
        await player.handlePlayOtherAudioById(selectId);
      }, 100)
    } else {
      await player.handlePlayOtherAudioById(selectId);
    }
    
  },

  playOtherUnit(_unitid: any) {
    this.setData({
      curUnitId: _unitid,
    });
    getApp().globalData.audio.curUnitId = _unitid;
    // this.updateUnitId(_unitid);
    this.initExhibitData(_unitid)
  },


  // swiper-unit组件
  handleChangeUnit(event: any) {
    const { selectId } = event.detail;
    console.log('handleChangeUnit', selectId);
    this.setData({
      curUnitId: selectId,
    });
    getApp().globalData.audio.curUnitId = selectId;

    // this.updateUnitId(selectId);
    this.initExhibitData(selectId)
  },

  formatExhibitData(_exhibitlist: any, _narrationid: any) {
    return _exhibitlist.map((exhibit: any) => {
      // if (!exhibit.audio_infos){
      //   return null
      // }
      const audioitem = exhibit.audio_infos.find((i:any) => i.narration_id == _narrationid);
      const duration_fmt = calTimeTxt(audioitem.duration);
      console.log('initPage formatExhibitData', duration_fmt)

      return {
        ...exhibit,
        audioitem: {
          ...audioitem,
          duration_fmt, 
        },
      }
    })
  },

  async getExhibitDataWithNoPlayer(_unitid: any, _playingIndex: any) {
    this.setData({
      loading: true,
    })
    try {
      const res_exhibitlist: any = await getExhibitList(_unitid);
      const f_exhibitlist = this.formatExhibitData(res_exhibitlist.exhibits, this.data.narrationId);

      this.setData({
        exhibitList: f_exhibitlist,
        curExhibit: f_exhibitlist[_playingIndex],
      })
      
      this.setData({
        loading: false,
      })
    } catch (error) {
      this.setData({
        loading: false,
      })
    }
  },

  async initExhibitData(_unitid: any) {
    this.setData({
      loading: true,
    })
    try {
      const res_exhibitlist: any = await getExhibitList(_unitid);
      const f_exhibitlist = this.formatExhibitData(res_exhibitlist.exhibits, this.data.narrationId);
      console.log('initExhibitData 111', f_exhibitlist)
      const audiolist = f_exhibitlist.map((i: any) => i.audioitem.audio_url.replace('http', 'https'));

      this.setData({
        exhibitList: f_exhibitlist,
        curExhibit: f_exhibitlist[0],
      })
      const player = this.selectComponent("#player");
      player.initAudioList(f_exhibitlist, f_exhibitlist[0]);
      this.setData({
        loading: false,
      })
    } catch (error) {
      this.setData({
        loading: false,
      })
    }
  },

  // 业务逻辑
  async initPage(_exhibitionid: any) {
    try {
      const res_unit : any = await getUnitList(_exhibitionid);
      const player = this.selectComponent("#player");
      const isPlayingAudio = player.checkIsAudioPlaying();
      const lastExhibitionId = this.data.lastExhibitionId;

      if (res_unit && res_unit.units && res_unit.units.length) {
        this.setData({
          unitList: res_unit.units,
        })

        if (!isPlayingAudio.isAudioExist || lastExhibitionId !== _exhibitionid) {
          this.setData({
            curUnitId: res_unit.units[0].id,
          })
          getApp().globalData.audio.curUnitId = res_unit.units[0].id;
          console.log('isPlayingAudio', isPlayingAudio)
          
          this.initExhibitData(res_unit.units[0].id);
        } else {
          const lastUnitId = getApp().globalData.audio.curUnitId;
          const { isPlay, playingIndex, totalTimeText, duration } = isPlayingAudio;
          const unit_id = lastUnitId === -1 ? res_unit.units[0].id : lastUnitId;
          this.setData({
            isPlay,
            playingIndex,
            totalTimeText,
            duration,
            curUnitId: unit_id,
          })
          console.log('this.data.curUnitId', playingIndex)
          this.getExhibitDataWithNoPlayer(unit_id, playingIndex);
          player.pageTimeUpateContinue();
        }
      }
      this.setData({
        loading: false,
      })
    } catch (error) {
      this.setData({
        loading: false,
      })
    }
  },
  getCurrentPointIdx(_point: any) {
    // let currentPoint = [0, 0];
    const id = getApp().globalData.audio.curExhibit.id;
    const keys = Object.keys(_point);
    const idx = keys.findIndex((i: any) => Number(i) === Number(id));

    this.setData({
      currentPointIdx: idx,
    })
    console.log('id-----', keys)
  },


  onShow() {
    console.log('onShow onShow', getApp().globalData.audio.curExhibition)

    const hei = getApp().globalData.system.statusBarHeight;

    this.setData({
      loading: true,
      listAreaHeight: hei + 'px',
      lastExhibitionId: getApp().globalData.audio.curExhibition,
    })
    const player = this.selectComponent("#player");
    player.pageTimeUpateContinue();
    // if (this.data.exhibitionId !== -1) {
    //   this.initPage(this.data.exhibitionId);
    // }
    setTimeout(() => {
      const params = getCurrentPageParamStr();
      const { exhibition_id } = getCurrentPageParam();
      getApp().globalData.audio.exhibitlistParams = params;
      getApp().globalData.audio.curExhibition = exhibition_id;
    }, 1000)
   
    

  },
  onLoad(options) {
    console.log('onShow onLoad')

    if(options && options.exhibition_id) {

      this.setData({
        exhibitionId: Number(options.exhibition_id),
      })
      // const player = this.selectComponent("#player");
      // const isPlayingAudio = player.checkIsAudioPlaying();
      // console.log('isPlayingAudio', isPlayingAudio)
      // if (!isPlayingAudio) {
        
      // }
      this.initPage(options.exhibition_id);
      this.getAudioListAll();
    }
    
    if (options) {
      this.setData({
        narrationId: Number(options.narration_id),
      },() => {
        console.log('initPageAudio options.narration_id', options.narration_id);

      })

    }
    
  }


})

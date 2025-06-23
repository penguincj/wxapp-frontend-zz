import { getUnitList, getExhibitById, getExhibitList, queryExhibitListAll, sendListenedAudioAction } from '../../api/api';
import { generateNewUrlParams, getCurrentPageParamStr, getCurrentPageParam, transferObjToUrlParams, calTimeTxt, getLoginStatus } from '../../utils/util';
import { Exhpoints } from './points';

const base_url = "http://gewugo.com";
const UNITALLID = 999999;

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
    unitList: [] as any,
    searchList: [] as any,
    showFindDialog: false,
    showMapDialog: false,
    showRateDialog: false,
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
    safeAreaBottomHeight: '0px', // 安全区域底部高度
    lastExhibitionId: -1,
    audiolist: [],
    mapPoints: Exhpoints, // 地图点
    currentPointIdx: 0, // 当前点index

    rateSlider: 2,
    rateMax: 6,
    rateMin: 3,
    curRate: getApp().globalData.audio.curRate || "1.0",
    isListType: true,
    isKeepPlayingActive: false, // 是否联播
    listenedExhibitList: {} as any, // 已听列表
    pagetitle: '',
   
    // playProgress: 0,
  },

  handleClickListType() {
    this.setData({
      isListType: !this.data.isListType,
    })
  },

  handleClickPannelSearch() {
    const url_params = generateNewUrlParams({
      type: 'exhibition',
      exhibition_id: this.data.exhibitionId,
    });
    wx.navigateTo({
      url: '/pages/searchpage/index' + url_params,
    })
  },

  handleClickRepeatPlaying() {
    if (getApp().globalData.audio.isKeepPlaying) {
      getApp().globalData.audio.isKeepPlaying = false;
      this.setData({
        isKeepPlayingActive: false
      })
      wx.showToast({
        title: '已为您关闭连续播放～',
        icon: 'none',
        duration: 2000
      })
      
    } else {
      getApp().globalData.audio.isKeepPlaying = true;
      this.setData({
        isKeepPlayingActive: true
      })
      wx.showToast({
        title: '已为您开启连续播放～',
        icon: 'none',
        duration: 2000
      })
      
    }
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
    // console.log('handleTimeUpdate', this.data.duration, currentTime)
    this.setData({
      currentTime,
      sliderIndex,
      currentTimeText,
    })
    if (currentTime > 1 && currentTime > this.data.duration / 3 && (currentTime < ((this.data.duration / 3) + 1.9))) {
      const curAudio: any = this.data.curExhibit;
      if (curAudio && curAudio.audioitem && curAudio.audioitem.audio_id) {
        // sendListenedAudioAction(curAudio.audioitem.audio_id, { method: 'POST' })
        this.setData({
          listenedExhibitList: {
            ...this.data.listenedExhibitList,
            [curAudio.id]: true,
          }
        })
        console.log('> 1/3', this.data.listenedExhibitList)

      }
    }

  },
  handleEndAudio() {
    console.log('------end !!!')
    if (getApp().globalData.audio.isKeepPlaying) {
      this.handlePlayNext();
    } else {
      this.setData({
        isPlay: false,
      })
    }
    
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
    console.log('event.detail', selectId)

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
      exhibit_id: selectId,
      unit_id: this.data.curUnitId,
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
      exhibit_id: id,
      unit_id: this.data.curUnitId,
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
  handleClickOpenRate() {
    this.setData({
      showRateDialog: true,
    })
  },
  handleRateSliderChange(event: any) {
    const value = event.detail.value;
    let curRate = (value / 4).toFixed(2);
    if (curRate === "1.00") {
      curRate = "1.0";
    } else if (curRate === "1.50") {
      curRate = "1.5"; 
    }
    this.setData({
      curRate,
    })
    getApp().globalData.audio.curRate = curRate;

    this.handlePlayRate(value / 4)
  },
  handlePlayRate(rate: number) {
    var player = this.selectComponent("#player");
    player.playRate(rate);
  },
  handleCloseRateDialog() {
    this.setData({
      showRateDialog: false,
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
    const { userid } = getApp().globalData.userinfo;

    console.log('keyword', keyword);
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
    this.initExhibitData(selectId)
   
  },

  formatExhibitData(_exhibitlist: any, _narrationid: any) {
    return _exhibitlist.map((exhibit: any) => {
      // if (!exhibit.audio_infos){
      //   return null
      // }
      const audioitem = exhibit.audio_infos.find((i:any) => i.narration_id == _narrationid);
      if (audioitem && audioitem.duration) {
        const duration_fmt = calTimeTxt(audioitem.duration);

        return {
          ...exhibit,
          audioitem: {
            ...audioitem,
            duration_fmt, 
          },
        }
      }
      
    })
  },

  // 业务逻辑

  formatExhibitByIDData(_exhibit: any, _narrationid: any) {
    const audioitem = _exhibit.audio_infos.find((i:any) => i.narration_id == _narrationid);
    return {
      ..._exhibit,
      audioitem,
    }
  },

  async getExhibitDataWithNoPlayer(_unitid: any, _playingIndex: any) {
    this.setData({
      loading: true,
    })
    try {
      const res_exhibitlist: any = await getExhibitList(_unitid, this.data.exhibitionId);
      const f_exhibitlist = this.formatExhibitData(res_exhibitlist.exhibits, this.data.narrationId);

      this.setData({
        exhibitList: f_exhibitlist,
        curExhibit: f_exhibitlist[_playingIndex],
      })
      
      
      this.setData({
        loading: false,
      })
    } catch (error) {
      console.log(error)
      this.setData({
        loading: false,
      })
    }
  },
  // async getAllExhibits() {
  //   this.setData({
  //     loading: true,
  //   })
  //   try {

  //     // const url_params = transferObjToUrlParams({
  //     //   exhibitionID: this.data.exhibitionId,
  //     // })
  //     const res:any = await getAllExhibitList(this.data.exhibitionId)
  //     if( res && res.exhibits) {
  //       const f_exhibitlist = this.formatExhibitData(res.exhibits, this.data.narrationId);
  //       const audiolist = f_exhibitlist.map((i: any) => i.audioitem.audio_url);
       
  //       this.setData({
  //         exhibitList: f_exhibitlist,
  //         audiolist,
  //       })
  //       const player = this.selectComponent("#player");
  //       // player.initAudioListNotPlay(f_exhibitlist);
  //       player.initAudioList(f_exhibitlist, f_exhibitlist[0]);
  //       this.setData({
  //         loading: false,
  //       })
  //     }
  //   } catch (error) {
  //     console.error(error)
  //   }
  // },
  // async getAudioListAll() {
  //   let { userid } = getApp().globalData.userinfo;
  //   if (!userid || userid === -1) {
  //     const { userinfo } = await getLoginStatus();
  //     userid = userinfo.userid;
  //   } 
  //   try {
  //     const url_params = transferObjToUrlParams({
  //       exhibitionID: this.data.exhibitionId,
  //     })
  //     console.log('-----userid', userid)

  //     const res:any = await queryExhibitListAll(userid, url_params)
  //     if( res && res.exhibits) {
  //       const f_exhibitlist = this.formatExhibitData(res.exhibits, this.data.narrationId);
  //       const audiolist = f_exhibitlist.map((i: any) => i.audioitem.audio_url);
  //       this.setData({
  //         audiolist,
  //       })
  //     }
      
  //   } catch (error) {
  //     console.error(error)
  //   }
  // },

  async initExhibitData(_unitid: any) {
    this.setData({
      loading: true,
    })
    try {
      const res_exhibitlist: any = await getExhibitList(_unitid, this.data.exhibitionId);
      const f_exhibitlist = this.formatExhibitData(res_exhibitlist.exhibits, this.data.narrationId);
      console.log('initExhibitData 111', f_exhibitlist)
      // const audiolist = f_exhibitlist.map((i: any) => i.audioitem.audio_url.replace('http', 'https'));

      this.setData({
        exhibitList: f_exhibitlist,
        curExhibit: f_exhibitlist[0],
      })
      if (_unitid === UNITALLID) {
        const audiolist = f_exhibitlist.map((i: any) => i.audioitem.audio_url);
        this.setData({
          audiolist,
        })
      }
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

  async initExhibitByIDData(_unitid: any, _exhibitid: any) {
    this.setData({
      loading: true,
    })
    try {
      const res: any = await getExhibitById(_exhibitid);
      const exhibit_info = this.formatExhibitByIDData(res.exhibit, this.data.narrationId);

      const res_exhibitlist: any = await getExhibitList(_unitid, this.data.exhibitionId);
      const f_exhibitlist = this.formatExhibitData(res_exhibitlist.exhibits, this.data.narrationId);
      console.log('initExhibitData 111', f_exhibitlist)
      // const audiolist = f_exhibitlist.map((i: any) => i.audioitem.audio_url.replace('http', 'https'));
      console.log('initExhibitByIDData',exhibit_info)

      this.setData({
        exhibitList: f_exhibitlist,
        curExhibit: exhibit_info,
      })
      const player = this.selectComponent("#player");
      player.initAudioList(f_exhibitlist, exhibit_info);
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
  async initPage(_exhibitionid: any, _exhibitid=0) {
    try {
      const res_unit : any = await getUnitList(_exhibitionid);
      const player = this.selectComponent("#player");
      const isPlayingAudio = player.checkIsAudioPlaying();
      const lastExhibitionId = this.data.lastExhibitionId;
      

      if (res_unit && res_unit.units && res_unit.units.length) {
        const units = [
          {
            id: UNITALLID,
            name: '全部'
          },
          ...res_unit.units,
        ]
        this.setData({
          unitList: units,
          pagetitle: units[1].exhibition_name
        })

        if (!isPlayingAudio.isAudioExist || lastExhibitionId !== _exhibitionid) {
          const unitid = UNITALLID;
          this.setData({
            curUnitId: unitid,
          })
          getApp().globalData.audio.curUnitId = unitid;
          if (_exhibitid) {
            this.initExhibitByIDData(unitid, _exhibitid);
          } else {
            // this.getAllExhibits();
            this.initExhibitData(unitid);
          }
          
        } else {
          const lastUnitId = getApp().globalData.audio.curUnitId;
          const { isPlay, playingIndex, totalTimeText, duration } = isPlayingAudio;
          // const unit_id = lastUnitId === -1 ? res_unit.units[0].id : lastUnitId;
          const unit_id = lastUnitId === -1 ? UNITALLID : lastUnitId;
          console.log('getApp().globalData.audio.curUnitId', getApp().globalData.audio.curUnitId)
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
    console.log('onShow onShow')

    const hei = getApp().globalData.system.statusBarHeight;
    const safeBotHei = getApp().globalData.system.bottomSafeHeight;
    const curUnitId = getApp().globalData.audio.curUnitId;
    const curExhibit = getApp().globalData.audio.curExhibit;

    this.setData({
      loading: true,
      listAreaHeight: hei + 'px',
      safeAreaBottomHeight: safeBotHei + 'px',
      lastExhibitionId: getApp().globalData.audio.curExhibition,
      curRate: getApp().globalData.audio.curRate,
      isKeepPlayingActive: !!getApp().globalData.audio.isKeepPlaying,
      curExhibit: curExhibit,
    })
    if (curExhibit && curExhibit.audioitem && curExhibit.audioitem.duration) {
      this.setData({
        duration: curExhibit.audioitem.duration
      })
    }
    // 查找后返回 start
    if (this.data.curUnitId !== getApp().globalData.audio.curUnitId && getApp().globalData.audio.curExhibit) {
      this.setData({
        curUnitId,
      })
      this.initExhibitByIDData(curUnitId, getApp().globalData.audio.curExhibit.id)
      // this.playOtherUnit(curUnitId);
    }
    // 查找后返回 end

    const player = this.selectComponent("#player");
    player.pageTimeUpateContinue();
    
    setTimeout(() => {
      const params = getCurrentPageParamStr();
      const { exhibition_id } = getCurrentPageParam();
      console.log('params ', params)
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
      if (options.exhibit_id) {
        this.initPage(options.exhibition_id, Number(options.exhibit_id));
      } else {
        this.initPage(options.exhibition_id);
      }
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

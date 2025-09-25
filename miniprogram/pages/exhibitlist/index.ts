import { getUnitList, getExhibitById, getExhibitList, queryExhibitListAll, getPackageExhibitList, getPackageExhibitById, sendListenedAudioAction } from '../../api/api';
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
    isPlay: getApp().globalData.audio.bgAudio?.paused,
    duration: 0, // 当前audio时长
    totalTimeText: '00:00',
    currentTime: 0,
    currentTimeText: '00:00',
    sliderIndex: 0, // 当前播放进度
    playingIndex: getApp().globalData.audio.playingIndex, // 当前播放index
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
    continueScrollTop: '0rpx', // 首页续听 scrollTop
    packageId: -1,
    showShareTextDialog: false,
    shareTextList: [] as any,
    exhibitIdList: [] as number[],
    // playProgress: 0,
  },

  handleClickListType() {
    // @ts-ignore
    this.tracker.report('exhibit_list_change_type_e21', {type: this.data.isListType ? 1 : 0})
    this.setData({
      isListType: !this.data.isListType,
    })
  },

  handleCountdownEnd() {
    this.setData({
      showShareTextDialog: false,
      shareTextList: [],
    })
  },
  handleClickAIPopup(e: any) {
    const { popup_type } = e.detail;
    let params = {};
    if (popup_type === 'exhibitlist') {
      params = { exhibit_id: this.data.curExhibit.exhibit_id }
    } else if (popup_type === 'package') {
      params = { package_id: this.data.packageId }
    }
    const url_params = generateNewUrlParams({
      from_page: popup_type,
      poster_idx: 0,
      ...params,
    })
    // @ts-ignore
    this.tracker.report('exhibit_list_share_text_click_e40', {
      popup_type,
      popup_text: e.detail.popup_text,
      ...params,
    })
    wx.navigateTo({
      url: '/pages/share-poster/index' + url_params,
    })
  },

  handleClickPannelSearch() {
    const url_params = generateNewUrlParams({
      type: 'exhibition',
      exhibition_id: this.data.exhibitionId,
      package_id: this.data.packageId,
    });
    // @ts-ignore
    this.tracker.report('exhibit_list_search_e23')
    
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
        title: '已为您关闭连续播放',
        icon: 'none',
        duration: 2000
      })
      
    } else {
      getApp().globalData.audio.isKeepPlaying = true;
      this.setData({
        isKeepPlayingActive: true
      })
      wx.showToast({
        title: '已为您开启连续播放',
        icon: 'none',
        duration: 2000
      })
      
    }
    wx.nextTick(()=> {
      //@ts-ignore
      this.tracker.report('exhibit_list_keep_play_click_e29', {
        isKeepPlay: this.data.isKeepPlayingActive ? 1 : 0,
      })
    })
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
    console.log('curExhibit', playingIndex)
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
        // TODO: 需要传入正确的 packageid 和 packageexhibitid 参数
        sendListenedAudioAction(this.data.packageId, this.data.curExhibit.exhibit_id)
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
  handleOnPlayerEnded() {
    console.log('------end !!!')
    if (getApp().globalData.audio.isKeepPlaying) {
      this.handlePlayNext();
    } else {
      this.handleEndAudio();
      // this.setData({
      //   isPlay: false,
      // })
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
    // this.setData({
    //   isPlay: false,
    // });
    const { selectId } = event.detail;
    if (selectId !== this.data.curExhibit.id) {
      const player = this.selectComponent("#player")
      await player.handlePlayOtherAudioById(selectId);
    }

    console.log('handleClickItemImage', selectId === this.data.curExhibit.id)

    const url_params = generateNewUrlParams({
      // narration_id: this.data.narrationId,
      exhibition_id: this.data.exhibitionId,
      package_id: this.data.packageId,
      exhibit_id: selectId,
      unit_id: this.data.curUnitId,
      museum_id: this.data.curExhibit.museum_id,
    })
    wx.navigateTo({
      url: '/pages/exhibitdetail/index' + url_params
    });
  },
  handleClickPlayerImg() {
    const url_params = generateNewUrlParams({
      // narration_id: this.data.narrationId,
      exhibition_id: this.data.exhibitionId,
      package_id: this.data.packageId,
      exhibit_id: this.data.curExhibit.id,
      unit_id: this.data.curUnitId,
      museum_id: this.data.curExhibit.museum_id,
    })
    wx.navigateTo({
      url: '/pages/exhibitdetail/index' + url_params
    });
  },
  handleOnPlayerPause() {
    console.log('handleOnPlayerPause');
    this.setData({
      isPlay: false,
    })
  },

  handleOnPlayerPlay() {
    console.log('handleOnPlayerPlay');
    this.setData({
      isPlay: true,
    })
  },
  handleOnPlayerStop() {
    console.log('handleOnPlayerStop');
    this.setData({
      isPlay: false,
      currentTime: 0,
      currentTimeText: '00:00',
    })
  },

  handleEndAudio() {
    console.log('handleEndAudio');
    this.setData({
      isPlay: false,
      currentTime: getApp().globalData.audio.duration,
      sliderIndex: getApp().globalData.audio.duration,
      currentTimeText: getApp().globalData.audio.totalTimeText,
    })
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
      // narration_id: this.data.narrationId,
      exhibition_id: this.data.exhibitionId,
      package_id: this.data.packageId,
      exhibit_id: id,
      unit_id: this.data.curUnitId,
      museum_id: this.data.curExhibit.museum_id,
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
    // @ts-ignore
    this.tracker.report('exhibit_list_rate_click_e28', {rate: curRate})
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
    // wangye todo
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
        package_id: this.data.packageId,
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

  handleShareTextTimeUp(event: any) {
    const { share_texts, popup_type, popup_text } = event.detail;
    if (share_texts && share_texts.length > 0) {
      // @ts-ignore
      this.tracker.report('exhibit_list_share_text_time_up_e39', {
        exhibition_id: this.data.exhibitionId,
        popup_type,
        popup_text,
      })
      this.setData({
        showShareTextDialog: true,
        shareTextList: share_texts,
      })
    }
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

  formatExhibitDataV2(_exhibitlist: any) {
    return _exhibitlist.map((item: any) => {
      // if (!exhibit.audio_infos){
      //   return null
      // }
      if (item.audio_duration) {
        const duration_fmt = calTimeTxt(item.audio_duration);

        return {
          ...item.exhibit,
          id: item.exhibit.id,
          package_exhibit_id: item.id,
          package_id: item.package_id,
          exhibit_id: item.exhibit.id,
          listened: item.listened,
          audioitem: {
            id: item.exhibit.id,
            audio_url: item.audio_url,
            content: item.content,
            duration: item.audio_duration,
            listen_count: item.listen_count,
            audio_id: item.id,
            locked: item.locked,
            duration_fmt,
            listened: item.listened,
          },
        }
      }
      
    })
  },

  // 业务逻辑

  // formatExhibitByIDData(_exhibit: any, _narrationid: any) {
  //   const audioitem = _exhibit.audio_infos.find((i:any) => i.narration_id == _narrationid);
  //   return {
  //     ..._exhibit,
  //     audioitem,
  //   }
  // },

   formatExhibitByIDDataV2(_exhibit: any) {
    return {
      ..._exhibit.exhibit,
      package_exhibit_id: _exhibit.id,
      id: _exhibit.exhibit.id,
      package_id: _exhibit.package_id,
      exhibit_id: _exhibit.exhibit.id,
       audioitem: {
        id: _exhibit.exhibit.id,
        audio_url: _exhibit.audio_url,
        content: _exhibit.content,
        duration: _exhibit.audio_duration,
        listen_count: _exhibit.listen_count,
        audio_id: _exhibit.id,
        locked: _exhibit.locked,
      },
    }
  },

  async getExhibitDataWithNoPlayer(_unitid: any, _playingIndex: any) {
    this.setData({
      loading: true,
    })
    try {
      const res_exhibitlist: any = await getPackageExhibitList(_unitid, this.data.packageId);
      const f_exhibitlist = this.formatExhibitDataV2(res_exhibitlist.exhibits);
      const audiolist = f_exhibitlist.map((i: any) => i.audioitem.audio_url);
      const exhibitIdList = f_exhibitlist.map((i: any) => i.id);

      this.setData({
        exhibitList: f_exhibitlist,
        curExhibit: f_exhibitlist[_playingIndex],
        audiolist,
        exhibitIdList: exhibitIdList,
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

  calContinueScrollTop(_exhibitlist: any, _exhibit: any) {
    let scroll_top = '0rpx';
    const unit_idx = this.data.unitList.findIndex((i: any) => i.id === _exhibit.unit_id);
    const exhibit_idx = _exhibitlist.findIndex((i: any) => i.id === _exhibit.id);
    scroll_top = (220 * exhibit_idx) + (86 * (unit_idx -1)) - 440 + 'rpx';
    console.log('unit_idx', unit_idx, exhibit_idx)
    return scroll_top;
  },

  async initExhibitData(_unitid: any) {
    this.setData({
      loading: true,
    })
    try {
      const res_exhibitlist: any = await getPackageExhibitList(_unitid, this.data.packageId);
      const f_exhibitlist = this.formatExhibitDataV2(res_exhibitlist.exhibits);
      console.log('initExhibitData 111', f_exhibitlist)

      this.setData({
        exhibitList: f_exhibitlist,
        curExhibit: f_exhibitlist[0],
        exhibitIdList: f_exhibitlist.map((i: any) => i.id),
      })
      const audiolist = f_exhibitlist.map((i: any) => i.audioitem.audio_url);
      this.setData({
        audiolist,
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

  async initExhibitByIDData(_unitid: any, _exhibitid: any) {
    this.setData({
      loading: true,
    })
    try {
      const res: any = await getPackageExhibitById(this.data.packageId, _exhibitid);
      const exhibit_info = this.formatExhibitByIDDataV2(res.data);
console.log('init exhibit_info', res, exhibit_info)
      const res_exhibitlist: any = await getPackageExhibitList(_unitid, this.data.packageId);
      const f_exhibitlist = this.formatExhibitDataV2(res_exhibitlist.exhibits);
      const continueScrollTop = this.calContinueScrollTop(f_exhibitlist, exhibit_info);
      const audiolist = f_exhibitlist.map((i: any) => i.audioitem.audio_url);
      console.log('init f_exhibitlist', f_exhibitlist)


      this.setData({
        exhibitList: f_exhibitlist,
        curExhibit: exhibit_info,
        continueScrollTop,
        audiolist,
        exhibitIdList: f_exhibitlist.map((i: any) => i.id),
      })
      
      const player = this.selectComponent("#player");
      if (!getApp().globalData.audio.bgAudio) {
        player.initAudioList(f_exhibitlist, exhibit_info);
      } else {
        getApp().globalData.audio.playingIndex = f_exhibitlist.findIndex((i: any) => i.id === exhibit_info.exhibit_id);
      }
     
      this.setData({
        loading: false,
      })
    } catch (error) {
      this.setData({
        loading: false,
      })
      console.error(error)
    }
  },

  // 业务逻辑
  async initPage(_packageid: any, _exhibitionid: any, _exhibitid=0) {
    try {
      const res_unit : any = await getUnitList(_packageid);
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

        console.log('isPlayingAudio.isAudioExist', isPlayingAudio)

        if (!isPlayingAudio.isAudioExist || lastExhibitionId !== _exhibitionid) {
          const unitid = UNITALLID;
          this.setData({
            curUnitId: unitid,
          })
          getApp().globalData.audio.curUnitId = unitid;
          if (_exhibitid) {
            // 首页续播逻辑，此时unitid = UNITALLID（999999）
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
          const { bgAudio: {currentTime, paused}, currentTimeText } = getApp().globalData.audio;
          console.log(' getApp().globalData.audio',  getApp().globalData.audio)
          this.setData({
            isPlay: !paused,
            playingIndex,
            totalTimeText,
            duration,
            curUnitId: unit_id,
            currentTime,
            currentTimeText,
          })
          console.log('this.data.curUnitId', totalTimeText)
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

  async onShow() {
    console.log('onShow onShow', getApp().globalData.audio.bgAudio)

    let hei = getApp().globalData.system.statusBarHeight;
    let safeBotHei = getApp().globalData.system.bottomSafeHeight;
    const curUnitId = getApp().globalData.audio.curUnitId;
    const curExhibit = getApp().globalData.audio.curExhibit;
    if (!hei || !safeBotHei) {
      const res_window =  wx.getWindowInfo();
      hei = res_window.statusBarHeight;
      safeBotHei = res_window.safeArea.height;
    }

    this.setData({
      loading: true,
      listAreaHeight: hei + 'px',
      safeAreaBottomHeight: safeBotHei + 'px',
      lastExhibitionId: getApp().globalData.audio.curExhibition,
      curRate: getApp().globalData.audio.curRate,
      isKeepPlayingActive: !!getApp().globalData.audio.isKeepPlaying,
      curExhibit: curExhibit,
    })
    // if (curExhibit && curExhibit.audioitem && curExhibit.audioitem.duration) {
    //   this.setData({
    //     duration: getApp().globalData.audio.bgAudio.duration,
    //   })
    // }
    if (getApp().globalData.audio.bgAudio) {
      const { bgAudio: {duration, paused}, totalTimeText, playingIndex } = getApp().globalData.audio
      console.log('onShow getApp().globalData.audio.totalTimeText', getApp().globalData.audio.playingIndex)
      this.setData({
        duration: duration,
        isPlay: !paused,
        totalTimeText: totalTimeText,
        playingIndex: playingIndex,
      })
    }
    // 查找后返回 start
    if (this.data.curUnitId !== getApp().globalData.audio.curUnitId && getApp().globalData.audio.curExhibit) {
      console.log('onShow ', '查找后返回 start', getApp().globalData.audio)
      this.setData({
        curUnitId,
      })
      if (this.data.packageId === getApp().globalData.audio.curPackageId) {

        this.initExhibitByIDData(curUnitId, getApp().globalData.audio.curExhibit.exhibit_id)
      } else {
        this.initExhibitData(curUnitId);
      }
      // this.playOtherUnit(curUnitId);
    }
    // // 查找后返回 end
    // if (getApp().globalData.audio.bgAudio) {
    //   const player = this.selectComponent("#player");
    //   player.pageTimeUpateContinue();
    // }
    
    setTimeout(() => {
      const params = getCurrentPageParamStr();
      const { exhibition_id, package_id } = getCurrentPageParam();
      console.log('params ', params)
      getApp().globalData.audio.exhibitlistParams = params;
      getApp().globalData.audio.curExhibition = exhibition_id;
      getApp().globalData.audio.curPackageId = Number(package_id);
    }, 1000)

  },
  async onLoad(options) {
    console.log('onShow onLoad')
    if (options) {
      this.setData({
        packageId: Number(options.package_id),
      })
    }
    if(options && options.exhibition_id) {
      this.setData({
        exhibitionId: Number(options.exhibition_id),
      })
      // 只有首页续播时需要传入exhibit_id，为了精准播放
      if (options.exhibit_id) {
        this.initPage(options.package_id, options.exhibition_id, Number(options.exhibit_id));
      } else {
        this.initPage(options.package_id, options.exhibition_id);
      }
    }
  }

})

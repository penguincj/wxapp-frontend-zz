import { getUnitList, getExhibitList, queryExhibitListAll } from '../../api/api';
import { generateNewUrlParams, transferObjToUrlParams } from '../../utils/util';

import { audioList, exhibitionList } from './mock';
const base_url = "http://gewugo.com";
// let bgAudio = wx.getBackgroundAudioManager();
const defaultUnitList = [
  {
    id: 1,
    name: '云南龙陵',
  },
  {
    id: 2,
    name: '玉出昆冈',
  },
  {
    id: 3,
    name: '云南',
  },
  {
    id: 4,
    name: '玉出昆',
  },
  {
    id: 5,
    name: '云南龙陵',
  },
];

Page({
  data: {
    exhibitList: audioList,
    lastPlayIndex: -1, // 之前播放index
    topBarHeight: 0,
    safeHeight: 0,
    windowHeight: 0,
    statusBarHeight: 0,
    bgAudio: null as any,
    isAutoPlay: false,
    stored_audio: [] as string[],
    unitList: defaultUnitList,
    searchList: [] as any,
    showFindDialog: false,
    showInput: true,

    // 一定用到的
    isPlay: false,
    duration: 0, // 当前audio时长
    totalTimeText: '00:00',
    currentTime: 0,
    currentTimeText: '00:00',
    sliderIndex: 0, // 当前播放进度
    playingIndex: -1, // 当前播放index
    curExhibit: null, // 当前播放展览
    curUnitId: -1, // 当前单元id
    narrationId: -1, // 页面params语音包id
    exhibitionId: -1,
    listAreaHeight: '0px', // 播放列表区域高度
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
    const { isPlay } = event.detail;
    this.setData({
      isPlay,
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



  handleCloseFindDialog() {
    this.setData({
      showFindDialog: false,
    })
  },
  handleOpenFindDialog() {
    this.setData({
      showFindDialog: true,
      showInput: true,
      searchList: [],
    })
  },
  async handleClickSearch(event: any) {
    const { keyword } = event.detail;
    console.log('keyword', keyword);
    this.setData({
      showInput: false,
    });
    try {
      // const url_params = transferObjToUrlParams({
      //   keyword,
      //   type: 'exhibit',
      //   exhibitionID: this.data.exhibitionId,
      //   exhibitID: 15
      // })
      const url_params = transferObjToUrlParams({
        unitID: 10
      })
      const res:any = await queryExhibitListAll(url_params)
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
    this.initExhibitData(_unitid)
  },


  // swiper-unit组件
  handleChangeUnit(event: any) {
    const { selectId } = event.detail;
    console.log('handleChangeUnit', selectId);
    this.setData({
      curUnitId: selectId,
    });
    this.initExhibitData(selectId)
  },

  formatExhibitData(_exhibitlist: any, _narrationid: any) {
    return _exhibitlist.map((exhibit: any) => {
      // if (!exhibit.audio_infos){
      //   return null
      // }
      const audioitem = exhibit.audio_infos.find((i:any) => i.narration_id == _narrationid);
      console.log('initPage formatExhibitData', audioitem)

      return {
        ...exhibit,
        audioitem,
      }
    })
  },

  async initExhibitData(_unitid: any) {
    this.setData({
      loading: true,
    })
    try {
      const res_exhibitlist: any = await getExhibitList(_unitid);
      const f_exhibitlist = this.formatExhibitData(res_exhibitlist.exhibits, this.data.narrationId);
      console.log('initExhibitData 111', f_exhibitlist)

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
      if (res_unit && res_unit.units && res_unit.units.length) {
        this.setData({
          curUnitId: res_unit.units[0].id,
          unitList: res_unit.units,
        })
        // const res_exhibitlist: any = await getExhibitList(res_unit.units[0].id);
        // const f_exhibitlist = this.formatExhibitData(res_exhibitlist.exhibits, this.data.narrationId);
        // console.log('initPage 111', f_exhibitlist)

        // this.setData({
        //   exhibitList: f_exhibitlist,
        //   curExhibit: f_exhibitlist[0],
        // })
        // const player = this.selectComponent("#player");
        // player.initAudioList(f_exhibitlist, f_exhibitlist[0]);

        this.initExhibitData(res_unit.units[0].id)
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

  handleAudioChange(e: any) {
    console.log(e.detail.state);
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
  },

  onShow() {
    const hei = getApp().globalData.system.statusBarHeight;

    this.setData({
      loading: true,
      listAreaHeight: hei + 'px',
    })
    const player = this.selectComponent("#player");
    player.pageTimeUpateContinue();
  },
  onLoad(options) {
    if(options && options.exhibition_id) {
      this.setData({
        exhibitionId: Number(options.exhibition_id),
      })
      this.initPage(options.exhibition_id);
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

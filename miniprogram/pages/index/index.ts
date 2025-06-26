import { getHotComments, getCityList, getIndexData, getIndexCityData, getCityRecoExhibitionList } from "../../api/api";
import { generateDateFormat, calTimeTxt, backToTargetPage, generateCityList, getLocation, throttle, generateNewUrlParams } from "../../utils/util";

let interval = null as any;

Page({
  data: {
    loading: false,
    bannerList: [] as any,
    exhibitionList: [] as any,
    showExhibitionList: [] as any,
    dailyListen: {} as any,
    museumArrayList: [] as any,
    museumList: [] as any,
    comment_list: [] as any,
    hasMore: false,
    page: 1,
    cityList: [] as any,
    curCityId: 1,
    cityName: "",
    isShowMask: false,
    curExhibit: {} as any,
    isNew: false,
    curExhibitName: '',
    curExhibitImg: '',
    comment_loading: false,
    bannerCurrentIndex: 0,
  },

  handleBannerClickItem(e: any) {
    const { id, link } = e.detail;
    if (link) {
      wx.navigateTo({
        url: link
      })
      console.log('-----111----', link)
    }
  },

  handleBannerSwiperChange(e: any) {
    const { idx } = e.detail;
    this.setData({
      bannerCurrentIndex: idx,
    })
  },

  handleExClickItem(e: any) {
    const { selectId } = e.detail;
    if (selectId) {
      const url_params = generateNewUrlParams({
        exhibition_id: Number(selectId)
      })
      wx.navigateTo({
        url: '/pages/exhibitiondetail/index' + url_params,
      })
    }
  },

  freshPage() {
    let that = this;
    interval = setInterval(function () {
      //  需要执行的代码
      const cur_exhibit = getApp().globalData.audio.curExhibit;
      if (cur_exhibit && cur_exhibit.name && cur_exhibit.name !== that.data.curExhibitName) {
        that.setData({
          curExhibitName: cur_exhibit.name,
          curExhibitImg: cur_exhibit.image_url,
        })
      }
  }, 2000); // 2000为毫秒级参数，表示2秒
  },

  destoryInverval() {
    clearInterval(interval);
  },

  handleMuseumClickItem(e: any) {
    const { id } = e.detail;
    if (id) {
      const url_params = generateNewUrlParams({
        museum_id: Number(id)
      })
      wx.navigateTo({
        url: '/pages/museum/museumdetail/index' + url_params,
      })
    }
  },

  async getComments(_pagenum=1) {
    this.setData({
      comment_loading: true,
    })
    try {
      const res: any = await getHotComments(10, _pagenum, this.data.curCityId);
      console.log(res);
      if (res && res.code === 0) {
        const { data, page_num, total_page_num } = res;
        // const star_distribution = data_area.star_distribution.reverse();
        // const score = Number(data_area.score.toFixed(1));

        const comments = data.map((item: any) => {
          const calTime = generateDateFormat(item.timestamp);
          return {
            ...item,
            calTime,
          }
        })
        this.setData({
          comment_list: [...this.data.comment_list, ...comments],
          page: page_num,
          hasMore: Number(total_page_num) > Number(page_num)
        })
      }
      this.setData({
        comment_loading: false,
      })
    } catch (error) {
      this.setData({
        comment_loading: false,
      })
    }
    
  },

  generateMuseumArr(_mlist: any) {
    let museumArrayList = [];
    let len = 0;
    if ((_mlist.length % 3) === 0) {
      len = Math.floor(_mlist.length / 3);
    } else {
      len = Math.floor(_mlist.length / 3) + 1;
    }

    for (let i=0; i< len; i++) {
      let arr = [];
      for (let j=0; j<3; j++) {
        if(_mlist[i*3 + j]) {
          arr.push(_mlist[i*3 + j])
        }
      }
      museumArrayList.push(arr);
      arr = [];
    }
    return museumArrayList;
  },

  generateFlags(_exhibitionlist: any) {
    if (_exhibitionlist) {
      const exhibitionList = _exhibitionlist.map((i: any) => 
       
        {
          let flag = false;
          if (i.tags && i.tags.length && i.tags.includes('NEW')) {
            flag = true;
          } 
          return {
            ...i, 
            is_new_flag: flag,
          }
        }
      );
      return exhibitionList;
    }
    return [];
  },

  handleClickMoreExh() {
    wx.switchTab({
      url: '/pages/gridview/index'
    })
  },

  async getPageIndex(_lat: any, _lng: any, _cityid=0) {
    let res: any;
    if (_cityid) {
      res = await getIndexCityData(_lat, _lng, _cityid);
    } else {
      res= await getIndexData(_lat, _lng);
    }
    if (res && res.code === 0) {
      const { banner_list=[], city_list=[], current_city_id, daily_listen, exhibition_list=[], is_new, museum_list=[] } = res.data;
      const museumList = museum_list.map((i: any, index: any) => ({...i, museum_name: (index+1) + '.' + i.museum_name}));
      const museumArrayList = this.generateMuseumArr(museumList);
      const exhibitionList = this.generateFlags(exhibition_list);
      const showExhibitionList = exhibitionList.slice(0, 15);
      const cityList = generateCityList(city_list);
      const city = cityList.find((i: any)=> i.id === current_city_id);
      let cityName = '';
      if (city) {
        cityName = city.d_name
      }
      const bannerCurrentIndex = (is_new || banner_list.length < 3) ? 0 : 2;
      const duration_fmt = calTimeTxt(daily_listen.duration);
      
      this.setData({
        bannerList: banner_list,
        exhibitionList,
        showExhibitionList,
        curCityId: current_city_id,
        cityList,
        dailyListen: {...daily_listen, duration_fmt},
        isNew: is_new,
        bannerCurrentIndex,
        museumList,
        museumArrayList,
        cityName,
      })
      wx.hideLoading();
      this.setData({
        loading: false
      })
    }
    wx.hideLoading();
    this.setData({
      loading: false
    })

  },

 
  handleCityChange(event: any) {
    console.log('event.detail', event.detail)
    const { selectedId, selectedName } = event.detail;
    this.setData({
      curCityId: selectedId,
      cityName: selectedName
    });
    this.initPage(selectedId);
  },

  handleClickReLoc() {
    this.initPage();
  },

  handleCityPannelOpenStateChange(e: any) {
    const { is_open } = e.detail;
    this.setData({
      isShowMask: is_open,
    })
  },

  handlePlayDailyListen() {
    const player = this.selectComponent("#player");
    if (getApp().globalData.audio.bgAudio) {
      player.handleAudioPause();
    }
  },


  handleScrolltolower() {
    console.log('1', this.data.hasMore);
    if (this.data.hasMore) {
      this.getComments(this.data.page + 1);
    }
  },

  handleClickPlayerComp(e: any) {
    const { continueListen, continueObj } = e.detail;
    if (continueListen && continueObj && continueObj.exhibit_id) {
      const { exhibit_id, exhibition_id, museum_id, narration_id, unit_id} = continueObj;

      console.log('continueListencontinueListencontinueListen', continueObj);
      const url_params = generateNewUrlParams({
        exhibition_id: Number(exhibition_id),
        narration_id: Number(narration_id),
        exhibit_id: Number(exhibit_id), // todo 只有首页需要这个参数，为了杀小程序后续播时进入列表页就播放
      })
      getApp().globalData.audio.curUnitId = Number(unit_id);
      wx.navigateTo({
        url: '/pages/exhibitlist/index' + url_params,
      })
    } else {
      const targetPage = "pages/exhibitlist/index";
      backToTargetPage(targetPage);
    }
   
  },

  handleUpatePlayingIndex() {
    console.log('handleUpatePlayingIndex-------------------------')

  },

  handlePlayerCompIndexChange(e: any) {
    console.log('exhibitName-------------------------', e)

    const { exhibitName, exhibitImg} = e.detail;
    this.setData({
      curExhibitName: exhibitName,
      curExhibitImg: exhibitImg,
    })
  },

  async initPage(_cityid=0) {
    wx.showLoading({
      title: '加载中',
    });
    this.setData({
      loading: true,
      comment_list: [],
    })
    const lat = await wx.getStorageSync('latitude');
    const lng = await wx.getStorageSync('longitude');
    try {
      if (!lat || !lng) {
        // @ts-expect-error
        const { latitude, longitude } = await getLocation();
        await this.getPageIndex(latitude, longitude, _cityid);
        await this.getComments(1);
      } else {
        await this.getPageIndex(lat, lng, _cityid);
        await this.getComments(1);
      }
    } catch (error) {
      this.getPageIndex(0, 0, _cityid);
      this.getComments(1);
      wx.hideLoading();
      this.setData({
        loading: false
      })
      console.log(error)
    }
    
    // this.getCityListAsync();
  },


  onLoad(options) {
    console.log(options);
    this.initPage();
  },

  onShow() {
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0    // 根据tab的索引值设置
      })
    }
    const cur_exhibit = getApp().globalData.audio.curExhibit;
    if (cur_exhibit && cur_exhibit.name) {
      this.setData({
        curExhibitName: cur_exhibit.name,
        curExhibitImg: cur_exhibit.image_url,
      })
    }

    this.freshPage();
   
    console.log('getApp().globalData.audio.curExhibit', getApp().globalData.audio.curExhibit)
  },

  onUnload() {
    this.destoryInverval();
  },

  onHide() {
    this.destoryInverval();
  },


  onShareAppMessage() {
    const defaultUrl = 'https://gewugo.com/api/v1/storage/image/share-3639793484.jpg';
    const title = '让您的博物馆之旅不虚此行';
    var shareObj = {
      title,
      path: '/pages/index/index',
      imageUrl: defaultUrl,
      success: function (res: any) {
        if (res.errMsg == 'shareAppMessage:ok') {
          console.log('share success')
        }
      },
      fail: function (res: any) {
        if (res.errMsg == 'shareAppMessage:fail cancel') {
          console.log('share cancel')
        } else if (res.errMsg == 'shareAppMessage:fail') {
          console.log('share fail')
        }
      },
    }
    return shareObj;
  },

})

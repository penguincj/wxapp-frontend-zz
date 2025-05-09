import { getCityList, getCityRecoExhibitionList, getCityLongExhibitionList, getCityPastExhibitionList } from '../../api/api';
import { getCurrentCity, generateNewUrlParams, backToTargetPage } from "../../utils/util";

Page({
  data: {
    exhibitionList: [],
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
    curMuseumId: -1,
    recommendList: [],
    normalList: [],
    outofdateList: [],
    loading: true,
    dateObj: {},
    curCityId: -1,
    cityList: [] as any,
    cityName: '',
  },

  handleClickItem(event: any) {
    const { id } = event.detail;
    console.log('handleClickItem');
    
    const url_params = generateNewUrlParams({
      exhibition_id: id,
      city_id: this.data.curCityId,
    })
    wx.navigateTo({
      url: '/pages/exhibitiondetail/index' + url_params,
    })
  },

    handleClickPlayerComp() {
      const targetPage = "pages/exhibitlist/index";
      backToTargetPage(targetPage);
    },
  

  handleClickMorePast() {
    const url_params = generateNewUrlParams({
      exhibition_type: 'past',
      city_id: this.data.curCityId,
    })
    wx.navigateTo({
      url: '/pages/exhibitionall/index'+ url_params
    })
  },

  handleClickMoreLong() {
    const url_params = generateNewUrlParams({
      exhibition_type: 'long',
      city_id: this.data.curCityId,
    })
    wx.navigateTo({
      url: '/pages/exhibitionall/index'+ url_params
    })
  },


  generateDate() {
    const week = new Date().getDay();
    const arr = ['日', '一', '二', '三', '四', '五', '六'];
    const day_str = '周'+arr[week];
    let date: any = new Date().getDate();
    date = (date < 10) ? ('0'+ date) : date;
    let month: any = new Date().getMonth() + 1;
    month = (month < 10) ? ('0'+ month) : month;

    return {
      day_str,
      date,
      month,
    }
  },

  async getPageData(city_id: any) {
    this.setData({
      loading: true
    })
    try {
      const res_reco: any = await getCityRecoExhibitionList(city_id, 999);
      const res_long: any = await getCityLongExhibitionList(city_id, 999);
      const res_past: any = await getCityPastExhibitionList(city_id, 999);
      if (res_reco && res_reco.exhibitions) {
        console.log('res_reco.exhibitions.length', res_reco.exhibitions)
        this.setData({
          recommendList: res_reco.exhibitions,
        })
      }
      if (res_long && res_long.exhibitions) {
        this.setData({
          normalList: res_long.exhibitions,
        })
      }
      if (res_past && res_past.exhibitions) {
        this.setData({
          outofdateList: res_past.exhibitions,
        })
      }
      this.setData({
        loading: false
      })
    } catch (error) {
      console.log(error)
      this.setData({
        loading: false
      })
    }
  },

  async initPage() {
    this.setData({
      loading: true
    })
    const date_obj = this.generateDate();
    this.setData({
      dateObj: date_obj,
    })
    try {
      const city = await getCurrentCity();
      const citylist:any = await getCityList();
      let city_item = ((citylist || {}).cities || []).find((i: any) => i.name === city);
      this.setData({
        cityList: citylist.cities 
      })
      let city_id = -1;
      
      if(city_item && city_item.name) {
        city_id = city_item.id;
      } else {
        city_item = ((citylist || {}).cities || []).find((i: any) => i.name === '北京市');
        city_id = city_item.id;
      }
      // const city_name = (citylist.cities.find((i:any) => i.id === city_id) || {}).name
      this.setData({
        curCityId: city_id,
        cityList: citylist.cities,
        cityName: city_item.name,
      })
      console.log('city_id', city_id);
      await this.getPageData(city_id);
      this.setData({
        loading: false,
      })
    } catch (error) {
      console.error(error);
      this.setData({
        loading: false,
      })
    }
  },

  handleCityChange(e: any) {
    const { selectedId, selectedName } = e.detail;
    this.setData({
      curCityId: selectedId,
      cityName: selectedName
    });
    this.getPageData(selectedId)
  },

  onShow() {
    this.initPage();
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {    
      this.getTabBar().setData({
          selected: 2
        })
    }
  },
 
  onLoad(options) {
    console.log('onLoad', options);
    this.setData({
      curMuseumId: Number(options.museum_id),
    })
  },

  onShareAppMessage(){
    const defaultUrl = 'https://gewugo.com/api/v1/storage/image/share-3639793484.jpg';
    const title = '让您的博物馆之旅不虚此行' ;
    var shareObj = {
      title,
      path: '/pages/index/index',
      imageUrl: defaultUrl,
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

// index.ts
// 获取应用实例
// const app = getApp<IAppOption>()
import { getCityList, getMuseumList } from "../../api/api";
import { getCurrentCity, getCurrentPageParam,getCurrentPageParamStr, transferObjToUrlParams, backToTargetPage } from "../../utils/util";

Page({
  data: { 
    museumList: [],
    curCityId: -1,
    showLoading: false,
    cityList: [],
    selectCityList: [] as any,
  },
  handleClickMuseum(event: any) {
    const { idx } = event.currentTarget.dataset;
    let url_obj = getCurrentPageParam();
    url_obj = {
      ...url_obj,
      museum_id: idx,
    }
    const url_str = transferObjToUrlParams(url_obj);
    wx.navigateTo({
      url: '/pages/museum/museumdetail/index'+ url_str,
    })
  },
  generateSelectCityList(_cityitem: any, _citylist: any) {
    const citylistCopy = [..._citylist];
    citylistCopy.splice(0, 0, _cityitem);

    const selectCityList = Array.from(new Set(citylistCopy));
    this.setData({
      selectCityList: selectCityList,
    })
  },
  async getMuseumList (_cityid: any) {
    this.setData({
      showLoading: true,
    })
    try {
      const museum_res: any = await getMuseumList(_cityid);

      if (museum_res && museum_res.museums) {
        this.setData({
          museumList: museum_res.museums,
        })
      }
      this.setData({
        showLoading: false,
      })
    } catch (error) {
      this.setData({
        showLoading: false,
      })
    }

  },
  handleClickPlayerComp() {
    const targetPage = "pages/exhibitlist/index";
    backToTargetPage(targetPage);
  },
  async initPage(_cityid: any) {
    try {
      await this.getMuseumList(_cityid)
    } catch (error) {
      console.log(error);
      
      this.setData({
        showLoading: false,
      })
    }
  },
  handleClickCityPanel(event: any) {
    const { cityid } = event.detail;
    const city_item = (this.data.cityList || []).find((i: any) => i.id === cityid);
    this.generateSelectCityList(city_item, this.data.cityList);
    this.setData({
      curCityId: cityid,
    })
    this.getMuseumList(cityid);
  },

  onLoad(options) {
    console.log('museumlist onLoad', options);
    if (options && options.city_id) {
      this.setData({
        curCityId: Number(options.city_id),
      })
    }
    this.setData({
      showLoading: true,
    })

    this.initPage(options.city_id);
    
  },
  onShow() {    
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {    
      this.getTabBar().setData({
          selected: 1
        })
    }
  },
  onShareAppMessage(){
    const defaultUrl = 'https://gewugo.com/api/v1/storage/image/share-3639793484.jpg';
    const title = '让您的博物馆之旅不虚此行' ;
    const str = getCurrentPageParamStr();
    var shareObj = {
      title,
      path: '/pages/museumlist/index' + str,
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

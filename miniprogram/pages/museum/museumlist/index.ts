// index.ts
// 获取应用实例
// const app = getApp<IAppOption>()
import { getCityList, getMuseumList } from "../../../api/api";
import { getCurrentCity, getCurrentPageParam, transferObjToUrlParams, backToTargetPage } from "../../../utils/util";

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
    const museum_res: any = await getMuseumList(_cityid);
      if (museum_res && museum_res.museums) {
        this.setData({
          museumList: museum_res.museums,
        })
      }
  },
  handleClickPlayerComp() {
    const targetPage = "pages/exhibitlist/index";
    backToTargetPage(targetPage);
  },
  async initPage() {
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
        this.generateSelectCityList(city_item, citylist.cities);
        this.setData({
          curCityId: city_id,
        })
      } else {
        city_item = ((citylist || {}).cities || []).find((i: any) => i.name === '北京市');
        city_id = city_item.id;
        this.generateSelectCityList(city_item, citylist.cities);
        this.setData({
          curCityId: city_id,
        })
      }
      console.log(city_item);
      
      const museum_res: any = await getMuseumList(city_id);
      if (museum_res && museum_res.museums) {
        console.log('museumlist onLoad', museum_res);
        this.setData({
          museumList: museum_res.museums,
        })
      }
      this.setData({
        showLoading: false,
      })
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
    if (options && options.cityid) {
      this.setData({
        curCityId: Number(options.city_id),
      })
    }
    this.setData({
      showLoading: true,
    })

    this.initPage();
    
  },
  onShareAppMessage(){
    const defaultUrl = 'https://gewugo.com/api/v1/storage/image/share-3639793484.jpg';
    const title = '【格物观展：让您的博物馆之旅不虚此行】' ;
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

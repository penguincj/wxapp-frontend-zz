import { getCityList, getMuseumList, getCityRecoExhibitionList } from "../../api/api";
import { getCurrentCity, backToTargetPage, getCurrentPageParam, generateNewUrlParams } from "../../utils/util";

Page({
  data: {
    topBarHeight: 0,
    safeHeight: 0,
    windowHeight: 0,
    statusBarHeight: 0,
    isRecoClicked: false,
    museumList: [],
    recoExhibition: {} as any,
    loading: false,
  },

  // handleClickMuseumIcon() {
  //   wx.navigateTo({
  //     url: '/pages/museum/museumlist/index',
  //   })
  // },
  handleClickMuseumItem(event: any) {
    console.log(event);

    const { idx } = event.currentTarget.dataset;
    wx.navigateTo({
      url: '/pages/museum/museumdetail/index?museum_id=' + idx,
    })
  },
  handleClickRecoImg(event: any) {
    if (this.data.isRecoClicked) {
      const { idx } = event.currentTarget.dataset;
      const paramStr = generateNewUrlParams({
        exhibition_id : idx,
      })
      wx.navigateTo({
        url: '/pages/exhibitiondetail/index' + paramStr
      })
    }
    
  },
  handleClickRecommend() {
    console.log('handleClickRecommend');
    this.setData({
      isRecoClicked: true,
    })
  },
  handleCloseDetail() {
    console.log('handleCloseDetail');
    this.setData({
      isRecoClicked: false,
    })
  },
  handleClickPlayerComp() {
    const targetPage = "pages/exhibitlist/index";
    backToTargetPage(targetPage);
  },

  // 页面数据
  async getPageData() {
    try {
      const defalutCityName = '北京市';
      const city = await getCurrentCity();
      // const city = '西安市';
      console.log('city----', city)
      const citylist:any = await getCityList();
      let city_item = null as any;
      const isCurCityInCityList = citylist.cities.findIndex((i: any) => i.name === city);
      if (isCurCityInCityList === -1) {
        city_item = ((citylist || {}).cities || []).find((i: any) => i.name === defalutCityName);
      } else {
        city_item = ((citylist || {}).cities || []).find((i: any) => i.name === city);
      }
      const city_id = city_item.id;
      console.log('city_id', city_id);
      if (city_item && city_item.name) {
        const res: any = await getMuseumList(city_id);
        const recoExhibition: any = await getCityRecoExhibitionList(city_id, 1);
        console.log('museums', res.museums, recoExhibition);
  
        if (res && res.museums) {
          this.setData({
            museumList: res.museums,
          })
        }
        if (recoExhibition && recoExhibition.exhibitions && recoExhibition.exhibitions[0]) {
          this.setData({
            recoExhibition: recoExhibition.exhibitions[0],
          })
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


  onLoad(options) {
    console.log(options);
    this.setData({
      loading: true,
    })
    this.getPageData();
  },
  
  onShareAppMessage(){
    const defaultUrl = 'https://gewugo.com/storage/image/GC07356611338310.jpg';
    const imageUrl = (this.data.recoExhibition.image_url) ? this.data.recoExhibition.image_url : defaultUrl ;
    const title = (this.data.recoExhibition.name) ? `格物观展|${this.data.recoExhibition.name}` : '【格物观展：让您的博物馆之旅不虚此行】' ;
    var shareObj = {
      title,
      path: '/pages/index/index',
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

import { getCityList, getMuseumList, getCityRecoExhibitionList } from "../../api/api";
import { getCurrentCity, backToTargetPage } from "../../utils/util";

Page({
  data: {
    topBarHeight: 0,
    safeHeight: 0,
    windowHeight: 0,
    statusBarHeight: 0,
    isRecoClicked: false,
    museumList: [],
    recoExhibition: {},
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
      const citylist:any = await getCityList();
      let city_item = ((citylist || {}).cities || []).find((i: any) => i.name === city);
      const isCurCityInCityList = citylist.cities.findIndex((i: any) => i.name === city);
      if (!isCurCityInCityList) {
        city_item = ((citylist || {}).cities || []).find((i: any) => i.name === defalutCityName);
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
  }

})

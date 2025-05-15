import { getMuseumById, getMuseumInfoById, getShortExhibitionList, getLongExhibitionList, getPastExhibitionList, getFutureExhibitionList } from "../../../api/api";
import { generateNewUrlParams, backToTargetPage, getCurrentPageParamStr } from "../../../utils/util";
const listConfig = [
  {
    id: 1,
    name: '展览信息',
  },
  {
    id: 2,
    name: '参观指南',
  },
]

const iconsConfig = [
  {id: 1, name: '预约门票', type: 'ticketInfo', icon: 'https://gewugo.com/api/v1/storage/image/commodityorder-message@2x-6874472274.webp'},
  {id: 2, name: '开放时间', type: 'openDate', icon: 'https://gewugo.com/api/v1/storage/image/platformservice-message@2x-3002626842.webp'},
  {id: 3, name: '导览地图', type: 'museumMap', icon: 'https://gewugo.com/api/v1/storage/image/violationpenalty-message@2x-0015496781.webp'},
  {id: 4, name: '馆内服务', type: 'service', icon: 'https://gewugo.com/api/v1/storage/image/businessgrowth-message@2x-6366386929.webp'},
  {id: 5, name: '文创商店', type: 'shop', icon: 'https://gewugo.com/api/v1/storage/image/Storemanagement-message@2x-9670115457.webp'},
  {id: 6, name: '交通路线', type: 'trafficRoute', icon: 'https://gewugo.com/api/v1/storage/image/notification-message@2x-7885296907.webp'},
]

Page({
  data: {
    museumInfo: {} as any,
    topBarHeight: 0,
    safeHeight: 0,
    windowHeight: 0,
    statusBarHeight:0,
    recommendList: [],
    normalList: [],
    outofdateList: [],
    futureList: [],
    curMuseumId: -1,
    loading: false,
    topSwiperSelectIdx: 1,
    listConfig,
    iconsConfig,
    isShowSwiperUnit: false,
  },
  async initPage(_museumid: any) {
    this.setData({
      loading: true
    })
    try {
      const museumInfo: any = await getMuseumById(_museumid);
      const normalList_res: any = await getLongExhibitionList(_museumid, 999);
      const recommendList_res: any = await getShortExhibitionList(_museumid, 999);
      const pastList_res: any = await getPastExhibitionList(_museumid, 999);
      const futureList_res: any = await getFutureExhibitionList(_museumid, 999);
      this.setData({
        museumInfo: museumInfo.museum,
        normalList: normalList_res.exhibitions,
        recommendList: recommendList_res.exhibitions,
        outofdateList: pastList_res.exhibitions,
        futureList: futureList_res.exhibitions,
        loading: false,
      })

      this.getMuseumInfo();

    } catch (error) {
      this.setData({
        loading: false
      })
    }
  },


  async getMuseumInfo() {
    const res: any = await getMuseumInfoById(this.data.curMuseumId);
    if (res && res.code === 0) {
      if (res.visitGuide && res.visitGuide.guide_items && res.visitGuide.guide_items.length) {
        this.setData({
          isShowSwiperUnit: true,
        })
      } else {
        this.setData({
          isShowSwiperUnit: false,
        })
      }
      
    }
  },

  handlePannelClick(e: any) {
    const { idx } = e.currentTarget.dataset;
    const url_params = generateNewUrlParams({
      select_id: idx,
    })
    wx.navigateTo({
      url: '/pages/guidepage/index'+ url_params
    })
  },

  // swiper-unit组件
  handleChangePannelId(event: any) {
    const { selectId } = event.detail;
    console.log('handleChangePannelId', selectId);
    this.setData({
      topSwiperSelectIdx: selectId,
    });
  },


  handleClickPlayerComp() {
    const targetPage = "pages/exhibitlist/index";
    backToTargetPage(targetPage);
  },


  handleClickMoreReco() {
    const url_params = generateNewUrlParams({
      exhibition_type: 'recommend',
    })
    wx.navigateTo({
      url: '/pages/exhibitionall/index'+ url_params
    })
  },

  handleClickMoreFuture() {
    const url_params = generateNewUrlParams({
      exhibition_type: 'future',
    })
    wx.navigateTo({
      url: '/pages/exhibitionall/index'+ url_params
    })
  },
  
  handleClickMorePast() {
    const url_params = generateNewUrlParams({
      exhibition_type: 'past',
    })
    wx.navigateTo({
      url: '/pages/exhibitionall/index'+ url_params
    })
  },
  
  handleClickMoreLong() {
    const url_params = generateNewUrlParams({
      exhibition_type: 'long',
    })
    wx.navigateTo({
      url: '/pages/exhibitionall/index'+ url_params
    })
  },
  handleClickItem(event: any) {
    const { id } = event.detail;
    const url_params = generateNewUrlParams({exhibition_id: id})
    wx.navigateTo({
      url: '/pages/exhibitiondetail/index' + url_params,
    })
  },
  onLoad(options) {
    console.log('museum detail onLoad', options);
    this.setData({
      curMuseumId: Number(options.museum_id),
    });
    this.initPage(options.museum_id);
  },
  onShareAppMessage(){
    const defaultUrl = 'https://gewugo.com/api/v1/storage/image/share-3639793484.jpg';
    console.log(this.data.museumInfo.image_url);
    const str = getCurrentPageParamStr();
    const imageUrl = (this.data.museumInfo && this.data.museumInfo.image_url) ? this.data.museumInfo.image_url : defaultUrl ;
    const title = (this.data.museumInfo.name) ? `博物岛屿|${this.data.museumInfo.name}` : '让您的博物馆之旅不虚此行' ;
    var shareObj = {
      title,
      path: '/pages/museum/museumdetail/index'+str,
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

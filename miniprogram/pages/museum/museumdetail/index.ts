import { getMuseumById, getShortExhibitionList, getLongExhibitionList, getPastExhibitionList } from "../../../api/api";
import { generateNewUrlParams, backToTargetPage, getCurrentPageParamStr } from "../../../utils/util";


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
    curMuseumId: -1,
    loading: false,
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
      this.setData({
        museumInfo: museumInfo.museum,
        normalList: normalList_res.exhibitions,
        recommendList: recommendList_res.exhibitions,
        outofdateList: pastList_res.exhibitions,
        loading: false,
      })

    } catch (error) {
      this.setData({
        loading: false
      })
    }
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
    const defaultUrl = 'https://wx.ajioang.cn/api/v1/storage/image/share-3639793484.jpg';
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

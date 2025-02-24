import { getMuseumById, getShortExhibitionList, getLongExhibitionList, getPastExhibitionList } from "../../../api/api";
import { generateNewUrlParams, backToTargetPage } from "../../../utils/util";


Page({
  data: {
    museumInfo: [],
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

})

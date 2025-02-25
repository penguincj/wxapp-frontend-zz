import { getExhibitionById, getNarrowList, sendViewExhibitionAction } from "../../api/api";
import { generateNewUrlParams, backToTargetPage } from "../../utils/util";

Page({
  data: {
    exhibitionInfo: {},
    narrationList: [],
    topBarHeight: 0,
    safeHeight: 0,
    windowHeight: 0,
    statusBarHeight: 0,
    curExhibitionId: -1,
    loading: false,
    isShowIntro: false,
  },
  handleClickJiangjie(event: any) {
    console.log('handleClickJiangjie', event.currentTarget.dataset);
    const { idx } = event.currentTarget.dataset;
    const url_params = generateNewUrlParams({
      narration_id: idx,
      exhibition_id: this.data.curExhibitionId
    })
    wx.navigateTo({
      url: '/pages/exhibitlist/index' + url_params,
    })
  },
  handleClickPlayIcon() {

  },
  handleClickIntro() {
    this.setData({
      isShowIntro: !this.data.isShowIntro,
    })
  },
  handleClickPlayerComp() {
    const targetPage = "pages/exhibitlist/index";
    backToTargetPage(targetPage);
  },

  async initPage(_exhibitionid: any) {
    try {
      const res: any = await getExhibitionById(_exhibitionid);
      const res_narr: any = await getNarrowList(_exhibitionid);
      if (res && res.exhibition) {
        this.setData({
          exhibitionInfo: res.exhibition,
          narrationList: res_narr.narrations,
          loading: false,
        })
      }
      console.log('initPage', res, res_narr)
    } catch (error) {
      this.setData({
        loading: false,
      })
    }
  },
  async onShow() {
    this.setData({
      loading: true,
    })
    const { userid } = await wx.getStorageSync('userinfo');
    console.log('show');
    const info = wx.getMenuButtonBoundingClientRect();
    const windowInfo = wx.getWindowInfo();
    if (info && info.bottom) {
      this.setData({
        topBarHeight: info.bottom,
        safeHeight: windowInfo.safeArea.height,
        windowHeight: windowInfo.screenHeight,
        statusBarHeight: windowInfo.statusBarHeight,
      })
    }
    try {
      setTimeout(() => {
        sendViewExhibitionAction(userid, this.data.curExhibitionId, { method: 'POST' });
      }, 300)
    } catch (error) {

    }

    console.log('windowInfo', windowInfo);
  },
  onLoad(options) {
    console.log('onLoad', options);
    this.setData({
      curExhibitionId: Number(options.exhibition_id),
    })
    this.initPage(options.exhibition_id);

  },

})

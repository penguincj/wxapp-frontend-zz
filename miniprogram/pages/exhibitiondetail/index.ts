import { getExhibitionById, getNarrowList, sendViewExhibitionAction } from "../../api/api";
import { generateNewUrlParams, backToTargetPage, getCurrentPageParamStr } from "../../utils/util";

Page({
  data: {
    exhibitionInfo: {} as any,
    narrationList: [] as any,
    topBarHeight: 0,
    safeHeight: 0,
    windowHeight: 0,
    statusBarHeight: 0,
    curExhibitionId: -1,
    loading: false,
    isShowIntro: false,
  },
  scroll(e: any) {
    // console.log(e)
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
    if (this.data.narrationList && this.data.narrationList.length) {
      const nid = this.data.narrationList[0].id;
      const url_params = generateNewUrlParams({
        narration_id: nid,
        exhibition_id: this.data.curExhibitionId
      })
      wx.navigateTo({
        url: '/pages/exhibitlist/index' + url_params,
      })
    }
   
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
  onShareAppMessage() {
    const defaultUrl = 'https://wx.ajioang.cn/api/v1/storage/image/share-3639793484.jpg';
    console.log(this.data.exhibitionInfo.image_url);
    const str = getCurrentPageParamStr();
    const imageUrl = (this.data.exhibitionInfo && this.data.exhibitionInfo.image_url) ? this.data.exhibitionInfo.image_url : defaultUrl;
    const title = (this.data.exhibitionInfo.name) ? `博物岛屿|${this.data.exhibitionInfo.name}` : '让您的博物馆之旅不虚此行';
    var shareObj = {
      title,
      path: '/pages/exhibitiondetail/index' + str,
      imageUrl: imageUrl,
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

import { getCommentsByExhibitionID, postWantVisit, delWantVisit, postVisited, delVisited, getExhibitionById, getNarrowList, sendViewExhibitionAction } from "../../api/api";
import { generateNewUrlParams, backToTargetPage, getCurrentPageParamStr, generateDateFormat } from "../../utils/util";

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
    isClickWantVisit: false,
    isClickVisited: false,
    userid: -1,
    nickname: "",
    data_area: {},
    comment_area: [],
    label_area: [],
    bigImg: "",
    showBigImg: false,
    currentLabel: "",
  },
  scroll(e: any) {
    // console.log(e)
  },
  handleClosePopup() {
    this.setData({
      showBigImg: false,
    })
  },
  async handleClickWantVisit() {
    if (this.data.isClickWantVisit) {
      const res: any = await delWantVisit(this.data.curExhibitionId, this.data.userid);
      if(res && res.code === 0) {
        this.setData({
          isClickWantVisit: false
        })
      }
    } else {
      const res: any = await postWantVisit(this.data.curExhibitionId, this.data.userid);
      if(res && res.code === 0) {
        this.setData({
          isClickWantVisit: true
        })
      }
    }

  },
  async handleClickVisited() {
    if (this.data.isClickVisited) {
      const res: any = await delVisited(this.data.curExhibitionId, this.data.userid);
      if(res && res.code === 0) {
        this.setData({
          isClickVisited: false
        })
      }
    } else {
      const res: any = await postVisited(this.data.curExhibitionId, this.data.userid);
      if(res && res.code === 0) {
        this.setData({
          isClickVisited: true
        })
      }
    }

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
  handleSelectLabel(e: any) {
    const label = e.detail;
    this.setData({
      currentLabel: label,
    })
    this.getComments(this.data.curExhibitionId, label);

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
          isClickWantVisit: Boolean(res.exhibition.want_visit),
          isClickVisited: Boolean(res.exhibition.visited)
        })
      }
    } catch (error) {
      this.setData({
        loading: false,
      })
    }
  },
  
  async getComments(exhibition_id: any, labelname = "") {
    const res: any = await getCommentsByExhibitionID(exhibition_id, labelname);
    console.log(res);
    if(res && res.code === 0) {
      const { comment_area, data_area, label_area} = res.data;
      const star_distribution = data_area.star_distribution.reverse();
      const score = Number(data_area.score.toFixed(1));

      const comments = comment_area.map((item: any) => {
        const calTime = generateDateFormat(item.timestamp);
        return {
          ...item,
          calTime,
        }
      })
      this.setData({
        comment_area: comments,
        data_area: {
          ...data_area,
          star_distribution,
          score,
        },
        label_area: label_area
      })
    }
  },
  handleClickCommentIcon() {
    console.log('handleClickCommentIcon');
    const url_params = generateNewUrlParams({
      exhibition_id: this.data.curExhibitionId
    })
    wx.navigateTo({
      url: '/pages/editcomment/index' + url_params
    })
  },
  handleShowFullImage(e: any) {
    const {img, showBigImg} = e.detail;
    console.log('detail', e)
    this.setData({
      bigImg: img,
      showBigImg,
    })
  },
  handleDelCommentSuc() {
    this.getComments(this.data.curExhibitionId, this.data.currentLabel);
  },
  async onShow() {
    this.setData({
      loading: true,
    })
    const { userid, nickname } = await wx.getStorageSync('userinfo');
    this.setData({
      userid,
      nickname,
    })
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
        sendViewExhibitionAction(getApp().globalData.userinfo.userid, this.data.curExhibitionId, { method: 'POST' });
      }, 2000)
      console.log('show this.data.currentLabel', this.data.currentLabel)
      this.getComments(this.data.curExhibitionId, this.data.currentLabel);

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
    const defaultUrl = 'https://gewugo.com/api/v1/storage/image/share-3639793484.jpg';
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

import { getCommentsByExhibitionID, postReplyToParent, postWantVisit, delWantVisit, postVisited, delVisited, getExhibitionById, getNarrowList, sendViewExhibitionAction, getPosters } from "../../api/api";
import { throttle, generateNewUrlParams, backToTargetPage, getCurrentPageParamStr, generateDateFormat } from "../../utils/util";
const listConfig = [
  {
    id: 'reco_exhi',
    name: '展览介绍',
  },{
    id: 'reco_comment',
    name: '评价',
  }
]
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
    imgList: [],
    showBigImg: false,
    currentLabel: "",
    currentImgIndex: 0,
    showPosterBtn: false,
    navIsTransparent: true,
    listConfig: listConfig,
    topSwiperSelectIdx: 'reco_exhi',
    replyParentId: 0,
    showReplayBar: false,
  },
  // scroll(e: any) {
  //   const { scrollTop } = e.detail;
  //   if (scrollTop > 50) {
  //     this.setData({
  //       navIsTransparent: false,
  //     })
  //   } else {
  //     this.setData({
  //       navIsTransparent: true,
  //     })
  //   }
  // },
  // swiper-unit组件
  handleChangePannelId(event: any) {
    const { selectId } = event.detail;
    console.log('handleChangePannelId', selectId);
    // this.setData({
    //   topSwiperSelectIdx: selectId,
    // });
    
    const query = wx.createSelectorQuery();
    query.select(`#${selectId}`).boundingClientRect();
    query.selectViewport().scrollOffset();
    query.exec((res) => {
      const rect = res[0];
      const scrollTop = res[1].scrollTop;
      wx.pageScrollTo({
        scrollTop: scrollTop + rect.top - (43 + this.data.statusBarHeight + 50), // 减去 tab 的高度（大约45px）
        duration: 300
      });
      // this.setData({ topSwiperSelectIdx: selectId });
    });
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
  handleClickSharePoster() {
    const url_params = generateNewUrlParams({
      exhibition_id: this.data.curExhibitionId,
      type: 'exhibition',
    })
    wx.navigateTo({
      url: '/pages/bglist/index' + url_params,
    })
  },
  handleClickJiangjie(event: any) {
    console.log('handleClickJiangjie', event.currentTarget.dataset);
    const { idx } = event.currentTarget.dataset;
    const url_params = generateNewUrlParams({
      narration_id: idx,
      exhibition_id: this.data.curExhibitionId
    })
    getApp().globalData.audio.curNarration = idx
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
      getApp().globalData.audio.curNarration = nid
      wx.navigateTo({
        url: '/pages/exhibitlist/index' + url_params,
      })
    }
   
  },
  handleClickImgLink() {
    this.handleClickPlayIcon();
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
      this.getComments(this.data.curExhibitionId, this.data.currentLabel);
      // this.getPoster(_exhibitionid);
    } catch (error) {
      this.setData({
        loading: false,
      })
    }
  },

  async getPoster(exhibition_id: any) {
    try {
      const res : any = await getPosters(exhibition_id);
      if (res && res.code === 0 && res.poster && res.poster.image_urls && res.poster.image_urls.length) {
        this.setData({
          showPosterBtn: true
        })
      } else {
        this.setData({
          showPosterBtn: false
        })
      }
    } catch (error) {
      this.setData({
        showPosterBtn: false
      })
    }
    
  },
  
  async getComments(exhibition_id: any, labelname = "") {
    try {
      const res: any = await getCommentsByExhibitionID(exhibition_id, labelname);
      console.log(res);
      if(res && res.code === 0) {
        const { comment_area, data_area, label_area} = res.data;
        const star_distribution = data_area.star_distribution.reverse();
        const star_users_num = data_area.star_distribution.reduce((acc: number, cur: number) => acc + cur, 0);
        const score = Number((data_area.score).toFixed(1));
        const score_txt = Number((data_area.score/2).toFixed(1));

        const comments = comment_area.map((item: any) => {
          return item.map((child_item: any) => {
            const calTime = generateDateFormat(child_item.timestamp);
            return {
              ...child_item,
              calTime,
            }
          })
        
        })
        const listconfig_new = [...this.data.listConfig];
        listConfig[1].name = data_area.comment_count ? ('评价（' + data_area.comment_count + '）'): '评价';
        console.log('comments', comments)
        this.setData({
          comment_area: comments,
          data_area: {
            ...data_area,
            star_distribution,
            star_users_num,
            score,
            score_txt,
          },
          label_area: label_area,
          listConfig,
          loading: false
        })
      }
    } catch (error) {
      this.setData({
        loading: false,
      })
      console.log(error)
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
    const {imglist, img, showBigImg, idx} = e.detail;
    console.log('item', idx)
    this.setData({
      bigImg: img,
      showBigImg,
      imgList: imglist,
      currentImgIndex: idx,
    })
  },
  handleDelCommentSuc() {
    this.initPage(this.data.curExhibitionId);
  },
  handleReplayToParentSuc() {
    this.setData({
      showReplayBar: false,
    })
    this.initPage(this.data.curExhibitionId);
  },
  handleScroll1(e: any) {
    this.setData({
      showReplayBar: false,
    })
    const scrollTop = e[0].scrollTop;
    // console.log('scrollTop', scrollTop)
    const isSticky = scrollTop > 200; // 假设100px时触发吸顶
    
    // 只有当值变化时才更新数据，减少不必要的setData
    if (isSticky) {
      this.setData({
        navIsTransparent: false,
      });
    } else {
      this.setData({
        navIsTransparent: true,
      });
    }

    const query = wx.createSelectorQuery();
    query.selectAll('.section').boundingClientRect();
    query.exec((res) => {
      const rects = res[0];
      for (let i = rects.length - 1; i >= 0; i--) {
        if (rects[i].top <= (43 + this.data.statusBarHeight + 46)) { // tab 区大约高度
          this.setData({
            topSwiperSelectIdx: this.data.listConfig[i].id
          });
          break;
        }
      }
    });
    
    // 这里可以添加其他滚动相关逻辑
    // console.log('截流后的滚动位置:', e[0].scrollTop);
  },
  handleClickParentReply(e: any) {
    const { parentid , showReplayBar} = e.detail;
    console.log('parent_id11', showReplayBar);
    this.setData({
      showReplayBar,
    })
  },


  async onShow() {
    // this.setData({
    //   loading: true,
    // })
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
      loading: true,
      curExhibitionId: Number(options.exhibition_id),
    })
    this.initPage(options.exhibition_id);
    this.throttledScroll = throttle(this.handleScroll1, 50);
  },
  onPageScroll(e: any) {
    // throttle((() => {
    //   if (e.scrollTop > 100) {
    //     // 执行吸顶逻辑
    //     console.log('111111111', e)
    //   }
    // }), 10)
    // if (e.scrollTop > 100) {
    //   // 执行吸顶逻辑
    //   console.log('111111111', e.scrollTop)
    // }

    this.throttledScroll(e);
    
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

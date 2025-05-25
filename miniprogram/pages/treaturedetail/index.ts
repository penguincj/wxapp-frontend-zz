import { getTreatureInfoById, getExhibitionById } from "../../api/api";
import { generateNewUrlParams, backToTargetPage, getCurrentPageParamStr, generateDateFormat } from "../../utils/util";

Page({
  data: {
    treatureInfo: {} as any,
    exhibitionList: [] as any,
  },
  scroll(e: any) {
    // console.log(e)
  },
 

  async initPage(_treatureid: any) {
    try {
      const res: any = await getTreatureInfoById(_treatureid);
      if (res && res.treasure) {
        this.setData({
          treatureInfo: res.treasure,
          loading: false,
        })
        const res_exhibition: any = await getExhibitionById(res.treasure.exhibition_id);
        if (res_exhibition && res_exhibition.code === 0) {
          this.setData({
            exhibitionList: [res_exhibition.exhibition]
          })
        }
      }
    } catch (error) {
      this.setData({
        loading: false,
      })
    }
  },

  handleClickItem() {
    console.log('handleClickCommentIcon');
    const url_params = generateNewUrlParams({
      exhibition_id: this.data.treatureInfo.exhibition_id
    })
    wx.navigateTo({
      url: '/pages/exhibitiondetail/index' + url_params
    })
  },
  
  async onShow() {
    
  },
  onLoad(options) {
    console.log('onLoad', options);
    this.setData({
      curTreatureId: Number(options.treature_id),
    })
    this.initPage(options.treature_id);

  },
  onShareAppMessage() {
    const defaultUrl = 'https://gewugo.com/api/v1/storage/image/share-3639793484.jpg';
    console.log(this.data.treatureInfo.more_image_urls[0]);
    const str = getCurrentPageParamStr();
    const imageUrl = (this.data.treatureInfo && this.data.treatureInfo.image_url) ? this.data.treatureInfo.image_url : defaultUrl;
    const title = (this.data.treatureInfo.name) ? `博物岛屿|${this.data.treatureInfo.name}` : '让您的博物馆之旅不虚此行';
    var shareObj = {
      title,
      path: '/pages/treaturedetail/index' + str,
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

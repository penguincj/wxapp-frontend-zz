
import { getPosters, getPostersOfMuseum } from "../../api/api";
import { generateNewUrlParams, backToTargetPage, getCurrentPageParamStr, generateDateFormat } from "../../utils/util";

Page({
  data: {
    exhibitionId: -1,
    museumId: -1,
    posterType: 'exhibition',
    list: [] as any,
  },

  async getPosterList(_id: any) {
    try {
      let res : any = {};
      if (this.data.posterType === 'exhibition') {
        res = await getPosters(_id);
      } else if(this.data.posterType === 'museum') {
        res = await getPostersOfMuseum(_id);
      }
      
      if ( res && res.code === 0) {
        if (res.poster && res.poster.image_urls) {
          this.setData({
            list: res.poster.image_urls
          })
        }
      }
    } catch (error) {
      console.log(error)
    }
  },


  handleClickImg(event: any) {
    const { idx } = event.currentTarget.dataset;
    console.log('idx-----', idx)
    let params = {};
    if (this.data.posterType === 'exhibition') {
      params = { exhibition_id: this.data.exhibitionId }
    } else if (this.data.posterType === 'museum')  {
      params = { museum_id: this.data.museumId }
    }
    const url_params = generateNewUrlParams({
      poster_idx: idx,
      ...params,
    })
    wx.navigateTo({
      url: '/pages/poster/index' + url_params,
    })
  },

  onReady() {
  },

  onLoad(options) {
    if (options.museum_id) {
      this.setData({
        museumId: Number(options.museum_id),
        posterType: 'museum',
      })
      this.getPosterList(Number(options.museum_id))

    } else if (options.exhibition_id) {
      this.setData({
        exhibitionId: Number(options.exhibition_id),
        posterType: 'exhibition',
      })
      this.getPosterList(Number(options.exhibition_id))

    }
   
    
  }


});
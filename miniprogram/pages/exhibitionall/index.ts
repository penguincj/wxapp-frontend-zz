import { getExhibitionListAll } from "../../api/api";
import { transferObjToUrlParams, generateNewUrlParams, backToTargetPage } from "../../utils/util";

Page({
  data: {
    exhibitions: [] as any,
    loading: false,
    url_obj: {}
  },
  async initPage (params_obj: any) {

    this.setData({
      loading: true,
    })
    try {
      const url_query = transferObjToUrlParams(params_obj);
      const res: any = await getExhibitionListAll(url_query);
      if (res && res.exhibitions) {
        this.setData({
          exhibitions: res.exhibitions
        })
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

  handleClickItem(e: any) {
    const { idx } = e.currentTarget.dataset;
    const url_params = generateNewUrlParams({
      exhibition_id: idx,
    })
    wx.navigateTo({
      url: '/pages/exhibitiondetail/index' + url_params
    })
  },

  handleClickPlayerComp() {
    const targetPage = "pages/exhibitlist/index";
    backToTargetPage(targetPage);
  },
  
  onShow() {
    this.setData({
      // exhibitions: exhibitions,
      loading: false,
    })

  },
  onLoad(options) {
    let query_obj: any = { num: 999};
    if (options && options.exhibition_type) {
      query_obj = {
        ...query_obj,
        type: options.exhibition_type,
      }
    }
    if (options && options.city_id) {
      query_obj = {
        ...query_obj,
        cityID: options.city_id,
      }
    }
    if (options && options.museum_id) {
      query_obj = {
        ...query_obj,
        museumID: options.museum_id,
      }
    }
    this.setData({
      url_obj: query_obj,
    })
    this.initPage(query_obj);
  }

});

// index.ts
// 获取应用实例
// const app = getApp<IAppOption>()
import { getExhibitionListAll } from "../../api/api";
import { transferObjToUrlParams, generateNewUrlParams } from "../../utils/util";

const exhibitions = [
  {
    id: 0,
    name: '玉出昆冈',
    img: 'http://gewugo.com/api/v1/storage/image/swiper1-1489240990.jpg',
    desc: '清代宫廷和田玉文化特展',
    link: 'pages/index/index',
    opendate: '2024.01.20-2024.03.31',
    type: '常设展'
  },
  {
    id: 1,
    name: '玉出昆冈2',
    img: 'http://gewugo.com/api/v1/storage/image/swiper2-4593118634.jpg',
    desc: '清代宫廷和田玉文化特展2',
    link: 'pages/index/index',
    opendate: '2024.01.21-2024.03.31',
    type: '临时展'
  },
]
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

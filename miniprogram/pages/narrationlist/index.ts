// index.ts
// 获取应用实例
// const app = getApp<IAppOption>()
import { getNarrowList, getMuseumList } from "../../api/api";
import { calTimeTxt, getCurrentPageParam,getCurrentPageParamStr, transferObjToUrlParams, backToTargetPage } from "../../utils/util";

Page({
  data: { 
    narrationList:[],
    tagArrOne:[{
      dimension: 'time',
      label_list: [
        {
          id: 1,
          label_name: '标签1',
        },
        
        {
          id: 2,
          label_name: '标签2',
        },
        
        {
          id: 3,
          label_name: '标签3',
        },
        
        {
          id: 4,
          label_name: '标签4',
        },
        
      ],
    },{
      dimension: 'voice',
      label_list: [
        {
          id: 1,
          label_name: '标签1',
        },
        
        {
          id: 2,
          label_name: '标签2',
        },
        
        {
          id: 3,
          label_name: '标签3',
        },
        
        {
          id: 4,
          label_name: '标签4',
        },
        
      ],
    }],
    tagArrMuti:[{
      dimension: 'muti',
      label_list: [
        {
          id: 1,
          label_name: '标签1',
        },
        
        {
          id: 2,
          label_name: '标签2',
        },
        
        {
          id: 3,
          label_name: '标签3',
        },
        
        {
          id: 4,
          label_name: '标签4',
        },
        
      ],
    }],
    curExhibitionId:0,
  },

  async initPage(_exhibitionid: any) {
    try {
      const res_narr: any = await getNarrowList(_exhibitionid);
      if (res_narr && res_narr.narrations) {
        const narrationList = res_narr.narrations.map((item: any) => {
          const duration_fmt = calTimeTxt(item.duration);

          return {
            id: item.id,
            name: item.name,
            image_url: item.url,
            duration_fmt,
            count: 999,
          }
        })
        this.setData({
          narrationList: narrationList,
        })
      }
    } catch (error) {
      this.setData({
        loading: false,
      })
    }
  },
  

  onLoad(options) {
    console.log('onLoad', options);

    this.setData({
      loading: true,
      curExhibitionId: Number(options.exhibition_id),
    })
    this.initPage(Number(options.exhibition_id));

  },
  onShow() {    
    
  },
})

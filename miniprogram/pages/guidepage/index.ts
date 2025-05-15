import { getCurrentPageParamStr, backToTargetPage } from "../../utils/util"
import { getMuseumInfoById, getMuseumById } from "../../api/api";

const iconsConfigMap = [
  {id: 1, name: '预约门票', type: 'ticketInfo', icon: 'https://gewugo.com/api/v1/storage/image/commodityorder-message@2x-6874472274.webp'},
  {id: 2, name: '开放时间', type: 'openTime', icon: 'https://gewugo.com/api/v1/storage/image/platformservice-message@2x-3002626842.webp'},
  {id: 3, name: '导览地图', type: 'museumMap', icon: 'https://gewugo.com/api/v1/storage/image/violationpenalty-message@2x-0015496781.webp'},
  {id: 4, name: '馆内服务', type: 'service', icon: 'https://gewugo.com/api/v1/storage/image/businessgrowth-message@2x-6366386929.webp'},
  {id: 5, name: '文创商店', type: 'shop', icon: 'https://gewugo.com/api/v1/storage/image/Storemanagement-message@2x-9670115457.webp'},
  {id: 6, name: '交通路线', type: 'trafficRoute', icon: 'https://gewugo.com/api/v1/storage/image/notification-message@2x-7885296907.webp'},
]

Page({
  data: {
    listConfig: iconsConfigMap,
    topSwiperSelectIdx: 1,
    museumId: -1,
    musuemInfo: {},
    visitGuide: {},
    curGuideContent: [],
    statusBarHei: 0,
    appid: "",
  },

  // swiper-unit组件
  handleChangePannelId(event: any) {
    const { selectId } = event.detail;
    console.log('handleChangePannelId', selectId);
    this.tabChange(selectId);
  },

  tabChange(_id: number) {
    const curSelectedObj: {type: String} = (iconsConfigMap.find(i => i.id === _id)) || {type: 'openTime'};
    this.setData({
      // @ts-ignore
      curGuideContent: this.data.visitGuide[curSelectedObj.type],
      topSwiperSelectIdx: _id,
    })
  },

 
  async getUserProfile() {
    const userinfo = getApp().globalData.userinfo;
    
    this.setData({
      userInfo: {...userinfo},
    })
  },

  async getMuseumInfo() {
    const res: any = await getMuseumInfoById(this.data.museumId);
    if (res && res.code === 0) {
      if (res.visitGuide && res.visitGuide.guide_items && res.visitGuide.guide_items.length) {
        const items = res.visitGuide.guide_items;
        let final_items = {} as any;
        const n_res = res.visitGuide.guide_items.map((i: any, index:any) => {
          const blcok = i.blocks.map((inner: any, index_inner: any) => {
            console.log('inner.content', inner.content);
            
            let n_content = inner.content.replace(/↵/g, '<br/>');
            n_content=n_content.replace(/\r\n/g,"<br>")  
            n_content=n_content.replace(/\n/g,"<br>"); 
            return {
              ...inner,
              content: n_content
            }
          })
          return {
            ...i,
            blocks: blcok
          }
        })
        console.log('n_res', n_res)
        for (let i = 0; i< n_res.length; i++) {
          const item_key = n_res[i].item_type;
          const item_val = n_res[i].blocks;
          final_items[item_key] = item_val;
        }
        console.log('final_items', final_items)
        this.setData({
          visitGuide: final_items,
          appid: res.visitGuide.app_id,
        })
        this.tabChange(this.data.topSwiperSelectIdx)
      }
      
    }
  },

  async getMuseum() {
    const res: any = await getMuseumById(this.data.museumId);
    if (res && res.code === 0) {
      this.setData({
        musuemInfo: res.museum,
      })
      console.log(res.museum)
    }
  },

  handleClickBuyTicket() {
    const appid = this.data.appid;
    if (appid) {
      wx.navigateToMiniProgram({
        appId: appid,
        success(res) {
          // 打开成功
          console.log('navigateToMiniProgram success !')
        }
      })
    }
  },

  initPage() {
    this.getMuseum();
    this.getMuseumInfo();
  },

  onShow: function() {
    
  },
  onLoad(options: any) {
    console.log('onLoad', options);
    this.setData({
      museumId: Number(options.museum_id),
      topSwiperSelectIdx: Number(options.select_id),
    })
    const info = wx.getWindowInfo();
    const hei = info.statusBarHeight;
    this.setData({
      statusBarHei: hei,
    })
    this.initPage();
  },
  

})

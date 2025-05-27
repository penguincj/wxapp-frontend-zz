import { getMuseumById, getTreatureList, getMuseumInfoById, getShortExhibitionList, getLongExhibitionList, getPastExhibitionList, getFutureExhibitionList } from "../../../api/api";
import { generateNewUrlParams, backToTargetPage, getCurrentPageParamStr } from "../../../utils/util";
const listConfig = [
  {
    id: 1,
    name: '展览信息',
  },
  {
    id: 3,
    name: '重点文物',
  },
  {
    id: 2,
    name: '参观指南',
  },
]

const iconsConfig = [
  {id: 1, name: '预约门票', type: 'ticketInfo', icon: 'https://gewugo.com/api/v1/storage/image/commodityorder-message@2x-6874472274.webp'},
  {id: 2, name: '开放时间', type: 'openDate', icon: 'https://gewugo.com/api/v1/storage/image/platformservice-message@2x-3002626842.webp'},
  {id: 3, name: '导览地图', type: 'museumMap', icon: 'https://gewugo.com/api/v1/storage/image/violationpenalty-message@2x-0015496781.webp'},
  {id: 4, name: '馆内服务', type: 'service', icon: 'https://gewugo.com/api/v1/storage/image/businessgrowth-message@2x-6366386929.webp'},
  {id: 5, name: '文创商店', type: 'shop', icon: 'https://gewugo.com/api/v1/storage/image/Storemanagement-message@2x-9670115457.webp'},
  {id: 6, name: '交通路线', type: 'trafficRoute', icon: 'https://gewugo.com/api/v1/storage/image/notification-message@2x-7885296907.webp'},
]

const PAGE_SIZE = 10;

Page({
  data: {
    museumInfo: {} as any,
    topBarHeight: 0,
    safeHeight: 0,
    windowHeight: 0,
    statusBarHeight:0,
    recommendList: [],
    normalList: [],
    outofdateList: [],
    futureList: [],
    curMuseumId: -1,
    loading: false,
    topSwiperSelectIdx: 1,
    listConfig: [] as any,
    iconsConfig,
    isShowSwiperUnit: false,
    museumGuideInfo: [] as any,

    leftList: [] as any,   // 左列数据
    rightList: [] as any,  // 右列数据
    page: 1,        // 当前页码
    pageSize: PAGE_SIZE,   // 每页加载数量
    hasMore: true,   // 是否还有更多数据
    waterfallloading: false,
  },
  async initPage(_museumid: any) {
    this.setData({
      loading: true
    })
    try {
      const museumInfo: any = await getMuseumById(_museumid);
      const normalList_res: any = await getLongExhibitionList(_museumid, 999);
      const recommendList_res: any = await getShortExhibitionList(_museumid, 999);
      const pastList_res: any = await getPastExhibitionList(_museumid, 999);
      const futureList_res: any = await getFutureExhibitionList(_museumid, 999);
      this.setData({
        museumInfo: museumInfo.museum,
        normalList: normalList_res.exhibitions,
        recommendList: recommendList_res.exhibitions,
        outofdateList: pastList_res.exhibitions,
        futureList: futureList_res.exhibitions,
        loading: false,
      })

      await this.getMuseumInfo();
      await this.getTreatureListInfo(this.data.curMuseumId);
      let list_data = [] as any;
      if (this.data.museumGuideInfo.length || this.data.leftList.length) {
        list_data = [
          {
            id: 1,
            name: '展览信息',
          },
        ]
      }
      if (this.data.leftList.length) {
        list_data.push({
          id: 3,
          name: '重点文物',
        })
      }
      if (this.data.museumGuideInfo.length) {
        list_data.push({
          id: 2,
          name: '参观指南',
        })
      }
      this.setData({
        listConfig: list_data,
      })

    } catch (error) {
      this.setData({
        loading: false
      })
    }
  },


  async getMuseumInfo() {
    const res: any = await getMuseumInfoById(this.data.curMuseumId);
    if (res && res.code === 0) {
      if (res.visitGuide && res.visitGuide.guide_items && res.visitGuide.guide_items.length) {
        this.setData({
          museumGuideInfo: res.visitGuide.guide_items
        });
        
      } else {
        this.setData({
          isShowSwiperUnit: false,
        })
      }
      
    }
  },


  // 分配项目到左右列（简单高度平衡算法）
  distributeItems(items: any) {
    let leftHeight = this.getColumnHeight(this.data.leftList);
    let rightHeight = this.getColumnHeight(this.data.rightList);
    
    const leftList = [] as any;
    const rightList = [] as any;
    
    items.forEach((item: any) => {
      if (leftHeight <= rightHeight) {
        leftList.push(item);
        leftHeight += item.height;
      } else {
        rightList.push(item);
        rightHeight += item.height;
      }
    });
    
    return { leftList, rightList };
  },

  // 计算列的总高度
  getColumnHeight(list= []) {
    return list.reduce((sum, item: any) => sum + item.height, 0);
  },

  async getTreatureListInfo(_museumid: any, _pagenum =1) {
    const res :any = await getTreatureList(_museumid, this.data.pageSize,  _pagenum);
    if (res && res.code === 0) {
      const exlist = res.treasures;
        const list = exlist.map((i: any) => {
          
          const arr = i.image_width_height.split(",");
          // const arr = "100,105".split(",");
          const width = Number(arr[0]);
          const hei = Number(arr[1]);
          const titleline = 132;
          const height = 360 * (hei/width) + titleline;
          return {
            ...i,
            height,
          }
        })
        // this.setData({
        //   exhibitionList: list,
        // })
        console.log('------list', list)
        // 根据高度决定放入左列还是右列
        const { total_page_num = 10, page_num = 1} = res;
        const { leftList, rightList } = this.distributeItems(list);
        const totalPage = total_page_num;
        const curPageNum = page_num;

        this.setData({
          leftList: [...this.data.leftList, ...leftList],
          rightList: [...this.data.rightList, ...rightList],
          page: curPageNum,
          waterfallloading: false,
          hasMore: curPageNum < totalPage
        });
    }
  },

  handlePannelClick(e: any) {
    const { idx } = e.currentTarget.dataset;
    const url_params = generateNewUrlParams({
      select_id: idx,
    })
    wx.navigateTo({
      url: '/pages/guidepage/index'+ url_params
    })
  },

  handleScrolltolower() {
    console.log('1', this.data.hasMore);
    if (this.data.hasMore && (this.data.topSwiperSelectIdx === 3)) {
      this.getTreatureListInfo(this.data.curMuseumId, this.data.page + 1);
    }
  },

  // swiper-unit组件
  handleChangePannelId(event: any) {
    const { selectId } = event.detail;
    console.log('handleChangePannelId', selectId);
    this.setData({
      topSwiperSelectIdx: selectId,
    });
  },


  handleClickPlayerComp() {
    const targetPage = "pages/exhibitlist/index";
    backToTargetPage(targetPage);
  },


  handleClickMoreReco() {
    const url_params = generateNewUrlParams({
      exhibition_type: 'recommend',
    })
    wx.navigateTo({
      url: '/pages/exhibitionall/index'+ url_params
    })
  },

  handleClickMoreFuture() {
    const url_params = generateNewUrlParams({
      exhibition_type: 'future',
    })
    wx.navigateTo({
      url: '/pages/exhibitionall/index'+ url_params
    })
  },
  
  handleClickMorePast() {
    const url_params = generateNewUrlParams({
      exhibition_type: 'past',
    })
    wx.navigateTo({
      url: '/pages/exhibitionall/index'+ url_params
    })
  },
  
  handleClickMoreLong() {
    const url_params = generateNewUrlParams({
      exhibition_type: 'long',
    })
    wx.navigateTo({
      url: '/pages/exhibitionall/index'+ url_params
    })
  },
  handleClickTreatureItem(event: any) {
    const { idx } = event.currentTarget.dataset;
    console.log('-----idx', idx)
    const url_params = generateNewUrlParams({treature_id: idx})
    wx.navigateTo({
      url: '/pages/treaturedetail/index' + url_params,
    })
  },
  handleClickItem(event: any) {
    const { id } = event.detail;
    const url_params = generateNewUrlParams({exhibition_id: id})
    wx.navigateTo({
      url: '/pages/exhibitiondetail/index' + url_params,
    })
  },
  onLoad(options) {
    console.log('museum detail onLoad', options);
    this.setData({
      curMuseumId: Number(options.museum_id),
    });
    this.initPage(options.museum_id);
  },
  onShareAppMessage(){
    const defaultUrl = 'https://gewugo.com/api/v1/storage/image/share-3639793484.jpg';
    console.log(this.data.museumInfo.image_url);
    const str = getCurrentPageParamStr();
    const imageUrl = (this.data.museumInfo && this.data.museumInfo.image_url) ? this.data.museumInfo.image_url : defaultUrl ;
    const title = (this.data.museumInfo.name) ? `博物岛屿|${this.data.museumInfo.name}` : '让您的博物馆之旅不虚此行' ;
    var shareObj = {
      title,
      path: '/pages/museum/museumdetail/index'+str,
      imageUrl: imageUrl,
      success: function(res: any){
        if(res.errMsg == 'shareAppMessage:ok'){
          console.log('share success')
        }
      },
      fail: function(res: any){
        if(res.errMsg == 'shareAppMessage:fail cancel'){
          console.log('share cancel')
        }else if(res.errMsg == 'shareAppMessage:fail'){
          console.log('share fail')
        }
      },
    }
    return shareObj;
  },

})

import { getMuseumById, getTreatureList, getMuseumInfoById, getRecoExhibitionList, getLongExhibitionList, getPastExhibitionList, getFutureExhibitionList, getPostersOfMuseum, getAlbumsFeedList, getRankingsByMuseumId } from "../../../api/api";
import { generateNewUrlParams, backToTargetPage, getCurrentPageParamStr } from "../../../utils/util";
const listConfig = [
  {
    id: 1,
    name: '推荐展览',
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
    recommendList: [] as any,
    curMuseumId: -1,
    loading: false,
    topSwiperSelectIdx: 1,
    listConfig: listConfig,
    iconsConfig,
    isShowSwiperUnit: false,
    showPosterBtn: false,
    museumGuideInfo: [] as any,
    noteList: [], //
    museumRankList: [] as any,

    leftList: [] as any,   // 左列数据
    rightList: [] as any,  // 右列数据
    page: 1,        // 当前页码
    pageSize: PAGE_SIZE,   // 每页加载数量
    hasMore: true,   // 是否还有更多数据
    waterfallloading: false,

    leftPhotoList: [] as any,   // 左列数据
    rightPhotoList: [] as any,  // 右列数据
    pagePhoto: 1,        // 当前页码
    pageSizePhoto: PAGE_SIZE,   // 每页加载数量
    hasMorePhoto: true,   // 是否还有更多数据
    waterfallloadingPhoto: false,

    selectedNoteId: 0,
    navIsTransparent: true,
    bigImg: '',
    showBigImg: false,
  },
  handlePageScroll(e: any) {
    const { scrollTop } = e.detail;

    if (scrollTop > 200) {
      console.log('1');
      this.setData({
        navIsTransparent: false
      })
    } else {
      console.log('2');
      this.setData({
        navIsTransparent: true
      })
    }
    
  },
  noScroll() {
    console.log('noScroll')
    return false;
  },

  handlePhotoItem(e: any) {
    const { url } = e.currentTarget.dataset;
    console.log('url', url)
    this.setData({
      bigImg: url,
      showBigImg: true,
    })
  },

  handleClosePopupPhoto() {
    this.setData({
      showBigImg: false,
    })
  },

  handlePulling(e: any) {
    console.log(e)
  },
  generateFlags(_exhibitionlist: any) {
    if (_exhibitionlist) {
      const exhibitionList = _exhibitionlist.map((i: any) => 
       
        {
          let flag = false;
          let flag_name = '';
          if (i.tags && i.tags.length && i.tags.includes('NEW')) {
            flag = true;
            flag_name = 'NEW'
          } else if (Number(i.on_display) === 0) {
            flag = true;
            flag_name = '已结束'
          }
          return {
            ...i, 
            is_flag: flag,
            flag_name,
          }
        }
      );
      return exhibitionList;
    }
    return [];
  },

  chunkRankings(list: any[], size = 3) {
    const result = [] as any[];
    for (let i = 0; i < list.length; i += size) {
      result.push(list.slice(i, i + size));
    }
    return result;
  },

  async initPage(_museumid: any) {
    this.setData({
      loading: true
    })
    wx.showLoading({
      title: '加载中',
    });
    try {
      const museumInfo: any = await getMuseumById(_museumid);
      const recommendList_res: any = await getRecoExhibitionList(_museumid, 999);
      const recommendList = this.generateFlags(recommendList_res.exhibitions);
      this.setData({
        museumInfo: museumInfo.museum,
        recommendList,
        loading: false,
      })

      await this.getMuseumInfo();
      await this.getMuseumRankList(this.data.curMuseumId);
      await this.getTreatureListInfo(this.data.curMuseumId);
      if (museumInfo && museumInfo.museum && museumInfo.museum.album_id) {
        await this.getPhotoListInfo(museumInfo.museum.album_id);
      }
      let list_data = this.data.listConfig;

      if (this.data.leftList.length) {
        list_data.push({
          id: 2,
          name: '重点文物',
        })
      }
      if (this.data.leftPhotoList.length) {
        list_data.push({
          id: 3,
          name: '相册合集',
        })
      }
      this.setData({
        listConfig: list_data,
        loading: false,
      })
      wx.hideLoading();

    } catch (error) {
      this.setData({
        loading: false
      })
      wx.hideLoading();
    }
  },

  async getMuseumRankList(_museumid: any) {
    try {
      const res: any = await getRankingsByMuseumId(_museumid);
      if (res && res.code === 0) {
        this.setData({
          museumRankList: res.rankings,
        });

      }
    } catch (error) {
      this.setData({
        museumRankList: [],
      });
    }
  },

  handleClickSharePoster() {
    const url_params = generateNewUrlParams({
      museum_id: this.data.curMuseumId,
      type: 'museum'
    })
    wx.navigateTo({
      url: '/pages/bglist/index' + url_params,
    })
  },
  
  async getPoster(_museumid: any) {
    try {
      const res : any = await getPostersOfMuseum(_museumid);
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

  generateNoteInfo(_visitguide: any) {
    const { open_time, open_time_detail, ticket_info, ticket_info_detail, has_museum_map } = _visitguide;
    const noteList = [{
      id: 1,
      guideid: 2,
      title: open_time || '开放时间',
      desc: open_time_detail || '查看 >'
    }, {
      id: 2,
      guideid: 1,
      title: ticket_info || '门票信息',
      desc: ticket_info_detail || '查看 >'
    }];
    if (has_museum_map) {
      noteList.push({id: 3, guideid: 3, title: '导览地图', desc: '查看 >'})
    }
    noteList.push({id: 4,guideid: 1,  title: '更多指南', desc: '查看 >' })
    return noteList
  },

  async getMuseumInfo() {
    const res: any = await getMuseumInfoById(this.data.curMuseumId);
    if (res && res.code === 0) {
      if (res.visitGuide && res.visitGuide) {
        const noteList = this.generateNoteInfo(res.visitGuide);
        console.log('noteList', noteList)
        this.setData({
          noteList,
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

  async getPhotoListInfo(_albumid: any, _pagenum =1) {
    const res :any = await getAlbumsFeedList(_albumid, this.data.pageSize,  _pagenum);
    if (res && res.code === 0) {
      const exlist = res.album.images;

        const list = exlist.map((i: any) => {
          
          const arr = i.width_height.split(",");
          // const arr = "100,105".split(",");
          const width = Number(arr[0]);
          const hei = Number(arr[1]);
          const titleline = 0;
          const height = 360 * (hei/width) + titleline;
          return {
            ...i,
            height,
          }
        })

        console.log('------photo list', list)
        // 根据高度决定放入左列还是右列
        const { total_page_num = 10, page_num = 1} = res;
        const { leftList, rightList } = this.distributeItems(list);
        const totalPage = total_page_num;
        const curPageNum = page_num;

        this.setData({
          leftPhotoList: [...this.data.leftPhotoList, ...leftList],
          rightPhotoList: [...this.data.rightPhotoList, ...rightList],
          pagePhoto: curPageNum,
          waterfallloadingPhoto: false,
          hasMorePhoto: curPageNum < totalPage
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
    if (this.data.hasMore && (this.data.topSwiperSelectIdx === 2)) {
      this.getTreatureListInfo(this.data.curMuseumId, this.data.page + 1);
    }
  },

  handleScrolltolower3() {
    console.log('3', this.data.hasMorePhoto);
    if (this.data.hasMorePhoto && (this.data.topSwiperSelectIdx === 3)) {
      this.getPhotoListInfo(this.data.museumInfo.album_id, this.data.pagePhoto + 1);
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

  handleSelectNoteItem(e: any) {
    console.log(e);
    const { selectId, guideId } = e.detail;
    this.setData({
      selectedNoteId: selectId,
    })
    if (guideId) {
      const url_params = generateNewUrlParams({
        select_id: guideId,
      })
      wx.navigateTo({
        url: '/pages/guidepage/index'+ url_params
      })
    }
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
    const { idx, name } = event.currentTarget.dataset;
    this.tracker.report('museum_detail_treature_click_e11', {id: idx, name});
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
  handleRankClickItem(event: any) {
    const { id } = event.detail;
    if (!id) return;
    const url_params = generateNewUrlParams({
      ranking_id: Number(id),
    })
    wx.navigateTo({
      url: '/pages/treature-ranklist/index' + url_params,
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

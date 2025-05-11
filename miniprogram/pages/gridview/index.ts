// index.ts
// 获取应用实例
// const app = getApp<IAppOption>()
import { getCityList, getCityExhibitionFeedList } from "../../api/api";
import { getCurrentCity, getCurrentPageParam,generateNewUrlParams, transferObjToUrlParams, backToTargetPage } from "../../utils/util";

const PAGE_SIZE = 10;

Page({
  data: { 
    exhibitionList: [],
    curCityId: -1,
    cityName: "",
    cityList: [],
    leftList: [] as any,   // 左列数据
    rightList: [] as any,  // 右列数据
    page: 1,        // 当前页码
    pageSize: PAGE_SIZE,   // 每页加载数量
    loading: false, // 是否正在加载
    hasMore: true   // 是否还有更多数据
  },
  scroll() {

  },
  handleClickMuseum(event: any) {
    const { idx } = event.currentTarget.dataset;
    let url_obj = getCurrentPageParam();
    url_obj = {
      ...url_obj,
      museum_id: idx,
    }
    const url_str = transferObjToUrlParams(url_obj);
    wx.navigateTo({
      url: '/pages/museum/museumdetail/index'+ url_str,
    })
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
 
  async getExhibitionList (_cityid: any, _pagenum =1 ) {
    this.setData({
      loading: true,
    })
   
    try {
      const exhibition_res: any = await getCityExhibitionFeedList(_cityid, PAGE_SIZE, _pagenum);
      if (exhibition_res && exhibition_res.exhibitions) {
        const exlist = exhibition_res.exhibitions;
        const list = exlist.map((i: any) => {
          // const height = 200 + Math.random() * 200; // 随机高度200-400
          const arr = i.image_width_height.split(",");
          const width = arr[0];
          const hei = arr[1];
          const titleline = i.name.length > 12 ? 118: 80;
          const height = 360 * (hei/width) + titleline;
          return {
            ...i,
            height,
          }
        })
        this.setData({
          exhibitionList: list,
        })
        // 根据高度决定放入左列还是右列
        const { leftList, rightList } = this.distributeItems(list);
        const totalPage = exhibition_res.total_page_num;
        const curPageNum = exhibition_res.page_num;

        this.setData({
          leftList: [...this.data.leftList, ...leftList],
          rightList: [...this.data.rightList, ...rightList],
          page: curPageNum,
          loading: false,
          hasMore: curPageNum < totalPage // 模拟只有5页数据
        });
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
  handleClickPlayerComp() {
    const targetPage = "pages/exhibitlist/index";
    backToTargetPage(targetPage);
  },

  clearList() {
    this.setData({
      leftList: [],
      rightList: [],
      exhibitionList: [],
      page: 1,        // 当前页码
      pageSize: PAGE_SIZE,   // 每页加载数量
      loading: false, // 是否正在加载
      hasMore: true,
    })
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

  // 生成随机颜色
  getRandomColor() {
    const colors = ['#FFC0CB', '#FFD700', '#98FB98', '#87CEFA', '#DDA0DD', '#FFA07A'];
    return colors[Math.floor(Math.random() * colors.length)];
  },

  handleScrolltolower(e: any) {
    console.log('1', this.data.hasMore);
    if (this.data.hasMore) {
      this.getExhibitionList(this.data.curCityId, this.data.page + 1);
    }
  },

  // 上拉加载更多
  onReachBottom() {
    this.getExhibitionList(this.data.curCityId);
  },
  async initPage() {
    // this.loadData();
    try {
      const city = await getCurrentCity();
      const citylist:any = await getCityList();
      let city_item = ((citylist || {}).cities || []).find((i: any) => i.name === city);
      console.log('citylist---', citylist);
      const list = [{
        id: 0,
        name: '全国'
      }, ...citylist.cities] as any;
     
      let city_id = -1;

      if(city_item && city_item.name) {
        city_id = city_item.id;
      } else {
        city_item = ((citylist || {}).cities || []).find((i: any) => i.name === '北京市');
        city_id = city_item.id;
        // this.generateSelectCityList(city_item, citylist.cities);
      }
      this.setData({
        cityList: list,
        curCityId: city_id,
        cityName: city_item.name,
      })
      console.log(city_item);
      
      this.getExhibitionList(city_id);
  
    } catch (error) {
      console.log(error);
      
      this.setData({
        loading: false,
      })
    }
  },
  handleCityChange(event: any) {
    const { selectedId, selectedName } = event.detail;
    this.setData({
      curCityId: selectedId,
      cityName: selectedName
    });
    this.clearList();

    this.getExhibitionList(selectedId);
  },

  onLoad(options) {
    console.log('museumlist onLoad', options);
    if (options && options.cityid) {
      this.setData({
        curCityId: Number(options.city_id),
      })
    }
    this.setData({
      loading: true,
    })

    this.initPage();
    
  },
  onShow() {    
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {    
      this.getTabBar().setData({
          selected: 3
        })
    }
  },
  // onShareAppMessage(){
  //   const defaultUrl = 'https://gewugo.com/api/v1/storage/image/share-3639793484.jpg';
  //   const title = '让您的博物馆之旅不虚此行' ;
  //   const str = getCurrentPageParamStr();
  //   var shareObj = {
  //     title,
  //     path: '/pages/museumlist/index' + str,
  //     imageUrl: defaultUrl,
  //     success: function(res: any){
  //       if(res.errMsg == 'shareAppMessage:ok'){
  //         console.log('share success')
  //       }
  //     },
  //     fail: function(res: any){
  //       if(res.errMsg == 'shareAppMessage:fail cancel'){
  //         console.log('share cancel')
  //       }else if(res.errMsg == 'shareAppMessage:fail'){
  //         console.log('share fail')
  //       }
  //     },
  //   }
  //   return shareObj;
  // },
  

})

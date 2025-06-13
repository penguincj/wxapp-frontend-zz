import { getHotComments, getCityList, getMuseumList, getCityRecoExhibitionList } from "../../api/api";
import { generateDateFormat, getCurrentCity, backToTargetPage, getCurrentPageParamStr, throttle, generateNewUrlParams } from "../../utils/util";

const bannerList = [{
  id: 1,
  image_url: 'https://gewugo.com/test-api/v1/storage/image/纯图版-9333554936.webp',
  app_url: '/pages/exhibitiondetail/index?exhibition_id=4&city_id=4'
}, {
  id: 2,
  image_url: 'https://gewugo.com/test-api/v1/storage/image/Rectangle8@2x-3418066973.webp',
  app_url: '/pages/exhibitionlist/index'
}, {
  id: 3,
  image_url: 'https://gewugo.com/test-api/v1/storage/image/Rectangle7@2x-3743156654.webp',
  app_url: '/pages/exhibitionlist/index'
}, {
  id: 4,
  image_url: 'https://gewugo.com/test-api/v1/storage/image/Rectangle6@2x-1761610838.webp',
  app_url: '/pages/exhibitionlist/index'
}, {
  id: 5,
  image_url: 'https://gewugo.com/test-api/v1/storage/image/Image@2x(2)-6860764179.webp',
  app_url: '/pages/exhibitionlist/index'
}, {
  id: 6,
  image_url: 'https://gewugo.com/test-api/v1/storage/image/arr-r-6468210569.webp',
  app_url: '/pages/exhibitionlist/index'
}];
const exhibitionList = [
  {
    id: 1,
    img: 'https://gewugo.com/test-api/v1/storage/image/Rectangle7@2x-3743156654.webp',
    exhibition_name: '玉出昆冈',
    museum_name: '故宫博物院',
    tags: ['new'],
  },
  {
    id: 2,
    img: 'https://gewugo.com/test-api/v1/storage/image/Rectangle7@2x-3743156654.webp',
    exhibition_name: '了不起的民间艺术',
    museum_name: '故宫博物院',
    tags: ['new'],
  },
  {
    id: 3,
    img: 'https://gewugo.com/test-api/v1/storage/image/Rectangle7@2x-3743156654.webp',
    exhibition_name: '玉出昆冈',
    museum_name: '故宫博物院',
    tags: ['new'],
  },
  {
    id: 4,
    img: 'https://gewugo.com/test-api/v1/storage/image/Rectangle7@2x-3743156654.webp',
    exhibition_name: '了不起的民间艺术',
    museum_name: '故宫博物院',
    tags: ['new'],
  },
];
const dailyListen = {
  id: 1,
  exhibition_name: '文物名称',
  exhibit_name: '海外瑰宝回归东方展',
  duration: 111,
  duration_fmt: '22:35',
  img: 'https://gewugo.com/test-api/v1/storage/image/Image@2x(2)-6860764179.webp',
  audio_url: 'https://gewugo.com/test-api/v1/storage/audio/%E5%8A%9F%E5%8B%8B%E5%96%B7%E6%B0%94%E5%BC%8F%E6%AD%BC%E5%87%BB%E6%9C%BA-9076931046.mp3',
};
const museumArrayList = [
  [
    {
      id: 1,
      rank: 1,
      museum_name: '故宫博物院',
      detail: '乐林泉、万物和生等展览乐林泉、万物和生等展览',
      img: 'https://gewugo.com/test-api/v1/storage/image/Image@2x(2)-6860764179.webp',
    },
    {
      id: 2,
      rank: 2,
      museum_name: '故宫博物院',
      detail: '乐林泉、万物和生等展览',
      img: 'https://gewugo.com/test-api/v1/storage/image/Image@2x(2)-6860764179.webp',
    },
    {
      id: 3,
      rank: 3,
      museum_name: '故宫博物院',
      detail: '乐林泉、万物和生等展览',
      img: 'https://gewugo.com/test-api/v1/storage/image/Image@2x(2)-6860764179.webp',
    },
  ],
  [
    {
      id: 1,
      rank: 4,
      museum_name: '故宫博物院',
      detail: '乐林泉、万物和生等展览',
      img: 'https://gewugo.com/test-api/v1/storage/image/Image@2x(2)-6860764179.webp',
    },
    {
      id: 2,
      rank: 1,
      museum_name: '故宫博物院',
      detail: '乐林泉、万物和生等展览',
      img: 'https://gewugo.com/test-api/v1/storage/image/Image@2x(2)-6860764179.webp',
    },
    {
      id: 3,
      rank: 1,
      museum_name: '故宫博物院',
      detail: '乐林泉、万物和生等展览',
      img: 'https://gewugo.com/test-api/v1/storage/image/Image@2x(2)-6860764179.webp',
    },
  ],
  [
    {
      id: 1,
      rank: 1,
      museum_name: '故宫博物院',
      detail: '乐林泉、万物和生等展览',
      img: 'https://gewugo.com/test-api/v1/storage/image/Image@2x(2)-6860764179.webp',
    },
    {
      id: 2,
      rank: 1,
      museum_name: '故宫博物院',
      detail: '乐林泉、万物和生等展览',
      img: 'https://gewugo.com/test-api/v1/storage/image/Image@2x(2)-6860764179.webp',
    },
    {
      id: 3,
      rank: 1,
      museum_name: '故宫博物院',
      detail: '乐林泉、万物和生等展览',
      img: 'https://gewugo.com/test-api/v1/storage/image/Image@2x(2)-6860764179.webp',
    },
  ],
] as any;

const museumList = [
  {
    id: 1,
    rank: 1,
    museum_name: '故宫博物院',
    detail: '乐林泉、万物和生等展览乐林泉、万物和生等展览',
    img: 'https://gewugo.com/test-api/v1/storage/image/Image@2x(2)-6860764179.webp',
  },
  {
    id: 2,
    rank: 2,
    museum_name: '故宫博物院',
    detail: '乐林泉、万物和生等展览',
    img: 'https://gewugo.com/test-api/v1/storage/image/Image@2x(2)-6860764179.webp',
  },
  {
    id: 3,
    rank: 3,
    museum_name: '故宫博物院',
    detail: '乐林泉、万物和生等展览',
    img: 'https://gewugo.com/test-api/v1/storage/image/Image@2x(2)-6860764179.webp',
  },
] as any;



Page({
  data: {
    bannerList,
    exhibitionList,
    dailyListen,
    museumArrayList: museumArrayList as any,
    museumList: museumList as any,
    comment_list: [] as any,
    hasMore: false,
    page: 1,
    cityList: [] as any,
    curCityId: -1,
    cityName: "",
    isShowMask: false,
    curExhibit: {} as any,
  },

  handleBannerClickItem(e: any) {
    const { id, link } = e.detail;
    if (link) {
      try {
        wx.navigateTo({
          url: link
        })
      } catch (error) {
        console.log(error)
      }
      console.log('-----111----', link)
    }
  },

  handleExClickItem(e: any) {
    const { selectId } = e.detail;
    if (selectId) {
      const url_params = generateNewUrlParams({
        exhibition_id: Number(selectId)
      })
      wx.navigateTo({
        url: '/pages/exhibitiondetail/index' + url_params,
      })
    }
  },

  async getComments(_pagenum=1) {
    const res: any = await getHotComments(10, _pagenum);
    console.log(res);
    if (res && res.code === 0) {
      const { comment_area, pagenum=1, total=1 } = res.data;
      // const star_distribution = data_area.star_distribution.reverse();
      // const score = Number(data_area.score.toFixed(1));

      const comments = comment_area.map((item: any) => {
        const calTime = generateDateFormat(item.timestamp);
        return {
          ...item,
          calTime,
        }
      })
      this.setData({
        comment_list: [...this.data.comment_list, ...comments],
        page: pagenum,
        hasMore: Number(total) > Number(pagenum)
      })
    }
  },

  async getCityListAsync() {
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
    
  },

  handleCityChange(event: any) {
    const { selectedId, selectedName } = event.detail;
    this.setData({
      curCityId: selectedId,
      cityName: selectedName
    });
    // this.clearList();
    // this.getExhibitionList(selectedId);
  },

  handleClickReLoc() {
    // this.initPage();
  },

  handleCityPannelOpenStateChange(e: any) {
    const { is_open } = e.detail;
    this.setData({
      isShowMask: is_open,
    })
  },

  handlePlayDailyListen() {
    const player = this.selectComponent("#player");
    if (getApp().globalData.audio.bgAudio) {
      player.handleAudioPause();
    }
  },


  handleScrolltolower() {
    console.log('1', this.data.hasMore);
    if (this.data.hasMore) {
      this.getComments(this.data.page + 1);
    }
  },

  handleClickPlayerComp() {
    const targetPage = "pages/exhibitlist/index";
    backToTargetPage(targetPage);
  },

  initPage() {
    this.getComments(12);
    this.getCityListAsync();
  },


  onLoad(options) {
    console.log(options);
    this.initPage();
  },

  onShow() {
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0    // 根据tab的索引值设置
      })
    }
    this.setData({
      curExhibit: getApp().globalData.audio.curExhibit
    })
    console.log('getApp().globalData.audio.curExhibit', getApp().globalData.audio.curExhibit)
  },

  onUnload() {
  },

  onHide() {
  },


  onShareAppMessage() {
    const defaultUrl = 'https://gewugo.com/api/v1/storage/image/share-3639793484.jpg';
    const title = '让您的博物馆之旅不虚此行';
    var shareObj = {
      title,
      path: '/pages/index/index',
      imageUrl: defaultUrl,
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

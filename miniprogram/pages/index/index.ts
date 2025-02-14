// index.ts
// 获取应用实例
// const app = getApp<IAppOption>()
const pageInfo = {
  img: 'http://gewugo.com/api/v1/storage/image/shouye-bg-7062504217.jpg',
  cityname: '北京',
  cityid: 1,
  exhibitName: '玉出坤岗',
  exhibitDesc: '清代宫廷和田玉文化特展',
  museumname: '故宫博物院',
  museumList: [{
    museumid: 1,
    name: '故宫博物院',
    img: 'http://gewugo.com/api/v1/storage/image/shou1-3658272783.jpg',
    address: '北京市东城区景山前街4号',
    tel: '010-64037666',
    openTime: '08:30-17:00',
    exhibitionNum: 20,
  }, {
    museumid: 2,
    name: '奥运博物馆',
    img: 'http://gewugo.com/api/v1/storage/image/shou2-0552318603.jpg',
    address: '北京市东城区景山前街4号',
    tel: '010-64037666',
    openTime: '08:30-17:00',
    exhibitionNum: 10,
  }],
  citypinyin: 'beijing',
}
Component({
  data: {
    pageInfo: pageInfo,
    topBarHeight: 0,
    safeHeight: 0,
    windowHeight: 0,
    statusBarHeight:0,
    isRecoClicked: false,
  },
  methods: {
    goToMuseumList() {
      wx.navigateTo({
        url: '/pages/museumlist/index',
      })
    },
    goToCityList() {
      wx.navigateTo({
        url: '/pages/citylist/index',
      })
    },
    handleClickRecommend() {
      console.log('handleClickRecommend');
      this.setData({
        isRecoClicked: true,
      })
    },
    handleCloseDetail() {
      console.log('handleCloseDetail');
      this.setData({
        isRecoClicked: false,
      })
    }
  },
  pageLifetimes: {
    show() {
      console.log('show');
      const info = wx.getMenuButtonBoundingClientRect();
      const windowInfo = wx.getWindowInfo();
      if (info && info.bottom) {
        this.setData({
          topBarHeight: info.bottom,
          safeHeight: windowInfo.safeArea.height,
          windowHeight: windowInfo.screenHeight,
          statusBarHeight: windowInfo.statusBarHeight,
        })
      }

      console.log('info',info);
      console.log('windowInfo',windowInfo);
    }
  },
  lifetimes: {
    attached() {

    
    },
  },

})

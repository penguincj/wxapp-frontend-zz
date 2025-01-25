// index.ts
// 获取应用实例
// const app = getApp<IAppOption>()
const museumList = [{
  img: 'https://gewugo.com/storage/image/VC25139145565967.jpg',
  cityname: '北京',
  cityid: 1,
  museumname: '故宫博物院',
  museumList: [{
    name: '故宫博物院',
    img: 'https://gewugo.com/storage/image/VC25139145565967.jpg',
    address: '北京市东城区景山前街4号',
    tel: '010-64037666',
    openTime: '08:30-17:00',
  }],
  citypinyin: 'beijing',
}, {
  img: 'https://gewugo.com/storage/image/JC25139211818586.jpg',
  cityname: '浙江',
  cityid: 2,
  museumname: '浙江省博物院',
  museumList: [{
    name: '浙江省博物院',
    img: 'https://gewugo.com/storage/image/JC25139211818586.jpg',
    address: '北京市东城区景山前街4号',
    tel: '010-64037666',
    openTime: '08:30-17:00',
  }],
  citypinyin: 'zhejiang',
}, {
  img: 'https://gewugo.com/storage/image/TC25139182181174.jpg',
  cityname: '上海',
  cityid: 3,
  museumname: '上海博物院',
  museumList: [{
    name: '上海博物院',
    img: 'https://gewugo.com/storage/image/TC25139182181174.jpg',
    address: '北京市东城区景山前街4号',
    tel: '010-64037666',
    openTime: '08:30-17:00',
  }],
  citypinyin: 'shanghai',
}]
Component({
  data: { 
    museumList: museumList,
    topBarHeight: 0,
    safeHeight: 0,
    windowHeight: 0,
    statusBarHeight:0,
  },
  methods: {

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

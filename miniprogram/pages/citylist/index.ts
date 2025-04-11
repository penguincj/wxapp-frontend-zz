// index.ts
// 获取应用实例
// const app = getApp<IAppOption>()
const cityList1 = [{
  img: 'https://wx.ajioang.cn/storage/image/VC25139145565967.jpg',
  cityname: '北京',
  cityid: 1,
  museumname: '故宫博物院',
  museumList: [{
    name: '故宫博物院',
    img: 'https://wx.ajioang.cn/storage/image/VC25139145565967.jpg',
    address: '北京市东城区景山前街4号',
    tel: '010-64037666',
    openTime: '08:30-17:00',
  }],
  citypinyin: 'beijing',
}, {
  img: 'https://wx.ajioang.cn/storage/image/JC25139211818586.jpg',
  cityname: '浙江',
  cityid: 2,
  museumname: '浙江省博物院',
  museumList: [{
    name: '浙江省博物院',
    img: 'https://wx.ajioang.cn/storage/image/JC25139211818586.jpg',
    address: '北京市东城区景山前街4号',
    tel: '010-64037666',
    openTime: '08:30-17:00',
  }],
  citypinyin: 'zhejiang',
}, {
  img: 'https://wx.ajioang.cn/storage/image/TC25139182181174.jpg',
  cityname: '上海',
  cityid: 3,
  museumname: '上海博物院',
  museumList: [{
    name: '上海博物院',
    img: 'https://wx.ajioang.cn/storage/image/TC25139182181174.jpg',
    address: '北京市东城区景山前街4号',
    tel: '010-64037666',
    openTime: '08:30-17:00',
  }],
  citypinyin: 'shanghai',
}]
Component({
  data: {
    citylists: [] as any,
    loading: false
  },
  methods: {

  },
  pageLifetimes: {
    show() {
     this.setData({
      citylists: cityList1,
     })
    }
  },
  lifetimes: {
    attached() {
      setTimeout(() => {
        this.setData({
          loading: false,
        })
      }, 1000)
    },
  },

});

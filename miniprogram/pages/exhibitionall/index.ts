// index.ts
// 获取应用实例
// const app = getApp<IAppOption>()
const exhibitions = [
  {
    id: 0,
    name: '玉出昆冈',
    img: '/static/images/swiper1.jpg',
    desc: '清代宫廷和田玉文化特展',
    link: 'pages/index/index',
    opendate: '2024.01.20-2024.03.31',
    type: '常设展'
  },
  {
    id: 1,
    name: '玉出昆冈2',
    img: '/static/images/swiper2.jpg',
    desc: '清代宫廷和田玉文化特展2',
    link: 'pages/index/index',
    opendate: '2024.01.21-2024.03.31',
    type: '临时展'
  },
]
Component({
  data: {
    exhibitions: [] as any,
    loading: false
  },
  methods: {

  },
  pageLifetimes: {
    show() {
     this.setData({
      exhibitions: exhibitions,
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

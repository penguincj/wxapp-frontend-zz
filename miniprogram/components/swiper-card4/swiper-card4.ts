const cardConfig4 = [
  {
    id: 0,
    name: '玉出昆冈',
    img: 'http://gewugo.com/api/v1/storage/image/swiper1-1489240990.jpg',
    desc: '清代宫廷和田玉文化特展',
    link: 'pages/index/index',
    opendate: '2024.01.20-2024.03.31',
    type: '常设展'
  },
  {
    id: 1,
    name: '玉出昆冈2',
    img: 'http://gewugo.com/api/v1/storage/image/swiper2-4593118634.jpg',
    desc: '清代宫廷和田玉文化特展2',
    link: 'pages/index/index',
    opendate: '2024.01.21-2024.03.31',
    type: '临时展'
  },
  {
    id: 2,
    name: '玉出昆冈',
    img: 'http://gewugo.com/api/v1/storage/image/swiper1-1489240990.jpg',
    desc: '清代宫廷和田玉文化特展',
    link: 'pages/index/index',
    opendate: '2024.01.20-2024.03.31',
    type: '常设展'
  },
]
Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的属性列表
   */
  properties: {
    
  },
  /**
   * 组件的初始数据
   */
  data: {
    cardConfig: cardConfig4,
    background: ['demo-text-1', 'demo-text-2', 'demo-text-3'],
    indicatorDots: false,
    vertical: false,
    autoplay: false,
    interval: 2000,
    duration: 500
  },
  lifetimes: {
    attached() {
      
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    changeIndicatorDots() {
      this.setData({
        indicatorDots: !this.data.indicatorDots
      })
    },
  
    changeAutoplay() {
      this.setData({
        autoplay: !this.data.autoplay
      })
    },
  
    intervalChange(e: any) {
      this.setData({
        interval: e.detail.value
      })
    },
  
    durationChange(e: any) {
      this.setData({
        duration: e.detail.value
      })
    }
  },
})

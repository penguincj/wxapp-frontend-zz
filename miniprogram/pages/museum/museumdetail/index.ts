// index.ts
// 获取应用实例
// const app = getApp<IAppOption>()

// 展览状态
// status 1 未开始 2 进行中 3 已结束
const museumInfo = {
  img: 'https://gewugo.com/storage/image/JC25139211818586.jpg',
  name: '故宫博物院',
  address: '北京市东城区景山前街4号',
  phone: '010-65253885',
  open_time: '09:00-17:00',
  price: '16元',
  intro: '故宫博物院是中国最大的古代文化艺术博物馆，收藏了大量的珍贵文物，包括书画、陶瓷、玉器、铜器、金银器、漆器、珐琅器、钟表、家具、织绣、珠宝等。故宫博物院以其丰富的文物收藏、独特的建筑风格和深厚的历史文化底蕴，成为了中国文化遗产的重要代表。',
  zhanlan_list: [
    {
      id: 1,
      title: '儒家文化展',
      img: 'https://www.baidu.com/img/PCtm_d9c8750bed0b3c7d089fa7d55720d6cf.png',
      status: 2,
      start_time: '2024-01-01',
      end_time: '2024-01-01',
      open_time: '09:00-17:00',
      ticket_price: '100元',
      ticket_url: 'https://www.baidu.com',
      price_desc: '成人票：100元/人，儿童票：50元/人',
      jiangjie_price: '20',
      jiangjie_discount: 0.8,
      final_price: '16',
      intro: '儒家文化展是中国最大的古代文化艺术博物馆，收藏了大量的珍贵文物，包括书画、陶瓷、玉器、铜器、金银器、漆器、珐琅器、钟表、家具、织绣、珠宝等。故宫博物院以其丰富的文物收藏、独特的建筑风格和深厚的历史文化底蕴，成为了中国文化遗产的重要代表。',
    },  {
      id: 2,
      title: '儒家文化展2',
      img: 'https://www.baidu.com/img/PCtm_d9c8750bed0b3c7d089fa7d55720d6cf.png',
      status: 2,
      start_time: '2024-01-01',
      end_time: '2024-01-01',
      open_time: '09:00-17:00',
      ticket_price: '100元',
      ticket_url: 'https://www.baidu.com',
      price_desc: '成人票：100元/人，儿童票：50元/人',
      jiangjie_price: '20',
      jiangjie_discount: 0.8,
      final_price: '16',
      intro: '儒家文化展是中国最大的古代文化艺术博物馆，收藏了大量的珍贵文物，包括书画、陶瓷、玉器、铜器、金银器、漆器、珐琅器、钟表、家具、织绣、珠宝等。故宫博物院以其丰富的文物收藏、独特的建筑风格和深厚的历史文化底蕴，成为了中国文化遗产的重要代表。',
    },{
      id: 3,
      title: '儒家文化展3',
      img: 'https://www.baidu.com/img/PCtm_d9c8750bed0b3c7d089fa7d55720d6cf.png',
      status: 3,
      start_time: '2024-01-01',
      end_time: '2024-01-01',
      open_time: '09:00-17:00',
      ticket_price: '100元',
      ticket_url: 'https://www.baidu.com',
      price_desc: '成人票：100元/人，儿童票：50元/人',
      jiangjie_price: '20',
      jiangjie_discount: 0.8,
      final_price: '16',
      intro: '儒家文化展是中国最大的古代文化艺术博物馆，收藏了大量的珍贵文物，包括书画、陶瓷、玉器、铜器、金银器、漆器、珐琅器、钟表、家具、织绣、珠宝等。故宫博物院以其丰富的文物收藏、独特的建筑风格和深厚的历史文化底蕴，成为了中国文化遗产的重要代表。',
    },{
      id: 4,
      title: '儒家文化展4',
      img: 'https://www.baidu.com/img/PCtm_d9c8750bed0b3c7d089fa7d55720d6cf.png',
      status: 3,
      start_time: '2024-01-01',
      end_time: '2024-01-01',
      open_time: '09:00-17:00',
      ticket_price: '100元',
      ticket_url: 'https://www.baidu.com',
      price_desc: '成人票：100元/人，儿童票：50元/人',
      jiangjie_price: '20',
      jiangjie_discount: 0.8,
      final_price: '16',
      intro: '儒家文化展是中国最大的古代文化艺术博物馆，收藏了大量的珍贵文物，包括书画、陶瓷、玉器、铜器、金银器、漆器、珐琅器、钟表、家具、织绣、珠宝等。故宫博物院以其丰富的文物收藏、独特的建筑风格和深厚的历史文化底蕴，成为了中国文化遗产的重要代表。',
    }
  ]
}
const zhanlan1 = [
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
]
Component({
  data: {
    museumInfo: museumInfo,
    topBarHeight: 0,
    safeHeight: 0,
    windowHeight: 0,
    statusBarHeight:0,
    recommendList: zhanlan1,
    normalList: zhanlan1,
    outofdateList: zhanlan1,
  },
  methods: {
    handleClickItem(event: any) {
      const { id } = event.detail;
      wx.navigateTo({
        url: '/pages/exhibitiondetail/index?exhibition_id=' + id,
      })
    },
  },
  pageLifetimes: {
    show() {
      this.setData({
        loading: true,
      })
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
      setTimeout(() => {
        this.setData({
          loading: false,
        })
      }, 1000)
    },
  },

})

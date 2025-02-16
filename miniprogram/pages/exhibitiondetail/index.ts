const exhibitionInfo = {
  img: 'https://gewugo.com/storage/image/JC25139211818586.jpg',
  name: '玉出昆冈',
  address: '北京市东城区景山前街4号',
  phone: '010-65253885',
  open_time: '09:00-17:00',
  price: '16元',
  intro: '故宫博物院是中国最大的古代文化艺术博物馆，收藏了大量的珍贵文物，包括书画、陶瓷、玉器、铜器、金银器、漆器、珐琅器、钟表、家具、织绣、珠宝等。故宫博物院以其丰富的文物收藏、独特的建筑风格和深厚的历史文化底蕴，成为了中国文化遗产的重要代表。',
  jiangjie_list: [
    {
      id: 1,
      name: '张讲解员',
      avatar: '/static/images/ava1.png',
      title: '国家一级讲解员',
      price: 60,
      dur: 100,
      type: '儿童导览',
    },
    {
      id: 2,
      name: '张讲解员',
      avatar: '/static/images/ava1.png',
      title: '国家一级讲解员',
      price: 60,
      dur: 100,
      type: '儿童导览',
    },
    {
      id: 3,
      name: '张讲解员',
      avatar: '/static/images/ava1.png',
      title: '国家一级讲解员',
      price: 60,
      dur: 100,
      type: '儿童导览',
    },
  ],
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
Page({
  data: {
    exhibitionInfo: exhibitionInfo,
    topBarHeight: 0,
    safeHeight: 0,
    windowHeight: 0,
    statusBarHeight:0,
    
    curExhibitionId: -1,
  },
  handleClickJiangjie(event: any) {
    console.log('handleClickJiangjie', event.currentTarget.dataset);
    
    const { idx } = event.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/exhibitlist/index?type=${idx}&exhibition_id=${this.data.curExhibitionId}`,
    })
  },
  handleClickPlayIcon() {

  },
  onShow() {
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

    console.log('windowInfo',windowInfo);
  },
  onLoad(options) {
    console.log('onLoad', options);
    this.setData({
      curExhibitionId: Number(options.exhibition_id),
    })
  },

})

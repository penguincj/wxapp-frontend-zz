import { getMuseumById, getShortExhibitionList, getLongExhibitionList, getPastExhibitionList } from "../../../api/api";
import { generateNewUrlParams } from "../../../utils/util";

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
Page({
  data: {
    museumInfo: [],
    topBarHeight: 0,
    safeHeight: 0,
    windowHeight: 0,
    statusBarHeight:0,
    recommendList: zhanlan1,
    normalList: zhanlan1,
    outofdateList: zhanlan1,
    curMuseumId: -1,
    loading: false,
  },
  async initPage(_museumid: any) {
    this.setData({
      loading: true
    })
    try {
      const museumInfo: any = await getMuseumById(_museumid);
      const normalList_res: any = await getLongExhibitionList(_museumid, 999);
      const recommendList_res: any = await getShortExhibitionList(_museumid, 999);
      const pastList_res: any = await getPastExhibitionList(_museumid, 999);
      this.setData({
        museumInfo: museumInfo.museum,
        normalList: normalList_res.exhibitions,
        recommendList: recommendList_res.exhibitions,
        outofdateList: pastList_res.exhibitions,
        loading: false,
      })

    } catch (error) {
      this.setData({
        loading: false
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
  handleClickItem(event: any) {
    const { id } = event.detail;
    const url_params = generateNewUrlParams({exhibition_id: id})
    wx.navigateTo({
      url: '/pages/exhibitiondetail/index' + url_params,
    })
  },
  onLoad(options) {
    console.log('museum detail onLoad', options);
    this.setData({
      curMuseumId: Number(options.museum_id),
    });
    this.initPage(options.museum_id);
  },

})

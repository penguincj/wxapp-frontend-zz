// index.ts
// 获取应用实例
// const app = getApp<IAppOption>()
import { getCityList, getMuseumList } from "../../../api/api";
import { getCurrentCity } from "../../../utils/util";

const museumList = [{
  img: 'https://gewugo.com/storage/image/VC25139145565967.jpg',
  cityname: '北京',
  cityid: 1,
  museumname: '故宫博物院',
  desc: '北京故宫博物院，是在明清皇宫及其收藏北京故宫博物院，是在明清皇宫及其收藏',
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
  desc: '北京故宫博物院，是在明清皇宫及其收藏北京故宫博物院，是在明清皇宫及其收藏',
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
  desc: '北京故宫博物院，是在明清皇宫及其收藏北京故宫博物院，是在明清皇宫及其收藏',
  museumList: [{
    name: '上海博物院',
    img: 'https://gewugo.com/storage/image/TC25139182181174.jpg',
    address: '北京市东城区景山前街4号',
    tel: '010-64037666',
    openTime: '08:30-17:00',
  }],
  citypinyin: 'shanghai',
}]
Page({
  data: { 
    museumList: museumList,
    curCityId: -1,
    showLoading: false,
    cityList: [],
    selectCityList: [] as any,
  },
  generateSelectCityList(_cityitem: any, _citylist: any) {
    const citylistCopy = [..._citylist];
    citylistCopy.splice(0, 0, _cityitem);

    const selectCityList = Array.from(new Set(citylistCopy));
    this.setData({
      selectCityList: selectCityList,
    })
  },
  async getMuseumList (_cityid: any) {
    this.setData({
      showLoading: true,
    })
    try {
      const museum_res: any = await getMuseumList(_cityid);

      if (museum_res && museum_res.museums) {
        this.setData({
          museumList: museum_res.museums,
        })
      }
      this.setData({
        showLoading: false,
      })
    } catch (error) {
      this.setData({
        showLoading: false,
      })
    }
    const museum_res: any = await getMuseumList(_cityid);
      if (museum_res && museum_res.museums) {
        this.setData({
          museumList: museum_res.museums,
        })
      }
  },
  async initPage() {
    try {
      const city = await getCurrentCity();
      const citylist:any = await getCityList();
      const city_item = ((citylist || {}).cities || []).find((i: any) => i.name === city);
      const city_id = city_item.id;
      this.setData({
        cityList: citylist.cities 
      })
      if(city_item && city_item.name) {
        this.generateSelectCityList(city_item, citylist.cities);
        this.setData({
          curCityId: city_id,
        })
      }
      const museum_res: any = await getMuseumList(city_id);
      if (museum_res && museum_res.museums) {
        console.log('museumlist onLoad', museum_res);
        this.setData({
          museumList: museum_res.museums,
        })
      }
      this.setData({
        showLoading: false,
      })
    } catch (error) {
      console.log(error);
      
      this.setData({
        showLoading: false,
      })
    }
  },
  handleClickCityPanel(event: any) {
    const { cityid } = event.detail;
    const city_item = (this.data.cityList || []).find((i: any) => i.id === cityid);
    this.generateSelectCityList(city_item, this.data.cityList);
    this.setData({
      curCityId: cityid,
    })
    this.getMuseumList(cityid);
  },

  onLoad(options) {
    console.log('museumlist onLoad', options);
    if (options && options.cityid) {
      this.setData({
        curCityId: Number(options.city_id),
      })
    }
    this.setData({
      showLoading: true,
    })

    this.initPage();
    
  },

})

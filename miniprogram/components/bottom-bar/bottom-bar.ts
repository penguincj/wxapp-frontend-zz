import { getCurrentPageUrl, getCurrentPageParam } from "../../utils/util";
const itemConfig = [
  {
    id: 0,
    name: '首页',
    icon: '/static/images/ishouye.png',
    iconClicked: '/static/images/ishouye-c.png',
    link: '/pages/index/index',
  },
  // {
  //   id: 1,
  //   name: '场馆',
  //   icon: '/static/images/ichangguan.png',
  //   iconClicked: '/static/images/ichangguan-c.png',
  //   link: 'pages/index/index',
  // },
  {
    id: 1,
    name: '展览',
    icon: '/static/images/izhanlan.png',
    iconClicked: '/static/images/izhanlan-c.png',
    link: '/pages/exhibitionlist/index',
  },
  {
    id: 2,
    name: '我的',
    icon: '/static/images/iwode.png',
    iconClicked: '/static/images/iwode-c.png',
    link: '/pages/profile/index',
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
    currentkey: {
      type: Number,
      value: 0,
    },
  },
  /**
   * 组件的初始数据
   */
  data: {
    icons: itemConfig,
    selectid: 0,
    urlParams: {},
  },
  /**
   * 组件的方法列表
   */
  methods: {
    handleClickBottomBar(e: any) {
      const {idx} =e.currentTarget.dataset;
      
      const item = itemConfig.find(i => i.id === idx);
      // this.setData({
      //   selectid: idx,
      // });
      console.log('current idx', idx, item);

      if (item && item.link) {
        wx.redirectTo({
          url: item.link,
          fail(error) {
            console.log(error)
          }
        })
      }
    },

  },
 

  lifetimes: {
    attached() {
      setTimeout(() => {
        const url = getCurrentPageUrl();
        const param = getCurrentPageParam();
        console.log('current url', url, param);
      })
    },
  },
  
})

import { getCurrentPageUrl, getCurrentPageParam, getCurrentPageParamStr } from "../utils/util";
let specialMessageShown = false;
const getEnablePhotoRecognition = () => {
  const app = getApp<IAppOption>();
  // 默认不展示，待首页接口决定
  return app?.globalData?.enablePhotoRecognition === true;
};
const buildIcons = (enablePhotoRecognition: boolean) => {
  if (enablePhotoRecognition) {
    return itemConfig;
  }
  return itemConfig.filter(i => i.id !== 2);
};
const itemConfig = [
  {
    id: 0,
    name: '首页',
    icon: '/static/images/ishouye.png',
    iconClicked: '/static/images/ishouye-c.png',
    link: '/pages/index/index',
  },
  {
    id: 1,
    name: '博物馆',
    icon: '/static/images/ichangguan.png',
    iconClicked: '/static/images/ichangguan-c.png',
    link: '/pages/museumlist/index',
  },
  {
    id: 2,
    name: '拍照识文物',
    icon: '/static/images/ijiangjie.png',
    iconClicked: '/static/images/ijiangjie-c.png',
    link: '/pages/ai-camera/index',
  },
  {
    id: 3,
    name: '展览',
    icon: '/static/images/izhanlan.png',
    iconClicked: '/static/images/izhanlan-c.png',
    link: '/pages/gridview/index',
  },
  {
    id: 4,
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
    // currentkey: {
    //   type: Number,
    //   value: 0,
    // },
  },
  /**
   * 组件的初始数据
   */
  data: {
    icons: buildIcons(getEnablePhotoRecognition()),
    selected: 0,
    urlParams: {},
    urlParamsStr: '',
    showSpecialMessage: false,
  },
  /**
   * 组件的方法列表
   */
  methods: {
    startSpecialMessage() {
      if (specialMessageShown) return;
      specialMessageShown = true;
      this.setData({
        showSpecialMessage: true,
      });
      const comp = this as any;
      const timer = setTimeout(() => {
        this.setData({
          showSpecialMessage: false,
        });
        comp.specialMessageTimer = null;
      }, 8000);
      comp.specialMessageTimer = timer;
    },
    updateIconList(enablePhotoRecognition: boolean) {
      const icons = buildIcons(enablePhotoRecognition);
      if (enablePhotoRecognition) {
        this.startSpecialMessage();
      }
      this.setData({
        icons,
        enablePhotoRecognition,
        showSpecialMessage: enablePhotoRecognition ? this.data.showSpecialMessage : false,
      });
    },
    switchTab(e: any) {
      const {idx, name} =e.currentTarget.dataset;
      
      const item = itemConfig.find(i => i.id === idx);
      if (!item) return;
      // this.setData({
      //   selectid: idx,
      // });
      if (item && item.link) {
        if (item.id === 2) {
          wx.navigateTo({
            url: item.link + this.data.urlParamsStr,
            success(res) {
              // @ts-ignore
              // this.tracker.report('custom_bar_switch_e6', {id: idx, name,})
            },
            fail(error) {
              console.log(error)
            }
          })
        }
        wx.switchTab({
          url: item.link + this.data.urlParamsStr,
          success(res) {
            // @ts-ignore
            // this.tracker.report('custom_bar_switch_e6', {id: idx, name,})
          },
          fail(error) {
            console.log(error)
          }
        })
      }
    },

  },
 

  lifetimes: {
    attached() {
      const enablePhotoRecognition = getEnablePhotoRecognition();
      this.updateIconList(enablePhotoRecognition);
    },
    detached() {
      const comp = this as any;
      if (comp.specialMessageTimer) {
        clearTimeout(comp.specialMessageTimer);
        comp.specialMessageTimer = null;
      }
    },
  },
  pageLifetimes: {
    show() {
        const url = getCurrentPageUrl();
        const param = getCurrentPageParam();
        const param_str = getCurrentPageParamStr();
        this.setData({
          urlParamsStr: param_str,
        })
        this.updateIconList(getEnablePhotoRecognition());
        // console.log('current url', url, param, param_str);
    }
  }
  
})

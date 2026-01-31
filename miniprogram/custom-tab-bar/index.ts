import { getCurrentPageUrl, getCurrentPageParam, getCurrentPageParamStr } from "../utils/util";

const itemConfig = [
  {
    id: 0,
    name: '首页',
    icon: '/static/images/index-b-shouye.png',
    iconClicked: '/static/images/index-b-shouye-c.png',
    link: '/pages/index/index',
    isTab: true,
  },
  {
    id: 1,
    name: 'AI识图',
    icon: '/static/images/index-b-camera.png',
    iconClicked: '/static/images/index-b-camera-c.png',
    link: '/pages/ai-camera/index',
    isTab: false, // 不是 tab 页，用 navigateTo
  },
  {
    id: 2,
    name: '我的',
    icon: '/static/images/index-b-wode.png',
    iconClicked: '/static/images/index-b-wode-c.png',
    link: '/pages/profile/index',
    isTab: true,
  },
];

Component({
  options: {
    multipleSlots: true
  },
  properties: {},
  data: {
    icons: itemConfig,
    selected: 0,
    urlParams: {},
    urlParamsStr: '',
  },
  methods: {
    switchTab(e: any) {
      const { idx } = e.currentTarget.dataset;
      const item = itemConfig.find(i => i.id === idx);
      if (!item) return;

      if (item.isTab) {
        wx.switchTab({
          url: item.link,
          fail(error) {
            console.log(error);
          }
        });
      } else {
        // AI识图不是tab页，用 navigateTo
        wx.navigateTo({
          url: item.link + this.data.urlParamsStr,
          fail(error) {
            console.log(error);
          }
        });
      }
    },
  },

  lifetimes: {
    attached() {
      this.setData({ icons: itemConfig });
    },
  },

  pageLifetimes: {
    show() {
      const param_str = getCurrentPageParamStr();
      this.setData({
        urlParamsStr: param_str,
      });
    }
  }
});

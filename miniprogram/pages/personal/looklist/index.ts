import { viewHistoryList } from '../../../api/api';
import { backToTargetPage } from '../../../utils/util';

Page({
  data: {
    viewHistoryList: [],
    loading: false,
    error: false,
    styleHeight: '',
  },
  async initPage() {
    const { userid } = await wx.getStorageSync('userinfo');
    try {
      const res: any = await viewHistoryList(userid)
      console.log(res);
      if (res && res.code === 200) {
        const list = res.exhibitions.map((i: any) => {
          return {
            ...i,
            xmove: 0,
          }
        })
        this.setData({
          viewHistoryList: list
        })
      } else {
        this.setData({
          error: true
        })
      }

    } catch (error) {
      console.log(error);

      this.setData({
        error: true
      })
    }
  },
  handleClickInit() {
    this.initPage();
  },

  handleClickPlayerComp() {
    const targetPage = "pages/exhibitlist/index";
    backToTargetPage(targetPage);
  },


  async onShow() {
    this.initPage();
    const { statusBarHeight } = getApp().globalData.system;
    const hei = `height: calc(100vh - ${statusBarHeight}px - 44px)`;
    this.setData({
      styleHeight: hei,
    })
  },

});

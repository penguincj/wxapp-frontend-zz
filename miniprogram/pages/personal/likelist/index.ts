import { likeList, likeExhibit } from '../../../api/api';
import { backToTargetPage } from '../../../utils/util';
Page({
  data: {
    likeList: [],
    loading: false,
    error: false,
    styleHeight: '',

  },
  async initPage() {
    const { userid } = await wx.getStorageSync('userinfo');
    try {
      const res: any = await likeList(userid)
      console.log(res);
      if (res && res.code === 200) {
        const list = res.exhibits.map((i: any) => {
          return {
            ...i,
            xmove: 0,
          }
        })
        this.setData({
          likeList: list
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
  handleClickPlayerComp() {
    const targetPage = "pages/exhibitlist/index";
    backToTargetPage(targetPage);
  },

  async handleDeleteItem(event: any) {
    const { id } = event.detail;
    const { userid } = await wx.getStorageSync('userinfo');
    try {
      const res: any = await likeExhibit(userid, id, { method: 'DELETE' });
      if (res && res.code === 200) {
        this.initPage()
      }
    } catch (error) {

    }
  },
  handleClickInit() {
    this.initPage();
  },
  async onShow() {
    this.initPage();
    const { statusBarHeight } = getApp().globalData.system;
    const hei = `height: calc(100vh - ${statusBarHeight}px - 44px)`;
    this.setData({
      styleHeight: hei,
    })
  },
  onLoad(options) {

  },

});

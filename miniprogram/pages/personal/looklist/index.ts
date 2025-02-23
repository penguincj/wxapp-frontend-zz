import { viewHistoryList } from '../../../api/api';

Page({
  data: {
    viewHistoryList: [],
    loading: false,
    error: false,
  },
  async initPage() {
    const { userid } = await wx.getStorageSync('userinfo');
    try {
      const res: any = await viewHistoryList(userid)
      console.log(res);
      if (res && res.code === 200) {
        this.setData({
          viewHistoryList: res.exhibitions
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
  
  async onShow() {
    this.initPage()
  },

});

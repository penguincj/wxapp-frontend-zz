import { collectionList, collectExhibit } from '../../../api/api';

Page({
  data: {
    collectionList: [],
    loading: false,
    error: false,
  },
  async initPage() {
    const {userid} = await wx.getStorageSync('userinfo');
    try {
      const res: any = await collectionList(userid)
      console.log(res);
      if (res && res.code === 200) {
        this.setData({
          collectionList: res.exhibits
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
  async handleDeleteItem(event: any) {
    const { id } = event.detail;
    const {userid} = await wx.getStorageSync('userinfo');
    try {
      const res: any = await collectExhibit(userid, id, { method: 'DELETE'});
      if ( res && res.code === 200) {
        this.initPage()
      }
    } catch (error) {
      
    }
  },
  async onShow() {
    this.initPage()
  },
  onLoad(options) {
    
  },

});

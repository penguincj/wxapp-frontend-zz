import { getUserLastNarration } from "../../api/api";
import { calTimeTxt, getLoginStatus, transferObjToUrlParams } from "../../utils/util";

Page({
  data: {
    loading: true,
    narrationList: [] as any,
    exhibition_id: 0,
  },

  onLoad(options) {
    console.log('定制讲解页面加载', options);
    if(options.exhibition_id) {
      this.setData({
        exhibition_id: Number(options.exhibition_id),
      })
      // this.getUserLastNarration();
    }
  },

  onShow() {
    // 页面显示时的逻辑
    this.getUserLastNarration();
  },

  onHide() {
    // 页面隐藏时的逻辑
  },

  onUnload() {
    // 页面卸载时的逻辑
  },

  handleSelectAgain() {
    wx.navigateTo({
      url: '/pages/narrationlist/index?exhibition_id=' + this.data.exhibition_id,
    })
  },

  handleListen() {
    const narrationid = this.data.narrationList[0].id;
    const url_params = transferObjToUrlParams({
      exhibition_id: this.data.exhibition_id,
      narration_id: narrationid,
    })
    getApp().globalData.audio.curNarration = narrationid
    wx.navigateTo({
      url: '/pages/exhibitlist/index' + url_params,
    })
  },

  async getUserLastNarration() {
    try {
      let userinfo = wx.getStorageSync('userinfo');
      console.log('原始userinfo:', userinfo);
      console.log('userinfo类型:', typeof userinfo);
      
      // 如果userinfo为空或者userid不存在，尝试重新获取登录状态
      if (!userinfo || !userinfo.userid) {
        console.log('userinfo为空或userid不存在，尝试重新获取登录状态');
        const loginResult = await getLoginStatus();
        userinfo = loginResult.userinfo;
        console.log('重新获取的userinfo:', userinfo);
      }
      
      const userid = userinfo?.userid;
      console.log('最终userid:', userid);
      
      if (!userid) {
        console.log('userid仍然为空，无法继续');
        return;
      }
      const res: any = await getUserLastNarration(userid, this.data.exhibition_id);
      if(res && res.code === 0 && res.data.narration) {
        const narration = res.data.narration;
        const duration_fmt = calTimeTxt(narration.duration);;
        const new_narration = {
          id: narration.id,
          count: 999, //todo
          name: narration.name,
          duration_fmt,
          image_url: narration.url,
        }
        this.setData({
          narrationList: [new_narration],
        })
      }
    } catch (err) {
      console.log('获取用户最近讲解失败', err);
    }
  },

});

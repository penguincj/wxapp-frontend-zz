import { base_api, appendExhibitImage } from '../../api/api';
import { base_url, getLoginStatus, getLocation, calTimeDurationTxt } from '../../utils/util';


Page({
  data: {
    
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2,
      });
      // this.handleTakePhoto();

    }
  },

  handleClickTakePhoto() {
    wx.navigateTo({
      url: '/pages/ai-camera/index'
    })
  },


  handleShareAppMessage() {
    return {
      title: 'AI拍摄文物，一拍即识',
      path: '/pages/take-photo/index',
    };
  },
});

import { base_api, appendExhibitImage } from '../../api/api';
import { base_url, getLoginStatus, getLocation, calTimeDurationTxt } from '../../utils/util';


Page({
  data: {
    scanPercent: 1,
  },

  scanTimer: null as ReturnType<typeof setInterval> | null,

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2,
      });
      // this.handleTakePhoto();

    }
    this.startScanProgress();
  },

  onHide() {
    this.stopScanProgress();
  },

  onUnload() {
    this.stopScanProgress();
  },

  handleClickTakePhoto() {
    this.stopScanProgress();
    wx.navigateTo({
      url: '/pages/ai-camera/index'
    })
  },

  startScanProgress() {
    this.stopScanProgress();
    let percent = 1;
    this.setData({
      scanPercent: percent,
    });
    this.scanTimer = setInterval(() => {
      percent = percent >= 100 ? 1 : percent + 1;
      this.setData({
        scanPercent: percent,
      });
    }, 40);
  },

  stopScanProgress() {
    if (this.scanTimer) {
      clearInterval(this.scanTimer);
      this.scanTimer = null;
    }
  },


  handleShareAppMessage() {
    return {
      title: 'AI拍摄文物，一拍即识',
      path: '/pages/take-photo/index',
    };
  },
});

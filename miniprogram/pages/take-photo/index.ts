import { debugPrint } from 'XrFrame/kanata/lib/frontend';
import { base_api, appendExhibitImage } from '../../api/api';
import { base_url, getLoginStatus, getLocation, calTimeDurationTxt } from '../../utils/util';


Page({
  data: {
    scanPercent: 1,
    scanFrameImage: '/static/images/daoyujiangjie.png',
  },

  scanTimer: null as ReturnType<typeof setInterval> | null,

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2,
      });
      debugger
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
      url: '/pages/ai-camera/index?opeation=camera'
    })
      // wx.chooseMedia({
      //   count: 1,
      //   mediaType: ['image'],
      //   sourceType: ['camera'],
      //   camera: 'back',
      //   success: async (res) => {
      //     const file = res.tempFiles?.[0];
      //     if (!file) {
      //       return;
      //     }
      //     if (file.fileType && file.fileType !== 'image') {
      //       wx.showToast({
      //         title: '请选取图片',
      //         icon: 'none',
      //       });
      //       return;
      //     }
      //     const filePath = file.tempFilePath;
         
      //   },
      //   fail: (error) => {
      //     if (error.errMsg.includes('auth deny')) {
      //       // 用户拒绝了相机权限
      //       wx.showToast({
      //         title: '需要相机权限',
      //         icon: 'none'
      //       })
      //     }
         
      //     console.error('chooseMedia error', error);
      //     wx.showToast({
      //       title: '无法打开相机/相册',
      //       icon: 'none',
      //     });
      //   },
      // });
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

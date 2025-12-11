const BETA_MODE_STORAGE_KEY = 'BetaModeEnabled';

Page({
  data: {
    betaModeEnabled: false,
  },

  onLoad() {
    const storedValue = wx.getStorageSync(BETA_MODE_STORAGE_KEY);
    const enabled = typeof storedValue === 'boolean' ? storedValue : false;
    this.setData({
      betaModeEnabled: enabled,
    });
    this.syncPhotoRecognition(enabled);
  },

  handleBetaSwitchChange(event: any) {
    const isEnabled = event.detail.value;
    this.setData({
      betaModeEnabled: isEnabled,
    });
    wx.setStorage({
      key: BETA_MODE_STORAGE_KEY,
      data: isEnabled,
    });
    this.syncPhotoRecognition(isEnabled);
  },

  handleClearStorage() {
    wx.clearStorage({
      success: () => {
        wx.showToast({
          title: '已清空',
          icon: 'success',
          duration: 1200,
        });
      },
      fail: () => {
        wx.showToast({
          title: '清空失败',
          icon: 'none',
        });
      }
    })
  },

  syncPhotoRecognition(enable: boolean) {
    const app = getApp<IAppOption>();
    if (!app.globalData.debug) {
      app.globalData.debug = { enablePhotoRecognition: false };
    }
    app.globalData.debug.enablePhotoRecognition = enable;
    const serverIndex = !!app.globalData.enablePhotoRecognitionFromServer;
    const finalEnable = enable || serverIndex;
    app.globalData.enablePhotoRecognition = finalEnable;
    if (typeof this.getTabBar === 'function') {
      const tabBar = this.getTabBar();
      tabBar?.updateIconList?.(finalEnable);
    }
  },
});

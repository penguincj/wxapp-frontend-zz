const BETA_MODE_STORAGE_KEY = 'BetaModeEnabled';

Page({
  data: {
    betaModeEnabled: false,
  },

  onLoad() {
    const storedValue = wx.getStorageSync(BETA_MODE_STORAGE_KEY);
    this.setData({
      betaModeEnabled: typeof storedValue === 'boolean' ? storedValue : false,
    });
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
});

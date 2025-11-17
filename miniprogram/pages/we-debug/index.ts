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
});

// app.ts
App<IAppOption>({
  globalData: {
    audio: {
      bgAudio: null as any,
      audioList: [],
      playingIndex: 0,
      stored_audio: [] as string[],
      curExhibit: null as any,
      isPlay: false,
      lastPlayIndex: 0,
      duration: 0,
      totalTimeText: '00:00',
      
    }
  },
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        console.log(res.code)
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      },
    })
  },
})
// app.ts
import { clearAndFreshLoginStatus, getCurrentCity } from "./utils/util"

var log = require('./utils/log');
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
      exhibitlistParams: '',
      curUnitId: 0,
      curExhibition: -1,
    },
    system: {
      statusBarHeight: 0,
      bottomSafeHeight: 0, // 底部安全区域高度
    },
    userinfo: {
      nickname: '',
      avatar: '',
      userid: -1,
    },
    token: '',
  },
  async onLaunch() {
    // 展示本地存储能力
    try {
      // wx.clearStorage();
      // const logs = wx.getStorageSync('logs') || []
      // logs.unshift(Date.now())
      // wx.setStorageSync('logs', logs)
      let sysInfo = wx.getWindowInfo();
      log.info('system',sysInfo);
      this.globalData.system.statusBarHeight = sysInfo.statusBarHeight;
      this.globalData.system.bottomSafeHeight = sysInfo.safeArea.height;
      clearAndFreshLoginStatus();


      const city = await getCurrentCity();
      log.info('cityname', city);
    } catch (error) {
      console.log(error)
      log.error(error) 
    }
    const onErrorCallback = function(msg: any) {
      console.error('wx:onError:', msg)
      try {
        if (['APP-SERVICE-SDK', 'webviewSDKScriptError', 'webviewScriptError'].some(key => msg.indexOf(key) > -1)) {
          // 基础库报错
          // 上报
          log.error('baseError', msg)
        } else {
          // 上报
          log.error('jsError', msg)
        }
      } catch (e) {
        console.error(e)
      }
    };
    const onUnhandledRejectionCallback = function(event: any = {}) {
      console.error('wx:onUnhandledRejection:', event)
      const { reason } = event
      // 上报
      log.error('unhandledRejection', reason)
    }
    wx.onError && wx.onError(onErrorCallback)
    
   wx.onUnhandledRejection(onUnhandledRejectionCallback)
    
  },

})
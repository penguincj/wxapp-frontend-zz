// app.ts
import { Image } from "XrFrame/kanata/lib/frontend"
import { getLoginStatus, clearAndFreshLoginStatus } from "./utils/util"
import { getCityList } from "./api/api"

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
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    // wx.getLocation({
    //   type: 'wsg84',
    //   success(res) {
    //     const latitude = res.latitude;
    //     const longitude = res.longitude;
    //     console.log(latitude, longitude);
    //     wx.setStorageSync('latitude', res.latitude);
    //     wx.setStorageSync('longitude', res.longitude);
    //   },
    //   fail(res) {
    //     console.log('location error', res)
    //   }
    // })
    // getCurrentCity();

    // wx.loadFontFace({
    //   family: 'MySimSun',
    //   global: true,
    //   source: 'url("https://gewugo.com/api/v1/storage/font/SimSun.ttf")',
    //   success(res) {
    //     console.log('font', res.status)
    //   },
    //   fail: function (res) {
    //     console.log('font', res.status)
    //   },
    //   complete: function (res) {
    //     console.log('font', res.status)
    //   }
    // });

    let sysInfo = wx.getWindowInfo();
let menuInfo = wx.getMenuButtonBoundingClientRect();
// let navigationBarHeight = (menuInfo.top - sysInfo.statusBarHeight) * 2 + menuInfo.height;
console.log('navigationBarHeight', sysInfo.safeArea.height);
this.globalData.system.statusBarHeight = sysInfo.statusBarHeight;
this.globalData.system.bottomSafeHeight = sysInfo.safeArea.height;
    // 登录
    // wx.login({
    //   success: res => {
    //     console.log('login status', res)
    //     wx.request({
    //       url: 'https://gewugo.com/api/v1/sessions/'+ res.code,
    //       method: 'POST',
    //       header: {
    //         'content-type': 'application/json',
    //       },
    //       success: (res: any) => {
    //         console.log('session login', res);
    //         if (res && res.statusCode === 200 && res.data && res.data.token ) {
    //           wx.setStorageSync('token', res.data.token);
              

    //         }
    //       },
    //       fail: (err) => {
    //         console.error(err)
    //       }
    //     })
    //     // 发送 res.code 到后台换取 openId, sessionKey, unionId
    //   },
    //   fail: (error) => {
    //     console.log('login status error', error)

    //   }
    // })
try {
  // const res = await getLoginStatus();
 
    clearAndFreshLoginStatus();
  
  
} catch (error) {
  console.log('login res', error);
  
}
  // const {token, userinfo} = await getLoginStatus();
  // getApp().globalData.token = token;
  // getApp().globalData.userinfo = userinfo;
  },
})
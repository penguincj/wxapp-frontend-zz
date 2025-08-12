/// <reference path="./types/index.d.ts" />

declare module 'miniprogram' {
  interface PageInstance {
    tracker: any; // Page中可直接用this.tracker
  }

  interface ComponentInstance {
    tracker: any; // Component中可直接用this.tracker
  }
}
interface IAppOption {
  globalData: {
    scene_id: any,
    userinfo: any,
    audio: any,
    system: any,
    token: any,
    ai: {
      x: number,
      y: number,
    },
    play: {
      x: number,
      y: number,
    },
    logInfo: any,
  },
 

  userInfoReadyCallback?: WechatMiniprogram.GetUserInfoSuccessCallback,
}
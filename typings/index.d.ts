/// <reference path="./types/index.d.ts" />

interface IAppOption {
  globalData: {
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
    }
  },
 

  userInfoReadyCallback?: WechatMiniprogram.GetUserInfoSuccessCallback,
}
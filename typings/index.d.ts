/// <reference path="./types/index.d.ts" />

interface IAppOption {
  globalData: {
    userinfo: any,
    audio: any,
    system: any,
    token: any,
  }
  userInfoReadyCallback?: WechatMiniprogram.GetUserInfoSuccessCallback,
}
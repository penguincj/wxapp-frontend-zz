/// <reference path="./types/index.d.ts" />

interface IAppOption {
  globalData: {
    userInfo?: WechatMiniprogram.UserInfo,
    audio: any,
  }
  userInfoReadyCallback?: WechatMiniprogram.GetUserInfoSuccessCallback,
}
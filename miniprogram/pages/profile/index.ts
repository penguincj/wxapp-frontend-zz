import { getCurrentPageParamStr } from "../../utils/util"
const defaultAvatar = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
  data: {
    motto: '格物观展',
    userInfo: {
      avatar: defaultAvatar,
      nickname: '',
    },
    hasUserInfo: false,
    canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    canIUseNicknameComp: wx.canIUse('input.type.nickname'),
    radioSelected: false,

  },

  // 事件处理函数

  handleRadioChange(event: any) {
    // console.log('radio change', event);
    this.setData({
      radioSelected: !this.data.radioSelected,
    })
  },

  handleClickModifyUserInfo() {
    const params = getCurrentPageParamStr();
    wx.navigateTo({
      url: '/pages/login/index' + params
    })
  },

  handleClickCollect() {
    const params = getCurrentPageParamStr();
    wx.navigateTo({
      url: '/pages/personal/collectionlist/index' + params
    })
  },

  handleClickLike() {
    const params = getCurrentPageParamStr();
    wx.navigateTo({
      url: '/pages/personal/likelist/index' + params
    })
  },
  handleClickHistory() {
    const params = getCurrentPageParamStr();
    wx.navigateTo({
      url: '/pages/personal/looklist/index' + params
    })
  },




  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs',
    })
  },
  // onChooseAvatar(e: any) {
  //   const { avatarUrl } = e.detail
  //   const { nickName } = this.data.userInfo
  //   this.setData({
  //     "userInfo.avatarUrl": avatarUrl,
  //     hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatar,
  //   })
  // },
  // onInputChange(e: any) {
  //   const nickName = e.detail.value
  //   const { avatarUrl } = this.data.userInfo
  //   this.setData({
  //     "userInfo.nickName": nickName,
  //     hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatar,
  //   })
  // },
  async getUserProfile() {
    const userinfo = await wx.getStorageSync('userinfo');
    console.log('userinfo', userinfo);
    
    this.setData({
      userInfo: {...userinfo},
    })
  },
  onShow: function() {
   this.getUserProfile();
  }

})

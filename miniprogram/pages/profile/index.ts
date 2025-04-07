import { getCurrentPageParamStr, backToTargetPage } from "../../utils/util"
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
  handleClickFeedback() {
    const params = getCurrentPageParamStr();
    wx.navigateTo({
      url: '/pages/feedback/index' + params
    })
  },
  handleClickKefu() {
    const params = getCurrentPageParamStr();
    wx.navigateTo({
      url: '/pages/feedback/index' + params
    })
  },
  handleClickSetting() {
    const params = getCurrentPageParamStr();
    wx.navigateTo({
      url: '/pages/setting/index' + params
    })
  },
  handleClickPlayerComp() {
    const targetPage = "pages/exhibitlist/index";
    backToTargetPage(targetPage);
  },

  handleClickAiRobot() {
    console.log('handleClickAiRobot')
    const params = getCurrentPageParamStr();
    const targetPage = "/pages/agent/index";
    wx.navigateTo({
      url: targetPage
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
    const userinfo = getApp().globalData.userinfo;
    
    this.setData({
      userInfo: {...userinfo},
    })
  },
  onShow: function() {
    this.getUserProfile();
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {    
      this.getTabBar().setData({
          selected: 3
        })
    }
  },
  onShareAppMessage(){
    const defaultUrl = 'https://gewugo.com/api/v1/storage/image/share-3639793484.jpg';
    const title = '【格物观展：让您的博物馆之旅不虚此行】' ;
    var shareObj = {
      title,
      path: '/pages/index/index',
      imageUrl: defaultUrl,
      success: function(res: any){
        if(res.errMsg == 'shareAppMessage:ok'){
          console.log('share success')
        }
      },
      fail: function(res: any){
        if(res.errMsg == 'shareAppMessage:fail cancel'){
          console.log('share cancel')
        }else if(res.errMsg == 'shareAppMessage:fail'){
          console.log('share fail')
        }
      },
    }
    return shareObj;
  },
  

})

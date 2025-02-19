// index.ts
// 获取应用实例
import { modifyNameAndAva } from "../../api/api"

const app = getApp<IAppOption>()
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Component({
  data: {
    motto: '格物观展',
    userInfo: {
      avatarUrl: defaultAvatarUrl,
      nickName: '',
    },
    hasUserInfo: false,
    canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    canIUseNicknameComp: wx.canIUse('input.type.nickname'),
  },
  methods: {
    // 事件处理函数
    bindViewTap() {
      wx.navigateTo({
        url: '../logs/logs',
      })
    },

    onChooseAvatar(e: any) {
      console.log('event', e);
      const { avatarUrl } = e.detail
      const { nickName } = this.data.userInfo
      if (avatarUrl) {
        wx.uploadFile({
          url: 'https://gewugo.com/api/v1/images', //仅为示例，非真实的接口地址
          filePath: avatarUrl,
          name: 'file',
          success (res){
            const data: any = res.data
            console.log('upload success', data);
            if (data && data.code === 200) {
              console.log(data.url);
              // modifyNameAndAva({
              //   name: app.globalData.userInfo?.nickName,
              //   avatarUrl: data.url
              // }).then((m_res) => {
              //   if (app.globalData.userInfo) {
              //     app.globalData.userInfo.avatarUrl = data.url; 
              //   }
              // })
            }
            
            //do something
          },
          fail (error){
            console.log('upload fail', error);
            
            //do something
          }
          

        })
      }
      this.setData({
        "userInfo.avatarUrl": avatarUrl,
        hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
      })
    },
    onInputChange(e: any) {
      const nickName = e.detail.value
      const { avatarUrl } = this.data.userInfo
      this.setData({
        "userInfo.nickName": nickName,
        hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
      })
    },
    getUserProfile() {
      // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
      wx.getUserProfile({
        desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
        success: (res) => {
          console.log(res)
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    },
  },
})

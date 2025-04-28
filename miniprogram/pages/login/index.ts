// index.ts
// 获取应用实例
import { modifyNameAndAva } from "../../api/api"

const app = getApp<IAppOption>()
const defaultAvatar = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Component({
  data: {
    motto: '博物岛屿',
    userInfo: {
      avatar: defaultAvatar,
      nickname: '',
      userid: -1,
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

    async onChooseAvatar(e: any) {
      console.log('event', e);
      const { avatarUrl } = e.detail
      const { nickname, userid } = this.data.userInfo;
      const token = await wx.getStorageSync('token');
      if (avatarUrl) {
        wx.uploadFile({
          url: `https://gewugo.com/api/v1/users/${userid}/avatar`, //仅为示例，非真实的接口地址
          header: {
            "Content-Type": "multipart/form-data",
            'Authorization': 'Bearer ' + token
          },
          filePath: avatarUrl,
          name: 'file',
          success: async (res) => {
            let data: any = res.data;
            if (typeof(data) === 'string') {
              data = JSON.parse(data);
            }
            console.log('upload success 222', data.code);

            if (data && data.code === 0) {
              this.modifyUserInfoAsync(userid, nickname, data.url);
              getApp().globalData.userinfo.avatar = data.url;
            }
            
            //do something
          },
          fail (error){
            console.log('upload fail', error);
            
            //do something
          }
          

        })
      }
      // this.setData({
      //   "userInfo.avatar": avatar,
      //   hasUserInfo: nickname && avatar && avatar !== defaultAvatar,
      // })
    },
    async modifyUserInfoAsync(userid: any, nickname: any, avatar: any) {
      try {
        const info_res: any = await modifyNameAndAva(userid, {
          method: 'PUT',
          data: {
            nickname,
            avatar,
          }
        })
        if (info_res && info_res.user) {
          const {avatar, nickname} = info_res.user;
          this.setData({
            userInfo: {
              ...this.data.userInfo,
              avatar,
              nickname
            }
          })
          getApp().globalData.userinfo.nickname = nickname;
          await wx.setStorageSync('userinfo', {
            ...this.data.userInfo,
            avatar,
            nickname
          })
        }
        console.log('info_res', info_res)
      } catch (error) {
        console.error(error)
      }
    },
    onInputChange(e: any) {
      const nickname = e.detail.value;
      const { avatar, userid } = this.data.userInfo;

      this.setData({
        userInfo: {
          ...this.data.userInfo,
          nickname,
        }
      })
      this.modifyUserInfoAsync(userid, nickname, avatar);
    },
    // getUserProfile() {
    //   // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    //   wx.getUserProfile({
    //     desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
    //     success: (res) => {
    //       console.log(res)
    //       this.setData({
    //         userInfo: res.userInfo,
    //         hasUserInfo: true
    //       })
    //     }
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

  },
})

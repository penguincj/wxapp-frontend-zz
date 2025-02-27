import { sendFeedback } from "../../api/api";

Page({
  data: {
    content: "",
    phone: "",
    userid: -1,
  },
  // 事件处理函数
  handleContentInputChange(event: any) {
    const { value } = event.detail;
    this.setData({
      content: value,
    })
  },
  handlePhoneInputChange(event: any) {
    const { value } = event.detail;
    this.setData({
      phone: value,
    })
  },
  async handleClickSubmit() {
    try {
      const res : any = await sendFeedback(this.data.userid, {
        method: "POST",
        data: {
          context: this.data.content,
          contact: this.data.phone,
        }
      });
      console.log(res);
      if (res.code === 201) {
        wx.showToast({
          title: '成功',
          icon: 'success',
          duration: 2000
        })
      }
      setTimeout(() => {
        wx.navigateBack();
      }, 2000)
    } catch (error) {
      console.log(error);
      
    }
  },
  onShow() {
    const { userid } = getApp().globalData.userinfo;
    this.setData({
      userid: userid,
    })
  },

})

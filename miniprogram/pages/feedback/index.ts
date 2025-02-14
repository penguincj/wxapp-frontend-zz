// index.ts
// 获取应用实例
// const app = getApp<IAppOption>()

Component({
  data: {
    content: "",
    phone: "",
  },
  methods: {
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
    }
  },
})

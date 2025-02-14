// index.ts
// 获取应用实例
// const app = getApp<IAppOption>()
Component({
  data: {
   isAutoPlay: false,
   showClearStoragePopup: false,
   showZXPopup: false,
   countdown: 5,
  },
  methods: {
    // 事件处理函数
    handleClickAutoPlay() {
      this.setData({
        isAutoPlay: !this.data.isAutoPlay,
      })
    },
    handleClearStorage() {
      this.setData({
        showClearStoragePopup: true,
      })
    },
    handleClosePopup () {
      this.setData({
        showClearStoragePopup: false,
      })
    },
    handleCloseZXPopup () {
      this.setData({
        showZXPopup: false,
      })
    },
    handleZXClick() {
      this.setData({
        showZXPopup: true,
        countdown: 5,
      });
      this.countDownFunc();
    },
    countDownFunc() {
      const intervalId = setInterval(() => {
        let count = this.data.countdown;
        if (count > 0) {
          count -= 1;
          this.setData({
            countdown: count
          })

        } else {
          
          clearInterval(intervalId);
          console.log('intervalId',intervalId);

          return;
        }
      }, 1000)
    }
  },
})

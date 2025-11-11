Page({
  data: {
    photos: [],
    showConfirmOverlay: false,
    showResultOverlay: false
  },

  // 显示确认蒙层
  showConfirmOverlay() {
    this.setData({
      showConfirmOverlay: true
    })
  },

  // 隐藏确认蒙层
  hideConfirmOverlay() {
    this.setData({
      showConfirmOverlay: false
    })
  },

  // 拍照
  takePhoto() {
    this.hideConfirmOverlay()
    
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['camera'],
      camera: 'back',
      success: (res) => {
        console.log('拍照成功:', res)
        
        if (res.tempFiles && res.tempFiles.length > 0) {
          const tempFilePath: any = res.tempFiles[0].tempFilePath
          const photos = this.data.photos
          // @ts-expect-error
          photos.unshift(tempFilePath)
          
          this.setData({
            photos: photos,
            showResultOverlay: true
          })
        }
      },
      fail: (err) => {
        console.error('拍照失败:', err)
        wx.showToast({
          title: '拍照失败',
          icon: 'none'
        })
      }
    })
  },

  // 隐藏结果蒙层
  hideResultOverlay() {
    this.setData({
      showResultOverlay: false
    })
  },

  // 删除照片
  deletePhoto(e: any) {
    const index = e.currentTarget.dataset.index
    const photos = this.data.photos
    photos.splice(index, 1)
    
    this.setData({
      photos: photos
    })
    
    wx.showToast({
      title: '删除成功',
      icon: 'success'
    })
  },

  // 预览图片
  previewImage(e: any) {
    const src = e.currentTarget.dataset.src
    wx.previewImage({
      current: src,
      urls: this.data.photos
    })
  }
})
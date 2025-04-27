
Page({
  // ...
  data: {
    tagArr: [
      {name: '推荐', num: 334},
      {name: '一般', num: 34},
      {name: '推荐', num: 334},
      {name: '推荐', num: 334},
      {name: '观展后评价', num: 334},
      {name: '推荐', num: 334},
      {name: '推荐', num: 334},
      {name: '高质量', num: 334},
      {name: '推荐', num: 334},
      {name: '推荐', num: 334},
      {name: '推荐', num: 334},
      {name: '推荐', num: 334},
      {name: '推荐', num: 334},
    ],
    showAddTagPopup: false,
  },
  handleUpload() {
    wx.chooseMedia({
      count: 9,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      maxDuration: 30,
      camera: 'back',
      success(res) {
        console.log(res.tempFiles[0].tempFilePath)
        console.log(res.tempFiles[0].size)
        wx.uploadFile({
          url: 'https://example.weixin.qq.com/upload', //仅为示例，非真实的接口地址
          filePath: res.tempFiles[0].tempFilePath,
          name: 'file',
          formData: {
            'user': 'test'
          },
          success (res){
            const data = res.data
            //do something
          }
        })
      }
    })
  },
  handleAddTagClick() {
    this.setData({
      showAddTagPopup: true,
    })
  },
  handleClosePopup() {
    this.setData({
      showAddTagPopup: false,
    })
  },
})

import { base_api, postLabel, getLabel, postCommentsByExhibitionID } from "../../api/api"

Page({
  // ...
  data: {
    tagArr: [] as any,
    starPic: ["/static/images/star_gray.png", "/static/images/star_yellow.png"],
    isStarLight: [0, 0, 0, 0, 0],
    label: '',
    showAddTagPopup: false,
    curExhibitionId: -1,
    uploadedImages: [] as any,
    token: "",
    stars: 0,
    selectLabels: [] as any,
    message: "",
    userid: -1,
    isShowLabels: false,
    imgArr: [] as any,
  },
  handleClickShowLabel() {
    console.log('handleClickShowLabel');
    this.setData({
      isShowLabels: !this.data.isShowLabels
    })
  },
  handleClickRemoveImage(e: any) {
    // console.log(e)
    const {idx} = e.currentTarget.dataset;
    let curImages = [...this.data.uploadedImages];
    curImages.splice(idx, 1);
    this.setData({
      uploadedImages: curImages,
    })
  },
  inputChange(e: any) {
    const { value } = e.detail;
    console.log('---input', value);
    this.setData({
      message: value,
    })
  },

  uploadFilePromise (filepath: any) {
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: `https://gewugo.com/${base_api}/v1/communities/exhibitions/${this.data.curExhibitionId}/images`,
        header: {
          "Content-Type": "multipart/form-data",
          'Authorization': 'Bearer ' + this.data.token
        },
        filePath: filepath,
        name: 'file',
        formData: {
          // 'user': 'test'
        },
        success (res){
          const data : any = res.data
          const data_obj = JSON.parse(data);
          if (data_obj.code === 0 && data_obj.url) {
            resolve(data_obj.url)
          } else {
            reject(res)
          }
        },
        fail(error) {
          reject(error)
        }
      })
    })
  },
  handleUpload() {
    const that = this;
    if (this.data.uploadedImages.length > 8) {
      return;
    }
    wx.chooseMedia({
      count: 9,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      maxDuration: 30,
      camera: 'back',
      async success(res: any) {
        for (let i = 0; i< res.tempFiles.length; i++) {
          const file = res.tempFiles[i];
          const result = await that.uploadFilePromise(file.tempFilePath);
          console.log('result', result);
          that.setData({
            uploadedImages: [...that.data.uploadedImages, result],
            imgArr: [...that.data.imgArr, i]
          })
        }
        // res.tempFiles.forEach(async (file: any) => {
        //   const res = await that.uploadFilePromise(file.tempFilePath);
        //   console.log('res', res);
        //   that.setData({
        //     uploadedImages: [...that.data.uploadedImages, res]
        //   })
        // })
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
  async handleSubmit() {
    if (this.data.stars && this.data.message ) {
      const labels = this.data.selectLabels.map((i: any) => {
        return {
          id: i,
        }
      })
      const params =  {
        exhibition_id: this.data.curExhibitionId,
        stars: this.data.stars,
        labels: labels,
        content: this.data.message,
        images: this.data.uploadedImages
      }
      const res: any = await postCommentsByExhibitionID(this.data.curExhibitionId, this.data.userid, {
        method: 'POST',
        data: params,
      })
      if (res && res.code === 0) {
        wx.navigateBack();
      } else {
        const title = (res && res.message) || '对不起，请仔细检查您输入的内容是否符合规范！'
        wx.showToast({
          title,
          icon: 'none',
          duration: 2000
        }) 
      }
      console.log('res', res)
    } else {
      console.log('缺少必要参数')
    }
    
    
  },
  handleClickStar(e: any) {
    const { idx } = e.currentTarget.dataset;
    console.log(idx);
    if (idx === "0") {
      this.setData({
        stars: 1,
        isStarLight: [1,0,0,0,0]
      })
    } else if (idx === "1") {
      this.setData({
        stars: 2,
        isStarLight: [1,1,0,0,0]
      })
    } else if (idx === "2") {
      this.setData({
        stars: 3,
        isStarLight: [1,1,1,0,0]
      })
    } else if (idx === "3") {
      this.setData({
        stars: 4,
        isStarLight: [1,1,1,1,0]
      })
    }  else if (idx === "4") {
      this.setData({
        stars: 5,
        isStarLight: [1,1,1,1,1]
      })
    }

  },
  async handleConfirmPopup() {
    if(this.data.label.length > 0) {
      const res : any = await postLabel(this.data.curExhibitionId, {
        method: 'POST',
        data:{
          exhibition_id: this.data.curExhibitionId,
          label_name: this.data.label,
        }
      })
      console.log(res)
      if (res && res.code === 0) {
        this.handleClosePopup();
        this.getLabels();
      }
    }
    console.log('请输入大于0的字符')
  },
  handleChangeLabel(e: any) {
    const { value } = e.detail;
    console.log('---input', value);
    this.setData({
      label: value,
    })
  },
  handleClickLabel(e: any) {
    const { idx } = e.currentTarget.dataset;
   
    console.log(idx);
    const labels = [...this.data.selectLabels];
    const index = labels.indexOf(idx);
    const labelNotExit = (index === -1);

    let labelarr = [];
    for (let i=0; i< this.data.tagArr.length; i++) {
      let item = this.data.tagArr[i];
      if (item.id === idx) {
        item.isSelected = !item.isSelected;
      }
      labelarr.push(item);
    }
    if (!labelNotExit) {
      labels.splice(index, 1)
    } else {
      labels.push(idx);
    }
    console.log('labels', labels)
    this.setData({
      selectLabels: labels,
      tagArr: labelarr,
    })
  },
  async getLabels() {
    
    const res: any = await getLabel(this.data.curExhibitionId);
    
    if (res && res.code === 0) {
      const labels = res.labels.map((i: any) => {
        return {
          ...i,
          isSelected: false,
        }
      })
      this.setData({
        tagArr: labels,
      })
    }
    console.log('in getLabels', res.labels);
  },
  onLoad(options) {
    this.setData({
      curExhibitionId: Number(options.exhibition_id),
    })
  },
  async onShow() {
    const token = await wx.getStorageSync('token');
    const { userid } = await wx.getStorageSync('userinfo');
    this.setData({
      token,
      userid,
    })
    console.log('onshow')
    if (this.data.tagArr.length === 0) {
      this.getLabels();
    }
    
  }

})
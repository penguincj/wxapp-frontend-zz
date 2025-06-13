Component({
  options: {
  },
  /**
   * 组件的属性列表
   */
  properties: {
    pageindex: {
      type: String,
      value: ''
    },
    title: {
      type: String,
      value: '',
    },
    labels: {
      type: Array,
      value: [],
    },
    comments: {
      type: Array,
      value: [],
    },
    exhibitionid: {
      type: Number,
      value: -1,
    },
    userid: {
      type: Number,
      value: -1,
    },
    nickname: {
      type: String,
      value: "",
    }
  },
  /**
   * 组件的初始数据
   */
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
    selectLabel: "",
  },
  lifetimes: {
    attached() {
      
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    handleClickCommentIcon() {
      this.triggerEvent('ClickCommentIcon')
    },
    handleShowFullImage(e: any) {
      const {imglist, img, showBigImg, idx} = e.detail;
      this.triggerEvent('ShowFullImage', {imglist, img, showBigImg, idx})
    },
    handleLabelClick(e: any) {
      const {name} = e.currentTarget.dataset;
      this.setData({
        selectLabel: name,
      })
      this.triggerEvent('SelectLabel', name)
    },
    handleClickAllLabel() {
      this.setData({
        selectLabel: "",
      })
      this.triggerEvent('SelectLabel', "")
    },
    handleDelCommentSuc() {
      this.triggerEvent('DelCommentSuc');
    },
  },
})

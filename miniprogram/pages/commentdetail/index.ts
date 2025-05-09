import { getCommentDetail, postReplyToParent, delReplyToParent, delCommentLike, postCommentLike } from "../../api/api";
import { generateDateFormat } from "../../utils/util";

Page({
  // ...
  data: {
    tagArr: [
      { name: '推荐', num: 334 },
      { name: '一般', num: 34 },
      { name: '推荐', num: 334 },
      { name: '推荐', num: 334 },
      { name: '观展后评价', num: 334 },
      { name: '推荐', num: 334 },
      { name: '推荐', num: 334 },
      { name: '高质量', num: 334 },
      { name: '推荐', num: 334 },
      { name: '推荐', num: 334 },
      { name: '推荐', num: 334 },
      { name: '推荐', num: 334 },
      { name: '推荐', num: 334 },
    ],
    curExhibitionId: -1,
    commentId: -1,
    comment: {} as any,
    childComment: {} as any,
    userid: -1,
    nickname: "",
    message: "",
    bigImg: "",
    showBigImg: false,
    focus: false,
    placeholder: '说点什么...',
    parent_id: -1,
    currentImageIndex: 0,
    imgList: [],
  },
  handleClosePopup() {
    this.setData({
      showBigImg: false,
    })
  },
  handleDelReplySuc() {
    this.initPage();
  },
  handleDelCommentSuc() {
    wx.navigateBack();
  },
  handleShowFullImage(e: any) {
    const { img, showBigImg, idx, imglist } = e.detail;
    this.setData({
      bigImg: img,
      showBigImg,
      currentImageIndex: idx,
      imgList: imglist,
    })
  },
  handleNotLikeClick() {
    this.initPage();
  },
  handleLikeClick() {
    this.initPage();
  },
  async handleClickNotLike(e: any) {
    const { idx } = e.currentTarget.dataset;
    const res: any = await delCommentLike(this.data.curExhibitionId, this.data.userid, idx);
    if (res && res.code === 0) {
      this.setData({
        comment: {
          ...this.data.comment,
          liked_count: this.data.comment.liked_count - 1,
          liked: false,
        },
      })
      this.initPage();
    }
  },
  async handleClickLike(e: any) {
    const { idx } = e.currentTarget.dataset;

    const res: any = await postCommentLike(this.data.curExhibitionId, this.data.userid, idx);
    if (res && res.code === 0) {
      this.setData({
        comment: {
          ...this.data.comment,
          liked_count: this.data.comment.liked_count + 1,
          liked: true,
        },
      })
      this.initPage();
    }
  },
  handleFocusInput(e: any) {
    console.log('handleFocusInput', e.detail.comment_id)
    const { comment_id, user_name } = e.detail;
    this.setData({
      focus: true,
      placeholder: '回复：' + user_name,
      parent_id: comment_id,
    })
  },
  handleFocus() {
    this.setData({
      focus: true,
    })
  },
  handleBlur() {
    this.setData({
      focus: false,
      // placeholder: '说点什么...',
      // parent_id: this.data.comment.comment_id,
    })
  },
  handleClickPage() {
    this.setData({
      focus: false,
      placeholder: '说点什么...',
      parent_id: this.data.comment.comment_id,
    })
  },
  handleInputChange(e: any) {
    console.log(e);
    const { value } = e.detail;
    this.setData({
      message: value,
    })
  },
  async submitReply() {
    const params = {
      exhibition_id: this.data.curExhibitionId,
      content: this.data.message,
      parent_id: this.data.parent_id,
      user_id: this.data.userid,
    }
    console.log(params)
    const res: any = await postReplyToParent(this.data.curExhibitionId, this.data.userid, {
      method: 'POST',
      data: params,
    });
    if (res && res.code === 0) {
      this.initPage();

    } else {
      const title = (res && res.details) || '对不起，请仔细检查您输入的内容是否符合规范！'
      wx.showToast({
        title,
        icon: 'none',
        duration: 2000
      })      
    }
    console.log(res)
  },
  initPage() {
    this.getComment();
    this.setData({
      message: '',
      placeholder: '说点什么...',
      focus: false,
    })
  },
  handleClickCommentIcon() {
    this.setData({
      focus: true,
    })
  },
  async getComment() {
    const res: any = await getCommentDetail(this.data.curExhibitionId, this.data.commentId);
    if (res && res.code === 0) {
      console.log(res)
      if (res.data && res.data.length) {

        let comment = res.data.find((i: any) => i.parent_id === 1);
        let childComment = res.data.filter((i: any) => i.parent_id !== 1);
        const time = comment.timestamp;
        const calTime = generateDateFormat(time);
        // let childComment_final = [];
        const childComment_final = childComment.map((i: any) => {
          const time = i.timestamp;
          const calTime = generateDateFormat(time);
          return {
            ...i,
            calTime,
          }
        })
        console.log('childComment_final', childComment_final)
        comment = {
          ...comment,
          calTime,
        }
        this.setData({
          comment,
          childComment: childComment_final,
          parent_id: comment.comment_id,
        })
      }
    }
  },
  onShow() {
    this.getComment();
  },
  onLoad(options) {
    const { userid, nickname } = getApp().globalData.userinfo;

    this.setData({
      curExhibitionId: Number(options.exhibition_id),
      commentId: Number(options.comment_id),
      userid,
      nickname,
    })

  }
})
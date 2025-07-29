import { postReplyToParent } from "../../api/api";

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
    },
    showReplayBar: {
      type: Boolean,
      value: false,
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
    message: "",
    replyParentId: 0,
    showBottomReplyBar: false,
    placeholder: "",
    focus: false,
  },
  lifetimes: {
    attached() {
      
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    handleDelReplySuc() {
      
      this.triggerEvent('DelCommentSuc');
    },
    handleInputChange(e: any) {
      console.log(e);
      const { value } = e.detail;
      this.setData({
        message: value,
      })
    },
    handleBlur() {
      console.log('blur');
    
      this.setData({
        focus: false,
        // showBottomReplyBar: false,
        // placeholder: '说点什么...',
        // parent_id: this.data.comment.comment_id,
      })
    },
    handleFocus() {
      this.setData({
        focus: true,
      })
    },
    handleFocusInput(e: any) {
      console.log('handleFocusInput', e.detail.comment_id)
      const { comment_id, user_name } = e.detail;
      this.setData({
        showBottomReplyBar: true,
        focus: true,
        placeholder: '回复：' + user_name,
        replyParentId: comment_id,
      });
      this.triggerEvent('ClickParentReply', {
        parentid: comment_id,
        username: user_name,
        showReplayBar: true,
      });
    },
    handleClickCommentIcon() {
      this.triggerEvent('ClickCommentIcon')
    },
    handleClickParentReply(e: any) {
      try {
        const { parentid, username } = e.detail;
        console.log('parent_id', parentid);
        this.setData({
          replyParentId: parentid,
          showBottomReplyBar: true,
          placeholder: '回复：' + username,
          focus: true,
          showReplayBar: true,
        });
        this.triggerEvent('ClickParentReply', {
          parentid,
          username,
          showReplayBar: true,
        });
      } catch (error) {
        console.log(error)
      }
    },
    async submitReply() {
      const params = {
        exhibition_id: this.data.exhibitionid,
        content: this.data.message,
        parent_id: this.data.replyParentId,
        user_id: this.data.userid,
      }
      console.log(params)
      const res: any = await postReplyToParent(this.data.exhibitionid, this.data.userid, {
        method: 'POST',
        data: params,
      });
      if (res && res.code === 0) {
        this.setData({
          message: "",
        })
        this.triggerEvent('ReplayToParentSuc')
        wx.showToast({
          title: '回复成功',
          icon: 'none',
          duration: 2000
        });
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

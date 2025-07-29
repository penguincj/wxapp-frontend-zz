// @ts-nocheck
// import { audioList } from './mock';
import { throttle, getCurrentPageParamStr } from '../../utils/util';
import { sendListenAudioAction, delCommentLike, postCommentLike, delReplyToParent } from '../../api/api';

const global_audio = getApp().globalData.audio;
Component({
  options: {
    styleIsolation: 'shared' // 可选 isolated(默认) | apply-shared | shared
  },
  properties: {
    childcomment: {
      type: Object,
      value: {},
    },
    parentusername: {
      type: String,
      value: "",
    },
    parentcommentid: {
      type: Number,
      value: -1,
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
      value: ""
    }
  },
  data: {

  },
  methods: {
    handleReply(e: any) {
      const { item } = e.currentTarget.dataset;
      this.triggerEvent('FocusInput', {
        ...item
      })
    },
    async handleClickDelComment(e: any) {
      const { idx } = e.currentTarget.dataset;
      const res: any = await delReplyToParent(this.data.exhibitionid, this.data.userid, idx);
      if (res && res.code === 0) {
        wx.showToast({
          title: '删除成功',
          icon: 'none',
          duration: 2000
        });
        this.triggerEvent('DelReplySuc')
      }
    },
    async handleClickNotLike(e: any) {
      const { idx } = e.currentTarget.dataset;
      const res: any = await delCommentLike(this.data.exhibitionid, this.data.userid, idx);
      if (res && res.code === 0) {
        const c_commet_list = [...this.data.childcomment].map((i:any) => {
          if(i.comment_id === idx) {
            return {
              ...i,
              liked_count: i.liked_count - 1,
              liked: false,
            }
          } else {
            return {
              ...i,
            }
          }
        });
        
        this.setData({
          childcomment: c_commet_list,
        })
      }
    },
    async handleClickLike(e: any) {
      const { idx } = e.currentTarget.dataset;

      const res: any = await postCommentLike(this.data.exhibitionid, this.data.userid, idx);
      if (res && res.code === 0) {
        const c_commet_list = [...this.data.childcomment].map((i:any) => {
          if(i.comment_id === idx) {
            return {
              ...i,
              liked_count: i.liked_count + 1,
              liked: true,
            }
          } else {
            return {
              ...i,
            }
          }
        });
        this.setData({
          childcomment: c_commet_list,
        })
      }
    },

  },





  lifetimes: {

  },
  pageLifetimes: {
    show() {

    }
  }

})

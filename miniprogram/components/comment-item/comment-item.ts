import { postCommentLike, delCommentLike, delCommentsByExhibitionID } from "../../api/api";
import { generateNewUrlParams, getCurrentPageUrl } from "../../utils/util";

Component({
  properties: {
    comment: {
      type: Object,
      value: {} as any
    },
    exhibitionid: {
      type: Number,
      value: -1
    },
    userid: {
      type: Number,
      value: -1,
    },
    nickname: {
      type: String,
      value: ""
    },
  },
  data: {
    bigImg: "",
    showBigImg: false,
  },
  methods: {
    async handleClickNotLike(e: any) {
      const { idx } = e.currentTarget.dataset;
      const res: any = await delCommentLike(this.data.exhibitionid, this.data.userid, idx);
      if (res && res.code === 0) {
        this.setData({
          comment: {
            ...this.data.comment,
            liked_count: this.data.comment.liked_count -1,
            liked: false,
          },
        })
        this.triggerEvent('NotLikeClick');
      }
    },
    async handleClickLike(e: any) {
      const { idx } = e.currentTarget.dataset;
  
      const res: any = await postCommentLike(this.data.exhibitionid, this.data.userid, idx);
      if (res && res.code === 0) {
        this.setData({
          comment: {
            ...this.data.comment,
            liked_count: this.data.comment.liked_count + 1,
            liked: true,
          },
        })
        this.triggerEvent('LikeClick');
      }
    },

    async handleClickDelComment(e: any) {
      const { idx } = e.currentTarget.dataset;
      const res : any = await delCommentsByExhibitionID(this.data.exhibitionid, this.data.userid, idx);
      if(res && res.code === 0) {
        this.triggerEvent('DelCommentSuc');
      }
    },

    handleClickComment(e: any) {
      const currentPage = getCurrentPageUrl();
      console.log('currentPage', currentPage);
      if (currentPage.indexOf('commentdetail/index') !== -1) {
        return;
      }
      const { idx } = e.currentTarget.dataset;
      console.log(e)
      const url_params = generateNewUrlParams({
        comment_id: idx,
        exhibition_id: this.data.exhibitionid
      })
      wx.navigateTo({
        url: '/pages/commentdetail/index' + url_params,
      })
    },

    handleClickImg(e: any) {
      console.log();
      const { img, imglist, idx } = e.currentTarget.dataset;
      // this.setData({
      //   showBigImg: true,
      //   bigImg: img,
      // })
      this.triggerEvent('ShowFullImage', {img, imglist, showBigImg: true, idx});
    },
  },


  



  lifetimes: {
    created() {      
    },
    attached(){
      // console.log('attached comment', this.properties.comment.liked)
      // this.setData({
      //   curHeartLight: Boolean(this.data.comment.liked),
      //   curLikeNum: this.data.comment.liked_count,
      // });
    }
  },
  pageLifetimes: {
    async show() {
      
      
    }
  }

})

import { postCommentLike, delCommentLike, delCommentsByExhibitionID } from "../../api/api";
import { generateNewUrlParams, getCurrentPageUrl } from "../../utils/util";

Component({
  properties: {
    pageindex: {
      type: String,
      value: '',
    },
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
    handleClickParentReply(e: any) {
      const { parentid, username } = e.currentTarget.dataset;
      console.log('parentid', parentid);
      this.triggerEvent('ClickParentReply', {
        parentid,
        username,
      })
    },
    async handleClickNotLike(e: any) {
      if (this.data.pageindex === 'index'){
        return;
      }
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
      if (this.data.pageindex === 'index'){
        return;
      }
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
        wx.showToast({
          title: '删除成功',
          icon: 'none',
          duration: 2000
        });
        this.triggerEvent('DelCommentSuc');
      }
    },

    handleClickComment(e: any) {
      console.log(e)
      const { idx, eid } = e.currentTarget.dataset;
      const currentPage = getCurrentPageUrl();
      console.log('currentPage', currentPage);

      if(this.data.pageindex && eid) {
        const url_params = generateNewUrlParams({
          exhibition_id: eid
        })
        wx.navigateTo({
          url: '/pages/exhibitiondetail/index' + url_params,
        })
        
      } else {
        if (currentPage.indexOf('commentdetail/index') !== -1) {
          return;
        }
        const url_params = generateNewUrlParams({
          comment_id: idx,
          exhibition_id: this.data.exhibitionid
        })
        wx.navigateTo({
          url: '/pages/commentdetail/index' + url_params,
        })
      }
      
    },

    handleClickImg(e: any) {
      console.log();
      const { img, imglist, idx, comment } = e.currentTarget.dataset;
      // this.setData({
      //   showBigImg: true,
      //   bigImg: img,
      // })
      if(this.data.pageindex === 'index') {
        const { exhibition_id = 12 } = comment;
        const url_params = generateNewUrlParams({
          exhibition_id: exhibition_id
        })
        wx.navigateTo({
          url: '/pages/exhibitiondetail/index' + url_params,
        })
      } else {
        this.triggerEvent('ShowFullImage', {img, imglist, showBigImg: true, idx});
      }
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

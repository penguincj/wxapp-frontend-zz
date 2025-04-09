import { collectionList, collectExhibit } from '../../../api/api';
import {  backToTargetPage, transferObjToUrlParams, generateNewUrlParams } from "../../../utils/util";

Page({
  data: {
    collectionList: [],
    loading: false,
    error: false,
    styleHeight: '',

  },
  async initPage() {
    const {userid} = await wx.getStorageSync('userinfo');
    try {
      const res: any = await collectionList(userid)
      console.log(res);
      if (res && res.code === 0) {
        const list = res.exhibits.map((i: any) => {
          let audioitem = {};
          if (i.audio_infos && i.audio_infos.length) {
            audioitem = i.audio_infos[0]
          }
          return {
            ...i,
            ...audioitem,
            xmove: 0,
          }
        })
        this.setData({
          collectionList: list
        })
      } else {
        this.setData({
          error: true
        })
      }
      
    } catch (error) {
      console.log(error);
      
      this.setData({
        error: true
      })
    }
  },
  handleClickInit() {
    this.initPage();
  },
  handleClickPlayerComp() {
    const targetPage = "pages/exhibitlist/index";
    backToTargetPage(targetPage);
  },
  handleClickItem(e: any) {
    console.log('e----', e)
    const { selectId, museumid, cityid, infos } = e.detail;
    const targetUrl = '/pages/exhibitdetail/index';
    if(infos && infos.narration_id && infos.unit_id) {
      const paramstr = transferObjToUrlParams({
        museum_id: museumid,
        exhibition_id: infos.exhibition_id,
        narration_id: infos.narration_id
      })
      console.log('params str', paramstr)
      getApp().globalData.audio.exhibitlistParams = paramstr;
      const params = generateNewUrlParams({
        museum_id: museumid,
        exhibition_id: infos.exhibition_id,
        narration_id: infos.narration_id,
        exhibit_id: selectId,
        unit_id: infos.unit_id,
      })
      wx.navigateTo({
        url: targetUrl + params
      })
    }
    // museum_id=8&exhibition_id=34&narration_id=39&exhibit_id=475&unit_id=60
    
    
  },
  async handleDeleteItem(event: any) {
    const { id } = event.detail;
    const {userid} = await wx.getStorageSync('userinfo');
    try {
      const res: any = await collectExhibit(userid, id, { method: 'DELETE'});
      if ( res && res.code === 0) {
        this.initPage()
      }
    } catch (error) {
      
    }
  },
  async onShow() {
    this.initPage();
    const {statusBarHeight} = getApp().globalData.system;
    const hei = `height: calc(100vh - ${statusBarHeight}px - 44px)`;
    this.setData({
      styleHeight: hei,
    })
  },
  onLoad(options) {
    
  },

});

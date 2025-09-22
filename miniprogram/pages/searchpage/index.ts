import { queryExhibitListAll } from '../../api/api';
import {  calTimeTxt, transferObjToUrlParams, generateNewUrlParams } from "../../utils/util";

Page({
  data: {
    loading: false,
    error: false,
    styleHeight: '',
    searchList: [] as any,
    keyword: '',
    type: '',
    exhibitionId: -1,
    emptyMessage: '', // 结果是空时展示的文案
    packageId: -1,
  },

  handInput(event: any) {
    const { value } = event.detail;
    console.log('value', value);
    this.setData({
      keyword: value
    })
  },
  confirmTap() {
    console.log('按下完成触发', this.data.keyword);
    this.handleClickSearch(this.data.keyword);
  },

  formatExhibitData(_exhibitlist: any) {
    return _exhibitlist.map((exhibit: any) => {
      // if (!exhibit.audio_infos){
      //   return null
      // }
      const keyword = this.data.keyword;
      const title_with_style = exhibit.name.replace(keyword, '<b style="color: #2C2F3B; font-weight: 400;">'+keyword+'</b>')
      const audioitem = exhibit.audio_infos[0];
      const duration_fmt = calTimeTxt(audioitem.duration);

      return {
        ...exhibit,
        title_with_style,
        audioitem: {
          ...audioitem,
          duration_fmt, 
        },
      }
    })
  },

  async handleClickSearch(_keyword: string) {
    const keyword = _keyword;
    console.log('keyword', keyword);
    const { userid } = getApp().globalData.userinfo;
   
    try {
      const url_params = transferObjToUrlParams({
        keyword: keyword,
        exhibitionID: this.data.exhibitionId,
        package_id: this.data.packageId,
      })
      const res:any = await queryExhibitListAll(userid, url_params)
      if( res && res.exhibits) {
        const list = res.exhibits.filter((i: any) => i.is_this_exhibition);
        const f_exhibitlist = this.formatExhibitData(list);
        this.setData({
          searchList: f_exhibitlist,
          emptyMessage: list.length ? '' : '本展览中未查询到结果～',
        })
      } else {
        this.setData({
          searchList: [],
          emptyMessage: '本展览中未查询到结果～'
        })
      }
    } catch (error) {
      console.error(error)
    }
    
  },

  handleClickExhibitItem(e: any) {
    console.log(e);
    const { selectId } = e.detail;
    const item = this.data.searchList.find((i: any) => i.id === Number(selectId));
    if (item && item.id) {
      const { exhibition_id, audioitem: {narration_id}, id, unit_id} = item;
      const url_params = generateNewUrlParams({
        exhibition_id,
        narration_id,
        exhibit_id: id,
        unit_id: unit_id,
      })
      wx.navigateTo({
        url: '/pages/exhibitdetail/index' + url_params
      });
    }
    
  },
  handleClickCancel() {
    this.setData({
      keyword: ''
    })
  },
  async onShow() {
    const {statusBarHeight} = getApp().globalData.system;
    const hei = `height: calc(100vh - ${statusBarHeight}px - 44px)`;
    this.setData({
      styleHeight: hei,
    })
  },
  onLoad(options) {
    if (options && options.type) {
      this.setData({
        type: options.type
      })
    }
    if (options && options.exhibition_id) {
      this.setData({
        exhibitionId: Number(options.exhibition_id)
      })
    }
    if (options && options.package_id) {
      this.setData({
        packageId: Number(options.package_id)
      })
    }
  },

});


import { getExhibitById, getPackageByID } from "../../api/api";
import { generateNewUrlParams, backToTargetPage, getCurrentPageParamStr, generateDateFormat } from "../../utils/util";

Page({
  data: {
    exhibitionId: -1,
    museumId: -1,
    posterType: 'exhibition',
    list: [] as any,
    leftList: [] as any,
    rightList: [] as any,
    from_page: 'share-image-list',
    package_id: -1,
    exhibit_id: -1,
  },

  async getPosterFromExhibit(_id: any) {
    try {
      const res : any = await getExhibitById(_id);
  
      if ( res && res.code === 0) {
        const exhibit = res.exhibit;
        if (exhibit.share_texts && exhibit.share_texts.length) {
          this.setData({
            share_texts: exhibit.share_texts
          })
          const image_urls = [exhibit.image_url, ...exhibit.more_image_urls];
          this.distributeToColumns(image_urls);
        }
      }
    } catch (error) {
      console.log(error)
    }
  },

  async getPosterFromPackage(_id: any) {
    try {
      const res : any = await getPackageByID(_id);
  
      if ( res && res.code === 0) {
        const r_package = res.data;
        if ((r_package.default_share_texts && r_package.default_share_texts.length) || (r_package.share_texts && r_package.share_texts.length)) {
          const share_texts = [...r_package.share_texts, ...r_package.default_share_texts ];
          const share_images = [...r_package.share_images, ...r_package.default_share_images]
          this.setData({
            share_texts,
            share_images,
          })
          this.distributeToColumns(share_images);
        }
      }
    } catch (error) {
      console.log(error)
    }
  },


  handleClickImg(event: any) {
    const { idx } = event.currentTarget.dataset;
    console.log('idx-----', idx)
    let params = {};
    if (this.data.from_page === 'package') {
      params = { package_id: this.data.package_id }
    } else if (this.data.posterType === 'exhibitlist')  {
      params = { exhibit_id: this.data.exhibit_id }
    }
    const url_params = generateNewUrlParams({
      from_page: this.data.from_page,
      poster_idx: idx,
      ...params,
    })
    wx.navigateTo({
      url: '/pages/share-poster/index' + url_params,
    })
  },

  // 将图片分配到两列
  distributeToColumns(imageList: string[]) {
    const leftList: any[] = [];
    const rightList: any[] = [];
    
    imageList.forEach((url: string, index: number) => {
      const item = {
        url: url,
        index: index
      };
      
      // 交替分配到左右两列
      if (index % 2 === 0) {
        leftList.push(item);
      } else {
        rightList.push(item);
      }
    });
    
    this.setData({
      leftList: leftList,
      rightList: rightList
    });
  },

  onReady() {
  },

  onLoad(options) {
    if (options.from_page && options.from_page === 'exhibitlist') {
      this.setData({
        exhibit_id: Number(options.exhibit_id),
        from_page: 'exhibitlist',
      })
      this.getPosterFromExhibit(Number(options.exhibit_id))

    } else if (options.from_page && options.from_page === 'package') {
      this.setData({
        package_id: Number(options.package_id),
        from_page: 'package',
      })
      this.getPosterFromPackage(Number(options.package_id))

    }
   
    
  }


});
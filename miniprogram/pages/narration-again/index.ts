import { getNarrowList } from "../../api/api";
import { calTimeTxt } from "../../utils/util";

Page({
  data: {
    loading: true,
    isCompleted: true, // 页面是否完成请求
    narrationList: [],
    exhibition_id: 0,
  },

  onLoad(options) {
    console.log('定制讲解页面加载', options);
    if(options.exhibition_id) {
      this.setData({
        exhibition_id: Number(options.exhibition_id),
      })
      this.getNarrationList();
    }
    this.initPage();
  },

  onShow() {
    // 页面显示时的逻辑
    this.getNarrationList();
  },

  onHide() {
    // 页面隐藏时的逻辑
  },

  onUnload() {
    // 页面卸载时的逻辑
  },

  /**
   * 初始化页面
   */
  initPage() {
    // 模拟页面完成请求
    setTimeout(() => {
      this.setData({ 
        loading: false,
        isCompleted: true // 标记页面完成
      });
    }, 1000);
  },

  async getNarrationList() {
    try {
      const res: any = await getNarrowList(this.data.exhibition_id);
      if(res.code === 0) {
        const narrations = res.narrations.map((item: any) => {
          const duration_fmt = calTimeTxt(item.duration);;
          return {
            id: item.id,
            count: 999,
            name: item.name,
            duration_fmt,
            image_url: item.url,
          }
        })
        const new_narr = narrations.concat([narrations[0]]);
        this.setData({
          narrationList: new_narr
        })
      }
    } catch (err) {
      console.log('获取讲解列表失败', err);
    }
  }
});

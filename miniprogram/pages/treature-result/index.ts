import { getRankingItemById } from '../../api/api';

type DetailRow = {
  label: string;
  value: string;
};

Page({
  data: {
    loading: false,
    navTitle: '展品详情',
    ranking: {} as any,
    item: {} as any,
    displayImage: '',
    detailRows: [] as DetailRow[],
  },

  onLoad(options: Record<string, string>) {
    const itemId = options.item_id || options.treature_id;
    if (!itemId) {
      wx.showToast({
        title: '缺少展品参数',
        icon: 'none',
      });
      return;
    }
    this.initPage(itemId);
  },

  async initPage(itemId: string) {
    this.setData({
      loading: true,
    });
    wx.showLoading({
      title: '加载中',
    });
    try {
      const res: any = await getRankingItemById(itemId);
      if (res && res.code === 0) {
        const ranking = res.ranking || {};
        const item = res.item || {};
        const displayImage =
          (item.photos_cdn && item.photos_cdn[0]) ||
          (item.photos && item.photos[0]) ||
          ranking.cover_image_cdn_url ||
          ranking.cover_image_url ||
          '';
        const detailRows: DetailRow[] = [
          { label: '朝代', value: item.dynasty },
          { label: '藏馆', value: item.museum_name || ranking.museum_name },
          { label: '展览', value: item.exhibition_name },
          { label: '展厅', value: item.hall_name },
          { label: '展位', value: item.location_in_hall },
        ].filter((row) => row.value);
        this.setData({
          navTitle: item.name || ranking.title || '展品详情',
          ranking,
          item,
          displayImage,
          detailRows,
          loading: false,
        });
      } else {
        this.setData({
          loading: false,
        });
        wx.showToast({
          title: '加载失败，请稍后再试',
          icon: 'none',
        });
      }
    } catch (error) {
      this.setData({
        loading: false,
      });
      wx.showToast({
        title: '加载失败，请稍后再试',
        icon: 'none',
      });
    } finally {
      wx.hideLoading();
    }
  },
});

import { getBubbleDetail, getBubbleList, getRankingItemById } from '../../api/api';

type DetailRow = {
  label: string;
  value: string;
};

type BubbleItem = {
  type: string;
  emoji: string;
  title: string;
  detail?: string | null;
};

Page({
  data: {
    loading: false,
    navTitle: '展品详情',
    ranking: {} as any,
    item: {} as any,
    displayImage: '',
    detailRows: [] as DetailRow[],
    bubbles: [] as BubbleItem[],
    bubbleDetail: null as null | { title: string; detail: string },
    bubbleDetailLoading: false,
    bubbleDetailVisible: false,
    bubbleArtifactName: '',
    bubbleArtifactType: '',
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
        const bubbleName = item.name || ranking.title;
        if (bubbleName) {
          this.fetchBubbles(bubbleName, item.artifact_type);
        }
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

  async fetchBubbles(artifactName: string, artifactType?: string) {
    try {
      const res: any = await getBubbleList({
        query: artifactName,
        artifact_type: artifactType,
        include_detail: false,
      });
      if (res && res.code === 0 && Array.isArray(res.bubbles)) {
        this.setData({
          bubbles: res.bubbles.slice(0, 3),
          bubbleArtifactName: res.artifact_name || artifactName,
          bubbleArtifactType: res.artifact_type || artifactType || '',
        });
      } else {
        this.setData({
          bubbles: [],
        });
      }
    } catch (error) {
      this.setData({
        bubbles: [],
      });
    }
  },

  async handleBubbleTap(e: WechatMiniprogram.BaseEvent) {
    const index = Number(e.currentTarget.dataset.index);
    const bubbles = (this.data as any).bubbles as BubbleItem[];
    const bubble = bubbles[index];
    if (!bubble) return;
    const requestId = ((this as any).bubbleDetailRequestId || 0) + 1;
    (this as any).bubbleDetailRequestId = requestId;
    this.setData({
      bubbleDetailLoading: true,
      bubbleDetailVisible: true,
      bubbleDetail: null,
    });
    try {
      const res: any = await getBubbleDetail({
        artifact_name: (this.data as any).bubbleArtifactName || (this.data as any).item.name || (this.data as any).ranking.title,
        artifact_type: (this.data as any).bubbleArtifactType,
        topic_type: bubble.type,
        bubble_title: bubble.title,
      });
      if ((this as any).bubbleDetailRequestId !== requestId || !(this.data as any).bubbleDetailVisible) {
        return;
      }
      if (res && res.code === 0 && res.detail) {
        this.setData({
          bubbleDetail: {
            title: res.bubble_title || bubble.title,
            detail: res.detail,
          },
          bubbleDetailLoading: false,
        });
      } else {
        this.setData({
          bubbleDetailLoading: false,
        });
        wx.showToast({
          title: '暂无详情',
          icon: 'none',
        });
      }
    } catch (error) {
      if ((this as any).bubbleDetailRequestId !== requestId || !(this.data as any).bubbleDetailVisible) {
        return;
      }
      this.setData({ bubbleDetailLoading: false });
      wx.showToast({
        title: '获取详情失败',
        icon: 'none',
      });
    }
  },

  closeBubbleDetail() {
    this.setData({
      bubbleDetailVisible: false,
      bubbleDetailLoading: false,
      bubbleDetail: null,
    });
  },
});

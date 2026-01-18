import { base_api, getBubbleList, getRankingItemById } from '../../api/api';
import { base_url, getLoginStatus } from '../../utils/util';

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
    bubbleDetailTitle: '',
    bubbleDetailText: '',
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
    this.abortBubbleStream();
    this.setData({
      bubbleDetailLoading: true,
      bubbleDetailVisible: true,
      bubbleDetailTitle: bubble.title,
      bubbleDetailText: '',
    });
    try {
      await this.startBubbleStream(
        {
          artifact_name: (this.data as any).bubbleArtifactName || (this.data as any).item.name || (this.data as any).ranking.title,
          artifact_type: (this.data as any).bubbleArtifactType,
          topic_type: bubble.type,
          bubble_title: bubble.title,
        },
        requestId,
      );
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
    this.abortBubbleStream();
    this.setData({
      bubbleDetailVisible: false,
      bubbleDetailLoading: false,
      bubbleDetailTitle: '',
      bubbleDetailText: '',
    });
  },

  async startBubbleStream(payload: { artifact_name: string; artifact_type?: string; topic_type: string; bubble_title: string }, requestId: number) {
    const token = await this.ensureToken();
    const url = `${base_url}/${base_api}/v2/bubble/detail/stream`;
    (this as any).bubbleStreamBuffer = '';
    (this as any).bubbleDetailPending = '';
    this.startTypewriter();
    const task = wx.request({
      url,
      method: 'POST',
      data: payload,
      responseType: 'text',
      enableChunked: true,
      header: {
        'content-type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      success: (res) => {
        if ((this as any).bubbleDetailRequestId !== requestId || !(this.data as any).bubbleDetailVisible) {
          return;
        }
        if (res && typeof res.data === 'string') {
          this.consumeBubbleChunk(`${res.data}\n`, requestId);
        }
        this.setData({ bubbleDetailLoading: false });
      },
      fail: () => {
        if ((this as any).bubbleDetailRequestId !== requestId || !(this.data as any).bubbleDetailVisible) {
          return;
        }
        this.setData({ bubbleDetailLoading: false });
        wx.showToast({
          title: '获取详情失败',
          icon: 'none',
        });
      },
    });
    (this as any).bubbleStreamTask = task;
    if (typeof task.onChunkReceived === 'function') {
      task.onChunkReceived((res) => {
        if ((this as any).bubbleDetailRequestId !== requestId || !(this.data as any).bubbleDetailVisible) {
          return;
        }
        this.consumeBubbleChunk(this.decodeChunk(res.data), requestId);
      });
    }
  },

  decodeChunk(data: ArrayBuffer) {
    try {
      if (typeof TextDecoder !== 'undefined') {
        return new TextDecoder('utf-8').decode(data);
      }
    } catch (error) {
      return '';
    }
    const uint8 = new Uint8Array(data);
    let result = '';
    for (let i = 0; i < uint8.length; i += 1) {
      result += String.fromCharCode(uint8[i]);
    }
    try {
      return decodeURIComponent(escape(result));
    } catch (error) {
      return result;
    }
  },

  consumeBubbleChunk(chunkText: string, requestId: number) {
    if (!chunkText) return;
    const buffer = ((this as any).bubbleStreamBuffer || '') + chunkText;
    const lines = buffer.split('\n');
    (this as any).bubbleStreamBuffer = lines.pop() || '';
    lines.forEach((line: string) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      try {
        const payload = JSON.parse(trimmed);
        if (payload.error) {
          this.setData({ bubbleDetailLoading: false });
          wx.showToast({
            title: payload.error,
            icon: 'none',
          });
          return;
        }
        if (payload.bubble_title) {
          this.setData({
            bubbleDetailTitle: payload.bubble_title,
          });
        }
        if (payload.detail) {
          (this as any).bubbleDetailPending =
            ((this as any).bubbleDetailPending || '') + payload.detail;
          this.startTypewriter();
        }
      } catch (error) {
        return;
      }
    });
    if ((this as any).bubbleDetailRequestId !== requestId) {
      return;
    }
  },

  startTypewriter() {
    if ((this as any).bubbleTypeTimer) {
      return;
    }
    (this as any).bubbleTypeTimer = setInterval(() => {
      if (!(this.data as any).bubbleDetailVisible) {
        this.stopTypewriter();
        return;
      }
      const pending = (this as any).bubbleDetailPending || '';
      if (!pending) {
        if (!(this.data as any).bubbleDetailLoading) {
          this.stopTypewriter();
        }
        return;
      }
      const nextChar = pending.slice(0, 1);
      (this as any).bubbleDetailPending = pending.slice(1);
      this.setData({
        bubbleDetailText: ((this.data as any).bubbleDetailText || '') + nextChar,
      });
    }, 30);
  },

  stopTypewriter() {
    if ((this as any).bubbleTypeTimer) {
      clearInterval((this as any).bubbleTypeTimer);
      (this as any).bubbleTypeTimer = null;
    }
  },

  abortBubbleStream() {
    if ((this as any).bubbleStreamTask) {
      try {
        (this as any).bubbleStreamTask.abort();
      } catch (error) {
        // ignore abort error
      }
      (this as any).bubbleStreamTask = null;
    }
    (this as any).bubbleStreamBuffer = '';
    (this as any).bubbleDetailPending = '';
    this.stopTypewriter();
  },

  async ensureToken() {
    let token = wx.getStorageSync('token');
    if (!token) {
      const res: any = await getLoginStatus();
      token = res.token;
    }
    return token;
  },
});

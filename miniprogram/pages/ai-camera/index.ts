import { base_api, appendExhibitImage, getBubbleList } from '../../api/api';
import { base_url, getLoginStatus, getLocation, calTimeDurationTxt } from '../../utils/util';
const BETA_MODE_STORAGE_KEY = 'BetaModeEnabled';

type BubbleItem = {
  type: string;
  emoji: string;
  title: string;
  detail?: string | null;
};

Page({
  data: {
    previewImage: '',
    isRecognizing: false,
    firstLoad: true,
    exhibitResult: null as null | { name: string; image: string },
    recognitionResult: null as null | { title: string; desc: string },
    recognitionError: '',
    lastPhoto: '',
    showResultPage: false,
    exhibitDetail: {} as any,
    showFeedbackForm: false,
    feedbackText: '',
    feedbackImages: [] as string[],
    exhibitImageId: null as number | null,
    submittingFeedback: false,
    dailyListenExhibit: null as any,
    showFeedbackSuccessOverlay: false,
    search_res: {} as any,
    showMatchScore: false,
    compressCanvasWidth: 1,
    compressCanvasHeight: 1,
    bubbles: [] as BubbleItem[],
    bubbleDetailTitle: '',
    bubbleDetailText: '',
    bubbleDetailLoading: false,
    bubbleDetailVisible: false,
    bubbleArtifactName: '',
    bubbleArtifactType: '',
    otherResults: [] as any[],
    showOtherResults: false,
    allArtifacts: [] as any[],
  },

  onShow() {
    if (this.data.firstLoad) {
      this.handleTakePhoto();
      this.setData({
        firstLoad: false,
      })
    }
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2,
      });
    }
    this.updateMatchScoreVisibility();
  },

  onHide() {
    this.stopDailyListenPlayback();
    this.abortBubbleStream();
  },

  onUnload() {
    this.stopDailyListenPlayback();
    this.abortBubbleStream();
  },

  handleTakePhoto() {
    if (this.data.isRecognizing) {
      return;
    }
    this.chooseMedia(['camera','album']);
  },

  updateMatchScoreVisibility() {
    const enabled = !!wx.getStorageSync(BETA_MODE_STORAGE_KEY);
    this.setData({
      showMatchScore: enabled,
    });
  },

  handleOpenAlbum() {
    if (this.data.isRecognizing) {
      return;
    }
    this.chooseMedia(['album', 'camera']);
  },


  chooseMedia(sourceType: Array<'album' | 'camera'>) {
    const that = this;
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType,
      camera: 'back',
      success: async (res) => {
        const file = res.tempFiles?.[0];
        if (!file) {
          return;
        }
        if (file.fileType && file.fileType !== 'image') {
          wx.showToast({
            title: '请选取图片',
            icon: 'none',
          });
          return;
        }
        const filePath = file.tempFilePath;
        this.setData({
          previewImage: filePath,
          lastPhoto: filePath,
          recognitionResult: null,
          recognitionError: '',
          exhibitResult: null,
          showResultPage: false,
          exhibitDetail: null,
          showFeedbackForm: false,
          feedbackText: '',
          feedbackImages: [],
          submittingFeedback: false,
          dailyListenExhibit: null,
          isRecognizing: true,
          bubbles: [],
          bubbleDetailTitle: '',
          bubbleDetailText: '',
          bubbleDetailLoading: false,
          bubbleDetailVisible: false,
          otherResults: [],
          showOtherResults: false,
          allArtifacts: [],
        });

        let uploadPath = filePath;
        try {
          uploadPath = await this.ensureImageUnderLimit(filePath);
        } catch (error) {
          wx.showToast({
            title: '处理图片失败，请重试',
            icon: 'none',
          });
          uploadPath = filePath;
        }
        this.processImage(uploadPath);
      },
      fail: (error) => {
        if (error.errMsg.includes('auth deny')) {
          // 用户拒绝了相机权限
          wx.showToast({
            title: '需要相机权限',
            icon: 'none'
          })
        }
        wx.navigateBack();
        if (error?.errMsg?.includes('cancel')) {
          return;
        }
        wx.showToast({
          title: '无法打开相机/相册',
          icon: 'none',
        });
      },
    });
  },

  async getFileInfoAsync(filePath: string) {
    return new Promise<WechatMiniprogram.GetFileInfoSuccessCallbackResult>((resolve, reject) => {
      const fs = wx.getFileSystemManager();
      fs.getFileInfo({
        filePath,
        success: resolve,
        fail: reject,
      });
    });
  },

  async getImageInfoAsync(src: string) {
    return new Promise<WechatMiniprogram.GetImageInfoSuccessCallbackResult>((resolve, reject) => {
      wx.getImageInfo({
        src,
        success: resolve,
        fail: reject,
      });
    });
  },

  async updateCanvasSize(width: number, height: number) {
    return new Promise<void>((resolve) => {
      this.setData(
        {
          compressCanvasWidth: width,
          compressCanvasHeight: height,
        },
        () => resolve(),
      );
    });
  },

  async compressImageToQuality(src: string, quality: number) {
    return new Promise<WechatMiniprogram.CompressImageSuccessCallbackResult>((resolve, reject) => {
      wx.compressImage({
        src,
        quality,
        success: resolve,
        fail: reject,
      });
    });
  },

  async ensureImageUnderLimit(
    filePath: string,
    maxSize: number = 1.8 * 1024 * 1024,
    attempt: number = 0,
  ) {
    const fileInfo = await this.getFileInfoAsync(filePath);
    if (!fileInfo || typeof fileInfo.size !== 'number') {
      return filePath;
    }
    if (fileInfo.size <= maxSize) {
      return filePath;
    }
    const qualities = [90, 80, 70, 60, 50, 40, 30, 25, 20, 15, 10, 5];
    let currentPath = filePath;
    for (const quality of qualities) {
      const compressed = await this.compressImageToQuality(currentPath, quality);
      if (!compressed?.tempFilePath) {
        continue;
      }
      const compressedInfo = await this.getFileInfoAsync(compressed.tempFilePath);
      if (!compressedInfo || typeof compressedInfo.size !== 'number') {
        continue;
      }
      currentPath = compressed.tempFilePath;
      if (compressedInfo.size <= maxSize) {
        return currentPath;
      }
    }
    const finalInfo = await this.getFileInfoAsync(currentPath);
    if (
      attempt < 1 &&
      finalInfo &&
      typeof finalInfo.size === 'number' &&
      finalInfo.size > maxSize
    ) {
      try {
        const resized = await this.resizeImageToFit(currentPath);
        return this.ensureImageUnderLimit(resized, maxSize, attempt + 1);
      } catch (resizeError) {
      }
    }
    return currentPath;
  },

  async resizeImageToFit(
    filePath: string,
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 70,
  ) {
    const imageInfo = await this.getImageInfoAsync(filePath);
    const sourceWidth = imageInfo?.width || maxWidth;
    const sourceHeight = imageInfo?.height || maxHeight;
    const ratio = Math.min(1, maxWidth / sourceWidth, maxHeight / sourceHeight);
    const width = Math.max(1, Math.round(sourceWidth * ratio));
    const height = Math.max(1, Math.round(sourceHeight * ratio));
    await this.updateCanvasSize(width, height);
    return new Promise<string>((resolve, reject) => {
      const ctx = wx.createCanvasContext('compressCanvas', this);
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(filePath, 0, 0, width, height);
      ctx.draw(false, () => {
        wx.canvasToTempFilePath({
          canvasId: 'compressCanvas',
          width,
          height,
          destWidth: width,
          destHeight: height,
          quality: Math.min(Math.max(quality / 100, 0.05), 1),
          component: this,
          success: (res) => {
            resolve(res.tempFilePath);
          },
          fail: (error) => {
            reject(error);
          },
        });
      });
    });
  },
  async processImage(filePath: string) {
    this.setData({
      isRecognizing: true,
    });
    try {
      const response = await this.uploadImage(filePath);
      
      const { code, data, message } = response || {};
      if (code !== undefined && code !== 0) {
        throw new Error(message || '识别失败');
      }
      const artifacts = Array.isArray(data?.artifacts) ? data.artifacts.slice(0, 4) : [];
      const payload = artifacts[0] || {};
      if (!payload.name) {
        throw new Error('识别失败');
      }
      const title = payload.name || '识别结果';
      const desc =
        payload.description;
      const detailContentParts: string[] = [];
      if (payload.dynasty) {
        detailContentParts.push('时期：'+payload.dynasty);
      }
      if (payload.museum) {
        detailContentParts.push('收藏在'+payload.museum+'。');
      }
      const detailContent = detailContentParts.length
        ? `${detailContentParts.join('，')}\n描述：${desc}`
        : desc;
      const hasPackageAudio = !!payload.package_audio_url;
      const audioInfo = hasPackageAudio
        ? {
            // title: search_res.package_audio_title || exhibit.name || title,
            // duration: search_res.package_audio_duration || '00:00',
            // cover: search_res.uploaded_image_url,
            // audio_url: search_res.package_audio_url,
            // id: search_res.package_audio_id || exhibit.id || 0,
          }
        : null;
      const exhibit_image_id =
        payload.image_id ||
        null;
      this.setData({
        recognitionResult: {
          title,
          desc,
        },
        recognitionError: '',
        exhibitResult: data?.user_image_url
          ? {
              name: payload.name || title,
              image: data.user_image_url,
            }
          : null,
        showResultPage: true,
        exhibitDetail: title
          ? {
              name: title,
              image_url: payload.image_url || data?.cutout_image_url || data?.user_image_url || this.data.previewImage,
              description: desc,
              content: detailContent,
              audio: audioInfo || undefined,
              score: payload.score,
            }
          : null,
        exhibitImageId: exhibit_image_id,
        dailyListenExhibit: audioInfo
          ? {
              // id: audioInfo.id,
              // name: audioInfo.title,
              // image_url: audioInfo.cover,
              // // exhibition_name: exhibit.name || title,
              // duration_fmt: calTimeDurationTxt(audioInfo.duration),
              // audio_url: audioInfo.audio_url,
            }
          : null,
        otherResults: artifacts.slice(1, 4).map((item: any) => ({
          ...item,
          scorePercent: Math.round((item.score || 0) * 100),
        })),
        showOtherResults: false,
        allArtifacts: artifacts,
      });
      if (title) {
        this.fetchBubbles(title);
      }
    } catch (error: any) {
      const errMsg = error?.message || error?.errMsg || '识别失败，请稍后重试';
      this.setData({
        recognitionError: errMsg,
        recognitionResult: null,
        exhibitResult: null,
        showResultPage: false,
        exhibitDetail: null,
        exhibitImageId: null,
        showFeedbackForm: false,
        feedbackText: '',
        feedbackImages: [],
        submittingFeedback: false,
        dailyListenExhibit: null,
        bubbles: [],
        bubbleDetailTitle: '',
        bubbleDetailText: '',
        bubbleDetailLoading: false,
        bubbleDetailVisible: false,
        otherResults: [],
        showOtherResults: false,
        allArtifacts: [],
      });
      if (!error?.errMsg?.includes('cancel')) {
        wx.showToast({
          title: '识别失败，请稍后重试',
          icon: 'none',
        });
      }
    } finally {
      this.setData({
        isRecognizing: false,
      });
    }
  },

  parseUploadResponse(rawData: any) {
    if (typeof rawData === 'object') {
      return rawData;
    }
    if (typeof rawData !== 'string') {
      return {};
    }
    try {
      return JSON.parse(rawData);
    } catch (error) {
      try {
        const decoded = decodeURIComponent(escape(rawData));
        return JSON.parse(decoded);
      } catch (decodeError) {
        return {
          message: rawData,
        };
      }
    }
  },

  async getLatestLatLng() {
    try {
      return await getLocation();
    } catch (error) {
      const latitude = wx.getStorageSync('latitude');
      const longitude = wx.getStorageSync('longitude');
      return {
        latitude,
        longitude,
      };
    }
  },

  async uploadImage(filePath: string) {
    const { token } = await getLoginStatus();
    // @ts-expect-error
    const { latitude, longitude } = await this.getLatestLatLng();
    return new Promise<any>((resolve, reject) => {
      wx.uploadFile({
        url: `${base_url}/api/v1/artifactCheck`,
        header: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',  
          Authorization: token ? `Bearer ${token}` : '',
        },
        filePath,
        name: 'file',
        formData: {
          ...(latitude !== undefined && latitude !== null ? { lat: `${latitude}` } : {}),
          ...(longitude !== undefined && longitude !== null ? { lng: `${longitude}` } : {}),
        },
        success: (res) => {
          try {
            const data = this.parseUploadResponse(res.data);
            resolve(data);
          } catch (error) {
            reject(error);
          }
        },
        fail: reject,
      });
    });
  },

  handleOpenMore() {
    this.setData({
      showFeedbackForm: true,
      showResultPage: false,
    });
  },

  handleOpenOtherResults() {
    if (!this.data.otherResults.length) {
      wx.showToast({
        title: '暂无其他结果',
        icon: 'none',
      });
      return;
    }
    this.setData({
      showOtherResults: true,
    });
  },

  closeOtherResults() {
    this.setData({
      showOtherResults: false,
    });
  },

  handleSelectOtherResult(e: WechatMiniprogram.BaseEvent) {
    const index = Number(e.currentTarget.dataset.index);
    const artifact = (this.data.otherResults || [])[index];
    if (!artifact) {
      this.setData({ showOtherResults: false });
      return;
    }
    this.abortBubbleStream();
    const title = artifact.name || '识别结果';
    const desc = artifact.description ? ('描述：'+ artifact.description):'' ;
    const detailContentParts: string[] = [];
    if (artifact.dynasty) {
      detailContentParts.push(`时期：${artifact.dynasty}`);
    }
    if (artifact.museum) {
      detailContentParts.push(`收藏在${artifact.museum}。`);
    }
    const detailContent = detailContentParts.length
      ? `${detailContentParts.join('，')}${desc}`
      : desc;
    this.setData({
      exhibitDetail: {
        name: title,
        image_url: artifact.image_url || this.data.exhibitDetail?.image_url || this.data.previewImage,
        description: desc,
        content: detailContent,
        score: artifact.score,
      },
      exhibitImageId: artifact.image_id || null,
      showOtherResults: false,
      bubbles: [],
      bubbleDetailTitle: '',
      bubbleDetailText: '',
      bubbleDetailLoading: false,
      bubbleDetailVisible: false,
    });
    this.fetchBubbles(title);
  },

  handleCancelFeedback() {
    this.setData({
      showFeedbackForm: false,
      showResultPage: true,
    });
  },

  handleFeedbackInput(e: WechatMiniprogram.TextareaInput) {
    this.setData({
      feedbackText: e.detail.value,
    });
  },

  handleAddFeedbackImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const file = res.tempFiles?.[0];
        if (!file) return;
        this.setData({
          feedbackImages: [...this.data.feedbackImages, file.tempFilePath],
        });
      },
    });
  },

  handleRemoveFeedbackImage(e: WechatMiniprogram.BaseEvent) {
    const { index } = e.currentTarget.dataset || {};
    if (index === undefined) return;
    const next = [...this.data.feedbackImages];
    next.splice(index, 1);
    this.setData({
      feedbackImages: next,
    });
  },

  async uploadFeedbackImage(filePath: string) {
    const { token } = await getLoginStatus();
    return new Promise<string>((resolve, reject) => {
      wx.uploadFile({
        url: `${base_url}/${base_api}/v1/images/simple`,
        header: {
          'Content-Type': 'multipart/form-data',
          Authorization: token ? `Bearer ${token}` : '',
        },
        filePath,
        name: 'file',
        success: (res) => {
          try {
            const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
            if ((data.code === 0 && data.url) || data.url) {
              resolve(data.url);
            } else {
              reject(new Error((data && data.message) || '上传失败'));
            }
          } catch (error) {
            reject(error);
          }
        },
        fail: reject,
      });
    });
  },

  async uploadFeedbackImages() {
    const images = this.data.feedbackImages || [];
    const result: string[] = [];
    for (const item of images) {
      if (!item) continue;
      if (/^(https?:)?\/\//.test(item) || item.startsWith('/storage/')) {
        result.push(item);
      } else {
        const uploaded = await this.uploadFeedbackImage(item);
        result.push(uploaded);
      }
    }
    return result;
  },

  async handleSubmitFeedback() {
    if (this.data.submittingFeedback) {
      return;
    }
    if (!this.data.exhibitImageId) {
      wx.showToast({
        title: '缺少图像ID',
        icon: 'none',
      });
      return;
    }
    if (!this.data.feedbackImages.length) {
      wx.showToast({
        title: '请先拍摄展品标签',
        icon: 'none',
      });
      return;
    }
    this.setData({
      submittingFeedback: true,
    });
    try {
      const appended_images = await this.uploadFeedbackImages();
      const appended_text = this.data.feedbackText.trim();
      const response: any = await appendExhibitImage(this.data.exhibitImageId, {
        appended_text,
        appended_images,
      });
      if (!response || response.code !== 0) {
        throw new Error((response && response.message) || '提交失败');
      }
      wx.showToast({
        title: '提交成功',
        icon: 'success',
      });
      this.setData({
        showFeedbackForm: false,
        showResultPage: true,
        feedbackText: '',
        feedbackImages: [],
        showFeedbackSuccessOverlay: true,
      });
    } catch (error) {
      wx.showToast({
        title: '提交失败，请稍后重试',
        icon: 'none',
      });
    } finally {
      this.setData({
        submittingFeedback: false,
      });
    }
  },

  handlePlayDailyListen() {
    // reserved for analytics or extra logic
  },

  stopDailyListenPlayback() {
    const player = this.selectComponent('#dailyListenPlayer') as any;
    if (player && typeof player.handleClickPause === 'function') {
      player.handleClickPause();
    }
  },

  async fetchBubbles(artifactName: string, artifactType?: string) {
    try {
      const res: any = await getBubbleList({
        query: artifactName,
        artifact_type: artifactType,
        include_detail: false,
      });
      if (res && Array.isArray(res.bubbles)) {
        this.setData({
          bubbles: res.bubbles.slice(0, 3),
          bubbleArtifactName: res.artifact_name || artifactName,
          bubbleArtifactType: res.artifact_type || artifactType || '',
        });
      } else {
        this.setData({ bubbles: [] });
      }
    } catch (error) {
      this.setData({ bubbles: [] });
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
          artifact_name: (this.data as any).bubbleArtifactName || (this.data as any).exhibitDetail?.name,
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
    const url = `${base_url}/${base_api}/v2/bubble/llm/detail/stream`;
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

  normalizeStreamText(text: string) {
    if (!text) return '';
    try {
      const decoded = decodeURIComponent(escape(text));
      return decoded || text;
    } catch (error) {
      return text;
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
        const detailText = this.normalizeStreamText(payload.detail || payload.response || '');
        if (detailText) {
          (this as any).bubbleDetailPending =
            ((this as any).bubbleDetailPending || '') + detailText;
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

  handleFeedbackSuccessReturn() {
    this.setData({
      showFeedbackSuccessOverlay: false,
    });
    wx.navigateBack();
  },

  handleShareAppMessage() {
    return {
      title: 'AI拍摄文物，一拍即识',
      path: '/pages/ai-camera/index',
    };
  },
});

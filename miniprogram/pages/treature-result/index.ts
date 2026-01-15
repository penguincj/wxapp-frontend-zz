import { base_api, getRankingById } from '../../api/api';
import { base_url, getLoginStatus, getLocation, calTimeDurationTxt } from '../../utils/util';

Page({
  data: {
    previewImage: '',
    firstLoad: true,
    exhibitResult: null as null | { name: string; image: string },
    recognitionResult: null as null | { title: string; desc: string },
    recognitionError: '',
    lastPhoto: '',
    exhibitDetail: {} as any,
    showFeedbackForm: false,
    feedbackText: '',
    feedbackImages: [] as string[],
    exhibitImageId: null as number | null,
    submittingFeedback: false,
    dailyListenExhibit: null as any,
    showFeedbackSuccessOverlay: false,
    search_res: {} as any,
    compressCanvasWidth: 1,
    compressCanvasHeight: 1,
  },

  onShow() {
   
  },

  onHide() {
    this.stopDailyListenPlayback();
  },

  onUnload() {
    this.stopDailyListenPlayback();
  },

  handleConfirmExhibit() {
    wx.showToast({
      title: '太棒了，你离鉴藏家又更进一步！',
      icon: 'none',
      duration: 3000,
    })
  },

  handleCloseExhibitOverlay() {
    wx.showToast({
      title: '感谢您的反馈建议～',
      icon: 'none',
      duration: 3000,
    })
    // this.handleOpenMore();
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
    
    try {
      const response = await this.uploadImage(filePath);
      
      const { code, artifact, message } = response || {};
      if (code !== undefined && code !== 0 && !artifact) {
        throw new Error(message || '识别失败');
      }
      const payload = artifact || {};
      const title = payload.name || '识别结果';
      const desc =
        payload.description ||
        'AI识别完成';
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
        exhibitResult: payload.uploaded_image_url
          ? {
              name: payload.name || title,
              image: payload.uploaded_image_url,
            }
          : null,
        exhibitDetail: title
          ? {
              name: title,
              image_url: payload.uploaded_image_url || this.data.previewImage,
              description: desc,
              content: detailContent,
              audio: audioInfo || undefined,
              score: artifact.score,
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
      });
    } catch (error: any) {
      const errMsg = error?.message || error?.errMsg || '识别失败，请稍后重试';
      this.setData({
        recognitionError: errMsg,
        recognitionResult: null,
        exhibitResult: null,
        exhibitDetail: null,
        exhibitImageId: null,
        showFeedbackForm: false,
        feedbackText: '',
        feedbackImages: [],
        submittingFeedback: false,
        dailyListenExhibit: null,
      });
      if (!error?.errMsg?.includes('cancel')) {
        wx.showToast({
          title: '识别失败，请稍后重试',
          icon: 'none',
        });
      }
    } finally {
     
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
        url: `${base_url}/${base_api}/v1/imageSearch`,
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

  handlePlayDailyListen() {
    // reserved for analytics or extra logic
  },

  stopDailyListenPlayback() {
    const player = this.selectComponent('#dailyListenPlayer') as any;
    if (player && typeof player.handleClickPause === 'function') {
      player.handleClickPause();
    }
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

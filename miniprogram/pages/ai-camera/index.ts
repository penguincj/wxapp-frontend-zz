import { base_api, appendExhibitImage } from '../../api/api';
import { base_url, getLoginStatus, getLocation, calTimeDurationTxt } from '../../utils/util';


Page({
  data: {
    previewImage: '',
    isRecognizing: false,
    firstLoad: true,
    exhibitResult: null as null | { name: string; image: string },
    showExhibitOverlay: false,
    recognitionResult: null as null | { title: string; desc: string },
    recognitionError: '',
    lastPhoto: '',
    showResultPage: false,
    exhibitDetail: null as null | {
      name: string;
      image_url: string;
      description: string;
      content: string;
      audio?: { title: string; duration: string; cover: string };
    },
    showFeedbackForm: false,
    feedbackText: '',
    feedbackImages: [] as string[],
    exhibitImageId: null as number | null,
    submittingFeedback: false,
    dailyListenExhibit: null as any,
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
      // this.handleTakePhoto();

    }
  },

  handleTakePhoto() {
    if (this.data.isRecognizing) {
      return;
    }
    this.chooseMedia(['camera', 'album']);
  },

  handleOpenAlbum() {
    if (this.data.isRecognizing) {
      return;
    }
    this.chooseMedia(['album', 'camera']);
  },


  chooseMedia(sourceType: Array<'album' | 'camera'>) {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image', 'video'],
      sourceType,
      maxDuration: 30,
      camera: 'back',
      success: (res) => {
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
          showExhibitOverlay: false,
          showResultPage: false,
          exhibitDetail: null,
          showFeedbackForm: false,
          feedbackText: '',
          feedbackImages: [],
          submittingFeedback: false,
          dailyListenExhibit: null,
        });
        this.processImage(filePath);
      },
      fail: (error) => {
        if (error?.errMsg?.includes('cancel')) {
          return;
        }
        console.error('chooseMedia error', error);
        wx.showToast({
          title: '无法打开相机/相册',
          icon: 'none',
        });
      },
    });
  },

  async processImage(filePath: string) {
    this.setData({
      isRecognizing: true,
    });
    try {
      const response = await this.uploadImage(filePath);
      const { code, data, result, message } = response || {};
      if (code !== undefined && code !== 0 && !data && !result) {
        throw new Error(message || '识别失败');
      }
      const payload = data || result || response || {};
      const title = payload.name || payload.title || payload.label || '识别结果';
      const desc =
        payload.description ||
        payload.desc ||
        payload.text ||
        payload.result ||
        payload.message ||
        'AI识别完成';
      const exhibit = payload.exhibit || {};
      const search_res = payload || {};
      const hasPackageAudio = !!search_res.package_audio_url;
      const audioInfo = hasPackageAudio
        ? {
            title: search_res.package_audio_title || exhibit.name || title,
            duration: search_res.package_audio_duration || '00:00',
            cover: search_res.package_audio_cover || exhibit.image_url,
            audio_url: search_res.package_audio_url,
            id: search_res.package_audio_id || exhibit.id || 0,
          }
        : null;
      const exhibit_image_id =
        payload.exhibit_image_id ||
        null;
      this.setData({
        recognitionResult: {
          title,
          desc,
        },
        recognitionError: '',
        exhibitResult: exhibit.image_url
          ? {
              name: exhibit.name || title,
              image: exhibit.image_url,
            }
          : null,
        showExhibitOverlay: !!exhibit.image_url,
        exhibitDetail: exhibit.image_url
          ? {
              name: exhibit.name || title,
              image_url: exhibit.image_url,
              description: exhibit.description || desc,
              content: search_res.is_llm ? exhibit.description : search_res.package_audio_content,
              audio: audioInfo || undefined,
            }
          : null,
        exhibitImageId: exhibit_image_id,
        dailyListenExhibit: audioInfo
          ? {
              id: audioInfo.id,
              name: audioInfo.title,
              image_url: audioInfo.cover,
              // exhibition_name: exhibit.name || title,
              duration_fmt: calTimeDurationTxt(audioInfo.duration),
              audio_url: audioInfo.audio_url,
            }
          : null,
      });
    } catch (error: any) {
      const errMsg = error?.message || error?.errMsg || '识别失败，请稍后重试';
      this.setData({
        recognitionError: errMsg,
        recognitionResult: null,
        exhibitResult: null,
        showExhibitOverlay: false,
        showResultPage: false,
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
        console.warn('无法解析上传返回数据', rawData, decodeError);
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
        url: `${base_url}/${base_api}/v1/imageSearchAuto`,
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
            // debugger
            resolve(data);
          } catch (error) {
            reject(error);
          }
        },
        fail: reject,
      });
    });
  },

  handleRetakeExhibit() {
    this.setData({
      showExhibitOverlay: false,
    });
    this.handleTakePhoto();
  },

  handleConfirmExhibit() {
    this.setData({
      showExhibitOverlay: false,
      showResultPage: true,
    });
  },

  handleCloseExhibitOverlay() {
    this.setData({
      showExhibitOverlay: false,
    });
  },

  handleOpenMore() {
    this.setData({
      showFeedbackForm: true,
      showResultPage: false,
    });
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
        url: `${base_url}/${base_api}/v1/storage/image`,
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
    if (!this.data.feedbackText.trim() && this.data.feedbackImages.length === 0) {
      wx.showToast({
        title: '请填写内容或上传图片',
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
      });
    } catch (error) {
      console.error('handleSubmitFeedback error', error);
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

  handleShareAppMessage() {
    return {
      title: 'AI拍摄文物，一拍即识',
      path: '/pages/ai-camera/index',
    };
  },
});

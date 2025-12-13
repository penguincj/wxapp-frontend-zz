import { base_api, appendExhibitImage } from '../../api/api';
import { base_url, getLoginStatus, getLocation, calTimeDurationTxt } from '../../utils/util';
const BETA_MODE_STORAGE_KEY = 'BetaModeEnabled';


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
  },

  onUnload() {
    this.stopDailyListenPlayback();
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
        });
        this.processImage(filePath);
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
        showResultPage: true,
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
      console.log(error)
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

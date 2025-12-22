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
    artifactList: [] as any[],
    userImageUrl: '',
    feedbackModalVisible: false,
    feedbackModalContent: '',
    feedbackModalIsMatch: 1,
    feedbackModalMatchedId: null as number | null,
    feedbackModalSubmitting: false,
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

  handlePreviewImage(e: WechatMiniprogram.BaseEvent) {
    const imageUrl = e.currentTarget?.dataset?.imageUrl;
    if (!imageUrl) {
      return;
    }
    const urls = Array.isArray(e.currentTarget?.dataset?.imageList)
      ? e.currentTarget.dataset.imageList
      : [imageUrl];
    wx.previewImage({
      current: imageUrl,
      urls,
    });
  },

  handleConfirmExhibitFeedback() {
    const firstMatchId = this.data.artifactList?.[0]?.image_id || null;
    this.setData({
      feedbackModalVisible: true,
      feedbackModalContent: '',
      feedbackModalIsMatch: 1,
      feedbackModalMatchedId: firstMatchId,
    });
  },

  handleCancelFeedbackModal() {
    this.setData({
      feedbackModalVisible: false,
    });
  },

  handleFeedbackModalInput(e: WechatMiniprogram.TextareaInput) {
    this.setData({
      feedbackModalContent: e.detail.value,
    });
  },

  handleFeedbackModalToggleMatch(e: WechatMiniprogram.BaseEvent) {
    const value = Number(e.currentTarget.dataset?.value ?? 0);
    this.setData({
      feedbackModalIsMatch: value,
      feedbackModalMatchedId: value === 1 ? this.data.artifactList?.[0]?.image_id || null : null,
    });
  },

  handleFeedbackModalSelectArtifact(e: WechatMiniprogram.BaseEvent) {
    const id = e.currentTarget.dataset?.id;
    if (id === undefined) {
      return;
    }
    this.setData({
      feedbackModalMatchedId: Number(id),
    });
  },

  async handleSubmitFeedbackReport() {
    if (this.data.feedbackModalSubmitting) {
      return;
    }
    if (!this.data.userImageUrl) {
      wx.showToast({
        title: '缺少用户照片信息，无法上报',
        icon: 'none',
      });
      return;
    }
    const payload: Record<string, any> = {
      user_image_url: this.data.userImageUrl,
    };
    if (typeof this.data.feedbackModalIsMatch === 'number') {
      payload.is_match = this.data.feedbackModalIsMatch;
    }
    if (this.data.feedbackModalIsMatch === 1 && this.data.feedbackModalMatchedId) {
      payload.matched_image_id = this.data.feedbackModalMatchedId;
    }
    const trimmed = this.data.feedbackModalContent.trim();
    if (trimmed) {
      payload.content = trimmed;
    }
    this.setData({
      feedbackModalSubmitting: true,
    });
    try {
      const { token } = await getLoginStatus();
      await new Promise<void>((resolve, reject) => {
        wx.request({
          url: `${base_url}/${base_api}/v1/artifactFeedback`,
          method: 'POST',
          header: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
          data: payload,
          success: (res) => {
            if (res.data?.code === 0) {
              resolve();
            } else {
              reject(new Error(res.data?.message || '上报失败'));
            }
          },
          fail: reject,
        });
      });
      wx.showToast({
        title: '上报成功',
        icon: 'success',
      });
      this.setData({
        feedbackModalVisible: false,
      });
    } catch (error: any) {
      console.error('handleSubmitFeedbackReport error', error);
      wx.showToast({
        title: (error && error.message) || '上报失败，请稍后重试',
        icon: 'none',
      });
    } finally {
      this.setData({
        feedbackModalSubmitting: false,
      });
    }
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
          artifactList: [],
          userImageUrl: '',
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
      
      const { code, data, artifact, message } = response || {};
      if (code !== undefined && code !== 0) {
        throw new Error(message || '识别失败');
      }
      const artifactsFromData = Array.isArray(data?.artifacts) ? data.artifacts : [];
      const fallbackArtifacts = artifact ? [artifact] : [];
      const rawArtifacts = artifactsFromData.length ? artifactsFromData : fallbackArtifacts;
      const normalizedArtifacts = (rawArtifacts || []).filter(Boolean).map((item: any) => ({
        ...item,
        image_url: item.image_url || item.uploaded_image_url || this.data.previewImage,
        description: item.description || '',
      }));
      if (!normalizedArtifacts.length) {
        throw new Error(message || '识别失败');
      }
      const payload = normalizedArtifacts[0];
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
      const audioInfo = null;
      const exhibit_image_id =
        payload.image_id ||
        null;
      const exhibitImageUrl = payload.uploaded_image_url || payload.image_url;
      this.setData({
        recognitionResult: {
          title,
          desc,
        },
        recognitionError: '',
        exhibitResult: exhibitImageUrl
          ? {
              name: payload.name || title,
              image: exhibitImageUrl,
            }
          : null,
        showResultPage: Boolean(normalizedArtifacts.length),
        exhibitDetail: title
          ? {
              name: title,
              image_url: exhibitImageUrl || this.data.previewImage,
              description: desc,
              content: detailContent,
              audio: audioInfo || undefined,
              score: payload.score,
              cutout_image_url: data?.cutout_image_url || '',
              user_image_url: data?.user_image_url || this.data.previewImage,
              source: payload.source,
            }
          : null,
        exhibitImageId: exhibit_image_id,
        dailyListenExhibit: null,
        artifactList: normalizedArtifacts,
        userImageUrl: data?.user_image_url || this.data.previewImage || '',
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
        artifactList: [],
        userImageUrl: '',
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
        url: `${base_url}/${base_api}/v1/artifactCheck`,
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

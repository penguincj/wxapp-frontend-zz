import { base_api } from '../../api/api';
import { base_url, getLoginStatus } from '../../utils/util';


Page({
  data: {
    previewImage: '',
    isRecognizing: false,
    firstLoad: true,
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
      this.setData({
        recognitionResult: {
          title,
          desc,
        },
        recognitionError: '',
      });
    } catch (error: any) {
      const errMsg = error?.message || error?.errMsg || '识别失败，请稍后重试';
      this.setData({
        recognitionError: errMsg,
        recognitionResult: null,
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

  async uploadImage(filePath: string) {
    const { token } = await getLoginStatus();
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

  handleShareAppMessage() {
    return {
      title: 'AI拍摄文物，一拍即识',
      path: '/pages/ai-camera/index',
    };
  },
});

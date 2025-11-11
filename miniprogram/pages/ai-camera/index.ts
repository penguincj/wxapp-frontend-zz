import { base_api } from '../../api/api';
import { base_url, getLoginStatus } from '../../utils/util';

const flashModes: Array<'off' | 'on' | 'auto'> = ['off', 'on', 'auto'];

Page({
  data: {
    devicePosition: 'back' as 'back' | 'front',
    flashMode: 'off' as 'off' | 'on' | 'auto',
    flashModeLabel: '闪光灯关',
    previewImage: '/static/images/default-image-bg.jpeg',
    lastPhoto: '',
    recognitionResult: null as null | { title: string; desc: string },
    recognitionError: '',
    isRecognizing: false,
    zoomLevel: 1,
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2,
      });
    }
  },

  handleToggleFlash() {
    const currentIndex = flashModes.indexOf(this.data.flashMode);
    const nextMode = flashModes[(currentIndex + 1) % flashModes.length];
    const flashLabelMap: Record<'off' | 'on' | 'auto', string> = {
      off: '闪光灯关',
      on: '闪光灯开',
      auto: '闪光灯自动',
    };
    this.setData({
      flashMode: nextMode,
      flashModeLabel: flashLabelMap[nextMode],
    });
  },

  handleSwitchCamera() {
    const devicePosition = this.data.devicePosition === 'back' ? 'front' : 'back';
    this.setData({
      devicePosition,
    });
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

  handleHintTap() {
    this.handleOpenAlbum();
  },

  chooseMedia(sourceType: Array<'album' | 'camera'>) {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image', 'video'],
      sourceType,
      maxDuration: 30,
      camera: this.data.devicePosition,
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

  async uploadImage(filePath: string) {
    const { token } = await getLoginStatus();
    return new Promise<any>((resolve, reject) => {
      wx.uploadFile({
        url: `${base_url}/${base_api}/imageSearch`,
        filePath,
        name: 'file',
        header: {
          'Content-Type': 'multipart/form-data',
          Authorization: token ? `Bearer ${token}` : '',
        },
        success: (res) => {
          try {
            const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
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

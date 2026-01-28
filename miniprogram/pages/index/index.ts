import { getCityList } from "../../api/api";
import { generateCityList, getLocation } from "../../utils/util";
// @ts-ignore
const QQMapWX = require("../../utils/qqmap-wx-jssdk.js");

// TODO: 请替换为你的腾讯位置服务API Key
const QQMAP_KEY = "CTABZ-C6YCW-AJRRG-3AXYI-Q2HW6-G6FV4";

Page({
  data: {
    loading: false,
    cityList: [] as any,
    curCityId: 1,
    cityName: "",
    lastLocationAuthorized: null as null | boolean,
    // 地图相关数据
    latitude: 39.908823,  // 默认北京天安门
    longitude: 116.397470,
    scale: 13,  // 地图缩放级别
    showLocation: true,  // 显示用户位置
  },

  qqmapsdk: null as any,

  async updateLocationAuthState() {
    try {
      const setting = await wx.getSetting();
      const authorized = !!setting.authSetting['scope.userLocation'];
      this.setData({ lastLocationAuthorized: authorized });
      return authorized;
    } catch (error) {
      return this.data.lastLocationAuthorized;
    }
  },

  handleCityChange(event: any) {
    const { selectedId, selectedName } = event.detail;
    const normalizedSelectedId = Number(selectedId);
    const selectedCity = (this.data.cityList || []).find((item: any) => Number(item.id) === normalizedSelectedId);

    this.setData({
      curCityId: Number.isNaN(normalizedSelectedId) ? selectedId : normalizedSelectedId,
      cityName: selectedCity?.d_name || selectedName
    });

    // 切换城市时，更新地图中心到对应城市
    this.moveToCityCenter(selectedCity?.d_name || selectedName);
  },

  handleClickReLoc() {
    this.initLocation();
  },

  handleCityPannelOpenStateChange() {},

  /**
   * 使用腾讯位置服务将城市名转换为坐标，并移动地图中心
   */
  moveToCityCenter(cityName: string) {
    if (!this.qqmapsdk || !cityName) return;

    this.qqmapsdk.geocoder({
      address: cityName,
      success: (res: any) => {
        if (res.result && res.result.location) {
          const { lat, lng } = res.result.location;
          this.setData({
            latitude: lat,
            longitude: lng,
            scale: 12
          });
        }
      },
      fail: (err: any) => {
        console.error('腾讯位置服务地址解析失败:', err);
      }
    });
  },

  /**
   * 获取城市列表
   */
  async fetchCityList() {
    try {
      const res: any = await getCityList();
      if (res && res.cities) {
        return generateCityList(res.cities);
      }
    } catch (error) {
      return [];
    }
    return [];
  },

  /**
   * 获取当前城市信息
   */
  getCityFromLocation(latitude: number, longitude: number): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.qqmapsdk) {
        reject('QQMapSDK未初始化');
        return;
      }

      this.qqmapsdk.reverseGeocoder({
        location: { latitude, longitude },
        success: (res: any) => {
          if (res.result && res.result.address_component) {
            const city = res.result.address_component.city || '';
            resolve(city.replace('市', ''));
          } else {
            resolve('');
          }
        },
        fail: (err: any) => {
          console.error('逆地址解析失败:', err);
          reject(err);
        }
      });
    });
  },

  /**
   * 初始化位置
   */
  async initLocation() {
    wx.showLoading({ title: '定位中' });
    this.setData({ loading: true });

    try {
      // 先尝试从缓存获取位置
      let latitude = wx.getStorageSync('latitude');
      let longitude = wx.getStorageSync('longitude');

      // 如果缓存没有，重新获取位置
      if (!latitude || !longitude) {
        // @ts-expect-error
        const location = await getLocation();
        latitude = location.latitude;
        longitude = location.longitude;
      }

      // 更新地图中心
      this.setData({
        latitude,
        longitude,
        scale: 13
      });

      // 使用腾讯位置服务获取当前城市名称
      try {
        const cityName = await this.getCityFromLocation(latitude, longitude);
        if (cityName) {
          // 在城市列表中查找匹配的城市
          const matchedCity = (this.data.cityList || []).find((item: any) => {
            const name = item?.name || item?.d_name || "";
            return name.includes(cityName) || cityName.includes(name.replace('市', ''));
          });
          if (matchedCity) {
            this.setData({
              curCityId: matchedCity.id,
              cityName: matchedCity.d_name
            });
          } else {
            this.setData({ cityName });
          }
        }
      } catch (e) {
        console.error('获取城市名称失败:', e);
      }

    } catch (error) {
      console.error('获取位置失败:', error);
      // 使用默认位置（北京）
      this.setData({
        latitude: 39.908823,
        longitude: 116.397470,
        scale: 12,
        cityName: '北京'
      });
    }

    wx.hideLoading();
    this.setData({ loading: false });
  },

  /**
   * 初始化页面
   */
  async initPage() {
    // 初始化腾讯位置服务SDK
    this.qqmapsdk = new QQMapWX({
      key: QQMAP_KEY
    });

    // 获取城市列表
    const cityList = await this.fetchCityList();
    this.setData({ cityList });

    // 初始化位置
    await this.initLocation();
  },

  onLoad() {
    this.updateLocationAuthState();
    this.initPage();
  },

  onShow() {
    const prevAuth = this.data.lastLocationAuthorized;
    this.updateLocationAuthState().then((authorized) => {
      if (prevAuth === false && authorized) {
        this.initLocation();
      }
    });
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      });
    }
  },

  onShareAppMessage() {
    const defaultUrl = 'https://gewugo.com/api/v1/storage/image/share-3639793484.jpg';
    const title = '让您的博物馆之旅不虚此行';
    return {
      title,
      path: '/pages/index/index',
      imageUrl: defaultUrl,
    };
  },
});

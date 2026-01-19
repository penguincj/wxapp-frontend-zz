import { getCityList, getIndexDataV2 } from "../../api/api";
import { generateCityList, getLocation, generateNewUrlParams } from "../../utils/util";

const BETA_MODE_STORAGE_KEY = 'BetaModeEnabled';

Page({
  data: {
    loading: false,
    exhibitionList: [] as any,
    showExhibitionList: [] as any,
    rankingList: [] as any,
    cityList: [] as any,
    curCityId: 1,
    cityName: "",
    lastLocationAuthorized: null as null | boolean,
    cityMuseum: {} as any,
  },

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

  handleExClickItem(e: any) {
    const { selectId } = e.detail;
    if (selectId) {
      const urlParams = generateNewUrlParams({
        exhibition_id: Number(selectId)
      });
      wx.navigateTo({
        url: '/pages/exhibitiondetail/index' + urlParams,
      });
    }
  },

  handleRankClickItem(e: any) {
    const { selectId, slug, scopeType } = e.detail;
    if (!selectId) return;
    const urlParams = generateNewUrlParams({
      ranking_id: Number(selectId),
      slug,
      scope_type: scopeType,
    });
    wx.navigateTo({
      url: '/pages/treature-ranklist/index' + urlParams,
    });
  },

  handleClickMoreExh() {
    wx.switchTab({
      url: '/pages/gridview/index'
    });
  },

  handleClickMoreRank() {
    wx.navigateTo({
      url: '/pages/treature-ranklist/index'
    });
  },

  handleCityChange(event: any) {
    const { selectedId, selectedName } = event.detail;
    const selectedCity = (this.data.cityList || []).find((item: any) => item.id === selectedId);
    const cityCode = selectedCity?.city_code || selectedCity?.cityCode || selectedCity?.code;
    this.setData({
      curCityId: selectedId,
      cityName: selectedName
    });
    this.initPage(cityCode);
  },

  handleClickReLoc() {
    this.initPage();
  },

  handleCityPannelOpenStateChange() {},

  formatExhibitionList(list: any[]) {
    return list.map((item: any) => ({
      ...item,
      is_new_flag: Array.isArray(item.tags) && item.tags.includes('NEW'),
    }));
  },

  getCityCode(city: any) {
    return city?.city_code || city?.cityCode || city?.code;
  },

  getFallbackCity(cityList: any[]) {
    return cityList.find((item: any) => {
      const name = item?.name || item?.d_name || item?.city_name || "";
      return String(name).includes("北京");
    });
  },

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

  async getPageIndex(params: { lat?: any; lng?: any; city_code?: string | number }) {
    const res: any = await getIndexDataV2(params);
    if (res && res.code === 0) {
      const data = res.data || {};
      const rankings = data.rankings || [];
      const exhibitionList = this.formatExhibitionList(data.exhibition_list || []);
      const showExhibitionList = exhibitionList.slice(0, 15);
      const cityList = data.city_list ? generateCityList(data.city_list) : await this.fetchCityList();
      const city = cityList.find((i: any) => i.id === data.current_city_id);
      if (!city) {
        const fallbackCity = this.getFallbackCity(cityList);
        const fallbackCityCode = this.getCityCode(fallbackCity);
        if (fallbackCityCode && params.city_code !== fallbackCityCode) {
          await this.getPageIndex({ city_code: fallbackCityCode });
          return;
        }
      }
      const cityName = city ? city.d_name : this.data.cityName;
      const serverEnablePhotoRecognition = !!data.enable_photo_recognition;
      const storageEnablePhotoRecognition = !!wx.getStorageSync(BETA_MODE_STORAGE_KEY);
      const enablePhotoRecognition = serverEnablePhotoRecognition || storageEnablePhotoRecognition;
      const app = getApp<IAppOption>();
      app.globalData.enablePhotoRecognition = enablePhotoRecognition;
      app.globalData.enablePhotoRecognitionFromServer = serverEnablePhotoRecognition;
      if (typeof this.getTabBar === 'function' && this.getTabBar()) {
        const tab = this.getTabBar();
        tab?.updateIconList?.(enablePhotoRecognition);
      }

      this.setData({
        exhibitionList,
        showExhibitionList,
        rankingList: rankings,
        curCityId: data.current_city_id || this.data.curCityId,
        cityList,
        cityName,
        cityMuseum: {
          city_id: data.current_city_id,
          cover_img: '/static/images/bwg-bg.jpg',
          city_name: cityName,
        }
      });
    }
  },

  async initPage(cityCode?: string | number) {
    wx.showLoading({
      title: '加载中',
    });
    this.setData({
      loading: true,
    });
    try {
      if (cityCode) {
        await this.getPageIndex({ city_code: cityCode });
      } else {
        const lat = await wx.getStorageSync('latitude');
        const lng = await wx.getStorageSync('longitude');
        if (!lat || !lng) {
          // @ts-expect-error
          const { latitude, longitude } = await getLocation();
          await this.getPageIndex({ lat: latitude, lng: longitude });
        } else {
          await this.getPageIndex({ lat, lng });
        }
      }
    } catch (error) {
      await this.getPageIndex({ lat: 0, lng: 0 });
    }
    wx.hideLoading();
    this.setData({
      loading: false
    });
  },

  onLoad() {
    this.updateLocationAuthState();
    this.initPage();
  },

  onShow() {
    const prevAuth = this.data.lastLocationAuthorized;
    this.updateLocationAuthState().then((authorized) => {
      if (prevAuth === false && authorized) {
        this.initPage();
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

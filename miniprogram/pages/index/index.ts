import { getCityList } from "../../api/api";
import { generateCityList, getLocation } from "../../utils/util";
// @ts-ignore
const QQMapWX = require("../../utils/qqmap-wx-jssdk.js");

const QQMAP_KEY = "CTABZ-C6YCW-AJRRG-3AXYI-Q2HW6-G6FV4";

// 蔬菜类型与emoji映射
const VEGETABLE_EMOJI: Record<string, string> = {
  'pepper': '🌶️',
  'carrot': '🥕',
  'cabbage': '🥬',
  'tomato': '🍅',
};

const VEGETABLE_NAME: Record<string, string> = {
  'pepper': '辣椒',
  'carrot': '萝卜',
  'cabbage': '白菜',
  'tomato': '番茄',
};

// Mock种植数据（基于用户位置 39.92855, 116.41637 附近）
const MOCK_PLANTING_DATA = [
  { id: 1, type: 'pepper', grower: '张大爷', latitude: 39.9300, longitude: 116.4180 },
  { id: 2, type: 'carrot', grower: '李阿姨', latitude: 39.9270, longitude: 116.4150 },
  { id: 3, type: 'cabbage', grower: '王叔叔', latitude: 39.9290, longitude: 116.4200 },
  { id: 4, type: 'tomato', grower: '赵奶奶', latitude: 39.9260, longitude: 116.4130 },
  { id: 5, type: 'pepper', grower: '孙大哥', latitude: 39.9310, longitude: 116.4100 },
  { id: 6, type: 'carrot', grower: '周姐姐', latitude: 39.9250, longitude: 116.4190 },
  { id: 7, type: 'cabbage', grower: '吴伯伯', latitude: 39.9320, longitude: 116.4160 },
  { id: 8, type: 'tomato', grower: '郑婆婆', latitude: 39.9280, longitude: 116.4220 },
];

interface PlantingInfo {
  id: number;
  type: string;
  grower: string;
  latitude: number;
  longitude: number;
}

interface MarkerType {
  id: number;
  latitude: number;
  longitude: number;
  width: number;
  height: number;
  iconPath: string;
  callout: {
    content: string;
    fontSize: number;
    borderRadius: number;
    padding: number;
    display: string;
    bgColor: string;
    color: string;
  };
}

Page({
  data: {
    loading: false,
    cityList: [] as any,
    curCityId: 1,
    cityName: "",
    lastLocationAuthorized: null as null | boolean,
    // 地图相关数据
    latitude: 39.92855,
    longitude: 116.41637,
    scale: 15,
    showLocation: true,
    // 种植点标记
    markers: [] as MarkerType[],
    // 种植数据
    plantingList: [] as PlantingInfo[],
    // 当前选中的种植点
    selectedPlanting: null as (PlantingInfo & { emoji: string; name: string; distance: string }) | null,
  },

  qqmapsdk: null as any,

  /**
   * 计算两点之间的距离（米）
   */
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const rad = (d: number) => d * Math.PI / 180.0;
    const R = 6371000; // 地球半径（米）
    const dLat = rad(lat2 - lat1);
    const dLng = rad(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(rad(lat1)) * Math.cos(rad(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  /**
   * 格式化距离显示
   */
  formatDistance(meters: number): string {
    if (meters < 1000) {
      return Math.round(meters) + '米';
    }
    return (meters / 1000).toFixed(1) + '公里';
  },

  /**
   * 生成地图标记
   */
  generateMarkers(plantingList: PlantingInfo[]): MarkerType[] {
    return plantingList.map(item => ({
      id: item.id,
      latitude: item.latitude,
      longitude: item.longitude,
      width: 1,
      height: 1,
      iconPath: '/static/images/transparent.png',
      callout: {
        content: VEGETABLE_EMOJI[item.type] || '🌱',
        fontSize: 32,
        borderRadius: 8,
        padding: 8,
        display: 'ALWAYS',
        bgColor: '#ffffff',
        color: '#333333',
      },
    }));
  },

  /**
   * 点击地图标记
   */
  handleMarkerTap(e: any) {
    const markerId = Number(e.detail.markerId);
    const planting = this.data.plantingList.find(item => item.id === markerId);

    if (planting) {
      const distance = this.calculateDistance(
        this.data.latitude,
        this.data.longitude,
        planting.latitude,
        planting.longitude
      );

      this.setData({
        selectedPlanting: {
          ...planting,
          emoji: VEGETABLE_EMOJI[planting.type] || '🌱',
          name: VEGETABLE_NAME[planting.type] || '蔬菜',
          distance: this.formatDistance(distance),
        }
      });
    }
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

  handleCityChange(event: any) {
    const { selectedId, selectedName } = event.detail;
    const normalizedSelectedId = Number(selectedId);
    const selectedCity = (this.data.cityList || []).find((item: any) => Number(item.id) === normalizedSelectedId);

    this.setData({
      curCityId: Number.isNaN(normalizedSelectedId) ? selectedId : normalizedSelectedId,
      cityName: selectedCity?.d_name || selectedName
    });

    this.moveToCityCenter(selectedCity?.d_name || selectedName);
  },

  handleClickReLoc() {
    this.initLocation();
  },

  handleCityPannelOpenStateChange() {},

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
   * 加载种植数据
   */
  loadPlantingData() {
    // 使用Mock数据
    const plantingList = MOCK_PLANTING_DATA;
    const markers = this.generateMarkers(plantingList);

    // 默认选中第一个
    const firstPlanting = plantingList[0];
    const distance = this.calculateDistance(
      this.data.latitude,
      this.data.longitude,
      firstPlanting.latitude,
      firstPlanting.longitude
    );

    this.setData({
      plantingList,
      markers,
      selectedPlanting: {
        ...firstPlanting,
        emoji: VEGETABLE_EMOJI[firstPlanting.type] || '🌱',
        name: VEGETABLE_NAME[firstPlanting.type] || '蔬菜',
        distance: this.formatDistance(distance),
      }
    });
  },

  async initLocation() {
    wx.showLoading({ title: '定位中' });
    this.setData({ loading: true });

    try {
      let latitude = wx.getStorageSync('latitude');
      let longitude = wx.getStorageSync('longitude');

      if (!latitude || !longitude) {
        // @ts-expect-error
        const location = await getLocation();
        latitude = location.latitude;
        longitude = location.longitude;
      }

      this.setData({
        latitude,
        longitude,
        scale: 15
      });

      try {
        const cityName = await this.getCityFromLocation(latitude, longitude);
        if (cityName) {
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

      // 加载种植数据
      this.loadPlantingData();

    } catch (error) {
      console.error('获取位置失败:', error);
      this.setData({
        latitude: 39.92855,
        longitude: 116.41637,
        scale: 15,
        cityName: '北京'
      });
      // 即使定位失败也加载种植数据
      this.loadPlantingData();
    }

    wx.hideLoading();
    this.setData({ loading: false });
  },

  async initPage() {
    this.qqmapsdk = new QQMapWX({
      key: QQMAP_KEY
    });

    const cityList = await this.fetchCityList();
    this.setData({ cityList });

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
    const title = '看看你周围都在种什么';
    return {
      title,
      path: '/pages/index/index',
      imageUrl: defaultUrl,
    };
  },
});

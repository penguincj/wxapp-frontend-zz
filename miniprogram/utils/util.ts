// @ts-nocheck
var log = require('../utils/log')

import { base_api, getCityByLoc } from "../api/api"

// 开发环境使用本地后端，生产环境使用线上地址
export const base_url = 'http://localhost:3000'  // 改成你后端实际端口
// export const base_url = 'https://gewugo.com'

let locationPermissionModalShown = false;

// ==================== 时间格式化 ====================

export const formatTime = (date: Date) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return (
    [year, month, day].map(formatNumber).join('/') +
    ' ' +
    [hour, minute, second].map(formatNumber).join(':')
  )
}

const formatNumber = (n: number) => {
  const s = n.toString()
  return s[1] ? s : '0' + s
}

export const generateDateFormat = (_time: any) => {
  const date = new Date(_time);
  const datenow = new Date(Date.now())

  const diffDay = (datenow - date) / 1000/60/60/24;
  const diffHour = (datenow - date) / 1000/60/60;
  const diffMin = (datenow - date) / 1000/60;
  const diffSec = (datenow - date) / 1000;

  if (diffDay > 30) {
    return (Math.floor(diffDay / 30)) + '个月前';
  } else if (diffDay <= 30 && (diffDay > 1)) {
    return (Math.floor(diffDay)) + '天前';
  } else if (diffHour > 1 && (diffHour < 24)) {
    return (Math.floor(diffHour)) + '小时前';
  } else if (diffMin >1 && (diffMin < 60)) {
    return (Math.floor(diffMin)) + '分钟前';
  } else if (diffSec >0 && (diffSec < 60)) {
    return (Math.floor(diffSec)) + '秒前';
  }
}

// ==================== 函数节流 ====================

export function throttle(fn: any, interval: number) {
  var enterTime = 0;
  var gapTime = interval || 300;
  return function () {
    var context = this;
    var backTime = new Date();
    if (backTime - enterTime > gapTime) {
      fn.call(context, arguments);
      enterTime = backTime;
    }
  };
}

// ==================== 页面参数处理 ====================

export const getCurrentPageUrl = () => {
  let pages = getCurrentPages()
  let currentPage = pages[pages.length - 1]
  let url = currentPage.route
  return url
}

export const getCurrentPageParam = () => {
  let pages = getCurrentPages()
  let currentPage = pages[pages.length - 1]
  let options = currentPage.options;
  return options;
}

export const getCurrentPageParamStr = () => {
  let pages = getCurrentPages()
  let currentPage = pages[pages.length - 1]
  let options = currentPage.options;
  const url_str = transferObjToUrlParams(options);
  return url_str;
}

export const transferObjToUrlParams = (_obj) => {
  let str = '?';
  Object.keys(_obj).forEach((key) => {
    str = str + key + '=' + _obj[key] + '&'
  })
  str = (str === '?' ? '' : str);
  str = str.slice(0, str.length - 1);
  return str;
}

export const generateNewUrlParams = (_obj) => {
  const options = getCurrentPageParam();
  const new_obj = {
    ...options,
    ..._obj,
  }
  const param_str = transferObjToUrlParams(new_obj);
  return param_str;
}

// ==================== 位置相关 ====================

export const getLocation = async () => {
  return new Promise((resolve, reject) => {
    const handleSuccess = (res: any) => {
      const { latitude, longitude } = res;
      wx.setStorageSync('latitude', latitude);
      wx.setStorageSync('longitude', longitude);
      log.info('lat, lng', latitude, longitude)
      resolve({ latitude, longitude });
    };

    const fetchLocation = () => {
      wx.getLocation({
        type: 'wsg84',
        success: handleSuccess,
        fail: handleFail,
      });
    };

    const openSettingAndRetry = (err: any) => {
      if (locationPermissionModalShown) return;
      locationPermissionModalShown = true;
      wx.showModal({
        title: '需要位置权限',
        content: '开启位置权限后即可获取附近信息',
        confirmText: '去设置',
        success(modalRes) {
          if (modalRes.confirm) {
            wx.openSetting({
              success(settingRes) {
                if (settingRes.authSetting['scope.userLocation']) {
                  fetchLocation();
                } else {
                  reject(err);
                }
              },
              fail() {
                reject(err);
              }
            })
          } else {
            reject(err);
          }
        },
        fail() {
          reject(err);
        },
        complete() {
          locationPermissionModalShown = false;
        }
      })
    };

    const handleFail = (err: any) => {
      wx.getSetting({
        success(res) {
          if (!res.authSetting['scope.userLocation']) {
            openSettingAndRetry(err);
          } else {
            reject(err);
          }
        },
        fail() {
          reject(err);
        }
      })
      console.log('location error', err)
    };

    fetchLocation();
  })
}

export const getCurrentCity = async () => {
  const local_city = await wx.getStorageSync('city');
  if (local_city) {
    return local_city;
  } else {
    const defaultCity = '北京市';
    let lat = await wx.getStorageSync('latitude');
    let lng = await wx.getStorageSync('longitude');

    let city = '';
    try {
      if (!lat || !lng) {
        const {latitude, longitude} = await getLocation();
        lat = latitude;
        lng = longitude;
      }
      const city_res = await getCityByLoc(lat, lng);
      if (city_res && city_res.code === 0) {
        city = city_res.city_name;
      } else {
        city = defaultCity
      }
      await wx.setStorageSync('city', city);

    } catch (error) {
      city = defaultCity
      await wx.setStorageSync('city', city);
      console.error(error);
    }

    return city;
  }
}

export const generateCityList = (_citylist: any) => {
  const list = _citylist.map((i: any) => {
    return {
      ...i,
      d_name: i.name.split('市')[0]
    }
  })
  return list;
}

// ==================== HTTP 请求 ====================

export const request = async function (url, options={}, _base_url=base_url) {
  let token = await wx.getStorageSync('token');
  if (!token) {
    const res: any = await getLoginStatus();
    token = res.token;
  }
  return new Promise((resolve, reject) => {
    wx.request({
      url: _base_url + url,
      method: options.method,
      data: options.data,
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      success: async (res) => {
        resolve(res.data)
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

export const map_request = function (_url: any, options={} ) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: _url,
      method: options.method,
      header: {
        'content-type': 'application/json',
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.result) {
            resolve(res.result)
          } else if (res.data) {
            resolve(res.data)
          }
        } else {
          reject(res)
        }
      },
      fail: (err) => {
        reject(err)
        log.error(err)
      }
    })
  })
}

// ==================== 登录相关 ====================

export const login_request = function () {
  return new Promise((resolve, reject) => {
    wx.login({
      success: (res) => {
        if (res.code) {
          resolve(res)
        } else {
          reject(res)
        }
      },
      fail: (err) => {
        reject(err)
        log.error(err)
      }
    })
  })
}

export const getLoginStatus = async () => {
  try {
    const local_token = await wx.getStorageSync('token');
    const local_userinfo = await wx.getStorageSync('userinfo');
    if (local_token && local_userinfo && local_userinfo.nickname) {
      return {
        token: local_token,
        userinfo: local_userinfo,
      }
    }
    const { code } = await login_request();

    const { token, user: {nickname, avatar, id, openid}} = await map_request(`${base_url}/${base_api}/v1/sessions/`+code, {method: 'POST'});
    wx.setStorageSync('token', token);
    wx.setStorageSync('userinfo', {
      userid: id,
      avatar,
      nickname,
      openid,
    })
    getApp().globalData.token = token;
    getApp().globalData.userinfo = {
      userid: id,
      avatar,
      nickname,
      openid,
    }
    return {
      token,
      userinfo: {
        userid: id,
        avatar,
        nickname,
        openid,
      }
    }
  } catch (error) {
    console.error(error);
    return {
      token: '',
      userinfo: {
        nickname: '',
        avatar: '',
        userid: -1,
        openid: '',
      }
    };
  }
}

export const clearAndFreshLoginStatus = async () => {
  try {
    await wx.setStorageSync('token', '');
    await wx.setStorageSync('userinfo', '');

    const { code } = await login_request();

    const { token, user: {nickname, avatar, id, openid }} = await map_request(`${base_url}/${base_api}/v1/sessions/`+code, {method: 'POST'});
    wx.setStorageSync('token', token);
    wx.setStorageSync('userinfo', {
      userid: id,
      avatar,
      nickname,
      openid,
    })
    getApp().globalData.token = token;
    getApp().globalData.userinfo = {
      userid: id,
      avatar,
      nickname,
      openid,
    }
    return {
      token,
      userinfo: {
        userid: id,
        avatar,
        nickname,
        openid,
      }
    }
  } catch (error) {
    console.error(error);
    return {
      token: '',
      userinfo: {
        nickname: '',
        avatar: '',
        userid: -1,
        openid: '',
      }
    };
  }
}

// ==================== 版本相关 ====================

export const getMiniProgramVersion = () => {
  try {
    const { miniProgram } = wx.getAccountInfoSync();
    const { version } = getApp().globalData;
    return miniProgram.envVersion === 'release' ? miniProgram.version : version;
  } catch (e) {}
  return 'unknown';
}

export const compareVersion = (v1: string, v2: string): number => {
  if (!v1 && !v2) return 0;
  if (!v1) return -1;
  if (!v2) return 1;

  const a = v1.trim().split('.');
  const b = v2.trim().split('.');
  const len = Math.max(a.length, b.length);

  for (let i = 0; i < len; i++) {
    const ai = parseInt(a[i] ?? '0', 10) || 0;
    const bi = parseInt(b[i] ?? '0', 10) || 0;
    if (ai > bi) return 1;
    if (ai < bi) return -1;
  }
  return 0;
}

export const isVersionGreater = (v1: string, v2: string): boolean => compareVersion(v1, v2) > 0;

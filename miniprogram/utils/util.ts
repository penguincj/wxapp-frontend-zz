// @ts-nocheck
var log = require('../utils/log')
var aesjs = require('aes-js');

import { base_api, getCityByLoc } from "../api/api"

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

export const base_url = 'https://gewugo.com'

/**
 * 函数截流 一
 * @param {*} fun 被调用函数
 * @param {*} delay 延时执行（300）
 */

/*函数节流*/
export function throttle(fn: any, interval: number) {
  var enterTime = 0;//触发的时间
  var gapTime = interval || 300;//间隔时间，如果interval不传，则默认300ms
  return function () {
    var context = this;
    var backTime = new Date();//第一次函数return即触发的时间
    if (backTime - enterTime > gapTime) {
      fn.call(context, arguments);
      enterTime = backTime;//赋值给第一次触发的时间，这样就保存了第二次触发的时间
    }
  };
}


/*获取当前页url*/
export const getCurrentPageUrl = () => {
  let pages = getCurrentPages()
  let currentPage = pages[pages.length - 1]
  let url = currentPage.route
  return url
}
/*获取当前页参数*/
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
  console.log('current str', str);
  return str;
}
export const generateNewUrlParams = (_obj) => {
  console.log('generateNewUrlParams', _obj)
  const options = getCurrentPageParam();
  const new_obj = {
    ...options,
    ..._obj,
  }
  const param_str = transferObjToUrlParams(new_obj);
  return param_str;
}

// 获取当前地理位置信息并写入本地storage
export const getLocation = async () => {
  return new Promise((resolve, reject) => {
    wx.getLocation({
      type: 'wsg84',
      success(res) {
        const latitude = res.latitude;
        const longitude = res.longitude;
        wx.setStorageSync('latitude', res.latitude);
        wx.setStorageSync('longitude', res.longitude);
        log.info('lat, lng', res.latitude, res.longitude)
        resolve({latitude, longitude});
      },
      fail(res) {
        wx.getSetting({
          success(res) {
            if (!res.authSetting['scope.userLocation']) {
              wx.authorize({
                scope: 'scope.userLocation',
                success() { 
                  /* 授权成功处理 */ 
                },
                fail() { 
                  /* 引导打开设置页 */
                  wx.showToast({
                    title: '请开启位置权限',
                    icon: 'none',
                    duration: 2000
                   })
                 }
              })
            }
          }
        })
        reject(res);
        console.log('location error', res)
      }
    })
  })
}

// 获取当前城市
export const getCurrentCity = async () => {
  const tx_key = 'KNNBZ-VBT63-BFE3H-OQXQF-TLIK3-MLFOC';
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
      // const city_res = await map_request(`https://apis.map.qq.com/ws/geocoder/v1/?key=${tx_key}&location=${lat},${lng}`);
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
   
    // todo 地理位置反解
    return city;
    
  }
}

export const getDecryptedData = (_aesData: any) => {
  const res: any = _aesData;
  const key= 'key-bowudy-2025--2025-bowudy-key';
 
  var encryptedBytes = new Uint8Array(res);
  console.log('decryptedBytes--- encryptedBytes', encryptedBytes);

  var count = encryptedBytes.slice(0, 16);
  var keyAes = aesjs.utils.utf8.toBytes(key);

  var counter = new aesjs.Counter(count);

  var aesCtr = new aesjs.ModeOfOperation.ctr(keyAes, counter);

  var eb = encryptedBytes.slice(16)
  var decryptedBytes = aesCtr.decrypt(eb);

  var decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
  
  const res_obj = JSON.parse(decryptedText);
  console.log('decryptedBytes--- res_obj', res_obj);

  return res_obj;


  // var encryptedBytes = aesjs.utils.utf8.toBytes(res);
  // var count = encryptedBytes.slice(0, 16);
  // var ivtxt = aesjs.utils.utf8.fromBytes(count);
  // console.log('decryptedBytes--- 解密结果:', ivtxt);

  // const iv = 'abcdefghijklmnop';  // 16字节 IV
  // const result = decryptAESCTR(res, key, ivtxt);
  // console.log('decryptedBytes--- 解密结果:', result);


}

export const request = async function (url, options={}, base_url='https://gewugo.com') {
  let token = await wx.getStorageSync('token');
  if (!token) {
    const res: any = await getLoginStatus(); 
    token = res.token;
  }
  return new Promise((resolve, reject) => {
    wx.request({
      url: base_url + url,
      method: options.method,
      data: options.data,
      // header这里根据业务情况自行选择需要还是不需要
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


export const request_aes = async function (url, options={}, base_url='https://gewugo.com') {
  let token = await wx.getStorageSync('token');
  if (!token) {
    const res: any = await getLoginStatus(); 
    token = res.token;
  }
  return new Promise((resolve, reject) => {
    wx.request({
      url: base_url + url,
      method: options.method,
      data: options.data,
      responseType: 'arraybuffer',
      // header这里根据业务情况自行选择需要还是不需要
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      success: async (res) => {
        const decrypted_data = getDecryptedData(res.data);
        console.log('decrypted_data', decrypted_data)
        resolve(decrypted_data);
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
      // header这里根据业务情况自行选择需要还是不需要
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
    console.log('getLoginStatus login users');

    const local_token = await wx.getStorageSync('token');
    const local_userinfo = await wx.getStorageSync('userinfo');
    // const local_token = getApp().globalData.token;
    // const local_userinfo =  getApp().globalData.userinfo;
    if (local_token && local_userinfo && local_userinfo.nickname) {
      return {
        token: local_token,
        userinfo: local_userinfo,
      }
    }
    const { code } = await login_request();
    console.log('code------------', code);
    
    const { token, user: {nickname, avatar, id, openid}} = await map_request(`https://gewugo.com/${base_api}/v1/sessions/`+code, {method: 'POST'});
    console.log('login users', token, nickname, avatar);
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
      userinfo:  {
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
    // await checkloginStatus();
    await wx.setStorageSync('token', '');
    await wx.setStorageSync('userinfo', '');
    // const local_token = getApp().globalData.token;
    // const local_userinfo =  getApp().globalData.userinfo;

    const { code } = await login_request();
    console.log('code------------', code);
    
    const { token, user: {nickname, avatar, id, openid }} = await map_request(`https://gewugo.com/${base_api}/v1/sessions/`+code, {method: 'POST'});
    console.log('login users', openid);
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
      userinfo:  {
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

export const backToTargetPage = (_pagename: String) => {
  console.log('backToTargetPage')
  const pages = getCurrentPages();
  if (pages.length) {
    const pageId = pages.findIndex((i: any) => i.route === _pagename);
    if (pageId !== -1) {
      const listpageIndex = pages.length - pageId - 1;
      console.log('-----params pages', pages);
      wx.navigateBack({
        delta: listpageIndex
      })
    } else {
      
      const params = getApp().globalData.audio.exhibitlistParams;
      if (params === '' || (params.indexOf('narration_id') === -1) || (params.indexOf('exhibition_id') === -1) ) {
        const paramstr = transferObjToUrlParams({
          exhibition_id: getApp().globalData.audio.curExhibition,
          package_id: getApp().globalData.audio.curPackageId,
          // narration_id: getApp().globalData.audio.curNarration
        })
        console.log('-----params str paramstr', paramstr)
        getApp().globalData.audio.exhibitlistParams = paramstr;
      }
      // console.log('-----params', params)
      wx.navigateTo({
        url: '/' + _pagename + getApp().globalData.audio.exhibitlistParams,
      })
    }
  } 
}

export const calTimeTxt = (_time: number) => {
  if (_time < 3600) {
    const min = Math.floor(_time / 60);
    const min_str = (min < 10) ? ('0' + min) : min;
    const sec = (_time % 60) + 1;
    const sec_str = (sec < 10) ? ('0' + sec) : sec;
    return min_str + ':' + sec_str
  } else {
    const hour = Math.floor(_time / 3600);
    const hour_str = (hour < 10) ? ('0' + hour) : hour;

    const minute = Math.floor((_time % 3600) / 60);
    const minute_str = (minute < 10) ? ('0' + minute) : minute;

    const second = ((_time % 3600) % 60);
    const second_str = (second < 10) ? ('0' + second) : second;

    return hour_str + ':' + minute_str + ':' + second_str;
  }
}

export const calTimeDurationTxt = (_time: number) => {
  // 处理小于1秒的情况
  if (_time < 1) {
    return '1秒';
  }
  
  const hours = Math.floor(_time / 3600);
  const minutes = Math.floor((_time % 3600) / 60);
  const seconds = Math.floor(_time % 60);
  
  if (hours > 0) {
    // 有小时的情况
    if (minutes > 0) {
      return `${hours}小时${minutes}分钟`;
    } else {
      return `${hours}小时`;
    }
  } else if (minutes > 0) {
    // 只有分钟的情况
    return `${minutes}分钟`;
  } else {
    // 只有秒的情况
    return `${seconds}秒`;
  }
}


export const generateDateFormat = (_time: any) => {
  const date = new Date(_time);
  // const month = date.getMonth() + 1;
  // const day = date.getDate();
  // const hour = date.getHours();
  // const minute = date.getMinutes();
  // const second = date.getSeconds();

  const datenow = new Date(Date.now())
  // const now_month = datenow.getMonth() + 1;
  // const now_day = datenow.getDate();
  // const now_hour = datenow.getHours();
  // const now_minute = datenow.getMinutes();
  // const now_second = datenow.getSeconds();

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

export const dealTradePic = () => {
  return {
    obj: []
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

export const getMiniProgramVersion = () => {
  console.log(wx.getAccountInfoSync())
  try {
    const { miniProgram } = wx.getAccountInfoSync();
    const { version } = getApp().globalData;
    return miniProgram.envVersion === 'release' ? miniProgram.version : version;
  } catch (e) {}
  return 'unknown';
}

// 比较小程序版本号（格式类似 "4.0.11"）。
// 返回值：1 表示 v1 > v2；-1 表示 v1 < v2；0 表示相等。
export const compareVersion = (v1: string, v2: string): number => {
  // 兼容空值
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

// 便捷方法：判断 v1 是否比 v2 新
export const isVersionGreater = (v1: string, v2: string): boolean => compareVersion(v1, v2) > 0;


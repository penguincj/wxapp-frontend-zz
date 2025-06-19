// @ts-nocheck
var log = require('../utils/log')
import { base_api } from "../api/api"

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
      const city_res = await map_request(`https://apis.map.qq.com/ws/geocoder/v1/?key=${tx_key}&location=${lat},${lng}`);
      // const city_res = await map_request(`https://apis.map.qq.com/ws/geocoder/v1/?key=${tx_key}&location=32.53279,120.467854`);
      if (city_res && city_res.result && city_res.result.address_component && city_res.result.address_component.city) {
        city = city_res.result.address_component.city;
      } else {
        city = defaultCity
      }
      await wx.setStorageSync('city', city);

    } catch (error) {
      city = defaultCity
      await wx.setStorageSync('city', city);
      console.error(error); 
    }
    // wx.request({
    //   url: `https://apis.map.qq.com/ws/geocoder/v1/?key=${tx_key}&location=${lat},${lng}`,
    //   header: {
    //     'content-type': 'application/json',
    //   },
    //   success: (res) => {
    //    if (res && res.data && res.data.status === 0) {
    //     const loc_info = res.data.result;
    //     if (loc_info && loc_info.address_component && loc_info.address_component.city) {
    //       city = loc_info.address_component.city;
    //       console.log('tengxun map', city);
    //       wx.setStorageSync('city', city);
    //     } else {
    //       city = defaultCity
    //       wx.setStorageSync('city', city);
    //     }
    //    } else {
    //     city = defaultCity
    //     wx.setStorageSync('city', city);
    //    }
    //   },
    //   fail: (err) => {
    //     city = defaultCity;
    //     wx.setStorageSync('city', city);
    //     console.error(err);
    //   }
    // })
    // todo 地理位置反解
    return city;
    
  }
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
        // if (res.statusCode === 200) {
        //   console.log('requset----', res.statusCode)
        //   resolve(res.data)
        // } else if (res.statusCode === 401) {
        //   console.log('request 401');
          
        //   resolve(res.data)
        //   // return await request(...arguments);
        //   // console.log( arguments)
        // } else {
        //   reject(res.error)
        // }
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
    })
    getApp().globalData.token = token;
    getApp().globalData.userinfo = {
      userid: id,
      avatar,
      nickname,
    }
    return {
      token,
      userinfo:  {
        userid: id,
        avatar,
        nickname,
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
    
    const { token, user: {nickname, avatar, id, openid}} = await map_request(`https://gewugo.com/${base_api}/v1/sessions/`+code, {method: 'POST'});
    console.log('login users', token, nickname, avatar);
    wx.setStorageSync('token', token);
    wx.setStorageSync('userinfo', {
      userid: id,
      avatar,
      nickname,
    })
    getApp().globalData.token = token;
    getApp().globalData.userinfo = {
      userid: id,
      avatar,
      nickname,
    }
    return {
      token,
      userinfo:  {
        userid: id,
        avatar,
        nickname,
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
      }
    };
  }

}

export const backToTargetPage = (_pagename: String) => {
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
      if (params === '') {
        const paramstr = transferObjToUrlParams({
          exhibition_id: getApp().globalData.audio.curExhibition,
          narration_id: getApp().globalData.audio.curNarration
        })
        console.log('-----params str paramstr', paramstr)
        getApp().globalData.audio.exhibitlistParams = paramstr;
      }
      console.log('-----params', params)
      wx.navigateTo({
        url: '/' + _pagename + params,
      })
    }
  } 
}

export const calTimeTxt = (_time: number) => {
  if (_time < 3600) {
    const min = Math.floor(_time / 60);
    const min_str = (min < 10) ? ('0' + min) : min;
    const sec = (_time % 60);
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
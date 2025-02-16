// @ts-nocheck
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
  let str = '?';
  Object.keys(options).forEach((key) => {
    str = str + key + '=' + options[key] + '&'
  })
  str = (str === '?' ? '' : str);
  str = str.slice(0, str.length - 1);
  console.log('current str', str);
  return str;
}

export const request = function (url, options={}) {
  const base_url = 'https://gewugo.com'

  return new Promise((resolve, reject) => {
    wx.request({
      url: base_url + url,
      method: options.method,
      data: options.data,
      // header这里根据业务情况自行选择需要还是不需要
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + getApp().globalData.token
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data)
        } else {
          reject(res.error)
        }
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

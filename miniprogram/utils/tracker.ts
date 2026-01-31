import { getCurrentPageUrl, getCurrentPageParam, base_url } from "./util";

class Tracker {
    timer: any;
    publicParams: any;
    lastSendTime: any;
    constructor() {
      this.timer = null;
      this.publicParams = {};
      this.lastSendTime = Date.now();
      this.log = this.log;
      this.report = this.report;
    }

    init(params: any) {
      this.publicParams = params;
      this.lastSendTime = Date.now();
    }

    generateOtherParams() {
      const page_index = getCurrentPageUrl();
      const page_params = getCurrentPageParam();
      return {
        page_index,
        page_params,
      }
    }

    // 立即尝试上报 todo
    report(event: any, properties = {}) {
      const otherParams = this.generateOtherParams();
      console.log('publicParamspublicParamspublicParams', this.publicParams)
      const log = {
        ...this.publicParams,
        ...otherParams,
        event_id: event,
        properties,
        time_stamp: Date.now(),
      }
      wx.request({
        url: `${base_url}/api/report/log/batch`,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'X-WX-OPENID': wx.getStorageSync('openid')
        },
        data: [log],
        fail: () => {
          this.log(log, properties); // 失败转存队列
        }
      });
    }
  
    // 批量上报（每5条或10秒）
    log(event: any, properties = {}) {
      const MAX_CACHE_SIZE = 20; // 最大缓存事件数
      const otherParams = this.generateOtherParams();

      const log = {
        ...this.publicParams,
        ...otherParams,
        event_id: event,
        properties,
        time_stamp: Date.now(),
      }
      console.log('track log', log)
      wx.getStorage({
        key: 'event_queue',
        success: (res) => {
          console.log('track log res', res)
          let queue = res.data || [];
          if (queue.length >= MAX_CACHE_SIZE) {
            this.sendBatch(queue); // 超出限制时优先发送
            wx.removeStorage({ 
              key: 'event_queue', 
              success: (res) => {
                console.log(res);
                queue = [];
              },
              fail: (err) => {console.error(err)} 
            }); // 发送成功清空
            
          }
          queue.push(log);
          wx.setStorage({ key: 'event_queue', data: queue });
        },
        fail: (err) => {
          wx.setStorage({ key: 'event_queue', data: [log] });
          console.log(err)
        }
      });
    }
  
    scheduleFlush() {
      if (this.timer) clearTimeout(this.timer)
      this.timer = setTimeout(() => this.flush(), 10000)
    }

    async sendBatch(_logs: any) {
      if (_logs.length === 0) return
      try {
        await wx.request({
          url: `${base_url}/api/report/log/batch`,
          method: 'POST',
          header: {
            'Content-Type': 'application/json',
            'X-WX-OPENID': wx.getStorageSync('openid')
          },
          data: _logs
        })
        console.log('batch !')
      } catch (err) {
        console.error('日志上报失败', err)
        // 失败重试逻辑
      }
    }
  
    async flush() {
      wx.getStorage({
        key: 'event_queue',
        success: (res) => {
          if (res.data?.length === 0) return

          if (res.data?.length > 0) {
            this.sendBatch(res.data).then(() => {
              wx.removeStorage({ key: 'event_queue' }); // 发送成功清空
            });
          }
        }
      });
    }
  }
  
  // 单例模式导出
  export default new Tracker()
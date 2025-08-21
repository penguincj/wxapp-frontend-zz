/**
 * 微信小程序事件追踪器
 * 用于数据埋点和上报
 * 支持批量上报、失败重试、本地缓存等功能
 */

class Tracker {
  constructor() {
    this.timer = null;
    this.publicParams = {};
    this.lastSendTime = Date.now();
    this.log = this.log.bind(this);
    this.report = this.report.bind(this);
  }

  /**
   * 初始化追踪器
   * @param {Object} params - 公共参数，如设备信息、用户信息等
   */
  init(params) {
    this.publicParams = params;
    this.lastSendTime = Date.now();
  }

  /**
   * 获取当前页面URL
   * @returns {string} 当前页面路径
   */
  getCurrentPageUrl() {
    try {
      let pages = getCurrentPages();
      let currentPage = pages[pages.length - 1];
      let url = currentPage.route;
      return url;
    } catch (error) {
      console.warn('获取页面URL失败:', error);
      return '';
    }
  }

  /**
   * 获取当前页面参数
   * @returns {Object} 当前页面参数对象
   */
  getCurrentPageParam() {
    try {
      let pages = getCurrentPages();
      let currentPage = pages[pages.length - 1];
      let options = currentPage.options || {};
      return options;
    } catch (error) {
      console.warn('获取页面参数失败:', error);
      return {};
    }
  }

  /**
   * 生成其他参数
   * @returns {Object} 包含页面信息的参数对象
   */
  generateOtherParams() {
    const page_index = this.getCurrentPageUrl();
    const page_params = this.getCurrentPageParam();
    return {
      page_index,
      page_params,
    };
  }

  /**
   * 立即上报事件
   * @param {string} event - 事件ID
   * @param {Object} properties - 事件属性
   */
  report(event, properties = {}) {
    const otherParams = this.generateOtherParams();
    console.log('Tracker report - publicParams:', this.publicParams);
    
    const log = {
      ...this.publicParams,
      ...otherParams,
      event_id: event,
      properties,
      time_stamp: Date.now(),
    };

    wx.request({
      url: 'https://gewugo.com/api/report/log/batch',
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'X-WX-OPENID': wx.getStorageSync('openid') || ''
      },
      data: [log],
      success: (res) => {
        console.log('Tracker report success:', res);
      },
      fail: (err) => {
        console.warn('Tracker report failed, fallback to queue:', err);
        this.log(log, properties); // 失败转存队列
      }
    });
  }

  /**
   * 批量上报事件（每5条或10秒）
   * @param {string} event - 事件ID
   * @param {Object} properties - 事件属性
   */
  log(event, properties = {}) {
    const MAX_CACHE_SIZE = 20; // 最大缓存事件数
    const otherParams = this.generateOtherParams();

    const log = {
      ...this.publicParams,
      ...otherParams,
      event_id: event,
      properties,
      time_stamp: Date.now(),
    };

    console.log('Tracker log:', log);

    wx.getStorage({
      key: 'event_queue',
      success: (res) => {
        console.log('Tracker log - existing queue:', res);
        let queue = res.data || [];
        
        if (queue.length >= MAX_CACHE_SIZE) {
          this.sendBatch(queue); // 超出限制时优先发送
          wx.removeStorage({ 
            key: 'event_queue', 
            success: (res) => {
              console.log('Queue cleared after batch send:', res);
              queue = [];
            },
            fail: (err) => {
              console.error('Failed to clear queue:', err);
            }
          });
        }
        
        queue.push(log);
        wx.setStorage({ 
          key: 'event_queue', 
          data: queue,
          success: () => {
            console.log('Event added to queue, total:', queue.length);
          },
          fail: (err) => {
            console.error('Failed to add event to queue:', err);
          }
        });
      },
      fail: (err) => {
        console.log('No existing queue, creating new one:', err);
        wx.setStorage({ 
          key: 'event_queue', 
          data: [log],
          success: () => {
            console.log('New queue created with event');
          },
          fail: (err) => {
            console.error('Failed to create new queue:', err);
          }
        });
      }
    });

    // 调度定时刷新
    this.scheduleFlush();
  }

  /**
   * 调度定时刷新
   */
  scheduleFlush() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.flush(), 10000);
  }

  /**
   * 批量发送事件
   * @param {Array} logs - 事件日志数组
   */
  async sendBatch(logs) {
    if (logs.length === 0) return;
    
    console.log('Tracker sending batch:', logs.length, 'events');
    
    try {
      await new Promise((resolve, reject) => {
        wx.request({
          url: 'https://gewugo.com/api/report/log/batch',
          method: 'POST',
          header: {
            'Content-Type': 'application/json',
            'X-WX-OPENID': wx.getStorageSync('openid') || ''
          },
          data: logs,
          success: resolve,
          fail: reject
        });
      });
      console.log('Batch send success!');
    } catch (err) {
      console.error('Tracker batch send failed:', err);
      // 失败重试逻辑可以在这里添加
    }
  }

  /**
   * 刷新缓存的事件
   */
  async flush() {
    wx.getStorage({
      key: 'event_queue',
      success: (res) => {
        if (res.data?.length === 0) return;

        if (res.data?.length > 0) {
          this.sendBatch(res.data).then(() => {
            wx.removeStorage({ 
              key: 'event_queue',
              success: () => {
                console.log('Queue cleared after flush');
              },
              fail: (err) => {
                console.error('Failed to clear queue after flush:', err);
              }
            });
          });
        }
      },
      fail: (err) => {
        console.log('No queue to flush:', err);
      }
    });
  }

  /**
   * 手动刷新
   */
  manualFlush() {
    this.flush();
  }

  /**
   * 清理定时器
   */
  destroy() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}

// 创建单例实例
const tracker = new Tracker();

// 导出
module.exports = tracker;

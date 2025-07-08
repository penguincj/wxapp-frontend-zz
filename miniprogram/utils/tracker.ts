class Tracker {
    queue: any[];
    timer: any;
    constructor() {
      this.queue = [];
      this.timer = null;
    }
  
    log(event: any, properties = {}) {
      const log = {
        event,
        properties,
        timestamp: Date.now()
      }
      console.log('track log', log)
      this.queue.push(log)
      
      // 批量上报（每5条或10秒）
      if (this.queue.length >= 5) this.flush()
      else this.scheduleFlush()
    }
  
    scheduleFlush() {
      if (this.timer) clearTimeout(this.timer)
      this.timer = setTimeout(() => this.flush(), 10000)
    }
  
    async flush() {
      if (this.queue.length === 0) return
      
      const logs = [...this.queue]
      this.queue = []
      
      try {
        await wx.request({
          url: 'http://localhost:4000/log/batch',
          method: 'POST',
          header: {
            'Content-Type': 'application/json',
            'X-WX-OPENID': wx.getStorageSync('openid')
          },
          data: logs
        })
      } catch (err) {
        console.error('日志上报失败', err)
        // 失败重试逻辑
      }
    }
  }
  
  // 单例模式导出
  export default new Tracker()
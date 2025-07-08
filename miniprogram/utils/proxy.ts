export const componentProxy = () => {
  const originalComponent = Component;

  Component = (config) => {
    const { methods = {} as any } = config;

    // 劫持所有方法
    Object.keys(methods).forEach((methodName: any) => {
      const originalMethod = methods[methodName];
      console.log('-----overwrite Components')
      methods[methodName] = function (...args: any) {
        const [event] = args;

        // 核心识别逻辑：捕获所有catchtap事件
        if (event &&
          event.type === 'tap' &&
          event.currentTarget.dataset.isCatchEvent) {
          console.log('-----overwrite Components event')

          // 异步上报避免阻塞主线程
          // setTimeout(() => {
          //   reportEvent('catchtap_click', {
          //     target: event.target.dataset.trackId,
          //     page: this.route,
          //     timestamp: Date.now()
          //   });
          // }, 0);

        }

        return originalMethod.apply(this, args);
      };
    });

    return originalComponent(config);
  };

  // 全局事件上报函数
  function reportEvent(type: any, data: any) {
    wx.request({
      url: 'https://your-analytics-api.com/track',
      method: 'POST',
      data: { type, ...data },
      fail: () => {
        // 失败时存储到本地缓存
        const cachedEvents = wx.getStorageSync('track_cache') || [];
        cachedEvents.push({ type, ...data });
        wx.setStorageSync('track_cache', cachedEvents);
      }
    });
  }
}

export const pageProxy = () => {
  const originalPage = Page;
  console.log('-----overwrite Pages')
  Page = function (config) {
    // 1. 复制原始配置对象
    const modifiedConfig = {...config};
    
    // 2. 遍历所有属性
    Object.keys(modifiedConfig).forEach(key => {
      const value = modifiedConfig[key];
      
      // 3. 只处理函数类型的属性（排除生命周期方法）
      if (typeof value === 'function' && !isLifecycleMethod(key)) {
        // @ts-expect-error
        modifiedConfig[key] = function (...args: any) {
          const [event] = args;
  
          // 核心识别逻辑：捕获所有catchtap事件
          if (event &&
            event.type === 'tap' &&
            event.currentTarget.dataset.isCatchEvent) {
            console.log('-----overwrite Pages event')
  
            // 异步上报避免阻塞主线程
            // setTimeout(() => {
            //   reportEvent('catchtap_click', {
            //     target: event.target.dataset.trackId,
            //     page: this.route,
            //     timestamp: Date.now()
            //   });
            // }, 0);
  
          }
  
          return value.apply(this, args);
        };
      }
    });
    
    // 4. 调用原始 Page
    originalPage(modifiedConfig);
  };
  
  // 判断是否是生命周期方法（不需要劫持）
  function isLifecycleMethod(methodName: any) {
    const lifecycleMethods = [
      'onLoad', 'onShow', 'onReady', 'onHide', 'onUnload',
      'onPullDownRefresh', 'onReachBottom', 'onShareAppMessage',
      'onPageScroll', 'onResize', 'onTabItemTap'
    ];
    return lifecycleMethods.includes(methodName);
  }
  

  // 全局事件上报函数
  function reportEvent(type: any, data: any) {
    wx.request({
      url: 'https://your-analytics-api.com/track',
      method: 'POST',
      data: { type, ...data },
      fail: () => {
        // 失败时存储到本地缓存
        const cachedEvents = wx.getStorageSync('track_cache') || [];
        cachedEvents.push({ type, ...data });
        wx.setStorageSync('track_cache', cachedEvents);
      }
    });
  }
}

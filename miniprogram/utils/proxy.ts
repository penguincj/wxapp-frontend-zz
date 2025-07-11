// import Tracker from "./tracker";
// const tracker = Tracker;

export const generatePublicLogParams = async () => {
  let parmas = {
    // event_id: '', // id
    // event_category: '',
    // properties: {},
    openid: '',
    device_info: {
      brand: '',
      model: '',
      system: '',
      platform: '',
      network: '',
    },
    platform_version: '',
    sdk_version: '',
    location_info: {
      lat: 0,
      lng: 0,
      city_name: '',
    },
    time_stamp: 0,

  };

  return parmas;
}

const publicLogParams = generatePublicLogParams();
console.log(publicLogParams)

export const componentProxy = (options: any) => {
  const originalComponent = Component;

  Component = (config: any) => {
    const { methods = {} as any } = config;
    // 劫持所有方法
    // 注入tracker到所有Component的lifetimes
    config.lifetimes = config.lifetimes || {};
    const { created: originalCreated } = config.lifetimes;
    
    config.lifetimes.created = function () {
      this.tracker = options.tracker; // 注入实例
      originalCreated?.call(this);
    };
    Object.keys(methods).forEach((methodName: any) => {
      const originalMethod = methods[methodName];
      methods[methodName] = function (...args: any) {
        const [event] = args;

        // 核心识别逻辑：捕获所有catchtap事件
        if (event &&
          event.type === 'tap' &&
          event.currentTarget.dataset.isCatchEvent) {
          // 异步上报避免阻塞主线程
          setTimeout(() => {
            options.tracker.report('componentClick', {pagename: 'todo'});
          }, 0);
        }

        return originalMethod.apply(this, args);
      };
    });

    return originalComponent(config);
  };

}

export const pageProxy = (options: any) => {
  const originalPage = Page;
  console.log('-----overwrite Pages')
  Page = function (config: any) {
    config.tracker = options.tracker;
    config._start_time = 0;
    console.log('Page config', config, options)

    const { 
      onShow: originalOnShow, 
      onHide: originalOnHide,
      onUnload: originalOnUnload,
      onShareAppMessage: originOnShareAppMessage,
     } = config;

    config.onShow = function (args: any) {
      console.log('onShow maidian------------');
      config._start_time = Date.now();
      config.tracker.report('pageview');
      originalOnShow?.call(this);
    };
    config.onHide = function (args: any) {
      console.log('onHide maidian------------');
      config.tracker.report('pageleave', {stay_time: Date.now() - config._start_time});
      originalOnHide?.call(this);
    };
    config.onUnload = function (args: any) {
      console.log('onUnload maidian------------');
      config.tracker.report('pageleave', {stay_time: Date.now() - config._start_time});
      originalOnUnload?.call(this);
    };

    config.onShareAppMessage = function (args: any) {
      console.log('onShare maidian------------');
      config.tracker.report('share');
      originOnShareAppMessage?.call(this);
    };

    // 1. 复制原始配置对象
    const modifiedConfig = {...config};
    
    // 2. 遍历所有属性
    Object.keys(modifiedConfig).forEach(key => {
      const value = modifiedConfig[key];
      
      // 3. 只处理函数类型的属性（排除生命周期方法）
      if (typeof value === 'function' && !isLifecycleMethod(key)) {
        modifiedConfig[key] = function (...args: any) {
          const [event] = args;
  
          // 核心识别逻辑：捕获所有catchtap事件
          if (event &&
            event.type === 'tap' &&
            event.currentTarget.dataset.isCatchEvent) {
            console.log('-----overwrite Pages event')
  
            // 异步上报避免阻塞主线程
            setTimeout(() => {
              config.tracker.report('componentClick', {pagename: 'todo'});
            }, 0);
  
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
  
}

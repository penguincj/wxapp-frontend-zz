// app.ts
import { clearAndFreshLoginStatus, getLocation, getMiniProgramVersion } from "./utils/util"
import Tracker from "./utils/tracker";
import { componentProxy, pageProxy } from "./utils/proxy";
import { getVersionList } from "./api/api";

var log = require('./utils/log');
let tracker = Tracker;
componentProxy({tracker});
// console.log('-----overwrite Components')
pageProxy({tracker});
App<IAppOption>({
  globalData: {
    scene_id: null, // 存储入口场景值
    audio: {
      bgAudio: null as any,
      audioList: [],
      playingIndex: 0,
      stored_audio: [] as string[],
      curExhibit: null as any,
      isPlay: false,
      lastPlayIndex: 0,
      duration: 0,
      totalTimeText: '00:00',
      exhibitlistParams: '',
      curUnitId: 0,
      curExhibition: -1,
      // curNarration: -1,
      curPackageId: -1,
      curRate: '1.0',
      isKeepPlaying: false,
      manualStop: false, // 手动关闭播放器
    },
    ai: {
      x: 0,
      y: 660,
    },
    play: {
      x: 320,
      y: 500,
    },
    system: {
      statusBarHeight: 0,
      bottomSafeHeight: 0, // 底部安全区域高度
    },
    userinfo: {
      nickname: '',
      avatar: '',
      userid: -1,
      openid: '',
    },
    token: '',
    logInfo: {
      device_info: {},
      platform_version: '',
      sdk_version: '',
      scene_id: -1,
    },
    version: '4.0.8',
    version_list: [],
    curVersionSwitch: 0,
    // 默认不展示拍照识文物，待首页接口拉取后再决定
    enablePhotoRecognition: false,
  },
  async onLaunch(options) {
    // 展示本地存储能力
    try {
      // let track = Tracker;
      // track.log('view', {pagename: 'index'});
      // track.log('view', {pagename: 'index2'});
      // track.log('view', {pagename: 'index3'});
      // track.log('view', {pagename: 'index4'});
      // track.flush();
      // console.log(track);

      // wx.clearStorage();
      // const logs = wx.getStorageSync('logs') || []
      // logs.unshift(Date.now())
      // wx.setStorageSync('logs', logs)
      this.globalData.scene_id = options.scene;
      this.globalData.logInfo.scene_id = options.scene;
      const { userinfo } = await clearAndFreshLoginStatus();
      await Promise.all([
        wx.getWindowInfo(), 
        wx.getDeviceInfo(), 
        wx.getAppBaseInfo(), 
        wx.getAccountInfoSync(), 
        wx.getStorageSync('userinfo')
      ]).then((values) => {
        console.log('values-----------', values)
        this.globalData.system.statusBarHeight = values[0].statusBarHeight;
        this.globalData.system.bottomSafeHeight = values[0].safeArea.height;
        const { brand, model, platform, system } = values[1];
        const { SDKVersion , version} = values[2];
        const { miniProgram } = values[3];
        // @ts-expect-error
        const { openid } = values[4];
        this.globalData.logInfo.device_info = {
          brand,
          model,
          platform,
          system,
          version: version,
        }
        this.globalData.logInfo.sdk_version = SDKVersion;
        this.globalData.logInfo.platform_version = miniProgram.version;
        this.globalData.logInfo.openid = openid || userinfo?.openid;
        log.info('track logInfo', values[3]);
      });

      // @ts-expect-error
      const { latitude, longitude } = await getLocation();
      this.globalData.logInfo.location_info = {
        lat: latitude,
        lng: longitude,
      }
      tracker.init(this.globalData.logInfo);
      
      tracker.flush();


      if (!wx.cloud) {
        console.error('请使用 2.2.3 或以上的基础库以使用云能力 cloud')
      } else {
        wx.cloud.init({
          // env 参数说明：
          //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资 源 
          env: 'cloud1-7grz6n8i7da33fb5',
          traceUser: true,
        })
        console.log('cloud init');
        // const client = init(wx.cloud)
        // const models = client.models
              
      // // 用户的输入，这里我们以某个报错信息为例
      // const userInput =
      // "我的小程序这个报错是什么意思：FunctionName parameter could not be found";

      // const res = await wx.cloud.extend.AI.bot.sendMessage({
      //   data: {
      //     botId: "bot-7acc137c", // 第2步中获取的Agent唯一标识
      //     msg: userInput, // 用户的输入
      //     history: [], // 历史对话的内容，这里我们是第一轮对话，所以可以不传入
      //   },
      //   });
      //   console.log('cloud res：');

      //   for await (let x of res.textStream) {
      //     console.log(x);
      //   }
      }
    } catch (error) {
      console.log(error)
      log.error(error) 
    }

    const version = getMiniProgramVersion();
    const version_list: any = await getVersionList();
    if(version_list && version_list.code === 0) {
      this.globalData.version_list = version_list.data || [];
      // 检查是否有新的版本
      const newVersion = this.globalData.version_list.find((item: any) => (item.miniapp_version === version));
      if (newVersion) {
        this.globalData.curVersionSwitch = newVersion.switch;
        console.log('newVersion.switch', newVersion.switch)
      }
    }
    

    const onErrorCallback = function(msg: any) {
      console.error('wx:onError:', msg)
      try {
        if (['APP-SERVICE-SDK', 'webviewSDKScriptError', 'webviewScriptError'].some(key => msg.indexOf(key) > -1)) {
          // 基础库报错
          // 上报
          log.error('baseError', msg)
        } else {
          // 上报
          log.error('jsError', msg)
        }
      } catch (e) {
        console.error(e)
      }
    };
    const onUnhandledRejectionCallback = function(event: any = {}) {
      console.error('wx:onUnhandledRejection:', event)
      const { reason } = event
      // 上报
      log.error('unhandledRejection', reason)
    }
    wx.onError && wx.onError(onErrorCallback)
    
   wx.onUnhandledRejection(onUnhandledRejectionCallback)
    
  },
  onShow(options) {
    // 每次冷启动恢复时更新场景值
    this.globalData.scene_id = options.scene;
  },

})

// app.ts
import { clearAndFreshLoginStatus, getCurrentCity } from "./utils/util"

var log = require('./utils/log');
App<IAppOption>({
  globalData: {
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
    },
    ai: {
      x: 280,
      y: 400,
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
    },
    token: '',
  },
  async onLaunch() {
    // 展示本地存储能力
    try {
      // wx.clearStorage();
      // const logs = wx.getStorageSync('logs') || []
      // logs.unshift(Date.now())
      // wx.setStorageSync('logs', logs)
      let sysInfo = wx.getWindowInfo();
      log.info('system',sysInfo);
      this.globalData.system.statusBarHeight = sysInfo.statusBarHeight;
      this.globalData.system.bottomSafeHeight = sysInfo.safeArea.height;
      clearAndFreshLoginStatus();


      const city = await getCurrentCity();
      log.info('cityname', city);
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

    const getAICha = async () => {
     
      // 创建模型
      
    };

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

})
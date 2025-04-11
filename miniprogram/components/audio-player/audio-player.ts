// const backgroundAudioManager = wx.getBackgroundAudioManager()

// backgroundAudioManager.title = '此时此刻'
// backgroundAudioManager.epname = '此时此刻'
// backgroundAudioManager.singer = '许巍'
// backgroundAudioManager.coverImgUrl = 'http://y.gtimg.cn/music/photo_new/T002R300x300M000003rsKF44GyaSk.jpg?max_age=2592000'
// 设置了 src 之后会自动播放

Component({
    properties: {
        isPlay: {
          type: Boolean,
          value: false
        },
        //是否自动播放
        autoplay: {
            type: Boolean,
            value: false
        },
        // 音频title
        videotitle: {
            type: String,
            value: 'unknown'
        },
        // 音频封面图片url地址
        coverurl: {
            type: String,
            value: "",
        },
        // wangye
        sliderIndex: {
            type: Number,
            value: 0,
        },
        duration: {
            type: Number,
            value: 0,
        },
        currentTimeText: {
            type: String,
            value: '00:00'
        },
        totalTimeText: {
            type: String,
            value: '00:00'
        },
    },
    data: {
        // totalTimeText: '00:00', //视频总长度文字
        // currentTimeText: '00:00:00', //视频已播放长度文字

        isPlaying: false, //播放状态

        // sliderIndex: 0, //滑块当前值
        maxSliderIndex: 100, //滑块最大值

        isReadyPlay: false, //是否已经准备好可以播放了

        isLoop: false, //是否循环播放

        speedValue: [0.5, 0.8, 1.0, 1.25, 1.5, 2.0],
        speedValueIndex: 2,
        playSpeed: '1.0', //播放倍速 可取值：0.5/0.8/1.0/1.25/1.5/2.0

        // stringObject: (data) => {
        // 	return typeof(data)
        // },
        // innerAudioContext: uni.createInnerAudioContext(),
        lastAudioUrl: '',
        bgAudioManager: null as any,
    },
    methods: {
      handlePlayChange() {
        console.log('in compont audio player', this.data.isPlaying);
        this.setData({
          isPlaying: !this.data.isPlaying,
        });
        this.triggerEvent('PlayStateChange', {
          state: !this.properties.isPlay,
        })
      },
      handleBackProgress() {
        console.log('in compont audio player handleBackProgress');
        this.triggerEvent('BackProgress');

      },
      handleForwordProgress() {
        console.log('in compont audio player handleForwordProgress');
        this.triggerEvent('ForwordProgress');
      },
      handlePlayNext() {
        console.log('in compont audio player handlePlayNext');
        this.triggerEvent('PlayNext');
      },
      handlePlayPrev() {
        console.log('in compont audio player handlePlayPrev');
        this.triggerEvent('PlayPrev');
      },
      handlePlayRate() {
        console.log('in compont audio player handlePlayRate');
        this.triggerEvent('PlayRate', {
          rate: 1,
        });
      }
      
        // calTimeTxt(time: number) {
        //     return time +'00:12';
        // },
        // //销毁innerAudioContext()实例
        // audioDestroy() {
        //     if (this.data.bgAudioManager) {
        //         // this.innerAudioContext.destroy();
        //         this.data.bgAudioManager.pause();
        //         this.setData({
        //             isPlaying: false,
        //         })
        //     }
        // },
        // //点击变更播放状态
        // handleChangeAudioState() {
        //     console.log('in handleChangeAudioState....')
        //     if (this.data.isPlaying && !this.data.bgAudioManager.paused) {
        //         this.audioPause();
        //     } else {
        //         this.audioPlay();
        //     }
        // },
        // //开始播放
        // audioPlay() {
        //     // 每次播放时必须调用的函数
        //     console.log('audioPlay', this.data.bgAudioManager.src)
        //     if (this.data.bgAudioManager.src !== this.data.lastAudioUrl) {
        //         this.setData({
        //             sliderIndex: 0,
        //         })
        //     }

        //     this.data.bgAudioManager.seek(Number(this.data.sliderIndex) || 0)
        //     this.data.bgAudioManager.play();
        //     this.setData({
        //         isPlaying: true,
        //         lastAudioUrl: this.data.bgAudioManager.src
        //     })

        //     // this.backgroundAudioInit(this.data.bgAudioManager.src);
        // },
        // //暂停播放
        // audioPause() {
        //     // 每次暂停播放时必调用
        //     this.data.bgAudioManager.pause();
        //     this.setData({
        //         isPlaying: false,
        //     })
        //     console.log('暂停播放...2');
        // },
        // //变更滑块位置
        // handleSliderChange(e: any) {
        //     console.log('handleSliderChange handleSliderChange');
        //     this.changePlayProgress(e.detail ? e.detail.value : e)
        // },
        // //更改播放倍速
        // handleChageSpeed() {
        //     //获取播放倍速列表长度
        //     let speedCount = this.data.speedValue.length;
        //     //如果当前是最大倍速，从-1开始
        //     if (this.data.speedValueIndex == (speedCount - 1)) {
        //         this.setData({
        //             speedValueIndex: -1,
        //         })
        //     }
        //     //最新倍速序号
        //     //获取最新倍速文字
        //     this.setData({
        //         speedValueIndex: this.data.speedValueIndex + 1,
        //         playSpeed: this.data.speedValue[this.data.speedValueIndex].toFixed(1)
        //     })
        //     //暂停播放
        //     this.audioPause();
        //     //变更播放倍速
        //     this.data.bgAudioManager.playbackRate(this.data.speedValue[this.data.speedValueIndex]);
        //     //开始播放
        //     this.audioPlay();
        // },
        // //快退15秒
        // handleFastRewind() {
        //     if (this.data.isReadyPlay) {
        //         let value = parseInt(String(this.data.sliderIndex)) - 15;
        //         this.changePlayProgress(value >= 0 ? value : 0);
        //     }
        // },
        // //快进15秒
        // handleFastForward() {
        //     console.log(' in handleFastForward....111 ');
        //     const dur = this.data.bgAudioManager.duration;
        //     if (this.data.isReadyPlay) {
        //         let value = parseInt(String(this.data.sliderIndex)) + 15;
        //         this.changePlayProgress(value <= dur ? value : dur);
        //     }
        // },
        // //开启循环播放
        // handleLoopPlay() {
        //     this.setData({
        //         isLoop: !this.data.isLoop,
        //     })
        //     if (this.data.isLoop) {
        //         wx.showToast({
        //             title: '已开启循环播放',
        //             duration: 1000
        //         });
        //     } else {
        //         wx.showToast({
        //             title: '取消循环播放',
        //             duration: 1000
        //         });
        //     }
        // },
        // //更改播放进度
        // changePlayProgress(value: any) {
        //     this.data.bgAudioManager.seek(value);
        //     this.setData({
        //         sliderIndex: value,
        //         currentTimeText: this.getFormateTime(value)
        //     })
        // },
        // //秒转换为00:00:00
        // getFormateTime(time = 0) {
        //     let ms = time * 1000; // 1485000毫秒
        //     let date = new Date(ms);

        //     // 注意这里是使用的getUTCHours()方法，转换成UTC(协调世界时)时间的小时
        //     let hour = date.getUTCHours();
        //     // let hour = date.getHours(); 如果直接使用getHours()方法，则得到的时分秒格式会多出来8个小时（在国内开发基本都是使用的是东八区时间），getHours()方法会把当前的时区给加上。
        //     let minute = date.getMinutes();
        //     let second = date.getSeconds();

        //     let formatTime =
        //         `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;

        //     return formatTime;
        // },
        // //秒转换为00:00
        // getFormateTime2(time = 0) {
        //     let ms = time * 1000; // 1485000毫秒
        //     let date = new Date(ms);

        //     // 注意这里是使用的getUTCHours()方法，转换成UTC(协调世界时)时间的小时
        //     let hour = date.getUTCHours();
        //     // let hour = date.getHours(); 如果直接使用getHours()方法，则得到的时分秒格式会多出来8个小时（在国内开发基本都是使用的是东八区时间），getHours()方法会把当前的时区给加上。
        //     let minute = date.getMinutes();
        //     let second = date.getSeconds();

        //     let formatTime =
        //         `${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;

        //     return formatTime;
        // },
        // handleCollec() {
        //     this.triggerEvent('audioCollec');
        // },
        // handleShare() {
        //     this.triggerEvent('audioShare');
        // },

        // // backgroundAudioInit(video_src = "") {
        // //     // if (this.data.bgAudioManager) return;
        // //     this.data.bgAudioManager = null;
        // //     const { videotitle, coverurl } = this.properties;
        // //     console.log("音频-backgroundAudioInit", video_src);
        // //     this.setData({
        // //         bgAudioManager: wx.getBackgroundAudioManager(),
        // //     });
        // //     // src赋值时自动会播放
        // //     const bgAudioManager = {
        // //         ...this.data.bgAudioManager,
        // //         title: videotitle,
        // //         singer: '博物岛屿独家解说',
        // //         coverImgUrl: coverurl,
        // //         epname: videotitle,
        // //         src: video_src,
        // //     }
        // //     this.setData({
        // //         bgAudioManager,
        // //     })

        // //     // this.audioPlay();
        // //     //   if (!this.autoPlay) {
        // //     //     this.isPlaying = false;
        // //     //     this.data.bgAudioManager.pause();
        // //     //   }
        // //     wx.nextTick(() => {
        // //         this.onBgCanplay();
        // //         this.onBgTimeUpdate();
        // //         this.onBgEnded();
        // //         this.onBgPlay();
        // //         this.onBgPause();
        // //         this.onBgError();
        // //         this.onBgNext();
        // //         this.onBgPre();
        // //     })
           
        // // },
        // backgroundAudioInit(video_src = "") {
        //     // if (this.data.bgAudioManager) return;
        //     this.data.bgAudioManager = null;
        //     const { videotitle, coverurl } = this.properties;
        //     console.log("音频-backgroundAudioInit", video_src);
        //     this.setData({
        //         bgAudioManager: wx.getBackgroundAudioManager(),
        //     });
        //     // src赋值时自动会播放
        //     const bgAudioManager = {
        //         ...this.data.bgAudioManager,
        //         title: videotitle,
        //         singer: '博物岛屿独家解说',
        //         coverImgUrl: coverurl,
        //         epname: videotitle,
        //         src: video_src,
        //     }
        //     this.setData({
        //         bgAudioManager,
        //     }, () => {
        //         console.log('bgAudioManager', this.data.bgAudioManager);
        //         this.data.bgAudioManager.seek(0);
        //         this.data.bgAudioManager.play();

        //     })

        //     // this.audioPlay();
        //     //   if (!this.autoPlay) {
        //     //     this.isPlaying = false;
        //     //     this.data.bgAudioManager.pause();
        //     //   }
        //     // wx.nextTick(() => {
        //     //     this.onBgCanplay();
        //     //     this.onBgTimeUpdate();
        //     //     this.onBgEnded();
        //     //     this.onBgPlay();
        //     //     this.onBgPause();
        //     //     this.onBgError();
        //     //     this.onBgNext();
        //     //     this.onBgPre();
        //     // })
           
        // },
        // /**
        //  * uni.getBackgroundAudioManager事件监听
        //  */
        // onBgCanplay() {
            
        //     console.log('333', this.data.bgAudioManager)
        //     this.data.bgAudioManager.onCanplay(() => {
                
        //         console.log("音频-onBgCanplay-背景可播放状态");
        //         this.setData({
        //             isReadyPlay: true,
        //         })
        //         this.triggerEvent('audioCanplay');

        //         let duration = this.data.bgAudioManager.duration;
        //         console.log('总时长', duration)

        //         //将当前音频长度秒转换为00：00：00格式
        //         this.setData({
        //             totalTimeText: this.getFormateTime(duration),
        //             maxSliderIndex: Number(parseFloat(duration).toFixed(2)),
        //         })

        //         //防止视频无法正确获取时长
        //         setTimeout(() => {
        //             duration = this.data.bgAudioManager.duration;
        //             //将当前音频长度秒转换为00：00：00格式
        //             this.setData({
        //                 totalTimeText: this.getFormateTime(duration),
        //                 maxSliderIndex: Number(parseFloat(duration).toFixed(2)),
        //             });
        //             //console.log('总时长2', this.totalTimeText)
        //         }, 300)
        //         // if (!this.autoPlay) {
        //         //   this.audioPause();
        //         // }
        //     });
        // },
        // onBgTimeUpdate() {
        //     this.data.bgAudioManager.onTimeUpdate(() => {
        //         // if (!Number.isFinite(this.data.bgAudioManager.duration)) {
        //         //   this.duration = this.data.bgAudioManager.currentTime + 10;
        //         //   this.currentTime = this.data.bgAudioManager.currentTime;
        //         // } else {
        //         //   this.duration = this.data.bgAudioManager.duration;
        //         //   this.currentTime = this.data.bgAudioManager.currentTime;
        //         // }
        //         this.setData({
        //             sliderIndex: Number(parseFloat(this.data.bgAudioManager.currentTime).toFixed(2)),
        //             currentTimeText: this.getFormateTime(this.data.bgAudioManager.currentTime),
        //         });

        //     });
        // },
        // onBgEnded() {
        //     this.data.bgAudioManager.onEnded(() => {
        //         console.log("音频-onBgEnded-背景播放end");
        //         this.setData({
        //             isPlaying: !this.data.isPlaying,
        //         })
        //         this.triggerEvent('audioEnd');

        //         if (this.data.isLoop) {
        //             this.changePlayProgress(0);
        //             this.data.bgAudioManager.play();
        //         }
        //     });
        // },
        // onBgPlay() {
        //     console.log("onBgPlay");
        //     this.data.bgAudioManager.onPlay(() => {
        //         console.log("音频onBgPlay背景播放play");
        //         // this.isPlaying = false;
        //         // this.currentTime = this.data.bgAudioManager.currentTime + 10;
        //         // this.flag = true;
        //         this.setData({
        //             isPlaying: true,
        //         })
                
        //         this.triggerEvent('audioPlay');
        //         this.triggerEvent('change', { state: true })

        //         setTimeout(() => {
        //             this.setData({
        //                 maxSliderIndex: Number(parseFloat(this.data.bgAudioManager.duration).toFixed(2)),
        //             })
        //         }, 100)
        //     });
        // },
        // onBgPause() {
        //     console.log("onBgStop");
        //     this.data.bgAudioManager.onPause(() => {
        //         console.log("音频-onBgStop-背景播放onPause");
        //         // this.isPlaying = false;
        //         // this.currentTime = this.data.bgAudioManager.currentTime + 10;
        //         // this.flag = true;
        //         this.triggerEvent('audioPause');
        //         this.triggerEvent('change', { state: false });
        //         console.log("onBgStop");
        //     });
        // },
        // onBgError() {
        //     console.log('onBgError');
        //     this.data.bgAudioManager.onError((res: any) => {
        //         console.log("音频-onBgStop-背景播放onBgError");
        //         console.log('音频播放错误....', res.errMsg);
        //         console.log(res.errCode);
        //         this.triggerEvent('change', {
        //             state: false
        //         });
        //         this.audioPause();
        //         this.triggerEvent('audioError', { data: res });
        //     })
        // },
        // onBgNext() {
        //     console.log('onBgNext');
        //     this.data.bgAudioManager.onNext(() => {
        //         console.log("音频-onBgNext-背景播放onBgNext");
        //         this.triggerEvent('audioNext');
        //     })
        // },
        // onBgPre() {
        //     console.log('onBgPre');
        //     this.data.bgAudioManager.onPrev(() => {
        //         console.log("音频-onBgPre-背景播放onBgPre");
        //         this.triggerEvent('audioPre');
        //     })
        // },
    },

    lifetimes: {
        attached() {
            // console.log("mounted src = ", this.data.audiourl)

            // const video_src = typeof (this.data.audiourl) == 'string' ? this.data.audiourl : this.data.audiourl[0];
            // if (!this.data.bgAudioManager) {
            //     this.backgroundAudioInit(video_src);
            //     setTimeout(() => {
            //         // this.audioPause();
            //     }, 300)

            // }
        },
    },

})


Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的属性列表
   */
  properties: {
    extClass: {
      type: String,
      value: ''
    },
    title: {
      type: String,
      value: ''
    },
    background: {
      type: String,
      value: ''
    },
    color: {
      type: String,
      value: ''
    },
    back: {
      type: Boolean,
      value: true
    },
    loading: {
      type: Boolean,
      value: false
    },
    homeButton: {
      type: Boolean,
      value: false,
    },
    animated: {
      // 显示隐藏的时候opacity动画效果
      type: Boolean,
      value: true
    },
    show: {
      // 显示隐藏导航，隐藏的时候navigation-bar的高度占位还在
      type: Boolean,
      value: true,
      observer: '_showChange'
    },
    // back为true的时候，返回的页面深度
    delta: {
      type: Number,
      value: 1
    },
    styleType: {
      type: String,
      value: 'light',
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    displayStyle: '',
    statusBarHeight: '0px',
    isShowHome: false,
  },
  lifetimes: {
    attached() {
      const rect = wx.getMenuButtonBoundingClientRect()
      wx.getSystemInfo({
        success: (res) => {
          // console.log('getMenuButtonBoundingClientRect', res, rect)
          const isAndroid = res.platform === 'android'
          const isDevtools = res.platform === 'devtools'
          this.setData({
            ios: !isAndroid,
            // innerPaddingRight: `padding-right: ${res.windowWidth - rect.left}px`,
            innerPaddingRight: `padding-right: 10px`,
            // leftWidth: `width: ${res.windowWidth - rect.left }px`,
            leftWidth: `width: 40px`,
            safeAreaTop: isDevtools || isAndroid ? `;height: calc(var(--height) + ${res.safeArea.top}px); padding-top: ${res.safeArea.top}px` : ``
          })
        }
      })
    },
  },
  pageLifetimes: {
    show() {
      const hei = getApp().globalData.system.statusBarHeight;
      this.setData({
        statusBarHeight: hei + 'px'
      });
      const pages = getCurrentPages();
      console.log('hei navigationBarHeight', this.data.back);

      if (pages.length === 1 && this.data.back ) {
        this.setData({
          isShowHome: true,
        })
      } else {
        this.setData({
          isShowHome: false,
        })
      }

    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    _showChange(show: boolean) {
      const animated = this.data.animated
      let displayStyle = ''
      if (animated) {
        displayStyle = `opacity: ${
          show ? '1' : '0'
        };transition:opacity 0.5s;`
      } else {
        displayStyle = `display: ${show ? '' : 'none'}`
      }
      this.setData({
        displayStyle
      })
    },
    handleBack() {
      const data = this.data
      if (data.delta) {
        wx.navigateBack({
          delta: data.delta
        })
      }
      this.triggerEvent('back', { delta: data.delta }, {})
    },
    handleClickHome() {
      console.log('handleClickHome')
      wx.switchTab({
        url: '/pages/index/index',
        success(res) {
          console.log('res', res)
        },
        fail(res) {
          console.log('res', res)
        },
      })
    },

  
  },
})

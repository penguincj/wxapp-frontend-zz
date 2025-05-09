const app = getApp()

Component({
  properties: {
    dataList: {
      type: Object,
      value: [] as any
    },
    title: {
      type: String,
      value: ''
    },
    dateData: {
      type: Object,
      value: {},
    }
  },

  data: {
    totalGuests: 1,
    currentGuestIndex: 0,
    swiperList: [] as any,
    clientWidth: 0,
    towerStart: 0,
    swiperCurrent: 0,
    enabled: true,
  },

  lifetimes: {
    attached: function () {
      this.setData({
        clientWidth: wx.getSystemInfoSync().windowWidth,
        currentGuestIndex: 0,
        totalGuests: this.data.dataList.length
      })
    },
  },

  methods: {
    handleClickItem() {  
      const idx = this.data.swiperList[this.data.currentGuestIndex].id;
      console.log(idx);
      this.triggerEvent('ClickItem', {
        id: idx,
      })
    },
    towerSwiper(_list: any) {
      const len = _list.length;
      const newlist = _list.map((item: any, index: number) => {
        if (index === 0) {
          return {
            zIndex: len - index,
            rotate: '0deg',
            showData: true,
            opacity: 1,
            blur: '0px',

            ..._list[0],
          }
        } else if (index === 1) {
          return {
            zIndex: len - index,
            rotate: '-7deg',
            showData: true,
            opacity: 1,
            blur: '3px',
            ..._list[1],
          }
        } else if (index === 2) {
          return {
            zIndex: len - index,
            rotate: '-14deg',
            showData: true,
            opacity: 1,
            blur: '3px',
            ..._list[2],
          }
        } else {
          return {
            zIndex: len - index,
            rotate: '-14deg',
            showData: true,
            opacity: 0,
            blur: '3px',
            ..._list[index],
          }
        }
      })

      this.setData({
        swiperList: newlist
      })
    },
    // towerSwiper触摸开始
    towerStart(e: any) {
      this.setData({
        towerStart: e.touches[0].pageX
      })
    },
    // towerSwiper计算滚动
    towerEnd(e: any) {
      console.log(e);
      const valueTouch = Math.abs(e.changedTouches[0].pageX - this.data.towerStart) > 50 ? true : false
      if(!valueTouch) {
        console.log('! valuetouch');
        this.handleClickItem();
        return
      }
      const direction = e.changedTouches[0].pageX - this.data.towerStart > 0 ? 'right' : 'left'
      const list : any = this.data.swiperList
      const clientWidth = this.data.clientWidth
      const len = this.data.dataList.length;
      console.log('direction', direction);
      
      if (direction == 'right') {
        if(this.data.currentGuestIndex > 0) {
          const preDataIndex = this.data.currentGuestIndex - 1
          const newList = list.map((item: any, index: number) => {
            const zIdx = item.zIndex;
            if (index === preDataIndex) {
              return {
                ...item,
                zIndex : len,
                rotate : '0deg',
                blur: '0px',
                opacity: 1,
              }
            } else if (index === preDataIndex + 1) {
              return {
                ...item,

                zIndex : zIdx - 1,
                rotate : '-7deg',
                blur: '3px',
                opacity: 1,

              }
            } else if (index === preDataIndex + 2) {
              return {
                ...item,

                zIndex : zIdx - 1,
                rotate : '-14deg',
                blur: '3px',
                opacity: 1,

              }
            } else {
              return {
                ...item,

                zIndex : (zIdx - 1) % len,
                rotate : '-14deg',
                blur: '3px',
                opacity: 0,

              }
            }
           
          })
          this.setData({
            swiperList: newList,
            currentGuestIndex: preDataIndex
          })
        }
      } else {
        if(this.data.currentGuestIndex + 2 <= this.data.dataList.length) {
          const nextDataIndex = this.data.currentGuestIndex + 1
          const newList = list.map((item : any, index: number) => {
            const zIdx = item.zIndex;
            if (index === nextDataIndex) {
              console.log('index === nextDataIndex', item, nextDataIndex, zIdx);
              return {
                ...item,
                zIndex : zIdx + 1,
                rotate : '0deg',
                blur: '0px',
                opacity: 1,
              }
            } else if (index === nextDataIndex + 1) {
              return {
                ...item,

                zIndex : zIdx + 1,
                rotate : '-7deg',
                blur: '3px',
                opacity: 1,
              }
            } else if (index === nextDataIndex + 2) {
              return {
                ...item,
                zIndex : zIdx + 1,
                rotate : '-14deg',
                blur: '3px',
                opacity: 1,
              }
            } else {
              return {
                ...item,
                zIndex : (zIdx + 1) % len,
                rotate : '-14deg',
                blur: '3px',
                opacity: 0,
              }
            }
          })
          console.log('newlist 2', newList);

          this.setData({
            swiperList: newList,
            currentGuestIndex: nextDataIndex
          })
        }

      } 

    },
    towerStartFather(e:any) {
      console.log('towerStartFather')
    },
    towerEndFather(e:any) {
      console.log('towerEndFather')

    },
  },
  observers: {
    'dataList': function(dataList) {
      console.log('dataList changed', this.data.dataList, dataList);
      
      this.towerSwiper(dataList);
      this.setData({
        currentGuestIndex: 0,
      })
    }
  }
})

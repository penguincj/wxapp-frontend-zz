// index.ts
// 获取应用实例
// const app = getApp<IAppOption>()
import { audioList } from './mock';

Component({
  data: {
    likeList: [] as any,
    loading: false
  },
  methods: {

  },
  pageLifetimes: {
    show() {
     this.setData({
      likeList: audioList,
     })
    }
  },
  lifetimes: {
    attached() {
      setTimeout(() => {
        this.setData({
          loading: false,
        })
      }, 1000)
    },
  },

});

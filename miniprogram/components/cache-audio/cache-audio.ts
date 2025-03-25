const store_file_path: string[] = [];

Component({
  properties: {
    audiolist: {
      type: Array,
      value: [],
    },
    playingIndex: {
      type: Number,
      value: 0,
    }
  },
  data: {
    progress: 0,
  },
  methods: {
    handleDownloadFile() {
      console.log('handleDownloadFile');
      // const audiolist = ['https://gewugo.com/storage/file/CB26976399343756.mp3', 'https://gewugo.com/storage/file/HB26976402540987.mp3'];
      const file_arr = [];
      console.log('audiolist',this.data.audiolist)
      for (let i = 0; i < this.data.audiolist.length; i++) {
        const url = this.data.audiolist[i];
        // this.batchDownload(url).then(()=> {
        //     console.log('@@@@'+i+'sucess!!!')
        // });
        console.log(url)
        file_arr.push(this.batchDownload(url))
      }
      this.allWithProgress(file_arr, (progress: any) => {
        console.log(progress);
        console.log(store_file_path.length);
      }).then(() => {
        console.log('store_file_path', store_file_path);
        wx.setStorage({
          key: 'audios',
          data: store_file_path,
        })
      })
    },
    allWithProgress(requests: any, callback: any) {
      let index = 0;
      const len = requests.length;
      requests.forEach((item: any) => {
        item.then(() => {
          index++;
          const progress = Math.floor(index * 100 / len);
          this.setData({
            progress,
          })
          callback(progress);
        })
      });
      return Promise.all(requests);
    },

    batchDownload(_url: string) {
      return new Promise((resolve, reject) => {
        const file_name = _url.split('/audio/')[1].split('.mp3')[0];
        console.log('file_name', _url)
        // filePath: wx.env.USER_DATA_PATH + '/' + 'gewugo-' + file_name + '.mp3',

        return wx.downloadFile({
          url: _url,
          filePath: wx.env.USER_DATA_PATH + '/' + 'gewugo-' + file_name + '.mp3',
          success(res) {
            resolve(res);
            console.log('res', res);
            const path = res.filePath;
            
            // wx.setStorage({
            //     key: 'audios',
            //     data: path,
            // })
            store_file_path.push(path);
          },
          fail(error) {
            console.log('error', error);
            reject(error);
          }
        })
      })
    }
  },

  lifetimes: {
    attached() {

    },
  },

})

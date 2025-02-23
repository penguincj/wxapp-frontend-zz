let intervalId: any = undefined ;

Component({
  properties: {
    progress: Number, // 分数, 0~1
    activeColor: {
      type: String,
      value: '#2C2F3B',
    },
    curId: {
      type: Number,
      value: 0,
    },
  },
  data: {
    lastId: -1,
  },


  lifetimes: {
    ready() {
      this.initCanvas();
    },
  },
  methods: {
    initCanvas() {
      const query = this.createSelectorQuery();
      query
        .select('#ring')
        .fields({ node: true, size: true })
        .exec(res => {
          const canvas = res[0].node;
          const ctx = canvas.getContext('2d');
          const width = res[0].width; // 画布宽度
          const height = res[0].height; // 画布高度
          
          const dpr = 3;
          canvas.width = width * dpr ;
          canvas.height = height * dpr;
          ctx.scale(dpr, dpr);
          if(intervalId) {
            clearInterval(intervalId);
          }
          this.IntervalDrawProgress(ctx, width, height); // 绘制进度条
        });
    },
    checkRefresh(ctx: any, width: any, height: any) {
      if (this.data.lastId !== this.data.curId) {
        console.log('progress this.data.lastId !== this.data.curId');
        
        ctx.clearRect(0, 0, width, height);
      }
    },
    /**
     * 绘制环形进度条
     */
    drawProgress(ctx: any, width: any, height: any) {
      // console.log('progress', this.data.progress)
      // 先画下面的底色，一个整圆
      // ctx.beginPath();
      // ctx.arc(width, height, width/2, 0, 2 * Math.PI);
      // // 底色用灰色
      // ctx.strokeStyle = "red";
      // ctx.stroke();
      // ctx.closePath();
      this.checkRefresh(ctx, width, height);
      // 进度
      ctx.beginPath();
      ctx.arc(
        width / 2,
        height / 2,
        width / 2 - 4,
        (0 - 90) * Math.PI / 180,
        ((360 * (this.data.progress + 0.01) - 90) * Math.PI) / 180
      );
      ctx.lineWidth = 2;
      // ctx.lineCap = 'round';
      ctx.strokeStyle = this.data.activeColor;
      ctx.stroke();

      this.setData({
        lastId: this.data.curId,
      });

    },

    IntervalDrawProgress(ctx: any, width: any, height: any) {

      intervalId = setInterval(() => {
        this.drawProgress(ctx, width, height)
        if (this.data.progress > 0.98) {
          clearInterval(intervalId);
        }
      }, 1000)
    }

    
  },
  observers: {
    'curId': function(cur_id) {
      console.log('cur_id changed', cur_id);
      // clearInterval(intervalId);
      this.initCanvas();

    }
  }
});

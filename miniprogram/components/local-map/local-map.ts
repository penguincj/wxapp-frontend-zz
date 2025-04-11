
Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的属性列表
   */
  properties: {
    Exhpoints: {
      type: Object,
      value: {},
    },
    currentPointIdx: {
      type: Number,
      value: 0,
    }
  },
  /**
   * 组件的初始数据
   */
  data: {

  },
  lifetimes: {
    attached() {

    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    drawCanvas() {
      const points = Object.values(this.data.Exhpoints);
      const currentPointIdx = this.data.currentPointIdx;
      console.log('points', currentPointIdx)
      var windowWidth = wx.getWindowInfo().windowWidth
      console.log('windowWidth', windowWidth)
      const scale = windowWidth / 375;
      // return
      const query = this.createSelectorQuery();
      query
        .select('#myCanvas')
        .fields({ node: true, size: true })
        .exec(res => {
          
          const canvas = res[0].node;
          // 渲染上下文
          const ctx = canvas.getContext('2d')


          // Canvas 画布的实际绘制宽高
          const width = res[0].width
          const height = res[0].height

          // 初始化画布大小
          const dpr = wx.getWindowInfo().pixelRatio
          canvas.width = width * dpr
          canvas.height = height * dpr
          ctx.scale(dpr, dpr)
          // 省略上面初始化步骤，已经获取到 canvas 对象和 ctx 渲染上下文
          // 
          // 清空画布
          ctx.clearRect(0, 0, width, height)
          console.log('width', width)
          console.log('width height', height)

          // let currentPointIdx = 1;
          const grayPoints = points.slice(0, currentPointIdx + 1);
          const redPoints = points.slice(currentPointIdx, points.length);

          this.drawLine('#5DAC6D', grayPoints, ctx, 2, scale);
          this.drawLine('#CED0D3', redPoints, ctx, 1, scale);
          this.drawLoc(canvas, ctx, points[currentPointIdx], scale);
          this.drawDirection(canvas, ctx, points, scale);

        })
    },
    drawDirection(_canvas: any, _ctx: any, _points: any, _scale: number = 1) {
      let left = [];
      let right = [];
      let top = [];
      let bottom = [];
      for (let i = 0; i < _points.length - 1; i++) {
        const p1 = _points[i];
        const p2 = _points[i + 1];
        if (p1[0] === p2[0]) {
          if (p1[1] < p2[1]) {
            // console.log('bottom');
            bottom.push([p1[0], (p1[1] + p2[1]) / 2]);
          } else {
            // console.log('top');
            top.push([p1[0], (p1[1] + p2[1]) / 2]);
          }
        } else if (p1[1] === p2[1]) {
          if (p1[0] < p2[0]) {
            // console.log('right');
            right.push([(p1[0] + p2[0]) / 2, p1[1]])
          } else {
            // console.log('left');
            left.push([(p1[0] + p2[0]) / 2, p1[1]])
          }
        }
      }

      const dirFuc = function (_dir: any) {
        const _dir_res = [];
        for (let i = 0; i < _dir.length - 1; i++) {
          const a1 = _dir[i];
          const a2 = _dir[i + 1];
          if (a1[0] === a2[0]) {
            if (Math.abs(a1[1] - a2[1]) < 20) {
              _dir_res.push([a1[0], (a1[1] + a2[1]) / 2])
              i++;
            }
          } else if (a1[1] === a2[1]) {
            if (Math.abs(a1[0] - a2[0]) < 20) {
              _dir_res.push([(a1[0] + a2[0]) / 2, a1[1]])
              i++;
            }
          } else {
            _dir_res.push([a1[0], a1[1]])
          }
        }
        return _dir_res;
      }

      left = dirFuc(left);
      right = dirFuc(right);
      top = dirFuc(top);
      bottom = dirFuc(bottom);

      // left = dirFuc(left);
      // right = dirFuc(right);
      // top = dirFuc(top);
      // bottom = dirFuc(bottom);

      this.drawImages(_canvas, _ctx, left, 'https://wx.ajioang.cn/api/v1/storage/image/left-2382242687.png', _scale)
      this.drawImages(_canvas, _ctx, right, 'https://wx.ajioang.cn/api/v1/storage/image/right-9119674618.png', _scale)
      this.drawImages(_canvas, _ctx, top, 'https://wx.ajioang.cn/api/v1/storage/image/top-5035156405.png', _scale)
      this.drawImages(_canvas, _ctx, bottom, 'https://wx.ajioang.cn/api/v1/storage/image/bottom-9350203903.png', _scale)

      console.log('left:', left)
      console.log('right:', right)
      console.log('top:', top)
      console.log('bottom:', bottom)
    },
    drawLine(_color: string, _points: any, _ctx: any, _linewidth: number, _scale: number = 1) {
      _ctx.beginPath();
      _ctx.lineWidth = _linewidth;
      _ctx.strokeStyle = _color;
      _ctx.setLineDash([6, 6]);
      _ctx.moveTo(_points[0][0] * _scale, _points[0][1] * _scale);
      for (let i = 1; i < _points.length; i++) {
        _ctx.lineTo(_points[i][0] * _scale, _points[i][1] * _scale);
      }
      _ctx.stroke();
    },

    drawImages(_canvas: any, _ctx: any, _points: any, _imageSrc: string, _scale: number = 1) {
      const imgLoc = _canvas.createImage()
      imgLoc.src = _imageSrc;
      imgLoc.onload = () => {
        for (let i = 0; i < _points.length; i++) {
          _ctx.drawImage(imgLoc, (_points[i][0] - 4) * _scale, (_points[i][1] - 4) * _scale, 8 * _scale, 8 * _scale);
        }
      }
    },

    drawLoc(_canvas: any, _ctx: any, _point: any, _scale: number = 1) {
      const imgLoc = _canvas.createImage()
      // imgLoc.src = 'https\://wx.ajioang.cn/api/v1/storage/image/location-4930810257.webp';
      imgLoc.src = 'https://wx.ajioang.cn/api/v1/storage/image/location1-8053762002.png';
      imgLoc.onload = () => {
        _ctx.drawImage(imgLoc, (_point[0] - 15) * _scale, (_point[1] - 30) * _scale, 30 * _scale, 30 * _scale);
      }
    },
    clearCanvas() {
      const query = this.createSelectorQuery();
      query
        .select('#myCanvas')
        .fields({ node: true, size: true })
        .exec(res => {
        // Canvas 对象
        const canvas = res[0].node
        // 渲染上下文
        const ctx = canvas.getContext('2d');
        // Canvas 画布的实际绘制宽高
        const width = res[0].width
        const height = res[0].height
  
        // 初始化画布大小
        const dpr = wx.getWindowInfo().pixelRatio
        canvas.width = width * dpr
        canvas.height = height * dpr
        ctx.scale(dpr, dpr)
        // 省略上面初始化步骤，已经获取到 canvas 对象和 ctx 渲染上下文
        // 
        // 清空画布
        ctx.clearRect(0, 0, width, height)
      })
    },
  },
})

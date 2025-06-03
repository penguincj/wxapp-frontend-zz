// @ts-nocheck
import { getPosters, getExhibitionById, getMuseumById, getPostersOfMuseum } from "../../api/api";

Page({
  data: {
    posterInfo: {
      bgUrl: 'https://gewugo.com/api/v1/storage/image/Frame8@1x-3092466763.webp', // 替换为你的背景图URL
      fucengUrl: 'https://gewugo.com/api/v1/storage/image/导出@4x-2680754386.webp',
      title: '这是一个可能这是一个可能这是', // 长标题示例
      subTitle: '分享副标题',
      qrCodeUrl: 'https://gewugo.com/api/v1/storage/image/导出@4x-2680754386.webp', // 替换为你的二维码URL
      username: '用户名',
      date: '2025年5月24日',
      loc: '北京·海淀',
      calIcon: 'https://gewugo.com/api/v1/storage/image/calendar@1x-3609340711.webp',
      unionIcon: 'https://gewugo.com/api/v1/storage/image/Union@1x-6352490503.webp',
      atIcon: 'https://gewugo.com/api/v1/storage/image/@@1x-2689483581.webp',
    },
    lineCount: 0,
    postIdx: 0,
    bgUrl: '',
    title: '',
    subTitle: '',
    loc: '',
    username: '',
    date: '',
  },


  handleChangePic() {
    wx.navigateBack();
  },

  async getPosterList(_exhibitionid: any, _postidx: any) {
    try {
      const res: any = await getPosters(_exhibitionid);
      if ( res && res.code === 0) {
        if (res.poster && res.poster.image_urls) {
          const urls = res.poster.image_urls;
          const bgUrl = urls[this.data.postIdx];
          this.setData({
            bgUrl: bgUrl,
          })
        }
      }
    } catch (error) {
      console.log(error)
    }
  },

  async getPosterMuseumList(_museumid: any, _postidx: any) {
    try {
      const res: any = await getPostersOfMuseum(_museumid);
      if ( res && res.code === 0) {
        if (res.poster && res.poster.image_urls) {
          const urls = res.poster.image_urls;
          const bgUrl = urls[this.data.postIdx];
          this.setData({
            bgUrl: bgUrl,
          })
        }
      }
    } catch (error) {
      console.log(error)
    }
  },

  async getExhibition(_exhibitionid: any) {
    try {
      const res: any = await getExhibitionById(_exhibitionid);
      if ( res && res.code === 0) {
        const { name , description, city_name, museum_name} = res.exhibition;
        this.setData({
          title: name,
          subTitle: description,
          loc: city_name + '·' + museum_name,
        })
      }
    } catch (error) {
      console.log(error)
    }
  },

  async getMuseum(_museumid: any) {
    try {
      const res: any = await getMuseumById(_museumid);
      if ( res && res.code === 0) {
        const { name , description, city_name, museum_name} = res.museum;
        this.setData({
          title: name,
          subTitle: description,
          loc: city_name + '·' + name,
        })
      }
    } catch (error) {
      console.log(error)
    }
  },

  async initData(_id: any, _postidx: any, _type: any) {
    console.log('initData', _type)
    if (_type === 'exhibition') {
      await this.getPosterList(_id, _postidx);
       await this.getExhibition(_id);
    } else if (_type === 'museum') {
      await this.getPosterMuseumList(_id, _postidx);
      await this.getMuseum(_id)
    }
    
    const { nickname } = getApp().globalData.userinfo;
    const now = new Date();
    const formattedDate = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
    console.log(formattedDate);
    this.setData({
      username: nickname,
      date: formattedDate,
    }) 
    // this.initCanvas();
    setTimeout(()=> {
      this.initCanvas();
    }, 300)
  },

  async initCanvas() {
    try {
      // 1. 创建 canvas 节点
      const query = wx.createSelectorQuery();
      query.select('#posterCanvas')
        .fields({ node: true, size: true })
        .exec(async (res) => {
          const canvas = res[0].node;
          const ctx = canvas.getContext('2d');
          
          // 2. 设置 canvas 实际尺寸（解决 retina 屏模糊问题）
          const dpr = wx.getSystemInfoSync().pixelRatio;
          canvas.width = res[0].width * dpr;
          canvas.height = res[0].height * dpr;
          ctx.scale(dpr, dpr);

          console.log('canvas.width', canvas.width)
          console.log('canvas.height', canvas.height)
          
          // 3. 绘制海报
          await this.drawPoster(canvas, ctx);
        });
    } catch (error) {
      console.error('初始化画布失败:', error);
    }
  },

  // 计算文字宽度
  getTextWidth(ctx, text, fontSize) {
    ctx.font = `${fontSize}px sans-serif`;
    return ctx.measureText(text).width;
  },

  // 绘制自动换行文本
  drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, fontSize, color, calLineCount = false) {
    ctx.font = `${fontSize}px sans-serif`;
    ctx.fillStyle = color;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    let line = '';
    let lineCount = 0;
    const maxLines = 2; // 最大行数限制
    
    // 分割文本为字符（适合中文）
    const chars = text.split('');
    
    for (let i = 0; i < chars.length; i++) {
      const testLine = line + chars[i];
      const testWidth = this.getTextWidth(ctx, testLine, fontSize);
      
      if (testWidth > maxWidth && i > 0) {
        // 绘制当前行
        ctx.fillText(line, x, y + (lineCount * lineHeight));
        lineCount++;
        console.log('lineCount drawWrappedText', lineCount)
        if (calLineCount) {
          this.setData({
            lineCount: lineCount,
          })
        }
       
        // 检查是否超过最大行数
        if (lineCount >= maxLines) {
          // 如果超过最大行数，添加省略号
          if (i < chars.length - 1) {
            const ellipsisLine = line + '...';
            const ellipsisWidth = this.getTextWidth(ctx, ellipsisLine, fontSize);
            if (ellipsisWidth <= maxWidth) {
              ctx.fillText(ellipsisLine, x, y + (lineCount * lineHeight));
            } else {
              ctx.fillText(line.substring(0, line.length - 1) + '...', x, y + (lineCount * lineHeight));
            }
          } else {
            ctx.fillText(line, x, y + (lineCount * lineHeight));
          }
          return;
        }
        
        // 开始新行
        line = chars[i];
      } else {
        line = testLine;
      }
    }

    
    
    // 绘制最后一行
    ctx.fillText(line, x, y + (lineCount * lineHeight));
  },

  // 加载图片
  loadImage(canvas, url) {
    return new Promise((resolve, reject) => {
      const img = canvas.createImage();
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = url;
    });
  },

  async drawPoster(canvas, ctx) {
    const { qrCodeUrl, calIcon, unionIcon, atIcon } = this.data.posterInfo;
    const { bgUrl, title, subTitle, username, loc, date } = this.data;
    const canvasWidth = canvas.width / wx.getSystemInfoSync().pixelRatio;
    const canvasHeight = canvas.height / wx.getSystemInfoSync().pixelRatio;
    console.log('canvas canvasWidth', canvas.width, wx.getSystemInfoSync().pixelRatio, canvasWidth, canvasHeight)
    try {
      // 1. 绘制背景图
      const bgImg = await this.loadImage(canvas, bgUrl);
      ctx.drawImage(bgImg, 0, 0, canvasWidth, canvasHeight);
      
      // 2. 绘制标题（自动换行）
      this.drawWrappedText(
        ctx, 
        title, 
        44, 
        44, 
        canvasWidth - 100, // 最大宽度
        36, // 行高
        24, // 字体大小
        '#ffffff', // 颜色
        true
      );
      
      // 3. 绘制副标题
     
      console.log('----lineCount', this.data.lineCount)
      this.drawWrappedText(
        ctx, 
        subTitle, 
        44, 
        80 + (36 * (this.data.lineCount)), 
        canvasWidth - 100, // 最大宽度
        24, // 行高
        18, // 字体大小
        '#ffffff' // 颜色
      );
      // ctx.fillText(subTitle, 44, 80 + (36 * this.data.lineCount + 1));
      
      // 4. 绘制用户信息
      const MarginBot = 300 * canvasHeight / 1200 ; // 300 / 1200 = x / canvasHeight

      // 绘制@图标
      const atImg = await this.loadImage(canvas, atIcon);
      ctx.drawImage(
        atImg, 
        44, 
        canvasHeight - MarginBot - 48, 
        12, 
        12
      );
      
      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'left';
      ctx.fillText(username, 66, canvasHeight - MarginBot - 48);

      // 绘制日历图标
      const calImg = await this.loadImage(canvas, calIcon);
      ctx.drawImage(
        calImg, 
        44, 
        canvasHeight - MarginBot - 24, 
        12, 
        12
      );

      // 绘制日期
      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'left';
      ctx.fillText(date, 66, canvasHeight - MarginBot - 24);

      // 绘制地址图标
      const locImg = await this.loadImage(canvas, unionIcon);
      ctx.drawImage(
        locImg, 
        44, 
        canvasHeight - MarginBot, 
        12, 
        12
      );

      // 绘制地址
      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'left';
      ctx.fillText(loc, 66, canvasHeight - MarginBot);
      
      
      // 5. 绘制二维码
      const qrSizeWidth = (52 * canvasWidth ) / 60; // 520/ 600 = x / canvasWidth
      const qrSizeHeight = (112 * canvasHeight) / 120;  // 1120/1200 = x / canvasHeight
      const qrImg = await this.loadImage(canvas, qrCodeUrl);
      // ctx.drawImage(
      //   qrImg, 
      //   canvasWidth / 2 - qrSize / 2, 
      //   canvasHeight - 250, 
      //   qrSize, 
      //   qrSize
      // );
      ctx.drawImage(
        qrImg, 
        (canvasWidth - qrSizeWidth) / 2, 
        (canvasHeight - qrSizeHeight) / 2, 
        qrSizeWidth, 
        qrSizeHeight
      );
      
      // 6. 绘制二维码提示文字
      // ctx.font = '24px sans-serif';
      // ctx.fillStyle = '#ffffff';
      // ctx.fillText('长按识别二维码', canvasWidth / 2, canvasHeight - 70);
      
    } catch (error) {
      console.error('绘制海报失败:', error);
      wx.showToast({
        title: '生成海报失败',
        icon: 'none'
      });
    }
  },

  savePosterToAlbum() {
    wx.showLoading({
      title: '保存中...',
    });
    
    const query = wx.createSelectorQuery();
    query.select('#posterCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        const canvas = res[0].node;
        
        wx.canvasToTempFilePath({
          canvas,
          success: (res) => {
            wx.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success: () => {
                wx.hideLoading();
                wx.showToast({
                  title: '保存成功',
                  icon: 'success'
                });
              },
              fail: (err) => {
                wx.hideLoading();
                console.error('保存失败:', err);
                wx.showToast({
                  title: '保存失败',
                  icon: 'none'
                });
                
                // 提示用户去设置页开启相册权限
                if (err.errMsg.includes('auth')) {
                  wx.showModal({
                    title: '提示',
                    content: '需要相册权限才能保存图片',
                    confirmText: '去设置',
                    success: (res) => {
                      if (res.confirm) {
                        wx.openSetting();
                      }
                    }
                  });
                }
              }
            });
          },
          fail: (err) => {
            wx.hideLoading();
            console.error('生成临时文件失败:', err);
            wx.showToast({
              title: '生成图片失败',
              icon: 'none'
            });
          }
        });
      });
  },

  onShow() {
  },

  onLoad(options) {
    this.setData({
      postIdx: Number(options.poster_idx),
    })
    if (options.exhibition_id) {
      console.log('onLoad exhibition_id')
      this.setData({
        exhibitionId: Number(options.exhibition_id),
        posterType: 'exhibition'
      });
      this.initData(Number(options.exhibition_id), Number(options.poster_idx), 'exhibition')

    } else if (options.museum_id) {
      console.log('onLoad museum_id', options.museum_id)

      this.setData({
        museumId: Number(options.museum_id),
        posterType: 'museum'
      });
      this.initData(Number(options.museum_id), Number(options.poster_idx), 'museum')

    }
  },

  onReady() {
    // this.initCanvas();
  },



});
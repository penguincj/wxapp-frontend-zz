// @ts-nocheck
import { getPosters, getExhibitById, getPackageByID, getPostersOfMuseum } from "../../api/api";

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
    text_idx: 0,
    bg_idx: 0,
    share_text: '',
    share_texts: [],
    share_images: [],
    canvasHeight: 1200, // 动态canvas高度
    from_page: '', // 来源页面
    isCanvasReady: false,
  },


  handleChangePic() {
    const { from_page, bg_idx, share_images } = this.data;
    
    // 如果来源是package或exhibitlist，循环切换图片
    if ((from_page === 'package' || from_page === 'exhibitlist') && share_images && share_images.length > 0) {
      const nextIdx = (bg_idx + 1) % share_images.length;
      const image = share_images[nextIdx];
      this.setData({
        bgUrl: image,
        bg_idx: nextIdx,
      })
      console.log('handleChangePic', image, 'nextIdx:', nextIdx)
      // 重新绘制海报
      this.initCanvas();
    } else {
      // 其他情况（如exhibit）返回上一页
      wx.navigateBack();
    }
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

  async getPosterFromExhibit(_id: any, _postidx: any) {
    try {
      const res : any = await getExhibitById(_id);
  
      if ( res && res.code === 0) {
        const exhibit = res.exhibit;
        if (exhibit.share_texts && exhibit.share_texts.length) {
         
           const image_urls = [exhibit.image_url, ...exhibit.more_image_urls];
           this.setData({
            title: exhibit.name,
            subTitle: '',
            share_texts: exhibit.share_texts,
            share_images: image_urls,
            text_idx: 0,
          }, () => {
            this.changeText(0);
            this.changeImage(_postidx);
          })
          
        }
      }
    } catch (error) {
      console.log(error)
    }
  },

  async getPosterFromPackage(_id: any, _postidx: any) {
    try {
      const res : any = await getPackageByID(_id);
  
      if ( res && res.code === 0) {
        const r_package = res.data;
        if ((r_package.default_share_texts && r_package.default_share_texts.length) || (r_package.share_texts && r_package.share_texts.length)) {
          const share_texts = [...r_package.share_texts, ...r_package.default_share_texts ];
          const share_images = [...r_package.share_images, ...r_package.default_share_images];
          this.setData({
            title: r_package.exhibition.name,
            subTitle: r_package.exhibition.description,
            share_texts,
            share_images,
            text_idx: 0,
          }, () => {
            this.changeText(0);
            this.changeImage(_postidx);
          })
          
        }
      }
    } catch (error) {
      console.log(error)
    }
  },


  handleChangeText(_idx: any) {
    const { text_idx, share_texts } = this.data;
    if (share_texts && share_texts.length) {
      // 循环取下一个值
      const nextIdx = (text_idx + 1) % share_texts.length;
      const text = share_texts[nextIdx];
      this.setData({
        share_text: text,
        text_idx: nextIdx,
      })
      console.log('changeText', text, 'nextIdx:', nextIdx)
      // 重新绘制海报
      this.initCanvas();
    }
  },

  changeText(_idx: any) {
    const { share_texts } = this.data;
    if (share_texts && share_texts.length) {
      const text = share_texts[_idx];
      this.setData({
        share_text: text,
        text_idx: _idx,
      })
      console.log('changeText', text)
    }
  },

  changeImage(_idx: any) {
    const { share_images } = this.data;
    if (share_images && share_images.length) {
      const image = share_images[_idx];
      this.setData({
        bgUrl: image,
        bg_idx: _idx,
      })
      console.log('changeImage', image)
    }
  },


  async initData(_id: any, _postidx: any, _type: any) {
    console.log('initData', _type)
    if (_type === 'exhibitlist') {
      await this.getPosterFromExhibit(_id, _postidx);
    } else if (_type === 'package') {
      await this.getPosterFromPackage(_id, _postidx);
    }
    
    // const { nickname } = getApp().globalData.userinfo;
    // const now = new Date();
    // const formattedDate = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
    // console.log(formattedDate);
    // this.setData({
    //   username: nickname,
    //   date: formattedDate,
    // }) 
    // this.initCanvas();
    setTimeout(()=> {
      this.initCanvas();
    }, 300)
  },

  async initCanvas() {
    try {
      this.setData({
        isCanvasReady: false,
      });
      // 1. 创建 canvas 节点
      const query = wx.createSelectorQuery();
      query.select('#posterCanvas')
        .fields({ node: true, size: true })
        .exec(async (res) => {
          if (!res || !res[0] || !res[0].node) {
            this.setData({
              isCanvasReady: true,
            });
            return;
          }
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
      this.setData({
        isCanvasReady: true,
      });
    }
  },

  // 计算文字宽度
  getTextWidth(ctx, text, fontSize) {
    ctx.font = `${fontSize}px sans-serif`;
    return ctx.measureText(text).width;
  },

  // 计算文字的行数和高度
  calculateTextHeight(ctx, text, maxWidth, lineHeight, fontSize, maxLines = 100) {
    if (!text) return { lines: 0, height: 0 };
    
    ctx.font = `${fontSize}px sans-serif`;
    let line = '';
    let lineCount = 0;
    
    // 分割文本为字符（适合中文）
    const chars = text.split('');
    
    for (let i = 0; i < chars.length; i++) {
      const testLine = line + chars[i];
      const testWidth = this.getTextWidth(ctx, testLine, fontSize);
      
      if (testWidth > maxWidth && i > 0) {
        lineCount++;
        if (maxLines && lineCount >= maxLines) {
          break;
        }
        line = chars[i];
      } else {
        line = testLine;
      }
    }
    
    // 最后一行
    if (line.length > 0) {
      lineCount++;
    }
    
    return {
      lines: lineCount,
      height: lineCount * lineHeight
    };
  },

  // 绘制自动换行文本
  drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, fontSize, color, calLineCount = false) {
    ctx.font = `${fontSize}px sans-serif`;
    ctx.fillStyle = color;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    let line = '';
    let lineCount = 0;
    const maxLines = 100; // 最大行数限制
    
    // 分割文本为字符（适合中文）
    const chars = text.split('');
    
    for (let i = 0; i < chars.length; i++) {
      const testLine = line + chars[i];
      const testWidth = this.getTextWidth(ctx, testLine, fontSize);
      
      if (testWidth > maxWidth && i > 0) {
        // 绘制当前行
        ctx.fillText(line, x, y + (lineCount * lineHeight));
        lineCount++;
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
    const { bgUrl, title, subTitle, share_text } = this.data;
    const systemInfo = wx.getSystemInfoSync();
    const pixelRatio = systemInfo.pixelRatio;
    const windowWidth = systemInfo.windowWidth;
    const pxToRpx = windowWidth ? 750 / windowWidth : 2;
    const canvasWidth = canvas.width / pixelRatio; // 使用canvas实际宽度
    
    try {
      // 1. 预先加载图片以计算高度
      const bgImg = await this.loadImage(canvas, bgUrl);
      const imgAspectRatio = bgImg.height / bgImg.width;
      const imgHeight = canvasWidth * imgAspectRatio;
      const imgY = 0; // 图片从顶部开始，与背景衔接
      
      // 2. 计算文字区域参数
      const textStartY = imgY + imgHeight; // 图片下方40px开始绘制文字
      const textPadding = 0; // 左右边距
      const textMaxWidth = canvasWidth - textPadding * 2;
      
      // 3. 预先计算所有文字内容的总高度
      let totalTextHeight = 0;
      let titleHeight = 0;
      let subTitleHeight = 0;
      let shareTextHeight = 0;
      
      if (title) {
        const titleInfo = this.calculateTextHeight(ctx, title, textMaxWidth - 30, 30, 20, 2); // 减去左右padding
        titleHeight = titleInfo.height + (subTitle ? 0 : 0);
        totalTextHeight += titleHeight;
      }
      
      if (subTitle) {
        const subTitleInfo = this.calculateTextHeight(ctx, subTitle, textMaxWidth - 30, 32, 20, 2); // 减去左右padding
        subTitleHeight = subTitleInfo.height + (share_text ? 0 : 0);
        totalTextHeight += subTitleHeight;
      }
      
      if (share_text) {
        const shareTextInfo = this.calculateTextHeight(ctx, share_text, textMaxWidth - 30, 18, 12); // 减去左右padding
        shareTextHeight = shareTextInfo.height;
        totalTextHeight += shareTextHeight;
      }
      
      // 4. 简化canvas高度计算：图片高度 + 文字背景高度
      const textBgHeight = totalTextHeight > 0 ? totalTextHeight + 40 : 0; // 文字背景高度（含上下padding）
      const actualCanvasHeight = imgHeight + textBgHeight; // 图片高度 + 文字背景高度
      
      // 设置canvas实际高度
      canvas.height = actualCanvasHeight * pixelRatio;
      ctx.scale(pixelRatio, pixelRatio);
      
      // 更新data中的canvasHeight（转换为rpx单位）
      this.setData({
        canvasHeight: actualCanvasHeight * pxToRpx,
        isCanvasReady: true,
      });
      
      
      // 5. 绘制黑色背景
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvasWidth, actualCanvasHeight);
      
      // 6. 绘制图片（保持宽度100%，高度自适应）
      ctx.drawImage(bgImg, 0, imgY, canvasWidth, imgHeight);
      
      // 7. 绘制统一的文字背景（100%宽度）
      if (totalTextHeight > 0) {
        ctx.fillStyle = '#E8E8E8';
        ctx.fillRect(
          0, 
          textStartY, 
          canvasWidth, 
          totalTextHeight + 24 // 上下padding各12px
        );
      }
      
      // 8. 绘制文字内容（添加padding）
      let currentY = textStartY + 12; // 上padding 12px
      
      if (title) {
        this.drawWrappedText(
          ctx, 
          title, 
          textPadding + 15, // 左padding 15px
          currentY, 
          textMaxWidth - 30, // 减去左右padding
          30, // 行高
          20, // 字体大小
          '#000000', // 黑色文字
          true // 计算行数
        );
        currentY += titleHeight;
      }
      
      if (subTitle) {
        this.drawWrappedText(
          ctx, 
          subTitle, 
          textPadding + 15, // 左padding 15px
          currentY, 
          textMaxWidth - 30, // 减去左右padding
          24, // 行高
          16, // 字体大小
          '#333333' // 深灰色文字
        );
        currentY += subTitleHeight;
      }
      
      if (share_text) {
        this.drawWrappedText(
          ctx, 
          share_text, 
          textPadding + 15, // 左padding 15px
          currentY, 
          textMaxWidth - 30, // 减去左右padding
          18, // 行高
          12, // 字体大小
          '#666666' // 中灰色文字
        );
      }
      
    } catch (error) {
      console.error('绘制海报失败:', error);
      this.setData({
        isCanvasReady: true,
      });
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
      from_page: options.from_page,
      poster_idx: options.poster_idx,
    })
    if (options.from_page && options.from_page === 'package') {
      this.setData({
        package_id: Number(options.package_id),
      });
      this.initData(Number(options.package_id), Number(options.poster_idx), 'package')

    } else if (options.from_page && options.from_page === 'exhibitlist') {
      this.setData({
        exhibit_id: Number(options.exhibit_id),
      });
      this.initData(Number(options.exhibit_id), Number(options.poster_idx), 'exhibitlist')

    }
  },

  onReady() {
    // this.initCanvas();
  },



});
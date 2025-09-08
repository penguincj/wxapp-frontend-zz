import { postUserListen, getPackageByID } from "../../api/api";
import { calTimeTxt, transferObjToUrlParams } from "../../utils/util";

interface Bubble {
  id: number;
  text: string;
  scale: number;
  blurAmount: number;
  top: number;
  left: number;
  opacity: number;
  type: 'clear' | 'blur';
  animationDuration: number;
}

interface BubbleConfig {
  readonly MIN_SCALE: number;
  readonly MAX_SCALE: number;
  readonly MIN_BLUR: number;
  readonly MAX_BLUR: number;
  readonly MIN_ANIMATION_DURATION: number;
  readonly MAX_ANIMATION_DURATION: number;
  readonly MIN_OPACITY: number;
  readonly MAX_OPACITY: number;
  readonly BUBBLE_COUNT_MIN: number;
  readonly BUBBLE_COUNT_MAX: number;
  readonly MAX_ATTEMPTS: number;
  readonly VERTICAL_MARGIN: number;
  readonly HORIZONTAL_START: number;
  readonly VERTICAL_RANGE: number;
  readonly BASE_WIDTH: number;
  readonly BASE_HEIGHT: number;
  readonly CHAR_WIDTH: number;
}

Page({
  data: {
    loading: true,
    bubbles: [] as Bubble[],
    // 标题文案配置
    titleConfig: {
      loading: {
        mainTitle: '正在生成定制讲解...',
        subtitle: '正在根据你的个人喜好,时长,声音,讲解风格等,个性定制中',
      },
      completed: {
        mainTitle: '行家、聪明、智慧的选择！',
        subtitle: '为你订制的讲解是',
      }
    },
    isCompleted: false, // 页面是否完成请求
    packageList: [] as any,
    exhibition_id: 0,
  },

  // 气泡配置常量
  bubbleConfig: {
    MIN_SCALE: 1.2,
    MAX_SCALE: 3.5,
    MIN_BLUR: 0,
    MAX_BLUR: 3,
    MIN_ANIMATION_DURATION: 3,
    MAX_ANIMATION_DURATION: 8,
    MIN_OPACITY: 0.6,
    MAX_OPACITY: 1.0,
    BUBBLE_COUNT_MIN: 5,
    BUBBLE_COUNT_MAX: 8,
    MAX_ATTEMPTS: 200,
    VERTICAL_MARGIN: 30,
    HORIZONTAL_START: 750,
    VERTICAL_RANGE: 1000,
    BASE_WIDTH: 120,
    BASE_HEIGHT: 60,
    CHAR_WIDTH: 20
  } as BubbleConfig,

  // 气泡文本池
  bubbleTexts: [
    '30分钟', '小众精品', '唐宋元', '少女書包', '星际专', 
    '古风', '现代', '温柔', '专业', '轻松'
  ],

  onLoad(options) {
    console.log('定制讲解页面加载', options);
    
    // 解析页面参数
    if(options.exhibition_id) {
      this.setData({
        exhibition_id: Number(options.exhibition_id),
      })
      // this.getNarrationList();
    }
    if(options.package_id) {
      this.setData({
        package_id: Number(options.package_id),
      })
      this.getPackageDetail(Number(options.package_id));
    }
    
    // 解析labels参数并替换bubbleTexts
    if(options.labels) {
      this.parseLabelsAndUpdateBubbles(options.labels);
    }
    
    this.initPage();
  },

  async getPackageDetail(_id: any) {
    try {
      const res: any = await getPackageByID(_id);
      if(res.code === 0) {
        const res_package = res.data;
        const item = {
          id: res_package.id,
          count: 999,
          name: res_package.name,
          duration_fmt: res_package.duration,
          image_url: res_package.image_url,
        }
        const new_narr = [item];
        this.setData({
          packageList: new_narr
        })
      }
    } catch (err) {
      console.log('获取讲解详情失败', err);
    }
  },

  /**
   * 解析labels参数并更新气泡文本
   */
  parseLabelsAndUpdateBubbles(labelsStr: string) {
    try {
      // 解析labels字符串，按逗号分隔
      const labels = labelsStr.split('-').map(label => label.trim()).filter(label => label.length > 0);
      
      if (labels.length > 0) {
        // 用解析出的标签替换bubbleTexts
        (this as any).bubbleTexts = labels;
        console.log('解析到的标签:', labels);
        console.log('更新后的bubbleTexts:', (this as any).bubbleTexts);
      }
    } catch (error) {
      console.error('解析labels参数失败:', error);
    }
  },

  handleSelectAgain() {
    wx.navigateBack({
      delta: 1,
    })
  },

  async handleListen() {
    const { userid } = await wx.getStorageSync('userinfo');
    const narrationid = this.data.packageList[0].id;
    postUserListen(userid, this.data.exhibition_id, narrationid);
    setTimeout(() => {
      if(this.data.packageList.length > 0) {
        const narration = this.data.packageList[0];
        this.goToExhibitListPage(narration.id, this.data.exhibition_id)
      }
    }, 1000)
    
  },

  goToExhibitListPage(_narrationid: any, _exhibitionid: any) {
    const url_params = transferObjToUrlParams({
        narration_id: _narrationid,
        exhibition_id: _exhibitionid
      })
      getApp().globalData.audio.curNarration = _narrationid;
      wx.navigateTo({
        url: '/pages/exhibitlist/index' + url_params,
      })
  },

  handleClickCard(event: any) {
    const { id } = event.detail;
    this.goToExhibitListPage(id, this.data.exhibition_id)
  },

  onShow() {
    // 页面显示时的逻辑
    // this.getNarrationList();
  },

  onHide() {
    // 页面隐藏时的逻辑
  },

  onUnload() {
    // 页面卸载时的逻辑
  },

  /**
   * 初始化页面
   */
  initPage() {
    this.generateRandomBubbles();
    
    // 5秒后将isCompleted设置为true
    setTimeout(() => {
      this.setData({ 
        loading: false,
        isCompleted: true // 标记页面完成
      });
    }, 8000);
  },

  /**
   * 生成随机气泡
   */
  generateRandomBubbles() {
    const { BUBBLE_COUNT_MIN, BUBBLE_COUNT_MAX } = (this as any).bubbleConfig;
    const bubbleCount = this.getRandomInt(BUBBLE_COUNT_MIN, BUBBLE_COUNT_MAX);
    const bubbles: Bubble[] = [];
    
    for (let i = 0; i < bubbleCount; i++) {
      const bubble = this.generateSingleBubble(i + 1, i === 0);
      const positionedBubble = this.findNonOverlappingPosition(bubble, bubbles);
      bubbles.push(positionedBubble);
    }
    
    this.setData({ bubbles });
  },

  /**
   * 生成单个气泡
   */
  generateSingleBubble(id: number, forceClear: boolean = false): Bubble {
    const { 
      MIN_SCALE, MAX_SCALE, MIN_BLUR, MAX_BLUR, 
      MIN_ANIMATION_DURATION, MAX_ANIMATION_DURATION,
      MIN_OPACITY, MAX_OPACITY, HORIZONTAL_START, VERTICAL_RANGE
    } = (this as any).bubbleConfig;

    return {
      id,
      text: this.getRandomElement((this as any).bubbleTexts),
      scale: this.getRandomFloat(MIN_SCALE, MAX_SCALE),
      blurAmount: forceClear ? 0 : this.getRandomFloat(MIN_BLUR, MAX_BLUR),
      top: this.getRandomFloat(0, VERTICAL_RANGE),
      left: HORIZONTAL_START,
      opacity: this.getRandomFloat(MIN_OPACITY, MAX_OPACITY),
      type: forceClear ? 'clear' : (Math.random() > 0.5 ? 'clear' : 'blur'),
      animationDuration: this.getRandomFloat(MIN_ANIMATION_DURATION, MAX_ANIMATION_DURATION)
    };
  },

  /**
   * 查找不重叠的位置
   */
  findNonOverlappingPosition(newBubble: Bubble, existingBubbles: Bubble[]): Bubble {
    let attempts = 0;
    const { MAX_ATTEMPTS } = (this as any).bubbleConfig;
    
    while (attempts < MAX_ATTEMPTS) {
      if (!this.hasCollision(newBubble, existingBubbles)) {
        return newBubble;
      }
      
      // 重新生成位置
      newBubble = {
        ...newBubble,
        top: this.getRandomFloat(0, (this as any).bubbleConfig.VERTICAL_RANGE)
      };
      attempts++;
    }
    
    // 如果尝试次数过多，使用网格定位
    return this.adjustBubblePosition(newBubble, existingBubbles);
  },

  /**
   * 检测气泡碰撞
   */
  hasCollision(newBubble: Bubble, existingBubbles: Bubble[]): boolean {
    const { BASE_WIDTH, BASE_HEIGHT, CHAR_WIDTH, VERTICAL_MARGIN } = (this as any).bubbleConfig;
    
    const newWidth = Math.max(BASE_WIDTH, newBubble.text.length * CHAR_WIDTH) * newBubble.scale;
    const newHeight = BASE_HEIGHT * newBubble.scale;
    const newTop = newBubble.top;
    const newBottom = newBubble.top + newHeight;
    
    return existingBubbles.some(existing => {
      const existingWidth = Math.max(BASE_WIDTH, existing.text.length * CHAR_WIDTH) * existing.scale;
      const existingHeight = BASE_HEIGHT * existing.scale;
      const existingTop = existing.top;
      const existingBottom = existing.top + existingHeight;
      
      // 检查垂直方向重叠
      return newTop < existingBottom + VERTICAL_MARGIN && 
             newBottom + VERTICAL_MARGIN > existingTop;
    });
  },

  /**
   * 调整气泡位置避免重叠
   */
  adjustBubblePosition(bubble: Bubble, existingBubbles: Bubble[]): Bubble {
    const { BASE_WIDTH, BASE_HEIGHT, CHAR_WIDTH, VERTICAL_MARGIN, VERTICAL_RANGE, HORIZONTAL_START } = (this as any).bubbleConfig;
    
    const bubbleWidth = Math.max(BASE_WIDTH, bubble.text.length * CHAR_WIDTH) * bubble.scale;
    const bubbleHeight = BASE_HEIGHT * bubble.scale;
    const gridSize = bubbleHeight + VERTICAL_MARGIN;
    
    // 根据VERTICAL_RANGE动态计算行数，确保覆盖整个区域
    const maxRows = Math.floor((VERTICAL_RANGE - 100) / gridSize); // 100rpx作为底部边距
    
    for (let row = 0; row < maxRows; row++) {
      const newTop = row * gridSize + 50;
      
      if (newTop + bubbleHeight <= VERTICAL_RANGE) {
        const testBubble = { ...bubble, top: newTop, left: HORIZONTAL_START };
        if (!this.hasCollision(testBubble, existingBubbles)) {
          return testBubble;
        }
      }
    }
    
    return bubble;
  },

  /**
   * 点击气泡事件
   */
  onBubbleClick(e: any) {
    const bubbleId = e.currentTarget.dataset.id;
    console.log('点击气泡:', bubbleId);
  },

  /**
   * 气泡显示开关事件
   */
  onBubbleToggle(e: any) {
    const showBubbles = e.detail.value;
    this.setData({ showBubbles });
    
    if (showBubbles) {
      console.log('气泡效果已开启');
    } else {
      console.log('气泡效果已关闭');
    }
  },

  // 工具方法
  getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  getRandomFloat(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  },

  getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }
});

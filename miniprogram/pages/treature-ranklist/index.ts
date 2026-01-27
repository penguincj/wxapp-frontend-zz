import { getRankingById } from "../../api/api";
import { generateNewUrlParams } from "../../utils/util";

Page({
  data: {
    topRows: [] as string[][],
    topRowsLoop: [] as string[][],
    rankList: [] as any[],
    ranking: {} as any,
    loading: false,
    heroScrollLeft: 0,
    heroRowCount: 2
  },

  onLoad(options: Record<string, string>) {
    const rankingId = options.ranking_id;
    if (!rankingId) {
      wx.showToast({
        title: "缺少排行榜参数",
        icon: "none"
      });
      return;
    }
    this.initPage(rankingId);
  },

  onShow() {
    this.startHeroScroll();
  },

  onHide() {
    this.stopHeroScroll();
  },

  onUnload() {
    this.stopHeroScroll();
  },

  buildTopRows(images: string[], rowCount = 2, minPerRow = 8) {
    const rows = Array.from({ length: rowCount }, () => [] as string[]);
    if (!images.length) {
      return rows;
    }
    const total = Math.max(minPerRow, images.length);
    for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
      for (let i = 0; i < total; i += 1) {
        const idx = (i + rowIndex) % images.length;
        rows[rowIndex].push(images[idx]);
      }
    }
    return rows;
  },

  buildLoopRows(rows: string[][]) {
    return rows.map((row) => row.concat(row));
  },

  calcHeroLoopWidthPx(rowLength: number) {
    if (!rowLength) {
      return 0;
    }
    const systemInfo = wx.getSystemInfoSync();
    const rpx2px = systemInfo.windowWidth / 750;
    const itemWidthRpx = 96;
    const itemGapRpx = 16;
    return (itemWidthRpx + itemGapRpx) * rowLength * rpx2px;
  },

  startHeroScroll() {
    const loopWidth = (this as any).heroLoopWidthPx || 0;
    if (!loopWidth) {
      return;
    }
    if ((this as any).heroScrollTimer) {
      return;
    }
    const step = 1;
    (this as any).heroScrollTimer = setInterval(() => {
      let nextLeft = (this.data.heroScrollLeft || 0) + step;
      if (nextLeft >= loopWidth) {
        nextLeft = 0;
      }
      this.setData({
        heroScrollLeft: nextLeft
      });
    }, 30);
  },

  stopHeroScroll() {
    const timer = (this as any).heroScrollTimer;
    if (timer) {
      clearInterval(timer);
      (this as any).heroScrollTimer = null;
    }
  },

  onClickShowDetail(e: any) {
    const { idx } = e.currentTarget.dataset;
    const url_params = generateNewUrlParams({
      item_id: idx
    })
    wx.navigateTo({
      url: '/pages/treature-result/index' + url_params,
    })
  },

  onHeroTouchMove() {
    return false;
  },

  async initPage(rankingId: string) {
    this.setData({
      loading: true
    });
    wx.showLoading({
      title: "加载中"
    });
    try {
      const res: any = await getRankingById(rankingId);
      if (res && res.code === 0) {
        const items = res.items || [];
        const rankList = items.map((item: any) => {
          const image =
            (item.photos_cdn && item.photos_cdn[0]) ||
            (item.photos && item.photos[0]) ||
            "";
          const location = [item.hall_name, item.location_in_hall]
            .filter(Boolean)
            .join("·");
          return {
            id: item.id,
            name: item.name,
            location: location || item.museum_name || "",
            image
          };
        });
        const topImages = items
          .map((item: any) => {
            return (
              (item.photos_cdn && item.photos_cdn[0]) ||
              (item.photos && item.photos[0]) ||
              ""
            );
          })
          .filter((url: string) => url);
        const heroRowCount = topImages.length >= 16 ? 2 : 1;
        const topRows = this.buildTopRows(topImages, heroRowCount);
        const topRowsLoop = this.buildLoopRows(topRows);
        (this as any).heroLoopWidthPx = this.calcHeroLoopWidthPx(topRows[0]?.length || 0);
        this.setData({
          ranking: res.ranking || {},
          rankList,
          topRows,
          topRowsLoop,
          heroScrollLeft: 0,
          heroRowCount,
          loading: false
        }, () => {
          this.stopHeroScroll();
          this.startHeroScroll();
        });
      } else {
        this.setData({
          loading: false
        });
      }
    } catch (error) {
      this.setData({
        loading: false
      });
    } finally {
      wx.hideLoading();
    }
  }
});

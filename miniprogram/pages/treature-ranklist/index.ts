import { getRankingById } from "../../api/api";
import { generateNewUrlParams } from "../../utils/util";

Page({
  data: {
    topRows: [] as string[][],
    rankList: [] as any[],
    ranking: {} as any,
    loading: false
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

  onClickShowDetail(e: any) {
    const { idx } = e.currentTarget.dataset;
    const url_params = generateNewUrlParams({
      treature_id: idx
    })
    wx.navigateTo({
      url: '/pages/treature-result/index' + url_params,
    })
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
        this.setData({
          ranking: res.ranking || {},
          rankList,
          topRows: this.buildTopRows(topImages),
          loading: false
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

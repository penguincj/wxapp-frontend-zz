// index.ts
// 获取应用实例
// const app = getApp<IAppOption>()
import { getNarrowList, getExhibitionLabelGroupAll, postNarrationLabelMatch } from "../../api/api";
import { calTimeTxt, getCurrentPageParam,getCurrentPageParamStr, transferObjToUrlParams, backToTargetPage } from "../../utils/util";

Page({
  data: { 
    narrationList:[],
    tagArrOne:[] as any,
    tagArrMuti:[] as any,
    selectedTagsOne: [] as any, // 存储单选标签的选中结果
    selectedTagsMuti: [] as any, // 存储多选标签的选中结果
    curExhibitionId:0,
  },

  async initPage(_exhibitionid: any) {
    try {
      const res_narr: any = await getNarrowList(_exhibitionid);
      if (res_narr && res_narr.narrations) {
        const narrationList = res_narr.narrations.map((item: any) => {
          const duration_fmt = calTimeTxt(item.duration);

          return {
            id: item.id,
            name: item.name,
            image_url: item.url,
            duration_fmt,
            count: 999,
          }
        })
        this.setData({
          narrationList: narrationList,
        })
      }

      this.getTags();
    } catch (error) {
      this.setData({
        loading: false,
      })
    }
  },

  goToGeneratePage(_id: any, labels: string) {
    if (_id) {
      wx.navigateTo({
        url: `/pages/customize-explanation/index?exhibition_id=${this.data.curExhibitionId}&narration_id=${_id}&labels=${labels}`,
      })
    }
  },

  async postLabelMatch() {
    try {
      // 格式化选中的标签数据
      const formattedLabels = this.formatSelectedLabels();
      
      const res_tag: any = await postNarrationLabelMatch(this.data.curExhibitionId, formattedLabels);
      // if (res_tag && res_tag.code === 0) {
      //   const narration_id = res_tag.data.narration_id;
      //   const labels = formattedLabels.map((item: any) => item.labels.join('、'))
      //   this.goToGeneratePage(narration_id, labels.join('、'))
      // }

      const narration_id = 9;
      const labels = formattedLabels.map((item: any) => item.labels.join('-'))
      console.log(labels)
      this.goToGeneratePage(narration_id, labels.join('-'))

      // 可以在这里处理成功后的逻辑，比如跳转页面或显示成功提示
      wx.showToast({
        title: '选择成功',
        icon: 'success'
      });
      
    } catch (error) {
   

      wx.showToast({
        title: '提交失败',
        icon: 'error'
      });
      this.setData({
        loading: false,
      })
    }
  },

  // 格式化选中的标签数据为指定格式
  formatSelectedLabels() {
    const result: any[] = [];
    
    // 处理单选标签
    this.data.selectedTagsOne.forEach((selectedTag: any) => {
      // 找到对应的标签名称
      const group = this.data.tagArrOne.find((g: any) => g.dimension === selectedTag.dimension);
      if (group) {
        const label = group.label_list.find((l: any) => l.id === selectedTag.tagId);
        if (label) {
          result.push({
            dimension: selectedTag.dimension,
            labels: [label.label_name]
          });
        }
      }
    });
    
    // 处理多选标签
    this.data.selectedTagsMuti.forEach((selectedDimension: any) => {
      const labelNames: string[] = [];
      const group = this.data.tagArrMuti.find((g: any) => g.dimension === selectedDimension.dimension);
      
      if (group) {
        selectedDimension.tagIds.forEach((tagId: number) => {
          const label = group.label_list.find((l: any) => l.id === tagId);
          if (label) {
            labelNames.push(label.label_name);
          }
        });
        
        if (labelNames.length > 0) {
          result.push({
            dimension: selectedDimension.dimension,
            labels: labelNames
          });
        }
      }
    });
    
    return result;
  },

  async getTags() {
    try {
      const res_tag: any = await getExhibitionLabelGroupAll();
      if (res_tag && res_tag.data) {
        const tagArrOne: any[] = [];
        const tagArrMuti: any[] = [];
        
        res_tag.data.forEach((item: any) => {
          const labelList = item.labels.map((label: string, index: number) => ({
            id: index + 1,
            label_name: label
          }));
          
          const tagGroup = {
            dimension: item.name,
            label_list: labelList
          };
          
          if (item.multi_select) {
            tagArrMuti.push(tagGroup);
          } else {
            tagArrOne.push(tagGroup);
          }
        });
        
        // 为标签添加选中状态
        const processedTagArrOne = tagArrOne.map(group => ({
          ...group,
          label_list: group.label_list.map((label: any) => ({
            ...label,
            isSelected: false
          }))
        }));
        
        const processedTagArrMuti = tagArrMuti.map(group => ({
          ...group,
          label_list: group.label_list.map((label: any) => ({
            ...label,
            isSelected: false
          }))
        }));
        
        this.setData({
          tagArrOne: processedTagArrOne,
          tagArrMuti: processedTagArrMuti
        });
      }
    } catch (error) {
      this.setData({
        loading: false,
      })
    }
  },

  // 处理单选标签选择
  onSelectSingleTag(e: any) {
    const { dimension, tagId } = e.currentTarget.dataset;
    const selectedTagsOne = [...this.data.selectedTagsOne];
    const tagArrOne = [...this.data.tagArrOne];
    
    // 查找该维度是否已有选中项
    const existingIndex = selectedTagsOne.findIndex(item => item.dimension === dimension);
    
    if (existingIndex >= 0) {
      // 如果已有选中项，替换为新选中的标签
      selectedTagsOne[existingIndex].tagId = tagId;
    } else {
      // 如果没有选中项，添加新的选中项
      selectedTagsOne.push({ dimension, tagId });
    }
    
    // 更新tagArrOne中的选中状态
    tagArrOne.forEach(group => {
      if (group.dimension === dimension) {
        group.label_list.forEach((label: any) => {
          label.isSelected = label.id === tagId;
        });
      }
    });
    
    this.setData({
      selectedTagsOne,
      tagArrOne
    });
  },

  // 处理多选标签选择
  onSelectMultiTag(e: any) {
    const { dimension, tagId } = e.currentTarget.dataset;
    const selectedTagsMuti = [...this.data.selectedTagsMuti];
    const tagArrMuti = [...this.data.tagArrMuti];
    
    // 查找该维度的选中项
    let dimensionIndex = selectedTagsMuti.findIndex(item => item.dimension === dimension);
    let isSelected = false;
    
    if (dimensionIndex >= 0) {
      // 如果该维度已存在，检查标签是否已选中
      const tagIndex = selectedTagsMuti[dimensionIndex].tagIds.indexOf(tagId);
      
      if (tagIndex >= 0) {
        // 如果标签已选中，取消选中
        selectedTagsMuti[dimensionIndex].tagIds.splice(tagIndex, 1);
        isSelected = false;
        
        // 如果该维度没有选中的标签了，移除整个维度
        if (selectedTagsMuti[dimensionIndex].tagIds.length === 0) {
          selectedTagsMuti.splice(dimensionIndex, 1);
        }
      } else {
        // 如果标签未选中，添加到选中列表
        selectedTagsMuti[dimensionIndex].tagIds.push(tagId);
        isSelected = true;
      }
    } else {
      // 如果该维度不存在，创建新的维度选中项
      selectedTagsMuti.push({ dimension, tagIds: [tagId] });
      isSelected = true;
    }
    
    // 更新tagArrMuti中的选中状态
    tagArrMuti.forEach(group => {
      if (group.dimension === dimension) {
        group.label_list.forEach((label: any) => {
          if (label.id === tagId) {
            label.isSelected = isSelected;
          }
        });
      }
    });
    
    this.setData({
      selectedTagsMuti,
      tagArrMuti
    });
  },

  // 获取所有选中的标签数据
  getAllSelectedTags() {
    return {
      singleTags: this.data.selectedTagsOne,
      multiTags: this.data.selectedTagsMuti
    };
  },

  // 处理"选好了"按钮点击事件
  handleClickChoose() {
    // 检查是否有选中的标签
    if (this.data.selectedTagsOne.length === 0 && this.data.selectedTagsMuti.length === 0) {
      wx.showToast({
        title: '请至少选择一个标签',
        icon: 'none'
      });
      return;
    }
    
    // 调用postLabelMatch发送选中的标签
    this.postLabelMatch();
  },

  onLoad(options) {
    this.setData({
      loading: true,
      curExhibitionId: Number(options.exhibition_id),
    })
    this.initPage(Number(options.exhibition_id));
    this.getTags();

  },
  onShow() {    
    
  },
})

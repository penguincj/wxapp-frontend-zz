// index.ts
// 获取应用实例
// const app = getApp<IAppOption>()
import { getRecoPackageList, getExhibitionLabelGroupAll, postPackageRecommend } from "../../api/api";
import { calTimeTxt, generateNewUrlParams, getCurrentPageParam,getCurrentPageParamStr, transferObjToUrlParams, backToTargetPage } from "../../utils/util";

Page({
  data: { 
    narrationList:[],
    tagArrOne:[] as any,
    tagArrMuti:[] as any,
    selectedTagsOne: [] as any, // 存储单选标签的选中结果
    selectedTagsMuti: [] as any, // 存储多选标签的选中结果
    curExhibitionId:0,
    selectedDuration: "120分钟", // 选择的时长
    selectedVoiceLabel: "温柔女声", // 选择的声音标签
    recommendedPackage: null as any, // 推荐的套餐信息
    recommendScore: 0, // 推荐分数
    durationOptions: ["60分钟", "90分钟", "120分钟", "150分钟"], // 时长选项
    voiceLabelOptions: ["温柔女声", "磁性男声", "活泼女声", "沉稳男声"], // 声音标签选项
  },

  handleClickCard(e: any) {
    console.log('e', e);
    const { id } = e.detail;
    // @ts-ignore
    this.tracker.report('package_choose_click_e33', {
      package_id: id,
    })

    this.goToExhibitlistPage(id);
  },

  goToExhibitlistPage(_packageid: number) {
    const url_params = generateNewUrlParams({
      exhibition_id: Number(this.data.curExhibitionId),
      package_id: Number(_packageid),
    })
    // getApp().globalData.audio.curPackageId = _packageid;
    wx.navigateTo({
      url: '/pages/exhibitlist/index' + url_params,
    })
  },

  async initPage(_exhibitionid: any) {
    try {
      const res_package: any = await getRecoPackageList(_exhibitionid);
      console.log('res_package', res_package)
      if (res_package && res_package.data &&res_package.data.packages) {
        const packageList = res_package.data.packages.map((item: any) => {

          return {
            id: item.id,
            name: item.name,
            image_url: item.image_url,
            duration_fmt: item.duration,
            count: item.listen_count < 999 ? '999+' : item.listen_count,
          }
        })
        this.setData({
          narrationList: packageList,
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
        url: `/pages/customize-explanation/index?exhibition_id=${this.data.curExhibitionId}&package_id=${_id}&labels=${labels}`,
      })
    }
  },

  async postLabelMatch() {
    try {
      // 格式化选中的标签数据
      const formattedLabels = this.formatSelectedLabels();
      // @ts-ignore
      this.tracker.report('package_choose_submit_labels_e35', {
        exhibition_id: this.data.curExhibitionId,
        labels: JSON.stringify(formattedLabels),
      })
      // 提取风格标签
      const styleTags: string[] = [];
      formattedLabels.forEach((item: any) => {
        styleTags.push(...item.labels);
      });
      
      // 调用智能套餐推荐接口
      const res_tag: any = await postPackageRecommend(
        this.data.curExhibitionId, 
        this.data.selectedDuration,
        this.data.selectedVoiceLabel,
        styleTags
      );
      
      if (res_tag && res_tag.code === 0) {
        // 保存推荐结果到data中
        const packageData = res_tag.data;
        const labels = styleTags.join('-');
        
        // this.setData({
        //   recommendedPackage: packageData,
        //   recommendScore: res_tag.score || 0
        // });
        
        console.log('智能推荐套餐:', packageData);
        console.log('推荐分数:', res_tag.score);
        
        // 根据推荐的套餐ID跳转到定制讲解页面
        const package_id = packageData.id;
        this.goToGeneratePage(package_id, labels);
        
        // wx.showToast({
        //   title: `智能推荐成功(分数:${res_tag.score})`,
        //   icon: 'success'
        // });
      } else {
        // 如果推荐失败，使用默认逻辑
        // const narration_id = 9;
        // const labels = styleTags.join('-');
        // console.log('使用默认套餐:', labels);
        // this.goToGeneratePage(narration_id, labels);
        
        // wx.showToast({
        //   title: '选择成功',
        //   icon: 'success'
        // });
      }
      
    } catch (error) {
      console.error('智能推荐失败:', error);
      wx.showToast({
        title: '推荐失败',
        icon: 'error'
      });
      this.setData({
        loading: false,
      })
    }
  },

  // 选择时长
  onSelectDuration(e: any) {
    const { duration } = e.currentTarget.dataset;
    this.setData({
      selectedDuration: duration
    });
  },

  // 选择声音标签
  onSelectVoiceLabel(e: any) {
    const { voiceLabel } = e.currentTarget.dataset;
    this.setData({
      selectedVoiceLabel: voiceLabel
    });
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

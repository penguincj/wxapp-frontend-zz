// components/agent-ui/collapsibleCard/index.js
const questions = [
 "故宫博物院有哪些著名文物？" ,
 "故宫的历史有哪些重要事件？" ,
 "故宫的占地面积有多大？",
]
Component({

  /**
   * 组件的属性列表
   */
  properties: {
   questions: {
    type: Array,
    value: [],
   }
  },

  /**
   * 组件的初始数据
   */
  data: {
    question: questions,
  },
  lifetimes: {
    attached() {
      
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    handleClickQuestion(event) {
      const { que } = event.currentTarget.dataset
      console.log('点击了问题', event)
      this.triggerEvent('ClickQuestion', que)
    }
  },
  options: {
    multipleSlots: true
  }
})
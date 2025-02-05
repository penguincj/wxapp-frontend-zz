const cardConfig1 = [
  {
    id: 0,
    name: '玉出昆冈',
    img: '/static/images/swiper1.jpg',
    desc: '清代宫廷和田玉文化特展',
    link: 'pages/index/index',
    opendate: '2024.01.20-2024.03.31',
    type: '常设展'
  },
  {
    id: 1,
    name: '玉出昆冈2',
    img: '/static/images/swiper2.jpg',
    desc: '清代宫廷和田玉文化特展2',
    link: 'pages/index/index',
    opendate: '2024.01.21-2024.03.31',
    type: '临时展'
  },
];
const order = ['demo1', 'demo2', 'demo3'];
const unitlist = [
  {
    id: 1,
    name: '云南龙陵',
  },
  {
    id: 2,
    name: '玉出昆冈',
  },
  {
    id: 3,
    name: '云南',
  },
  {
    id: 4,
    name: '玉出昆',
  },
  {
    id: 5,
    name: '云南龙陵',
  },
]

Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的属性列表
   */
  properties: {
    
  },
  /**
   * 组件的初始数据
   */
  data: {
    cardConfig: cardConfig1,
    scrollTop: 0,
    toView: 'green',
    order,
    unitlist,
    selectId: 999,
    selectName: '',
  },
  lifetimes: {
    attached() {
      
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    upper(e : any) {
      console.log(e)
    },
  
    lower(e : any) {
      console.log(e)
    },
  
    scroll(e : any) {
      console.log(e)
    },

    selectItem(e: any) {
      console.log('selectItem', e.target.dataset);
      const {id , name} = e.target.dataset;
      if(id && name) {
        this.setData({
          selectId: id,
          selectName: name,
        })
      }
    },

    tap() {
      for (let i = 0; i < order.length; ++i) {
        if (order[i] === this.data.toView) {
          this.setData({
            toView: order[i + 1],
            scrollTop: (i + 1) * 200
          })
          break
        }
      }
    },
  
    tapMove() {
      this.setData({
        scrollTop: this.data.scrollTop + 10
      })
    },
  
    scrollToTop() {
      this.setData({
        scrollTop: 0
      })
    },

  },
})

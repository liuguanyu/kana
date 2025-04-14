Component({
  data: {
    selected: 0,
    color: "#999",
    selectedColor: "#1aad19",
    list: [{
      pagePath: "/pages/overview/overview",
      text: "总览",
      icon: "search"
    }, {
      pagePath: "/pages/play/play",
      text: "播放",
      icon: "waiting"
    }, {
      pagePath: "/pages/test/test",
      text: "测试",
      icon: "info"
    }, {
      pagePath: "/pages/ranking/ranking",
      text: "排名",
      icon: "success"
    }, {
      pagePath: "/pages/review/review",
      text: "复习",
      icon: "download"
    }]
  },
  attached() {
    try {
      // 获取当前页面路径
      const pages = getCurrentPages();
      // 检查页面栈是否为空或无效
      if (!pages || !Array.isArray(pages) || pages.length === 0) {
        return;
      }
      
      const currentPage = pages[pages.length - 1];
      // 检查当前页面对象是否存在
      if (!currentPage || !currentPage.route) {
        return;
      }
      
      const route = currentPage.route;
      
      // 根据当前页面路径设置选中项
      const list = this.data.list;
      for (let i = 0; i < list.length; i++) {
        if (route.includes(list[i].pagePath.substring(1))) {
          this.setData({
            selected: i
          });
          break;
        }
      }
    } catch (error) {
      console.error('TabBar attached error:', error);
    }
  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset;
      const url = data.path;
      
      wx.switchTab({
        url
      });
      
      this.setData({
        selected: data.index
      });
    }
  }
});

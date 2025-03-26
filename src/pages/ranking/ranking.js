// pages/ranking/ranking.js
const app = getApp();

Page({
  data: {
    testRecords: [], // 测试记录列表
    sortBy: 'date', // 排序方式：date（日期）、accuracy（正确率）、duration（用时）
    sortOrder: 'desc', // 排序顺序：asc（升序）、desc（降序）
    noRecords: false, // 是否没有记录
  },

  onLoad: function() {
    this.loadTestRecords();
  },

  onShow: function() {
    // 每次显示页面时重新加载记录，以确保数据最新
    this.loadTestRecords();
  },

  // 加载测试记录
  loadTestRecords: function() {
    const testRecords = app.getTestRecords();
    
    if (testRecords.length === 0) {
      this.setData({
        testRecords: [],
        noRecords: true
      });
      return;
    }
    
    // 根据排序方式和顺序对记录进行排序
    const sortedRecords = this.sortRecords(testRecords, this.data.sortBy, this.data.sortOrder);
    
    this.setData({
      testRecords: sortedRecords,
      noRecords: false
    });
  },

  // 排序记录
  sortRecords: function(records, sortBy, sortOrder) {
    const sortedRecords = [...records];
    
    sortedRecords.sort((a, b) => {
      let valueA, valueB;
      
      // 根据排序方式获取比较值
      switch (sortBy) {
        case 'accuracy':
          valueA = a.accuracy;
          valueB = b.accuracy;
          break;
        case 'duration':
          valueA = a.duration;
          valueB = b.duration;
          break;
        case 'date':
        default:
          valueA = new Date(a.date).getTime();
          valueB = new Date(b.date).getTime();
          break;
      }
      
      // 根据排序顺序进行比较
      if (sortOrder === 'asc') {
        return valueA - valueB;
      } else {
        return valueB - valueA;
      }
    });
    
    return sortedRecords;
  },

  // 更改排序方式
  changeSortBy: function(e) {
    const sortBy = e.currentTarget.dataset.sort;
    
    // 如果点击当前排序方式，则切换排序顺序
    if (sortBy === this.data.sortBy) {
      const newSortOrder = this.data.sortOrder === 'asc' ? 'desc' : 'asc';
      this.setData({
        sortOrder: newSortOrder
      });
    } else {
      // 如果点击不同的排序方式，则使用新的排序方式，并默认为降序
      this.setData({
        sortBy: sortBy,
        sortOrder: 'desc'
      });
    }
    
    // 重新加载并排序记录
    this.loadTestRecords();
  },

  // 格式化日期
  formatDate: function(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  },

  // 删除记录
  deleteRecord: function(e) {
    const index = e.currentTarget.dataset.index;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          // 从全局数据中删除记录
          app.deleteTestRecord(index);
          
          // 重新加载记录
          this.loadTestRecords();
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });
        }
      }
    });
  },

  // 清空所有记录
  clearAllRecords: function() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有记录吗？此操作不可恢复！',
      success: (res) => {
        if (res.confirm) {
          // 清空全局数据中的记录
          app.clearTestRecords();
          
          // 重新加载记录
          this.loadTestRecords();
          
          wx.showToast({
            title: '已清空所有记录',
            icon: 'success'
          });
        }
      }
    });
  },

  // 前往测试页面
  goToTest: function() {
    wx.navigateTo({
      url: '/pages/test/test'
    });
  }
})

// pages/settings/settings.js
const app = getApp();

Page({
  data: {
    // 假名类型选项
    kanaTypeOptions: [
      { value: 'hiragana', label: '平假名' },
      { value: 'katakana', label: '片假名' },
      { value: 'both', label: '全部' }
    ],
    
    // 假名分类选项
    kanaCategoryOptions: [
      { value: 'seion', label: '清音' },
      { value: 'dakuon', label: '浊音' },
      { value: 'youon', label: '拗音' },
      { value: 'all', label: '全部' }
    ],
    
    // 播放模式选项
    playModeOptions: [
      { value: 'sequential', label: '顺序播放' },
      { value: 'random', label: '随机播放' }
    ],
    
    // 当前设置
    settings: {
      kanaType: 'hiragana', // 假名类型：平假名、片假名或全部
      kanaCategory: 'seion', // 假名分类：清音、浊音、拗音或全部
      playMode: 'sequential', // 播放模式：顺序或随机
      playInterval: 2, // 播放间隔（秒）
      requiredConsecutiveCorrect: 3 // 错题重现次数（连续答对多少次后从错题库中移除）
    },
    
    // 播放间隔选项
    playIntervalMin: 1,
    playIntervalMax: 10,
    
    // 错题重现次数选项
    requiredConsecutiveCorrectMin: 1,
    requiredConsecutiveCorrectMax: 10
  },

  onLoad: function() {
    // 加载用户设置
    const savedSettings = app.getSettings();
    if (savedSettings) {
      this.setData({
        settings: savedSettings
      });
    }
  },

  // 切换假名类型
  onKanaTypeChange: function(e) {
    const kanaType = e.detail.value;
    this.setData({
      'settings.kanaType': kanaType
    });
    this.saveSettings();
  },

  // 切换假名分类
  onKanaCategoryChange: function(e) {
    const kanaCategory = e.detail.value;
    this.setData({
      'settings.kanaCategory': kanaCategory
    });
    this.saveSettings();
  },

  // 切换播放模式
  onPlayModeChange: function(e) {
    const playMode = e.detail.value;
    this.setData({
      'settings.playMode': playMode
    });
    this.saveSettings();
  },

  // 调整播放间隔
  onPlayIntervalChange: function(e) {
    const playInterval = parseInt(e.detail.value);
    this.setData({
      'settings.playInterval': playInterval
    });
    this.saveSettings();
  },

  // 调整错题重现次数
  onRequiredConsecutiveCorrectChange: function(e) {
    const requiredConsecutiveCorrect = parseInt(e.detail.value);
    this.setData({
      'settings.requiredConsecutiveCorrect': requiredConsecutiveCorrect
    });
    this.saveSettings();
  },

  // 保存设置
  saveSettings: function() {
    app.saveSettings(this.data.settings);
    wx.showToast({
      title: '设置已保存',
      icon: 'success',
      duration: 1500
    });
  },

  // 重置设置
  resetSettings: function() {
    wx.showModal({
      title: '确认重置',
      content: '确定要将所有设置恢复为默认值吗？',
      success: (res) => {
        if (res.confirm) {
          const defaultSettings = {
            kanaType: 'hiragana',
            kanaCategory: 'seion',
            playMode: 'sequential',
            playInterval: 2,
            requiredConsecutiveCorrect: 3
          };
          
          this.setData({
            settings: defaultSettings
          });
          
          app.saveSettings(defaultSettings);
          
          wx.showToast({
            title: '已重置为默认设置',
            icon: 'success',
            duration: 1500
          });
        }
      }
    });
  },

  // 清空错题库
  clearWrongItems: function() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空错题库吗？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
          app.clearWrongItems();
          
          wx.showToast({
            title: '错题库已清空',
            icon: 'success',
            duration: 1500
          });
        }
      }
    });
  },

  // 清空测试记录
  clearTestRecords: function() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有测试记录吗？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
          app.clearTestRecords();
          
          wx.showToast({
            title: '测试记录已清空',
            icon: 'success',
            duration: 1500
          });
        }
      }
    });
  },

  // 返回首页
  goToHome: function() {
    wx.switchTab({
      url: '/pages/overview/overview'
    });
  }
})

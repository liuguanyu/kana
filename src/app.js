// app.js
const kanaData = require('./utils/kana-data');
App({
  onLaunch: function() {
    // 初始化用户设置
    this.initUserSettings();
    
    // 初始化错题库
    this.initWrongAnswers();
    
    // 初始化测试记录
    this.initTestRecords();
  },
  
  // 全局数据
  globalData: {
    // 用户设置
    settings: {
      kanaType: 'hiragana', // 假名类型：hiragana(平假名)、katakana(片假名)、both(全部)
      kanaCategory: 'seion', // 假名分类：seion(清音)、dakuon(浊音)、youon(拗音)、all(全部)
      playMode: 'sequential', // 播放模式：sequential(顺序)、random(随机)
      playInterval: 2, // 播放间隔(秒)
      requiredConsecutiveCorrect: 3 // 错题重现次数（连续答对多少次后从错题库中移除）
    },
    
    // 错题库
    wrongAnswers: [],
    
    // 测试记录
    testRecords: []
  },
  
  // 初始化用户设置
  initUserSettings: function() {
    const that = this;
    wx.getStorage({
      key: 'settings',
      success: function(res) {
        that.globalData.settings = res.data;
      },
      fail: function() {
        // 如果没有存储的设置，使用默认设置
        wx.setStorage({
          key: 'settings',
          data: that.globalData.settings
        });
      }
    });
  },
  
  // 初始化错题库
  initWrongAnswers: function() {
    const that = this;
    wx.getStorage({
      key: 'wrongAnswers',
      success: function(res) {
        that.globalData.wrongAnswers = res.data;
      },
      fail: function() {
        // 如果没有存储的错题库，使用空数组
        wx.setStorage({
          key: 'wrongAnswers',
          data: []
        });
      }
    });
  },
  
  // 初始化测试记录
  initTestRecords: function() {
    const that = this;
    wx.getStorage({
      key: 'testRecords',
      success: function(res) {
        that.globalData.testRecords = res.data;
      },
      fail: function() {
        // 如果没有存储的测试记录，使用空数组
        wx.setStorage({
          key: 'testRecords',
          data: []
        });
      }
    });
  },
  
  // 保存用户设置
  saveSettings: function(settings) {
    this.globalData.settings = settings;
    wx.setStorage({
      key: 'settings',
      data: settings
    });
  },
  
  // 添加错题
  addWrongAnswer: function(kana) {
    // 检查是否已存在该错题
    const existingIndex = this.globalData.wrongAnswers.findIndex(item => 
      item.kana.hiragana === kana.hiragana && 
      item.kana.katakana === kana.katakana
    );
    
    if (existingIndex >= 0) {
      // 如果已存在，重置正确次数
      this.globalData.wrongAnswers[existingIndex].correctCount = 0;
    } else {
      // 如果不存在，添加新错题
      this.globalData.wrongAnswers.push({
        kana: kana,
        correctCount: 0,
        timestamp: new Date().getTime()
      });
    }
    
    // 保存错题库
    wx.setStorage({
      key: 'wrongAnswers',
      data: this.globalData.wrongAnswers
    });
  },
  
  // 更新错题正确次数
  updateWrongAnswerCorrectCount: function(kana) {
    const existingIndex = this.globalData.wrongAnswers.findIndex(item => 
      item.kana.hiragana === kana.hiragana && 
      item.kana.katakana === kana.katakana
    );
    
    if (existingIndex >= 0) {
      // 增加正确次数
      this.globalData.wrongAnswers[existingIndex].correctCount++;
      
      // 如果达到阈值，从错题库中移除
      if (this.globalData.wrongAnswers[existingIndex].correctCount >= this.globalData.settings.requiredConsecutiveCorrect) {
        this.globalData.wrongAnswers.splice(existingIndex, 1);
      }
      
      // 保存错题库
      wx.setStorage({
        key: 'wrongAnswers',
        data: this.globalData.wrongAnswers
      });
    }
  },
  
  // 添加测试记录
  addTestRecord: function(record) {
    this.globalData.testRecords.push(record);
    
    // 保存测试记录
    wx.setStorage({
      key: 'testRecords',
      data: this.globalData.testRecords
    });
  },
  
  // 删除测试记录
  deleteTestRecord: function(index) {
    this.globalData.testRecords.splice(index, 1);
    
    // 保存测试记录
    wx.setStorage({
      key: 'testRecords',
      data: this.globalData.testRecords
    });
  },
  
  // 获取用户设置
  getSettings: function() {
    return this.globalData.settings;
  },
  
  // 清空错题库
  clearWrongItems: function() {
    this.globalData.wrongAnswers = [];
    wx.setStorage({
      key: 'wrongAnswers',
      data: []
    });
  },
  
  // 清空测试记录
  clearTestRecords: function() {
    this.globalData.testRecords = [];
    wx.setStorage({
      key: 'testRecords',
      data: []
    });
  },
  
  // 获取测试记录
  getTestRecords: function() {
    return this.globalData.testRecords;
  },
  
  // 获取所有假名
  getAllKanas: function() {
    return kanaData.getKanaList('all', 'all');
  },
  
  // 获取错题库
  getWrongItems: function() {
    return this.globalData.wrongAnswers.map(item => ({
      kana: item.kana.hiragana || item.kana.katakana,
      romaji: item.kana.romaji,
      consecutiveCorrect: item.correctCount || 0
    }));
  },
  
  // 更新错题连续答对次数
  updateWrongItemConsecutiveCorrect: function(kana, count) {
    const index = this.globalData.wrongAnswers.findIndex(item => 
      (item.kana.hiragana === kana || item.kana.katakana === kana)
    );
    
    if (index >= 0) {
      this.globalData.wrongAnswers[index].correctCount = count;
      
      // 保存错题库
      wx.setStorage({
        key: 'wrongAnswers',
        data: this.globalData.wrongAnswers
      });
    }
  },
  
  // 从错题库中移除
  removeWrongItem: function(kana) {
    const index = this.globalData.wrongAnswers.findIndex(item => 
      (item.kana.hiragana === kana || item.kana.katakana === kana)
    );
    
    if (index >= 0) {
      this.globalData.wrongAnswers.splice(index, 1);
      
      // 保存错题库
      wx.setStorage({
        key: 'wrongAnswers',
        data: this.globalData.wrongAnswers
      });
    }
  }
});

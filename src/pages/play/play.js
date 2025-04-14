// pages/play/play.js
const app = getApp();
const kanaData = require('../../utils/kana-data');

Page({
  data: {
    currentKana: null, // 当前显示的假名
    isPlaying: false, // 是否正在播放
    isPaused: false, // 是否暂停
    playIndex: 0, // 当前播放索引
    playList: [], // 播放列表
    progress: 0, // 播放进度（百分比）
    currentAudio: null, // 当前播放的音频
    settings: {}, // 用户设置
    playTimer: null, // 播放定时器
  },

  onLoad: function() {
    // 获取用户设置
    const settings = app.getSettings();
    this.setData({
      settings: settings
    });
    
    // 生成播放列表
    this.generatePlayList();
  },

  onUnload: function() {
    // 页面卸载时停止播放
    this.stopPlay();
    
    // 清除定时器
    if (this.data.playTimer) {
      clearTimeout(this.data.playTimer);
    }
  },

  // 生成播放列表
  generatePlayList: function() {
    const settings = this.data.settings;
    
    // 使用kanaData.getKanaList获取假名列表
    let playList = kanaData.getKanaList(settings.kanaType, settings.kanaCategory);
    
    // 如果是随机播放，打乱顺序
    if (settings.playMode === 'random') {
      playList = this.shuffleArray(playList);
    }
    
    this.setData({
      playList: playList,
      playIndex: 0,
      progress: 0
    });
    
    // 如果列表不为空，设置当前假名
    if (playList.length > 0) {
      this.setData({
        currentKana: playList[0]
      });
    }
  },

  // 打乱数组顺序（Fisher-Yates洗牌算法）
  shuffleArray: function(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  },

  // 开始播放
  startPlay: function() {
    if (this.data.isPlaying || this.data.playList.length === 0) {
      return;
    }
    
    this.setData({
      isPlaying: true,
      isPaused: false
    });
    
    this.playCurrentKana();
  },

  // 暂停播放
  pausePlay: function() {
    if (!this.data.isPlaying || this.data.isPaused) {
      return;
    }
    
    this.setData({
      isPaused: true
    });
    
    // 清除定时器
    if (this.data.playTimer) {
      clearTimeout(this.data.playTimer);
    }
  },

  // 继续播放
  resumePlay: function() {
    if (!this.data.isPlaying || !this.data.isPaused) {
      return;
    }
    
    this.setData({
      isPaused: false
    });
    
    this.playCurrentKana();
  },

  // 停止播放
  stopPlay: function() {
    // 停止当前播放的音频
    if (this.data.currentAudio) {
      this.data.currentAudio.stop();
    }
    
    // 清除定时器
    if (this.data.playTimer) {
      clearTimeout(this.data.playTimer);
    }
    
    this.setData({
      isPlaying: false,
      isPaused: false,
      playIndex: 0,
      progress: 0
    });
    
    // 重置当前假名
    if (this.data.playList.length > 0) {
      this.setData({
        currentKana: this.data.playList[0]
      });
    }
  },

  // 播放下一个
  playNext: function() {
    if (this.data.playList.length === 0) {
      return;
    }
    
    let nextIndex = this.data.playIndex + 1;
    
    // 如果已经是最后一个，则回到第一个
    if (nextIndex >= this.data.playList.length) {
      nextIndex = 0;
    }
    
    this.setData({
      playIndex: nextIndex,
      currentKana: this.data.playList[nextIndex],
      progress: (nextIndex / this.data.playList.length) * 100
    });
    
    if (this.data.isPlaying && !this.data.isPaused) {
      this.playCurrentKana();
    }
  },

  // 播放上一个
  playPrev: function() {
    if (this.data.playList.length === 0) {
      return;
    }
    
    let prevIndex = this.data.playIndex - 1;
    
    // 如果已经是第一个，则跳到最后一个
    if (prevIndex < 0) {
      prevIndex = this.data.playList.length - 1;
    }
    
    this.setData({
      playIndex: prevIndex,
      currentKana: this.data.playList[prevIndex],
      progress: (prevIndex / this.data.playList.length) * 100
    });
    
    if (this.data.isPlaying && !this.data.isPaused) {
      this.playCurrentKana();
    }
  },

  // 播放当前假名
  playCurrentKana: function() {
    if (!this.data.currentKana) {
      return;
    }
    
    // 停止当前播放的音频
    if (this.data.currentAudio) {
      this.data.currentAudio.stop();
    }
    
    // 创建新的音频实例
    const audioContext = wx.createInnerAudioContext();
    audioContext.src = `/assets/audio/${this.data.currentKana.romaji}.mp3`;
    audioContext.onError((res) => {
      console.error('音频播放错误:', res);
      wx.showToast({
        title: '音频播放失败',
        icon: 'none'
      });
    });
    
    // 播放音频
    audioContext.play();
    
    // 更新当前音频
    this.setData({
      currentAudio: audioContext
    });
    
    // 设置定时器，播放下一个
    if (this.data.isPlaying && !this.data.isPaused) {
      // 清除之前的定时器
      if (this.data.playTimer) {
        clearTimeout(this.data.playTimer);
      }
      
      // 获取用户设置的播放间隔
      const interval = this.data.settings.playInterval || 2;
      
      // 设置新的定时器
      const playTimer = setTimeout(() => {
        this.playNext();
      }, interval * 1000);
      
      this.setData({
        playTimer: playTimer
      });
    }
  },

  // 重新生成播放列表
  regeneratePlayList: function() {
    this.stopPlay();
    this.generatePlayList();
  },

  // 前往设置页面
  goToSettings: function() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    });
  }
})

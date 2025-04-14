// pages/review/review.js
const app = getApp();

Page({
  data: {
    wrongItems: [], // 错题列表
    currentIndex: 0, // 当前题目索引
    options: [], // 当前题目的选项
    correctAnswer: '', // 正确答案
    selectedOption: '', // 用户选择的选项
    isAnswered: false, // 是否已回答
    isCorrect: false, // 是否回答正确
    showResult: false, // 是否显示结果
    totalQuestions: 0, // 总题数
    correctCount: 0, // 正确数量
    wrongCount: 0, // 错误数量
    accuracy: 0, // 正确率
    noWrongItems: false, // 是否没有错题
    isReviewing: false, // 是否正在复习
    isFinished: false, // 是否完成复习
    consecutiveCorrect: {}, // 每个错题连续答对的次数
    requiredConsecutiveCorrect: 3, // 需要连续答对的次数
    audioContext: null, // 音频上下文
  },

  onLoad: function() {
    // 创建音频上下文
    this.setData({
      audioContext: wx.createInnerAudioContext()
    });
    
    // 加载错题
    this.loadWrongItems();
    
    // 获取设置
    const settings = app.getSettings();
    if (settings && settings.requiredConsecutiveCorrect) {
      this.setData({
        requiredConsecutiveCorrect: settings.requiredConsecutiveCorrect
      });
    }
  },

  onUnload: function() {
    // 页面卸载时停止音频
    if (this.data.audioContext) {
      this.data.audioContext.stop();
    }
  },

  // 加载错题
  loadWrongItems: function() {
    const wrongItems = app.getWrongItems();
    
    if (wrongItems.length === 0) {
      this.setData({
        wrongItems: [],
        noWrongItems: true
      });
      return;
    }
    
    // 初始化连续答对次数
    const consecutiveCorrect = {};
    wrongItems.forEach(item => {
      consecutiveCorrect[item.kana] = item.consecutiveCorrect || 0;
    });
    
    this.setData({
      wrongItems: wrongItems,
      totalQuestions: wrongItems.length,
      noWrongItems: false,
      consecutiveCorrect: consecutiveCorrect
    });
    
    // 准备第一题
    this.prepareQuestion(0);
  },

  // 准备题目
  prepareQuestion: function(index) {
    if (index >= this.data.wrongItems.length) {
      // 所有题目已完成
      this.finishReview();
      return;
    }
    
    const currentItem = this.data.wrongItems[index];
    const allKanas = app.getAllKanas();
    
    // 生成选项（包括正确答案和3个随机错误选项）
    let options = [currentItem.kana];
    
    // 从所有假名中随机选择3个不同的错误选项
    while (options.length < 4) {
      const randomKana = allKanas[Math.floor(Math.random() * allKanas.length)].kana;
      if (randomKana !== currentItem.kana && !options.includes(randomKana)) {
        options.push(randomKana);
      }
    }
    
    // 打乱选项顺序
    options = this.shuffleArray(options);
    
    this.setData({
      currentIndex: index,
      options: options,
      correctAnswer: currentItem.kana,
      selectedOption: '',
      isAnswered: false,
      isCorrect: false,
      showResult: false,
      isReviewing: true
    });
    
    // 播放当前假名的发音
    this.playAudio(currentItem.romaji);
  },

  // 打乱数组顺序
  shuffleArray: function(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  },

  // 播放音频
  playAudio: function(romaji) {
    const audioContext = this.data.audioContext;
    if (audioContext) {
      audioContext.src = `/assets/audio/${romaji}.mp3`;
      audioContext.play();
    }
  },

  // 重播音频
  replayAudio: function() {
    const currentItem = this.data.wrongItems[this.data.currentIndex];
    this.playAudio(currentItem.romaji);
  },

  // 选择选项
  selectOption: function(e) {
    if (this.data.isAnswered) return;
    
    const selectedOption = e.currentTarget.dataset.option;
    const isCorrect = selectedOption === this.data.correctAnswer;
    
    // 更新连续答对次数
    const currentItem = this.data.wrongItems[this.data.currentIndex];
    const consecutiveCorrect = { ...this.data.consecutiveCorrect };
    
    if (isCorrect) {
      consecutiveCorrect[currentItem.kana] = (consecutiveCorrect[currentItem.kana] || 0) + 1;
      this.setData({
        correctCount: this.data.correctCount + 1
      });
    } else {
      consecutiveCorrect[currentItem.kana] = 0;
      this.setData({
        wrongCount: this.data.wrongCount + 1
      });
    }
    
    // 更新错题的连续答对次数
    app.updateWrongItemConsecutiveCorrect(currentItem.kana, consecutiveCorrect[currentItem.kana]);
    
    // 如果连续答对次数达到要求，从错题库中移除
    if (consecutiveCorrect[currentItem.kana] >= this.data.requiredConsecutiveCorrect) {
      app.removeWrongItem(currentItem.kana);
    }
    
    this.setData({
      selectedOption: selectedOption,
      isAnswered: true,
      isCorrect: isCorrect,
      showResult: true,
      consecutiveCorrect: consecutiveCorrect
    });
    
    // 2秒后自动进入下一题
    setTimeout(() => {
      this.nextQuestion();
    }, 2000);
  },

  // 下一题
  nextQuestion: function() {
    if (this.data.currentIndex + 1 < this.data.wrongItems.length) {
      this.prepareQuestion(this.data.currentIndex + 1);
    } else {
      this.finishReview();
    }
  },

  // 完成复习
  finishReview: function() {
    const totalAnswered = this.data.correctCount + this.data.wrongCount;
    const accuracy = totalAnswered > 0 ? (this.data.correctCount / totalAnswered) * 100 : 0;
    
    this.setData({
      isReviewing: false,
      isFinished: true,
      accuracy: accuracy
    });
    
    // 重新加载错题，以便更新状态
    const wrongItems = app.getWrongItems();
    this.setData({
      noWrongItems: wrongItems.length === 0
    });
  },

  // 重新开始复习
  restartReview: function() {
    // 重新加载错题
    this.loadWrongItems();
    
    this.setData({
      currentIndex: 0,
      correctCount: 0,
      wrongCount: 0,
      accuracy: 0,
      isFinished: false
    });
  },

  // 前往测试页面
  goToTest: function() {
    wx.navigateTo({
      url: '/pages/test/test'
    });
  },

  // 前往设置页面
  goToSettings: function() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    });
  }
})

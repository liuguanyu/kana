// pages/test/test.js
const app = getApp();
const kanaData = require('../../utils/kana-data');

Page({
  data: {
    currentQuestion: null, // 当前问题
    options: [], // 选项
    selectedOption: null, // 用户选择的选项
    isCorrect: null, // 是否正确
    score: 0, // 得分
    totalQuestions: 10, // 总问题数
    currentQuestionIndex: 0, // 当前问题索引
    questions: [], // 问题列表
    showResult: false, // 是否显示结果
    testStartTime: null, // 测试开始时间
    testEndTime: null, // 测试结束时间
    testDuration: 0, // 测试用时（秒）
    correctCount: 0, // 正确数量
    wrongCount: 0, // 错误数量
    accuracy: 0, // 正确率
    wrongAnswers: [], // 错误答案列表
    currentAudio: null, // 当前播放的音频
    isPlaying: false, // 是否正在播放
    settings: {}, // 用户设置
  },

  onLoad: function() {
    // 获取用户设置
    const settings = app.getSettings();
    this.setData({
      settings: settings
    });
    
    // 开始测试
    this.startTest();
  },

  onUnload: function() {
    // 页面卸载时停止播放
    if (this.data.currentAudio) {
      this.data.currentAudio.stop();
    }
  },

  // 开始测试
  startTest: function() {
    // 记录开始时间
    const startTime = new Date();
    
    // 生成问题列表
    const questions = this.generateQuestions();
    
    this.setData({
      questions: questions,
      currentQuestionIndex: 0,
      score: 0,
      showResult: false,
      testStartTime: startTime,
      correctCount: 0,
      wrongCount: 0,
      wrongAnswers: []
    });
    
    // 显示第一个问题
    if (questions.length > 0) {
      this.showQuestion(0);
    }
  },

  // 生成问题列表
  generateQuestions: function() {
    const settings = this.data.settings;
    
    // 使用kanaData.getKanaList获取假名列表
    const kanaList = kanaData.getKanaList(settings.kanaType, settings.kanaCategory);
    
    // 如果列表为空，返回空数组
    if (kanaList.length === 0) {
      return [];
    }
    
    // 打乱顺序
    const shuffledList = this.shuffleArray(kanaList);
    
    // 取前N个作为问题
    const totalQuestions = Math.min(this.data.totalQuestions, shuffledList.length);
    const questions = [];
    
    for (let i = 0; i < totalQuestions; i++) {
      const correctKana = shuffledList[i];
      
      // 生成3个错误选项
      const wrongOptions = this.generateWrongOptions(correctKana, shuffledList);
      
      // 合并正确选项和错误选项
      const allOptions = [correctKana, ...wrongOptions];
      
      // 打乱选项顺序
      const shuffledOptions = this.shuffleArray(allOptions);
      
      questions.push({
        kana: correctKana,
        options: shuffledOptions
      });
    }
    
    return questions;
  },

  // 生成错误选项
  generateWrongOptions: function(correctKana, kanaList) {
    // 从假名列表中排除正确选项
    const availableKana = kanaList.filter(kana => kana.romaji !== correctKana.romaji);
    
    // 打乱顺序
    const shuffledKana = this.shuffleArray(availableKana);
    
    // 取前3个作为错误选项
    return shuffledKana.slice(0, 3);
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

  // 显示问题
  showQuestion: function(index) {
    if (index >= this.data.questions.length) {
      // 已经回答完所有问题，显示结果
      this.showTestResult();
      return;
    }
    
    const question = this.data.questions[index];
    
    this.setData({
      currentQuestion: question.kana,
      options: question.options,
      selectedOption: null,
      isCorrect: null,
      currentQuestionIndex: index
    });
    
    // 播放当前假名的发音
    this.playKanaAudio(question.kana);
  },

  // 播放假名音频
  playKanaAudio: function(kana) {
    // 停止当前播放的音频
    if (this.data.currentAudio) {
      this.data.currentAudio.stop();
    }
    
    // 创建新的音频实例
    const audioContext = wx.createInnerAudioContext();
    audioContext.src = `/assets/audio/${kana.romaji}.mp3`;
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
      currentAudio: audioContext,
      isPlaying: true
    });
  },

  // 重播当前假名的发音
  replayAudio: function() {
    if (this.data.currentQuestion) {
      this.playKanaAudio(this.data.currentQuestion);
    }
  },

  // 选择选项
  selectOption: function(e) {
    const index = e.currentTarget.dataset.index;
    const selectedOption = this.data.options[index];
    const correctOption = this.data.currentQuestion;
    const isCorrect = selectedOption.romaji === correctOption.romaji;
    
    // 更新得分和正确/错误计数
    let score = this.data.score;
    let correctCount = this.data.correctCount;
    let wrongCount = this.data.wrongCount;
    let wrongAnswers = [...this.data.wrongAnswers];
    
    if (isCorrect) {
      score += 10;
      correctCount += 1;
    } else {
      wrongCount += 1;
      // 添加到错题列表
      wrongAnswers.push({
        question: correctOption,
        userAnswer: selectedOption
      });
    }
    
    this.setData({
      selectedOption: selectedOption,
      isCorrect: isCorrect,
      score: score,
      correctCount: correctCount,
      wrongCount: wrongCount,
      wrongAnswers: wrongAnswers
    });
    
    // 延迟显示下一题
    setTimeout(() => {
      this.showQuestion(this.data.currentQuestionIndex + 1);
    }, 1000);
  },

  // 显示测试结果
  showTestResult: function() {
    // 记录结束时间
    const endTime = new Date();
    const startTime = this.data.testStartTime;
    const duration = Math.floor((endTime - startTime) / 1000); // 秒
    
    // 计算正确率
    const totalAnswered = this.data.correctCount + this.data.wrongCount;
    const accuracy = totalAnswered > 0 ? (this.data.correctCount / totalAnswered) * 100 : 0;
    
    this.setData({
      showResult: true,
      testEndTime: endTime,
      testDuration: duration,
      accuracy: accuracy.toFixed(1)
    });
    
    // 将错题添加到错题库
    if (this.data.wrongAnswers.length > 0) {
      app.addWrongAnswers(this.data.wrongAnswers.map(item => item.question));
    }
    
    // 添加测试记录
    app.addTestRecord({
      date: new Date().toISOString(),
      score: this.data.score,
      accuracy: accuracy,
      duration: duration,
      totalQuestions: this.data.totalQuestions,
      correctCount: this.data.correctCount,
      wrongCount: this.data.wrongCount
    });
  },

  // 重新开始测试
  restartTest: function() {
    this.startTest();
  },

  // 前往设置页面
  goToSettings: function() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    });
  },

  // 前往错题复习页面
  goToReview: function() {
    wx.navigateTo({
      url: '/pages/review/review'
    });
  }
})

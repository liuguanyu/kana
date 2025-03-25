// 背景脚本，用于处理Chrome扩展的后台任务

// 当扩展安装或更新时初始化数据
chrome.runtime.onInstalled.addListener(() => {
  // 初始化设置
  const defaultSettings = {
    kanaType: 'hiragana', // 'hiragana', 'katakana', 'both'
    kanaCategory: 'seion', // 'seion'(清音), 'dakuon'(浊音), 'youon'(拗音), 'all'(全部)
    playOrder: 'sequential', // 'sequential', 'random'
    playInterval: 3, // 播放间隔，单位秒
    requiredCorrectCount: 3 // 连续正确次数，用于从错题库中删除
  };
  
  // 保存默认设置到存储
  chrome.storage.sync.set({ 
    settings: defaultSettings,
    mistakes: [],
    testResults: []
  });
});

// 创建offscreen文档用于音频播放
async function createOffscreenDocument() {
  // 检查是否已经存在offscreen文档
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT']
  });
  
  if (existingContexts.length > 0) {
    return;
  }
  
  // 创建offscreen文档
  await chrome.offscreen.createDocument({
    url: 'src/offscreen.html',
    reasons: ['AUDIO_PLAYBACK'],
    justification: '用于播放日语50音图的读音'
  });
}

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'playAudio') {
    // 创建offscreen文档并播放音频
    createOffscreenDocument().then(() => {
      chrome.runtime.sendMessage({
        target: 'offscreen',
        action: 'playAudio',
        romaji: message.romaji
      });
    });
    
    return true; // 表示将异步发送响应
  }
});

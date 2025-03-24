// 离屏页面的JavaScript，用于处理音频播放

// 创建音频上下文
let audioContext = null;

// 音频缓存
const audioCache = {};

// 50音图罗马音列表
const romajiList = [
  // 清音
  'a', 'i', 'u', 'e', 'o',
  'ka', 'ki', 'ku', 'ke', 'ko',
  'sa', 'shi', 'su', 'se', 'so',
  'ta', 'chi', 'tsu', 'te', 'to',
  'na', 'ni', 'nu', 'ne', 'no',
  'ha', 'hi', 'fu', 'he', 'ho',
  'ma', 'mi', 'mu', 'me', 'mo',
  'ya', 'yu', 'yo',
  'ra', 'ri', 'ru', 're', 'ro',
  'wa', 'wo', 'n',
  
  // 浊音
  'ga', 'gi', 'gu', 'ge', 'go',
  'za', 'ji', 'zu', 'ze', 'zo',
  'da', 'dji', 'dzu', 'de', 'do',
  'ba', 'bi', 'bu', 'be', 'bo',
  'pa', 'pi', 'pu', 'pe', 'po',
  
  // 拗音
  'kya', 'kyu', 'kyo',
  'sha', 'shu', 'sho',
  'cha', 'chu', 'cho',
  'nya', 'nyu', 'nyo',
  'hya', 'hyu', 'hyo',
  'mya', 'myu', 'myo',
  'rya', 'ryu', 'ryo',
  'gya', 'gyu', 'gyo',
  'ja', 'ju', 'jo',
  'bya', 'byu', 'byo',
  'pya', 'pyu', 'pyo'
];

// 监听来自background的消息
chrome.runtime.onMessage.addListener(async (message) => {
  // 确保消息是发给offscreen页面的
  if (message.target !== 'offscreen') {
    return;
  }
  
  // 处理播放音频请求
  if (message.action === 'playAudio') {
    await playAudio(message.romaji);
  }
});

// 播放音频函数
async function playAudio(romaji) {
  try {
    // 延迟初始化AudioContext，以避免自动播放限制
    if (!audioContext) {
      audioContext = new AudioContext();
    }
    
    // 检查音频上下文状态
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    
    // 获取音频数据
    const audioBuffer = await getAudioBuffer(romaji);
    
    // 创建音频源
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    
    // 播放音频
    source.start(0);
    
    // 返回播放成功消息
    chrome.runtime.sendMessage({
      action: 'audioPlayed',
      romaji: romaji,
      success: true
    });
  } catch (error) {
    console.error('播放音频失败:', error);
    
    // 返回播放失败消息
    chrome.runtime.sendMessage({
      action: 'audioPlayed',
      romaji: romaji,
      success: false,
      error: error.message
    });
  }
}

// 获取音频缓冲区
async function getAudioBuffer(romaji) {
  // 如果已经缓存，直接返回
  if (audioCache[romaji]) {
    return audioCache[romaji];
  }
  
  try {
    // 首先尝试从本地加载
    const localAudioUrl = chrome.runtime.getURL(`src/assets/audio/${romaji}.mp3`);
    let response = await fetch(localAudioUrl);
    
    // 如果本地加载失败，尝试从远程加载
    if (!response.ok) {
      console.log(`本地音频文件不存在: ${romaji}.mp3，尝试从远程加载`);
      const remoteAudioUrl = `https://assets.languagepod101.com/dictionary/japanese/us_audio/kana/${romaji}.mp3`;
      response = await fetch(remoteAudioUrl);
      
      if (!response.ok) {
        throw new Error(`获取音频失败: ${response.status} ${response.statusText}`);
      }
    } else {
      console.log(`使用本地音频文件: ${romaji}.mp3`);
    }
    
    // 将响应转换为ArrayBuffer
    const arrayBuffer = await response.arrayBuffer();
    
    // 解码音频数据
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // 缓存音频数据
    audioCache[romaji] = audioBuffer;
    
    return audioBuffer;
  } catch (error) {
    console.error(`加载音频 ${romaji} 失败:`, error);
    throw error;
  }
}


// 当页面关闭时清理资源
window.addEventListener('unload', () => {
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
});

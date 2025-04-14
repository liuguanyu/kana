/**
 * 音频工具
 */

// 音频基础路径
const AUDIO_BASE_PATH = '/assets/audio/';

/**
 * 创建音频上下文
 * @param {String} romaji 罗马音
 * @returns {InnerAudioContext} 音频上下文
 */
function createAudioContext(romaji) {
  const audioContext = wx.createInnerAudioContext();
  audioContext.src = `${AUDIO_BASE_PATH}${romaji}.mp3`;
  return audioContext;
}

/**
 * 播放假名音频
 * @param {String} romaji 罗马音
 * @returns {Promise<void>} 播放完成的Promise
 */
function playKanaAudio(romaji) {
  return new Promise((resolve, reject) => {
    if (!romaji) {
      reject(new Error('无效的罗马音'));
      return;
    }
    
    const audioContext = createAudioContext(romaji);
    
    audioContext.onPlay(() => {
      console.log(`播放音频: ${romaji}`);
    });
    
    audioContext.onEnded(() => {
      audioContext.destroy();
      resolve();
    });
    
    audioContext.onError((err) => {
      console.error(`音频播放错误: ${romaji}`, err);
      audioContext.destroy();
      reject(err);
    });
    
    audioContext.play();
  });
}

/**
 * 顺序播放多个假名音频
 * @param {Array<String>} romajiList 罗马音列表
 * @param {Number} interval 间隔时间（秒）
 * @param {Function} onProgress 进度回调函数
 * @returns {Promise<void>} 播放完成的Promise
 */
async function playKanaSequence(romajiList, interval = 1, onProgress = null) {
  for (let i = 0; i < romajiList.length; i++) {
    const romaji = romajiList[i];
    
    if (onProgress) {
      onProgress(i, romajiList.length);
    }
    
    try {
      await playKanaAudio(romaji);
      
      // 如果不是最后一个，则等待指定的间隔时间
      if (i < romajiList.length - 1) {
        await new Promise(resolve => setTimeout(resolve, interval * 1000));
      }
    } catch (err) {
      console.error(`播放序列错误: ${romaji}`, err);
    }
  }
  
  if (onProgress) {
    onProgress(romajiList.length, romajiList.length);
  }
}

/**
 * 预加载音频文件
 * @param {Array<String>} romajiList 罗马音列表
 * @returns {Promise<void>} 预加载完成的Promise
 */
async function preloadAudio(romajiList) {
  const promises = romajiList.map(romaji => {
    return new Promise((resolve) => {
      const audioContext = createAudioContext(romaji);
      
      audioContext.onCanplay(() => {
        audioContext.destroy();
        resolve();
      });
      
      audioContext.onError(() => {
        audioContext.destroy();
        resolve(); // 即使加载失败也继续
      });
    });
  });
  
  await Promise.all(promises);
}

module.exports = {
  AUDIO_BASE_PATH,
  createAudioContext,
  playKanaAudio,
  playKanaSequence,
  preloadAudio
};

/**
 * 假名工具函数
 */

const { getKanaList, shuffleArray: shuffleKanaArray } = require('./kana-data');

/**
 * 根据设置获取假名数组
 * @param {Object} settings 用户设置
 * @returns {Array} 假名数组
 */
function getKanaArrayBySettings(settings) {
  const { kanaType, kanaCategory } = settings;
  
  // 获取指定类型和分类的假名列表
  let kanaArray = [];
  
  if (kanaType === 'hiragana') {
    kanaArray = getKanaList('hiragana', kanaCategory);
    return kanaArray.map(item => ({
      ...item,
      display: item.kana
    }));
  } else if (kanaType === 'katakana') {
    kanaArray = getKanaList('katakana', kanaCategory);
    return kanaArray.map(item => ({
      ...item,
      display: item.kana
    }));
  } else {
    // 'both' 类型，随机选择平假名或片假名
    const hiraganaList = getKanaList('hiragana', kanaCategory);
    const katakanaList = getKanaList('katakana', kanaCategory);
    
    // 合并并确保每个罗马音只出现一次
    const romajiSet = new Set();
    const combinedList = [];
    
    [...hiraganaList, ...katakanaList].forEach(item => {
      if (!romajiSet.has(item.romaji)) {
        romajiSet.add(item.romaji);
        
        // 随机选择平假名或片假名
        const isHiragana = Math.random() > 0.5;
        const kana = isHiragana ? 
          hiraganaList.find(k => k.romaji === item.romaji)?.kana : 
          katakanaList.find(k => k.romaji === item.romaji)?.kana;
        
        combinedList.push({
          ...item,
          display: kana,
          isHiragana
        });
      }
    });
    
    return combinedList;
  }
}

/**
 * 打乱数组顺序
 * @param {Array} array 要打乱的数组
 * @returns {Array} 打乱后的数组
 */
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

/**
 * 根据设置获取播放顺序的假名数组
 * @param {Object} settings 用户设置
 * @returns {Array} 排序后的假名数组
 */
function getPlayOrderKanaArray(settings) {
  const kanaArray = getKanaArrayBySettings(settings);
  
  if (settings.playMode === 'random') {
    return shuffleArray(kanaArray);
  } else {
    // 顺序播放
    return kanaArray;
  }
}

/**
 * 生成测试选项
 * @param {Object} correctKana 正确的假名对象
 * @param {Array} allKana 所有假名数组
 * @param {Number} optionCount 选项数量，默认4
 * @returns {Array} 选项数组，包含正确选项和干扰项
 */
function generateTestOptions(correctKana, allKana, optionCount = 4) {
  // 过滤掉正确答案
  const otherKana = allKana.filter(item => 
    item.romaji !== correctKana.romaji
  );
  
  // 随机选择干扰项
  const distractors = shuffleArray(otherKana).slice(0, optionCount - 1);
  
  // 合并正确选项和干扰项，并打乱顺序
  return shuffleArray([correctKana, ...distractors]);
}

/**
 * 根据设置生成测试项
 * @param {Object} settings 用户设置
 * @param {Number} count 测试项数量
 * @returns {Array} 测试项数组
 */
function generateTestItems(settings, count = 10) {
  const kanaArray = getKanaArrayBySettings(settings);
  const shuffledKana = shuffleArray(kanaArray);
  const testItems = shuffledKana.slice(0, count);
  
  return testItems.map(kana => ({
    question: kana,
    options: generateTestOptions(kana, kanaArray)
  }));
}

/**
 * 计算测试结果
 * @param {Array} answers 用户回答数组，每项包含 {question, selected, isCorrect}
 * @returns {Object} 测试结果统计
 */
function calculateTestResult(answers) {
  const totalQuestions = answers.length;
  const correctAnswers = answers.filter(a => a.isCorrect).length;
  const accuracy = totalQuestions > 0 ? correctAnswers / totalQuestions : 0;
  
  return {
    totalQuestions,
    correctAnswers,
    accuracy: accuracy.toFixed(2),
    wrongAnswers: totalQuestions - correctAnswers
  };
}

module.exports = {
  getKanaArrayBySettings,
  shuffleArray,
  getPlayOrderKanaArray,
  generateTestOptions,
  generateTestItems,
  calculateTestResult
};

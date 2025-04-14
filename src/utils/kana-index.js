// 50音图数据主入口
const { seion } = require('./kana-seion');
const { dakuon } = require('./kana-dakuon');
const { youon } = require('./kana-youon');
const { 
  getKanaArrayBySettings, 
  shuffleArray, 
  getPlayOrderKanaArray, 
  generateTestOptions, 
  generateTestItems, 
  calculateTestResult 
} = require('./kana-utils');
const { 
  KANA_TYPE, 
  KANA_CATEGORY, 
  PLAY_MODE, 
  getAllKanaData, 
  getKanaList, 
  getKanaByRomaji, 
  getRomajiByKana, 
  getRandomKana, 
  getRandomKanaOptions 
} = require('./kana-data');

// 合并所有假名数据
const kanaData = {
  seion,
  dakuon,
  youon
};

// 导出所有数据和工具函数
module.exports = {
  kanaData,
  seion,
  dakuon,
  youon,
  KANA_TYPE,
  KANA_CATEGORY,
  PLAY_MODE,
  getAllKanaData,
  getKanaList,
  getKanaByRomaji,
  getRomajiByKana,
  getRandomKana,
  getRandomKanaOptions,
  getKanaArrayBySettings,
  shuffleArray,
  getPlayOrderKanaArray,
  generateTestOptions,
  generateTestItems,
  calculateTestResult
};

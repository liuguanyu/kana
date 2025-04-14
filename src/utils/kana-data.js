/**
 * 假名数据工具
 */
const { seion } = require('./kana-seion');
const { dakuon } = require('./kana-dakuon');
const { youon } = require('./kana-youon');

// 假名类型
const KANA_TYPE = {
  HIRAGANA: 'hiragana',
  KATAKANA: 'katakana',
  ALL: 'all'
};

// 假名分类
const KANA_CATEGORY = {
  SEION: 'seion',   // 清音
  DAKUON: 'dakuon', // 浊音
  YOUON: 'youon',   // 拗音
  ALL: 'all'        // 全部
};

// 播放模式
const PLAY_MODE = {
  SEQUENCE: 'sequence', // 顺序播放
  RANDOM: 'random'      // 随机播放
};

/**
 * 获取所有假名数据
 * @returns {Array} 所有假名数据
 */
function getAllKanaData() {
  return {
    seion,
    dakuon,
    youon
  };
}

/**
 * 获取指定类型和分类的假名列表
 * @param {String} type 假名类型
 * @param {String} category 假名分类
 * @returns {Array} 假名列表
 */
function getKanaList(type = KANA_TYPE.HIRAGANA, category = KANA_CATEGORY.ALL) {
  let result = [];
  
  // 根据分类选择数据源
  const sources = [];
  if (category === KANA_CATEGORY.ALL || category === KANA_CATEGORY.SEION) {
    sources.push(seion);
  }
  if (category === KANA_CATEGORY.ALL || category === KANA_CATEGORY.DAKUON) {
    sources.push(dakuon);
  }
  if (category === KANA_CATEGORY.ALL || category === KANA_CATEGORY.YOUON) {
    sources.push(youon);
  }
  
  // 从数据源中提取假名
  sources.forEach(source => {
    source.forEach(row => {
      row.forEach(item => {
        if (item && item.romaji) {
          if (type === KANA_TYPE.ALL) {
            result.push({ romaji: item.romaji, kana: item.hiragana, type: KANA_TYPE.HIRAGANA });
            result.push({ romaji: item.romaji, kana: item.katakana, type: KANA_TYPE.KATAKANA });
          } else {
            result.push({ romaji: item.romaji, kana: item[type], type });
          }
        }
      });
    });
  });
  
  return result;
}

/**
 * 根据罗马音获取假名
 * @param {String} romaji 罗马音
 * @param {String} type 假名类型
 * @returns {String} 假名
 */
function getKanaByRomaji(romaji, type = KANA_TYPE.HIRAGANA) {
  const allData = [...seion, ...dakuon, ...youon];
  
  for (const row of allData) {
    for (const item of row) {
      if (item && item.romaji === romaji) {
        return item[type];
      }
    }
  }
  
  return null;
}

/**
 * 根据假名获取罗马音
 * @param {String} kana 假名
 * @returns {String} 罗马音
 */
function getRomajiByKana(kana) {
  const allData = [...seion, ...dakuon, ...youon];
  
  for (const row of allData) {
    for (const item of row) {
      if (item && (item.hiragana === kana || item.katakana === kana)) {
        return item.romaji;
      }
    }
  }
  
  return null;
}

/**
 * 获取随机假名
 * @param {String} type 假名类型
 * @param {String} category 假名分类
 * @param {Array} exclude 排除的假名列表
 * @returns {Object} 随机假名对象
 */
function getRandomKana(type = KANA_TYPE.HIRAGANA, category = KANA_CATEGORY.ALL, exclude = []) {
  const kanaList = getKanaList(type, category).filter(item => !exclude.includes(item.kana));
  
  if (kanaList.length === 0) {
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * kanaList.length);
  return kanaList[randomIndex];
}

/**
 * 获取随机假名选项
 * @param {Object} correctKana 正确的假名对象
 * @param {Number} optionCount 选项数量
 * @param {String} type 假名类型
 * @param {String} category 假名分类
 * @returns {Array} 选项列表
 */
function getRandomKanaOptions(correctKana, optionCount = 4, type = KANA_TYPE.HIRAGANA, category = KANA_CATEGORY.ALL) {
  const kanaList = getKanaList(type, category).filter(item => item.kana !== correctKana.kana);
  const options = [correctKana];
  
  // 随机选择其他选项
  while (options.length < optionCount && kanaList.length > 0) {
    const randomIndex = Math.floor(Math.random() * kanaList.length);
    const option = kanaList[randomIndex];
    
    // 确保选项不重复
    if (!options.some(item => item.kana === option.kana)) {
      options.push(option);
    }
    
    // 从列表中移除已选择的选项
    kanaList.splice(randomIndex, 1);
  }
  
  // 打乱选项顺序
  return shuffleArray(options);
}

/**
 * 打乱数组顺序
 * @param {Array} array 数组
 * @returns {Array} 打乱后的数组
 */
function shuffleArray(array) {
  const result = [...array];
  
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  
  return result;
}

module.exports = {
  KANA_TYPE,
  KANA_CATEGORY,
  PLAY_MODE,
  getAllKanaData,
  getKanaList,
  getKanaByRomaji,
  getRomajiByKana,
  getRandomKana,
  getRandomKanaOptions,
  shuffleArray
};

/**
 * 存储工具
 */

// 存储键名
const STORAGE_KEYS = {
  SETTINGS: 'settings',
  WRONG_ANSWERS: 'wrongAnswers',
  TEST_RECORDS: 'testRecords'
};

// 默认设置
const DEFAULT_SETTINGS = {
  kanaType: 'hiragana',       // 假名类型：hiragana, katakana, all
  kanaCategory: 'seion',      // 假名分类：seion, dakuon, youon, all
  playMode: 'sequence',       // 播放模式：sequence, random
  playInterval: 1,            // 播放间隔（秒）
  wrongAnswerThreshold: 3     // 错题重现次数（连续答对多少次后从错题库中移除）
};

/**
 * 获取设置
 * @returns {Promise<Object>} 设置对象
 */
function getSettings() {
  return new Promise((resolve) => {
    wx.getStorage({
      key: STORAGE_KEYS.SETTINGS,
      success: (res) => {
        resolve(res.data);
      },
      fail: () => {
        // 如果没有保存过设置，则使用默认设置
        resolve(DEFAULT_SETTINGS);
      }
    });
  });
}

/**
 * 保存设置
 * @param {Object} settings 设置对象
 * @returns {Promise<void>} 保存完成的Promise
 */
function saveSettings(settings) {
  return new Promise((resolve, reject) => {
    wx.setStorage({
      key: STORAGE_KEYS.SETTINGS,
      data: settings,
      success: () => {
        resolve();
      },
      fail: (err) => {
        console.error('保存设置失败', err);
        reject(err);
      }
    });
  });
}

/**
 * 获取错题列表
 * @returns {Promise<Array>} 错题列表
 */
function getWrongAnswers() {
  return new Promise((resolve) => {
    wx.getStorage({
      key: STORAGE_KEYS.WRONG_ANSWERS,
      success: (res) => {
        resolve(res.data || []);
      },
      fail: () => {
        // 如果没有错题记录，则返回空数组
        resolve([]);
      }
    });
  });
}

/**
 * 保存错题列表
 * @param {Array} wrongAnswers 错题列表
 * @returns {Promise<void>} 保存完成的Promise
 */
function saveWrongAnswers(wrongAnswers) {
  return new Promise((resolve, reject) => {
    wx.setStorage({
      key: STORAGE_KEYS.WRONG_ANSWERS,
      data: wrongAnswers,
      success: () => {
        resolve();
      },
      fail: (err) => {
        console.error('保存错题列表失败', err);
        reject(err);
      }
    });
  });
}

/**
 * 添加错题
 * @param {Object} wrongAnswer 错题对象
 * @returns {Promise<void>} 保存完成的Promise
 */
async function addWrongAnswer(wrongAnswer) {
  const wrongAnswers = await getWrongAnswers();
  
  // 检查是否已存在相同的错题
  const existingIndex = wrongAnswers.findIndex(item => 
    item.romaji === wrongAnswer.romaji && item.type === wrongAnswer.type
  );
  
  if (existingIndex >= 0) {
    // 如果已存在，则重置连续正确次数
    wrongAnswers[existingIndex].correctCount = 0;
  } else {
    // 如果不存在，则添加新错题
    wrongAnswers.push({
      ...wrongAnswer,
      correctCount: 0,
      timestamp: Date.now()
    });
  }
  
  return saveWrongAnswers(wrongAnswers);
}

/**
 * 更新错题的连续正确次数
 * @param {Object} answer 回答对象
 * @param {Boolean} isCorrect 是否正确
 * @returns {Promise<void>} 保存完成的Promise
 */
async function updateWrongAnswerCorrectCount(answer, isCorrect) {
  const wrongAnswers = await getWrongAnswers();
  
  const index = wrongAnswers.findIndex(item => 
    item.romaji === answer.romaji && item.type === answer.type
  );
  
  if (index >= 0) {
    if (isCorrect) {
      // 如果回答正确，则增加连续正确次数
      wrongAnswers[index].correctCount += 1;
    } else {
      // 如果回答错误，则重置连续正确次数
      wrongAnswers[index].correctCount = 0;
    }
    
    // 获取错题重现阈值
    const settings = await getSettings();
    const threshold = settings.wrongAnswerThreshold || DEFAULT_SETTINGS.wrongAnswerThreshold;
    
    // 如果连续正确次数达到阈值，则从错题库中移除
    if (wrongAnswers[index].correctCount >= threshold) {
      wrongAnswers.splice(index, 1);
    }
    
    return saveWrongAnswers(wrongAnswers);
  }
  
  return Promise.resolve();
}

/**
 * 获取测试记录
 * @returns {Promise<Array>} 测试记录列表
 */
function getTestRecords() {
  return new Promise((resolve) => {
    wx.getStorage({
      key: STORAGE_KEYS.TEST_RECORDS,
      success: (res) => {
        resolve(res.data || []);
      },
      fail: () => {
        // 如果没有测试记录，则返回空数组
        resolve([]);
      }
    });
  });
}

/**
 * 保存测试记录
 * @param {Array} testRecords 测试记录列表
 * @returns {Promise<void>} 保存完成的Promise
 */
function saveTestRecords(testRecords) {
  return new Promise((resolve, reject) => {
    wx.setStorage({
      key: STORAGE_KEYS.TEST_RECORDS,
      data: testRecords,
      success: () => {
        resolve();
      },
      fail: (err) => {
        console.error('保存测试记录失败', err);
        reject(err);
      }
    });
  });
}

/**
 * 添加测试记录
 * @param {Object} testRecord 测试记录对象
 * @returns {Promise<void>} 保存完成的Promise
 */
async function addTestRecord(testRecord) {
  const testRecords = await getTestRecords();
  
  // 添加新测试记录
  testRecords.push({
    ...testRecord,
    timestamp: Date.now()
  });
  
  return saveTestRecords(testRecords);
}

/**
 * 删除测试记录
 * @param {Number} index 测试记录索引
 * @returns {Promise<void>} 保存完成的Promise
 */
async function deleteTestRecord(index) {
  const testRecords = await getTestRecords();
  
  if (index >= 0 && index < testRecords.length) {
    testRecords.splice(index, 1);
    return saveTestRecords(testRecords);
  }
  
  return Promise.resolve();
}

/**
 * 清空所有存储数据
 * @returns {Promise<void>} 清空完成的Promise
 */
async function clearAllData() {
  try {
    await wx.removeStorage({ key: STORAGE_KEYS.SETTINGS });
    await wx.removeStorage({ key: STORAGE_KEYS.WRONG_ANSWERS });
    await wx.removeStorage({ key: STORAGE_KEYS.TEST_RECORDS });
    return Promise.resolve();
  } catch (err) {
    console.error('清空数据失败', err);
    return Promise.reject(err);
  }
}

module.exports = {
  STORAGE_KEYS,
  DEFAULT_SETTINGS,
  getSettings,
  saveSettings,
  getWrongAnswers,
  saveWrongAnswers,
  addWrongAnswer,
  updateWrongAnswerCorrectCount,
  getTestRecords,
  saveTestRecords,
  addTestRecord,
  deleteTestRecord,
  clearAllData
};

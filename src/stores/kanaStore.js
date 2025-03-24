import { writable, get } from 'svelte/store';

// 平假名数据
const hiraganaData = [
  // 清音
  { kana: 'あ', romaji: 'a' },
  { kana: 'い', romaji: 'i' },
  { kana: 'う', romaji: 'u' },
  { kana: 'え', romaji: 'e' },
  { kana: 'お', romaji: 'o' },
  { kana: 'か', romaji: 'ka' },
  { kana: 'き', romaji: 'ki' },
  { kana: 'く', romaji: 'ku' },
  { kana: 'け', romaji: 'ke' },
  { kana: 'こ', romaji: 'ko' },
  { kana: 'さ', romaji: 'sa' },
  { kana: 'し', romaji: 'shi' },
  { kana: 'す', romaji: 'su' },
  { kana: 'せ', romaji: 'se' },
  { kana: 'そ', romaji: 'so' },
  { kana: 'た', romaji: 'ta' },
  { kana: 'ち', romaji: 'chi' },
  { kana: 'つ', romaji: 'tsu' },
  { kana: 'て', romaji: 'te' },
  { kana: 'と', romaji: 'to' },
  { kana: 'な', romaji: 'na' },
  { kana: 'に', romaji: 'ni' },
  { kana: 'ぬ', romaji: 'nu' },
  { kana: 'ね', romaji: 'ne' },
  { kana: 'の', romaji: 'no' },
  { kana: 'は', romaji: 'ha' },
  { kana: 'ひ', romaji: 'hi' },
  { kana: 'ふ', romaji: 'fu' },
  { kana: 'へ', romaji: 'he' },
  { kana: 'ほ', romaji: 'ho' },
  { kana: 'ま', romaji: 'ma' },
  { kana: 'み', romaji: 'mi' },
  { kana: 'む', romaji: 'mu' },
  { kana: 'め', romaji: 'me' },
  { kana: 'も', romaji: 'mo' },
  { kana: 'や', romaji: 'ya' },
  { kana: 'ゆ', romaji: 'yu' },
  { kana: 'よ', romaji: 'yo' },
  { kana: 'ら', romaji: 'ra' },
  { kana: 'り', romaji: 'ri' },
  { kana: 'る', romaji: 'ru' },
  { kana: 'れ', romaji: 're' },
  { kana: 'ろ', romaji: 'ro' },
  { kana: 'わ', romaji: 'wa' },
  { kana: 'を', romaji: 'wo' },
  { kana: 'ん', romaji: 'n' },
  
  // 浊音
  { kana: 'が', romaji: 'ga' },
  { kana: 'ぎ', romaji: 'gi' },
  { kana: 'ぐ', romaji: 'gu' },
  { kana: 'げ', romaji: 'ge' },
  { kana: 'ご', romaji: 'go' },
  { kana: 'ざ', romaji: 'za' },
  { kana: 'じ', romaji: 'ji' },
  { kana: 'ず', romaji: 'zu' },
  { kana: 'ぜ', romaji: 'ze' },
  { kana: 'ぞ', romaji: 'zo' },
  { kana: 'だ', romaji: 'da' },
  { kana: 'で', romaji: 'de' },
  { kana: 'ど', romaji: 'do' },
  { kana: 'ば', romaji: 'ba' },
  { kana: 'び', romaji: 'bi' },
  { kana: 'ぶ', romaji: 'bu' },
  { kana: 'べ', romaji: 'be' },
  { kana: 'ぼ', romaji: 'bo' },
  { kana: 'ぱ', romaji: 'pa' },
  { kana: 'ぴ', romaji: 'pi' },
  { kana: 'ぷ', romaji: 'pu' },
  { kana: 'ぺ', romaji: 'pe' },
  { kana: 'ぽ', romaji: 'po' },
  
  // 拗音
  { kana: 'きゃ', romaji: 'kya' },
  { kana: 'きゅ', romaji: 'kyu' },
  { kana: 'きょ', romaji: 'kyo' },
  { kana: 'しゃ', romaji: 'sha' },
  { kana: 'しゅ', romaji: 'shu' },
  { kana: 'しょ', romaji: 'sho' },
  { kana: 'ちゃ', romaji: 'cha' },
  { kana: 'ちゅ', romaji: 'chu' },
  { kana: 'ちょ', romaji: 'cho' },
  { kana: 'にゃ', romaji: 'nya' },
  { kana: 'にゅ', romaji: 'nyu' },
  { kana: 'にょ', romaji: 'nyo' },
  { kana: 'ひゃ', romaji: 'hya' },
  { kana: 'ひゅ', romaji: 'hyu' },
  { kana: 'ひょ', romaji: 'hyo' },
  { kana: 'みゃ', romaji: 'mya' },
  { kana: 'みゅ', romaji: 'myu' },
  { kana: 'みょ', romaji: 'myo' },
  { kana: 'りゃ', romaji: 'rya' },
  { kana: 'りゅ', romaji: 'ryu' },
  { kana: 'りょ', romaji: 'ryo' },
  { kana: 'ぎゃ', romaji: 'gya' },
  { kana: 'ぎゅ', romaji: 'gyu' },
  { kana: 'ぎょ', romaji: 'gyo' },
  { kana: 'じゃ', romaji: 'ja' },
  { kana: 'じゅ', romaji: 'ju' },
  { kana: 'じょ', romaji: 'jo' },
  { kana: 'びゃ', romaji: 'bya' },
  { kana: 'びゅ', romaji: 'byu' },
  { kana: 'びょ', romaji: 'byo' },
  { kana: 'ぴゃ', romaji: 'pya' },
  { kana: 'ぴゅ', romaji: 'pyu' },
  { kana: 'ぴょ', romaji: 'pyo' }
];

// 片假名数据
const katakanaData = [
  // 清音
  { kana: 'ア', romaji: 'a' },
  { kana: 'イ', romaji: 'i' },
  { kana: 'ウ', romaji: 'u' },
  { kana: 'エ', romaji: 'e' },
  { kana: 'オ', romaji: 'o' },
  { kana: 'カ', romaji: 'ka' },
  { kana: 'キ', romaji: 'ki' },
  { kana: 'ク', romaji: 'ku' },
  { kana: 'ケ', romaji: 'ke' },
  { kana: 'コ', romaji: 'ko' },
  { kana: 'サ', romaji: 'sa' },
  { kana: 'シ', romaji: 'shi' },
  { kana: 'ス', romaji: 'su' },
  { kana: 'セ', romaji: 'se' },
  { kana: 'ソ', romaji: 'so' },
  { kana: 'タ', romaji: 'ta' },
  { kana: 'チ', romaji: 'chi' },
  { kana: 'ツ', romaji: 'tsu' },
  { kana: 'テ', romaji: 'te' },
  { kana: 'ト', romaji: 'to' },
  { kana: 'ナ', romaji: 'na' },
  { kana: 'ニ', romaji: 'ni' },
  { kana: 'ヌ', romaji: 'nu' },
  { kana: 'ネ', romaji: 'ne' },
  { kana: 'ノ', romaji: 'no' },
  { kana: 'ハ', romaji: 'ha' },
  { kana: 'ヒ', romaji: 'hi' },
  { kana: 'フ', romaji: 'fu' },
  { kana: 'ヘ', romaji: 'he' },
  { kana: 'ホ', romaji: 'ho' },
  { kana: 'マ', romaji: 'ma' },
  { kana: 'ミ', romaji: 'mi' },
  { kana: 'ム', romaji: 'mu' },
  { kana: 'メ', romaji: 'me' },
  { kana: 'モ', romaji: 'mo' },
  { kana: 'ヤ', romaji: 'ya' },
  { kana: 'ユ', romaji: 'yu' },
  { kana: 'ヨ', romaji: 'yo' },
  { kana: 'ラ', romaji: 'ra' },
  { kana: 'リ', romaji: 'ri' },
  { kana: 'ル', romaji: 'ru' },
  { kana: 'レ', romaji: 're' },
  { kana: 'ロ', romaji: 'ro' },
  { kana: 'ワ', romaji: 'wa' },
  { kana: 'ヲ', romaji: 'wo' },
  { kana: 'ン', romaji: 'n' },
  
  // 浊音
  { kana: 'ガ', romaji: 'ga' },
  { kana: 'ギ', romaji: 'gi' },
  { kana: 'グ', romaji: 'gu' },
  { kana: 'ゲ', romaji: 'ge' },
  { kana: 'ゴ', romaji: 'go' },
  { kana: 'ザ', romaji: 'za' },
  { kana: 'ジ', romaji: 'ji' },
  { kana: 'ズ', romaji: 'zu' },
  { kana: 'ゼ', romaji: 'ze' },
  { kana: 'ゾ', romaji: 'zo' },
  { kana: 'ダ', romaji: 'da' },
  { kana: 'デ', romaji: 'de' },
  { kana: 'ド', romaji: 'do' },
  { kana: 'バ', romaji: 'ba' },
  { kana: 'ビ', romaji: 'bi' },
  { kana: 'ブ', romaji: 'bu' },
  { kana: 'ベ', romaji: 'be' },
  { kana: 'ボ', romaji: 'bo' },
  { kana: 'パ', romaji: 'pa' },
  { kana: 'ピ', romaji: 'pi' },
  { kana: 'プ', romaji: 'pu' },
  { kana: 'ペ', romaji: 'pe' },
  { kana: 'ポ', romaji: 'po' },
  
  // 拗音
  { kana: 'キャ', romaji: 'kya' },
  { kana: 'キュ', romaji: 'kyu' },
  { kana: 'キョ', romaji: 'kyo' },
  { kana: 'シャ', romaji: 'sha' },
  { kana: 'シュ', romaji: 'shu' },
  { kana: 'ショ', romaji: 'sho' },
  { kana: 'チャ', romaji: 'cha' },
  { kana: 'チュ', romaji: 'chu' },
  { kana: 'チョ', romaji: 'cho' },
  { kana: 'ニャ', romaji: 'nya' },
  { kana: 'ニュ', romaji: 'nyu' },
  { kana: 'ニョ', romaji: 'nyo' },
  { kana: 'ヒャ', romaji: 'hya' },
  { kana: 'ヒュ', romaji: 'hyu' },
  { kana: 'ヒョ', romaji: 'hyo' },
  { kana: 'ミャ', romaji: 'mya' },
  { kana: 'ミュ', romaji: 'myu' },
  { kana: 'ミョ', romaji: 'myo' },
  { kana: 'リャ', romaji: 'rya' },
  { kana: 'リュ', romaji: 'ryu' },
  { kana: 'リョ', romaji: 'ryo' },
  { kana: 'ギャ', romaji: 'gya' },
  { kana: 'ギュ', romaji: 'gyu' },
  { kana: 'ギョ', romaji: 'gyo' },
  { kana: 'ジャ', romaji: 'ja' },
  { kana: 'ジュ', romaji: 'ju' },
  { kana: 'ジョ', romaji: 'jo' },
  { kana: 'ビャ', romaji: 'bya' },
  { kana: 'ビュ', romaji: 'byu' },
  { kana: 'ビョ', romaji: 'byo' },
  { kana: 'ピャ', romaji: 'pya' },
  { kana: 'ピュ', romaji: 'pyu' },
  { kana: 'ピョ', romaji: 'pyo' }
];

// 默认设置
const defaultSettings = {
  kanaType: 'hiragana', // 'hiragana', 'katakana', 'both'
  playOrder: 'sequential', // 'sequential', 'random'
  playInterval: 3, // 秒
  requiredCorrectCount: 3 // 连续正确次数，超过此次数从错题库删除
};

// 创建存储
export const settings = writable(defaultSettings);
export const mistakes = writable([]);
export const testResults = writable([]);

// 从存储加载数据
export const loadDataFromStorage = async () => {
  try {
    const data = await chrome.storage.sync.get(['settings', 'mistakes', 'testResults']);
    
    if (data.settings) {
      settings.set(data.settings);
    }
    
    if (data.mistakes) {
      mistakes.set(data.mistakes);
    }
    
    if (data.testResults) {
      testResults.set(data.testResults);
    }
  } catch (error) {
    console.error('加载数据失败:', error);
  }
};

// 保存设置
export const saveSettings = async (newSettings) => {
  settings.set(newSettings);
  try {
    await chrome.storage.sync.set({ settings: newSettings });
  } catch (error) {
    console.error('保存设置失败:', error);
  }
};

// 获取假名列表
export const getKanaList = (kanaType) => {
  if (kanaType === 'hiragana') {
    return hiraganaData;
  } else if (kanaType === 'katakana') {
    return katakanaData;
  } else {
    return [...hiraganaData, ...katakanaData];
  }
};

// 打乱数组
export const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// 生成测试选项
export const generateTestOptions = (correctKana, kanaList, optionsCount = 4) => {
  const options = [correctKana];
  const availableKana = kanaList.filter(item => item.romaji !== correctKana.romaji);
  
  while (options.length < optionsCount && availableKana.length > 0) {
    const randomIndex = Math.floor(Math.random() * availableKana.length);
    const randomKana = availableKana.splice(randomIndex, 1)[0];
    options.push(randomKana);
  }
  
  return shuffleArray(options);
};

// 添加错题
export const addMistake = async (kana) => {
  const currentMistakes = get(mistakes);
  const existingIndex = currentMistakes.findIndex(item => 
    item.kana === kana.kana && item.romaji === kana.romaji
  );
  
  if (existingIndex >= 0) {
    // 已存在，重置正确次数
    const updatedMistakes = [...currentMistakes];
    updatedMistakes[existingIndex].correctCount = 0;
    mistakes.set(updatedMistakes);
  } else {
    // 添加新错题
    const newMistake = { ...kana, correctCount: 0 };
    mistakes.set([...currentMistakes, newMistake]);
  }
  
  try {
    await chrome.storage.sync.set({ mistakes: get(mistakes) });
  } catch (error) {
    console.error('保存错题失败:', error);
  }
};

// 移除错题
export const removeMistake = async (kana) => {
  const currentMistakes = get(mistakes);
  const updatedMistakes = currentMistakes.filter(item => 
    !(item.kana === kana.kana && item.romaji === kana.romaji)
  );
  
  mistakes.set(updatedMistakes);
  
  try {
    await chrome.storage.sync.set({ mistakes: updatedMistakes });
  } catch (error) {
    console.error('移除错题失败:', error);
  }
};

// 更新错题正确次数
export const updateMistakeCorrectCount = async (kana) => {
  const currentMistakes = get(mistakes);
  const mistakeIndex = currentMistakes.findIndex(item => 
    item.kana === kana.kana && item.romaji === kana.romaji
  );
  
  if (mistakeIndex >= 0) {
    const updatedMistakes = [...currentMistakes];
    updatedMistakes[mistakeIndex].correctCount += 1;
    
    // 检查是否达到阈值
    const requiredCorrectCount = get(settings).requiredCorrectCount;
    if (updatedMistakes[mistakeIndex].correctCount >= requiredCorrectCount) {
      updatedMistakes.splice(mistakeIndex, 1);
    }
    
    mistakes.set(updatedMistakes);
    
    try {
      await chrome.storage.sync.set({ mistakes: updatedMistakes });
    } catch (error) {
      console.error('更新错题正确次数失败:', error);
    }
  }
};

// 添加测试结果
export const addTestResult = async (result) => {
  const newResult = {
    ...result,
    timestamp: Date.now()
  };
  
  const currentResults = get(testResults);
  testResults.set([...currentResults, newResult]);
  
  try {
    await chrome.storage.sync.set({ testResults: get(testResults) });
  } catch (error) {
    console.error('保存测试结果失败:', error);
  }
};

// 删除测试结果
export const deleteTestResult = async (timestamp) => {
  const currentResults = get(testResults);
  const updatedResults = currentResults.filter(result => result.timestamp !== timestamp);
  
  testResults.set(updatedResults);
  
  try {
    await chrome.storage.sync.set({ testResults: updatedResults });
  } catch (error) {
    console.error('删除测试结果失败:', error);
  }
};

// 初始化
loadDataFromStorage();

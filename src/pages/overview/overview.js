// pages/overview/overview.js
const app = getApp();
import { getKanaList } from '../../utils/kana-data';

Page({
  data: {
    activeTab: 'hiragana', // 当前激活的标签：hiragana 或 katakana
    activeCategory: 'seion', // 当前激活的分类：seion, dakuon, youon
    hiraganaTable: [], // 平假名表格数据
    katakanaTable: [], // 片假名表格数据
    isPlaying: false, // 是否正在播放
    currentAudio: null, // 当前播放的音频
  },

  onLoad: function() {
    this.initKanaTables();
  },

  // 初始化假名表格
  initKanaTables: function() {
    // 平假名表格
    this.setData({
      hiraganaTable: this.generateKanaTable('hiragana'),
      katakanaTable: this.generateKanaTable('katakana')
    });
  },

  // 生成假名表格数据
  generateKanaTable: function(type) {
    const kanaData = getKanaList(type, this.data.activeCategory);
    
    // 使用已过滤的数据
    let filteredData = kanaData;

    // 根据不同的分类，生成不同的表格结构
    let table = [];
    
    if (this.data.activeCategory === 'seion') {
      // 清音表格：5列（a, i, u, e, o）
      // 行：空行, k行, s行, t行, n行, h行, m行, y行, r行, w行, n
      
      // 元音行 (a, i, u, e, o)
      const vowels = filteredData.filter(kana => ['a', 'i', 'u', 'e', 'o'].includes(kana.romaji));
      table.push(vowels);
      
      // k行
      const kRow = filteredData.filter(kana => ['ka', 'ki', 'ku', 'ke', 'ko'].includes(kana.romaji));
      table.push(kRow);
      
      // s行
      const sRow = filteredData.filter(kana => ['sa', 'shi', 'su', 'se', 'so'].includes(kana.romaji));
      table.push(sRow);
      
      // t行
      const tRow = filteredData.filter(kana => ['ta', 'chi', 'tsu', 'te', 'to'].includes(kana.romaji));
      table.push(tRow);
      
      // n行
      const nRow = filteredData.filter(kana => ['na', 'ni', 'nu', 'ne', 'no'].includes(kana.romaji));
      table.push(nRow);
      
      // h行
      const hRow = filteredData.filter(kana => ['ha', 'hi', 'fu', 'he', 'ho'].includes(kana.romaji));
      table.push(hRow);
      
      // m行
      const mRow = filteredData.filter(kana => ['ma', 'mi', 'mu', 'me', 'mo'].includes(kana.romaji));
      table.push(mRow);
      
      // y行 (ya, yu, yo) - 需要在i和e位置添加null
      const yRow = [];
      const yKana = filteredData.filter(kana => ['ya', 'yu', 'yo'].includes(kana.romaji));
      yRow.push(yKana.find(kana => kana.romaji === 'ya') || null);
      yRow.push(null); // i位置
      yRow.push(yKana.find(kana => kana.romaji === 'yu') || null);
      yRow.push(null); // e位置
      yRow.push(yKana.find(kana => kana.romaji === 'yo') || null);
      table.push(yRow);
      
      // r行
      const rRow = filteredData.filter(kana => ['ra', 'ri', 'ru', 're', 'ro'].includes(kana.romaji));
      table.push(rRow);
      
      // w行 (wa, wo) - 需要在i, u, e位置添加null
      const wRow = [];
      const wKana = filteredData.filter(kana => ['wa', 'wo'].includes(kana.romaji));
      wRow.push(wKana.find(kana => kana.romaji === 'wa') || null);
      wRow.push(null); // i位置
      wRow.push(null); // u位置
      wRow.push(null); // e位置
      wRow.push(wKana.find(kana => kana.romaji === 'wo') || null);
      table.push(wRow);
      
      // n (单独一行)
      const nKana = filteredData.find(kana => kana.romaji === 'n');
      if (nKana) {
        table.push([nKana, null, null, null, null]);
      }
    } else if (this.data.activeCategory === 'dakuon') {
      // 浊音表格：5列（a, i, u, e, o）
      // 行：g行, z行, d行, b行, p行
      
      // g行
      const gRow = filteredData.filter(kana => ['ga', 'gi', 'gu', 'ge', 'go'].includes(kana.romaji));
      table.push(gRow);
      
      // z行
      const zRow = filteredData.filter(kana => ['za', 'ji', 'zu', 'ze', 'zo'].includes(kana.romaji));
      table.push(zRow);
      
      // d行
      const dRow = filteredData.filter(kana => ['da', 'dji', 'dzu', 'de', 'do'].includes(kana.romaji));
      table.push(dRow);
      
      // b行
      const bRow = filteredData.filter(kana => ['ba', 'bi', 'bu', 'be', 'bo'].includes(kana.romaji));
      table.push(bRow);
      
      // p行
      const pRow = filteredData.filter(kana => ['pa', 'pi', 'pu', 'pe', 'po'].includes(kana.romaji));
      table.push(pRow);
    } else if (this.data.activeCategory === 'youon') {
      // 拗音表格：3列（ya, yu, yo）
      // 行：k行, s行, c行, n行, h行, m行, r行, g行, j行, b行, p行
      
      // k行
      const kyRow = filteredData.filter(kana => ['kya', 'kyu', 'kyo'].includes(kana.romaji));
      table.push(kyRow);
      
      // s行
      const syRow = filteredData.filter(kana => ['sha', 'shu', 'sho'].includes(kana.romaji));
      table.push(syRow);
      
      // c行
      const cyRow = filteredData.filter(kana => ['cha', 'chu', 'cho'].includes(kana.romaji));
      table.push(cyRow);
      
      // n行
      const nyRow = filteredData.filter(kana => ['nya', 'nyu', 'nyo'].includes(kana.romaji));
      table.push(nyRow);
      
      // h行
      const hyRow = filteredData.filter(kana => ['hya', 'hyu', 'hyo'].includes(kana.romaji));
      table.push(hyRow);
      
      // m行
      const myRow = filteredData.filter(kana => ['mya', 'myu', 'myo'].includes(kana.romaji));
      table.push(myRow);
      
      // r行
      const ryRow = filteredData.filter(kana => ['rya', 'ryu', 'ryo'].includes(kana.romaji));
      table.push(ryRow);
      
      // g行
      const gyRow = filteredData.filter(kana => ['gya', 'gyu', 'gyo'].includes(kana.romaji));
      table.push(gyRow);
      
      // j行
      const jyRow = filteredData.filter(kana => ['ja', 'ju', 'jo'].includes(kana.romaji));
      table.push(jyRow);
      
      // b行
      const byRow = filteredData.filter(kana => ['bya', 'byu', 'byo'].includes(kana.romaji));
      table.push(byRow);
      
      // p行
      const pyRow = filteredData.filter(kana => ['pya', 'pyu', 'pyo'].includes(kana.romaji));
      table.push(pyRow);
    }
    
    return table;
  },

  // 切换标签（平假名/片假名）
  switchTab: function(e) {
    const index = parseInt(e.detail.value);
    const tab = index === 0 ? 'hiragana' : 'katakana';
    this.setData({
      activeTab: tab
    });
  },

  // 切换分类（清音/浊音/拗音）
  switchCategory: function(e) {
    const index = parseInt(e.detail.value);
    let category = 'seion';
    
    if (index === 1) {
      category = 'dakuon';
    } else if (index === 2) {
      category = 'youon';
    }
    
    this.setData({
      activeCategory: category
    }, () => {
      // 重新生成表格数据
      this.initKanaTables();
    });
  },

  // 播放单个假名的发音
  playKana: function(e) {
    const romaji = e.currentTarget.dataset.romaji;
    this.playAudio(romaji);
  },

  // 播放一行假名的发音
  playRow: function(e) {
    const rowIndex = e.currentTarget.dataset.row;
    const tableData = this.data.activeTab === 'hiragana' ? this.data.hiraganaTable : this.data.katakanaTable;
    const row = tableData[rowIndex];
    
    this.playSequence(row.filter(item => item !== null).map(item => item.romaji));
  },

  // 播放一列假名的发音
  playColumn: function(e) {
    const colIndex = e.currentTarget.dataset.col;
    const tableData = this.data.activeTab === 'hiragana' ? this.data.hiraganaTable : this.data.katakanaTable;
    
    const column = [];
    for (let i = 0; i < tableData.length; i++) {
      if (tableData[i][colIndex] !== null) {
        column.push(tableData[i][colIndex].romaji);
      }
    }
    
    this.playSequence(column);
  },

  // 播放所有假名的发音
  playAll: function() {
    const tableData = this.data.activeTab === 'hiragana' ? this.data.hiraganaTable : this.data.katakanaTable;
    
    const allKana = [];
    for (let i = 0; i < tableData.length; i++) {
      for (let j = 0; j < tableData[i].length; j++) {
        if (tableData[i][j] !== null) {
          allKana.push(tableData[i][j].romaji);
        }
      }
    }
    
    this.playSequence(allKana);
  },

  // 播放单个音频
  playAudio: function(romaji) {
    // 停止当前播放的音频
    if (this.data.currentAudio) {
      this.data.currentAudio.stop();
    }
    
    // 创建新的音频实例
    const audioContext = wx.createInnerAudioContext();
    audioContext.src = `/assets/audio/${romaji}.mp3`;
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
      currentAudio: audioContext
    });
  },

  // 顺序播放一组假名的发音
  playSequence: function(romajiList) {
    if (this.data.isPlaying || !romajiList || romajiList.length === 0) {
      return;
    }
    
    this.setData({
      isPlaying: true
    });
    
    let index = 0;
    const playNext = () => {
      if (index < romajiList.length) {
        this.playAudio(romajiList[index]);
        
        // 获取用户设置的播放间隔
        const settings = app.getSettings();
        const interval = settings.playInterval || 2;
        
        // 设置定时器，播放下一个
        setTimeout(() => {
          index++;
          playNext();
        }, interval * 1000);
      } else {
        // 播放完成
        this.setData({
          isPlaying: false
        });
      }
    };
    
    playNext();
  },

  // 导航到设置页面
  navigateToSettings: function() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    });
  }
})

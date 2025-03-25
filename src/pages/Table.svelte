<script>
  import { onMount } from 'svelte';
  import { settings, getKanaList } from '../stores/kanaStore';
  
  let currentSettings;
  let kanaTable = [];
  let selectedType = 'hiragana'; // 默认平假名
  let selectedCategory = 'seion'; // 默认清音
  
  // 五十音图行列标题
  const rows = ['あ行', 'か行', 'さ行', 'た行', 'な行', 'は行', 'ま行', 'や行', 'ら行', 'わ行'];
  const columns = ['あ段', 'い段', 'う段', 'え段', 'お段'];
  
  // 订阅设置变化
  onMount(() => {
    const unsubscribe = settings.subscribe(value => {
      currentSettings = { ...value };
      // 初始化选择为当前设置
      selectedType = currentSettings.kanaType === 'both' ? 'hiragana' : currentSettings.kanaType;
      selectedCategory = currentSettings.kanaCategory;
      
      // 生成五十音表格
      generateKanaTable();
    });
    
    return () => {
      unsubscribe();
    };
  });
  
  // 生成五十音表格
  function generateKanaTable() {
    // 获取当前类型和分类的假名列表
    const kanaList = getKanaList(selectedType, selectedCategory);
    
    // 初始化表格
    kanaTable = [];
    
    // 清音表格 (5x10)
    if (selectedCategory === 'seion' || selectedCategory === 'all') {
      // 创建基本的5x10表格结构
      for (let i = 0; i < 10; i++) {
        kanaTable[i] = [];
        for (let j = 0; j < 5; j++) {
          kanaTable[i][j] = null;
        }
      }
      
      // 填充清音
      const seionList = selectedCategory === 'seion' 
        ? kanaList 
        : kanaList.filter(k => ['a', 'i', 'u', 'e', 'o', 'ka', 'ki', 'ku', 'ke', 'ko', 'sa', 'shi', 'su', 'se', 'so', 
                               'ta', 'chi', 'tsu', 'te', 'to', 'na', 'ni', 'nu', 'ne', 'no', 'ha', 'hi', 'fu', 'he', 'ho',
                               'ma', 'mi', 'mu', 'me', 'mo', 'ya', 'yu', 'yo', 'ra', 'ri', 'ru', 're', 'ro', 'wa', 'wo', 'n']
                              .includes(k.romaji));
      
      // 元音 (あ行)
      const vowels = seionList.filter(k => ['a', 'i', 'u', 'e', 'o'].includes(k.romaji));
      vowels.forEach((kana, index) => {
        if (index < 5) kanaTable[0][index] = kana;
      });
      
      // か行
      const kaRow = seionList.filter(k => ['ka', 'ki', 'ku', 'ke', 'ko'].includes(k.romaji));
      kaRow.forEach((kana, index) => {
        if (index < 5) kanaTable[1][index] = kana;
      });
      
      // さ行
      const saRow = seionList.filter(k => ['sa', 'shi', 'su', 'se', 'so'].includes(k.romaji));
      saRow.forEach((kana, index) => {
        if (index < 5) kanaTable[2][index] = kana;
      });
      
      // た行
      const taRow = seionList.filter(k => ['ta', 'chi', 'tsu', 'te', 'to'].includes(k.romaji));
      taRow.forEach((kana, index) => {
        if (index < 5) kanaTable[3][index] = kana;
      });
      
      // な行
      const naRow = seionList.filter(k => ['na', 'ni', 'nu', 'ne', 'no'].includes(k.romaji));
      naRow.forEach((kana, index) => {
        if (index < 5) kanaTable[4][index] = kana;
      });
      
      // は行
      const haRow = seionList.filter(k => ['ha', 'hi', 'fu', 'he', 'ho'].includes(k.romaji));
      haRow.forEach((kana, index) => {
        if (index < 5) kanaTable[5][index] = kana;
      });
      
      // ま行
      const maRow = seionList.filter(k => ['ma', 'mi', 'mu', 'me', 'mo'].includes(k.romaji));
      maRow.forEach((kana, index) => {
        if (index < 5) kanaTable[6][index] = kana;
      });
      
      // や行
      const yaRow = seionList.filter(k => ['ya', 'yu', 'yo'].includes(k.romaji));
      if (yaRow.length > 0) {
        kanaTable[7][0] = yaRow.find(k => k.romaji === 'ya') || null;
        kanaTable[7][2] = yaRow.find(k => k.romaji === 'yu') || null;
        kanaTable[7][4] = yaRow.find(k => k.romaji === 'yo') || null;
      }
      
      // ら行
      const raRow = seionList.filter(k => ['ra', 'ri', 'ru', 're', 'ro'].includes(k.romaji));
      raRow.forEach((kana, index) => {
        if (index < 5) kanaTable[8][index] = kana;
      });
      
      // わ行
      const waRow = seionList.filter(k => ['wa', 'wo', 'n'].includes(k.romaji));
      if (waRow.length > 0) {
        kanaTable[9][0] = waRow.find(k => k.romaji === 'wa') || null;
        kanaTable[9][4] = waRow.find(k => k.romaji === 'wo') || null;
        // ん放在わ行的最后
        const n = waRow.find(k => k.romaji === 'n');
        if (n) {
          // 创建特殊的单元格，跨越多列
          kanaTable[9][1] = { ...n, colspan: 3 };
          kanaTable[9][2] = null;
          kanaTable[9][3] = null;
        }
      }
    }
    
    // 浊音表格
    else if (selectedCategory === 'dakuon') {
      // 创建浊音表格结构 (5行5列)
      for (let i = 0; i < 5; i++) {
        kanaTable[i] = [];
        for (let j = 0; j < 5; j++) {
          kanaTable[i][j] = null;
        }
      }
      
      // が行
      const gaRow = kanaList.filter(k => ['ga', 'gi', 'gu', 'ge', 'go'].includes(k.romaji));
      gaRow.forEach((kana, index) => {
        if (index < 5) kanaTable[0][index] = kana;
      });
      
      // ざ行
      const zaRow = kanaList.filter(k => ['za', 'ji', 'zu', 'ze', 'zo'].includes(k.romaji));
      zaRow.forEach((kana, index) => {
        if (index < 5) kanaTable[1][index] = kana;
      });
      
      // だ行
      const daRow = kanaList.filter(k => ['da', 'dji', 'dzu', 'de', 'do'].includes(k.romaji));
      daRow.forEach((kana, index) => {
        if (index < 5) kanaTable[2][index] = kana;
      });
      
      // ば行
      const baRow = kanaList.filter(k => ['ba', 'bi', 'bu', 'be', 'bo'].includes(k.romaji));
      baRow.forEach((kana, index) => {
        if (index < 5) kanaTable[3][index] = kana;
      });
      
      // ぱ行
      const paRow = kanaList.filter(k => ['pa', 'pi', 'pu', 'pe', 'po'].includes(k.romaji));
      paRow.forEach((kana, index) => {
        if (index < 5) kanaTable[4][index] = kana;
      });
    }
    
    // 拗音表格
    else if (selectedCategory === 'youon') {
      // 创建拗音表格结构
      const youonRows = ['きゃ行', 'しゃ行', 'ちゃ行', 'にゃ行', 'ひゃ行', 'みゃ行', 'りゃ行', 'ぎゃ行', 'じゃ行', 'びゃ行', 'ぴゃ行'];
      const youonCols = ['や', 'ゆ', 'よ'];
      
      for (let i = 0; i < 11; i++) {
        kanaTable[i] = [];
        for (let j = 0; j < 3; j++) {
          kanaTable[i][j] = null;
        }
      }
      
      // きゃ行
      const kyaRow = kanaList.filter(k => ['kya', 'kyu', 'kyo'].includes(k.romaji));
      kyaRow.forEach((kana, index) => {
        if (index < 3) kanaTable[0][index] = kana;
      });
      
      // しゃ行
      const shaRow = kanaList.filter(k => ['sha', 'shu', 'sho'].includes(k.romaji));
      shaRow.forEach((kana, index) => {
        if (index < 3) kanaTable[1][index] = kana;
      });
      
      // ちゃ行
      const chaRow = kanaList.filter(k => ['cha', 'chu', 'cho'].includes(k.romaji));
      chaRow.forEach((kana, index) => {
        if (index < 3) kanaTable[2][index] = kana;
      });
      
      // にゃ行
      const nyaRow = kanaList.filter(k => ['nya', 'nyu', 'nyo'].includes(k.romaji));
      nyaRow.forEach((kana, index) => {
        if (index < 3) kanaTable[3][index] = kana;
      });
      
      // ひゃ行
      const hyaRow = kanaList.filter(k => ['hya', 'hyu', 'hyo'].includes(k.romaji));
      hyaRow.forEach((kana, index) => {
        if (index < 3) kanaTable[4][index] = kana;
      });
      
      // みゃ行
      const myaRow = kanaList.filter(k => ['mya', 'myu', 'myo'].includes(k.romaji));
      myaRow.forEach((kana, index) => {
        if (index < 3) kanaTable[5][index] = kana;
      });
      
      // りゃ行
      const ryaRow = kanaList.filter(k => ['rya', 'ryu', 'ryo'].includes(k.romaji));
      ryaRow.forEach((kana, index) => {
        if (index < 3) kanaTable[6][index] = kana;
      });
      
      // ぎゃ行
      const gyaRow = kanaList.filter(k => ['gya', 'gyu', 'gyo'].includes(k.romaji));
      gyaRow.forEach((kana, index) => {
        if (index < 3) kanaTable[7][index] = kana;
      });
      
      // じゃ行
      const jaRow = kanaList.filter(k => ['ja', 'ju', 'jo'].includes(k.romaji));
      jaRow.forEach((kana, index) => {
        if (index < 3) kanaTable[8][index] = kana;
      });
      
      // びゃ行
      const byaRow = kanaList.filter(k => ['bya', 'byu', 'byo'].includes(k.romaji));
      byaRow.forEach((kana, index) => {
        if (index < 3) kanaTable[9][index] = kana;
      });
      
      // ぴゃ行
      const pyaRow = kanaList.filter(k => ['pya', 'pyu', 'pyo'].includes(k.romaji));
      pyaRow.forEach((kana, index) => {
        if (index < 3) kanaTable[10][index] = kana;
      });
    }
  }
  
  // 切换假名类型
  function changeType(type) {
    selectedType = type;
    generateKanaTable();
  }
  
  // 切换假名分类
  function changeCategory(category) {
    selectedCategory = category;
    generateKanaTable();
  }
</script>

<div class="table-container">
  <h2>五十音图表</h2>
  
  <div class="controls">
    <div class="type-controls">
      <button 
        class={selectedType === 'hiragana' ? 'active' : ''} 
        on:click={() => changeType('hiragana')}
      >
        平假名
      </button>
      
      <button 
        class={selectedType === 'katakana' ? 'active' : ''} 
        on:click={() => changeType('katakana')}
      >
        片假名
      </button>
    </div>
    
    <div class="category-controls">
      <button 
        class={selectedCategory === 'seion' ? 'active' : ''} 
        on:click={() => changeCategory('seion')}
      >
        清音
      </button>
      
      <button 
        class={selectedCategory === 'dakuon' ? 'active' : ''} 
        on:click={() => changeCategory('dakuon')}
      >
        浊音
      </button>
      
      <button 
        class={selectedCategory === 'youon' ? 'active' : ''} 
        on:click={() => changeCategory('youon')}
      >
        拗音
      </button>
      
      <button 
        class={selectedCategory === 'all' ? 'active' : ''} 
        on:click={() => changeCategory('all')}
      >
        全部
      </button>
    </div>
  </div>
  
  <div class="kana-table-wrapper">
    {#if kanaTable.length > 0}
      <table class="kana-table">
        <thead>
          <tr>
            <th></th>
            {#if selectedCategory === 'youon'}
              <th>や</th>
              <th>ゆ</th>
              <th>よ</th>
            {:else}
              <th>あ段</th>
              <th>い段</th>
              <th>う段</th>
              <th>え段</th>
              <th>お段</th>
            {/if}
          </tr>
        </thead>
        <tbody>
          {#each kanaTable as row, rowIndex}
            <tr>
              <th>
                {#if selectedCategory === 'seion' || selectedCategory === 'all'}
                  {rows[rowIndex]}
                {:else if selectedCategory === 'dakuon'}
                  {rowIndex === 0 ? 'が行' : 
                   rowIndex === 1 ? 'ざ行' : 
                   rowIndex === 2 ? 'だ行' : 
                   rowIndex === 3 ? 'ば行' : 'ぱ行'}
                {:else if selectedCategory === 'youon'}
                  {rowIndex === 0 ? 'きゃ行' : 
                   rowIndex === 1 ? 'しゃ行' : 
                   rowIndex === 2 ? 'ちゃ行' : 
                   rowIndex === 3 ? 'にゃ行' : 
                   rowIndex === 4 ? 'ひゃ行' : 
                   rowIndex === 5 ? 'みゃ行' : 
                   rowIndex === 6 ? 'りゃ行' : 
                   rowIndex === 7 ? 'ぎゃ行' : 
                   rowIndex === 8 ? 'じゃ行' : 
                   rowIndex === 9 ? 'びゃ行' : 'ぴゃ行'}
                {/if}
              </th>
              
              {#each row as cell, colIndex}
                {#if cell}
                  {#if cell.colspan}
                    <td colspan={cell.colspan} class="kana-cell">
                      <div class="kana">{cell.kana}</div>
                      <div class="romaji">{cell.romaji}</div>
                    </td>
                  {:else}
                    <td class="kana-cell">
                      <div class="kana">{cell.kana}</div>
                      <div class="romaji">{cell.romaji}</div>
                    </td>
                  {/if}
                {:else}
                  <td class="empty-cell"></td>
                {/if}
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    {:else}
      <div class="empty-state">
        <p>没有可显示的假名</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .table-container {
    padding: 16px;
  }
  
  h2 {
    margin-bottom: 24px;
    text-align: center;
    color: #111; /* 更深的颜色，提高可读性 */
    font-weight: 700;
  }
  
  .controls {
    margin-bottom: 24px;
  }
  
  .type-controls, .category-controls {
    display: flex;
    margin-bottom: 12px;
    overflow-x: auto; /* 允许横向滚动而不换行 */
    padding-bottom: 4px; /* 为可能的滚动条留出空间 */
    white-space: nowrap; /* 确保内容不换行 */
    -webkit-overflow-scrolling: touch; /* 在iOS上提供平滑滚动 */
  }
  
  .type-controls button, .category-controls button {
    flex: 0 0 auto; /* 不伸缩，保持自身大小 */
    background-color: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 8px 12px;
    margin: 0 4px;
    font-size: 14px;
    cursor: pointer;
    color: #222; /* 更深的文字颜色，提高对比度 */
    font-weight: 600; /* 加粗以提高可读性 */
    min-width: 60px;
    text-align: center;
  }
  
  /* 第一个按钮左边距为0 */
  .type-controls button:first-child, .category-controls button:first-child {
    margin-left: 0;
  }
  
  /* 最后一个按钮右边距为0 */
  .type-controls button:last-child, .category-controls button:last-child {
    margin-right: 0;
  }
  
  .type-controls button.active, .category-controls button.active {
    background-color: #e3f2fd;
    border-color: #2196f3;
    color: #0d47a1; /* 更深的蓝色，提高对比度 */
    font-weight: 700; /* 更加粗 */
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .kana-table-wrapper {
    overflow-x: auto;
  }
  
  .kana-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }
  
  .kana-table th, .kana-table td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: center;
  }
  
  .kana-table th {
    background-color: #f5f5f5;
    font-weight: 600;
    color: #222; /* 更深的颜色，提高可读性 */
  }
  
  .kana-cell {
    vertical-align: middle;
    height: 60px;
  }
  
  .kana {
    font-size: 24px;
    margin-bottom: 4px;
    color: #111; /* 更深的颜色，提高可读性 */
    font-weight: 500;
  }
  
  .romaji {
    font-size: 12px;
    color: #222; /* 更深的颜色，提高可读性 */
    font-weight: 500;
  }
  
  .empty-cell {
    background-color: #f9f9f9;
  }
  
  .empty-state {
    text-align: center;
    padding: 32px 16px;
    color: #222; /* 更深的颜色，提高可读性 */
    font-weight: 500;
  }
</style>

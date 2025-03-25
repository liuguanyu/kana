<script>
  import { onMount } from 'svelte';
  import { settings, getKanaList } from '../stores/kanaStore';
  
  let currentSettings;
  let kanaTable = [];
  let selectedType = 'hiragana'; // 默认平假名
  let selectedCategory = 'seion'; // 默认清音
  
  // 播放假名的读音
  function playKanaSound(romaji) {
    if (!romaji) return;
    
    // 发送消息给background脚本播放音频
    chrome.runtime.sendMessage({
      action: 'playAudio',
      romaji: romaji
    });
  }
  
  // 连续播放一行的所有假名
  async function playRowKana(rowIndex) {
    const row = kanaTable[rowIndex];
    if (!row || row.length === 0) return;
    
    // 依次播放该行中所有有效的假名
    for (const cell of row) {
      if (cell && cell.romaji) {
        playKanaSound(cell.romaji);
        // 等待一段时间再播放下一个
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    }
  }
  
  // 连续播放一列的所有假名
  async function playColumnKana(colIndex) {
    if (kanaTable.length === 0) return;
    
    // 依次播放该列中所有有效的假名
    for (const row of kanaTable) {
      if (row[colIndex] && row[colIndex].romaji) {
        playKanaSound(row[colIndex].romaji);
        // 等待一段时间再播放下一个
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    }
  }
  
  // 五十音图行列标题
  const rows = ['あ行', 'か行', 'さ行', 'た行', 'な行', 'は行', 'ま行', 'や行', 'ら行', 'わ行', 'ん'];
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
      const waRow = seionList.filter(k => ['wa', 'wo'].includes(k.romaji));
      if (waRow.length > 0) {
        kanaTable[9][0] = waRow.find(k => k.romaji === 'wa') || null;
        kanaTable[9][4] = waRow.find(k => k.romaji === 'wo') || null;
      }
      
      // ん单独一行
      const n = seionList.find(k => k.romaji === 'n');
      if (n) {
        // 创建第11行专门放ん
        if (!kanaTable[10]) {
          kanaTable[10] = [];
          for (let j = 0; j < 5; j++) {
            kanaTable[10][j] = null;
          }
        }
        // 将ん放在第一列
        kanaTable[10][0] = n;
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
      // 将da放在第一列，dji放在第二列，dzu放在第三列，de放在第四列，do放在第五列
      if (daRow.length > 0) {
        const daKana = daRow.find(k => k.romaji === 'da');
        const djiKana = daRow.find(k => k.romaji === 'dji');
        const dzuKana = daRow.find(k => k.romaji === 'dzu');
        const deKana = daRow.find(k => k.romaji === 'de');
        const doKana = daRow.find(k => k.romaji === 'do');
        
        if (daKana) kanaTable[2][0] = daKana;
        if (djiKana) kanaTable[2][1] = djiKana;
        if (dzuKana) kanaTable[2][2] = dzuKana;
        if (deKana) kanaTable[2][3] = deKana;
        if (doKana) kanaTable[2][4] = doKana;
      }
      
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
  <div class="controls">
    <div class="controls-row">
      <div class="select-wrapper">
        <select bind:value={selectedType} on:change={() => generateKanaTable()}>
          <option value="hiragana">平假名</option>
          <option value="katakana">片假名</option>
        </select>
      </div>
      
      <div class="select-wrapper">
        <select bind:value={selectedCategory} on:change={() => generateKanaTable()}>
          <option value="seion">清音</option>
          <option value="dakuon">浊音</option>
          <option value="youon">拗音</option>
        </select>
      </div>
    </div>
  </div>
  
  <div class="kana-table-wrapper">
    {#if kanaTable.length > 0}
      <table class="kana-table">
        <thead>
          <tr>
            <th></th>
            {#if selectedCategory === 'youon'}
              <th class="header-cell" on:click={() => playColumnKana(0)}>や</th>
              <th class="header-cell" on:click={() => playColumnKana(1)}>ゆ</th>
              <th class="header-cell" on:click={() => playColumnKana(2)}>よ</th>
            {:else}
              <th class="header-cell" on:click={() => playColumnKana(0)}>あ/a</th>
              <th class="header-cell" on:click={() => playColumnKana(1)}>い/i</th>
              <th class="header-cell" on:click={() => playColumnKana(2)}>う/u</th>
              <th class="header-cell" on:click={() => playColumnKana(3)}>え/e</th>
              <th class="header-cell" on:click={() => playColumnKana(4)}>お/o</th>
            {/if}
          </tr>
        </thead>
        <tbody>
          {#each kanaTable as row, rowIndex}
            <tr>
              <th class="header-cell" on:click={() => playRowKana(rowIndex)}>
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
                    <td colspan={cell.colspan} class="kana-cell" on:click={() => playKanaSound(cell.romaji)}>
                      <div class="kana">{cell.kana}</div>
                      <div class="romaji">{cell.romaji}</div>
                    </td>
                  {:else}
                    <td class="kana-cell" on:click={() => playKanaSound(cell.romaji)}>
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
  
  .controls {
    margin-bottom: 24px;
  }
  
  .controls-row {
    display: flex;
    justify-content: flex-start;
    gap: 16px;
    margin-bottom: 12px;
  }
  
  .select-wrapper {
    position: relative;
    min-width: 120px;
  }
  
  select {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: #f5f5f5;
    font-size: 14px;
    color: #222;
    font-weight: 600;
    cursor: pointer;
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23222'%3e%3cpath d='M7 10l5 5 5-5z'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 8px center;
    background-size: 16px;
    padding-right: 32px;
  }
  
  select:focus {
    outline: none;
    border-color: #2196f3;
    box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
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
  
  .header-cell {
    cursor: pointer;
  }
  
  .header-cell:hover {
    background-color: #e0e0e0;
  }
  
  .kana-cell {
    vertical-align: middle;
    height: 60px;
    cursor: pointer;
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

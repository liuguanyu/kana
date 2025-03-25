<script>
  import { onMount } from 'svelte';
  import { settings, saveSettings, loadDataFromStorage } from '../stores/kanaStore';
  
  let currentSettings;
  let saveMessage = '';
  
  onMount(async () => {
    // 加载数据
    await loadDataFromStorage();
    
    // 订阅设置变化
    const unsubscribe = settings.subscribe(value => {
      currentSettings = { ...value };
    });
    
    return () => {
      unsubscribe();
    };
  });
  
  // 当设置变化时自动保存
  $: {
    if (currentSettings) {
      saveSettings(currentSettings);
    }
  }
</script>

<div class="settings-container">
  <h2>50音图学习设置</h2>
  
  {#if currentSettings}
    <div class="settings-card">
      <div class="settings-list">
        <div class="form-group">
          <label for="kanaType">假名类型</label>
          <div class="control-wrapper">
            <select id="kanaType" bind:value={currentSettings.kanaType}>
              <option value="hiragana">平假名</option>
              <option value="katakana">片假名</option>
              <option value="both">全部</option>
            </select>
          </div>
        </div>
        
        <div class="form-group">
          <label for="kanaCategory">假名分类</label>
          <div class="control-wrapper">
            <select id="kanaCategory" bind:value={currentSettings.kanaCategory}>
              <option value="all">全部</option>
              <option value="seion">清音</option>
              <option value="dakuon">浊音</option>
              <option value="youon">拗音</option>
            </select>
          </div>
        </div>
        
        <div class="form-group">
          <label for="playOrder">播放模式</label>
          <div class="control-wrapper">
            <select id="playOrder" bind:value={currentSettings.playOrder}>
              <option value="sequential">顺序播放</option>
              <option value="random">随机播放</option>
            </select>
          </div>
        </div>
        
        <div class="form-group">
          <label for="playInterval">播放间隔（秒）</label>
          <div class="control-wrapper">
            <input 
              type="number" 
              id="playInterval" 
              bind:value={currentSettings.playInterval} 
              min="1" 
              max="10" 
              step="1"
            />
          </div>
        </div>
        
        <div class="form-group">
          <label for="requiredCorrectCount">错题重现次数</label>
          <div class="control-wrapper">
            <input 
              type="number" 
              id="requiredCorrectCount" 
              bind:value={currentSettings.requiredCorrectCount} 
              min="1" 
              max="10" 
              step="1"
            />
          </div>
        </div>
      </div>
    </div>
  {:else}
    <div class="loading">加载中...</div>
  {/if}
</div>

<style>
  .settings-container {
    padding: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: auto;
    padding-bottom: 30px;
  }
  
  h2 {
    margin-bottom: 20px;
    text-align: center;
    font-size: 1.5rem;
    color: #333;
  }
  
  .settings-card {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 24px;
    width: 100%;
    max-width: 500px;
    transition: all 0.3s ease;
  }
  
  .settings-list {
    margin-bottom: 20px;
  }
  
  .form-group {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    justify-content: space-between;
  }
  
  .form-group label {
    font-size: 0.95rem;
    font-weight: 500;
    color: #555;
    flex: 1;
  }
  
  .control-wrapper {
    flex: 1;
    max-width: 200px;
  }
  
  .form-group select,
  .form-group input {
    width: 100%;
    padding: 8px 10px;
    font-size: 0.95rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: #f9f9f9;
    transition: all 0.2s ease;
  }
  
  .form-group select:focus,
  .form-group input:focus {
    outline: none;
    border-color: #4a90e2;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
  }
  
  .loading {
    text-align: center;
    padding: 20px;
    color: #666;
  }
</style>

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
  
  // 保存设置
  async function handleSave() {
    await saveSettings(currentSettings);
    saveMessage = '设置已保存';
    
    // 3秒后清除消息
    setTimeout(() => {
      saveMessage = '';
    }, 3000);
  }
</script>

<div class="settings-container">
  <h2>50音图学习设置</h2>
  
  {#if currentSettings}
    <div class="card">
      <div class="form-group">
        <label for="kanaType">假名类型</label>
        <select id="kanaType" bind:value={currentSettings.kanaType}>
          <option value="hiragana">平假名</option>
          <option value="katakana">片假名</option>
          <option value="both">全部</option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="playOrder">播放模式</label>
        <select id="playOrder" bind:value={currentSettings.playOrder}>
          <option value="sequential">顺序播放</option>
          <option value="random">随机播放</option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="playInterval">播放间隔（秒）</label>
        <input 
          type="number" 
          id="playInterval" 
          bind:value={currentSettings.playInterval} 
          min="1" 
          max="10" 
          step="1"
        />
      </div>
      
      <div class="form-group">
        <label for="requiredCorrectCount">错题重现次数（连续正确）</label>
        <input 
          type="number" 
          id="requiredCorrectCount" 
          bind:value={currentSettings.requiredCorrectCount} 
          min="1" 
          max="10" 
          step="1"
        />
      </div>
      
      <button on:click={handleSave}>保存设置</button>
      
      {#if saveMessage}
        <div class="success-message">{saveMessage}</div>
      {/if}
    </div>
    
    
    <div class="card info-card">
      <h3>使用说明</h3>
      <ul>
        <li><strong>播放模式：</strong> 在"播放"页面学习假名发音和写法</li>
        <li><strong>测试模式：</strong> 听发音选择正确的假名，错题会自动记录</li>
        <li><strong>排名：</strong> 查看历史测试成绩排名</li>
        <li><strong>复习：</strong> 专门练习错题，连续答对指定次数后从错题库移除</li>
      </ul>
    </div>
  {:else}
    <div class="loading">加载中...</div>
  {/if}
</div>

<style>
  .settings-container {
    padding: 16px;
  }
  
  h2 {
    margin-bottom: 16px;
    text-align: center;
  }
  
  .info-card {
    margin-top: 20px;
  }
  
  .info-card h3 {
    margin-bottom: 10px;
  }
  
  .info-card ul {
    padding-left: 20px;
  }
  
  .info-card li {
    margin-bottom: 8px;
  }
  
  .success-message {
    margin-top: 10px;
    padding: 8px;
    background-color: #e8f5e9;
    border-radius: 4px;
    color: #2e7d32;
  }
  
  
  .loading {
    text-align: center;
    padding: 20px;
  }
</style>

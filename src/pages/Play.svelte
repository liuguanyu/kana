<script>
  import { onMount, onDestroy } from 'svelte';
  import { settings, getKanaList, shuffleArray } from '../stores/kanaStore';
  
  let currentSettings;
  let kanaList = [];
  let currentIndex = 0;
  let currentKana = null;
  let showKana = false;
  let playInterval;
  let isPlaying = false;
  
  // 订阅设置变化
  onMount(() => {
    const unsubscribe = settings.subscribe(value => {
      currentSettings = { ...value };
      // 当设置变化时，重新加载假名列表
      loadKanaList();
    });
    
    return () => {
      unsubscribe();
      stopPlaying();
    };
  });
  
  // 组件销毁时停止播放
  onDestroy(() => {
    stopPlaying();
  });
  
  // 加载假名列表
  function loadKanaList() {
    if (!currentSettings) return;
    
    // 获取当前设置下的假名列表
    const list = getKanaList(currentSettings.kanaType);
    
    // 根据播放模式处理列表
    if (currentSettings.playOrder === 'random') {
      kanaList = shuffleArray(list);
    } else {
      kanaList = [...list];
    }
    
    // 重置当前索引
    currentIndex = 0;
    
    // 如果有假名，设置当前假名
    if (kanaList.length > 0) {
      currentKana = kanaList[currentIndex];
      showKana = false;
    }
  }
  
  // 播放当前假名的读音
  function playCurrentKana() {
    if (!currentKana) return;
    
    // 发送消息给background脚本播放音频
    chrome.runtime.sendMessage({
      action: 'playAudio',
      romaji: currentKana.romaji
    });
    
    // 显示假名
    setTimeout(() => {
      showKana = true;
    }, 1000);
  }
  
  // 移动到下一个假名
  function nextKana() {
    // 隐藏当前假名
    showKana = false;
    
    // 更新索引
    currentIndex = (currentIndex + 1) % kanaList.length;
    
    // 设置新的当前假名
    currentKana = kanaList[currentIndex];
    
    // 播放新的假名
    playCurrentKana();
  }
  
  // 开始播放
  function startPlaying() {
    if (isPlaying || kanaList.length === 0) return;
    
    isPlaying = true;
    
    // 立即播放当前假名
    playCurrentKana();
    
    // 设置定时器，定期播放下一个假名
    playInterval = setInterval(() => {
      nextKana();
    }, currentSettings.playInterval * 1000);
  }
  
  // 停止播放
  function stopPlaying() {
    if (!isPlaying) return;
    
    isPlaying = false;
    
    // 清除定时器
    if (playInterval) {
      clearInterval(playInterval);
      playInterval = null;
    }
  }
  
  // 切换播放状态
  function togglePlay() {
    if (isPlaying) {
      stopPlaying();
    } else {
      startPlaying();
    }
  }
  
  // 手动播放当前假名的读音
  function playSound() {
    if (!currentKana) return;
    
    chrome.runtime.sendMessage({
      action: 'playAudio',
      romaji: currentKana.romaji
    });
  }
</script>

<div class="play-container">
  <h2>50音图播放</h2>
  
  {#if kanaList.length > 0 && currentKana}
    <div class="kana-display">
      <div class="kana-card">
        {#if showKana}
          <div class="kana">{currentKana.kana}</div>
          <div class="romaji">{currentKana.romaji}</div>
        {:else}
          <div class="kana placeholder">?</div>
          <div class="romaji">{currentKana.romaji}</div>
        {/if}
      </div>
      
      <div class="progress">
        {currentIndex + 1} / {kanaList.length}
      </div>
    </div>
    
    <div class="controls">
      <button on:click={playSound} class="sound-btn tooltip" aria-label="播放读音">
        <span class="material-icons-round">volume_up</span>
        <span class="tooltip-text">播放读音</span>
      </button>
      
      <button on:click={togglePlay} class="play-btn tooltip" aria-label="播放/暂停">
        {#if isPlaying}
          <span class="material-icons-round">pause</span>
          <span class="tooltip-text">暂停</span>
        {:else}
          <span class="material-icons-round">play_arrow</span>
          <span class="tooltip-text">播放</span>
        {/if}
      </button>
      
      <button on:click={nextKana} class="next-btn tooltip" aria-label="下一个">
        <span class="material-icons-round">skip_next</span>
        <span class="tooltip-text">下一个</span>
      </button>
    </div>
    
    <div class="settings-info">
      <p>当前模式: {currentSettings?.kanaType === 'hiragana' ? '平假名' : 
                   currentSettings?.kanaType === 'katakana' ? '片假名' : '全部'}</p>
      <p>播放方式: {currentSettings?.playOrder === 'sequential' ? '顺序' : '随机'}</p>
      <p>播放间隔: {currentSettings?.playInterval}秒</p>
    </div>
  {:else}
    <div class="loading">加载中...</div>
  {/if}
</div>

<style>
  .play-container {
    padding: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  h2 {
    margin-bottom: 24px;
    text-align: center;
  }
  
  .kana-display {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 24px;
  }
  
  .kana-card {
    width: 200px;
    height: 200px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-bottom: 16px;
    background-color: #fff;
  }
  
  .kana {
    font-size: 72px;
    margin-bottom: 16px;
  }
  
  .placeholder {
    color: #ccc;
  }
  
  .romaji {
    font-size: 24px;
    color: #666;
  }
  
  .progress {
    font-size: 14px;
    color: #666;
  }
  
  .controls {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-bottom: 24px;
  }
  
  button {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    border: none;
    cursor: pointer;
    position: relative;
  }
  
  .tooltip {
    position: relative;
  }
  
  .tooltip .tooltip-text {
    visibility: hidden;
    width: 80px;
    background-color: rgba(0, 0, 0, 0.7);
    color: #fff;
    text-align: center;
    border-radius: 4px;
    padding: 5px;
    position: absolute;
    z-index: 1;
    bottom: 125%;
    left: 50%;
    margin-left: -40px;
    opacity: 0;
    transition: opacity 0.3s;
    font-size: 12px;
  }
  
  .tooltip:hover .tooltip-text {
    visibility: visible;
    opacity: 1;
  }
  
  .sound-btn {
    background-color: #e0f2f1;
    color: #00796b;
  }
  
  .play-btn {
    background-color: #e8f5e9;
    color: #2e7d32;
  }
  
  .next-btn {
    background-color: #e3f2fd;
    color: #1976d2;
  }
  
  .settings-info {
    width: 100%;
    max-width: 300px;
    margin-top: 16px;
    padding: 16px;
    border-radius: 8px;
    background-color: #f5f5f5;
  }
  
  .settings-info p {
    margin: 8px 0;
    font-size: 14px;
    color: #666;
  }
  
  .loading {
    text-align: center;
    padding: 20px;
  }
</style>

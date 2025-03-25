<script>
  import { onMount, onDestroy } from 'svelte';
  import { settings, mistakes, removeMistake, generateTestOptions, getKanaList } from '../stores/kanaStore';
  
  let currentSettings;
  let mistakesList = [];
  let currentKana = null;
  let options = [];
  let selectedOption = null;
  let isCorrect = null;
  let correctCount = 0;
  let totalAnswered = 0;
  let correctStreak = {};
  let reviewInProgress = false;
  let reviewCompleted = false;
  
  // 订阅设置和错题库变化
  onMount(() => {
    const settingsUnsubscribe = settings.subscribe(value => {
      currentSettings = { ...value };
    });
    
    const mistakesUnsubscribe = mistakes.subscribe(value => {
      mistakesList = [...value];
      
      // 初始化连续正确次数记录
      if (mistakesList.length > 0 && Object.keys(correctStreak).length === 0) {
        mistakesList.forEach(mistake => {
          correctStreak[mistake.kana] = 0;
        });
      }
    });
    
    return () => {
      settingsUnsubscribe();
      mistakesUnsubscribe();
    };
  });
  
  // 开始复习
  function startReview() {
    if (mistakesList.length === 0) {
      return;
    }
    
    reviewInProgress = true;
    reviewCompleted = false;
    totalAnswered = 0;
    correctCount = 0;
    
    // 加载第一个问题
    loadNextQuestion();
  }
  
  // 加载下一个问题
  function loadNextQuestion() {
    // 如果没有更多错题，结束复习
    if (mistakesList.length === 0) {
      endReview();
      return;
    }
    
    // 随机选择一个错题
    const randomIndex = Math.floor(Math.random() * mistakesList.length);
    currentKana = mistakesList[randomIndex];
    
    // 生成选项
    const allKana = getKanaList(currentSettings.kanaType);
    options = generateTestOptions(currentKana, allKana);
    
    // 重置选择状态
    selectedOption = null;
    isCorrect = null;
    
    // 播放当前假名的读音
    playSound();
  }
  
  // 播放当前假名的读音
  function playSound() {
    if (!currentKana) return;
    
    chrome.runtime.sendMessage({
      action: 'playAudio',
      romaji: currentKana.romaji
    });
  }
  
  // 选择选项
  function selectOption(option) {
    if (selectedOption !== null) return; // 已经选择了，不允许再次选择
    
    selectedOption = option;
    
    // 判断是否正确
    isCorrect = option.kana === currentKana.kana;
    
    // 更新统计
    totalAnswered++;
    if (isCorrect) {
      correctCount++;
      
      // 更新连续正确次数
      correctStreak[currentKana.kana] = (correctStreak[currentKana.kana] || 0) + 1;
      
      // 如果连续正确次数达到设置的阈值，从错题库中移除
      if (correctStreak[currentKana.kana] >= currentSettings.requiredCorrectCount) {
        setTimeout(() => {
          removeMistake(currentKana);
          delete correctStreak[currentKana.kana];
        }, 1000);
      }
    } else {
      // 重置连续正确次数
      correctStreak[currentKana.kana] = 0;
    }
    
    // 延迟加载下一个问题
    setTimeout(() => {
      loadNextQuestion();
    }, 1500);
  }
  
  // 结束复习
  function endReview() {
    reviewInProgress = false;
    reviewCompleted = true;
  }
  
  // 重新开始复习
  function restartReview() {
    startReview();
  }
  
  // 获取剩余需要正确的次数
  function getRemainingCorrectCount(kana) {
    const streak = correctStreak[kana] || 0;
    return Math.max(0, currentSettings.requiredCorrectCount - streak);
  }
</script>

<div class="review-container">
  <h2>错题复习</h2>
  
  {#if !reviewInProgress && !reviewCompleted}
    <div class="start-screen">
      {#if mistakesList.length > 0}
        <p>你有 {mistakesList.length} 个错题需要复习</p>
        <p>连续答对 {currentSettings?.requiredCorrectCount || 3} 次后，错题将从错题库中移除</p>
        <button on:click={startReview} class="start-btn">开始复习</button>
        
        <div class="mistakes-list">
          <h3>错题列表</h3>
          <div class="mistakes-grid">
            {#each mistakesList as mistake}
              <div class="mistake-item">
                <div class="mistake-kana">{mistake.kana}</div>
                <div class="mistake-romaji">{mistake.romaji}</div>
                <div class="mistake-progress">
                  还需正确: {getRemainingCorrectCount(mistake.kana)} 次
                </div>
              </div>
            {/each}
          </div>
        </div>
      {:else}
        <div class="empty-state">
          <p>恭喜！你没有错题需要复习</p>
          <p>完成测试并出现错题后，可以在这里进行复习</p>
        </div>
      {/if}
    </div>
  {/if}
  
  {#if reviewInProgress && currentKana}
    <div class="question-container">
      <div class="question">
        <button 
          type="button"
          class="sound-icon" 
          on:click={playSound}
          on:keydown={(e) => e.key === 'Enter' && playSound()}
          aria-label="播放发音"
        >
          <span class="material-icons">volume_up</span>
        </button>
        <p>请选择你听到的假名：</p>
      </div>
      
      <div class="options">
        {#each options as option}
          <button 
            class="option-btn {selectedOption === option ? (isCorrect ? 'correct' : 'incorrect') : ''}"
            on:click={() => selectOption(option)}
            disabled={selectedOption !== null}
          >
            {option.kana}
          </button>
        {/each}
      </div>
      
      {#if selectedOption && isCorrect !== null}
        <div class="feedback">
          {#if isCorrect}
            <div class="correct-feedback">
              <span class="material-icons">check_circle</span>
              <span>正确！连续正确: {correctStreak[currentKana.kana]} / {currentSettings.requiredCorrectCount}</span>
            </div>
          {:else}
            <div class="incorrect-feedback">
              <span class="material-icons">error</span>
              <span>错误，正确答案是: {currentKana.kana}</span>
            </div>
          {/if}
        </div>
      {/if}
      
      <div class="score">
        正确率: {totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0}%
        ({correctCount} / {totalAnswered})
      </div>
    </div>
  {/if}
  
  {#if reviewCompleted}
    <div class="result-container">
      <h3>复习完成！</h3>
      
      <div class="result-card">
        <div class="result-item">
          <span>总题数:</span>
          <strong>{totalAnswered}</strong>
        </div>
        
        <div class="result-item">
          <span>正确数:</span>
          <strong>{correctCount}</strong>
        </div>
        
        <div class="result-item">
          <span>正确率:</span>
          <strong>{totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0}%</strong>
        </div>
      </div>
      
      {#if mistakesList.length > 0}
        <p>你还有 {mistakesList.length} 个错题需要继续复习</p>
        <button on:click={restartReview} class="restart-btn">继续复习</button>
      {:else}
        <div class="success-message">
          <span class="material-icons">celebration</span>
          <p>恭喜！你已经掌握了所有的错题</p>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .review-container {
    padding: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  h2 {
    margin-bottom: 24px;
    text-align: center;
  }
  
  .start-screen {
    text-align: center;
    max-width: 400px;
  }
  
  .start-screen p {
    margin-bottom: 16px;
    color: #333; /* 更深的文字颜色，提高可读性 */
  }
  
  .start-btn {
    background-color: #e8f5e9; /* 更改为Play.svelte中的颜色 */
    color: #2e7d32; /* 更改为Play.svelte中的颜色 */
    padding: 12px 24px;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    margin-top: 16px;
    margin-bottom: 24px;
    font-weight: 500; /* 加粗文字 */
  }
  
  .mistakes-list {
    margin-top: 24px;
    width: 100%;
  }
  
  .mistakes-list h3 {
    margin-bottom: 16px;
    text-align: center;
    color: #333; /* 更深的文字颜色 */
  }
  
  .mistakes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 16px;
  }
  
  .mistake-item {
    background-color: white;
    border-radius: 8px;
    padding: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    text-align: center;
  }
  
  .mistake-kana {
    font-size: 24px;
    margin-bottom: 4px;
    color: #333; /* 更深的文字颜色 */
  }
  
  .mistake-romaji {
    font-size: 12px;
    color: #333; /* 更深的文字颜色，提高可读性 */
    margin-bottom: 8px;
  }
  
  .mistake-progress {
    font-size: 10px;
    color: #1976d2;
    font-weight: 500; /* 加粗文字 */
  }
  
  .question-container {
    width: 100%;
    max-width: 400px;
  }
  
  .question {
    text-align: center;
    margin-bottom: 24px;
  }
  
  .sound-icon {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background-color: #e0f2f1; /* 更改为Play.svelte中的颜色 */
    color: #00796b; /* 更改为Play.svelte中的颜色 */
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 auto 16px;
    cursor: pointer;
    border: none;
    padding: 0;
    font-family: inherit;
    font-size: inherit;
  }
  
  .sound-icon .material-icons {
    font-size: 32px;
  }
  
  .options {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 24px;
  }
  
  .option-btn {
    height: 80px;
    border-radius: 8px;
    border: 1px solid #ddd;
    background-color: #f5f5f5; /* 更改为浅灰色背景，提高可见度 */
    font-size: 32px;
    cursor: pointer;
    transition: all 0.2s;
    color: #333; /* 更深的文字颜色 */
    font-weight: 500; /* 加粗文字 */
  }
  
  .option-btn:hover:not(:disabled) {
    background-color: #e3f2fd; /* 更改为Play.svelte中的颜色 */
    border-color: #1976d2; /* 更改为Play.svelte中的颜色 */
  }
  
  .option-btn.correct {
    background-color: #e8f5e9;
    border-color: #4caf50;
    color: #2e7d32;
    font-weight: 600; /* 更加粗 */
  }
  
  .option-btn.incorrect {
    background-color: #ffebee;
    border-color: #f44336;
    color: #c62828;
    font-weight: 600; /* 更加粗 */
  }
  
  .feedback {
    margin-bottom: 16px;
    text-align: center;
  }
  
  .correct-feedback {
    color: #2e7d32;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-weight: 500; /* 加粗文字 */
  }
  
  .incorrect-feedback {
    color: #c62828;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-weight: 500; /* 加粗文字 */
  }
  
  .score {
    text-align: right;
    font-size: 14px;
    color: #333; /* 更深的文字颜色，提高可读性 */
    font-weight: 500; /* 加粗文字 */
  }
  
  .result-container {
    text-align: center;
    max-width: 400px;
  }
  
  .result-card {
    background-color: white;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin: 16px 0;
  }
  
  .result-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    color: #222; /* 更深的文字颜色，提高对比度 */
  }
  
  .result-item span {
    font-weight: 500; /* 稍微加粗标签文本 */
  }
  
  .result-item strong {
    font-weight: 600; /* 加粗数值文本 */
    color: #1976d2; /* 蓝色，突出显示 */
  }
  
  .restart-btn {
    background-color: #e3f2fd;
    color: #1976d2;
    padding: 12px 24px;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    margin-top: 16px;
    font-weight: 500;
  }
  
  .success-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 24px;
    color: #2e7d32;
  }
  
  .success-message .material-icons {
    font-size: 48px;
    margin-bottom: 16px;
  }
  
  .empty-state {
    text-align: center;
    padding: 32px 16px;
    color: #222; /* 更深的颜色，提高可读性 */
    font-weight: 500; /* 稍微加粗 */
  }
  
  .empty-state p {
    margin: 8px 0;
  }
</style>

<script>
  import { onMount, onDestroy } from 'svelte';
  import { settings, getKanaList, shuffleArray, generateTestOptions, addMistake, addTestResult } from '../stores/kanaStore';
  
  let currentSettings;
  let kanaList = [];
  let currentKana = null;
  let options = [];
  let selectedOption = null;
  let isCorrect = null;
  let score = 0;
  let totalQuestions = 0;
  let startTime = null;
  let endTime = null;
  let testInProgress = false;
  let testCompleted = false;
  let testResult = null;
  
  // 订阅设置变化
  onMount(async () => {
    // 确保先加载最新的设置
    await chrome.storage.sync.get(['settings']).then(data => {
      if (data.settings) {
        currentSettings = { ...data.settings };
      }
    });
    
    const unsubscribe = settings.subscribe(value => {
      currentSettings = { ...value };
    });
    
    return () => {
      unsubscribe();
    };
  });
  
  // 开始测试
  function startTest() {
    // 获取当前设置下的假名列表
    const list = getKanaList(currentSettings.kanaType, currentSettings.kanaCategory);
    
    // 随机打乱列表
    kanaList = shuffleArray(list);
    
    // 重置测试状态
    score = 0;
    totalQuestions = 0;
    startTime = new Date();
    endTime = null;
    testInProgress = true;
    testCompleted = false;
    testResult = null;
    
    // 加载第一个问题
    loadNextQuestion();
  }
  
  // 加载下一个问题
  function loadNextQuestion() {
    // 如果没有更多假名，结束测试
    if (kanaList.length === 0) {
      endTest();
      return;
    }
    
    // 从列表中取出一个假名
    currentKana = kanaList.shift();
    
    // 生成选项
    const allKana = getKanaList(currentSettings.kanaType, currentSettings.kanaCategory);
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
    
    // 更新分数
    if (isCorrect) {
      score++;
    } else {
      // 添加到错题库
      addMistake(currentKana);
    }
    
    totalQuestions++;
    
    // 延迟加载下一个问题
    setTimeout(() => {
      loadNextQuestion();
    }, 1500);
  }
  
  // 结束测试
  function endTest() {
    testInProgress = false;
    testCompleted = true;
    endTime = new Date();
    
    // 计算测试结果
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / 1000); // 秒
    const accuracy = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;
    
    testResult = {
      score,
      totalQuestions,
      accuracy,
      duration,
      kanaType: currentSettings.kanaType,
      kanaCategory: currentSettings.kanaCategory
    };
    
    // 保存测试结果
    addTestResult(testResult);
  }
  
  // 重新开始测试
  function restartTest() {
    startTest();
  }
</script>

<div class="test-container">
  <h2>50音图测试</h2>
  
  {#if !testInProgress && !testCompleted}
    <div class="start-screen">
      <p>准备好测试你的日语50音图知识了吗？</p>
      <p>你将听到假名的发音，然后从四个选项中选择正确的假名。</p>
      <button on:click={startTest} class="start-btn">开始测试</button>
    </div>
  {/if}
  
  {#if testInProgress && currentKana}
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
      
      <div class="progress-bar">
        <div class="progress" style="width: {(totalQuestions / (totalQuestions + kanaList.length)) * 100}%"></div>
      </div>
      
      <div class="score">
        得分: {score} / {totalQuestions}
      </div>
    </div>
  {/if}
  
  {#if testCompleted && testResult}
    <div class="result-container">
      <h3>测试完成！</h3>
      
      <div class="result-card">
        <div class="result-item">
          <span>得分:</span>
          <strong>{testResult.score} / {testResult.totalQuestions}</strong>
        </div>
        
        <div class="result-item">
          <span>正确率:</span>
          <strong>{testResult.accuracy.toFixed(1)}%</strong>
        </div>
        
        <div class="result-item">
          <span>用时:</span>
          <strong>{testResult.duration}秒</strong>
        </div>
        
        <div class="result-item">
          <span>假名类型:</span>
          <strong>
            {testResult.kanaType === 'hiragana' ? '平假名' : 
             testResult.kanaType === 'katakana' ? '片假名' : '全部'}
          </strong>
        </div>
        
        <div class="result-item">
          <span>假名分类:</span>
          <strong>
            {testResult.kanaCategory === 'seion' ? '清音' :
             testResult.kanaCategory === 'dakuon' ? '浊音' :
             testResult.kanaCategory === 'youon' ? '拗音' : '全部'}
          </strong>
        </div>
      </div>
      
      <button on:click={restartTest} class="restart-btn">再次测试</button>
    </div>
  {/if}
</div>

<style>
  .test-container {
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
    color: #666;
  }
  
  .start-btn {
    background-color: #4caf50;
    color: white;
    padding: 12px 24px;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    margin-top: 16px;
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
    background-color: #e3f2fd;
    color: #1976d2;
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
    gap: 20px;
    margin-bottom: 24px;
  }
  
  .option-btn {
    height: 80px;
    border-radius: 8px;
    border: 2px solid #888;
    background-color: #f8f8f8;
    font-size: 36px;
    font-weight: bold;
    color: #333;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  }
  
  .option-btn:hover:not(:disabled) {
    background-color: #f5f5f5;
  }
  
  .option-btn.correct {
    background-color: #c8e6c9;
    border-color: #4caf50;
    color: #1b5e20;
    box-shadow: 0 0 8px rgba(76, 175, 80, 0.5);
  }
  
  .option-btn.incorrect {
    background-color: #ffcdd2;
    border-color: #f44336;
    color: #b71c1c;
    box-shadow: 0 0 8px rgba(244, 67, 54, 0.5);
  }
  
  .progress-bar {
    height: 8px;
    background-color: #f5f5f5;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 16px;
  }
  
  .progress {
    height: 100%;
    background-color: #4caf50;
    transition: width 0.3s;
  }
  
  .score {
    text-align: right;
    font-size: 14px;
    color: #666;
  }
  
  .result-container {
    text-align: center;
    max-width: 400px;
  }
  
  .result-card {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 24px;
    margin: 24px 0;
  }
  
  .result-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid #f5f5f5;
  }
  
  .result-item:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
  
  .restart-btn {
    background-color: #2196f3;
    color: white;
    padding: 12px 24px;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
  }
</style>

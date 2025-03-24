<script>
  import { onMount } from 'svelte';
  import { testResults, deleteTestResult } from '../stores/kanaStore';
  
  let results = [];
  let sortBy = 'date'; // 默认按日期排序
  let sortOrder = 'desc'; // 默认降序
  
  // 订阅测试结果变化
  onMount(() => {
    const unsubscribe = testResults.subscribe(value => {
      results = [...value];
      sortResults();
    });
    
    return () => {
      unsubscribe();
    };
  });
  
  // 排序结果
  function sortResults() {
    if (!results || results.length === 0) return;
    
    results.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'accuracy':
          comparison = a.accuracy - b.accuracy;
          break;
        case 'duration':
          comparison = a.duration - b.duration;
          break;
        case 'date':
        default:
          comparison = a.timestamp - b.timestamp;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    // 强制更新
    results = [...results];
  }
  
  // 更改排序方式
  function changeSortBy(newSortBy) {
    if (sortBy === newSortBy) {
      // 如果点击的是当前排序字段，则切换排序顺序
      sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      // 否则，更改排序字段并设置默认排序顺序
      sortBy = newSortBy;
      sortOrder = newSortBy === 'duration' ? 'asc' : 'desc'; // 时间默认升序，其他默认降序
    }
    
    sortResults();
  }
  
  // 删除测试结果
  function handleDelete(index) {
    if (confirm('确定要删除这条测试记录吗？')) {
      deleteTestResult(results[index].timestamp);
    }
  }
  
  // 格式化日期
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  // 获取假名类型显示文本
  function getKanaTypeText(kanaType) {
    switch (kanaType) {
      case 'hiragana':
        return '平假名';
      case 'katakana':
        return '片假名';
      case 'both':
        return '全部';
      default:
        return kanaType;
    }
  }
</script>

<div class="rankings-container">
  <h2>测试排名</h2>
  
  {#if results && results.length > 0}
    <div class="sort-controls">
      <button 
        class={sortBy === 'accuracy' ? 'active' : ''} 
        on:click={() => changeSortBy('accuracy')}
      >
        正确率 {sortBy === 'accuracy' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
      </button>
      
      <button 
        class={sortBy === 'duration' ? 'active' : ''} 
        on:click={() => changeSortBy('duration')}
      >
        用时 {sortBy === 'duration' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
      </button>
      
      <button 
        class={sortBy === 'date' ? 'active' : ''} 
        on:click={() => changeSortBy('date')}
      >
        日期 {sortBy === 'date' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
      </button>
    </div>
    
    <div class="results-list">
      {#each results as result, index}
        <div class="result-card">
          <div class="result-header">
            <span class="date">{formatDate(result.timestamp)}</span>
            <button class="delete-btn" on:click={() => handleDelete(index)}>
              <span class="material-icons">delete</span>
            </button>
          </div>
          
          <div class="result-details">
            <div class="result-item">
              <span>得分:</span>
              <strong>{result.score} / {result.totalQuestions}</strong>
            </div>
            
            <div class="result-item">
              <span>正确率:</span>
              <strong class="accuracy">{result.accuracy.toFixed(1)}%</strong>
            </div>
            
            <div class="result-item">
              <span>用时:</span>
              <strong>{result.duration}秒</strong>
            </div>
            
            <div class="result-item">
              <span>假名类型:</span>
              <strong>{getKanaTypeText(result.kanaType)}</strong>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <div class="empty-state">
      <p>还没有测试记录</p>
      <p>完成一次测试后，结果将显示在这里</p>
    </div>
  {/if}
</div>

<style>
  .rankings-container {
    padding: 16px;
  }
  
  h2 {
    margin-bottom: 24px;
    text-align: center;
  }
  
  .sort-controls {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
    overflow-x: auto; /* 允许横向滚动而不换行 */
    padding-bottom: 4px; /* 为可能的滚动条留出空间 */
  }
  
  .sort-controls button {
    background-color: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 8px 12px;
    font-size: 14px;
    cursor: pointer;
    color: #333; /* 更深的文字颜色 */
    font-weight: 500; /* 稍微加粗 */
  }
  
  .sort-controls button.active {
    background-color: #e3f2fd;
    border-color: #2196f3;
    color: #0d47a1; /* 更深的蓝色，提高对比度 */
    font-weight: 600; /* 更加粗 */
  }
  
  .results-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .result-card {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }
  
  .result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background-color: #f5f5f5;
    border-bottom: 1px solid #eee;
  }
  
  .date {
    font-size: 14px;
    color: #333; /* 更深的颜色，提高可读性 */
  }
  
  .delete-btn {
    background: none;
    border: none;
    color: #f44336;
    cursor: pointer;
    padding: 4px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .delete-btn:hover {
    background-color: rgba(244, 67, 54, 0.1);
  }
  
  .result-details {
    padding: 16px;
  }
  
  .result-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
  }
  
  .result-item:last-child {
    margin-bottom: 0;
  }
  
  .accuracy {
    color: #4caf50;
  }
  
  .empty-state {
    text-align: center;
    padding: 32px 16px;
    color: #333; /* 更深的颜色，提高可读性 */
  }
  
  .empty-state p {
    margin: 8px 0;
  }
</style>

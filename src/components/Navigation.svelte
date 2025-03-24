<script>
  import { push, location } from 'svelte-spa-router';
  
  const navItems = [
    { path: '/play', label: '播放', icon: '▶️' },
    { path: '/test', label: '测试', icon: '📝' },
    { path: '/ranking', label: '排名', icon: '🏆' },
    { path: '/review', label: '复习', icon: '🔄' },
    { path: '/settings', label: '设置', icon: '⚙️' }
  ];
</script>

<nav>
  {#each navItems as item}
    <button 
      type="button"
      class="nav-item {$location === item.path ? 'active' : ''}" 
      on:click={() => push(item.path)}
      on:keydown={(e) => e.key === 'Enter' && push(item.path)}
      aria-label={item.label}
    >
      <div class="nav-icon">{item.icon}</div>
      <div class="nav-label">{item.label}</div>
    </button>
  {/each}
</nav>

<style>
  nav {
    display: flex;
    justify-content: space-around;
    background-color: white;
    border-top: 1px solid #eee;
    padding: 8px 0;
  }
  
  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: var(--border-radius);
    transition: background-color 0.2s;
    background: none;
    border: none;
    font-family: inherit;
    font-size: inherit;
    color: inherit;
  }
  
  .nav-item:hover {
    background-color: #f0f0f0;
  }
  
  .nav-item.active {
    color: var(--primary-color);
  }
  
  .nav-icon {
    font-size: 20px;
    margin-bottom: 4px;
  }
  
  .nav-label {
    font-size: 12px;
  }
</style>

<script lang="ts">
  import { onMount } from 'svelte';
  import Router from 'svelte-spa-router';
  import { wrap } from 'svelte-spa-router/wrap';
  import { push } from 'svelte-spa-router';
  import { settings } from './stores/kanaStore.js';
  
  // 导入页面组件
  import Navigation from './components/Navigation.svelte';
  import Settings from './pages/Settings.svelte';
  import Play from './pages/Play.svelte';
  import Test from './pages/Test.svelte';
  import Ranking from './pages/Rankings.svelte';
  import Review from './pages/Review.svelte';
  import Table from './pages/Table.svelte';
  
  // 检查是否有设置
  onMount(async () => {
    try {
      const data = await chrome.storage.sync.get(['settings']);
      if (!data.settings) {
        // 如果没有设置，导航到Settings页面
        push('/settings');
      } else {
        // 默认导航到总览页面
        push('/table');
      }
    } catch (error) {
      console.error('检查设置失败:', error);
    }
  });
  
  // 路由配置
  const routes = {
    '/': wrap({
      component: Play
    }),
    '/settings': wrap({
      component: Settings
    }),
    '/play': wrap({
      component: Play
    }),
    '/test': wrap({
      component: Test
    }),
    '/ranking': wrap({
      component: Ranking
    }),
    '/review': wrap({
      component: Review
    }),
    '/table': wrap({
      component: Table
    })
  };
</script>

<main>
  <Navigation />
  <div class="content">
    <Router {routes} />
  </div>
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  
  .content {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
  }
</style>

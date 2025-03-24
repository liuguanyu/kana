<script lang="ts">
  import { onMount } from 'svelte';
  import Router from 'svelte-spa-router';
  import { wrap } from 'svelte-spa-router/wrap';
  
  // 导入页面组件
  import Navigation from './components/Navigation.svelte';
  import Settings from './pages/Settings.svelte';
  import Play from './pages/Play.svelte';
  import Test from './pages/Test.svelte';
  import Ranking from './pages/Rankings.svelte';
  import Review from './pages/Review.svelte';
  
  // 路由配置
  const routes = {
    '/': wrap({
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

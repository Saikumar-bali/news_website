<script>
  import { onMount } from 'svelte';
  import { db, getNews, getMeta } from './firebase.js';
  import NewsCard from './components/NewsCard.svelte';
  import CategoryFilter from './components/CategoryFilter.svelte';
  import Header from './components/Header.svelte';
  import Loading from './components/Loading.svelte';

  let articles = [];
  let meta = null;
  let selectedCategory = 'all';
  let loading = true;
  let error = null;
  let statusMsg = '';

  const categories = [
    { id: 'all', label: 'అన్నీ', labelEn: 'All' },
    { id: 'india', label: 'భారత్', labelEn: 'India' },
    { id: 'telangana', label: 'తెలంగాణ', labelEn: 'Telangana' },
    { id: 'andhra', label: 'ఆంధ్ర', labelEn: 'Andhra' },
    { id: 'business', label: 'బిజ‌న‌స్', labelEn: 'Business' },
    { id: 'sports', label: 'క్రీడ‌లు', labelEn: 'Sports' },
    { id: 'tech', label: 'ట‌క్', labelEn: 'Tech' },
    { id: 'politics', label: 'రాజ‌కీయ‌లు', labelEn: 'Politics' }
  ];

  async function loadNews() {
    loading = true;
    error = null;
    statusMsg = 'Loading from Firebase...';
    console.log('Loading news from Firebase...');
    try {
      console.log('Fetching news for category:', selectedCategory);
      articles = await getNews(selectedCategory, 50);
      console.log('Articles loaded:', articles.length);
      statusMsg = `Loaded ${articles.length} articles`;
      meta = await getMeta();
      console.log('Meta loaded:', meta);
    } catch (e) {
      error = e.message;
      statusMsg = 'Error: ' + e.message;
      console.error('Error loading news:', e);
    } finally {
      loading = false;
    }
  }

  function handleCategoryChange(event) {
    selectedCategory = event.detail;
    loadNews();
  }

  onMount(() => {
    console.log('App component mounted');
    loadNews();
    const interval = setInterval(loadNews, 300000);
    return () => clearInterval(interval);
  });
</script>

<main>
  {#if statusMsg}
    <div class="status">{statusMsg}</div>
  {/if}
  <Header {meta} />
  
  <CategoryFilter 
    {categories} 
    {selectedCategory} 
    on:change={handleCategoryChange} 
  />
  
  {#if loading}
    <Loading />
  {:else if error}
    <div class="error">
      <p>Error: {error}</p>
      <button on:click={loadNews}>Retry</button>
    </div>
  {:else if articles.length === 0}
    <div class="empty">
      <p>No news available</p>
    </div>
  {:else}
    <div class="news-grid">
      {#each articles as article (article.id)}
        <NewsCard {article} />
      {/each}
    </div>
  {/if}
</main>

<style>
  :global(*) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :global(body) {
    font-family: 'Noto Sans Telugu', sans-serif;
    background: #f5f5f5;
    color: #333;
    line-height: 1.6;
  }

  main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
  }

  .status {
    background: #2196F3;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    margin-bottom: 1rem;
    text-align: center;
  }

  .news-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-top: 1rem;
  }

  .error, .empty {
    text-align: center;
    padding: 3rem;
    background: white;
    border-radius: 12px;
    margin-top: 1rem;
  }

  .error button {
    margin-top: 1rem;
    padding: 0.5rem 1.5rem;
    background: #e63946;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
  }

  @media (max-width: 640px) {
    .news-grid {
      grid-template-columns: 1fr;
    }
  }
</style>

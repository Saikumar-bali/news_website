<script>
  import { onMount } from 'svelte';
  import NewsCard from './components/NewsCard.svelte';
  import CategoryFilter from './components/CategoryFilter.svelte';
  import Header from './components/Header.svelte';
  import Loading from './components/Loading.svelte';
  import ArticleModal from './components/ArticleModal.svelte';

  let articles = [];
  let meta = null;
  let selectedCategory = 'all';
  let loading = true;
  let error = null;
  let selectedArticle = null;

  const categories = [
    { id: 'all', label: 'All News', labelTe: 'అన్నీ' },
    { id: 'india', label: 'India', labelTe: 'భారత్' },
    { id: 'telangana', label: 'Telangana', labelTe: 'తెలంగాణ' },
    { id: 'andhra', label: 'Andhra', labelTe: 'ఆంధ్ర' },
    { id: 'business', label: 'Business', labelTe: 'బిజ‌న‌స్' },
    { id: 'sports', label: 'Sports', labelTe: 'క్రీడ‌లు' },
    { id: 'tech', label: 'Tech', labelTe: 'ట‌క్' },
    { id: 'politics', label: 'Politics', labelTe: 'రాజ‌కీయ‌లు' }
  ];

  async function loadNews() {
    loading = true;
    error = null;
    try {
      const categoryFile = selectedCategory === 'all' ? 'news' : selectedCategory;
      const response = await fetch(`/data/${categoryFile}.json`);
      if (!response.ok) throw new Error('Failed to load news');
      const data = await response.json();
      articles = data.articles || [];
      meta = { 
        last_updated: data.updated_at, 
        total_articles: data.count 
      };
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  function handleCategoryChange(event) {
    selectedCategory = event.detail;
    loadNews();
  }

  function handleArticleClick(event) {
    selectedArticle = event.detail;
  }

  function closeModal() {
    selectedArticle = null;
  }

  onMount(() => {
    loadNews();
    const interval = setInterval(loadNews, 300000);
    return () => clearInterval(interval);
  });
</script>

<svelte:head>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Noto+Sans+Telugu:wght@400;500;600;700&display=swap" rel="stylesheet">
</svelte:head>

<main>
  <Header {meta} />
  
  <CategoryFilter 
    {categories} 
    {selectedCategory} 
    on:change={handleCategoryChange} 
  />
  
  {#if loading}
    <Loading />
  {:else if error}
    <div class="error-card">
      <div class="error-icon">⚠️</div>
      <p>{error}</p>
      <button on:click={loadNews}>Retry</button>
    </div>
  {:else if articles.length === 0}
    <div class="empty-card">
      <p>No news available</p>
    </div>
  {:else}
    <div class="news-grid">
      {#each articles as article (article.id)}
        <NewsCard {article} on:click={handleArticleClick} />
      {/each}
    </div>
  {/if}
</main>

{#if selectedArticle}
  <ArticleModal article={selectedArticle} on:close={closeModal} />
{/if}

<style>
  :global(*) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :global(body) {
    font-family: 'DM Sans', 'Noto Sans Telugu', sans-serif;
    background: #0f0f0f;
    color: #e0e0e0;
    line-height: 1.6;
    min-height: 100vh;
  }

  main {
    max-width: 1400px;
    margin: 0 auto;
    padding: 1.5rem;
  }

  .error-card, .empty-card {
    text-align: center;
    padding: 4rem 2rem;
    background: linear-gradient(145deg, #1a1a1a, #252525);
    border-radius: 20px;
    margin-top: 2rem;
    border: 1px solid #333;
  }

  .error-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .error-card button {
    margin-top: 1.5rem;
    padding: 0.75rem 2rem;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border: none;
    border-radius: 30px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .error-card button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
  }

  .news-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 1.5rem;
    margin-top: 2rem;
  }

  @media (max-width: 768px) {
    .news-grid {
      grid-template-columns: 1fr;
    }
    
    main {
      padding: 1rem;
    }
  }
</style>

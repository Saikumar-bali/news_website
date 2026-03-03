<script>
  import { onMount } from 'svelte';
  import { initializeApp } from 'firebase/app';
  import { getDatabase, ref, get, child } from 'firebase/database';
  import NewsCard from './components/NewsCard.svelte';
  import CategoryFilter from './components/CategoryFilter.svelte';
  import Header from './components/Header.svelte';
  import Loading from './components/Loading.svelte';
  import ArticleModal from './components/ArticleModal.svelte';

  // Firebase Configuration (VITE_ prefixed for client-side access)
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);

  let articles = [];
  let meta = null;
  let selectedCategory = 'all';
  let language = 'te';
  let loading = true;
  let error = null;
  let selectedArticle = null;

  $: categories = [
    { id: 'all', label: language === 'te' ? 'అన్నీ' : 'All News' },
    { id: 'india', label: language === 'te' ? 'భారత్' : 'India' },
    { id: 'telangana', label: language === 'te' ? 'తెలంగాణ' : 'Telangana' },
    { id: 'andhra', label: language === 'te' ? 'ఆంధ్ర' : 'Andhra' },
    { id: 'business', label: language === 'te' ? 'బిజ‌న‌స్' : 'Business' },
    { id: 'sports', label: language === 'te' ? 'క్రీడ‌లు' : 'Sports' },
    { id: 'tech', label: language === 'te' ? 'టెక్‌' : 'Tech' },
    { id: 'politics', label: language === 'te' ? 'రాజ‌కీయాలు' : 'Politics' }
  ];

  function handleLanguageChange(event) {
    language = event.detail;
  }

  async function loadNews() {
    const isInitialLoad = articles.length === 0;
    if (isInitialLoad) loading = true;
    error = null;
    try {
      // 1. Fetch Articles
      const newsRef = ref(db, 'news');
      const newsSnapshot = await get(newsRef);
      const newsMap = newsSnapshot.val() || {};
      let allArticles = Object.values(newsMap);
      
      // Sort newest first
      allArticles.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
      
      // Filter by category
      if (selectedCategory !== 'all') {
        articles = allArticles.filter(a => a.category === selectedCategory);
      } else {
        articles = allArticles;
      }

      // 2. Fetch Meta
      const metaRef = ref(db, 'meta/info');
      const metaSnapshot = await get(metaRef);
      const metaData = metaSnapshot.val() || {};
      
      meta = { 
        last_updated: metaData.last_updated, 
        total_articles: metaData.total_articles || articles.length 
      };
    } catch (e) {
      console.error('Firebase Load Error:', e);
      if (isInitialLoad) error = e.message;
    } finally {
      if (isInitialLoad) loading = false;
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
  <Header {meta} {language} on:languageChange={handleLanguageChange} />
  
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
      <p>{language === 'te' ? 'వార్తలు లోడ్ కాలేదు' : 'Failed to load news'}</p>
      <button on:click={loadNews}>{language === 'te' ? 'మళ్ళీ ప్రయత్నించండి' : 'Retry'}</button>
    </div>
  {:else if articles.length === 0}
    <div class="empty-card">
      <p>{language === 'te' ? 'వార్తలు ఏవీ లేవు' : 'No news available'}</p>
    </div>
  {:else}
    <div class="news-grid">
      {#each articles as article (article.id)}
        <NewsCard {article} {language} on:click={handleArticleClick} />
      {/each}
    </div>
  {/if}
</main>

{#if selectedArticle}
  <ArticleModal article={selectedArticle} {language} on:close={closeModal} />
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

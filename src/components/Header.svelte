<script>
  import { createEventDispatcher } from 'svelte';
  export let meta = null;
  export let language = 'te';
  
  const dispatch = createEventDispatcher();

  const labels = {
    en: {
      title: 'Latest News',
      tagline: 'India Daily Update',
      articles: 'Articles',
      lastUpdated: 'Last Updated',
      toggle: 'తెలుగు'
    },
    te: {
      title: 'తాజా వార్తలు',
      tagline: 'డైలీ అప్‌డేట్స్',
      articles: 'వార్తలు',
      lastUpdated: 'చివరి అప్‌డేట్',
      toggle: 'English'
    }
  };

  function toggleLanguage() {
    const newLang = language === 'te' ? 'en' : 'te';
    dispatch('languageChange', newLang);
  }
  
  function formatLastUpdated(isoString, lang) {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString(lang === 'te' ? 'te-IN' : 'en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  $: t = labels[language];
</script>

<header>
  <div class="header-content">
    <div class="logo-section">
      <div class="logo-icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1m2 11a2 2 0 0 1-2-2V7m2 11a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2"></path>
        </svg>
      </div>
      <div class="logo-text">
        <h1>{t.title}</h1>
        <p class="tagline">{t.tagline}</p>
      </div>
    </div>
    
    <div class="actions">
      <button class="lang-toggle" on:click={toggleLanguage}>
        <span class="icon">🌐</span> {t.toggle}
      </button>

      {#if meta}
        <div class="status-section">
          <div class="article-count">
            <span class="count">{meta.total_articles || 0}</span>
            <span class="label">{t.articles}</span>
          </div>
          <div class="last-updated">
            <span class="label">{t.lastUpdated}</span>
            <span class="time">{formatLastUpdated(meta.last_updated, language)}</span>
          </div>
        </div>
      {/if}
    </div>
  </div>
</header>

<style>
  header {
    background: linear-gradient(135deg, #1a1a1a, #252525);
    border-radius: 20px;
    padding: 1.5rem 2rem;
    border: 1px solid #2a2a2a;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1.5rem;
  }

  .logo-section {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .logo-icon {
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  .logo-text h1 {
    font-size: 1.75rem;
    font-weight: 800;
    background: linear-gradient(135deg, #667eea, #764ba2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
    line-height: 1.2;
  }

  .tagline {
    font-size: 0.85rem;
    color: #666;
    margin: 0;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 2rem;
    flex-wrap: wrap;
  }

  .lang-toggle {
    background: rgba(102, 126, 234, 0.1);
    border: 1px solid rgba(102, 126, 234, 0.3);
    color: #667eea;
    padding: 0.6rem 1.2rem;
    border-radius: 30px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .lang-toggle:hover {
    background: rgba(102, 126, 234, 0.2);
    transform: translateY(-2px);
  }

  .status-section {
    display: flex;
    gap: 2rem;
    align-items: center;
  }

  .article-count {
    text-align: center;
  }

  .article-count .count {
    display: block;
    font-size: 1.75rem;
    font-weight: 800;
    color: #667eea;
    line-height: 1;
  }

  .article-count .label {
    font-size: 0.7rem;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .last-updated {
    text-align: right;
  }

  .last-updated .label {
    display: block;
    font-size: 0.7rem;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 2px;
  }

  .last-updated .time {
    font-size: 0.9rem;
    color: #888;
    font-weight: 500;
  }

  @media (max-width: 800px) {
    .header-content {
      flex-direction: column;
      text-align: center;
    }
    
    .actions {
      justify-content: center;
      width: 100%;
    }
  }

  @media (max-width: 640px) {
    header {
      padding: 1rem;
    }

    .status-section {
      width: 100%;
      justify-content: center;
      gap: 1.5rem;
    }

    .last-updated {
      text-align: center;
    }

    .logo-text h1 {
      font-size: 1.4rem;
    }
  }
</style>

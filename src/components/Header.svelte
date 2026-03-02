<script>
  export let meta = null;
  
  function formatLastUpdated(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
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
        <h1>తాజా వార్తలు</h1>
        <p class="tagline">Telugu Daily News</p>
      </div>
    </div>
    
    {#if meta}
      <div class="status-section">
        <div class="article-count">
          <span class="count">{meta.total_articles || 0}</span>
          <span class="label">Articles</span>
        </div>
        <div class="last-updated">
          <span class="label">Last Updated</span>
          <span class="time">{formatLastUpdated(meta.last_updated)}</span>
        </div>
      </div>
    {/if}
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
    gap: 1rem;
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

  @media (max-width: 640px) {
    header {
      padding: 1rem;
    }

    .header-content {
      flex-direction: column;
      text-align: center;
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

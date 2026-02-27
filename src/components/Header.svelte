<script>
  export let meta = null;
  
  function formatLastUpdated(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString('te-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
</script>

<header>
  <div class="logo">
    <h1>తాజా వార్తలు</h1>
    <p class="tagline">Telugu News</p>
  </div>
  
  {#if meta}
    <div class="status">
      <span class="article-count">
        <strong>{meta.total_articles || 0}</strong> articles
      </span>
      <span class="last-updated">
        Updated: {formatLastUpdated(meta.last_updated)}
      </span>
    </div>
  {/if}
</header>

<style>
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    margin-bottom: 1rem;
  }

  .logo h1 {
    font-size: 1.8rem;
    color: #e63946;
    margin: 0;
  }

  .tagline {
    font-size: 0.9rem;
    color: #666;
    margin: 0;
  }

  .status {
    text-align: right;
    font-size: 0.85rem;
    color: #666;
  }

  .article-count strong {
    color: #e63946;
    font-size: 1.1rem;
  }

  .last-updated {
    display: block;
    margin-top: 0.25rem;
    font-size: 0.75rem;
    color: #999;
  }

  @media (max-width: 640px) {
    header {
      flex-direction: column;
      text-align: center;
      gap: 1rem;
    }

    .status {
      text-align: center;
    }
  }
</style>

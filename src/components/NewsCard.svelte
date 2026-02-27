<script>
  export let article;
  
  function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('te-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
</script>

<article class="news-card">
  {#if article.image}
    <div class="image-container">
      <img src={article.image} alt={article.title_te || article.title} loading="lazy" />
    </div>
  {/if}
  
  <div class="content">
    <span class="category">{article.category}</span>
    <h2 class="title">{article.title_te || article.title}</h2>
    {#if article.summary_te || article.summary}
      <p class="summary">{article.summary_te || article.summary}</p>
    {/if}
    
    <div class="meta">
      <span class="source">{article.source}</span>
      <span class="time">{formatDate(article.published_at)}</span>
    </div>
    
    <a href={article.url} target="_blank" rel="noopener noreferrer" class="read-more">
      Read More
    </a>
  </div>
</article>

<style>
  .news-card {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .news-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  }

  .image-container {
    width: 100%;
    height: 180px;
    overflow: hidden;
    background: #eee;
  }

  .image-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .content {
    padding: 1rem;
  }

  .category {
    display: inline-block;
    background: #e63946;
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    text-transform: uppercase;
    margin-bottom: 0.5rem;
  }

  .title {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    line-height: 1.4;
    color: #1a1a1a;
  }

  .summary {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 0.75rem;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .meta {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    color: #888;
    margin-bottom: 0.75rem;
  }

  .source {
    font-weight: 500;
  }

  .read-more {
    display: block;
    text-align: center;
    background: #1a1a1a;
    color: white;
    text-decoration: none;
    padding: 0.5rem;
    border-radius: 6px;
    font-size: 0.9rem;
    transition: background 0.2s;
  }

  .read-more:hover {
    background: #333;
  }
</style>

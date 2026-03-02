<script>
  import { createEventDispatcher } from 'svelte';
  
  export let article;
  
  const dispatch = createEventDispatcher();
  
  let isTruncated = true;
  
  function getContent() {
    return article.summary_te || article.summary || '';
  }
  
  function getTitle() {
    return article.title_te || article.title || '';
  }
  
  function getTruncatedContent(content, maxLength = 120) {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength).trim() + '...';
  }
  
  function handleClick() {
    dispatch('click', article);
  }
  
  function formatDate(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return 'Yesterday';
    
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short'
    });
  }
  
  function getCategoryColor(category) {
    const colors = {
      india: '#e63946',
      telangana: '#2a9d8f',
      andhra: '#f4a261',
      business: '#06d6a0',
      sports: '#ffd166',
      tech: '#118ab2',
      politics: '#9d4edd'
    };
    return colors[category] || '#667eea';
  }
  
  $: content = getContent();
  $: title = getTitle();
  $: truncatedContent = getTruncatedContent(content);
  $: hasMore = content.length > 120;
</script>

<article class="news-card" on:click={handleClick} on:keypress={handleClick} role="button" tabindex="0">
  {#if article.image}
    <div class="image-container">
      <img src={article.image} alt={title} loading="lazy" />
      <span class="category-badge" style="background: {getCategoryColor(article.category)}">{article.category}</span>
    </div>
  {:else}
    <div class="no-image">
      <span class="category-badge" style="background: {getCategoryColor(article.category)}">{article.category}</span>
    </div>
  {/if}
  
  <div class="content">
    <h2 class="title">{title}</h2>
    
    <p class="summary">
      {#if hasMore}
        {truncatedContent}
        <button class="read-more-btn" on:click|stopPropagation={handleClick}>
          Read full article →
        </button>
      {:else}
        {content}
      {/if}
    </p>
    
    <div class="meta">
      <div class="source-info">
        <span class="source">{article.source}</span>
      </div>
      <span class="time">{formatDate(article.published_at)}</span>
    </div>
  </div>
</article>

<style>
  .news-card {
    background: linear-gradient(145deg, #1a1a1a, #222222);
    border-radius: 16px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid #2a2a2a;
    display: flex;
    flex-direction: column;
  }

  .news-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    border-color: #444;
  }

  .image-container {
    position: relative;
    width: 100%;
    height: 200px;
    overflow: hidden;
    background: #2a2a2a;
  }

  .image-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  .news-card:hover .image-container img {
    transform: scale(1.05);
  }

  .no-image {
    height: 80px;
    background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
    position: relative;
  }

  .category-badge {
    position: absolute;
    top: 12px;
    left: 12px;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #000;
  }

  .content {
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .title {
    font-size: 1.1rem;
    font-weight: 700;
    margin-bottom: 0.75rem;
    line-height: 1.4;
    color: #ffffff;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .summary {
    font-size: 0.9rem;
    color: #a0a0a0;
    margin-bottom: 1rem;
    line-height: 1.6;
    flex: 1;
  }

  .read-more-btn {
    background: none;
    border: none;
    color: #667eea;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    padding: 0;
    margin-left: 4px;
    transition: color 0.2s;
  }

  .read-more-btn:hover {
    color: #764ba2;
  }

  .meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 0.75rem;
    border-top: 1px solid #333;
  }

  .source-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .source {
    font-size: 0.8rem;
    font-weight: 600;
    color: #667eea;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .time {
    font-size: 0.75rem;
    color: #666;
  }
</style>

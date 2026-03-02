<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { fade, scale } from 'svelte/transition';
  
  export let article;
  
  const dispatch = createEventDispatcher();
  
  function getTitle() {
    return article.title_te || article.title || '';
  }
  
  function getSummary() {
    return article.summary_te || article.summary || '';
  }
  
  function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
  
  function handleKeydown(event) {
    if (event.key === 'Escape') {
      dispatch('close');
    }
  }
  
  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      dispatch('close');
    }
  }
  
  onMount(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  });
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="modal-backdrop" on:click={handleBackdropClick} transition:fade={{ duration: 200 }}>
  <div class="modal-container" transition:scale={{ duration: 300, start: 0.9 }}>
    <button class="close-btn" on:click={() => dispatch('close')}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
    
    {#if article.image}
      <div class="modal-image">
        <img src={article.image} alt={getTitle()} />
      </div>
    {/if}
    
    <div class="modal-content">
      <div class="category-tag" style="background: {getCategoryColor(article.category)}">
        {article.category}
      </div>
      
      <h1 class="modal-title">{getTitle()}</h1>
      
      <div class="modal-meta">
        <span class="source">{article.source}</span>
        <span class="divider">•</span>
        <span class="date">{formatDate(article.published_at)}</span>
      </div>
      
      <div class="modal-body">
        <p>{getSummary()}</p>
      </div>
      
      <div class="modal-actions">
        <a href={article.url} target="_blank" rel="noopener noreferrer" class="read-original">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
          Read Full Article
        </a>
      </div>
    </div>
  </div>
</div>

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .modal-container {
    background: linear-gradient(145deg, #1a1a1a, #252525);
    border-radius: 24px;
    max-width: 700px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    border: 1px solid #333;
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);
  }

  .close-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.5);
    border: none;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    transition: background 0.2s, transform 0.2s;
  }

  .close-btn:hover {
    background: rgba(0, 0, 0, 0.8);
    transform: rotate(90deg);
  }

  .modal-image {
    width: 100%;
    height: 300px;
    overflow: hidden;
  }

  .modal-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .modal-content {
    padding: 2rem;
  }

  .category-tag {
    display: inline-block;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #000;
    margin-bottom: 1rem;
  }

  .modal-title {
    font-size: 1.75rem;
    font-weight: 800;
    line-height: 1.3;
    color: #ffffff;
    margin-bottom: 1rem;
  }

  .modal-meta {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
  }

  .source {
    font-weight: 700;
    color: #667eea;
    text-transform: uppercase;
    font-size: 0.85rem;
    letter-spacing: 0.5px;
  }

  .divider {
    color: #555;
  }

  .date {
    color: #888;
    font-size: 0.85rem;
  }

  .modal-body {
    margin-bottom: 2rem;
  }

  .modal-body p {
    font-size: 1.1rem;
    line-height: 1.8;
    color: #c0c0c0;
    white-space: pre-wrap;
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
  }

  .read-original {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.875rem 1.75rem;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    text-decoration: none;
    border-radius: 30px;
    font-weight: 600;
    font-size: 0.95rem;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .read-original:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
  }

  @media (max-width: 640px) {
    .modal-container {
      max-height: 95vh;
    }

    .modal-image {
      height: 200px;
    }

    .modal-content {
      padding: 1.5rem;
    }

    .modal-title {
      font-size: 1.35rem;
    }

    .modal-body p {
      font-size: 1rem;
    }
  }
</style>

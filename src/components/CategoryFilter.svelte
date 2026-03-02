<script>
  import { createEventDispatcher } from 'svelte';
  
  export let categories = [];
  export let selectedCategory = 'all';
  
  const dispatch = createEventDispatcher();
  
  function selectCategory(id) {
    dispatch('change', id);
  }
</script>

<div class="category-filter">
  {#each categories as cat}
    <button 
      class:active={selectedCategory === cat.id}
      on:click={() => selectCategory(cat.id)}
    >
      {cat.label}
    </button>
  {/each}
</div>

<style>
  .category-filter {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin: 1.5rem 0;
    padding: 1rem 1.25rem;
    background: linear-gradient(145deg, #1a1a1a, #222222);
    border-radius: 16px;
    border: 1px solid #2a2a2a;
  }

  button {
    padding: 0.625rem 1.25rem;
    border: 1px solid #333;
    background: transparent;
    color: #888;
    border-radius: 25px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 600;
    transition: all 0.25s ease;
    font-family: 'DM Sans', sans-serif;
  }

  button:hover {
    border-color: #667eea;
    color: #aaa;
    background: rgba(102, 126, 234, 0.1);
  }

  button.active {
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-color: transparent;
    color: white;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  }

  @media (max-width: 768px) {
    .category-filter {
      justify-content: center;
      padding: 0.875rem;
      gap: 0.5rem;
    }
    
    button {
      padding: 0.5rem 1rem;
      font-size: 0.8rem;
    }
  }
</style>

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
      <span class="telugu">{cat.label}</span>
      <span class="english">{cat.labelEn}</span>
    </button>
  {/each}
</div>

<style>
  .category-filter {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 1rem 0;
    padding: 1rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }

  button {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.5rem 1rem;
    border: 2px solid #eee;
    background: white;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }

  button:hover {
    border-color: #e63946;
  }

  button.active {
    background: #e63946;
    border-color: #e63946;
    color: white;
  }

  .telugu {
    font-size: 1rem;
    font-weight: 600;
  }

  .english {
    font-size: 0.7rem;
    opacity: 0.8;
  }

  button.active .english {
    opacity: 0.9;
  }

  @media (max-width: 640px) {
    .category-filter {
      justify-content: center;
    }
    
    button {
      padding: 0.4rem 0.8rem;
    }
    
    .telugu {
      font-size: 0.9rem;
    }
  }
</style>

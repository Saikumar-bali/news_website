<script>
</script>

<div class="loading">
  <div class="spinner"></div>
  <p>Loading latest news...</p>
</div>

<style>
  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    gap: 1.5rem;
  }

  .spinner {
    width: 48px;
    height: 48px;
    border: 3px solid #333;
    border-top: 3px solid #667eea;
    border-right: 3px solid #764ba2;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  p {
    color: #666;
    font-size: 1rem;
    font-weight: 500;
  }
</style>

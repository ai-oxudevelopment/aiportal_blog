<template>
  <div class="skeleton-container">
    <div class="skeleton-header"></div>
    <div class="skeleton-content"></div>
    <div class="skeleton-cards">
      <div class="skeleton-card" v-for="n in 6" :key="n"></div>
    </div>
    <div class="skeleton-footer"></div>
  </div>
</template>

<style scoped>
.skeleton-container {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.skeleton-header,
.skeleton-content,
.skeleton-card,
.skeleton-footer {
  background: linear-gradient(90deg, #1f2937 25%, #374151 50%, #1f2937 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.skeleton-header { 
  height: 80px; 
  width: 100%;
}

.skeleton-content { 
  height: 120px; 
  width: 100%;
}

.skeleton-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.skeleton-card { 
  height: 200px; 
  width: 100%;
}

.skeleton-footer { 
  height: 60px; 
  width: 100%;
}

@keyframes loading {
  0% { 
    background-position: 200% 0; 
  }
  100% { 
    background-position: -200% 0; 
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .skeleton-cards {
    grid-template-columns: 1fr;
  }
  
  .skeleton-header {
    height: 60px;
  }
  
  .skeleton-content {
    height: 100px;
  }
  
  .skeleton-card {
    height: 150px;
  }
}
</style>
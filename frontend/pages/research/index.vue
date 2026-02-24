<!-- Presentation Layer: Research Index Page -->
<!-- Landing page for selecting or creating a research session -->

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const platforms = ref([
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'Powered by GPT-4, excellent for general queries and creative tasks',
    icon: '🤖',
    color: '#10a37f'
  },
  {
    id: 'claude',
    name: 'Claude',
    description: 'Anthropic\'s AI assistant, great for research and analysis',
    icon: '🧠',
    color: '#cc785c'
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    description: 'AI-powered search with real-time web access',
    icon: '🔍',
    color: '#20808d'
  }
])

const startResearch = (platformId: string): void => {
  const sessionId = `${platformId}-${Date.now()}`
  router.push(`/research/${sessionId}`)
}

// Start a random session
const startQuickResearch = (): void => {
  startResearch('perplexity')
}
</script>

<template>
  <div class="research-index">
    <!-- Hero Section -->
    <div class="hero">
      <h1>AI Research Assistant</h1>
      <p class="subtitle">
        Choose your AI platform and start exploring ideas, getting answers, and diving deep into any topic.
      </p>
      <button @click="startQuickResearch" class="quick-start-btn">
        Quick Start →
      </button>
    </div>

    <!-- Platform Selection -->
    <div class="platforms-section">
      <h2>Select Your AI Platform</h2>
      <div class="platforms-grid">
        <div
          v-for="platform in platforms"
          :key="platform.id"
          class="platform-card"
          role="button"
          tabindex="0"
          @click="startResearch(platform.id)"
          @keydown.enter="startResearch(platform.id)"
          @keydown.space.prevent="startResearch(platform.id)"
          :style="{ '--platform-color': platform.color }"
          :aria-label="`Select ${platform.name}: ${platform.description}`"
        >
          <div class="platform-icon" aria-hidden="true">{{ platform.icon }}</div>
          <h3>{{ platform.name }}</h3>
          <p>{{ platform.description }}</p>
          <button class="select-btn">
            Select {{ platform.name }}
          </button>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="features-section">
      <h2>Features</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon" aria-hidden="true">💬</div>
          <h3>Natural Conversations</h3>
          <p>Chat naturally with AI assistants that understand context and nuance.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon" aria-hidden="true">📊</div>
          <h3>Session History</h3>
          <p>Your conversations are saved, so you can reference them anytime.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon" aria-hidden="true">🔄</div>
          <h3>Multi-Platform</h3>
          <p>Switch between different AI platforms to get diverse perspectives.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon" aria-hidden="true">⚡</div>
          <h3>Fast & Responsive</h3>
          <p>Optimized for speed with instant responses and smooth interactions.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.research-index {
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.hero {
  text-align: center;
  color: white;
  padding: 4rem 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.subtitle {
  font-size: 1.25rem;
  opacity: 0.9;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.quick-start-btn {
  padding: 1rem 2.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #764ba2;
  background: white;
  border: none;
  border-radius: 32px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
}

.quick-start-btn:hover,
.quick-start-btn:focus {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.quick-start-btn:focus {
  outline: 3px solid white;
  outline-offset: 2px;
}

.platforms-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 0;
}

.platforms-section h2 {
  text-align: center;
  color: white;
  font-size: 2rem;
  margin-bottom: 2rem;
}

.platforms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.platform-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
}

.platform-card:hover,
.platform-card:focus {
  transform: translateY(-8px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.platform-card:focus {
  outline: 3px solid white;
  outline-offset: 2px;
}

.platform-card:focus-visible {
  outline: 3px solid white;
  outline-offset: 2px;
}

.platform-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.platform-card h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.platform-card p {
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.select-btn {
  padding: 0.75rem 1.5rem;
  background: var(--platform-color);
  color: white;
  border: none;
  border-radius: 24px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.select-btn:hover {
  opacity: 0.9;
  transform: scale(1.05);
}

.features-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 0;
  text-align: center;
}

.features-section h2 {
  color: white;
  font-size: 2rem;
  margin-bottom: 2rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.feature-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2rem;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.feature-card p {
  opacity: 0.9;
  line-height: 1.5;
}

/* Responsive */
@media (max-width: 768px) {
  .research-index {
    padding: 1rem;
  }

  .hero {
    padding: 2rem 1rem;
  }

  .hero h1 {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .platforms-grid,
  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>

# Research V2 Components Specification

## Component Breakdown

This document provides detailed specifications for each component needed in the new Research V2 page, including props, styling, and behavior.

## 1. Main Page Component

### File: `frontend/pages/research/v2/[searchId].vue`

#### Template Structure
```vue
<template>
  <div class="min-h-screen bg-base relative">
    <!-- Main Content Area -->
    <div :class="mainContentClasses">
      <div class="container mx-auto px-4 py-8 max-w-4xl">
        <!-- Header Section -->
        <HeaderSection 
          :searchId="searchId"
          :isSidebarOpen="isSidebarOpen"
          @toggle-sidebar="toggleSidebar"
        />
        
        <!-- Loading State -->
        <LoadingSkeletons v-if="isLoading" />
        
        <!-- Main Content -->
        <MainContent 
          v-else
          :submitResult="submitResult"
          :researchData="researchData"
        />
      </div>
    </div>

    <!-- Animated Sidebar -->
    <SidebarPanel 
      v-if="isSidebarOpen"
      :isFormLoading="isFormLoading"
      :isSubmitting="isSubmitting"
      :formConfig="formConfig"
      @close="closeSidebar"
      @submit="handleFormSubmit"
    />
  </div>
</template>
```

#### Script Setup
```javascript
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { 
  useSamplePrompt, 
  useSampleUploadedFiles, 
  useSampleAdditionalText, 
  useSampleFiles, 
  useSampleAiResponse 
} from '@/composables/mockApi'

// Icons from lucide-vue-next
import { 
  Search, 
  Settings, 
  X, 
  Brain, 
  Zap, 
  Target,
  BarChart3,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-vue-next'

const route = useRoute()
const { searchId } = route.params

// State management
const isLoading = ref(true)
const isSidebarOpen = ref(false)
const isFormLoading = ref(false)
const isSubmitting = ref(false)
const researchData = ref(null)
const submitResult = ref(null)
const formConfig = ref(null)

// Computed properties
const agentId = computed(() => route.query.agentId || 'market-research')
const mainContentClasses = computed(() => [
  'transition-all duration-300',
  isSidebarOpen.value ? 'mr-96' : 'mr-0'
])

// Methods
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
  if (isSidebarOpen.value) {
    fetchFormConfig()
  }
}

const closeSidebar = () => {
  isSidebarOpen.value = false
}

const fetchFormConfig = async () => {
  isFormLoading.value = true
  // Simulate API call
  setTimeout(() => {
    formConfig.value = {
      // Mock form configuration
    }
    isFormLoading.value = false
  }, 1000)
}

const handleFormSubmit = async (formData) => {
  isSubmitting.value = true
  // Handle form submission
  setTimeout(() => {
    submitResult.value = { message: 'Configuration updated successfully' }
    isSubmitting.value = false
    isSidebarOpen.value = false
  }, 2000)
}

// Lifecycle
onMounted(async () => {
  // Initialize data
  setTimeout(() => {
    researchData.value = {
      title: getResearchTitle(agentId.value),
      status: 'Initializing',
      progress: 15,
      agentId: agentId.value,
      insights: getInitialInsights(agentId.value)
    }
    isLoading.value = false
    
    // Auto-open sidebar after delay
    setTimeout(() => {
      isSidebarOpen.value = true
      fetchFormConfig()
    }, 1000)
  }, 2000)
})
</script>
```

## 2. Header Section Component (Inline)

```vue
<!-- HeaderSection Template -->
<div class="flex items-center justify-between mb-8">
  <div class="flex items-center gap-3">
    <div class="p-2 bg-super/10 rounded-lg">
      <Search class="h-6 w-6 text-super" />
    </div>
    <div>
      <h1 class="text-2xl font-bold text-foreground">Research Session</h1>
      <p class="text-quiet">ID: {{ searchId }}</p>
    </div>
  </div>
  <button
    @click="$emit('toggle-sidebar')"
    class="flex items-center gap-2 px-4 py-2 rounded-lg border border-subtler bg-raised hover:bg-subtler transition-colors text-foreground"
  >
    <Settings class="h-4 w-4" />
    Configure
  </button>
</div>
```

## 3. Loading Skeletons Component (Inline)

```vue
<!-- LoadingSkeletons Template -->
<div class="space-y-6">
  <SkeletonCard v-for="i in 3" :key="i" />
</div>

<!-- SkeletonCard Template -->
<div class="rounded-lg border border-subtler bg-raised p-6">
  <div class="animate-pulse">
    <div class="flex items-center justify-between mb-4">
      <div class="h-6 bg-subtler rounded w-3/4"></div>
      <div class="h-6 bg-subtler rounded w-20"></div>
    </div>
    <div class="space-y-3">
      <div class="h-4 bg-subtler rounded w-full"></div>
      <div class="h-4 bg-subtler rounded w-5/6"></div>
      <div class="h-4 bg-subtler rounded w-4/5"></div>
    </div>
    <div class="flex gap-2 mt-4">
      <div class="h-8 bg-subtler rounded w-20"></div>
      <div class="h-8 bg-subtler rounded w-24"></div>
      <div class="h-8 bg-subtler rounded w-16"></div>
    </div>
  </div>
</div>
```

## 4. Main Content Component (Inline)

```vue
<!-- MainContent Template -->
<div class="space-y-6 fade-slide-enter-active">
  <!-- Success/Error Messages -->
  <MessageCard v-if="submitResult" :result="submitResult" />
  
  <!-- Status Card -->
  <StatusCard :researchData="researchData" />
  
  <!-- Insights Card -->
  <InsightsCard :insights="researchData?.insights" />
  
  <!-- Timeline Card -->
  <TimelineCard />
</div>
```

## 5. Message Card Component (Inline)

```vue
<!-- MessageCard Template -->
<div 
  class="rounded-lg border p-4 fade-slide-enter-active"
  :class="messageCardClasses"
>
  <div class="flex items-center gap-2">
    <CheckCircle v-if="!result.error" class="h-5 w-5 text-green-600" />
    <AlertCircle v-else class="h-5 w-5 text-red-600" />
    <span class="font-medium" :class="result.error ? 'text-red-600' : 'text-green-600'">
      {{ result.error ? 'Error' : 'Success' }}
    </span>
  </div>
  <p class="text-sm mt-2 text-foreground">
    {{ result.error || result.message }}
  </p>
  <p v-if="result.estimatedCompletion" class="text-xs text-quiet mt-1">
    Estimated completion: {{ result.estimatedCompletion }}
  </p>
</div>

<!-- Script for MessageCard -->
<script>
const messageCardClasses = computed(() => [
  result.value?.error ? 'border-red-500 bg-red-500/10' : 'border-green-500 bg-green-500/10'
])
</script>
```

## 6. Status Card Component (Inline)

```vue
<!-- StatusCard Template -->
<div class="rounded-lg border border-subtler bg-raised p-6">
  <div class="flex items-center justify-between mb-4">
    <h2 class="text-xl font-semibold text-foreground flex items-center gap-2">
      <Brain class="h-5 w-5 text-super" />
      {{ researchData?.title }}
    </h2>
    <span 
      class="px-3 py-1 rounded-full text-sm font-medium"
      :class="statusBadgeClasses"
    >
      {{ researchData?.status }}
    </span>
  </div>
  
  <div class="space-y-4">
    <!-- Progress Bar -->
    <div>
      <div class="flex justify-between text-sm mb-2 text-foreground">
        <span>Progress</span>
        <span>{{ researchData?.progress }}%</span>
      </div>
      <div class="w-full bg-subtler rounded-full h-2">
        <div
          class="bg-super h-2 rounded-full progress-bar"
          :style="{ width: `${researchData?.progress}%` }"
        ></div>
      </div>
    </div>
    
    <!-- Status Indicators -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="flex items-center gap-2">
        <Target class="h-4 w-4 text-super" />
        <span class="text-sm text-foreground">Market Analysis</span>
      </div>
      <div class="flex items-center gap-2">
        <BarChart3 class="h-4 w-4 text-super" />
        <span class="text-sm text-foreground">Data Processing</span>
      </div>
      <div class="flex items-center gap-2">
        <FileText class="h-4 w-4 text-super" />
        <span class="text-sm text-foreground">Report Generation</span>
      </div>
    </div>
  </div>
</div>

<!-- Script for StatusCard -->
<script>
const statusBadgeClasses = computed(() => [
  'px-3 py-1 rounded-full text-sm font-medium',
  researchData.value?.status === 'Updated' 
    ? 'bg-super/20 text-super' 
    : 'bg-subtler text-quiet'
])
</script>
```

## 7. Insights Card Component (Inline)

```vue
<!-- InsightsCard Template -->
<div class="rounded-lg border border-subtler bg-raised p-6">
  <h2 class="text-xl font-semibold text-foreground flex items-center gap-2 mb-4">
    <Zap class="h-5 w-5 text-super" />
    Key Insights
  </h2>
  
  <div class="space-y-3">
    <div 
      v-for="(insight, index) in insights" 
      :key="index"
      class="flex items-center gap-3 p-3 bg-subtler rounded-lg insight-item"
      :style="{ '--index': index, animationDelay: `${index * 0.1}s` }"
    >
      <div class="w-2 h-2 bg-super rounded-full flex-shrink-0"></div>
      <span class="text-foreground">{{ insight }}</span>
    </div>
  </div>
</div>
```

## 8. Timeline Card Component (Inline)

```vue
<!-- TimelineCard Template -->
<div class="rounded-lg border border-subtler bg-raised p-6">
  <h2 class="text-xl font-semibold text-foreground flex items-center gap-2 mb-4">
    <Clock class="h-5 w-5 text-super" />
    Research Timeline
  </h2>
  
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <div class="w-3 h-3 bg-super rounded-full flex-shrink-0"></div>
      <div class="flex-1">
        <p class="font-medium text-foreground">Research initiated</p>
        <p class="text-sm text-quiet">Started market analysis</p>
      </div>
      <span class="text-sm text-quiet">2 min ago</span>
    </div>
    
    <div class="flex items-center gap-3">
      <div class="w-3 h-3 bg-super/60 rounded-full flex-shrink-0"></div>
      <div class="flex-1">
        <p class="font-medium text-foreground">Data collection in progress</p>
        <p class="text-sm text-quiet">Gathering market data</p>
      </div>
      <span class="text-sm text-quiet">1 min ago</span>
    </div>
    
    <div class="flex items-center gap-3">
      <div class="w-3 h-3 bg-subtler rounded-full flex-shrink-0"></div>
      <div class="flex-1">
        <p class="font-medium text-quiet">Analysis pending</p>
        <p class="text-sm text-quiet">Waiting for data processing</p>
      </div>
      <span class="text-sm text-quiet">Pending</span>
    </div>
  </div>
</div>
```

## 9. Sidebar Panel Component (Inline)

```vue
<!-- SidebarPanel Template -->
<Teleport to="body">
  <!-- Backdrop -->
  <div 
    class="fixed inset-0 bg-backdrop backdrop-enter-active z-40"
    @click="$emit('close')"
  ></div>
  
  <!-- Sidebar -->
  <div class="fixed right-0 top-0 h-full w-full md:w-1/3 bg-raised border-l border-subtler shadow-2xl z-50 overflow-y-auto sidebar-enter-active">
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-semibold text-foreground flex items-center gap-2">
          <Settings class="h-5 w-5" />
          Research Configuration
        </h2>
        <button
          @click="$emit('close')"
          class="p-2 hover:bg-subtler rounded-lg transition-colors"
        >
          <X class="h-4 w-4 text-foreground" />
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="isFormLoading" class="space-y-4">
        <div class="flex items-center justify-center py-8">
          <Loader2 class="h-8 w-8 animate-spin text-super" />
        </div>
        <div class="space-y-3">
          <div class="h-12 bg-subtler rounded animate-pulse"></div>
          <div class="h-12 bg-subtler rounded animate-pulse"></div>
          <div class="h-12 bg-subtler rounded animate-pulse"></div>
        </div>
      </div>

      <!-- Form Content -->
      <div v-else class="fade-slide-enter-active">
        <ConfigurationForm 
          :config="formConfig"
          :isSubmitting="isSubmitting"
          @submit="$emit('submit', $event)"
        />
      </div>
    </div>
  </div>
</Teleport>
```

## 10. Configuration Form Component (Inline)

```vue
<!-- ConfigurationForm Template -->
<form @submit.prevent="handleSubmit" class="space-y-6">
  <!-- Documentation Type -->
  <div>
    <label class="block text-sm font-medium text-foreground mb-2">
      Documentation Type *
    </label>
    <select 
      v-model="formData.documentationType"
      class="w-full px-3 py-2 border border-subtler rounded-lg bg-base text-foreground focus:ring-2 focus:ring-super focus:border-transparent"
    >
      <option value="">Select type...</option>
      <option value="api">API Documentation</option>
      <option value="user-guide">User Guide</option>
      <option value="technical">Technical Documentation</option>
    </select>
  </div>

  <!-- Technology Stack -->
  <div>
    <label class="block text-sm font-medium text-foreground mb-2">
      Technology Stack *
    </label>
    <input
      v-model="formData.technologyStack"
      type="text"
      placeholder="e.g., React, Node.js, PostgreSQL, AWS"
      class="w-full px-3 py-2 border border-subtler rounded-lg bg-base text-foreground focus:ring-2 focus:ring-super focus:border-transparent"
    />
    <p class="text-xs text-quiet mt-1">Primary technologies to document</p>
  </div>

  <!-- Audience Level -->
  <div>
    <label class="block text-sm font-medium text-foreground mb-2">
      Audience Technical Level *
    </label>
    <select 
      v-model="formData.audienceLevel"
      class="w-full px-3 py-2 border border-subtler rounded-lg bg-base text-foreground focus:ring-2 focus:ring-super focus:border-transparent"
    >
      <option value="">Select level...</option>
      <option value="beginner">Beginner</option>
      <option value="intermediate">Intermediate</option>
      <option value="advanced">Advanced</option>
    </select>
  </div>

  <!-- Checkboxes -->
  <div class="space-y-3">
    <label class="flex items-center gap-2">
      <input
        v-model="formData.includeCodeExamples"
        type="checkbox"
        class="rounded border-subtler text-super focus:ring-super"
      />
      <span class="text-sm text-foreground">Include Code Examples</span>
    </label>
    <p class="text-xs text-quiet ml-6">Include practical code examples and snippets</p>

    <label class="flex items-center gap-2">
      <input
        v-model="formData.includeDiagrams"
        type="checkbox"
        class="rounded border-subtler text-super focus:ring-super"
      />
      <span class="text-sm text-foreground">Include Diagrams</span>
    </label>
    <p class="text-xs text-quiet ml-6">Include architectural and flow diagrams</p>
  </div>

  <!-- Sample Code -->
  <div>
    <label class="block text-sm font-medium text-foreground mb-2">
      Sample Code
    </label>
    <div class="border border-subtler rounded-lg overflow-hidden">
      <div class="bg-subtler px-3 py-2 border-b border-subtler flex items-center justify-between">
        <span class="text-sm text-foreground">Code Editor</span>
        <select class="text-sm bg-transparent text-foreground">
          <option>JavaScript</option>
          <option>Python</option>
          <option>TypeScript</option>
        </select>
      </div>
      <textarea
        v-model="formData.sampleCode"
        placeholder="Enter JavaScript code..."
        rows="4"
        class="w-full p-3 bg-base text-foreground font-mono text-sm resize-none focus:outline-none"
      ></textarea>
    </div>
    <p class="text-xs text-quiet mt-1">Provide sample code that needs to be documented</p>
  </div>

  <!-- Special Notes -->
  <div>
    <label class="block text-sm font-medium text-foreground mb-2">
      Special Notes
    </label>
    <textarea
      v-model="formData.specialNotes"
      placeholder="Any specific requirements, constraints, or important notes..."
      rows="3"
      class="w-full px-3 py-2 border border-subtler rounded-lg bg-base text-foreground focus:ring-2 focus:ring-super focus:border-transparent resize-none"
    ></textarea>
    <p class="text-xs text-quiet mt-1">Additional context for documentation generation</p>
  </div>

  <!-- Submit Button -->
  <div class="flex gap-3">
    <button
      type="submit"
      :disabled="isSubmitting"
      class="flex-1 bg-super hover:bg-super/90 disabled:bg-super/50 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
    >
      <Loader2 v-if="isSubmitting" class="h-4 w-4 animate-spin" />
      {{ isSubmitting ? 'Generating...' : 'Generate Documentation' }}
    </button>
    <button
      type="button"
      class="px-4 py-3 border border-subtler rounded-lg text-foreground hover:bg-subtler transition-colors"
    >
      Reset
    </button>
  </div>
</form>

<!-- Script for ConfigurationForm -->
<script>
const formData = ref({
  documentationType: '',
  technologyStack: '',
  audienceLevel: '',
  includeCodeExamples: true,
  includeDiagrams: true,
  sampleCode: '',
  specialNotes: ''
})

const handleSubmit = () => {
  emit('submit', formData.value)
}
</script>
```

## CSS Animations

```css
<style scoped>
/* Sidebar animations */
.sidebar-enter-active {
  animation: slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

/* Backdrop animations */
.backdrop-enter-active {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Content animations */
.fade-slide-enter-active {
  animation: fadeSlideUp 0.5s ease;
}

@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Progress bar animation */
.progress-bar {
  transition: width 1s ease-out;
}

/* Insight items staggered animation */
.insight-item {
  animation: fadeSlideUp 0.3s ease forwards;
  opacity: 0;
  transform: translateX(-20px);
}

@keyframes fadeSlideUp {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
```

## Integration Notes

1. **Existing Composables**: Use existing `mockApi.js` composables for data
2. **Icons**: All icons are from `lucide-vue-next` package
3. **Styling**: Uses existing Perplexity theme variables
4. **Responsiveness**: Mobile-first approach with responsive classes
5. **Accessibility**: Proper ARIA labels and keyboard navigation
6. **Performance**: Lazy loading and efficient re-renders

This specification provides all the components needed to implement the Research V2 page with the modern design shown in the screenshots.
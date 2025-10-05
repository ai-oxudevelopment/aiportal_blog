<template>
  <div class="min-h-screen bg-base relative">
     <!-- Main Content -->
    <div :class="mainContentClasses">
      <div class="container-responsive">
        <!-- Header Section -->
        <header class="header-section">
          <div class="flex items-center justify-between mb-8 md:mb-12">
            <div class="flex items-center gap-4 min-w-0 flex-1">
              <div class="p-3 bg-super/10 rounded-xl hover-glow transition-smooth">
                <Search class="h-6 w-6 text-super" />
              </div>
              <div class="min-w-0 flex-1">
                <h1 class="heading-responsive-primary mb-1">Dynamic FormKit Demo</h1>
                <div class="flex items-center gap-2">
                  <span class="text-meta">ID:</span>
                  <span class="text-body font-mono bg-subtler px-2 py-1 rounded">{{ searchId }}</span>
                </div>
              </div>
            </div>
            <button
              @click="toggleSidebar"
              class="btn-primary touch-target flex items-center gap-2 whitespace-nowrap"
            >
              <Settings class="h-4 w-4" />
              <span class="hidden sm:inline">{{ formConfig?.title || 'Configure Form' }}</span>
              <span class="sm:hidden">Form</span>
            </button>
          </div>
        </header>

        <!-- Main Content Area -->
        <main class="main-content">
          <div class="space-y-8 content-fade-in stagger-children">
            <!-- Status Messages -->
            <div
              v-if="submitResult"
              class="card-status message-slide-in"
              :class="submitResult.error ? 'card-status--error' : 'card-status--success'"
            >
              <div class="flex items-start gap-4">
                <div class="flex-shrink-0 p-2 rounded-full"
                     :class="submitResult.error
                       ? 'bg-negative-color/10'
                       : 'bg-positive-color/10'">
                  <CheckCircle v-if="!submitResult.error" class="h-5 w-5 text-positive-color" />
                  <AlertCircle v-else class="h-5 w-5 text-negative-color" />
                </div>
                <div class="flex-1">
                  <h4 class="heading-tertiary mb-2">
                    {{ submitResult.error ? 'Submission Failed' : 'Form Submitted Successfully' }}
                  </h4>
                  <p class="text-body mb-3">
                    {{ submitResult.error || submitResult.message }}
                  </p>
                  <div v-if="submitResult.estimatedResponse || submitResult.submissionId" class="space-y-2">
                    <p v-if="submitResult.estimatedResponse" class="text-body-small flex items-center gap-2">
                      <Clock class="h-3 w-3" />
                      Expected response time: {{ submitResult.estimatedResponse }}
                    </p>
                    <p v-if="submitResult.submissionId" class="text-body-small text-quieter">
                      Submission ID: {{ submitResult.submissionId }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Hero Demo Card -->
            <div class="card-hero hover-lift">
              <header class="card-header mb-6">
                <div class="flex items-center justify-between">
                  <h2 class="heading-responsive-secondary flex items-center gap-3">
                    <div class="p-2 bg-super/10 rounded-lg">
                      <Brain class="h-6 w-6 text-super" />
                    </div>
                    Dynamic FormKit Demo
                  </h2>
                  <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full animate-pulse"
                         :class="formConfig ? 'bg-positive-color' : 'bg-attention-color'"></div>
                    <span class="text-meta"
                          :class="formConfig ? 'text-positive-color' : 'text-attention-color'">
                      {{ formConfig ? 'Ready' : 'Loading...' }}
                    </span>
                  </div>
                </div>
              </header>
              
              <div class="card-content space-y-6">
                <p class="text-body-large">
                  This demonstrates a dynamic FormKit form that loads different schemas based on the searchId parameter.
                  The form structure and fields are fetched from the API endpoint.
                </p>
                
                <div v-if="formConfig" class="p-6 bg-subtler rounded-xl border border-subtlest">
                  <h3 class="heading-tertiary mb-3 flex items-center gap-2">
                    <div class="w-1 h-4 bg-super rounded-full"></div>
                    Current Form Configuration
                  </h3>
                  <div class="space-y-2">
                    <p class="text-body font-medium">{{ formConfig.title }}</p>
                    <p class="text-body-small text-quiet">{{ formConfig.description }}</p>
                  </div>
                </div>
                
                <!-- Enhanced Features Grid -->
                <div class="feature-grid-responsive">
                  <div class="flex items-center gap-3 p-3 bg-subtlest rounded-lg hover-glow transition-smooth">
                    <div class="p-2 bg-super/10 rounded-lg">
                      <Target class="h-4 w-4 text-super" />
                    </div>
                    <span class="text-body font-medium">Dynamic Schema Loading</span>
                  </div>
                  <div class="flex items-center gap-3 p-3 bg-subtlest rounded-lg hover-glow transition-smooth">
                    <div class="p-2 bg-super/10 rounded-lg">
                      <BarChart3 class="h-4 w-4 text-super" />
                    </div>
                    <span class="text-body font-medium">API-driven Validation</span>
                  </div>
                  <div class="flex items-center gap-3 p-3 bg-subtlest rounded-lg hover-glow transition-smooth">
                    <div class="p-2 bg-super/10 rounded-lg">
                      <FileText class="h-4 w-4 text-super" />
                    </div>
                    <span class="text-body font-medium">Flexible Form Types</span>
                  </div>
                  <div class="flex items-center gap-3 p-3 bg-subtlest rounded-lg hover-glow transition-smooth">
                    <div class="p-2 bg-super/10 rounded-lg">
                      <Clock class="h-4 w-4 text-super" />
                    </div>
                    <span class="text-body font-medium">Real-time Updates</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Instructions Card -->
            <div class="card-primary hover-lift">
              <header class="card-header mb-6">
                <h2 class="heading-responsive-secondary flex items-center gap-3">
                  <div class="p-2 bg-super/10 rounded-lg">
                    <Zap class="h-6 w-6 text-super" />
                  </div>
                  Try Different Forms
                </h2>
              </header>
              
              <div class="card-content">
                <div class="space-y-4">
                  <div class="flex items-start gap-4 p-4 bg-subtler rounded-xl hover-glow transition-smooth cursor-pointer">
                    <div class="flex-shrink-0 mt-1">
                      <div class="w-3 h-3 bg-super rounded-full"></div>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-body font-semibold mb-1">ID: 12345</p>
                      <p class="text-body-small text-quiet">Business Information Form (company details, industry, employees)</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-4 p-4 bg-subtler rounded-xl hover-glow transition-smooth cursor-pointer">
                    <div class="flex-shrink-0 mt-1">
                      <div class="w-3 h-3 bg-super rounded-full"></div>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-body font-semibold mb-1">ID: 67890</p>
                      <p class="text-body-small text-quiet">Contact Information Form (personal details, phone, reason)</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-4 p-4 bg-subtler rounded-xl hover-glow transition-smooth cursor-pointer">
                    <div class="flex-shrink-0 mt-1">
                      <div class="w-3 h-3 bg-super rounded-full"></div>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-body font-semibold mb-1">ID: 34234</p>
                      <p class="text-body-small text-quiet">Project Requirements Form (project type, budget, features)</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-4 p-4 bg-subtler rounded-xl hover-glow transition-smooth cursor-pointer">
                    <div class="flex-shrink-0 mt-1">
                      <div class="w-3 h-3 bg-super rounded-full"></div>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-body font-semibold mb-1">Other IDs</p>
                      <p class="text-body-small text-quiet">Default contact form (name, email, message)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>

    <!-- Dynamic Form Sidebar Component -->
    <DynamicFormSidebar
      v-model:isOpen="isSidebarOpen"
      v-model:formData="formData"
      :fetchUrl="`/api/${searchId}/form`"
      :submitUrl="`/api/${searchId}/submit`"
      :formConfig="formConfig"
      :formSchema="formSchema"
      :isLoading="isFormLoading"
      :isSubmitting="isSubmitting"
      :error="formError"
      :submitResult="submitResult"
      :autoCloseOnSuccess="true"
      @close="handleSidebarClose"
      @submit="handleFormSubmit"
      @reset="handleFormReset"
      @submit-success="handleSubmitSuccess"
      @submit-error="handleSubmitError"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import DynamicFormSidebar from '@/components/ui/DynamicFormSidebar.vue'

// Icons from lucide-vue-next
import {
  Search,
  Settings,
  Brain,
  Zap,
  Target,
  BarChart3,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-vue-next'

const route = useRoute()
const searchId = computed(() => route.params.searchId)

// State management
const isSidebarOpen = ref(false)
const isFormLoading = ref(false)
const isSubmitting = ref(false)
const submitResult = ref(null)
const formError = ref(null)

// Dynamic form data
const formConfig = ref(null)
const formSchema = ref(null)
const formData = ref({})

// Computed properties
const mainContentClasses = computed(() => [
  'transition-all duration-300 ease-in-out',
  isSidebarOpen.value ? 'md:mr-80 lg:mr-96' : 'mr-0'
])

// Sidebar Methods
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

// Event Handlers for DynamicFormSidebar
const handleSidebarClose = () => {
  isSidebarOpen.value = false
}

const handleFormSubmit = (data) => {
  console.log('Form submitted with data:', data)
  // The DynamicFormSidebar will handle the API call internally
  // We just need to update our local form data
  formData.value = { ...data }
}

const handleFormReset = () => {
  console.log('Form reset requested')
  // Reset local state
  submitResult.value = null
}

const handleSubmitSuccess = (result) => {
  console.log('Form submission successful:', result)
  submitResult.value = {
    success: true,
    message: result.message,
    estimatedResponse: result.estimatedResponse,
    submissionId: result.submissionId
  }
  
  // Reset form after successful submission
  setTimeout(() => {
    submitResult.value = null
  }, 5000)
}

const handleSubmitError = (error) => {
  console.error('Form submission failed:', error)
  submitResult.value = {
    error: error
  }
}

// Watch for searchId changes
watch(searchId, () => {
  formConfig.value = null
  formSchema.value = null
  formData.value = {}
  formError.value = null
  submitResult.value = null
})

// Page metadata
useHead({
  title: computed(() => `${formConfig.value?.title || 'Dynamic Form'} - Search ${searchId.value}`),
  meta: [
    { name: 'description', content: 'Dynamic FormKit form demo with API-driven schema loading' }
  ]
})

// Lifecycle
onMounted(() => {
  // Auto-open sidebar after delay for demo
  setTimeout(() => {
    isSidebarOpen.value = true
  }, 1000)
})
</script>

<style scoped>
/* ========================================
   ENHANCED DESIGN SYSTEM STYLES
   ======================================== */

/* Typography Hierarchy */
.heading-responsive-primary {
  @apply text-2xl sm:text-3xl md:text-4xl font-bold leading-tight;
  color: oklch(var(--foreground-color));
}

.heading-responsive-secondary {
  @apply text-lg sm:text-xl md:text-2xl font-semibold leading-snug;
  color: oklch(var(--foreground-color));
}

.heading-tertiary {
  @apply text-lg font-medium leading-normal;
  color: oklch(var(--foreground-color));
}

.text-body-large {
  @apply text-base leading-relaxed;
  color: oklch(var(--foreground-color));
}

.text-body {
  @apply text-sm leading-normal;
  color: oklch(var(--foreground-color));
}

.text-body-small {
  @apply text-xs leading-normal;
  color: oklch(var(--foreground-quiet-color));
}

.text-meta {
  @apply text-xs font-medium uppercase tracking-wide;
  color: oklch(var(--foreground-quieter-color));
}

/* Layout Components */
.container-responsive {
  @apply w-full mx-auto px-4 sm:px-6 md:px-8 lg:max-w-6xl;
}

.header-section {
  @apply py-6 sm:py-8 md:py-12;
}

.main-content {
  @apply pb-8 md:pb-12;
}

/* Card System */
.card-hero {
  @apply rounded-xl p-6 md:p-8 shadow-lg;
  background-color: oklch(var(--background-raised-color));
  border: 1px solid oklch(var(--foreground-subtler-color));
  box-shadow: 0 0 0 1px oklch(var(--super-color) / 0.1);
}

.card-primary {
  @apply rounded-lg p-4 md:p-6 shadow-md;
  background-color: oklch(var(--background-raised-color));
  border: 1px solid oklch(var(--foreground-subtler-color));
}

.card-secondary {
  @apply rounded-lg p-4;
  background-color: oklch(var(--background-raised-color));
  border: 1px solid oklch(var(--foreground-subtlest-color));
}

.card-status {
  @apply rounded-lg p-4 shadow-sm;
}

.card-status--success {
  border: 1px solid oklch(var(--positive-color) / 0.3);
  background-color: oklch(var(--positive-color) / 0.05);
}

.card-status--error {
  border: 1px solid oklch(var(--negative-color) / 0.3);
  background-color: oklch(var(--negative-color) / 0.05);
}

.card-header {
  @apply pb-4;
  border-bottom: 1px solid oklch(var(--foreground-subtlest-color));
}

.card-content {
  @apply pt-4;
}

/* Button System */
.btn-primary {
  @apply px-6 py-3 rounded-lg font-medium text-white shadow-lg;
  @apply transform hover:scale-105 hover:shadow-xl;
  @apply transition-all duration-200 ease-out;
  @apply focus:ring-2 focus:outline-none;
  background: linear-gradient(to right, #ec4899, #f97316, #3b82f6);
  background-size: 200% 200%;
  animation: gradient-chaos 3s ease infinite;
  focus-ring-color: oklch(var(--super-color) / 0.5);
}

.btn-secondary {
  @apply px-6 py-3 rounded-lg font-medium transition-all duration-200 ease-out;
  @apply focus:ring-2 focus:outline-none;
  color: oklch(var(--foreground-color));
  border: 1px solid oklch(var(--foreground-subtler-color));
  background-color: oklch(var(--background-raised-color));
}

.btn-secondary:hover {
  background-color: oklch(var(--background-subtler-color));
}

.btn-icon {
  @apply p-2 rounded-lg transition-all duration-200 ease-out;
  @apply focus:ring-2 focus:outline-none;
  color: oklch(var(--foreground-color));
}

.btn-icon:hover {
  background-color: oklch(var(--background-subtler-color));
}

.btn-press {
  @apply active:scale-95 active:shadow-inner;
  @apply transition-transform duration-100 ease-out;
}

.touch-target {
  @apply min-h-[44px] min-w-[44px];
}

/* Responsive Grid Systems */
.feature-grid-responsive {
  @apply grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-2 md:gap-4;
}

/* Sidebar System */
.sidebar-container {
  @apply fixed right-0 top-0 h-full z-50;
  @apply w-full sm:w-96 md:w-[28rem] lg:w-[32rem];
  @apply shadow-2xl flex flex-col;
  background-color: oklch(var(--background-raised-color));
  border-left: 1px solid oklch(var(--foreground-subtler-color));
}

.sidebar-header {
  @apply sticky top-0 z-10 px-6 py-4 backdrop-blur-sm flex-shrink-0;
  background-color: oklch(var(--background-raised-color));
  border-bottom: 1px solid oklch(var(--foreground-subtler-color));
}

.sidebar-content {
  @apply flex-1 overflow-y-auto px-6 py-6 scrollbar-subtle;
}

.sidebar-footer {
  @apply sticky bottom-0 px-6 py-4 backdrop-blur-sm flex-shrink-0;
  background-color: oklch(var(--background-raised-color));
  border-top: 1px solid oklch(var(--foreground-subtler-color));
}

/* Form System */
.form-mobile {
  @apply space-y-4 sm:space-y-6;
}

.form-actions-mobile {
  @apply flex flex-col sm:flex-row gap-3;
}

.form-actions-mobile .btn-primary {
  @apply w-full sm:flex-1;
}

.form-input-enhanced {
  @apply transform transition-all duration-200 ease-out;
  @apply focus:scale-[1.01] focus:shadow-lg;
}

.form-input-enhanced:focus {
  box-shadow: 0 10px 15px -3px oklch(var(--super-color) / 0.05);
}

/* Micro-interactions */
.transition-smooth {
  @apply transition-all duration-300 ease-out;
}

.transition-fast {
  @apply transition-all duration-200 ease-out;
}

.hover-lift {
  @apply transform hover:scale-[1.02] hover:-translate-y-1;
  @apply transition-transform duration-200 ease-out;
}

.hover-glow {
  @apply hover:shadow-lg transition-shadow duration-300 ease-out;
}

.hover-glow:hover {
  box-shadow: 0 10px 15px -3px oklch(var(--super-color) / 0.1);
}

/* Staggered Animations */
.stagger-children > * {
  @apply opacity-0 translate-y-4;
  animation: fadeSlideUp 0.4s ease-out forwards;
}

.stagger-children > *:nth-child(1) { animation-delay: 0.1s; }
.stagger-children > *:nth-child(2) { animation-delay: 0.2s; }
.stagger-children > *:nth-child(3) { animation-delay: 0.3s; }
.stagger-children > *:nth-child(4) { animation-delay: 0.4s; }

/* Loading States */
.loading-state {
  @apply space-y-6;
}

.error-state {
  @apply space-y-6;
}

.skeleton {
  @apply animate-pulse rounded;
  background-color: oklch(var(--background-subtler-color));
}

.skeleton-text {
  @apply h-4 rounded;
  background-color: oklch(var(--background-subtler-color));
}

.skeleton-title {
  @apply h-6 rounded w-3/4;
  background-color: oklch(var(--background-subtler-color));
}

/* Enhanced Animations */
.sidebar-enter {
  animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.backdrop-fade-in {
  animation: backdropFadeIn 0.3s ease-out;
}

.content-fade-in {
  animation: fadeSlideUp 0.5s ease;
}

.form-fade-in {
  animation: fadeSlideUp 0.3s ease 0.2s both;
}

.message-slide-in {
  animation: fadeSlideUp 0.3s ease;
}

/* Keyframe Animations */
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes backdropFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
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

/* Custom Scrollbar */
.scrollbar-subtle {
  scrollbar-width: thin;
  scrollbar-color: oklch(var(--foreground-color) / .15) transparent;
}

.scrollbar-subtle::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-subtle::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-subtle::-webkit-scrollbar-thumb {
  background-color: oklch(var(--foreground-color) / .15);
  border-radius: 3px;
}

.scrollbar-subtle::-webkit-scrollbar-thumb:hover {
  background-color: oklch(var(--foreground-color) / .25);
}

/* Responsive Design */
@media (max-width: 768px) {
  .hover-lift:hover,
  .btn-primary:hover,
  .btn-secondary:hover {
    transform: scale(1.02);
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .stagger-children > *,
  .sidebar-enter,
  .content-fade-in,
  .form-fade-in,
  .message-slide-in,
  .hover-lift,
  .transition-smooth,
  .transition-fast {
    animation: none;
    transition: none;
    transform: none;
  }
}

/* High Contrast Support */
@media (prefers-contrast: high) {
  .btn-primary {
    border: 2px solid white;
  }
  
  .btn-secondary {
    border: 2px solid currentColor;
  }
}

/* Gradient Animation Keyframes */
@keyframes gradient-chaos {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}
</style>
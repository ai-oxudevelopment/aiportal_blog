<template>
  <Teleport to="body">
    <div v-if="isOpen">
      <!-- Backdrop -->
      <div 
        class="fixed inset-0 bg-backdrop backdrop-fade-in z-40"
        @click="handleClose"
      ></div>
      
      <!-- Sidebar Container -->
      <aside class="sidebar-container sidebar-enter">
        <!-- Sidebar Header - Fixed -->
        <header class="sidebar-header">
          <slot name="header" :config="effectiveFormConfig" :close="handleClose">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <div class="p-2 bg-super/10 rounded-lg">
                    <Settings class="h-5 w-5 text-super" />
                  </div>
                  <h2 class="text-lg font-semibold text-foreground">
                    {{ effectiveTitle }}
                  </h2>
                </div>
                <p v-if="effectiveDescription" class="text-sm text-quiet leading-relaxed">
                  {{ effectiveDescription }}
                </p>
                <div v-if="showFormId && effectiveFormConfig?.searchId" class="flex items-center gap-2 mt-3">
                  <div class="px-2 py-1 bg-super/20 text-super text-xs font-medium rounded-full">
                    ID: {{ effectiveFormConfig.searchId }}
                  </div>
                </div>
              </div>
              <button
                @click="handleClose"
                class="p-2 hover:bg-subtler rounded-lg transition-all duration-200 ml-4 flex-shrink-0"
              >
                <svg class="h-4 w-4 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </slot>
        </header>

        <!-- Sidebar Content - Scrollable -->
        <div class="sidebar-content">
          <!-- Loading State -->
          <div v-if="effectiveIsLoading" class="space-y-6">
            <slot name="loading">
              <div class="flex flex-col items-center justify-center py-12">
                <div class="relative">
                  <Loader2 class="h-10 w-10 animate-spin text-super" />
                  <div class="absolute inset-0 h-10 w-10 rounded-full border-2 border-super/20"></div>
                </div>
                <p class="text-center text-foreground font-medium mt-4">Loading form schema...</p>
                <p class="text-center text-quiet text-sm mt-1">Fetching dynamic fields</p>
              </div>
              
              <!-- Loading Skeleton -->
              <div class="space-y-4">
                <div class="space-y-2">
                  <div class="h-4 bg-subtler rounded animate-pulse w-1/3"></div>
                  <div class="h-12 bg-subtler rounded-lg animate-pulse"></div>
                </div>
                <div class="space-y-2">
                  <div class="h-4 bg-subtler rounded animate-pulse w-1/2"></div>
                  <div class="h-12 bg-subtler rounded-lg animate-pulse"></div>
                </div>
                <div class="space-y-2">
                  <div class="h-4 bg-subtler rounded animate-pulse w-2/5"></div>
                  <div class="h-24 bg-subtler rounded-lg animate-pulse"></div>
                </div>
                <div class="h-12 bg-super/20 rounded-lg animate-pulse"></div>
              </div>
            </slot>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="error-state">
            <slot name="error" :error="error" :retry="handleFetchConfig">
              <div class="flex flex-col items-center justify-center py-12">
                <div class="p-4 bg-negative-color/10 rounded-full mb-4">
                  <AlertCircle class="h-8 w-8 text-negative-color" />
                </div>
                <h3 class="heading-tertiary mb-2">Failed to load form</h3>
                <p class="text-body-small text-quiet text-center max-w-sm mb-6">{{ error }}</p>
                <div class="flex gap-3">
                  <button
                    @click="handleFetchConfig"
                    class="btn-primary"
                  >
                    Try Again
                  </button>
                  <button
                    @click="handleClose"
                    class="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </slot>
          </div>

          <!-- Dynamic FormKit Form -->
          <div v-else-if="effectiveFormSchema && Array.isArray(effectiveFormSchema) && effectiveFormSchema.length > 0" class="form-fade-in">
            <!-- Form Fields Container -->
            <div class="form-mobile">
              <FormKit
                v-for="(field, index) in effectiveFormSchema"
                :key="`${field.name}-${index}`"
                :type="field.$formkit"
                :name="field.name"
                :label="field.label"
                :placeholder="field.placeholder"
                :validation="field.validation"
                :validation-messages="field.validationMessages"
                :help="field.help"
                :options="field.options"
                :min="field.min"
                :max="field.max"
                :step="field.step"
                :attrs="field.attrs"
                v-model="internalFormData[field.name]"
                class="form-input-enhanced"
              />
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="flex flex-col items-center justify-center py-12">
            <div class="p-4 bg-subtler rounded-full mb-4">
              <FileText class="h-8 w-8 text-quiet" />
            </div>
            <h3 class="heading-tertiary mb-2">No form available</h3>
            <p class="text-body-small text-quiet text-center max-w-sm">
              No form schema has been provided or loaded yet.
            </p>
          </div>
        </div>

        <!-- Sidebar Footer - Fixed Actions -->
        <footer class="sidebar-footer">
          <slot
            name="footer"
            :submit="handleSubmit"
            :reset="handleReset"
            :isSubmitting="effectiveIsSubmitting"
            :hasSchema="!!(effectiveFormSchema && Array.isArray(effectiveFormSchema) && effectiveFormSchema.length > 0)"
          >
            <div v-if="effectiveFormSchema && Array.isArray(effectiveFormSchema) && effectiveFormSchema.length > 0" class="form-actions-mobile">
              <button
                @click="handleSubmit"
                :disabled="effectiveIsSubmitting"
                class="btn-primary btn-press flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Loader2 v-if="effectiveIsSubmitting" class="h-4 w-4 animate-spin" />
                {{ effectiveIsSubmitting ? 'Submitting...' : 'Submit Form' }}
              </button>
              <button
                v-if="showResetButton"
                type="button"
                @click="handleReset"
                :disabled="effectiveIsSubmitting"
                class="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reset
              </button>
            </div>
            
            <!-- Form Footer Info -->
            <div class="mt-4 text-center">
              <p class="text-body-small text-quieter">
                {{ customFooterText || 'All fields are validated in real-time • Data is processed securely' }}
              </p>
            </div>
          </slot>
        </footer>
      </aside>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { FormKit } from '@formkit/vue'

// Icons from lucide-vue-next
import {
  Settings,
  AlertCircle,
  Loader2,
  FileText
} from 'lucide-vue-next'

// Props definition
const props = defineProps({
  // Core functionality
  isOpen: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  
  // Form configuration
  formConfig: {
    type: Object,
    default: () => ({})
  },
  formSchema: {
    type: Array,
    default: () => []
  },
  formData: {
    type: Object,
    default: () => ({})
  },
  
  // API endpoints (for flexibility)
  fetchUrl: {
    type: String,
    default: ''
  },
  submitUrl: {
    type: String,
    default: ''
  },
  
  // State management
  isLoading: {
    type: Boolean,
    default: false
  },
  isSubmitting: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  submitResult: {
    type: Object,
    default: () => null
  },
  
  // Customization
  showResetButton: {
    type: Boolean,
    default: true
  },
  showFormId: {
    type: Boolean,
    default: true
  },
  autoCloseOnSuccess: {
    type: Boolean,
    default: false
  },
  customFooterText: {
    type: String,
    default: ''
  }
})

// Events definition
const emit = defineEmits([
  'update:isOpen',
  'update:formData',
  'close',
  'submit',
  'reset',
  'fetch-config',
  'loading-start',
  'loading-end',
  'submit-success',
  'submit-error'
])

// Internal state
const internalFormData = ref({})
const internalIsLoading = ref(false)
const internalIsSubmitting = ref(false)
const internalError = ref('')
const internalFormConfig = ref({})
const internalFormSchema = ref([])

// Computed properties for effective values (props take precedence over internal state)
const effectiveIsLoading = computed(() => props.isLoading || internalIsLoading.value)
const effectiveIsSubmitting = computed(() => props.isSubmitting || internalIsSubmitting.value)
const effectiveFormConfig = computed(() => {
  return (props.formConfig && Object.keys(props.formConfig).length > 0) ? props.formConfig : internalFormConfig.value
})
const effectiveFormSchema = computed(() => {
  return (props.formSchema && Array.isArray(props.formSchema) && props.formSchema.length > 0) ? props.formSchema : internalFormSchema.value
})
const effectiveTitle = computed(() => props.title || effectiveFormConfig.value?.title || 'Dynamic Form')
const effectiveDescription = computed(() => props.description || effectiveFormConfig.value?.description || '')

// Watch for form data changes and sync with parent
watch(() => internalFormData.value, (newData) => {
  emit('update:formData', newData)
}, { deep: true })

// Watch for prop formData changes and sync internally
watch(() => props.formData, (newData) => {
  if (newData && Object.keys(newData).length > 0) {
    internalFormData.value = { ...newData }
  }
}, { immediate: true, deep: true })

// Watch for form schema changes and initialize form data
watch(() => effectiveFormSchema.value, (newSchema) => {
  if (newSchema && Array.isArray(newSchema) && newSchema.length > 0) {
    initializeFormData(newSchema)
  }
}, { immediate: true })

// Initialize form data with default values from schema
const initializeFormData = (schema) => {
  if (!schema || !Array.isArray(schema)) return
  
  const initialData = {}
  schema.forEach(field => {
    if (field.value !== undefined) {
      initialData[field.name] = field.value
    } else if (field.$formkit === 'checkbox' && field.options) {
      initialData[field.name] = []
    } else if (field.$formkit === 'checkbox') {
      initialData[field.name] = false
    } else if (field.$formkit === 'select' && field.multiple) {
      initialData[field.name] = []
    } else if (field.$formkit === 'number') {
      initialData[field.name] = field.min || 0
    } else {
      initialData[field.name] = ''
    }
  })
  
  // Only update if we don't already have form data
  if (Object.keys(internalFormData.value).length === 0) {
    internalFormData.value = initialData
  }
}

// API Methods
const fetchFormConfig = async () => {
  if (!props.fetchUrl) {
    internalError.value = 'No fetch URL provided'
    return
  }

  internalIsLoading.value = true
  internalError.value = ''
  emit('loading-start')
  
  try {
    const response = await $fetch(props.fetchUrl)
    
    if (!response || !response.schema) {
      throw new Error('Invalid schema format from API')
    }
    
    internalFormConfig.value = {
      title: response.title,
      description: response.description,
      searchId: response.searchId
    }
    internalFormSchema.value = response.schema
    
  } catch (error) {
    console.error('Failed to fetch form config:', error)
    internalError.value = error.message || 'Failed to load form configuration'
  } finally {
    internalIsLoading.value = false
    emit('loading-end')
  }
}

const submitForm = async () => {
  if (effectiveIsSubmitting.value) return
  
  const dataToSubmit = { ...internalFormData.value }
  
  // If we have a submit URL, handle the API call internally
  if (props.submitUrl) {
    internalIsSubmitting.value = true
    
    try {
      const response = await $fetch(props.submitUrl, {
        method: 'POST',
        body: dataToSubmit
      })
      
      emit('submit-success', response)
      
      if (props.autoCloseOnSuccess) {
        setTimeout(() => {
          handleClose()
        }, 2000)
      }
      
    } catch (error) {
      console.error('Form submission failed:', error)
      const errorMessage = error.data?.message || error.message || 'Failed to submit form. Please try again.'
      emit('submit-error', errorMessage)
    } finally {
      internalIsSubmitting.value = false
    }
  }
  
  // Always emit the submit event for parent handling
  emit('submit', dataToSubmit)
}

// Event handlers
const handleClose = () => {
  emit('update:isOpen', false)
  emit('close')
}

const handleSubmit = () => {
  submitForm()
}

const handleReset = () => {
  if (effectiveFormSchema.value && effectiveFormSchema.value.length > 0) {
    initializeFormData(effectiveFormSchema.value)
  }
  emit('reset')
}

const handleFetchConfig = () => {
  if (props.fetchUrl) {
    fetchFormConfig()
  }
  emit('fetch-config')
}

// Auto-fetch config when sidebar opens and fetchUrl is provided
watch(() => props.isOpen, (isOpen) => {
  if (isOpen && props.fetchUrl && (!effectiveFormSchema.value || !Array.isArray(effectiveFormSchema.value) || effectiveFormSchema.value.length === 0)) {
    nextTick(() => {
      fetchFormConfig()
    })
  }
})
</script>

<style scoped>
/* ========================================
   DYNAMIC FORM SIDEBAR STYLES
   ======================================== */

/* Typography Hierarchy */
.heading-tertiary {
  @apply text-lg font-medium leading-normal;
  color: oklch(var(--foreground-color));
}

.text-body-small {
  @apply text-xs leading-normal;
  color: oklch(var(--foreground-quiet-color));
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

.btn-press {
  @apply active:scale-95 active:shadow-inner;
  @apply transition-transform duration-100 ease-out;
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

/* Loading States */
.error-state {
  @apply space-y-6;
}

/* Enhanced Animations */
.sidebar-enter {
  animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.backdrop-fade-in {
  animation: backdropFadeIn 0.3s ease-out;
}

.form-fade-in {
  animation: fadeSlideUp 0.3s ease 0.2s both;
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

@keyframes gradient-chaos {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
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

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .sidebar-enter,
  .form-fade-in,
  .btn-primary,
  .btn-secondary,
  .form-input-enhanced {
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
</style>
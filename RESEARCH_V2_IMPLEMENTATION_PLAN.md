# Research V2 Page Implementation Plan

## Overview
Create a new research page at `/research/v2/[searchId]` with a modern card-based design, progress tracking, and animated sidebar configuration panel, based on the provided ResearchPage.jsx example.

## Technical Requirements

### File Structure
- **Main Page**: `frontend/pages/research/v2/[searchId].vue`
- **Styling**: Use existing Perplexity theme and Tailwind CSS
- **Icons**: Lucide Vue Next (already installed)
- **Framework**: Vue 3 Composition API with Nuxt 3

### Design System Analysis

Based on the example ResearchPage.jsx and screenshots, the new design includes:

1. **Header Section**
   - Search icon with title "Research Session"
   - Session ID display
   - Configure button (opens sidebar)

2. **Main Content Cards**
   - Status Card: Shows research title, progress bar, status badge
   - Key Insights Card: Animated list of insights with bullet points
   - Research Timeline Card: Activity timeline with status indicators

3. **Animated Sidebar**
   - Slides in from right with backdrop
   - Configuration form with various input types
   - Close button and backdrop click to close

4. **Success/Error Messages**
   - Animated cards for feedback
   - Green for success, red for errors

## Component Structure (Inline Components)

### Main Layout Components

#### Card Component (Inline)
```vue
<!-- Card wrapper with consistent styling -->
<div class="rounded-lg border border-subtler bg-raised p-6 shadow-sm">
  <!-- Card Header -->
  <div class="mb-4" v-if="$slots.header">
    <slot name="header"></slot>
  </div>
  <!-- Card Content -->
  <div>
    <slot></slot>
  </div>
</div>
```

#### Badge Component (Inline)
```vue
<!-- Status badge with dynamic colors -->
<span :class="badgeClasses">
  {{ text }}
</span>
```

#### Progress Bar Component (Inline)
```vue
<!-- Animated progress bar -->
<div class="w-full bg-subtler rounded-full h-2">
  <div 
    class="bg-super h-2 rounded-full transition-all duration-1000 ease-out"
    :style="{ width: `${progress}%` }"
  ></div>
</div>
```

### Page Structure

```vue
<template>
  <div class="min-h-screen bg-base relative">
    <!-- Main Content -->
    <div :class="['transition-all duration-300', isSidebarOpen ? 'mr-96' : 'mr-0']">
      <div class="container mx-auto px-4 py-8 max-w-4xl">
        
        <!-- Header -->
        <HeaderSection />
        
        <!-- Loading State -->
        <LoadingSkeletons v-if="isLoading" />
        
        <!-- Main Content -->
        <div v-else class="space-y-6">
          <!-- Success/Error Messages -->
          <MessageCard v-if="submitResult" />
          
          <!-- Status Card -->
          <StatusCard />
          
          <!-- Insights Card -->
          <InsightsCard />
          
          <!-- Timeline Card -->
          <TimelineCard />
        </div>
      </div>
    </div>

    <!-- Animated Sidebar -->
    <SidebarPanel />
  </div>
</template>
```

## State Management

### Reactive Data
```javascript
const { searchId } = useRoute().params
const isLoading = ref(true)
const isSidebarOpen = ref(false)
const isFormLoading = ref(false)
const isSubmitting = ref(false)
const researchData = ref(null)
const submitResult = ref(null)
const formConfig = ref(null)

// Get agent ID from query params or default
const agentId = computed(() => {
  return useRoute().query.agentId || 'market-research'
})
```

### Integration with Existing API
```javascript
// Use existing composables
const { samplePrompt } = useSamplePrompt()
const { sampleUploadedFiles } = useSampleUploadedFiles()
const { sampleAdditionalText } = useSampleAdditionalText()
const { sampleFiles } = useSampleFiles()

// Simulate API calls for new functionality
const fetchFormConfig = async () => {
  // Simulate form config fetch
  // In real implementation, this would call actual API
}

const handleFormSubmit = async (formData) => {
  // Handle form submission
  // Update research status and progress
}
```

## Animation Implementation

### CSS Transitions (Instead of Framer Motion)
```css
/* Sidebar animations */
.sidebar-enter-active,
.sidebar-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-enter-from {
  transform: translateX(100%);
}

.sidebar-leave-to {
  transform: translateX(100%);
}

/* Backdrop animations */
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.3s ease;
}

.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

/* Content animations */
.fade-slide-enter-active {
  transition: all 0.5s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

/* Progress bar animation */
.progress-bar {
  transition: width 1s ease-out;
}

/* Insight items staggered animation */
.insight-item {
  transition: all 0.3s ease;
  transition-delay: calc(var(--index) * 0.1s);
}
```

## Styling with Perplexity Theme

### Color Usage
- **Background**: `bg-base` (main background)
- **Cards**: `bg-raised` with `border-subtler`
- **Text**: `text-foreground`, `text-quiet`, `text-quieter`
- **Accents**: `text-super`, `bg-super`
- **Status Colors**: Custom classes for success/error states

### Component Styling Examples

#### Status Card
```vue
<div class="rounded-lg border border-subtler bg-raised p-6">
  <div class="flex items-center justify-between mb-4">
    <h2 class="text-xl font-semibold text-foreground flex items-center gap-2">
      <BrainIcon class="h-5 w-5 text-super" />
      {{ researchData?.title }}
    </h2>
    <span class="px-3 py-1 rounded-full text-sm font-medium bg-super/20 text-super">
      {{ researchData?.status }}
    </span>
  </div>
  <!-- Progress bar and other content -->
</div>
```

#### Insights Card
```vue
<div class="rounded-lg border border-subtler bg-raised p-6">
  <h2 class="text-xl font-semibold text-foreground flex items-center gap-2 mb-4">
    <ZapIcon class="h-5 w-5 text-super" />
    Key Insights
  </h2>
  <div class="space-y-3">
    <div 
      v-for="(insight, index) in researchData?.insights" 
      :key="index"
      class="flex items-center gap-3 p-3 bg-subtler rounded-lg insight-item"
      :style="{ '--index': index }"
    >
      <div class="w-2 h-2 bg-super rounded-full"></div>
      <span class="text-foreground">{{ insight }}</span>
    </div>
  </div>
</div>
```

## Responsive Design

### Breakpoints
- **Mobile**: Stack cards vertically, full-width sidebar
- **Tablet**: Maintain card layout, adjust sidebar width
- **Desktop**: Full layout as designed

### Responsive Classes
```vue
<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
  <!-- Status indicators -->
</div>

<div class="w-full md:w-1/3 lg:w-96">
  <!-- Sidebar width responsive -->
</div>
```

## Integration Points

### Existing Functionality to Preserve
1. **Chat Integration**: Keep FullAiChat component
2. **File Handling**: Integrate existing file upload/display
3. **API Integration**: Use existing composables and mock data
4. **Navigation**: Maintain routing and navigation patterns

### New Functionality to Add
1. **Agent Selection**: Support different agent types
2. **Progress Tracking**: Real-time progress updates
3. **Configuration Panel**: Dynamic form generation
4. **Status Management**: Research status lifecycle

## Implementation Steps

1. **Create Page Structure**: Set up the basic Vue component
2. **Implement Header**: Search icon, title, configure button
3. **Add Loading States**: Skeleton components for loading
4. **Create Status Card**: Progress tracking and status display
5. **Build Insights Card**: Animated insights list
6. **Add Timeline Card**: Activity timeline component
7. **Implement Sidebar**: Animated configuration panel
8. **Add Form Integration**: Dynamic form handling
9. **Style with Theme**: Apply Perplexity theme consistently
10. **Add Animations**: CSS transitions for smooth interactions
11. **Test Responsiveness**: Ensure mobile/tablet compatibility
12. **Integrate Existing Features**: Chat, files, API calls

## Testing Checklist

- [ ] Page loads correctly at `/research/v2/[searchId]`
- [ ] Sidebar opens/closes with smooth animations
- [ ] Progress bar animates correctly
- [ ] Insights appear with staggered animation
- [ ] Form submission works and updates status
- [ ] Responsive design works on all screen sizes
- [ ] Existing functionality (chat, files) still works
- [ ] Theme colors and styling are consistent
- [ ] Loading states display properly
- [ ] Error handling works correctly

## Future Enhancements

1. **Real API Integration**: Replace mock data with actual API calls
2. **WebSocket Updates**: Real-time progress updates
3. **Advanced Animations**: More sophisticated transitions
4. **Accessibility**: ARIA labels and keyboard navigation
5. **Performance**: Lazy loading and optimization
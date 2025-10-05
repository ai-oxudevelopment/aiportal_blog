# DynamicFormSidebar Component

A highly reusable Vue 3 component that provides a dynamic form sidebar with FormKit integration. This component can be used across different pages to display dynamic forms with API-driven schemas.

## Features

- 🔄 **Dynamic Form Loading**: Loads form schemas from API endpoints
- 🎛️ **Flexible Configuration**: Supports both API-driven and custom data approaches
- 🎨 **Customizable**: Slots for header, loading, error, and footer content
- 📱 **Responsive Design**: Mobile-first design with responsive breakpoints
- 🔌 **Decoupled**: No hard dependencies on specific routes or API endpoints
- 🎯 **Type-Safe**: Full TypeScript support for better developer experience
- ♿ **Accessible**: Maintains accessibility features and keyboard navigation
- 🎭 **Multiple Instances**: Support for multiple sidebars on the same page

## Installation

The component is located at `frontend/components/ui/DynamicFormSidebar.vue` and requires the following dependencies:

- Vue 3 with Composition API
- FormKit for form rendering
- Lucide Vue Next for icons
- Nuxt 3 (for `$fetch` utility)

## Basic Usage

### Simple API-driven Usage

```vue
<template>
  <div>
    <!-- Your page content -->
    <button @click="openSidebar">Open Form</button>
    
    <!-- Dynamic Form Sidebar -->
    <DynamicFormSidebar
      v-model:isOpen="sidebarOpen"
      v-model:formData="formData"
      :fetchUrl="`/api/${searchId}/form`"
      :submitUrl="`/api/${searchId}/submit`"
      @submit="handleSubmit"
      @close="handleClose"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import DynamicFormSidebar from '@/components/ui/DynamicFormSidebar.vue'

const sidebarOpen = ref(false)
const formData = ref({})
const searchId = ref('12345')

const openSidebar = () => {
  sidebarOpen.value = true
}

const handleSubmit = (data) => {
  console.log('Form submitted:', data)
}

const handleClose = () => {
  console.log('Sidebar closed')
}
</script>
```

### Advanced Custom Usage

```vue
<template>
  <DynamicFormSidebar
    v-model:isOpen="sidebarOpen"
    v-model:formData="formData"
    :formConfig="customFormConfig"
    :formSchema="customSchema"
    :isLoading="isLoading"
    :isSubmitting="isSubmitting"
    :error="errorMessage"
    :submitResult="result"
    :autoCloseOnSuccess="true"
    :showResetButton="true"
    title="Custom Form Title"
    description="Custom form description"
    customFooterText="Custom footer message"
    @submit="handleCustomSubmit"
    @submit-success="handleSuccess"
    @submit-error="handleError"
    @fetch-config="loadCustomConfig"
  >
    <!-- Custom Header -->
    <template #header="{ config, close }">
      <div class="flex items-center justify-between p-4">
        <h2 class="text-xl font-bold">{{ config.title }}</h2>
        <button @click="close" class="btn-icon">
          <X class="h-4 w-4" />
        </button>
      </div>
    </template>

    <!-- Custom Loading State -->
    <template #loading>
      <div class="flex items-center justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span class="ml-2">Loading custom form...</span>
      </div>
    </template>

    <!-- Custom Footer -->
    <template #footer="{ submit, reset, isSubmitting }">
      <div class="flex gap-2 p-4">
        <button @click="submit" :disabled="isSubmitting" class="btn-primary">
          {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
        </button>
        <button @click="reset" class="btn-secondary">Clear</button>
      </div>
    </template>
  </DynamicFormSidebar>
</template>
```

### Multiple Sidebars Example

```vue
<template>
  <div>
    <!-- User Profile Form -->
    <DynamicFormSidebar
      v-model:isOpen="profileSidebarOpen"
      v-model:formData="profileData"
      title="Edit Profile"
      :formSchema="profileSchema"
      @submit="updateProfile"
    />

    <!-- Settings Form -->
    <DynamicFormSidebar
      v-model:isOpen="settingsSidebarOpen"
      v-model:formData="settingsData"
      title="Application Settings"
      :formSchema="settingsSchema"
      @submit="updateSettings"
    />
  </div>
</template>
```

## Props

### Core Functionality

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `Boolean` | `false` | Controls sidebar visibility |
| `title` | `String` | `''` | Sidebar title (fallback to formConfig.title) |
| `description` | `String` | `''` | Sidebar description |

### Form Configuration

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `formConfig` | `Object` | `{}` | Form metadata (title, description, etc.) |
| `formSchema` | `Array` | `[]` | Dynamic form schema array |
| `formData` | `Object` | `{}` | Form data values |

### API Endpoints

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `fetchUrl` | `String` | `''` | URL to fetch form schema |
| `submitUrl` | `String` | `''` | URL to submit form data |

### State Management

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isLoading` | `Boolean` | `false` | Loading state |
| `isSubmitting` | `Boolean` | `false` | Submission state |
| `error` | `String` | `''` | Error message |
| `submitResult` | `Object` | `null` | Submission result |

### Customization

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showResetButton` | `Boolean` | `true` | Show/hide reset button |
| `showFormId` | `Boolean` | `true` | Show/hide form ID badge |
| `autoCloseOnSuccess` | `Boolean` | `false` | Auto-close after successful submission |
| `customFooterText` | `String` | `''` | Custom footer text |

## Events

### Core Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:isOpen` | `Boolean` | Emitted when sidebar open state changes |
| `update:formData` | `Object` | Emitted when form data changes |

### Action Events

| Event | Payload | Description |
|-------|---------|-------------|
| `close` | - | Emitted when sidebar is closed |
| `submit` | `Object` | Emitted when form is submitted |
| `reset` | - | Emitted when form is reset |
| `fetch-config` | - | Emitted when config fetch is requested |

### State Events

| Event | Payload | Description |
|-------|---------|-------------|
| `loading-start` | - | Emitted when loading starts |
| `loading-end` | - | Emitted when loading ends |
| `submit-success` | `Object` | Emitted on successful submission |
| `submit-error` | `String` | Emitted on submission error |

## Slots

### Header Slot

Customize the sidebar header:

```vue
<template #header="{ config, close }">
  <div class="custom-header">
    <h2>{{ config.title }}</h2>
    <button @click="close">Close</button>
  </div>
</template>
```

**Slot Props:**
- `config`: Form configuration object
- `close`: Function to close the sidebar

### Loading Slot

Customize the loading state:

```vue
<template #loading>
  <div class="custom-loading">
    <spinner />
    <p>Loading form...</p>
  </div>
</template>
```

### Error Slot

Customize the error state:

```vue
<template #error="{ error, retry }">
  <div class="custom-error">
    <p>Error: {{ error }}</p>
    <button @click="retry">Try Again</button>
  </div>
</template>
```

**Slot Props:**
- `error`: Error message string
- `retry`: Function to retry fetching config

### Footer Slot

Customize the footer actions:

```vue
<template #footer="{ submit, reset, isSubmitting, hasSchema }">
  <div class="custom-footer">
    <button v-if="hasSchema" @click="submit" :disabled="isSubmitting">
      {{ isSubmitting ? 'Submitting...' : 'Submit' }}
    </button>
    <button @click="reset">Reset</button>
  </div>
</template>
```

**Slot Props:**
- `submit`: Function to submit the form
- `reset`: Function to reset the form
- `isSubmitting`: Boolean indicating submission state
- `hasSchema`: Boolean indicating if form schema is available

## Form Schema Format

The component expects form schemas in FormKit format:

```javascript
const formSchema = [
  {
    $formkit: 'text',
    name: 'projectName',
    label: 'Project Name',
    placeholder: 'Enter project name',
    validation: 'required|length:3,100',
    help: 'A descriptive name for your project'
  },
  {
    $formkit: 'select',
    name: 'projectType',
    label: 'Project Type',
    placeholder: 'Select project type',
    validation: 'required',
    options: [
      { label: 'Web Application', value: 'web-app' },
      { label: 'Mobile Application', value: 'mobile-app' }
    ]
  },
  {
    $formkit: 'textarea',
    name: 'description',
    label: 'Description',
    placeholder: 'Describe your project...',
    validation: 'required|length:10,500',
    attrs: { rows: 4 }
  }
]
```

## API Response Format

### Form Config Response (`fetchUrl`)

```javascript
{
  "searchId": "12345",
  "title": "Project Requirements Form",
  "description": "Describe your project requirements so we can provide an accurate quote.",
  "schema": [
    // FormKit schema array
  ]
}
```

### Submit Response (`submitUrl`)

```javascript
{
  "success": true,
  "message": "Form submitted successfully!",
  "submissionId": "12345-1634567890",
  "estimatedResponse": "24 hours"
}
```

## Styling

The component includes comprehensive styling with:

- **Design System**: Consistent typography, colors, and spacing
- **Responsive Design**: Mobile-first approach with breakpoints
- **Animations**: Smooth transitions and micro-interactions
- **Accessibility**: High contrast support and reduced motion preferences
- **Custom Scrollbar**: Subtle scrollbar styling

### CSS Custom Properties

The component uses CSS custom properties for theming:

```css
:root {
  --foreground-color: /* Main text color */;
  --background-raised-color: /* Elevated background */;
  --super-color: /* Accent color */;
  --positive-color: /* Success color */;
  --negative-color: /* Error color */;
}
```

## Best Practices

### 1. Error Handling

Always handle errors gracefully:

```vue
<script setup>
const handleSubmitError = (error) => {
  console.error('Form submission failed:', error)
  // Show user-friendly error message
  showNotification('Failed to submit form. Please try again.', 'error')
}
</script>
```

### 2. Loading States

Provide clear loading feedback:

```vue
<DynamicFormSidebar
  :isLoading="isLoading"
  @loading-start="isLoading = true"
  @loading-end="isLoading = false"
/>
```

### 3. Form Validation

Use FormKit's built-in validation:

```javascript
const schema = [
  {
    $formkit: 'email',
    name: 'email',
    label: 'Email',
    validation: 'required|email',
    validationMessages: {
      required: 'Email is required',
      email: 'Please enter a valid email address'
    }
  }
]
```

### 4. Accessibility

Ensure proper accessibility:

- Use semantic HTML elements
- Provide proper ARIA labels
- Support keyboard navigation
- Test with screen readers

## Troubleshooting

### Common Issues

1. **Form not loading**: Check that `fetchUrl` is correct and API returns proper schema format
2. **Submission failing**: Verify `submitUrl` and ensure proper error handling
3. **Styling issues**: Check CSS custom properties are defined
4. **Reactivity issues**: Ensure proper v-model usage for two-way binding

### Debug Mode

Enable debug logging:

```vue
<script setup>
const handleSubmit = (data) => {
  console.log('Form submitted with data:', data)
}

const handleFetchConfig = () => {
  console.log('Fetching form config...')
}
</script>
```

## Migration Guide

### From Embedded Sidebar

If migrating from an embedded sidebar implementation:

1. **Extract sidebar template** to use `<DynamicFormSidebar>`
2. **Move form logic** to event handlers
3. **Update styling** to use component's built-in styles
4. **Test functionality** to ensure all features work

### Example Migration

**Before:**
```vue
<!-- Embedded sidebar in template -->
<div v-if="sidebarOpen" class="sidebar">
  <!-- Complex sidebar implementation -->
</div>
```

**After:**
```vue
<DynamicFormSidebar
  v-model:isOpen="sidebarOpen"
  :fetchUrl="apiUrl"
  @submit="handleSubmit"
/>
```

## Contributing

When contributing to this component:

1. **Maintain backward compatibility**
2. **Add proper TypeScript types**
3. **Update documentation**
4. **Add tests for new features**
5. **Follow existing code style**

## License

This component is part of the AIPortal Blog project and follows the same license terms.
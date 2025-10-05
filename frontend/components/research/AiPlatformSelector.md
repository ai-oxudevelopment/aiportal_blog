# AiPlatformSelector Component

A Vue.js component that provides quick access to popular AI platforms (ChatGPT, Claude, Perplexity) by opening prompts directly in their respective interfaces.

## Overview

The `AiPlatformSelector` component is designed to work alongside the `SimpleAiChat` component, positioned at the bottom of the screen to provide users with convenient access to external AI platforms. It automatically encodes and passes prompt content to the selected platform.

## Features

- **Three Platform Support**: ChatGPT, Claude, and Perplexity
- **Fixed Positioning**: Stays at the bottom of the screen, positioned above SimpleAiChat
- **Responsive Design**: Shows icons only on mobile, full labels on desktop
- **Gradient Animations**: Matches SimpleAiChat's visual style
- **Hover Effects**: Platform-specific color schemes and animations
- **URL Encoding**: Automatically encodes prompt text for safe URL transmission

## Usage

### Basic Implementation

```vue
<template>
  <div>
    <!-- Your page content -->
    
    <!-- AI Platform Selector -->
    <AiPlatformSelector :prompt-text="yourPromptContent" />
    
    <!-- SimpleAiChat (optional, positioned below) -->
    <SimpleAiChat />
  </div>
</template>

<script setup>
import AiPlatformSelector from '~/components/research/AiPlatformSelector.vue'

const yourPromptContent = "Your prompt text here..."
</script>
```

### Integration in Prompts Page

```vue
<template>
  <!-- Page content -->
  
  <!-- AI Platform Selector with current prompt -->
  <AiPlatformSelector :prompt-text="promptContent" />
  
  <!-- SimpleAiChat for internal chat -->
  <SimpleAiChat />
</template>

<script setup>
import AiPlatformSelector from '~/components/research/AiPlatformSelector.vue'
import SimpleAiChat from '~/components/research/SimpleAiChat.vue'

const promptContent = computed(() => promptItem.value?.body ?? '')
</script>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `promptText` | `String` | ✅ Yes | `''` | The prompt content to send to AI platforms |

## Platform URLs

The component opens the following URLs when buttons are clicked:

- **ChatGPT**: `https://chat.openai.com/?q=${encodeURIComponent(promptText)}`
- **Claude**: `https://claude.ai/new?q=${encodeURIComponent(promptText)}`
- **Perplexity**: `https://perplexity.ai/?q=${encodeURIComponent(promptText)}`

## Styling

### Color Scheme

- **ChatGPT**: Green (`bg-green-600/20`, `text-green-400`)
- **Claude**: Orange (`bg-orange-600/20`, `text-orange-400`)
- **Perplexity**: Blue (`bg-blue-600/20`, `text-blue-400`)

### Responsive Behavior

- **Mobile (< 640px)**: Shows only platform icons
- **Desktop (≥ 640px)**: Shows icons with platform names

### Positioning

- **Position**: `fixed bottom-24` (96px from bottom)
- **Z-index**: `z-40` (below SimpleAiChat's `z-50`)
- **Width**: `280px` default, expands to `320px` on hover
- **Centering**: `mx-auto` with `left-0 right-0`

## Animation Effects

### Gradient Background

Matches SimpleAiChat's gradient animation:
- Uses the same gradient colors and animation timing
- 6-8 second animation cycle
- Smooth color transitions

### Hover Effects

- **Scale**: `hover:scale-105` on individual buttons
- **Color Transitions**: Brightens text and background colors
- **Shadow**: Platform-specific glow effects
- **Container**: Expands width and adds iridescent shadow

## Browser Compatibility

- Opens links in new tabs using `window.open(url, '_blank', 'noopener,noreferrer')`
- Handles URL encoding automatically
- Works with modern browsers that support ES6+

## Testing

A test page is available at `/tests/platform-selector` that demonstrates:
- Component positioning and styling
- Responsive behavior
- Platform button functionality
- Integration with SimpleAiChat
- Scrolling behavior with fixed positioning

## File Structure

```
frontend/
├── components/
│   └── research/
│       ├── AiPlatformSelector.vue     # Main component
│       ├── AiPlatformSelector.md      # This documentation
│       └── SimpleAiChat.vue           # Companion component
├── pages/
│   ├── prompts/
│   │   └── [promptSlug].vue           # Integration example
│   └── tests/
│       └── platform-selector.vue     # Test page
```

## Dependencies

- **Vue 3**: Composition API with `<script setup>`
- **Tailwind CSS**: For styling and responsive design
- **Nuxt 3**: For auto-imports and routing

## Security Considerations

- Uses `encodeURIComponent()` to safely encode prompt text
- Opens links with `noopener,noreferrer` for security
- No direct data transmission to external services
- Relies on browser's built-in URL handling

## Accessibility

- Proper `title` attributes for button tooltips
- Semantic button elements
- Keyboard navigation support
- Screen reader friendly structure

## Performance

- Lightweight component with minimal JavaScript
- CSS animations use GPU acceleration
- No external API calls or dependencies
- Lazy-loaded with Nuxt's auto-import system
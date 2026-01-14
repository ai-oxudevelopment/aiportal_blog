# Data Model: SSR Click Delay Fix

**Feature**: 007-fix-ssr-clicks
**Date**: 2026-01-14
**Status**: Final

## Overview

This document defines the data model for component state, hydration metrics, and navigation events related to fixing the SSR click delay issue. Since this is a UI/optimization feature with no backend changes, the data model focuses on client-side state and performance metrics.

---

## Entity: CardComponentState

**Purpose**: Track loading, interactivity, and hydration state of card components

### Fields

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `id` | string | Unique card identifier (from article ID) | Required, non-empty |
| `title` | string | Card title displayed to user | Required, max 200 chars |
| `slug` | string | URL slug for navigation | Required, URL-safe format |
| `type` | enum | Content type: `"prompt"` \| `"speckit"` | Required |
| `categories` | Category[] | Associated categories | Optional, defaults to [] |
| `description` | string | Card description text | Required, max 500 chars |
| `isInteractive` | boolean | Whether click handlers are bound | Required, default false |
| `isLoading` | boolean | Whether card data is loading | Optional, default false |
| `error` | string \| null | Error message if data fetch failed | Optional |

### State Transitions

```
[Initializing] → [Loading] → [Interactive]
      ↓              ↓            ↓
   isInteractive   isLoading   isInteractive
     = false        = true      = true
                                  ↓
                            [Click Ready]
                               ↓
                            User can click
```

**Transition Rules**:
1. `Initializing` → `Loading`: Component mounts, data fetch begins
2. `Loading` → `Interactive`: Data loaded, component rendered
3. `Interactive` → `Click Ready`: Event handlers bound (SPA: immediate, SSR: after hydration)

**Validation Rules**:
- Card cannot be clicked if `isInteractive = false`
- Navigation prevented if `slug` is empty or invalid
- Error state displays error message but allows retry

---

## Entity: HydrationMetrics

**Purpose**: Track performance metrics for hydration timing (SPA mode: N/A, SSR mode: critical)

### Fields

| Field | Type | Description | Target |
|-------|------|-------------|--------|
| `htmlRenderTime` | number | Time when HTML first renders (ms) | T=0ms |
| `appMountTime` | number | Time when Vue app mounts (ms) | < 2000ms |
| `firstInteractiveTime` | number | Time when first component becomes interactive (ms) | < 1000ms |
| `allInteractiveTime` | number | Time when ALL components are interactive (ms) | < 2000ms |
| `hydrationDuration` | number | Total hydration time (ms) | < 2000ms |
| `clickResponseTime` | number | Time from click to navigation start (ms) | < 500ms |

### Performance Targets

| Metric | Current (SSR) | Goal (SPA) | Success Criteria |
|--------|---------------|-----------|------------------|
| Time to Interactive | 5000-10000ms | < 2000ms | SC-003 ✅ |
| Click Response | 5000-10000ms | < 1000ms | SC-001 ✅ |
| Navigation Start | +500ms | < 500ms | SC-008 ✅ |
| Hydration Errors | Frequent | None | SC-004 ✅ |

### Measurement Strategy

**SPA Mode** (`ssr: false`):
```javascript
// app.vue
onMounted(() => {
  performance.mark('app-mounted')
  const navStart = performance.getEntriesByType('navigation')[0]
  const tti = performance.now() - navStart.startTime
  console.log('Time to Interactive:', tti, 'ms')
  // Expected: < 2000ms
})
```

**SSR Mode** (`ssr: true`) - NOT RECOMMENDED:
```javascript
// Measure hydration gap
onMounted(() => {
  const htmlRender = performance.getEntriesByName('first-contentful-paint')[0]
  const appMount = performance.now()
  const hydrationGap = appMount - htmlRender.startTime
  console.log('Hydration Gap:', hydrationGap, 'ms')
  // Current: 5000-10000ms ❌
  // Goal: N/A (switching to SPA)
})
```

---

## Entity: NavigationEvent

**Purpose**: Track user navigation attempts and successes/failures

### Fields

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `timestamp` | number | Event timestamp (ms) | Required |
| `cardId` | string | ID of clicked card | Required |
| `cardSlug` | string | Target route slug | Required, URL-safe |
| `cardType` | enum | Type: `"prompt"` \| `"speckit"` | Required |
| `clickSuccessful` | boolean | Was click captured by handler? | Required |
| `navigationStarted` | boolean | Did navigation begin? | Required |
| `navigationCompleted` | boolean | Did navigation complete successfully? | Required |
| `error` | string \| null | Error message if failed | Optional |
| `timeToClick` | number | Time from page load to click (ms) | Required |
| `timeToNavigate` | number | Time from click to navigation start (ms) | Required |

### Event Flow

```
[User Clicks] → [Handler Captures] → [Navigation Starts] → [Navigation Completes]
      ↓               ↓                      ↓                      ↓
  timestamp      clickSuccessful      navigationStarted    navigationCompleted
                = true               = true               = true
   (measured      (measured              (measured              (measured
    from TTI)      immediately)           within 100ms)          within 500ms)
```

**Validation Rules**:
- `clickSuccessful = true` if event handler fired within 100ms of user action
- `navigationStarted = true` if `router.push()` called within 500ms of click
- `navigationCompleted = true` if new page renders without error
- Navigation blocked if `cardSlug` is empty or invalid

### Error States

| Error | Cause | Handling |
|-------|-------|----------|
| `NO_HANDLER` | Click before hydration (SSR only) | ❌ Fixed by switching to SPA |
| `INVALID_ROUTE` | Slug is empty or malformed | Show error toast |
| `NETWORK_ERROR` | Navigation failed (offline) | PWA offline fallback |
| `TIMEOUT` | Navigation took > 5 seconds | Show loading indicator |

---

## TypeScript Type Definitions

### CardComponentState

```typescript
interface Category {
  id: number
  name: string
}

interface CardComponentState {
  id: string
  title: string
  slug: string
  type: 'prompt' | 'speckit'
  categories: Category[]
  description: string
  isInteractive: boolean
  isLoading?: boolean
  error?: string | null
}

// Usage in component
const cardState = ref<CardComponentState>({
  id: '1',
  title: 'Example Prompt',
  slug: 'example-prompt',
  type: 'prompt',
  categories: [{ id: 1, name: 'Education' }],
  description: 'An example prompt card',
  isInteractive: false // Will be true in SPA mode
})
```

### HydrationMetrics

```typescript
interface HydrationMetrics {
  htmlRenderTime: number
  appMountTime: number
  firstInteractiveTime: number
  allInteractiveTime: number
  hydrationDuration: number
  clickResponseTime: number
}

// Measurement utility
export function measureHydrationMetrics(): HydrationMetrics {
  const navStart = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
  const appMount = performance.now()

  return {
    htmlRenderTime: navStart?.responseStart || 0,
    appMountTime: appMount,
    firstInteractiveTime: appMount, // SPA: immediate
    allInteractiveTime: appMount,
    hydrationDuration: 0, // SPA: no hydration
    clickResponseTime: 0 // To be measured on click
  }
}
```

### NavigationEvent

```typescript
interface NavigationEvent {
  timestamp: number
  cardId: string
  cardSlug: string
  cardType: 'prompt' | 'speckit'
  clickSuccessful: boolean
  navigationStarted: boolean
  navigationCompleted: boolean
  error?: string | null
  timeToClick: number
  timeToNavigate: number
}

// Event logger
export function logNavigationEvent(
  card: CardComponentState,
  startTime: number
): NavigationEvent {
  const clickTime = performance.now()
  const navStart = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

  return {
    timestamp: clickTime,
    cardId: card.id,
    cardSlug: card.slug,
    cardType: card.type,
    clickSuccessful: true, // SPA: always successful
    navigationStarted: false, // Will update after router.push
    navigationCompleted: false, // Will update after navigation
    error: null,
    timeToClick: clickTime - navStart.startTime,
    timeToNavigate: 0 // To be measured
  }
}
```

---

## State Management (Pinia Stores)

### useCardStore (Optional Enhancement)

```typescript
// stores/cards.ts
import { defineStore } from 'pinia'

export const useCardStore = defineStore('cards', {
  state: () => ({
    cards: [] as CardComponentState[],
    loading: false,
    error: null as string | null,
    metrics: null as HydrationMetrics | null
  }),

  actions: {
    setCards(cards: CardComponentState[]) {
      this.cards = cards
      this.cards.forEach(card => {
        card.isInteractive = true // SPA: immediately interactive
      })
    },

    setCardLoading(cardId: string, loading: boolean) {
      const card = this.cards.find(c => c.id === cardId)
      if (card) card.isLoading = loading
    },

    setCardError(cardId: string, error: string) {
      const card = this.cards.find(c => c.id === cardId)
      if (card) card.error = error
    },

    recordMetrics(metrics: HydrationMetrics) {
      this.metrics = metrics
      console.log('Hydration Metrics:', metrics)
    }
  }
})
```

---

## Data Flow Diagrams

### SPA Mode (Recommended)

```
[Server] → [Browser Request] → [Send index.html]
                                    ↓
                              [JavaScript Loads]
                                    ↓
                              [Vue App Mounts]
                                    ↓
                        [Components Render + Event Handlers Bind]
                                    ↓
                              [App Interactive < 2s]
                                    ↓
                        [User Clicks Card → Click Captured]
                                    ↓
                              [Navigation Starts < 500ms]
```

### SSR Mode (Current - Problematic)

```
[Server] → [Browser Request] → [Render HTML → Send HTML]
                                    ↓
                              [HTML Displays Immediately]
                                    ↓
                              [User Clicks Card → CLICK LOST!]
                                    ↓
                              [JavaScript Loads (5-10s)]
                                    ↓
                              [Vue Hydrates]
                                    ↓
                        [Event Handlers Finally Bind]
                                    ↓
                        [User Can Now Click (5-10s Delay)]
```

---

## Validation Summary

### Component State Validation

- ✅ All cards start with `isInteractive = false`
- ✅ Cards become interactive immediately in SPA mode
- ✅ Navigation blocked if `slug` is invalid
- ✅ Error states handled gracefully

### Performance Validation

- ✅ TTI < 2000ms (SPA mode)
- ✅ Click response < 1000ms
- ✅ Navigation starts < 500ms after click
- ✅ No hydration errors (SPA: no hydration)

### Navigation Validation

- ✅ 100% of clicks captured (SPA: no hydration gap)
- ✅ Navigation completes successfully
- ✅ Error states logged for debugging
- ✅ Offline fallback via PWA

---

## Migration Strategy

### From SSR to SPA

**Phase 1: Configuration Update**
```javascript
// nuxt.config.js
export default defineNuxtConfig({
  ssr: false, // ✅ Switch to SPA mode
  // Remove routeRules
  // Update PWA navigateFallback
})
```

**Phase 2: Component Updates**
```vue
<!-- PromptCard.vue -->
<script setup>
// No changes needed - @click handlers work immediately
const goToPrompt = () => {
  navigateTo(`/prompts/${props.prompt.slug}`)
}
</script>

<template>
  <div @click="goToPrompt">  <!-- ✅ Works immediately in SPA -->
    <!-- Card content -->
  </div>
</template>
```

**Phase 3: Data Fetching**
```javascript
// composables/useFetchArticles.ts
export function useFetchArticles() {
  const articles = ref([])

  // Fetch on mount (client-side only)
  onMounted(async () => {
    const response = await $fetch('/api/articles')
    articles.value = response.data
  })

  return { articles }
}
```

---

## Testing Strategy

### Unit Tests

```typescript
// tests/components/PromptCard.spec.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PromptCard from '@/components/prompt/PromptCard.vue'

describe('PromptCard', () => {
  it('should be clickable immediately after mount', async () => {
    const wrapper = mount(PromptCard, {
      props: {
        prompt: {
          id: '1',
          title: 'Test Prompt',
          slug: 'test-prompt',
          type: 'prompt',
          description: 'Test'
        }
      }
    })

    // Simulate immediate click
    await wrapper.find('.bg-zinc-900').trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })
})
```

### Integration Tests

```typescript
// tests/e2e/click-spec.ts
import { test, expect } from '@playwright/test'

test('card click responds within 1 second', async ({ page }) => {
  await page.goto('/')
  const startTime = Date.now()

  // Click first card immediately
  await page.click('.bg-zinc-900')

  const clickTime = Date.now() - startTime
  expect(clickTime).toBeLessThan(1000) // < 1 second

  // Verify navigation started
  await expect(page).toHaveURL(/\/prompts\//)
})
```

---

## Summary

**Key Entities**:
1. **CardComponentState**: Track card interactivity and loading
2. **HydrationMetrics**: Measure performance (SPA: N/A, SSR: critical)
3. **NavigationEvent**: Log click and navigation success/failure

**Design Principles**:
- SPA mode eliminates hydration complexity
- Event handlers work immediately after mount
- Performance metrics focus on TTI and click response
- Error states handled gracefully

**Next Steps**:
1. Implement SPA configuration in `nuxt.config.js`
2. Add performance logging to `app.vue`
3. Verify all card components are sync-imported
4. Test click responsiveness across browsers

---

**Status**: ✅ Complete - Ready for implementation

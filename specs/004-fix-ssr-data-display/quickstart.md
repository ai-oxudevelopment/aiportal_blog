# Quickstart: SSR Data Display Fix

**Feature**: 004-fix-ssr-data-display
**Date**: 2026-01-09

## Overview

This quickstart guide helps you fix SSR data display issues in your Nuxt 3 application. The core problem: **data processing in `onMounted` doesn't work with SSR**.

---

## The Problem in 30 Seconds

### What's Broken

```vue
<script setup>
// ❌ This causes blank pages with SSR!
const { data: prompts } = await useAsyncData('articles', fetchArticles)

const categories = ref([])  // Empty during SSR!

onMounted(() => {
  // This only runs on CLIENT, after SSR is done
  categories.value = extractCategories(prompts.value)
})
</script>

<template>
  <!-- categories is EMPTY during SSR, so this is hidden! -->
  <aside v-if="categories.length > 0">
    <CategoriesFilter :categories="categories" />
  </aside>
</template>
```

**Result**: Server renders HTML with empty `categories` → template hides content → **blank page**

---

## The Fix in 30 Seconds

### Move Logic to Computed Properties

```vue
<script setup>
// ✅ This works with SSR!
const { data: prompts } = await useAsyncData('articles', fetchArticles)

// Computed runs on BOTH server AND client
const categories = computed(() => {
  if (!prompts.value) return []

  const uniqueCategories = new Map()
  prompts.value.forEach((prompt) => {
    prompt.categories?.forEach((cat) => {
      uniqueCategories.set(cat.id, cat)
    })
  })
  return Array.from(uniqueCategories.values())
})
</script>

<template>
  <!-- categories populated during SSR -->
  <aside v-if="categories.length > 0">
    <CategoriesFilter :categories="categories" />
  </aside>
</template>
```

**Result**: Server renders HTML with `categories` populated → **content displays**

---

## Implementation Checklist

### Phase 1: Fix List Pages (Home, Speckits)

- [ ] **Step 1**: Open `pages/index.vue` or `pages/speckits/index.vue`
- [ ] **Step 2**: Find data processing in `onMounted` hook
- [ ] **Step 3**: Move to `computed` property
- [ ] **Step 4**: Test with SSR enabled

### Phase 2: Fix Detail Pages

- [ ] **Step 1**: Open `pages/speckits/[speckitSlug].vue`
- [ ] **Step 2**: Replace `useFetchOneSpeckit` composable with `useAsyncData`
- [ ] **Step 3**: Remove `onMounted` logic (if any)
- [ ] **Step 4**: Test with SSR enabled

### Phase 3: Validate

- [ ] **Step 1**: Check page source HTML contains content
- [ ] **Step 2**: Verify no console errors
- [ ] **Step 3**: Test direct URL access (not just navigation)

---

## Code Templates

### Template 1: List Page with Categories

**File**: `pages/index.vue` or `pages/speckits/index.vue`

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Article, Category } from '~/types/article'

// State
const searchQuery = ref('')
const selectedCategories = ref<number[]>([])

// ✅ SSR-compatible data fetching
const { data: articles, pending: loading, error } = await useAsyncData(
  'articles-home',
  async () => {
    const response = await $fetch('/api/articles') as any
    return response.data || []
  }
)

// ✅ Extract categories in computed (works on server AND client)
const categories = computed(() => {
  if (!articles.value) return []

  const uniqueCategories = new Map<number, Category>()
  articles.value.forEach((article: Article) => {
    article.categories?.forEach((cat: Category) => {
      uniqueCategories.set(cat.id, cat)
    })
  })
  return Array.from(uniqueCategories.values())
})

// ✅ Filter articles reactively
const filteredArticles = computed(() => {
  let filtered = articles.value || []

  if (selectedCategories.value.length > 0) {
    filtered = filtered.filter(article =>
      article.categories?.some(cat =>
        selectedCategories.value.includes(cat.id)
      )
    )
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(article =>
      article.title.toLowerCase().includes(query) ||
      article.description?.toLowerCase().includes(query)
    )
  }

  return filtered
})

// Methods
const updateSelectedCategories = (newCategories: number[]) => {
  selectedCategories.value = newCategories
}
</script>

<template>
  <div class="min-h-screen bg-black text-gray-100 pt-16">
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Search -->
      <PromptSearch v-model="searchQuery" />

      <!-- Categories (desktop) -->
      <aside v-if="categories.length > 0" class="hidden lg:block">
        <CategoriesFilter
          :categories="categories"
          :selected-categories="selectedCategories"
          @update:selected-categories="updateSelectedCategories"
        />
      </aside>

      <!-- Articles grid -->
      <PromptGrid
        :prompts="filteredArticles"
        :loading="loading"
      />
    </div>
  </div>
</template>
```

---

### Template 2: Detail Page with useAsyncData

**File**: `pages/speckits/[speckitSlug].vue`

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

const route = useRoute()
const speckitSlug = computed(() => route.params.speckitSlug as string)

// ✅ SSR-compatible data fetching (replaces useFetchOneSpeckit composable)
const { data: speckit, pending: loading, error } = await useAsyncData(
  `speckit-${speckitSlug.value}`,
  async () => {
    const response = await $fetch(`/api/speckits/${speckitSlug.value}`) as any
    return response.data
  }
)

// Client-only state (doesn't affect SSR)
const downloadLoading = ref(false)
const downloadError = ref<string | null>(null)

// Computed
const wgetCommand = computed(() => {
  if (!speckit.value?.slug) return ''
  return `wget https://portal.aiworkplace.ru/speckits/${speckit.value.slug}/download`
})

// Methods
const handleDirectDownload = async () => {
  if (!speckit.value?.file || downloadLoading.value) return

  downloadLoading.value = true
  downloadError.value = null

  try {
    const fileUrl = speckit.value.file.url.startsWith('http')
      ? speckit.value.file.url
      : `${process.env.STRAPI_URL}${speckit.value.file.url}`

    await downloadFileFromUrl(fileUrl, speckit.value.file.name)
  } catch (err: any) {
    downloadError.value = err.message || 'Download failed'
  } finally {
    downloadLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-black text-gray-100 pt-16">
    <!-- 404 State -->
    <div v-if="error && error.statusCode === 404">
      <h1>Speckit не найден</h1>
      <NuxtLink to="/speckits">← Вернуться к каталогу</NuxtLink>
    </div>

    <!-- Loading State -->
    <div v-else-if="loading">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      <p>Загрузка...</p>
    </div>

    <!-- Content -->
    <div v-else-if="speckit">
      <h1>{{ speckit.title }}</h1>

      <!-- Categories -->
      <div v-for="category in speckit.categories" :key="category.id">
        {{ category.name }}
      </div>

      <!-- Body -->
      <pre>{{ speckit.body }}</pre>

      <!-- Download button (client-only interaction) -->
      <button
        @click="handleDirectDownload"
        :disabled="downloadLoading"
      >
        Скачать
      </button>
    </div>
  </div>
</template>
```

---

## Common Pitfalls

### Pitfall 1: Using `onMounted` for Data

```vue
<script setup>
// ❌ WRONG: onMounted doesn't run on server
const data = ref([])
onMounted(async () => {
  data.value = await fetchData()
})
</script>
```

**Fix**: Use `useAsyncData` instead

```vue
<script setup>
// ✅ CORRECT: useAsyncData runs on server AND client
const { data } = await useAsyncData('key', fetchData)
</script>
```

---

### Pitfall 2: Non-Serializable Composables

```ts
// ❌ WRONG: Custom composable not SSR-aware
export function useFetchData() {
  const data = ref(null)
  const loading = ref(true)

  fetchData().then(result => {
    data.value = result
    loading.value = false
  })

  return { data, loading }
}
```

**Fix**: Use `useAsyncData` in component

```vue
<script setup>
// ✅ CORRECT: useAsyncData handles SSR
const { data, pending } = await useAsyncData('key', fetchData)
</script>
```

---

### Pitfall 3: Conditional Rendering with Empty Data

```vue
<template>
  <!-- ❌ WRONG: Hides content if categories is empty during SSR -->
  <div v-if="categories.length > 0">
    <CategoriesFilter :categories="categories" />
  </div>
</template>
```

**Fix**: Ensure categories populated during SSR

```vue
<script setup>
// ✅ CORRECT: Categories computed from data available during SSR
const categories = computed(() => {
  if (!articles.value) return []
  // Extract categories...
  return extractedCategories
})
</script>

<template>
  <!-- Now categories populated during SSR -->
  <div v-if="categories.length > 0">
    <CategoriesFilter :categories="categories" />
  </div>
</template>
```

---

## Testing Checklist

### Manual Testing

- [ ] **Start SSR server**: `cd frontend && npm run dev`
- [ ] **Visit home page**: `http://localhost:3000/`
  - [ ] Articles display?
  - [ ] Categories sidebar shows?
  - [ ] No blank screen?
- [ ] **Visit speckits page**: `http://localhost:3000/speckits`
  - [ ] Speckits display?
  - [ ] Categories sidebar shows?
- [ ] **Visit detail page**: `http://localhost:3000/speckits/spec-1`
  - [ ] Content displays?
  - [ ] Download button works?
- [ ] **Check console** (F12 → Console tab)
  - [ ] No errors?
  - [ ] No hydration warnings?
- [ ] **Check page source** (Ctrl+U / Cmd+U)
  - [ ] HTML contains actual content?
  - [ ] Not just loading spinners?

---

## Verification Commands

```bash
# Check if SSR is rendering content
curl -s http://localhost:3000/ | grep -o "<title>.*</title>"

# Should output: <title>AI PORTAL | библиотека полезных инструментов</title>
# NOT: <title>Loading...</title> or blank
```

---

## Debugging Tips

### Tip 1: Add Console Logging

```vue
<script setup>
const { data } = await useAsyncData('test', async () => {
  console.log('[SSR] Fetching data...')
  const result = await fetchData()
  console.log('[SSR] Data fetched:', result)
  return result
})

console.log('[SSR] Data value:', data.value)
</script>
```

**Check server console** (where `npm run dev` is running):
- Should see `[SSR]` logs during page load

**Check browser console**:
- Should NOT see duplicate `[SSR]` logs (indicates double fetch)

---

### Tip 2: Check HTML Source

```bash
# View rendered HTML
curl -s http://localhost:3000/ | less
```

**What to look for**:
- ✅ Actual article titles in HTML
- ✅ Category names
- ✅ Description text
- ❌ NOT "Loading..." text
- ❌ NOT empty `<div>` elements

---

### Tip 3: Use Vue DevTools

Install Vue DevTools browser extension:
- Check component state in "Data" tab
- Verify `data` is populated (not `null`/`undefined`)
- Look for hydration warnings

---

## Performance Tips

### Tip 1: Use Unique Keys for `useAsyncData`

```vue
<script setup>
// ✅ GOOD: Unique key per article
const { data: article1 } = await useAsyncData('article-1', () => fetchArticle(1))
const { data: article2 } = await useAsyncData('article-2', () => fetchArticle(2))

// ❌ BAD: Same key (causes cache collision)
const { data: article1 } = await useAsyncData('article', () => fetchArticle(1))
const { data: article2 } = await useAsyncData('article', () => fetchArticle(2))
</script>
```

### Tip 2: Lazy-Load Heavy Components

```vue
<template>
  <div>
    <!-- Main content loads immediately -->
    <ArticleContent :article="article" />

    <!-- Heavy diagram loads lazily -->
    <LazyMermaidDiagram v-if="article.diagram" :source="article.diagram" />
  </div>
</template>
```

---

## Rollback Plan

If SSR fix causes issues:

```bash
# Disable SSR (temporary rollback)
# In frontend/nuxt.config.js:
export default defineNuxtConfig({
  ssr: false  // Revert to SPA mode
})

# Restart server
cd frontend && npm run dev
```

**Note**: This is a temporary workaround. The goal is to fix SSR, not disable it.

---

## Next Steps

1. ✅ **Review code templates** above
2. ✅ **Apply fixes** to affected pages
3. ✅ **Test manually** using checklist
4. ✅ **Verify console** is error-free
5. ✅ **Deploy** and monitor

---

## Need Help?

**Resources**:
- Nuxt 3 SSR Guide: https://nuxt.com/docs/guide/concepts/rendering
- `useAsyncData` Docs: https://nuxt.com/docs/api/composables/use-async-data
- Research Document: `research.md` in this feature directory

**Key Files**:
- `pages/index.vue` - Home page fix
- `pages/speckits/index.vue` - Speckits list fix
- `pages/speckits/[speckitSlug].vue` - Detail page fix

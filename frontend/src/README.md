# Clean Architecture - Research Module (WP02)

This document describes the Research module implementation following Clean Architecture principles.

## Overview

The Research module is the first complete implementation of the new layered architecture. It serves as a template for migrating other modules (Speckits, Prompts, Blogs).

## Architecture Layers

### Domain Layer (`src/domain/`)

**Purpose**: Core business entities and interfaces, framework-independent.

```
src/domain/
├── entities/
│   └── ResearchSession.ts    # Research session, messages, platform types
├── repositories/
│   ├── IResearchRepository.ts  # Repository interface
│   └── index.ts
└── cache/
    └── ICacheProvider.ts
```

**Key Types**:
- `ResearchSession`: Represents an AI chat session
- `ResearchMessage`: Individual message in a session
- `ResearchPlatform`: 'openai' | 'claude' | 'perplexity'
- `SessionStatus`: 'active' | 'completed' | 'error'

### Infrastructure Layer (`src/infrastructure/`)

**Purpose**: Implements domain interfaces, handles external APIs and data access.

```
src/infrastructure/repositories/
├── StrapiResearchRepository.ts  # Strapi CMS implementation
└── index.ts                      # Factory function
```

**Key Classes**:
- `StrapiResearchRepository`: Implements `IResearchRepository` using Strapi CMS
- `createStrapiResearchRepository()`: Factory for creating repository instances

### Application Layer (`src/application/use-cases/research/`)

**Purpose**: Business logic orchestration, framework-agnostic use cases.

```
src/application/use-cases/research/
├── CreateResearchSession.ts   # Create new session use case
├── SubmitResearchQuery.ts     # Submit query to AI use case
├── AIClient.ts                # AI platform abstraction
└── index.ts
```

**Key Classes**:
- `CreateResearchSession`: Creates new AI research sessions with welcome messages
- `SubmitResearchQuery`: Orchestrates query → AI response → save flow
- `AIClient`: Abstraction for AI platform integrations (placeholder implementation)

### Presentation Layer (`src/presentation/composables/`)

**Purpose**: Adapts use cases for Vue 3, provides reactive state management.

```
src/presentation/composables/
├── useResearchChat.ts         # Vue 3 composable for research UI
└── index.ts
```

**Key Functions**:
- `useResearchChat(platform)`: Returns reactive state and actions for research chat

## Usage Example

```vue
<script setup lang="ts">
import { useResearchChat } from '@/presentation/composables/useResearchChat'

const {
  session,      // Ref<ResearchSession | null>
  isLoading,    // Ref<boolean>
  error,        // Ref<string | null>
  messages,     // ComputedRef<ResearchMessage[]>
  createSession,
  submitQuery,
  reset
} = useResearchChat('claude')

onMounted(() => {
  createSession()
})

const handleSend = async () => {
  await submitQuery('What is clean architecture?')
}
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <div v-for="msg in messages" :key="msg.id">
    {{ msg.role }}: {{ msg.content }}
  </div>
</template>
```

## Dependency Flow

```
┌─────────────────────────────────────────────────────────┐
│                   Presentation Layer                     │
│  (Vue Components → useResearchChat Composable)          │
└──────────────────────┬──────────────────────────────────┘
                       │ depends on
                       ▼
┌─────────────────────────────────────────────────────────┐
│                   Application Layer                      │
│  (CreateResearchSession, SubmitResearchQuery)           │
└──────────────────────┬──────────────────────────────────┘
                       │ depends on
                       ▼
┌─────────────────────────────────────────────────────────┐
│                      Domain Layer                        │
│  (IResearchRepository, ResearchSession entities)        │
└──────────────────────┬──────────────────────────────────┘
                       │ implemented by
                       ▼
┌─────────────────────────────────────────────────────────┐
│                 Infrastructure Layer                     │
│  (StrapiResearchRepository, PlaceholderAIClient)         │
└─────────────────────────────────────────────────────────┘
```

## Testing Strategy

### Domain Layer
- Pure TypeScript, no framework dependencies
- Test entities and interfaces with Jest/Vitest

### Application Layer
- Use cases are framework-agnostic
- Mock repository and AI client interfaces
- Test business logic in isolation

### Infrastructure Layer
- Test Strapi API integration with fetch mocks
- Validate request/response transformations

### Presentation Layer
- Test Vue composables with @vue/test-utils
- Mock use case dependencies

## Migration Status

| Component | Status | Notes |
|-----------|--------|-------|
| Domain entities | ✅ Complete | ResearchSession, ResearchMessage |
| Repository interface | ✅ Complete | IResearchRepository |
| Repository implementation | ✅ Complete | StrapiResearchRepository |
| CreateResearchSession | ✅ Complete | With welcome messages |
| SubmitResearchQuery | ✅ Complete | With AI client abstraction |
| useResearchChat | ✅ Complete | Vue 3 composable |
| Research pages | ✅ Complete | index.vue, [searchId].vue |

## Next Steps

For future work packages:
1. Implement actual AI client (replace `PlaceholderAIClient`)
2. Add error recovery mechanisms
3. Implement session persistence
4. Add streaming responses
5. Create reusable components for chat UI

## References

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design by Eric Evans](https://www.domainlanguage.com/ddd/)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)

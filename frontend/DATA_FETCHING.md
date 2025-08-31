# Data Fetching Implementation

This document describes the data fetching strategies implemented for the Next.js frontend with Strapi CMS integration.

## Overview

The implementation provides multiple data fetching strategies:

- **Server-Side Rendering (SSR)**: Data fetched on the server for each request
- **Static Site Generation (SSG)**: Data fetched at build time for static pages
- **Client-Side Data Fetching**: Data fetched in the browser using React hooks
- **Incremental Static Regeneration (ISR)**: Static pages with periodic updates

## Architecture

### Server-Side API (`src/lib/server-api.ts`)

Server-side utilities for SSR and SSG data fetching:

```typescript
// Server-side functions with proper error handling
export const getServerArticles = async (params?: any): Promise<Article[]>
export const getServerArticleBySlug = async (slug: string): Promise<Article | null>
export const getServerCategories = async (params?: any): Promise<Category[]>
// ... more functions
```

**Key Features:**
- Uses `cache: 'no-store'` for fresh data
- Comprehensive error handling
- Proper TypeScript types
- Support for all Strapi query parameters

### Client-Side Hooks (`src/lib/hooks.ts`)

React hooks for client-side data fetching:

```typescript
// Basic hooks
export const useArticles = (params?: any)
export const useArticle = (id: string | number, params?: any)
export const useArticleBySlug = (slug: string, params?: any)

// Specialized hooks
export const usePaginatedArticles = (page: number, pageSize: number)
export const useFeaturedArticles = (limit: number)
export const useRecentArticles = (limit: number)
export const useArticlesByCategory = (categorySlug: string)
export const useSearchArticles = (query: string)
```

**Key Features:**
- Loading states management
- Error handling with retry functionality
- Automatic dependency tracking
- Optimized re-renders

### UI Components

#### Loading and Error States

- **LoadingSpinner**: Animated loading indicator
- **ErrorMessage**: Error display with retry button
- **DataWrapper**: Generic wrapper for loading/error/data states

#### Data Display Components

- **ArticlesList**: Client-side article list with hooks
- **SearchArticles**: Search functionality with real-time results

## Data Fetching Patterns

### 1. Server-Side Rendering (SSR)

Used for pages that need fresh data on each request:

```typescript
// src/app/home/page.tsx
export default async function HomePage() {
  const articles = await getServerArticles({
    pagination: { limit: 6 },
    sort: ['createdAt:desc'],
  });
  
  return (
    <div>
      {articles.map(article => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
```

### 2. Static Site Generation (SSG)

Used for pages that can be pre-rendered at build time:

```typescript
// src/app/articles/[slug]/page.tsx
export async function generateStaticParams() {
  const articles = await getServerArticles({ pagination: { limit: 100 } });
  return articles.map(article => ({ slug: article.attributes.slug }));
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getServerArticleBySlug(params.slug);
  // ... render article
}
```

### 3. Client-Side Data Fetching

Used for interactive components and dynamic content:

```typescript
// Using hooks in components
function ArticlesList() {
  const { data: articles, loading, error, refetch } = useArticles();
  
  return (
    <DataWrapper data={articles} loading={loading} error={error} onRetry={refetch}>
      {(articles) => (
        <div>
          {articles.map(article => <ArticleCard key={article.id} article={article} />)}
        </div>
      )}
    </DataWrapper>
  );
}
```

### 4. Search Functionality

Client-side search with debounced queries:

```typescript
function SearchComponent() {
  const [query, setQuery] = useState('');
  const { data: results, loading } = useSearchArticles(query);
  
  return (
    <div>
      <input onChange={(e) => setQuery(e.target.value)} />
      {loading ? <LoadingSpinner /> : <SearchResults results={results} />}
    </div>
  );
}
```

## Error Handling

### Server-Side Error Handling

```typescript
export const getServerArticles = async (params?: any): Promise<Article[]> => {
  try {
    // ... fetch logic
    return response.data || [];
  } catch (error) {
    console.error('Error fetching articles on server:', error);
    return []; // Return empty array instead of throwing
  }
};
```

### Client-Side Error Handling

```typescript
function useDataFetching<T>(fetchFunction: () => Promise<T>) {
  const [error, setError] = useState<string | null>(null);
  
  const fetchData = async () => {
    try {
      setError(null);
      const result = await fetchFunction();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };
  
  return { data, loading, error, refetch: fetchData };
}
```

## Performance Optimizations

### 1. Caching Strategies

- **SSR**: No caching for fresh data
- **SSG**: Build-time caching with `generateStaticParams`
- **Client-side**: React Query-like caching with dependency arrays

### 2. Image Optimization

```typescript
// Server-side image URLs
export const getServerImageUrl = (image: any, format: string = 'medium'): string => {
  if (!image?.data?.attributes) return '';
  
  const { url, formats } = image.data.attributes;
  
  if (formats && formats[format]) {
    return `${STRAPI_URL}${formats[format].url}`;
  }
  
  return `${STRAPI_URL}${url}`;
};
```

### 3. Pagination

```typescript
export const usePaginatedArticles = (page: number = 1, pageSize: number = 10) => {
  const paginationParams = {
    pagination: { page, pageSize },
  };
  
  return useDataFetching(
    () => getArticles(paginationParams),
    [page, pageSize]
  );
};
```

## SEO and Metadata

### Dynamic Metadata Generation

```typescript
export async function generateMetadata({ params }: ArticlePageProps) {
  const article = await getServerArticleBySlug(params.slug);
  
  return {
    title: article?.attributes.seo?.metaTitle || article?.attributes.title,
    description: article?.attributes.seo?.metaDescription || article?.attributes.excerpt,
    openGraph: {
      title: article?.attributes.title,
      description: article?.attributes.excerpt,
      images: article?.attributes.featuredImage ? [getServerImageUrl(article.attributes.featuredImage)] : [],
    },
  };
}
```

## Testing

### Test Pages

- `/home` - SSR example with latest articles
- `/articles/[slug]` - SSG example with dynamic routes
- `/search` - Client-side search functionality
- `/test-strapi` - SDK connection test

### Error Scenarios

- Network failures
- Invalid API responses
- Missing content
- Authentication errors

## Best Practices

### 1. Choose the Right Strategy

- **SSR**: For frequently updated content
- **SSG**: For static content with known URLs
- **Client-side**: For interactive features and search

### 2. Error Boundaries

Always wrap data fetching in error boundaries:

```typescript
<DataWrapper data={data} loading={loading} error={error} onRetry={refetch}>
  {(data) => <YourComponent data={data} />}
</DataWrapper>
```

### 3. Loading States

Provide meaningful loading states:

```typescript
{loading ? (
  <LoadingSpinner size="lg" className="py-8" />
) : (
  <YourContent />
)}
```

### 4. Type Safety

Use TypeScript interfaces for all data:

```typescript
interface Article {
  id: number;
  attributes: {
    title: string;
    content: string;
    // ... other fields
  };
}
```

## Next Steps

1. **Implement ISR**: Add revalidation for static pages
2. **Add Caching**: Implement Redis or similar for server-side caching
3. **Optimize Images**: Add Next.js Image component integration
4. **Add Analytics**: Track data fetching performance
5. **Implement Offline Support**: Add service worker for offline functionality

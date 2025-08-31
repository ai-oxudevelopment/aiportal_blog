# Strapi SDK Integration

This document describes the Strapi SDK integration for the Next.js frontend.

## Overview

The frontend is configured to connect to a Strapi CMS backend running on `http://localhost:1337`. The integration includes:

- Strapi client configuration
- TypeScript types for all content types
- API utility functions
- Test component for verification

## Files Structure

```
src/
├── lib/
│   ├── strapi.ts          # Strapi client configuration
│   ├── types.ts           # TypeScript type definitions
│   └── api.ts             # API utility functions
├── components/
│   └── StrapiTest.tsx     # Test component
└── app/
    └── test-strapi/
        └── page.tsx        # Test page
```

## Configuration

### Environment Variables

Create a `.env.local` file in the frontend directory:

```env
# Strapi API Configuration
NEXT_PUBLIC_STRAPI_API_URL=http://localhost:1337
NEXT_PUBLIC_STRAPI_API_TOKEN=your-api-token-here
NEXT_PUBLIC_STRAPI_PUBLISHED_STATE=published

# Development settings
NODE_ENV=development
```

### API Token Setup

1. Start the Strapi backend: `cd backend && npm run dev`
2. Access Strapi admin: `http://localhost:1337/admin`
3. Create an API token in Settings → API Tokens
4. Copy the token to `.env.local`

## Usage

### Basic Data Fetching

```typescript
import { getArticles, getCategories } from '@/lib/api';

// Fetch articles
const articles = await getArticles({ 
  pagination: { limit: 10 },
  sort: ['createdAt:desc']
});

// Fetch categories
const categories = await getCategories();
```

### Fetching Single Items

```typescript
import { getArticleBySlug, getCategoryBySlug } from '@/lib/api';

// Fetch article by slug
const article = await getArticleBySlug('my-article-slug');

// Fetch category by slug
const category = await getCategoryBySlug('technology');
```

### Search Functionality

```typescript
import { searchArticles } from '@/lib/api';

// Search articles
const results = await searchArticles('artificial intelligence');
```

### Image Handling

```typescript
import { getImageUrl } from '@/lib/api';

// Get image URL with format
const imageUrl = getImageUrl(article.attributes.featuredImage, 'medium');
```

## Content Types

The integration supports the following content types:

- **Articles**: Blog posts with title, content, excerpt, featured image, author, categories, tags, and SEO metadata
- **Categories**: Content categories with name, description, and related articles
- **Sections**: Content sections for organizing articles
- **Collections**: Curated collections of articles
- **Authors**: Article authors with bio and avatar
- **Tags**: Article tags for categorization

## Testing

Visit `http://localhost:3000/test-strapi` to test the Strapi SDK integration.

The test page will:
- Attempt to connect to the Strapi backend
- Fetch sample articles and categories
- Display connection status and results
- Show helpful error messages if connection fails

## Error Handling

The SDK includes comprehensive error handling:

- Network errors are caught and logged
- Invalid responses are handled gracefully
- User-friendly error messages are displayed
- Console logging for debugging

## Next Steps

1. **Configure API Token**: Set up the API token in `.env.local`
2. **Create Content Types**: Ensure all content types exist in Strapi
3. **Add Test Content**: Create sample articles and categories
4. **Implement Pages**: Use the API functions in your pages
5. **Add Error Boundaries**: Implement proper error handling in components

## Troubleshooting

### Connection Issues

- Ensure Strapi backend is running on port 1337
- Check that the API URL is correct in `.env.local`
- Verify the API token is valid and has proper permissions

### Type Errors

- Ensure all content types match the TypeScript definitions
- Update types if Strapi schema changes
- Check that required fields are populated

### Performance Issues

- Use pagination for large datasets
- Implement proper caching strategies
- Consider using ISR (Incremental Static Regeneration) for static content

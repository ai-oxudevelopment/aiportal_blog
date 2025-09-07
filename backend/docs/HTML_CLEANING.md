# HTML Cleaning for Articles

This document describes the HTML cleaning functionality implemented for article entities in the AI Portal Blog backend.

## Overview

The system automatically removes HTML tags from article content when articles are retrieved through the API. This ensures that frontend applications receive clean, plain text content without HTML markup.

## Implementation

### Utility Functions

The HTML cleaning functionality is implemented in `/src/utils/html-cleaner.js` with the following functions:

- `stripHtmlTags(html)` - Removes all HTML tags from text
- `cleanHtmlContent(html)` - Removes HTML tags and cleans up formatting
- `cleanArticleContent(article, mode)` - Cleans article content with different modes

### Cleaning Modes

- `full` - Complete HTML tag removal (default)
- `preview` - Clean content and truncate to 200 characters
- `meta` - Clean content and truncate to 150 characters

### Controller Integration

All article controller methods have been updated to automatically clean HTML content:

- `findOne()` - Single article retrieval
- `find()` - Multiple articles retrieval
- `create()` - Article creation
- `update()` - Article updates
- `findPrompts()` - Prompt articles only
- `findArticles()` - Regular articles only
- `incrementUsage()` - Usage count updates

## Usage

### Automatic Cleaning

HTML cleaning happens automatically when articles are retrieved through the API. No additional configuration is required.

### Manual Cleaning Script

To clean existing articles in the database, run:

```bash
npm run clean-html
```

This script will:
1. Find all articles with HTML content
2. Clean the HTML tags
3. Update the articles in the database
4. Provide a summary of the cleaning process

### Example API Response

**Before cleaning:**
```json
{
  "content": "<p>This is a <strong>sample</strong> article with <em>HTML</em> tags.</p>"
}
```

**After cleaning:**
```json
{
  "content": "This is a sample article with HTML tags."
}
```

## HTML Entity Handling

The cleaning process also handles common HTML entities:

- `&nbsp;` → space
- `&amp;` → &
- `&lt;` → <
- `&gt;` → >
- `&quot;` → "
- `&#39;` → '
- `&apos;` → '

## Performance Considerations

- HTML cleaning is performed in-memory during API responses
- The cleaning process is lightweight and fast
- No database queries are added for cleaning
- Original content is preserved in the database

## Testing

To test the HTML cleaning functionality:

1. Create an article with HTML content through the Strapi admin panel
2. Retrieve the article through the API
3. Verify that HTML tags are removed from the response

## Maintenance

The HTML cleaning utility can be extended to handle additional HTML entities or cleaning patterns as needed. The modular design allows for easy updates without affecting the core article functionality.

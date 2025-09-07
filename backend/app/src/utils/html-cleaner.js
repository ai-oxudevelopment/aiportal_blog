// backend/app/src/utils/html-cleaner.js

/**
 * Utility functions for cleaning HTML content
 */

/**
 * Remove HTML tags from text content
 * @param {string} html - HTML string to clean
 * @returns {string} - Clean text without HTML tags
 */
function stripHtmlTags(html) {
  if (!html || typeof html !== 'string') {
    return '';
  }
  
  // Remove HTML tags using regex
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Clean HTML content and preserve basic formatting
 * @param {string} html - HTML string to clean
 * @returns {string} - Clean text with basic formatting preserved
 */
function cleanHtmlContent(html) {
  if (!html || typeof html !== 'string') {
    return '';
  }
  
  // Replace common HTML entities
  let cleaned = html
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
  
  // Remove HTML tags
  cleaned = cleaned.replace(/<[^>]*>/g, '');
  
  // Clean up multiple spaces and newlines
  cleaned = cleaned
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();
  
  return cleaned;
}

/**
 * Clean article content for different use cases
 * @param {Object} article - Article object
 * @param {string} mode - Cleaning mode: 'full', 'preview', 'meta'
 * @returns {Object} - Article with cleaned content
 */
function cleanArticleContent(article, mode = 'full') {
  if (!article) {
    return article;
  }
  
  const cleanedArticle = { ...article };
  
  switch (mode) {
    case 'preview':
      // For previews, clean content and truncate
      if (cleanedArticle.content) {
        cleanedArticle.content = cleanHtmlContent(cleanedArticle.content);
        // Truncate to 200 characters for preview
        if (cleanedArticle.content.length > 200) {
          cleanedArticle.content = cleanedArticle.content.substring(0, 200) + '...';
        }
      }
      break;
      
    case 'meta':
      // For meta descriptions, clean and truncate
      if (cleanedArticle.content) {
        cleanedArticle.content = cleanHtmlContent(cleanedArticle.content);
        // Truncate to 150 characters for meta
        if (cleanedArticle.content.length > 150) {
          cleanedArticle.content = cleanedArticle.content.substring(0, 150) + '...';
        }
      }
      break;
      
    case 'full':
    default:
      // Full cleaning - remove all HTML tags
      if (cleanedArticle.content) {
        cleanedArticle.content = cleanHtmlContent(cleanedArticle.content);
      }
      break;
  }
  
  return cleanedArticle;
}

module.exports = {
  stripHtmlTags,
  cleanHtmlContent,
  cleanArticleContent,
};

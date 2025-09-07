// frontend/src/components/RelatedArticles.tsx
'use client';

import { useArticles } from '@/lib/hooks';
import ArticleCard from './ArticleCard';
import DataWrapper from './DataWrapper';
import type { Article } from '@/lib/types';

interface RelatedArticlesProps {
  currentArticle: Article;
  limit?: number;
  className?: string;
}

export default function RelatedArticles({
  currentArticle,
  limit = 4,
  className = ''
}: RelatedArticlesProps) {
  // Get related articles based on categories and tags
  const categorySlugs = currentArticle.attributes.categories?.data?.map(cat => cat.attributes.slug) || [];
  const tagSlugs = currentArticle.attributes.tags?.data?.map(tag => tag.attributes.slug) || [];
  
  // Build filters for related articles
  const filters: any = {
    id: {
      $ne: currentArticle.id // Exclude current article
    }
  };

  // Add category or tag filters
  if (categorySlugs.length > 0 || tagSlugs.length > 0) {
    filters.$or = [];
    
    if (categorySlugs.length > 0) {
      filters.$or.push({
        categories: {
          slug: {
            $in: categorySlugs
          }
        }
      });
    }
    
    if (tagSlugs.length > 0) {
      filters.$or.push({
        tags: {
          slug: {
            $in: tagSlugs
          }
        }
      });
    }
  }

  const params = {
    filters,
    pagination: { limit },
    sort: ['createdAt:desc']
  };

  const { data: relatedArticles, loading, error, refetch } = useArticles(params);

  // If no related articles found, get recent articles instead
  const fallbackParams = {
    filters: {
      id: {
        $ne: currentArticle.id
      }
    },
    pagination: { limit },
    sort: ['createdAt:desc']
  };

  const { data: fallbackArticles, loading: fallbackLoading, error: fallbackError } = useArticles(fallbackParams);

  const articlesToShow = relatedArticles && relatedArticles.length > 0 ? relatedArticles : fallbackArticles;
  const isLoading = loading || fallbackLoading;
  const hasError = error || fallbackError;

  if (!articlesToShow || articlesToShow.length === 0) {
    return null;
  }

  return (
    <section className={`mt-12 pt-8 border-t border-gray-200 ${className}`}>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {relatedArticles && relatedArticles.length > 0 ? 'Related Articles' : 'Recent Articles'}
      </h2>
      
      <DataWrapper
        data={articlesToShow}
        loading={isLoading}
        error={hasError?.message || null}
        onRetry={refetch}
      >
        {(articles: Article[]) => (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                variant="compact"
                showAuthor={true}
                showReadingTime={true}
                showCategories={true}
                showTags={false}
              />
            ))}
          </div>
        )}
      </DataWrapper>
    </section>
  );
}

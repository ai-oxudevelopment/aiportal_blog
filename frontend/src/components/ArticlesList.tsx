'use client';

// frontend/src/components/ArticlesList.tsx
import { useArticles } from '@/lib/hooks';
import DataWrapper from './DataWrapper';
import ArticleCard from './ArticleCard';
import type { Article } from '@/lib/types';

interface ArticlesListProps {
  params?: any;
  title?: string;
  variant?: 'default' | 'featured' | 'compact';
  showAuthor?: boolean;
  showReadingTime?: boolean;
  showCategories?: boolean;
  showTags?: boolean;
  className?: string;
}

export default function ArticlesList({ 
  params, 
  title = 'Articles', 
  variant = 'default',
  showAuthor = true,
  showReadingTime = true,
  showCategories = true,
  showTags = false,
  className = '' 
}: ArticlesListProps) {
  const { data: articles, loading, error, refetch } = useArticles(params);

  const gridClasses = {
    default: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
    featured: "grid grid-cols-1 lg:grid-cols-2 gap-8",
    compact: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
  };

  return (
    <div className={className}>
      {title && (
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
      )}
      
      <DataWrapper
        data={articles}
        loading={loading}
        error={error}
        onRetry={refetch}
      >
        {(articles: Article[]) => (
          <div className={gridClasses[variant]}>
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                variant={variant}
                showAuthor={showAuthor}
                showReadingTime={showReadingTime}
                showCategories={showCategories}
                showTags={showTags}
              />
            ))}
          </div>
        )}
      </DataWrapper>
    </div>
  );
}

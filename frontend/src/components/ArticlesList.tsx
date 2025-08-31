'use client';

// frontend/src/components/ArticlesList.tsx
import { useArticles } from '@/lib/hooks';
import DataWrapper from './DataWrapper';
import { getImageUrl } from '@/lib/api';
import type { Article } from '@/lib/types';

interface ArticlesListProps {
  params?: any;
  title?: string;
  className?: string;
}

export default function ArticlesList({ params, title = 'Articles', className = '' }: ArticlesListProps) {
  const { data: articles, loading, error, refetch } = useArticles(params);

  return (
    <div className={className}>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
      
      <DataWrapper
        data={articles}
        loading={loading}
        error={error}
        onRetry={refetch}
      >
        {(articles: Article[]) => (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <article
                key={article.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {article.attributes.featuredImage?.data && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={getImageUrl(article.attributes.featuredImage, 'medium')}
                      alt={article.attributes.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {article.attributes.title}
                  </h3>
                  {article.attributes.excerpt && (
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {article.attributes.excerpt}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {article.attributes.author?.data && (
                        <span className="text-sm text-gray-500">
                          By {article.attributes.author.data.attributes.name}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-400">
                      {new Date(article.attributes.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </DataWrapper>
    </div>
  );
}

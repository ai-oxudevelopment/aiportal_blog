'use client';

// frontend/src/components/SearchArticles.tsx
import { useState } from 'react';
import { useSearchArticles } from '@/lib/hooks';
import DataWrapper from './DataWrapper';
import { getImageUrl } from '@/lib/api';
import type { Article } from '@/lib/types';

export default function SearchArticles() {
  const [query, setQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: articles, loading, error, refetch } = useSearchArticles(searchQuery, {
    populate: {
      featuredImage: true,
      author: {
        populate: ['avatar'],
      },
      categories: true,
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(query);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Search
          </button>
        </div>
      </form>

      {/* Search Results */}
      {searchQuery && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Search Results for "{searchQuery}"
          </h2>
          
          <DataWrapper
            data={articles}
            loading={loading}
            error={error?.message || null}
            onRetry={refetch}
            emptyComponent={
              <div className="text-center py-8">
                <p className="text-gray-500">No articles found for "{searchQuery}"</p>
                <p className="text-sm text-gray-400 mt-2">Try different keywords</p>
              </div>
            }
          >
            {(articles: Article[]) => (
              <div className="space-y-6">
                {articles.map((article) => (
                  <article
                    key={article.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="md:flex">
                      {article.attributes.featuredImage?.data && (
                        <div className="md:w-1/3">
                          <img
                            src={getImageUrl(article.attributes.featuredImage, 'medium')}
                            alt={article.attributes.title}
                            className="w-full h-48 md:h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-6 md:w-2/3">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {article.attributes.title}
                        </h3>
                        {article.attributes.excerpt && (
                          <p className="text-gray-600 mb-4">
                            {article.attributes.excerpt}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-2">
                            {article.attributes.author?.data && (
                              <span>By {article.attributes.author.data.attributes.name}</span>
                            )}
                          </div>
                          <span>
                            {new Date(article.attributes.publishedAt || article.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </DataWrapper>
        </div>
      )}

      {/* Search Instructions */}
      {!searchQuery && (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Search Articles
          </h3>
          <p className="text-gray-600">
            Enter keywords to search through article titles, content, and excerpts.
          </p>
        </div>
      )}
    </div>
  );
}

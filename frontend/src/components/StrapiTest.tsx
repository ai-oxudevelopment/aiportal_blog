'use client';

import { useEffect, useState } from 'react';
import { getArticles, getCategories } from '@/lib/api';
import type { Article, Category } from '@/lib/types';

export default function StrapiTest() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        setLoading(true);
        setError(null);

        // Test fetching articles
        const articlesData = await getArticles({ pagination: { limit: 5 } });
        setArticles(articlesData);

        // Test fetching categories
        const categoriesData = await getCategories({ pagination: { limit: 5 } });
        setCategories(categoriesData);

        console.log('Strapi SDK connection successful!');
        console.log('Articles found:', articlesData.length);
        console.log('Categories found:', categoriesData.length);
      } catch (err) {
        console.error('Strapi SDK connection failed:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    testConnection();
  }, []);

  if (loading) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Testing Strapi SDK Connection...</h2>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4 text-red-600">Strapi SDK Connection Failed</h2>
        <div className="bg-red-50 border border-red-200 rounded p-3">
          <p className="text-red-800">{error}</p>
          <p className="text-sm text-red-600 mt-2">
            Make sure the Strapi backend is running on http://localhost:1337
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 text-green-600">
        ✅ Strapi SDK Connection Successful!
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">Articles ({articles.length})</h3>
          {articles.length > 0 ? (
            <ul className="space-y-2">
              {articles.map((article) => (
                <li key={article.id} className="p-3 bg-gray-50 rounded">
                  <h4 className="font-medium">{article.attributes.title}</h4>
                  <p className="text-sm text-gray-600">
                    Slug: {article.attributes.slug}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No articles found</p>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Categories ({categories.length})</h3>
          {categories.length > 0 ? (
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.id} className="p-3 bg-gray-50 rounded">
                  <h4 className="font-medium">{category.attributes.name}</h4>
                  <p className="text-sm text-gray-600">
                    Slug: {category.attributes.slug}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No categories found</p>
          )}
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-semibold text-blue-800 mb-2">Next Steps:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Configure API token in .env.local</li>
          <li>• Create content types in Strapi admin</li>
          <li>• Add some test content</li>
          <li>• Implement data fetching in pages</li>
        </ul>
      </div>
    </div>
  );
}

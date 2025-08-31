// frontend/src/app/home/page.tsx
import { getServerArticles, getServerCategories } from '@/lib/server-api';
import { getServerImageUrl } from '@/lib/server-api';
import type { Article, Category } from '@/lib/types';

// This page uses SSR (Server-Side Rendering)
export default async function HomePage() {
  // Fetch data on the server
  const [articles, categories] = await Promise.all([
    getServerArticles({
      pagination: { limit: 6 },
      sort: ['createdAt:desc'],
      populate: {
        featuredImage: true,
        author: {
          populate: ['avatar'],
        },
        categories: true,
      },
    }),
    getServerCategories({
      populate: {
        articles: {
          populate: ['featuredImage'],
        },
      },
    }),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        {/* Hero Section */}
        <section className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Portal Blog
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Latest insights and articles about artificial intelligence
          </p>
        </section>

        {/* Featured Articles */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Latest Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <article
                key={article.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {article.attributes.featuredImage?.data && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={getServerImageUrl(article.attributes.featuredImage, 'medium')}
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
        </section>

        {/* Categories */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {category.attributes.name}
                </h3>
                {category.attributes.description && (
                  <p className="text-gray-600 text-sm mb-4">
                    {category.attributes.description}
                  </p>
                )}
                <div className="text-sm text-gray-500">
                  {category.attributes.articles?.data?.length || 0} articles
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* No Articles Message */}
        {articles.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No articles yet
            </h3>
            <p className="text-gray-600">
              Articles will appear here once they are published in Strapi.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// frontend/src/app/categories/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { getServerCategoryBySlug, getServerCategories, getServerArticles } from '@/lib/server-api';
import { getServerImageUrl } from '@/lib/server-api';
import type { Category, Article } from '@/lib/types';

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

// Generate static params for SSG
export async function generateStaticParams() {
  try {
    const categories = await getServerCategories();
    return categories.map((category) => ({
      slug: category.attributes.slug,
    }));
  } catch (error) {
    console.error('Error generating static params for categories:', error);
    return [];
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: CategoryPageProps) {
  const category = await getServerCategoryBySlug(params.slug);
  
  if (!category) {
    return {
      title: 'Category Not Found',
      description: 'The requested category could not be found.',
    };
  }

  const { name, description } = category.attributes;
  const metaTitle = `${name} - AI Portal Blog`;
  const metaDescription = description || `Articles in the ${name} category`;

  return {
    title: metaTitle,
    description: metaDescription,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: metaTitle,
      description: metaDescription,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = await getServerCategoryBySlug(params.slug, {
    populate: {
      articles: {
        populate: ['featuredImage', 'author'],
      },
    },
  });

  if (!category) {
    notFound();
  }

  // Get articles for this category
  const articles = await getServerArticles({
    filters: {
      categories: {
        slug: {
          $eq: params.slug,
        },
      },
    },
    sort: ['createdAt:desc'],
    populate: {
      featuredImage: true,
      author: {
        populate: ['avatar'],
      },
      categories: true,
    },
  });

  const { name, description } = category.attributes;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        {/* Category Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{name}</h1>
          {description && (
            <p className="text-xl text-gray-600 mb-6">{description}</p>
          )}
          <div className="text-sm text-gray-500">
            {articles.length} article{articles.length !== 1 ? 's' : ''} in this category
          </div>
        </header>

        {/* Articles Grid */}
        {articles.length > 0 ? (
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
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No articles yet
            </h3>
            <p className="text-gray-600">
              Articles in this category will appear here once they are published.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

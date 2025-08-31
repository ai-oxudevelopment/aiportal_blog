// frontend/src/app/tags/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { getServerTagBySlug, getServerTags, getServerArticles } from '@/lib/server-api';
import { getServerImageUrl } from '@/lib/server-api';
import type { Tag, Article } from '@/lib/types';

interface TagPageProps {
  params: {
    slug: string;
  };
}

// Generate static params for SSG
export async function generateStaticParams() {
  try {
    const tags = await getServerTags();
    return tags.map((tag) => ({
      slug: tag.attributes.slug,
    }));
  } catch (error) {
    console.error('Error generating static params for tags:', error);
    return [];
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: TagPageProps) {
  const tag = await getServerTagBySlug(params.slug);
  
  if (!tag) {
    return {
      title: 'Tag Not Found',
      description: 'The requested tag could not be found.',
    };
  }

  const { name } = tag.attributes;
  const metaTitle = `#${name} - Tag - AI Portal Blog`;
  const metaDescription = `Articles tagged with ${name}`;

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

export default async function TagPage({ params }: TagPageProps) {
  const tag = await getServerTagBySlug(params.slug, {
    populate: {
      articles: {
        populate: ['featuredImage', 'author'],
      },
    },
  });

  if (!tag) {
    notFound();
  }

  // Get articles with this tag
  const articles = await getServerArticles({
    filters: {
      tags: {
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

  const { name } = tag.attributes;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        {/* Tag Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            #{name}
          </h1>
          <div className="text-sm text-gray-500">
            {articles.length} article{articles.length !== 1 ? 's' : ''} tagged with {name}
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
                        <span className="text-sm text-gray-600">
                          {article.attributes.author.data.attributes.name}
                        </span>
                      )}
                      {article.attributes.categories?.data && article.attributes.categories.data.length > 0 && (
                        <span className="text-sm text-blue-600">
                          {article.attributes.categories.data[0].attributes.name}
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
              Articles tagged with {name} will appear here once they are published.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

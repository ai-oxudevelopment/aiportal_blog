// frontend/src/app/articles/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { getServerArticleBySlug, getServerArticles } from '@/lib/server-api';
import { getServerImageUrl } from '@/lib/server-api';
import type { Article } from '@/lib/types';

interface ArticlePageProps {
  params: {
    slug: string;
  };
}

// Generate static params for SSG
export async function generateStaticParams() {
  try {
    const articles = await getServerArticles({
      pagination: { limit: 100 }, // Adjust based on your needs
      populate: {
        featuredImage: true,
        author: {
          populate: ['avatar'],
        },
        categories: true,
        tags: true,
      },
    });

    return articles.map((article) => ({
      slug: article.attributes.slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ArticlePageProps) {
  const article = await getServerArticleBySlug(params.slug, {
    populate: {
      featuredImage: true,
      author: {
        populate: ['avatar'],
      },
      categories: true,
      tags: true,
    },
  });

  if (!article) {
    return {
      title: 'Article Not Found',
      description: 'The requested article could not be found.',
    };
  }

  const { title, excerpt, seo } = article.attributes;
  const metaTitle = seo?.metaTitle || title;
  const metaDescription = seo?.metaDescription || excerpt || 'Read this article on AI Portal Blog';

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: seo?.keywords,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      type: 'article',
      publishedTime: article.attributes.publishedAt,
      authors: article.attributes.author?.data?.attributes.name,
      images: article.attributes.featuredImage?.data
        ? [getServerImageUrl(article.attributes.featuredImage, 'large')]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: article.attributes.featuredImage?.data
        ? [getServerImageUrl(article.attributes.featuredImage, 'large')]
        : [],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getServerArticleBySlug(params.slug, {
    populate: {
      featuredImage: true,
      author: {
        populate: ['avatar'],
      },
      categories: true,
      tags: true,
    },
  });

  if (!article) {
    notFound();
  }

  const { title, content, excerpt, featuredImage, author, categories, tags, createdAt, updatedAt } = article.attributes;

  return (
    <div className="min-h-screen bg-gray-50">
      <article className="container mx-auto py-8 px-4 max-w-4xl">
        {/* Article Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
          
          {excerpt && (
            <p className="text-xl text-gray-600 mb-6">{excerpt}</p>
          )}

          {/* Featured Image */}
          {featuredImage?.data && (
            <div className="mb-6">
              <img
                src={getServerImageUrl(featuredImage, 'large')}
                alt={title}
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          )}

          {/* Article Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 border-b border-gray-200 pb-4">
            {author?.data && (
              <div className="flex items-center space-x-2">
                {author.data.attributes.avatar?.data && (
                  <img
                    src={getServerImageUrl(author.data.attributes.avatar, 'thumbnail')}
                    alt={author.data.attributes.name}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span>By {author.data.attributes.name}</span>
              </div>
            )}
            
            <span>Published {new Date(createdAt).toLocaleDateString()}</span>
            
            {updatedAt !== createdAt && (
              <span>Updated {new Date(updatedAt).toLocaleDateString()}</span>
            )}
          </div>
        </header>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none mb-8">
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>

        {/* Article Footer */}
        <footer className="border-t border-gray-200 pt-6">
          {/* Categories */}
          {categories?.data && categories.data.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Categories:</h3>
              <div className="flex flex-wrap gap-2">
                {categories.data.map((category) => (
                  <span
                    key={category.id}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {category.attributes.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {tags?.data && tags.data.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {tags.data.map((tag) => (
                  <span
                    key={tag.id}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                  >
                    #{tag.attributes.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Author Bio */}
          {author?.data && author.data.attributes.bio && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                About {author.data.attributes.name}
              </h3>
              <p className="text-gray-600">{author.data.attributes.bio}</p>
            </div>
          )}
        </footer>
      </article>
    </div>
  );
}

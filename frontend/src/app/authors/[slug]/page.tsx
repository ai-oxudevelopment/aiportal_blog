// frontend/src/app/authors/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { getServerAuthorBySlug, getServerAuthors, getServerArticles } from '@/lib/server-api';
import { getServerImageUrl } from '@/lib/server-api';
import type { Author, Article } from '@/lib/types';

interface AuthorPageProps {
  params: {
    slug: string;
  };
}

// Generate static params for SSG
export async function generateStaticParams() {
  try {
    const authors = await getServerAuthors();
    return authors.map((author) => ({
      slug: author.attributes.slug,
    }));
  } catch (error) {
    console.error('Error generating static params for authors:', error);
    return [];
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: AuthorPageProps) {
  const author = await getServerAuthorBySlug(params.slug);
  
  if (!author) {
    return {
      title: 'Author Not Found',
      description: 'The requested author could not be found.',
    };
  }

  const { name, bio } = author.attributes;
  const metaTitle = `${name} - Author - AI Portal Blog`;
  const metaDescription = bio || `Articles written by ${name}`;

  return {
    title: metaTitle,
    description: metaDescription,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      type: 'profile',
    },
    twitter: {
      card: 'summary',
      title: metaTitle,
      description: metaDescription,
    },
  };
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const author = await getServerAuthorBySlug(params.slug, {
    populate: {
      avatar: true,
      articles: {
        populate: ['featuredImage'],
      },
    },
  });

  if (!author) {
    notFound();
  }

  // Get articles by this author
  const articles = await getServerArticles({
    filters: {
      author: {
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

  const { name, bio, avatar } = author.attributes;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        {/* Author Header */}
        <header className="mb-8">
          <div className="flex items-center space-x-6 mb-6">
            {avatar?.data && (
              <img
                src={getServerImageUrl(avatar, 'large')}
                alt={name}
                className="w-24 h-24 rounded-full object-cover"
              />
            )}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{name}</h1>
              <div className="text-sm text-gray-500">
                {articles.length} article{articles.length !== 1 ? 's' : ''} published
              </div>
            </div>
          </div>
          {bio && (
            <p className="text-lg text-gray-600 mb-6">{bio}</p>
          )}
        </header>

        {/* Articles Grid */}
        {articles.length > 0 ? (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Articles by {name}</h2>
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
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No articles yet
            </h3>
            <p className="text-gray-600">
              Articles by {name} will appear here once they are published.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

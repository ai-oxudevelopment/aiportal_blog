// frontend/src/components/ArticleCard.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { getImageUrl } from '@/lib/api';
import { calculateReadingTime } from '@/lib/utils';
import type { Article } from '@/lib/types';

interface ArticleCardProps {
  article: Article;
  variant?: 'default' | 'featured' | 'compact';
  showAuthor?: boolean;
  showReadingTime?: boolean;
  showCategories?: boolean;
  showTags?: boolean;
  className?: string;
}

export default function ArticleCard({
  article,
  variant = 'default',
  showAuthor = true,
  showReadingTime = true,
  showCategories = true,
  showTags = false,
  className = ''
}: ArticleCardProps) {
  const {
    id,
    attributes: {
      title,
      slug,
      excerpt,
      featuredImage,
      author,
      categories,
      tags,
      content,
      publishedAt
    }
  } = article;

  const readingTime = showReadingTime ? calculateReadingTime(content) : null;
  const publishDate = new Date(publishedAt || article.createdAt);
  const isUpdated = article.updatedAt !== article.createdAt;

  const baseClasses = "group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300";
  const variantClasses = {
    default: "h-full",
    featured: "h-full border-2 border-blue-100",
    compact: "h-auto"
  };

  const imageClasses = {
    default: "aspect-video",
    featured: "aspect-[16/9]",
    compact: "aspect-square"
  };

  const contentClasses = {
    default: "p-6",
    featured: "p-8",
    compact: "p-4"
  };

  return (
    <article className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      <Link href={`/articles/${slug}`} className="block h-full">
        {/* Featured Image */}
        {featuredImage?.data && (
          <div className={`relative overflow-hidden ${imageClasses[variant]}`}>
            <Image
              src={getImageUrl(featuredImage, variant === 'featured' ? 'large' : 'medium')}
              alt={featuredImage.data.attributes.alternativeText || title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes={
                variant === 'featured' 
                  ? '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                  : '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw'
              }
            />
            
            {/* Categories overlay for featured variant */}
            {variant === 'featured' && showCategories && categories?.data && (
              <div className="absolute top-4 left-4">
                {categories.data.slice(0, 2).map((category) => (
                  <span
                    key={category.id}
                    className="inline-block bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full mr-2 mb-1"
                  >
                    {category.attributes.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className={`${contentClasses[variant]} flex flex-col h-full`}>
          {/* Categories (for non-featured variants) */}
          {variant !== 'featured' && showCategories && categories?.data && (
            <div className="mb-3">
              {categories.data.slice(0, 2).map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.attributes.slug}`}
                  className="inline-block text-blue-600 text-sm font-medium hover:text-blue-800 mr-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {category.attributes.name}
                </Link>
              ))}
            </div>
          )}

          {/* Title */}
          <h3 className={`font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors ${
            variant === 'featured' ? 'text-2xl' : variant === 'compact' ? 'text-lg' : 'text-xl'
          }`}>
            {title}
          </h3>

          {/* Excerpt */}
          {excerpt && variant !== 'compact' && (
            <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">
              {excerpt}
            </p>
          )}

          {/* Tags */}
          {showTags && tags?.data && variant !== 'compact' && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {tags.data.slice(0, 3).map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/tags/${tag.attributes.slug}`}
                    className="inline-block text-gray-500 text-xs hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    #{tag.attributes.name}
                  </Link>
                ))}
                {tags.data.length > 3 && (
                  <span className="text-gray-400 text-xs px-2 py-1">
                    +{tags.data.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Meta Information */}
          <div className="flex items-center justify-between text-sm text-gray-500 mt-auto">
            <div className="flex items-center space-x-3">
              {showAuthor && author?.data && (
                <div className="flex items-center space-x-2">
                  {author.data.attributes.avatar?.data && (
                    <div className="w-6 h-6 rounded-full overflow-hidden">
                      <Image
                        src={getImageUrl(author.data.attributes.avatar, 'thumbnail')}
                        alt={author.data.attributes.name}
                        width={24}
                        height={24}
                        className="object-cover"
                      />
                    </div>
                  )}
                  <span className="font-medium">
                    {author.data.attributes.name}
                  </span>
                </div>
              )}
              
              {readingTime && (
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {readingTime} min read
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <time dateTime={publishDate.toISOString()}>
                {publishDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </time>
              {isUpdated && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  Updated
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}

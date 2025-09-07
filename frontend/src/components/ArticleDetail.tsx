// frontend/src/components/ArticleDetail.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getImageUrl } from '@/lib/api';
import { calculateReadingTime, formatDate, generateSocialShareUrls, copyToClipboard } from '@/lib/utils';
import type { Article } from '@/lib/types';

interface ArticleDetailProps {
  article: Article;
  showAuthor?: boolean;
  showSocialShare?: boolean;
  showRelatedArticles?: boolean;
  className?: string;
}

export default function ArticleDetail({
  article,
  showAuthor = true,
  showSocialShare = true,
  showRelatedArticles = true,
  className = ''
}: ArticleDetailProps) {
  const [shareCopied, setShareCopied] = useState(false);
  
  const {
    id,
    attributes: {
      title,
      slug,
      content,
      excerpt,
      featuredImage,
      author,
      categories,
      tags,
      seo,
      publishedAt
    }
  } = article;

  const readingTime = calculateReadingTime(content);
  const publishDate = new Date(publishedAt || article.createdAt);
  const isUpdated = article.updatedAt !== article.createdAt;
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  
  const socialUrls = generateSocialShareUrls(
    currentUrl,
    title,
    excerpt || seo?.metaDescription
  );

  const handleShare = async (platform: string) => {
    if (platform === 'copy') {
      await copyToClipboard(currentUrl);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } else {
      window.open(socialUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  return (
    <article className={`max-w-4xl mx-auto ${className}`}>
      {/* Header */}
      <header className="mb-8">
        {/* Categories */}
        {categories?.data && categories.data.length > 0 && (
          <div className="mb-4">
            {categories.data.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.attributes.slug}`}
                className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full mr-2 mb-2 hover:bg-blue-200 transition-colors"
              >
                {category.attributes.name}
              </Link>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
          {title}
        </h1>

        {/* Excerpt */}
        {excerpt && (
          <p className="text-xl text-gray-600 mb-6 leading-relaxed">
            {excerpt}
          </p>
        )}

        {/* Meta Information */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            {showAuthor && author?.data && (
              <div className="flex items-center space-x-3">
                {author.data.attributes.avatar?.data ? (
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <Image
                      src={getImageUrl(author.data.attributes.avatar, 'medium')}
                      alt={author.data.attributes.name}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-medium text-lg">
                      {author.data.attributes.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <Link
                    href={`/authors/${author.data.attributes.slug}`}
                    className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                  >
                    {author.data.attributes.name}
                  </Link>
                  {author.data.attributes.bio && (
                    <p className="text-sm text-gray-600">
                      {author.data.attributes.bio}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <time dateTime={publishDate.toISOString()}>
              {formatDate(publishDate)}
            </time>
            {isUpdated && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                Updated {formatDate(new Date(article.updatedAt))}
              </span>
            )}
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {readingTime} min read
            </span>
          </div>
        </div>

        {/* Social Share */}
        {showSocialShare && (
          <div className="flex items-center space-x-4 mb-8">
            <span className="text-sm font-medium text-gray-700">Share:</span>
            <div className="flex items-center space-x-2">
              {Object.entries(socialUrls).map(([platform, url]) => (
                <button
                  key={platform}
                  onClick={() => handleShare(platform)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                  title={`Share on ${platform}`}
                >
                  {platform === 'twitter' && (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  )}
                  {platform === 'facebook' && (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  )}
                  {platform === 'linkedin' && (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  )}
                  {platform === 'copy' && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
            {shareCopied && (
              <span className="text-sm text-green-600">Link copied!</span>
            )}
          </div>
        )}
      </header>

      {/* Featured Image */}
      {featuredImage?.data && (
        <div className="mb-8">
          <div className="relative aspect-video rounded-lg overflow-hidden">
            <Image
              src={getImageUrl(featuredImage, 'large')}
              alt={featuredImage.data.attributes.alternativeText || title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
            />
            {featuredImage.data.attributes.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
                <p className="text-sm">{featuredImage.data.attributes.caption}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="prose prose-lg max-w-none">
        <div 
          dangerouslySetInnerHTML={{ __html: content }}
          className="article-content"
        />
      </div>

      {/* Tags */}
      {tags?.data && tags.data.length > 0 && (
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {tags.data.map((tag) => (
              <Link
                key={tag.id}
                href={`/tags/${tag.attributes.slug}`}
                className="inline-block bg-gray-100 text-gray-700 text-sm font-medium px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
              >
                #{tag.attributes.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Author Bio */}
      {showAuthor && author?.data && author.data.attributes.bio && (
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex items-start space-x-4">
            {author.data.attributes.avatar?.data ? (
              <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={getImageUrl(author.data.attributes.avatar, 'medium')}
                  alt={author.data.attributes.name}
                  width={64}
                  height={64}
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-gray-600 font-medium text-xl">
                  {author.data.attributes.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                About {author.data.attributes.name}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {author.data.attributes.bio}
              </p>
              <Link
                href={`/authors/${author.data.attributes.slug}`}
                className="inline-block mt-2 text-blue-600 hover:text-blue-800 font-medium"
              >
                View all articles by {author.data.attributes.name} →
              </Link>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

// frontend/src/components/TagCloud.tsx
'use client';

import Link from 'next/link';
import { useTags } from '@/lib/hooks';
import DataWrapper from './DataWrapper';
import type { Tag } from '@/lib/types';

interface TagCloudProps {
  variant?: 'default' | 'compact' | 'sidebar';
  showCount?: boolean;
  limit?: number;
  minCount?: number;
  className?: string;
}

export default function TagCloud({
  variant = 'default',
  showCount = true,
  limit = 50,
  minCount = 1,
  className = ''
}: TagCloudProps) {
  const { data: tags, loading, error, refetch } = useTags();

  // Filter and sort tags by article count
  const filteredTags = tags
    ?.filter(tag => (tag.attributes.articles?.data?.length || 0) >= minCount)
    ?.sort((a, b) => (b.attributes.articles?.data?.length || 0) - (a.attributes.articles?.data?.length || 0))
    ?.slice(0, limit);

  const getTagSize = (count: number, maxCount: number) => {
    if (maxCount === 0) return 'text-sm';
    
    const ratio = count / maxCount;
    if (ratio >= 0.8) return 'text-lg';
    if (ratio >= 0.6) return 'text-base';
    if (ratio >= 0.4) return 'text-sm';
    return 'text-xs';
  };

  const getTagColor = (index: number) => {
    const colors = [
      'bg-blue-100 text-blue-800 hover:bg-blue-200',
      'bg-green-100 text-green-800 hover:bg-green-200',
      'bg-purple-100 text-purple-800 hover:bg-purple-200',
      'bg-pink-100 text-pink-800 hover:bg-pink-200',
      'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
      'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
      'bg-red-100 text-red-800 hover:bg-red-200',
      'bg-gray-100 text-gray-800 hover:bg-gray-200'
    ];
    return colors[index % colors.length];
  };

  const maxCount = Math.max(...(filteredTags?.map(tag => tag.attributes.articles?.data?.length || 0) || [0]));

  const containerClasses = {
    default: "flex flex-wrap gap-2",
    compact: "flex flex-wrap gap-1",
    sidebar: "space-y-1"
  };

  const itemClasses = {
    default: "inline-block px-3 py-1 rounded-full text-sm font-medium transition-colors",
    compact: "inline-block px-2 py-1 rounded-full text-xs font-medium transition-colors",
    sidebar: "block px-3 py-2 rounded-md text-sm font-medium transition-colors"
  };

  return (
    <div className={`${containerClasses[variant]} ${className}`}>
      <DataWrapper
        data={filteredTags || null}
        loading={loading}
        error={error?.message || null}
        onRetry={refetch}
      >
        {(tags: Tag[]) => (
          <>
            {tags.map((tag, index) => {
              const articleCount = tag.attributes.articles?.data?.length || 0;
              const sizeClass = variant === 'sidebar' ? 'text-sm' : getTagSize(articleCount, maxCount);
              const colorClass = getTagColor(index);
              
              return (
                <Link
                  key={tag.id}
                  href={`/tags/${tag.attributes.slug}`}
                  className={`${itemClasses[variant]} ${colorClass} ${sizeClass}`}
                >
                  <span className="flex items-center space-x-1">
                    <span>#{tag.attributes.name}</span>
                    {showCount && variant !== 'sidebar' && (
                      <span className="text-xs opacity-75">
                        ({articleCount})
                      </span>
                    )}
                  </span>
                </Link>
              );
            })}
          </>
        )}
      </DataWrapper>
    </div>
  );
}

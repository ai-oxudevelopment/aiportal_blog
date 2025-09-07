// frontend/src/components/CategoryList.tsx
'use client';

import Link from 'next/link';
import { useCategories } from '@/lib/hooks';
import DataWrapper from './DataWrapper';
import type { Category } from '@/lib/types';

interface CategoryListProps {
  variant?: 'default' | 'grid' | 'sidebar';
  showCount?: boolean;
  showDescription?: boolean;
  limit?: number;
  className?: string;
}

export default function CategoryList({
  variant = 'default',
  showCount = true,
  showDescription = false,
  limit,
  className = ''
}: CategoryListProps) {
  const { data: categories, loading, error, refetch } = useCategories();

  const displayCategories = limit ? categories?.slice(0, limit) : categories;

  const baseClasses = "space-y-2";
  const variantClasses = {
    default: "space-y-2",
    grid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
    sidebar: "space-y-1"
  };

  const itemClasses = {
    default: "block p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200",
    grid: "block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 text-center",
    sidebar: "block p-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      <DataWrapper
        data={displayCategories || null}
        loading={loading}
        error={error?.message || null}
        onRetry={refetch}
      >
        {(categories: Category[]) => (
          <>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.attributes.slug}`}
                className={itemClasses[variant]}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className={`font-semibold text-gray-900 ${
                      variant === 'sidebar' ? 'text-sm' : 'text-lg'
                    }`}>
                      {category.attributes.name}
                    </h3>
                    
                    {showDescription && category.attributes.description && (
                      <p className={`text-gray-600 mt-1 ${
                        variant === 'sidebar' ? 'text-xs' : 'text-sm'
                      }`}>
                        {category.attributes.description}
                      </p>
                    )}
                  </div>
                  
                  {showCount && category.attributes.articles?.data && (
                    <div className={`flex items-center ${
                      variant === 'sidebar' ? 'ml-2' : 'ml-4'
                    }`}>
                      <span className={`bg-gray-100 text-gray-600 px-2 py-1 rounded-full ${
                        variant === 'sidebar' ? 'text-xs' : 'text-sm'
                      }`}>
                        {category.attributes.articles.data.length}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </>
        )}
      </DataWrapper>
    </div>
  );
}

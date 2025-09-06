// frontend/src/components/SearchResults.tsx
"use client";

import React, { useState, useMemo } from "react";
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  UserIcon,
  TagIcon
} from "@heroicons/react/24/outline";
import { useSearchArticles } from "@/lib/hooks";
import { getImageUrl } from "@/lib/api";
import type { Article } from "@/lib/types";
import FilterSidebar, { FilterOptions } from "./FilterSidebar";

interface SearchResultsProps {
  query: string;
  className?: string;
}

interface HighlightedTextProps {
  text: string;
  highlight: string;
  className?: string;
}

const HighlightedText: React.FC<HighlightedTextProps> = ({ text, highlight, className = "" }) => {
  if (!highlight.trim()) {
    return <span className={className}>{text}</span>;
  }

  const parts = text.split(new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  
  return (
    <span className={className}>
      {parts.map((part, index) => 
        part.toLowerCase() === highlight.toLowerCase() ? (
          <mark key={index} className="bg-yellow-200 text-yellow-900 px-1 rounded">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
};

export default function SearchResults({ query, className = "" }: SearchResultsProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    authors: [],
    tags: [],
    dateRange: {},
    sortBy: 'relevance',
    sortOrder: 'desc'
  });

  const pageSize = 10;

  // Build search parameters
  const searchParams = useMemo(() => {
    const params: any = {
      populate: {
        featuredImage: true,
        author: {
          populate: ['avatar'],
        },
        categories: true,
        tags: true,
      },
      pagination: {
        page: currentPage,
        pageSize,
      },
    };

    // Add filters
    if (filters.categories.length > 0) {
      params.filters = {
        ...params.filters,
        categories: {
          slug: {
            $in: filters.categories,
          },
        },
      };
    }

    if (filters.authors.length > 0) {
      params.filters = {
        ...params.filters,
        author: {
          slug: {
            $in: filters.authors,
          },
        },
      };
    }

    if (filters.tags.length > 0) {
      params.filters = {
        ...params.filters,
        tags: {
          slug: {
            $in: filters.tags,
          },
        },
      };
    }

    if (filters.dateRange.start || filters.dateRange.end) {
      params.filters = {
        ...params.filters,
        createdAt: {},
      };

      if (filters.dateRange.start) {
        params.filters.createdAt.$gte = filters.dateRange.start;
      }

      if (filters.dateRange.end) {
        params.filters.createdAt.$lte = filters.dateRange.end;
      }
    }

    // Add sorting
    if (filters.sortBy === 'date') {
      params.sort = [`createdAt:${filters.sortOrder}`];
    } else if (filters.sortBy === 'title') {
      params.sort = [`title:${filters.sortOrder}`];
    }
    // 'relevance' is handled by the search API

    return params;
  }, [filters, currentPage, pageSize]);

  const { data: searchResults, loading, error, refetch } = useSearchArticles(query, searchParams);

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    setFilters({
      categories: [],
      authors: [],
      tags: [],
      dateRange: {},
      sortBy: 'relevance',
      sortOrder: 'desc'
    });
    setCurrentPage(1);
  };

  const hasActiveFilters = 
    filters.categories.length > 0 ||
    filters.authors.length > 0 ||
    filters.tags.length > 0 ||
    filters.dateRange.start ||
    filters.dateRange.end;

  const totalPages = searchResults ? Math.ceil(searchResults.length / pageSize) : 0;

  if (!query.trim()) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <MagnifyingGlassIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Start Your Search
        </h3>
        <p className="text-gray-600">
          Enter keywords to search through article titles, content, and excerpts.
        </p>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Search Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Search Results for "{query}"
            </h2>
            {searchResults && (
              <p className="text-gray-600 mt-1">
                {searchResults.length} article{searchResults.length !== 1 ? 's' : ''} found
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center px-3 py-2 rounded-md border transition-colors ${
                showFilters || hasActiveFilters
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FunnelIcon className="w-4 h-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
                  {[
                    filters.categories.length,
                    filters.authors.length,
                    filters.tags.length,
                    filters.dateRange.start ? 1 : 0,
                    filters.dateRange.end ? 1 : 0
                  ].reduce((a, b) => a + b, 0)}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-4">
            {filters.categories.map((category) => (
              <span
                key={category}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              >
                <TagIcon className="w-3 h-3 mr-1" />
                {category}
                <button
                  onClick={() => handleFiltersChange({
                    ...filters,
                    categories: filters.categories.filter(c => c !== category)
                  })}
                  className="ml-2 hover:text-blue-600"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            ))}
            
            {filters.authors.map((author) => (
              <span
                key={author}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
              >
                <UserIcon className="w-3 h-3 mr-1" />
                {author}
                <button
                  onClick={() => handleFiltersChange({
                    ...filters,
                    authors: filters.authors.filter(a => a !== author)
                  })}
                  className="ml-2 hover:text-green-600"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            ))}
            
            {filters.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
              >
                <TagIcon className="w-3 h-3 mr-1" />
                {tag}
                <button
                  onClick={() => handleFiltersChange({
                    ...filters,
                    tags: filters.tags.filter(t => t !== tag)
                  })}
                  className="ml-2 hover:text-purple-600"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            ))}
            
            {(filters.dateRange.start || filters.dateRange.end) && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
                <CalendarIcon className="w-3 h-3 mr-1" />
                {filters.dateRange.start && filters.dateRange.end
                  ? `${filters.dateRange.start} - ${filters.dateRange.end}`
                  : filters.dateRange.start
                  ? `From ${filters.dateRange.start}`
                  : `Until ${filters.dateRange.end}`
                }
                <button
                  onClick={() => handleFiltersChange({
                    ...filters,
                    dateRange: {}
                  })}
                  className="ml-2 hover:text-gray-600"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-6">
        {/* Filter Sidebar */}
        {showFilters && (
          <div className="w-80 flex-shrink-0">
            <FilterSidebar
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
              className="sticky top-4"
            />
          </div>
        )}

        {/* Results */}
        <div className="flex-1">
          {loading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-32 h-24 bg-gray-200 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">Error loading search results</p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : !searchResults || searchResults.length === 0 ? (
            <div className="text-center py-12">
              <MagnifyingGlassIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No articles found
              </h3>
              <p className="text-gray-600 mb-4">
                No articles match your search criteria for "{query}"
              </p>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Results List */}
              <div className="space-y-6">
                {searchResults.map((article) => (
                  <article
                    key={article.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="md:flex">
                      {article.attributes.featuredImage?.data && (
                        <div className="md:w-1/3">
                          <img
                            src={getImageUrl(article.attributes.featuredImage, 'medium')}
                            alt={article.attributes.title}
                            className="w-full h-48 md:h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-6 md:w-2/3">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          <HighlightedText
                            text={article.attributes.title}
                            highlight={query}
                          />
                        </h3>
                        {article.attributes.excerpt && (
                          <p className="text-gray-600 mb-4">
                            <HighlightedText
                              text={article.attributes.excerpt}
                              highlight={query}
                            />
                          </p>
                        )}
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <div className="flex items-center space-x-4">
                            {article.attributes.author?.data && (
                              <span className="flex items-center">
                                <UserIcon className="w-4 h-4 mr-1" />
                                {article.attributes.author.data.attributes.name}
                              </span>
                            )}
                            <span className="flex items-center">
                              <CalendarIcon className="w-4 h-4 mr-1" />
                              {new Date(article.attributes.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        {article.attributes.categories?.data && article.attributes.categories.data.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {article.attributes.categories.data.map((category) => (
                              <span
                                key={category.id}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                              >
                                <TagIcon className="w-3 h-3 mr-1" />
                                {category.attributes.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-8">
                  <div className="text-sm text-gray-700">
                    Showing page {currentPage} of {totalPages}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeftIcon className="w-4 h-4 mr-1" />
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                      <ChevronRightIcon className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

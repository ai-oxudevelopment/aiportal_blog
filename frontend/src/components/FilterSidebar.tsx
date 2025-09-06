// frontend/src/components/FilterSidebar.tsx
"use client";

import React, { useState, useEffect } from "react";
import { 
  FunnelIcon, 
  XMarkIcon, 
  ChevronDownIcon, 
  ChevronUpIcon,
  CalendarIcon,
  UserIcon,
  TagIcon
} from "@heroicons/react/24/outline";
import { useCategories, useAuthors, useTags } from "@/lib/hooks";

export interface FilterOptions {
  categories: string[];
  authors: string[];
  tags: string[];
  dateRange: {
    start?: string;
    end?: string;
  };
  sortBy: 'relevance' | 'date' | 'title';
  sortOrder: 'asc' | 'desc';
}

interface FilterSidebarProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
  className?: string;
  isOpen?: boolean;
  onToggle?: () => void;
}

export default function FilterSidebar({
  filters,
  onFiltersChange,
  onClearFilters,
  className = "",
  isOpen = true,
  onToggle
}: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    authors: true,
    tags: true,
    dateRange: false,
    sort: false
  });

  // Fetch data for filters
  const { data: categories, loading: categoriesLoading } = useCategories();
  const { data: authors, loading: authorsLoading } = useAuthors();
  const { data: tags, loading: tagsLoading } = useTags();

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCategoryToggle = (categorySlug: string) => {
    const newCategories = filters.categories.includes(categorySlug)
      ? filters.categories.filter(c => c !== categorySlug)
      : [...filters.categories, categorySlug];
    
    onFiltersChange({
      ...filters,
      categories: newCategories
    });
  };

  const handleAuthorToggle = (authorSlug: string) => {
    const newAuthors = filters.authors.includes(authorSlug)
      ? filters.authors.filter(a => a !== authorSlug)
      : [...filters.authors, authorSlug];
    
    onFiltersChange({
      ...filters,
      authors: newAuthors
    });
  };

  const handleTagToggle = (tagSlug: string) => {
    const newTags = filters.tags.includes(tagSlug)
      ? filters.tags.filter(t => t !== tagSlug)
      : [...filters.tags, tagSlug];
    
    onFiltersChange({
      ...filters,
      tags: newTags
    });
  };

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [field]: value
      }
    });
  };

  const handleSortChange = (sortBy: FilterOptions['sortBy'], sortOrder: FilterOptions['sortOrder']) => {
    onFiltersChange({
      ...filters,
      sortBy,
      sortOrder
    });
  };

  const hasActiveFilters = 
    filters.categories.length > 0 ||
    filters.authors.length > 0 ||
    filters.tags.length > 0 ||
    filters.dateRange.start ||
    filters.dateRange.end;

  const FilterSection = ({ 
    title, 
    icon: Icon, 
    section, 
    children, 
    loading = false 
  }: {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    section: keyof typeof expandedSections;
    children: React.ReactNode;
    loading?: boolean;
  }) => (
    <div className="border-b border-gray-200 pb-4 mb-4">
      <button
        onClick={() => toggleSection(section)}
        className="flex items-center justify-between w-full text-left font-medium text-gray-900 hover:text-gray-700"
      >
        <div className="flex items-center">
          <Icon className="w-5 h-5 mr-2 text-gray-500" />
          <span>{title}</span>
        </div>
        {expandedSections[section] ? (
          <ChevronUpIcon className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDownIcon className="w-4 h-4 text-gray-500" />
        )}
      </button>
      
      {expandedSections[section] && (
        <div className="mt-3">
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            children
          )}
        </div>
      )}
    </div>
  );

  const FilterCheckbox = ({ 
    id, 
    label, 
    checked, 
    onChange, 
    count 
  }: {
    id: string;
    label: string;
    checked: boolean;
    onChange: () => void;
    count?: number;
  }) => (
    <label className="flex items-center justify-between py-1 cursor-pointer hover:bg-gray-50 rounded px-1">
      <div className="flex items-center">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <span className="ml-2 text-sm text-gray-700">{label}</span>
      </div>
      {count !== undefined && (
        <span className="text-xs text-gray-500">({count})</span>
      )}
    </label>
  );

  return (
    <div className={`bg-white border-r border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FunnelIcon className="w-5 h-5 mr-2 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          </div>
          {onToggle && (
            <button
              onClick={onToggle}
              className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Filter Content */}
      <div className="p-4 space-y-4">
        {/* Categories */}
        <FilterSection
          title="Categories"
          icon={TagIcon}
          section="categories"
          loading={categoriesLoading}
        >
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {categories?.map((category) => (
              <FilterCheckbox
                key={category.id}
                id={`category-${category.id}`}
                label={category.attributes.name}
                checked={filters.categories.includes(category.attributes.slug)}
                onChange={() => handleCategoryToggle(category.attributes.slug)}
                count={category.attributes.articles?.data?.length}
              />
            ))}
          </div>
        </FilterSection>

        {/* Authors */}
        <FilterSection
          title="Authors"
          icon={UserIcon}
          section="authors"
          loading={authorsLoading}
        >
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {authors?.map((author) => (
              <FilterCheckbox
                key={author.id}
                id={`author-${author.id}`}
                label={author.attributes.name}
                checked={filters.authors.includes(author.attributes.slug)}
                onChange={() => handleAuthorToggle(author.attributes.slug)}
                count={author.attributes.articles?.data?.length}
              />
            ))}
          </div>
        </FilterSection>

        {/* Tags */}
        <FilterSection
          title="Tags"
          icon={TagIcon}
          section="tags"
          loading={tagsLoading}
        >
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {tags?.map((tag) => (
              <FilterCheckbox
                key={tag.id}
                id={`tag-${tag.id}`}
                label={tag.attributes.name}
                checked={filters.tags.includes(tag.attributes.slug)}
                onChange={() => handleTagToggle(tag.attributes.slug)}
              />
            ))}
          </div>
        </FilterSection>

        {/* Date Range */}
        <FilterSection
          title="Date Range"
          icon={CalendarIcon}
          section="dateRange"
        >
          <div className="space-y-3">
            <div>
              <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
                From
              </label>
              <input
                type="date"
                id="start-date"
                value={filters.dateRange.start || ''}
                onChange={(e) => handleDateRangeChange('start', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
                To
              </label>
              <input
                type="date"
                id="end-date"
                value={filters.dateRange.end || ''}
                onChange={(e) => handleDateRangeChange('end', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </FilterSection>

        {/* Sort Options */}
        <FilterSection
          title="Sort By"
          icon={FunnelIcon}
          section="sort"
        >
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleSortChange(e.target.value as FilterOptions['sortBy'], filters.sortOrder)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="relevance">Relevance</option>
                <option value="date">Date</option>
                <option value="title">Title</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleSortChange(filters.sortBy, e.target.value as FilterOptions['sortOrder'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        </FilterSection>
      </div>
    </div>
  );
}

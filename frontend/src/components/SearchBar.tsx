// frontend/src/components/SearchBar.tsx
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { MagnifyingGlassIcon, XMarkIcon, ClockIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useSearchArticles, useCategories, useTags } from "@/lib/hooks";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
  showSuggestions?: boolean;
  showHistory?: boolean;
  realTimeSearch?: boolean;
}

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'category' | 'tag' | 'article';
  count?: number;
}

export default function SearchBar({ 
  placeholder = "Search articles...", 
  className = "",
  onSearch,
  showSuggestions = true,
  showHistory = true,
  realTimeSearch = false
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Get search results for real-time suggestions
  const { data: searchResults } = useSearchArticles(query, {
    populate: {
      featuredImage: true,
      author: true,
      categories: true,
      tags: true,
    },
    pagination: { limit: 5 }
  }, { enabled: realTimeSearch && query.length > 2 });

  // Get categories and tags for suggestions
  const { data: categories } = useCategories({ pagination: { limit: 10 } });
  const { data: tags } = useTags({ pagination: { limit: 10 } });

  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Generate suggestions based on query and available data
  const generateSuggestions = useCallback((searchQuery: string): SearchSuggestion[] => {
    const suggestions: SearchSuggestion[] = [];
    
    if (!searchQuery || searchQuery.length < 2) {
      // Show recent searches and popular categories/tags
      if (showHistory && searchHistory.length > 0) {
        suggestions.push(...searchHistory.slice(0, 3).map((term, index) => ({
          id: `recent-${index}`,
          text: term,
          type: 'recent' as const
        })));
      }
      
      if (categories && categories.length > 0) {
        suggestions.push(...categories.slice(0, 3).map(category => ({
          id: `category-${category.id}`,
          text: category.attributes.name,
          type: 'category' as const,
          count: category.attributes.articles?.data?.length || 0
        })));
      }
      
      if (tags && tags.length > 0) {
        suggestions.push(...tags.slice(0, 2).map(tag => ({
          id: `tag-${tag.id}`,
          text: tag.attributes.name,
          type: 'tag' as const
        })));
      }
      
      return suggestions;
    }

    // Filter suggestions based on query
    const queryLower = searchQuery.toLowerCase();
    
    // Add matching recent searches
    if (showHistory) {
      const matchingHistory = searchHistory
        .filter(term => term.toLowerCase().includes(queryLower))
        .slice(0, 2)
        .map((term, index) => ({
          id: `recent-${index}`,
          text: term,
          type: 'recent' as const
        }));
      suggestions.push(...matchingHistory);
    }
    
    // Add matching categories
    if (categories) {
      const matchingCategories = categories
        .filter(category => category.attributes.name.toLowerCase().includes(queryLower))
        .slice(0, 2)
        .map(category => ({
          id: `category-${category.id}`,
          text: category.attributes.name,
          type: 'category' as const,
          count: category.attributes.articles?.data?.length || 0
        }));
      suggestions.push(...matchingCategories);
    }
    
    // Add matching tags
    if (tags) {
      const matchingTags = tags
        .filter(tag => tag.attributes.name.toLowerCase().includes(queryLower))
        .slice(0, 2)
        .map(tag => ({
          id: `tag-${tag.id}`,
          text: tag.attributes.name,
          type: 'tag' as const
        }));
      suggestions.push(...matchingTags);
    }
    
    // Add matching articles from real-time search
    if (realTimeSearch && searchResults) {
      const matchingArticles = searchResults
        .slice(0, 3)
        .map(article => ({
          id: `article-${article.id}`,
          text: article.attributes.title,
          type: 'article' as const
        }));
      suggestions.push(...matchingArticles);
    }
    
    return suggestions;
  }, [searchHistory, categories, tags, searchResults, showHistory, realTimeSearch]);

  // Update suggestions when query or data changes
  useEffect(() => {
    if (showSuggestions) {
      const newSuggestions = generateSuggestions(query);
      setSuggestions(newSuggestions);
      setIsOpen(newSuggestions.length > 0);
    }
  }, [query, generateSuggestions, showSuggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
  };

  // Save search to history
  const saveToHistory = useCallback((searchTerm: string) => {
    if (!searchTerm.trim()) return;
    
    const newHistory = [searchTerm, ...searchHistory.filter(term => term !== searchTerm)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  }, [searchHistory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      saveToHistory(query.trim());
      
      if (onSearch) {
        onSearch(query.trim());
      } else {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }
      setIsOpen(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    saveToHistory(suggestion.text);
    
    if (onSearch) {
      onSearch(suggestion.text);
    } else {
      // Handle different suggestion types
      if (suggestion.type === 'category') {
        router.push(`/categories/${suggestion.text.toLowerCase().replace(/\s+/g, '-')}`);
      } else if (suggestion.type === 'tag') {
        router.push(`/tags/${suggestion.text.toLowerCase().replace(/\s+/g, '-')}`);
      } else {
        router.push(`/search?q=${encodeURIComponent(suggestion.text)}`);
      }
    }
    setIsOpen(false);
  };

  const clearSearch = () => {
    setQuery("");
    setIsOpen(false);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-white/10 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {/* Recent searches section */}
          {suggestions.some(s => s.type === 'recent') && (
            <div className="px-4 py-2 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Recent</h4>
                {showHistory && searchHistory.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="text-xs text-gray-500 hover:text-gray-300"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          )}
          
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-3 text-left text-gray-300 hover:bg-gray-700 hover:text-white transition-colors flex items-center"
            >
              <div className="flex items-center flex-1">
                {suggestion.type === 'recent' && (
                  <ClockIcon className="w-4 h-4 mr-3 text-gray-400" />
                )}
                {suggestion.type === 'category' && (
                  <div className="w-4 h-4 mr-3 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-xs text-white font-bold">C</span>
                  </div>
                )}
                {suggestion.type === 'tag' && (
                  <div className="w-4 h-4 mr-3 rounded-full bg-green-500 flex items-center justify-center">
                    <span className="text-xs text-white font-bold">#</span>
                  </div>
                )}
                {suggestion.type === 'article' && (
                  <MagnifyingGlassIcon className="w-4 h-4 mr-3 text-gray-400" />
                )}
                <span className="flex-1">{suggestion.text}</span>
                {suggestion.count !== undefined && (
                  <span className="text-xs text-gray-500 ml-2">
                    {suggestion.count} articles
                  </span>
                )}
              </div>
            </button>
          ))}
          
          {/* Categories section */}
          {suggestions.some(s => s.type === 'category') && (
            <div className="px-4 py-2 border-t border-white/10">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Categories</h4>
            </div>
          )}
          
          {/* Tags section */}
          {suggestions.some(s => s.type === 'tag') && (
            <div className="px-4 py-2 border-t border-white/10">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Tags</h4>
            </div>
          )}
        </div>
      )}

      {/* No results message */}
      {isOpen && query.length > 2 && suggestions.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-white/10 rounded-lg shadow-lg z-50 p-4">
          <p className="text-gray-400 text-sm">No suggestions found for "{query}"</p>
          <p className="text-xs text-gray-500 mt-1">Try different keywords or check spelling</p>
        </div>
      )}
    </div>
  );
}

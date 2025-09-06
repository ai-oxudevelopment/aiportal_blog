// frontend/src/app/search/page.tsx
"use client";

import { useSearchParams } from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import SearchResults from '@/components/SearchResults';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Search Articles</h1>
          
          {/* Search Bar */}
          <div className="mb-8">
            <SearchBar 
              placeholder="Search articles, categories, authors..."
              showSuggestions={true}
              showHistory={true}
              realTimeSearch={true}
              className="max-w-2xl"
            />
          </div>

          {/* Search Results */}
          {query && (
            <SearchResults query={query} />
          )}

          {/* Search Instructions */}
          {!query && (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Discover Articles
              </h3>
              <p className="text-gray-600 mb-4">
                Search through our collection of articles by title, content, author, or category.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-2">Search by Keywords</h4>
                  <p className="text-sm text-gray-600">
                    Find articles containing specific words or phrases in their title or content.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-2">Filter by Category</h4>
                  <p className="text-sm text-gray-600">
                    Browse articles by topic using our category filters and tags.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-2">Find by Author</h4>
                  <p className="text-sm text-gray-600">
                    Discover articles written by your favorite authors and contributors.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

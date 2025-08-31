// frontend/src/app/search/page.tsx
import SearchArticles from '@/components/SearchArticles';

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Search Articles</h1>
        <SearchArticles />
      </div>
    </div>
  );
}

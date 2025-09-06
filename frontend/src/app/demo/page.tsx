// frontend/src/app/demo/page.tsx
'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';
import ArticlesList from '@/components/ArticlesList';
import CategoryList from '@/components/CategoryList';
import TagCloud from '@/components/TagCloud';
import ArticleDetail from '@/components/ArticleDetail';
import RelatedArticles from '@/components/RelatedArticles';
import SocialShare from '@/components/SocialShare';

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState('articles');

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Article Display Components Demo
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Демонстрация новых компонентов для отображения статей, категорий и тегов
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {[
              { id: 'articles', label: 'Articles List' },
              { id: 'categories', label: 'Categories' },
              { id: 'tags', label: 'Tag Cloud' },
              { id: 'detail', label: 'Article Detail' },
              { id: 'social', label: 'Social Share' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            {activeTab === 'articles' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Articles List</h2>
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Default Variant</h3>
                    <ArticlesList 
                      variant="default"
                      title="Recent Articles"
                      showAuthor={true}
                      showReadingTime={true}
                      showCategories={true}
                    />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Featured Variant</h3>
                    <ArticlesList 
                      variant="featured"
                      title="Featured Articles"
                      showAuthor={true}
                      showReadingTime={true}
                      showCategories={true}
                    />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Compact Variant</h3>
                    <ArticlesList 
                      variant="compact"
                      title="Compact View"
                      showAuthor={true}
                      showReadingTime={true}
                      showCategories={false}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'categories' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Categories</h2>
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Default Grid</h3>
                    <CategoryList 
                      variant="default"
                      showCount={true}
                      showDescription={true}
                    />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Grid Layout</h3>
                    <CategoryList 
                      variant="grid"
                      showCount={true}
                      showDescription={true}
                    />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Sidebar Style</h3>
                    <CategoryList 
                      variant="sidebar"
                      showCount={true}
                      showDescription={false}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tags' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Tag Cloud</h2>
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Default Tag Cloud</h3>
                    <TagCloud 
                      variant="default"
                      showCount={true}
                      limit={20}
                    />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Compact Tags</h3>
                    <TagCloud 
                      variant="compact"
                      showCount={true}
                      limit={15}
                    />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Sidebar Tags</h3>
                    <TagCloud 
                      variant="sidebar"
                      showCount={false}
                      limit={10}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'detail' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Article Detail</h2>
                <div className="max-w-4xl mx-auto">
                  <ArticlesList 
                    variant="default"
                    title="Select an article to view details"
                    limit={1}
                  />
                  <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800">
                      <strong>Note:</strong> ArticleDetail component requires a specific article object. 
                      In a real implementation, this would be used on individual article pages.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'social' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Social Share</h2>
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Default Social Share</h3>
                    <SocialShare 
                      url="https://example.com/article"
                      title="Example Article Title"
                      description="This is an example article description"
                      variant="default"
                    />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Compact Social Share</h3>
                    <SocialShare 
                      url="https://example.com/article"
                      title="Example Article Title"
                      description="This is an example article description"
                      variant="compact"
                    />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Minimal Social Share</h3>
                    <SocialShare 
                      url="https://example.com/article"
                      title="Example Article Title"
                      description="This is an example article description"
                      variant="minimal"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Component Information */}
          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Созданные компоненты:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <h4 className="font-medium mb-2">Article Components:</h4>
                <ul className="space-y-1">
                  <li>• ArticleCard - карточки статей с вариантами</li>
                  <li>• ArticleDetail - полное отображение статьи</li>
                  <li>• ArticlesList - список статей</li>
                  <li>• RelatedArticles - связанные статьи</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Navigation Components:</h4>
                <ul className="space-y-1">
                  <li>• CategoryList - список категорий</li>
                  <li>• TagCloud - облако тегов</li>
                  <li>• SocialShare - социальные сети</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 text-sm text-blue-700">
              <p><strong>Утилиты:</strong> calculateReadingTime, formatDate, generateSocialShareUrls, copyToClipboard и другие</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

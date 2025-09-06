// frontend/src/components/CacheOptimisticExample.tsx
// Example component demonstrating cache and optimistic updates

'use client';

import React, { useState } from 'react';
import { useEnhancedArticles, useEnhancedArticle, useCacheStats, useOptimisticStats } from '@/lib/hooks';
import { useOptimistic } from '@/lib/hooks/useCache';
import { cacheManager } from '@/lib/cache';
import { optimisticManager } from '@/lib/optimistic';
import { LoadingButton, InlineLoading, RetryComponent } from './LoadingStates';
import { useNotifications } from './NotificationSystem';

// Example article data
const mockArticle = {
  id: 1,
  attributes: {
    title: 'Sample Article',
    slug: 'sample-article',
    content: 'This is a sample article content.',
    excerpt: 'This is a sample excerpt.',
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

// Cache demonstration component
const CacheDemo: React.FC = () => {
  const [articleId, setArticleId] = useState('sample-article');
  const [cacheKey, setCacheKey] = useState('demo:article:sample-article');
  
  const { data, isLoading, error, isStale, lastFetched, refetch, invalidate, cacheStats } = useEnhancedArticle(articleId, {
    useCache: true,
    cacheTTL: 5 * 60 * 1000, // 5 minutes
    cacheTags: ['articles', 'demo'],
    onCacheHit: (data) => console.log('Cache hit:', data),
    onCacheMiss: () => console.log('Cache miss'),
  });

  const { stats: cacheStatsData, clearCache, cleanupCache } = useCacheStats();

  const handleSetCache = () => {
    cacheManager.set(cacheKey, mockArticle, {
      ttl: 5 * 60 * 1000,
      tags: ['demo'],
    });
  };

  const handleGetCache = () => {
    const cached = cacheManager.get(cacheKey);
    console.log('Cached data:', cached);
  };

  const handleInvalidateCache = () => {
    cacheManager.delete(cacheKey);
  };

  const handleInvalidateByTag = () => {
    cacheManager.invalidateByTag('demo');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Cache Demonstration</h2>
      
      {/* Cache Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Cache Operations</h3>
          
          <div className="space-y-2">
            <input
              type="text"
              value={cacheKey}
              onChange={(e) => setCacheKey(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Cache key"
            />
            
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={handleSetCache}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Set Cache
              </button>
              
              <button
                onClick={handleGetCache}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                Get Cache
              </button>
              
              <button
                onClick={handleInvalidateCache}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Invalidate Key
              </button>
              
              <button
                onClick={handleInvalidateByTag}
                className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700"
              >
                Invalidate Tag
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Cache Statistics</h3>
          
          <div className="text-sm space-y-1">
            <p><strong>Size:</strong> {cacheStatsData.size}</p>
            <p><strong>Hit Rate:</strong> {(cacheStatsData.hitRate * 100).toFixed(1)}%</p>
            <p><strong>Hits:</strong> {cacheStatsData.entries.length}</p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={clearCache}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            >
              Clear All
            </button>
            
            <button
              onClick={cleanupCache}
              className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
            >
              Cleanup
            </button>
          </div>
        </div>
      </div>

      {/* Article Display */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Article Data</h3>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={articleId}
            onChange={(e) => setArticleId(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Article slug"
          />
          
          <LoadingButton
            loading={isLoading}
            onClick={refetch}
          >
            Refetch
          </LoadingButton>
          
          <button
            onClick={invalidate}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Invalidate
          </button>
        </div>

        {isLoading && <InlineLoading message="Loading article..." />}
        
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-red-800 dark:text-red-200">Error: {error.message}</p>
          </div>
        )}

        {data && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              {data.attributes.title}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              {data.attributes.excerpt}
            </p>
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <p><strong>Cache Hit:</strong> {cacheStats.hit ? 'Yes' : 'No'}</p>
              <p><strong>Is Stale:</strong> {isStale ? 'Yes' : 'No'}</p>
              <p><strong>Last Fetched:</strong> {lastFetched?.toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Optimistic updates demonstration component
const OptimisticDemo: React.FC = () => {
  const [article, setArticle] = useState(mockArticle);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(article.attributes.title);
  const [editContent, setEditContent] = useState(article.attributes.content);

  const { notify } = useNotifications();
  const { stats: optimisticStats, clearOptimistic } = useOptimisticStats();

  const {
    data: optimisticData,
    isOptimistic,
    pendingUpdates,
    update: optimisticUpdate,
    confirm: confirmUpdate,
    cancel: cancelUpdate,
    execute: executeUpdate,
  } = useOptimistic({
    initialData: article,
    onSuccess: (data) => {
      notify.success('Article updated successfully!');
      setArticle(data);
    },
    onError: (error, originalData) => {
      notify.error('Failed to update article: ' + error.message);
      if (originalData) {
        setArticle(originalData);
      }
    },
    onRollback: (originalData) => {
      notify.warning('Update rolled back');
      setArticle(originalData);
    },
  });

  const handleSave = async () => {
    const updateId = optimisticUpdate({
      attributes: {
        ...article.attributes,
        title: editTitle,
        content: editContent,
        updatedAt: new Date().toISOString(),
      },
    });

    // Simulate API call
    try {
      await executeUpdate(updateId, async (data) => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate random failure
        if (Math.random() < 0.3) {
          throw new Error('Network error');
        }
        
        return data;
      });
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const handleCancel = () => {
    if (pendingUpdates.length > 0) {
      cancelUpdate(pendingUpdates[0].id);
    }
    setIsEditing(false);
    setEditTitle(article.attributes.title);
    setEditContent(article.attributes.content);
  };

  const handleConfirm = () => {
    if (pendingUpdates.length > 0) {
      confirmUpdate(pendingUpdates[0].id);
    }
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Optimistic Updates Demonstration</h2>
      
      {/* Optimistic Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Optimistic Statistics</h3>
          
          <div className="text-sm space-y-1">
            <p><strong>Total Updates:</strong> {optimisticStats.totalUpdates}</p>
            <p><strong>Pending Updates:</strong> {optimisticStats.pendingUpdates}</p>
            <p><strong>Failed Updates:</strong> {optimisticStats.failedUpdates}</p>
            <p><strong>Success Rate:</strong> {(optimisticStats.successRate * 100).toFixed(1)}%</p>
          </div>
          
          <button
            onClick={clearOptimistic}
            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Clear All
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Pending Updates</h3>
          
          {pendingUpdates.length > 0 ? (
            <div className="space-y-2">
              {pendingUpdates.map((update) => (
                <div key={update.id} className="p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    {update.type} - {update.status} (Retry: {update.retryCount})
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No pending updates</p>
          )}
        </div>
      </div>

      {/* Article Editor */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Article Editor</h3>
        
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900 dark:text-white">
              {optimisticData.attributes.title}
            </h4>
            {isOptimistic && (
              <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 text-xs rounded">
                Optimistic
              </span>
            )}
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            {optimisticData.attributes.content}
          </p>
          
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <p>Last updated: {optimisticData.attributes.updatedAt}</p>
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Content
              </label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div className="flex gap-2">
              <LoadingButton
                loading={pendingUpdates.length > 0}
                onClick={handleSave}
              >
                Save Changes
              </LoadingButton>
              
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Edit Article
            </button>
            
            {pendingUpdates.length > 0 && (
              <>
                <button
                  onClick={handleConfirm}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Confirm
                </button>
                
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Main example component
export const CacheOptimisticExample: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cache' | 'optimistic'>('cache');

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">
        Cache & Optimistic Updates Demo
      </h1>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-8">
        <button
          onClick={() => setActiveTab('cache')}
          className={`px-4 py-2 rounded-md font-medium ${
            activeTab === 'cache'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Cache Demo
        </button>
        
        <button
          onClick={() => setActiveTab('optimistic')}
          className={`px-4 py-2 rounded-md font-medium ${
            activeTab === 'optimistic'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Optimistic Updates
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'cache' && <CacheDemo />}
      {activeTab === 'optimistic' && <OptimisticDemo />}
    </div>
  );
};

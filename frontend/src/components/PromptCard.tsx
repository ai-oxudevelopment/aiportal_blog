// frontend/src/components/PromptCard.tsx
"use client";

import React, { useState } from 'react';

interface PromptCardProps {
  prompt: {
    id: number;
    attributes: {
      title: string;
      slug: string;
      content: string;
      tags?: {
        data: Array<{
          id: number;
          attributes: {
            name: string;
            slug: string;
          };
        }>;
      };
      categories?: {
        data: Array<{
          id: number;
          attributes: {
            name: string;
            slug: string;
          };
        }>;
      };
      category?: {
        data: {
          attributes: {
            name: string;
            slug: string;
          };
        };
      };
      publishedAt: string;
    };
  };
}

export default function PromptCard({ prompt }: PromptCardProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showTagsDropdown, setShowTagsDropdown] = useState(false);

  const { title, content, tags, categories, category, publishedAt } = prompt.attributes;
  
  // Debug: log the data structure
  console.log('PromptCard data:', { title, tags, categories, category });
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: content,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing: ', err);
      }
    } else {
      // Fallback: copy to clipboard
      handleCopy();
    }
  };

  const handleUse = () => {
    // Navigate to a page where user can use the prompt
    window.open(`/prompts/${prompt.attributes.slug}`, '_blank');
  };

  const handleViewFull = () => {
    window.open(`/prompts/${prompt.attributes.slug}`, '_blank');
  };

  const handleTryPrompt = () => {
    setIsAIDialogOpen(true);
    setUserQuery('');
    setAiResponse('');
  };

  const handleSendQuery = async () => {
    if (!userQuery.trim()) return;
    
    setIsLoading(true);
    try {
      // Simulate AI response - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setAiResponse(`AI Response to: "${userQuery}"\n\nThis is a simulated response. In a real implementation, this would call your AI service with the prompt: "${content}" and user query: "${userQuery}"`);
    } catch (error) {
      setAiResponse('Error: Failed to get AI response');
    } finally {
      setIsLoading(false);
    }
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showTagsDropdown) {
        setShowTagsDropdown(false);
      }
    };

    if (showTagsDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showTagsDropdown]);

  return (
    <>
      <div className="group relative bg-zinc-900/90 border border-zinc-800/50 rounded-lg overflow-hidden hover:border-zinc-700/50 hover:bg-zinc-800/50 transition-all duration-200 h-full flex flex-col cursor-pointer"
           onClick={handleViewFull}>
        {/* Main Content Area */}
        <div className="p-4 flex-grow flex flex-col">
          {/* Description Text - Monospace like cursor.directory */}
          <div className="text-gray-300 text-xs leading-4 mb-3 flex-grow font-mono">
            <p className="line-clamp-4">
              {content}
            </p>
          </div>
          
          {/* Title and Technologies */}
          <div className="mt-auto">
            <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2 leading-tight">
              {title}
            </h3>
            
            {/* Technologies/Tags - Like cursor.directory */}
            <div className="relative">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                {tags?.data && tags.data.length > 0 ? (
                  <>
                    <span className="text-gray-300 font-medium">
                      {tags.data[0].attributes.name}
                    </span>
                    {tags.data.length > 1 && (
                      <>
                        <span className="text-gray-500">
                          {tags.data[1].attributes.name}
                        </span>
                        {tags.data.length > 2 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowTagsDropdown(!showTagsDropdown);
                            }}
                            className="text-gray-500 flex items-center gap-1 hover:text-gray-400 transition-colors"
                          >
                            +{tags.data.length - 2} more
                            <svg 
                              className={`w-3 h-3 transition-transform ${showTagsDropdown ? 'rotate-180' : ''}`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        )}
                      </>
                    )}
                  </>
                ) : (category?.data || categories?.data?.[0]) ? (
                  <span className="text-gray-300 font-medium">
                    {category?.data?.attributes.name || categories?.data?.[0]?.attributes.name}
                  </span>
                ) : (
                  <span className="text-gray-500 text-xs">No tags</span>
                )}
              </div>
              
              {/* Tags Dropdown */}
              {showTagsDropdown && tags?.data && tags.data.length > 2 && (
                <div className="absolute top-full left-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg z-10 min-w-[200px]">
                  <div className="p-2">
                    {tags.data.map((tag, index) => (
                      <div
                        key={tag.id}
                        className={`px-2 py-1 text-xs text-gray-300 hover:bg-zinc-700 rounded transition-colors ${
                          index < 2 ? 'text-gray-500' : ''
                        }`}
                      >
                        {tag.attributes.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Subtle Action Buttons - Only on hover */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCopy();
              }}
              className={`w-7 h-7 rounded-md flex items-center justify-center text-xs transition-colors ${
                copied 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-zinc-700/50 hover:bg-zinc-600/50 text-gray-300'
              }`}
              title={copied ? 'Скопировано!' : 'Копировать'}
            >
              {copied ? (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleShare();
              }}
              className="w-7 h-7 rounded-md bg-zinc-700/50 hover:bg-zinc-600/50 text-gray-300 flex items-center justify-center transition-colors"
              title="Поделиться"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Blue Try Button - Bottom Right Corner */}
        <div className="absolute bottom-3 right-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleTryPrompt();
            }}
            className="w-7 h-7 rounded-md bg-zinc-700/50 hover:bg-zinc-600/70 text-gray-300 hover:text-blue-400 flex items-center justify-center transition-all duration-200 hover:scale-105"
            title="Попробовать AI-чат"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/20 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-white font-semibold text-lg">{title}</h3>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <pre className="text-gray-300 text-sm font-mono whitespace-pre-wrap leading-relaxed">
                {content}
              </pre>
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-white/10 flex gap-2">
              <button
                onClick={handleCopy}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  copied 
                    ? 'bg-green-600/20 text-green-400' 
                    : 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-400'
                }`}
              >
                {copied ? 'Скопировано!' : 'Копировать текст'}
              </button>
              <button
                onClick={handleShare}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 transition-colors"
              >
                Поделиться
              </button>
              <button
                onClick={handleUse}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-zinc-700/50 hover:bg-zinc-600/70 text-white border border-zinc-600/50 hover:border-zinc-500/70 transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                Использовать
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Dialog Modal */}
      {isAIDialogOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/20 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold text-lg">Попробовать промпт</h3>
                <p className="text-gray-400 text-sm mt-1">{title}</p>
              </div>
              <button
                onClick={() => setIsAIDialogOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 space-y-4 max-h-[50vh] overflow-y-auto">
              {/* Prompt Display */}
              <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/50">
                <h4 className="text-white text-sm font-medium mb-2">Промпт:</h4>
                <pre className="text-gray-300 text-xs font-mono whitespace-pre-wrap leading-relaxed">
                  {content}
                </pre>
              </div>

              {/* User Input */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Ваш запрос:
                </label>
                <textarea
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  placeholder="Введите ваш запрос здесь..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
                  rows={3}
                />
              </div>

              {/* AI Response */}
              {aiResponse && (
                <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/50">
                  <h4 className="text-white text-sm font-medium mb-2">Ответ AI:</h4>
                  <pre className="text-gray-300 text-xs font-mono whitespace-pre-wrap leading-relaxed">
                    {aiResponse}
                  </pre>
                </div>
              )}

              {/* Loading State */}
              {isLoading && (
                <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/50">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    <span className="text-gray-300 text-sm">AI генерирует ответ...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-white/10 flex gap-2">
              <button
                onClick={handleSendQuery}
                disabled={!userQuery.trim() || isLoading}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600/20 hover:bg-blue-600/30 text-blue-400"
              >
                {isLoading ? 'Отправка...' : 'Отправить запрос'}
              </button>
              <button
                onClick={() => setIsAIDialogOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

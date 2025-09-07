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
  const [copied, setCopied] = useState(false);

  const { title, content, tags, categories, category, publishedAt } = prompt.attributes;
  
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

  return (
    <>
      <div className="group relative bg-zinc-900/90 border border-zinc-800/50 rounded-lg overflow-hidden hover:border-zinc-700/50 hover:bg-zinc-800/50 transition-all duration-200 h-full flex flex-col cursor-pointer"
           onClick={handleViewFull}>
        {/* Main Content Area */}
        <div className="p-5 flex-grow flex flex-col">
          {/* Description Text - Monospace like cursor.directory */}
          <div className="text-gray-300 text-sm leading-relaxed mb-4 flex-grow font-mono">
            <p className="line-clamp-4">
              {content}
            </p>
          </div>
          
          {/* Title and Technologies */}
          <div className="mt-auto">
            <h3 className="text-white font-semibold text-base mb-2 line-clamp-2">
              {title}
            </h3>
            
            {/* Technologies/Tags - Like cursor.directory */}
            <div className="flex items-center gap-2 text-xs text-gray-400">
              {tags?.data && tags.data.length > 0 ? (
                <>
                  <span className="text-gray-300">
                    {tags.data[0].attributes.name}
                  </span>
                  {tags.data.length > 1 && (
                    <>
                      <span className="text-gray-500">
                        {tags.data[1].attributes.name}
                      </span>
                      <span className="text-gray-500 flex items-center gap-1">
                        +{tags.data.length - 2} more
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </>
                  )}
                </>
              ) : (category?.data || categories?.data?.[0]) ? (
                <span className="text-gray-300">
                  {category?.data?.attributes.name || categories?.data?.[0]?.attributes.name}
                </span>
              ) : null}
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
                className="px-4 py-2 rounded-lg text-sm font-medium bg-green-600/20 hover:bg-green-600/30 text-green-400 transition-colors"
              >
                Использовать
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

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
      <div className="group relative bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden hover:border-white/20 hover:shadow-[0_0_80px_-20px_rgba(59,130,246,0.45)] transition-all duration-300 h-full flex flex-col">
        {/* Main Content Area */}
        <div className="p-4 flex-grow flex flex-col">
          {/* Description Text */}
          <div className="text-gray-300 text-sm leading-relaxed mb-4 flex-grow">
            <p className="line-clamp-4">
              {content}
            </p>
          </div>
          
          {/* Title and Technologies */}
          <div className="mt-auto">
            <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2">
              {title}
            </h3>
            
            {/* Technologies/Tags */}
            <div className="flex items-center gap-2 text-xs text-gray-400">
              {tags?.data && tags.data.length > 0 ? (
                <>
                  <span className="bg-gray-700/50 px-2 py-1 rounded">
                    {tags.data[0].attributes.name}
                  </span>
                  {tags.data.length > 1 && (
                    <span className="text-gray-500">
                      +{tags.data.length - 1} more
                    </span>
                  )}
                </>
              ) : (category?.data || categories?.data?.[0]) ? (
                <span className="bg-gray-700/50 px-2 py-1 rounded">
                  {category?.data?.attributes.name || categories?.data?.[0]?.attributes.name}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Overlay Action Buttons */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors ${
                copied 
                  ? 'bg-green-600/20 text-green-400' 
                  : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm'
              }`}
              title={copied ? 'Скопировано!' : 'Копировать'}
            >
              {copied ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
            
            <button
              onClick={handleShare}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm flex items-center justify-center transition-colors"
              title="Поделиться"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </button>
            
            <button
              onClick={handleUse}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm flex items-center justify-center transition-colors"
              title="Попробовать"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Bottom Action Button */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleViewFull}
            className="w-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <span>Перейти к полной странице</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
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

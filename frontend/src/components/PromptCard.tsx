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

  const { title, content, tags, category, publishedAt } = prompt.attributes;
  
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

  return (
    <>
      <div className="bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden hover:border-white/20 hover:shadow-[0_0_80px_-20px_rgba(59,130,246,0.45)] transition-all duration-300 h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2">
            {title}
          </h3>
          
          {/* Tags */}
          {tags?.data && tags.data.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {tags.data.slice(0, 3).map((tag) => (
                <span
                  key={tag.id}
                  className="inline-block bg-blue-600/20 text-blue-400 text-xs font-medium px-2 py-1 rounded-full"
                >
                  {tag.attributes.name}
                </span>
              ))}
              {tags.data.length > 3 && (
                <span className="inline-block bg-gray-600/20 text-gray-400 text-xs font-medium px-2 py-1 rounded-full">
                  +{tags.data.length - 3}
                </span>
              )}
            </div>
          )}
          
          {/* Category */}
          {category?.data && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="bg-gray-700/50 px-2 py-1 rounded">
                {category.data.attributes.name}
              </span>
            </div>
          )}
        </div>

        {/* Content Preview */}
        <div className="p-4 flex-grow">
          <div className="text-gray-300 text-sm line-clamp-3 mb-4">
            {content.substring(0, 150)}...
          </div>
          
          {/* Date */}
          <div className="text-xs text-gray-500 mb-4">
            {new Date(publishedAt).toLocaleDateString('ru-RU', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-white/10">
          <div className="flex gap-2">
            <button
              onClick={() => setIsPreviewOpen(true)}
              className="flex-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-sm font-medium px-3 py-2 rounded-lg transition-colors"
            >
              Предпросмотр
            </button>
            <button
              onClick={handleCopy}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                copied 
                  ? 'bg-green-600/20 text-green-400' 
                  : 'bg-gray-600/20 hover:bg-gray-600/30 text-gray-300'
              }`}
            >
              {copied ? '✓' : '📋'}
            </button>
            <button
              onClick={handleShare}
              className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 transition-colors"
            >
              📤
            </button>
            <button
              onClick={handleUse}
              className="px-3 py-2 rounded-lg text-sm font-medium bg-green-600/20 hover:bg-green-600/30 text-green-400 transition-colors"
            >
              ▶
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

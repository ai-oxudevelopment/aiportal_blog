"use client";

import React, { useState, useMemo } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { useCachedArticles } from "../lib/hooks/useCachedData";
import { ErrorBoundary } from "../components/ErrorBoundary";
import type { Article } from "../lib/types";

// src/app/page.tsx

function HeroTopCard({
  title,
  description,
  buttonText = "Start building",
  gradientFrom = "from-sky-400",
  gradientVia = "via-blue-500",
  gradientTo = "to-purple-400"







}: {title: string;description: string;buttonText?: string;gradientFrom?: string;gradientVia?: string;gradientTo?: string;}) {
  return (
    <a
      className="group block overflow-hidden rounded-[28px] border border-white/10 bg-zinc-900/80 backdrop-blur-md transition-all duration-500 hover:scale-[1.01] hover:border-white/20 hover:shadow-[0_0_80px_-20px_rgba(59,130,246,0.45)] hover:ring-1 hover:ring-white/20"
      data-oid="hero-top-card">

      <div
        className="relative h-[320px] sm:h-[380px] md:h-[420px] lg:h-[480px]"
        data-oid="card-container">

        <div
          className={`absolute inset-0 bg-gradient-to-br ${gradientFrom} ${gradientVia} ${gradientTo} rounded-[28px]`}
          data-oid="gradient-bg">
        </div>
        <div
          className="absolute inset-0 rounded-[28px] opacity-70 bg-[radial-gradient(600px_380px_at_80%_-10%,rgba(255,255,255,0.6),transparent_60%)]"
          data-oid="radial-highlight">
        </div>

        <div
          className="absolute inset-x-0 bottom-0 p-4 sm:p-5 md:p-6"
          data-oid="content-container">

          {/* Text content container with transition */}
          <div
            className="w-full transition-transform duration-300 ease-out group-hover:-translate-y-3"
            data-oid="text-container"
            key="olk-SEyA">

            <h3
              className="text-white text-lg sm:text-xl md:text-2xl font-semibold tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)] leading-tight"
              data-oid="card-title">

              {title}
            </h3>
            <p
              className="mt-2 text-white/90 text-xs sm:text-sm leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)] max-w-[90%]"
              data-oid="card-description">

              {description}
            </p>
          </div>

          {/* Button that slides up from below */}
          <div
            className="mt-4 flex items-center gap-3 transform translate-y-full opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100"
            data-oid="button-container">

            <span
              className="inline-flex items-center gap-2 rounded-full bg-white text-zinc-900 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold shadow-[0_8px_30px_rgba(255,255,255,0.25)] transition-colors duration-300 hover:bg-white/95"
              data-oid="action-button">

              {buttonText}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                data-oid="arrow-icon">

                <path
                  fill="currentColor"
                  d="M13 5l7 7-7 7v-4H4v-6h9V5z"
                  data-oid="arrow-path" />

              </svg>
            </span>
          </div>
        </div>
      </div>
    </a>);

}

function HeroTopCards() {
  return (
    <section className="py-6 md:py-10 lg:py-14" data-oid="-4isrhx">
      <div
        className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 pr-0 pl-0"
        data-oid=".binyzq">

        <div
          className="grid gap-4 md:gap-6 lg:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          data-oid=":au0ncx">

          <HeroTopCard
            title="gpt-oss-120b"
            description="A large open model designed to run in data centers and on high-end desktops and laptops."
            buttonText="Start building"
            gradientFrom="from-sky-400"
            gradientVia="via-blue-500"
            gradientTo="to-purple-400"
            data-oid="zzd-.n2" />

          <HeroTopCard
            title="gpt-oss-20b"
            description="A medium-sized open model that can run on most desktops and laptops."
            buttonText="Start building"
            gradientFrom="from-purple-400"
            gradientVia="via-violet-500"
            gradientTo="to-blue-400"
            data-oid="n1jibj8" />

          <HeroTopCard
            title="gpt-oss-2b"
            description="A medium-sized open model that can run on most desktops and laptops."
            buttonText="Start building"
            gradientFrom="from-indigo-200"
            gradientVia="via-violet-300"
            gradientTo="to-purple-200"
            data-oid="byfymkm" />

        </div>
      </div>
    </section>);
}

function PromptArticlesSection() {
  // Fetch articles with type "prompt"
  const { data: articles, loading, error } = useCachedArticles({
    filters: {
      type: {
        $eq: "prompt"
      }
    }
  });

  if (loading) {
    return (
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold text-white mb-6">AI Prompts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-700 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold text-white mb-6">AI Prompts</h2>
          <div className="text-center py-8">
            <div className="max-w-sm mx-auto">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-400 text-sm">Ошибка загрузки промптов</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!articles || articles.length === 0) {
    return (
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold text-white mb-6">AI Prompts</h2>
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              {/* Animated prompt illustration */}
              <div className="w-32 h-32 mx-auto mb-6 relative">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  {/* Background circle with subtle animation */}
                  <circle 
                    cx="100" 
                    cy="100" 
                    r="90" 
                    fill="url(#promptGradient)" 
                    opacity="0.1"
                    className="animate-pulse"
                  />
                  
                  {/* Gradient definition */}
                  <defs>
                    <linearGradient id="promptGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                  
                  {/* Floating prompt bubbles */}
                  <g className="animate-bounce" style={{ animationDuration: '3s' }}>
                    <circle cx="80" cy="80" r="15" fill="#10b981" opacity="0.8" />
                    <circle cx="120" cy="70" r="12" fill="#3b82f6" opacity="0.9" />
                    <circle cx="90" cy="120" r="10" fill="#8b5cf6" opacity="1" />
                  </g>
                  
                  {/* AI brain/neural network */}
                  <g className="animate-pulse" style={{ animationDuration: '2s' }}>
                    <circle cx="100" cy="100" r="8" fill="#fbbf24" />
                    <circle cx="85" cy="85" r="4" fill="#fbbf24" opacity="0.7" />
                    <circle cx="115" cy="85" r="4" fill="#fbbf24" opacity="0.7" />
                    <circle cx="85" cy="115" r="4" fill="#fbbf24" opacity="0.7" />
                    <circle cx="115" cy="115" r="4" fill="#fbbf24" opacity="0.7" />
                  </g>
                  
                  {/* Connection lines */}
                  <g className="animate-ping" style={{ animationDuration: '4s' }}>
                    <line x1="100" y1="100" x2="85" y2="85" stroke="#fbbf24" strokeWidth="2" opacity="0.5" />
                    <line x1="100" y1="100" x2="115" y2="85" stroke="#fbbf24" strokeWidth="2" opacity="0.5" />
                    <line x1="100" y1="100" x2="85" y2="115" stroke="#fbbf24" strokeWidth="2" opacity="0.5" />
                    <line x1="100" y1="100" x2="115" y2="115" stroke="#fbbf24" strokeWidth="2" opacity="0.5" />
                  </g>
                </svg>
              </div>
              
              {/* Minimal text */}
              <h4 className="text-xl font-semibold text-white mb-2">No Prompts Yet</h4>
              <p className="text-gray-400 text-sm">AI prompts are being prepared</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-white">AI Prompts</h2>
          <span className="text-sm text-gray-400">{articles.length} prompts available</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {articles.map((article) => {
            const {
              id,
              attributes: {
                title,
                slug,
                excerpt,
                featuredImage,
                categories,
                publishedAt
              }
            } = article;
            
            const usage_count = (article.attributes as any).usage_count || 0;

            const publishDate = new Date(publishedAt || new Date());
            const categoryName = categories?.data?.[0]?.attributes?.name || 'Prompt';

            return (
              <a 
                key={id} 
                href={`/articles/${slug}`} 
                className="block group h-full" 
              >
                <div className="bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden hover:border-green-500/50 hover:shadow-[0_0_80px_-20px_rgba(16,185,129,0.45)] transition-all duration-300 h-full flex flex-col">
                  {/* Image */}
                  {featuredImage?.data && (
                    <div className="aspect-video relative overflow-hidden flex-shrink-0">
                      <img
                        src={featuredImage.data.attributes.url}
                        alt={featuredImage.data.attributes.alternativeText || title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      {/* Prompt badge */}
                      <div className="absolute top-2 right-2">
                        <span className="bg-green-600/90 text-white text-xs font-medium px-2 py-1 rounded-full">
                          AI Prompt
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Content */}
                  <div className="p-4 flex flex-col flex-grow">
                    {/* Category */}
                    {categories?.data && (
                      <div className="mb-2 flex-shrink-0">
                        <span className="inline-block bg-green-600/20 text-green-400 text-xs font-medium px-2 py-1 rounded-full">
                          {categoryName}
                        </span>
                      </div>
                    )}
                    
                    {/* Title */}
                    <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-green-400 transition-colors line-clamp-2 flex-shrink-0">
                      {title}
                    </h3>
                    
                    {/* Excerpt */}
                    {excerpt && (
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2 flex-grow">
                        {excerpt}
                      </p>
                    )}
                    
                    {/* Footer with usage count and date */}
                    <div className="flex items-center justify-between text-xs text-gray-500 flex-shrink-0 mt-auto">
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>{usage_count} uses</span>
                      </div>
                      <time dateTime={publishDate.toISOString()}>
                        {publishDate.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </time>
                    </div>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function Page() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen bg-black text-gray-100" data-oid="rwsv1as">
      <Header
        onToggleMenu={toggleMenu}
        isMenuOpen={isMenuOpen}
        showSearch={false}
        data-oid="op4icmo" />

      <div className="flex" data-oid="ngvi.xv" key="olk-NeQN">
        <Sidebar isMenuOpen={isMenuOpen} />

        <main
          className={`pt-14 w-full transition-all duration-300 ease-in-out ${isMenuOpen ? "md:ml-64" : "ml-0"}`}
          data-oid="raq.yo:">

          <div
            className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-6 sm:py-8 md:py-10 flex-col justify-between block"
            data-oid="llmo4l2">

            {/* Hero Top Cards Section */}
            <section id="hero-section" data-oid="lcz75dl">
              <HeroTopCards data-oid="i8zhi4c" />
            </section>

            {/* AI Prompts Section */}
            <ErrorBoundary>
              <PromptArticlesSection />
            </ErrorBoundary>

          </div>
        </main>
      </div>
    </div>);
}
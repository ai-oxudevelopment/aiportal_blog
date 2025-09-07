// frontend/src/app/[section-slug]/page.tsx
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import WriterActionAgent from "../../components/WriterActionAgent";
import ChatGPTBusinessSection from "../../components/ChatGPTBusinessSection";
import { getSections } from "../../lib/api";
import { useSectionBySlug, useArticles, type HookError } from "../../lib/hooks";
import { useCachedSectionBySlug, useCachedArticles } from "../../lib/hooks/useCachedData";
import ArticleCard from "../../components/ArticleCard";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import type { Category, Section, Article } from "../../lib/types";

// Component Props Interfaces
interface TabsProps {
  section: Section | null;
  loading: boolean;
  selectedCategory: string;
  onCategoryChange: (slug: string) => void;
}

interface SectionProps {
  title: string;
  articles?: Article[];
  loading?: boolean;
  selectedCategory?: string;
  articlesError?: HookError | null;
  isStale?: boolean;
}

interface HeroTopCardProps {
  title: string;
  description: string;
  buttonText?: string;
  gradientFrom?: string;
  gradientVia?: string;
  gradientTo?: string;
}

interface PillProps {
  title: string;
  subtitle?: string;
}

function Tabs({ 
  section, 
  loading: sectionLoading, 
  selectedCategory, 
  onCategoryChange 
}: TabsProps) {
  // Get categories from the section data with memoization
  const allCategories = useMemo(() => {
    const sectionCategories = section?.attributes.categories?.data || [];
    
    console.log('Tabs Debug:', {
      section: section ? section.attributes.name : null,
      sectionCategories: sectionCategories.length,
      categories: sectionCategories.map(cat => ({ name: cat.attributes.name, slug: cat.attributes.slug }))
    });
    
    return [
      { name: "All", slug: "all" },
      ...sectionCategories.map(cat => ({
        name: cat.attributes.name,
        slug: cat.attributes.slug
      }))
    ];
  }, [section?.attributes.categories?.data]);

  if (sectionLoading) {
    return (
      <div className="flex flex-wrap gap-2 text-sm" data-oid="i469ghu">
        <div className="px-3 h-8 rounded-full border border-white/10 bg-gray-700 animate-pulse"></div>
        <div className="px-3 h-8 rounded-full border border-white/10 bg-gray-700 animate-pulse"></div>
        <div className="px-3 h-8 rounded-full border border-white/10 bg-gray-700 animate-pulse"></div>
      </div>
    );
  }

  // Show "All" category even if no section-specific categories exist
  const categoriesToShow = allCategories.length > 1 ? allCategories : [{ name: "All", slug: "all" }];

  return (
    <div className="flex flex-wrap gap-2 text-sm" data-oid="i469ghu">
      {categoriesToShow.map((category) =>
        <button
          key={category.slug}
          onClick={() => onCategoryChange(category.slug)}
          className={`px-3 h-8 rounded-full border transition-colors hover:text-white hover:border-white/30 ${
            selectedCategory === category.slug 
              ? "border-white/30 text-white" 
              : "border-white/10 text-gray-300"
          }`}
          data-oid="8jr82o9"
        >
          {category.name}
        </button>
      )}
    </div>
  );
}

function Pill({ title, subtitle }: PillProps) {
  return (
    <div
      className="inline-flex flex-col rounded-2xl bg-white text-black/90 px-4 py-3 shadow-lg"
      data-oid=":_vce:s">

      <span className="text-base font-semibold leading-none" data-oid="5walso3">
        {title}
      </span>
      {subtitle &&
      <span
        className="text-[13px] text-black/60 leading-tight mt-1"
        data-oid="vwj6asu">

          {subtitle}
        </span>
      }
    </div>);

}





function Thumb({ tone }: {tone: "blue" | "indigo" | "gray" | "green" | "orange" | "pink" | "purple" | "teal";}) {
  const toneMap: Record<string, string> = {
    blue: "from-sky-400 via-sky-500 to-blue-300",
    indigo: "from-indigo-300 via-indigo-400 to-violet-300",
    gray: "from-zinc-300 via-zinc-400 to-slate-300",
    green: "from-emerald-400 via-green-500 to-teal-300",
    orange: "from-orange-400 via-amber-400 to-yellow-300",
    pink: "from-pink-400 via-rose-400 to-red-300",
    purple: "from-purple-400 via-violet-400 to-indigo-300",
    teal: "from-teal-400 via-cyan-400 to-blue-300"
  };

  return (
    <div
      className={`aspect-square w-full rounded-xl border border-white/10 bg-gradient-to-tr ${toneMap[tone]} overflow-hidden relative`}
      data-oid=".gzk7hg">

      <div
        className="absolute inset-0 bg-[radial-gradient(300px_200px_at_80%_-20%,rgba(255,255,255,0.6),transparent_60%)]"
        data-oid="hl8x7y2" />

    </div>);

}


function HeroTopCard({
  title,
  description,
  buttonText = "Start building",
  gradientFrom = "from-sky-400",
  gradientVia = "via-blue-500",
  gradientTo = "to-purple-400"




}: HeroTopCardProps) {
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

// KeyDocumentCard is deprecated - using hardcoded data for now
function KeyDocumentCard({ document }: {document: {
  title: string;
  description: string;
  tone: "blue" | "green" | "orange" | "pink" | "purple" | "teal";
  date: string;
  href?: string;
  ctaText?: string;
  cover?: string;
};}) {
  const toneMap: Record<string, string> = {
    blue: "from-sky-400 via-sky-500 to-blue-300",
    green: "from-emerald-400 via-green-500 to-teal-300",
    orange: "from-orange-400 via-amber-400 to-yellow-300",
    pink: "from-pink-400 via-rose-400 to-red-300",
    purple: "from-purple-400 via-violet-400 to-indigo-300",
    teal: "from-teal-400 via-cyan-400 to-blue-300"
  };

  return (
    <a
      href={document.href ?? "#"}
      className="group block overflow-hidden rounded-[28px] border border-white/10 bg-zinc-900/80 backdrop-blur-md transition-all duration-500 hover:scale-[1.01] hover:border-white/20 hover:shadow-[0_0_80px_-20px_rgba(59,130,246,0.45)] hover:ring-1 hover:ring-white/20"
      data-oid="key-doc-card">

      <div
        className="relative h-[320px] sm:h-[380px] md:h-[420px] lg:h-[480px]"
        data-oid="t0t-oy8">

        {/* Background gradient */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${toneMap[document.tone]} rounded-[28px]`}
          data-oid="jkj014c" />


        {/* Radial highlights */}
        <div
          className="absolute inset-0 rounded-[28px] bg-[radial-gradient(600px_380px_at_80%_-10%,rgba(255,255,255,0.6),transparent_60%)] opacity-70"
          data-oid="i98095h" />


        <div
          className="absolute inset-0 rounded-[28px] bg-[radial-gradient(500px_420px_at_-10%_110%,rgba(255,255,255,0.35),transparent_60%)] opacity-60"
          data-oid="ovez2ds" />


        {/* Optional cover image */}
        {document.cover &&
        <img
          src={document.cover}
          alt={document.title}
          className="absolute inset-0 h-full w-full object-cover rounded-[28px] opacity-80 mix-blend-screen transition-transform duration-700 ease-out will-change-transform group-hover:-translate-y-1"
          data-oid="8b4446l" />

        }

        {/* Content pinned to bottom-left */}
        <div
          className="absolute inset-x-0 bottom-0 p-4 sm:p-6 md:p-8 lg:p-10"
          data-oid="tlv11_a">

          {/* Text content container with transition */}
          <div
            className="w-full transition-transform duration-300 ease-out group-hover:-translate-y-4"
            data-oid="r_gznaj">

            <h3
              className="text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)] leading-tight"
              data-oid=".hykh-_">

              {document.title}
            </h3>
            <p
              className="mt-2 sm:mt-3 md:mt-4 text-white/90 text-sm sm:text-base md:text-lg leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)] max-w-[95%]"
              data-oid="w1ilq.n">

              {document.description}
            </p>
        </div>

          {/* Button that slides up from below */}
          <div
            className="mt-3 sm:mt-4 md:mt-6 flex items-center gap-3 md:gap-4 transform translate-y-full opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100"
            data-oid="7va0vv8">

            <span
              className="inline-flex items-center gap-2 rounded-full bg-white text-zinc-900 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base font-semibold shadow-[0_8px_30px_rgba(255,255,255,0.25)] transition-colors duration-300 hover:bg-white/95"
              data-oid="2wus1l9">

              {document.ctaText ?? "Start building"}
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                data-oid="s2x578h">

                <path
                  fill="currentColor"
                  d="M13 5l7 7-7 7v-4H4v-6h9V5z"
                  data-oid="a72y-v5" />

              </svg>
            </span>
            <time
              className="text-white/80 text-xs sm:text-sm"
              data-oid="n4jhum6">

              {document.date}
            </time>
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

function Section({ title, articles, loading, selectedCategory, articlesError, isStale }: SectionProps) {
  // Group articles by category with memoization for performance
  const groupedArticles = useMemo(() => {
    if (!articles) return {};
    
    const groups: Record<string, typeof articles> = {};
    
    articles.forEach(article => {
      const categories = article.attributes.categories?.data || [];
      categories.forEach(category => {
        const categorySlug = category.attributes.slug;
        if (!groups[categorySlug]) {
          groups[categorySlug] = [];
        }
        groups[categorySlug].push(article);
      });
    });
    
    return groups;
  }, [articles]);

  // Get categories for display
  const categories = useMemo(() => {
    return Object.keys(groupedArticles).map(slug => {
      const categoryArticles = groupedArticles[slug];
      const categoryName = categoryArticles[0]?.attributes.categories?.data.find(cat => cat.attributes.slug === slug)?.attributes.name || slug;
      return {
        slug,
        name: categoryName,
        articles: categoryArticles.slice(0, 6) // Show only first 6 articles
      };
    });
  }, [groupedArticles]);

  return (
    <section className="mb-16 relative" data-oid="gfd3lvk">
      {/* Show subtle indicator when articles are being refreshed */}
      {isStale && articles && articles.length > 0 && (
        <div className="absolute top-0 right-0 z-10">
          <div className="bg-blue-600/70 backdrop-blur-sm text-white px-2 py-1 rounded text-xs flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
            <span>Refreshing</span>
          </div>
        </div>
      )}

      <div
        className="flex items-center justify-between mb-6"
        data-oid="pxy_r.m">

        <h2
          className="text-2xl font-semibold tracking-tight text-white"
          data-oid="75.2c_u">

          {title}
        </h2>
      </div>
      
      {loading && !articles ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-700 rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : articlesError ? (
        <div className="text-center py-8">
          <div className="max-w-sm mx-auto">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm">Ошибка загрузки</p>
          </div>
        </div>
      ) : categories.length > 0 ? (
        <div className="space-y-12">
          {categories.map((category) => (
            <div key={category.slug} className="mb-12">
              {/* Category Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">
                  {category.name}
                </h3>
                <a 
                  href={`/categories/${category.slug}`}
                  className="text-sm text-gray-300 hover:text-white transition-colors flex items-center gap-1"
                >
                  Читать все
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>

              {/* Articles Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                {category.articles.map((article) => {
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

                  const publishDate = new Date(publishedAt || new Date());
                  const categoryName = categories?.data?.[0]?.attributes?.name || 'Article';

                  return (
                    <a 
                      key={id} 
                      href={`/articles/${slug}`} 
                      className="block group h-full" 
                      data-oid="njxyaq5"
                    >
                      <div className="bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden hover:border-white/20 hover:shadow-[0_0_80px_-20px_rgba(59,130,246,0.45)] transition-all duration-300 h-full flex flex-col">
                        {/* Image */}
                        {featuredImage?.data && (
                          <div className="aspect-video relative overflow-hidden flex-shrink-0">
                            <img
                              src={featuredImage.data.attributes.url}
                              alt={featuredImage.data.attributes.alternativeText || title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                          </div>
                        )}
                        
                        {/* Content */}
                        <div className="p-4 flex flex-col flex-grow">
                          {/* Category */}
                          {categories?.data && (
                            <div className="mb-2 flex-shrink-0">
                              <span className="inline-block bg-blue-600/20 text-blue-400 text-xs font-medium px-2 py-1 rounded-full">
                                {categoryName}
                              </span>
                            </div>
                          )}
                          
                          {/* Title */}
                          <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-blue-400 transition-colors line-clamp-2 flex-shrink-0">
                            {title}
                          </h3>
                          
                          {/* Excerpt */}
                          {excerpt && (
                            <p className="text-gray-400 text-sm mb-3 line-clamp-2 flex-grow">
                              {excerpt}
                            </p>
                          )}
                          
                          {/* Date */}
                          <div className="flex items-center text-xs text-gray-500 flex-shrink-0 mt-auto">
                            <time dateTime={publishDate.toISOString()}>
                              {publishDate.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
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
          ))}
        </div>
      ) : articles && articles.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-sm mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-500/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-white mb-2">No Articles Yet</h4>
            <p className="text-gray-400">This section doesn't have any articles yet. Check back later!</p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="max-w-sm mx-auto">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h4 className="text-md font-medium text-white mb-2">No Articles Found</h4>
            <p className="text-gray-400 text-sm">
              No articles found in this section.
            </p>
          </div>
        </div>
      )}
    </section>);

}


export default function SectionPage() {
  const params = useParams();
  const slug = params['section-slug'] as string;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Load section data dynamically with caching
  const { data: section, loading: sectionLoading, error: sectionError, isStale: sectionStale } = useCachedSectionBySlug(slug, {
    ttl: 0, // Disable cache temporarily for debugging
    staleWhileRevalidate: false
  });

  // Load articles for this section with caching
  // Filter articles by section's article_types field
  const sectionArticleType = section?.attributes ? (section.attributes as any).article_types : null;
  
  // Fallback: if no article_types is specified, fetch all articles
  // This ensures the page doesn't break if the field is missing
  const shouldFetchArticles = !!(section && !sectionLoading && !sectionError);
  
  const { data: articles, loading: articlesLoading, error: articlesError, isStale: articlesStale } = useCachedArticles(
    sectionArticleType ? {
      filters: {
        type: {
          $eq: sectionArticleType
        }
      }
    } : {}, 
    {
      ttl: 0, // Disable cache temporarily for debugging
      staleWhileRevalidate: false,
      enabled: shouldFetchArticles // Fetch articles when section is loaded
    }
  );

  // Debug logging
  console.log('SectionPage Debug:', {
    params,
    slug,
    section: section ? { 
      name: section.attributes.name, 
      categoriesCount: section.attributes.categories?.data?.length,
      articleTypes: sectionArticleType,
      allAttributes: section.attributes // Log all attributes to see what's available
    } : null,
    sectionLoading,
    sectionError,
    articles: articles ? articles.length : null,
    articlesLoading,
    articlesError
  });

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(!isMenuOpen);
  }, [isMenuOpen]);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  // Get section title from API data or fallback to slug with memoization
  const sectionTitle = useMemo(() => 
    section?.attributes.name || (slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : 'Section'),
    [section?.attributes.name, slug]
  );

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
          className={`pt-14 w-full transition-all duration-300 ease-in-out ${isMenuOpen ? "md:ml-80" : "ml-0"}`}
          data-oid="raq.yo:">

          <div
            className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-6 sm:py-8 md:py-10 flex-col justify-between block"
            data-oid="llmo4l2">

            {/* Hero Top Books Section */}
            <ErrorBoundary>
            <section id="hero-section" data-oid="lcz75dl">
                <HeroTopCards data-oid="i8zhi4c" />
            </section>
            </ErrorBoundary>

            {/* News Section */}
            <section id="news-section" className="mb-8" data-oid="6qvh1en">
              <h1
                className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight"
                data-oid="kjs1qu0">

                {sectionTitle}
              </h1>
              <div
                className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0"
                data-oid="s_f3k.n">

                <Tabs 
                  section={section} 
                  loading={sectionLoading} 
                  selectedCategory={selectedCategory}
                  onCategoryChange={handleCategoryChange}
                  data-oid="2pwvy8b" 
                />
                </div>
            </section>

            <div data-oid="oe-e7c_">
              {/* Show loading state - only show spinner if no cached data */}
              {sectionLoading && !section && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-300 mx-auto"></div>
                  <p className="mt-4 text-gray-400">Loading section...</p>
                </div>
              )}

              {/* Show subtle indicator when refreshing cached data */}
              {sectionStale && section && (
                <div className="fixed top-4 right-4 z-50">
                  <div className="bg-blue-600/90 backdrop-blur-sm text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span className="text-sm">Updating...</span>
                  </div>
                </div>
              )}

              {/* Show error states */}
              {sectionError && (
                <div className="text-center py-12">
                  <div className="max-w-md mx-auto">
                    {/* Cute confused character illustration */}
                    <div className="w-32 h-32 mx-auto mb-6">
                      <svg viewBox="0 0 200 200" className="w-full h-full">
                        {/* Background circle */}
                        <circle cx="100" cy="100" r="90" fill="#fbbf24" opacity="0.1" />
                        
                        {/* Character body */}
                        <circle cx="100" cy="120" r="35" fill="#fbbf24" />
                        
                        {/* Character head */}
                        <circle cx="100" cy="80" r="25" fill="#fbbf24" />
                        
                        {/* Eyes */}
                        <circle cx="92" cy="75" r="3" fill="#1f2937" />
                        <circle cx="108" cy="75" r="3" fill="#1f2937" />
                        
                        {/* Confused eyebrows */}
                        <path d="M85 70 Q92 65 99 70" stroke="#1f2937" strokeWidth="2" fill="none" strokeLinecap="round" />
                        <path d="M101 70 Q108 65 115 70" stroke="#1f2937" strokeWidth="2" fill="none" strokeLinecap="round" />
                        
                        {/* Question mark above head */}
                        <text x="100" y="45" textAnchor="middle" fontSize="24" fill="#fbbf24" fontWeight="bold">?</text>
                        
                        {/* Arms in confused pose */}
                        <path d="M65 120 Q55 110 60 100" stroke="#fbbf24" strokeWidth="6" fill="none" strokeLinecap="round" />
                        <path d="M135 120 Q145 110 140 100" stroke="#fbbf24" strokeWidth="6" fill="none" strokeLinecap="round" />
                        
                        {/* Legs */}
                        <path d="M85 155 L85 175" stroke="#fbbf24" strokeWidth="6" strokeLinecap="round" />
                        <path d="M115 155 L115 175" stroke="#fbbf24" strokeWidth="6" strokeLinecap="round" />
                      </svg>
                    </div>
                    
                    {sectionError.retryable && (
                      <button 
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                      >
                        Try Again
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Debug: Show current state */}
              {(() => {
                console.log('Render condition check:', {
                  hasSection: !!section,
                  hasError: !!sectionError,
                  isLoading: sectionLoading,
                  shouldRender: !!(section && !sectionError && !sectionLoading)
                });
                return null;
              })()}

              {/* Show section articles when loaded and no errors */}
              {section && !sectionError && !sectionLoading && (
                <ErrorBoundary>
                <section
                    id={`${section.attributes.slug}-section`}
                  data-oid="5xf5u-f">

                    <Section
                      title={section.attributes.name}
                      articles={articles || []}
                      loading={articlesLoading}
                      selectedCategory={selectedCategory}
                      articlesError={articlesError}
                      isStale={articlesStale}
                    data-oid="cdmkh91" />

              </section>
                </ErrorBoundary>
              )}

              {/* Show message when section loading finished but no section found */}
              {!sectionLoading && !section && !sectionError && (
                <div className="text-center py-12">
                  <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-500/10 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Section Not Available</h3>
                    <p className="text-gray-400 mb-4">
                      The section "{slug}" is not available or doesn't exist.
                    </p>
                    <a 
                      href="/"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Go to Homepage
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Writer Action Agent Section */}
            <section className="mb-16" data-oid="ux9afw5">
              <WriterActionAgent data-oid="0mqtg6g" />
            </section>

            {/* ChatGPT Business Section */}
            <section className="mb-16" data-oid="s2skcw1">
              <ChatGPTBusinessSection data-oid="j90uroy" />
            </section>
          </div>
        </main>
      </div>
    </div>);

}

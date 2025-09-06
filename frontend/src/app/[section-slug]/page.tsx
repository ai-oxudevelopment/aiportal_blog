// frontend/src/app/[section-slug]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import ToastContainer from "../../components/ToastContainer";
import { getSectionBySlug, getCategories, getArticles } from "../../lib/api";
import { useToast } from "../../lib/hooks/useToast";
import type { Section, Category, Article } from "../../lib/types";

// 404 Error component
function NotFoundError({ sectionSlug }: { sectionSlug: string }) {
  return (
    <div className="min-h-screen bg-black text-gray-100">
      <Header onToggleMenu={() => {}} isMenuOpen={false} />
      <div className="flex">
        <Sidebar isMenuOpen={false} />
        <main className="pt-14 w-full ml-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-6 sm:py-8 md:py-10">
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gray-800 flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h1 className="text-6xl font-bold text-white mb-4">404</h1>
                <h2 className="text-2xl font-semibold text-white mb-4">
                  Раздел не найден
                </h2>
                <p className="text-gray-400 mb-8">
                  Раздел "{sectionSlug}" не существует или временно недоступен. 
                  Проверьте правильность URL или попробуйте позже.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button 
                    onClick={() => window.location.href = '/'}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-colors"
                  >
                    На главную
                  </button>
                  <button 
                    onClick={() => window.history.back()}
                    className="px-6 py-3 bg-transparent hover:bg-white/5 border border-white/20 rounded-lg text-white transition-colors"
                  >
                    Назад
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Article loading skeleton component
function ArticleListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
      {[...Array(8)].map((_, idx) => (
        <div key={idx} className="block">
          <div className="aspect-square w-full rounded-xl border border-white/10 bg-gray-700 animate-pulse mb-3"></div>
          <div className="h-4 bg-gray-700 rounded w-full mb-2 animate-pulse"></div>
          <div className="h-3 bg-gray-700 rounded w-24 animate-pulse"></div>
        </div>
      ))}
    </div>
  );
}

// No articles found placeholder component
function NoArticlesPlaceholder({ sectionName, selectedCategory }: { sectionName: string; selectedCategory: string }) {
  const isFiltered = selectedCategory !== 'all';
  
  return (
    <section className="text-center py-16">
      <div className="max-w-md mx-auto">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-800 flex items-center justify-center">
          <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-white mb-4">
          {isFiltered ? 'Статьи не найдены' : 'Нет статей'}
        </h2>
        <p className="text-gray-400 mb-6">
          {isFiltered 
            ? `В категории "${selectedCategory}" раздела "${sectionName}" пока нет статей.` 
            : `В разделе "${sectionName}" пока нет опубликованных статей.`
          }
        </p>
        {isFiltered && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-colors"
            >
              Показать все
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

// Skeleton component for loading state
function SectionSkeleton() {
  return (
    <div className="min-h-screen bg-black text-gray-100">
      <Header onToggleMenu={() => {}} isMenuOpen={false} />
      <div className="flex">
        <Sidebar isMenuOpen={false} />
        <main className="pt-14 w-full ml-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-6 sm:py-8 md:py-10">
            
            {/* Hero Section Skeleton */}
            <section className="mb-12">
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-gray-800 h-[320px] md:h-[420px] animate-pulse">
                <div className="absolute left-6 top-6 md:left-10 md:top-10">
                  <div className="inline-flex flex-col rounded-2xl bg-gray-700 px-4 py-3 w-32 h-16 animate-pulse"></div>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                  <div className="h-8 bg-gray-700 rounded w-48 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-700 rounded w-32 animate-pulse"></div>
                </div>
              </div>
            </section>

            {/* News Section Skeleton */}
            <section className="mb-8">
              <div className="h-12 bg-gray-700 rounded w-32 mb-6 animate-pulse"></div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  {[...Array(5)].map((_, idx) => (
                    <div key={idx} className="px-3 h-8 rounded-full border border-white/10 bg-gray-700 w-20 animate-pulse"></div>
                  ))}
                </div>
                <div className="hidden md:flex items-center gap-2">
                  {[...Array(3)].map((_, idx) => (
                    <div key={idx} className="px-3 h-8 rounded-full border border-white/10 bg-gray-700 w-16 animate-pulse"></div>
                  ))}
                </div>
              </div>
            </section>

            {/* Content Grid Skeleton */}
            <div className="space-y-16">
              <section className="mb-16">
                <div className="flex items-center justify-between mb-6">
                  <div className="h-8 bg-gray-700 rounded w-40 animate-pulse"></div>
                  <div className="h-6 bg-gray-700 rounded w-20 animate-pulse"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                  {[...Array(8)].map((_, idx) => (
                    <div key={idx} className="block">
                      <div className="aspect-square w-full rounded-xl border border-white/10 bg-gray-700 animate-pulse mb-3"></div>
                      <div className="h-4 bg-gray-700 rounded w-full mb-2 animate-pulse"></div>
                      <div className="h-3 bg-gray-700 rounded w-24 animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


interface SectionPageProps {}

function CategoryTabs({ sectionSlug, selectedCategory, onCategorySelect }: { 
  sectionSlug: string;
  selectedCategory: string;
  onCategorySelect: (categorySlug: string) => void;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        console.log('Fetching categories for section:', sectionSlug);
        
        // Fetch categories attached to this section
        const fetchedCategories = await getCategories({
            filters: {
              sections: {
                slug: {
                  $eq: sectionSlug,
                },
              },
            },
          populate: {
            sections: true,
            },
          });
        
        console.log('Categories attached to section:', fetchedCategories);
        setCategories(fetchedCategories);
        setError(null);
      } catch (err) {
        console.warn('Categories API error, using mock data:', err);
        // Use mock categories when API fails
        const mockCategories: Category[] = [
          {
            id: 1,
            attributes: {
              name: 'General',
              slug: 'general',
              description: 'General articles',
              sections: { data: [] }
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            publishedAt: new Date().toISOString()
          },
          {
            id: 2,
            attributes: {
              name: 'Tutorials',
              slug: 'tutorials',
              description: 'Tutorial articles',
              sections: { data: [] }
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            publishedAt: new Date().toISOString()
          },
          {
            id: 3,
            attributes: {
              name: 'Tips',
              slug: 'tips',
              description: 'Tips and tricks',
              sections: { data: [] }
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            publishedAt: new Date().toISOString()
          }
        ];
        setCategories(mockCategories);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    if (sectionSlug) {
      fetchCategories();
    }
  }, [sectionSlug]);

  // Build categories list with "All" option always first
  const allCategories = [
        { name: "All", slug: "all" },
        ...categories.map(cat => ({
          name: cat.attributes.name,
          slug: cat.attributes.slug
        }))
      ];

  console.log('Section slug:', sectionSlug);
  console.log('Categories from API:', categories);
  console.log('Categories to display:', allCategories);

  if (loading) {
    return (
      <div className="flex flex-wrap gap-2 text-sm">
        {[...Array(5)].map((_, idx) => (
          <div key={idx} className="px-3 h-8 rounded-full border border-white/10 bg-gray-700 animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (error) {
  return (
    <div className="flex flex-wrap gap-2 text-sm">
        <button
          onClick={() => onCategorySelect('all')}
          className={`px-3 h-8 rounded-full border transition-colors text-gray-300 hover:text-white hover:border-white/30 ${
            selectedCategory === 'all' ? "border-white/30 text-white bg-white/10" : "border-white/10"
          }`}
        >
          All
        </button>
        <span className="px-3 h-8 flex items-center text-yellow-400 text-xs">
          Failed to load categories
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 text-sm">
      {allCategories.map((category) => (
        <button
          key={category.slug}
          onClick={() => onCategorySelect(category.slug)}
          className={`px-3 h-8 rounded-full border transition-colors text-gray-300 hover:text-white hover:border-white/30 ${
            selectedCategory === category.slug ? "border-white/30 text-white bg-white/10" : "border-white/10"
          }`}
        >
          {category.name}
        </button>
      ))}
      {categories.length === 0 && !loading && (
        <span className="px-3 h-8 flex items-center text-gray-400 text-xs">
          No categories available
        </span>
      )}
    </div>
  );
}

function HeroCard({ sectionName, onTestToast }: { sectionName: string; onTestToast?: () => void }) {
  const getGradient = (name: string) => {
    switch (name.toLowerCase()) {
      case 'product':
        return 'from-blue-400 via-purple-500 to-pink-400';
      case 'research':
        return 'from-green-400 via-teal-500 to-blue-400';
      case 'company':
        return 'from-orange-400 via-red-500 to-pink-400';
      case 'safety':
        return 'from-yellow-400 via-orange-500 to-red-400';
      case 'security':
        return 'from-indigo-400 via-purple-500 to-pink-400';
      default:
        return 'from-pink-400 via-orange-300 to-indigo-200';
    }
  };

  return (
    <a
      href="#"
      className="group block overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-tr h-[320px] md:h-[420px] relative"
      style={{ background: `linear-gradient(to top right, var(--tw-gradient-stops))` }}
    >
      <div className={`absolute inset-0 bg-gradient-to-tr ${getGradient(sectionName)}`} />
      <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_10%_-10%,rgba(255,255,255,0.35),transparent_60%)]" />
      
      <div className="absolute left-6 top-6 md:left-10 md:top-10">
        <div className="inline-flex flex-col rounded-2xl bg-white text-black/90 px-4 py-3 shadow-lg">
          <span className="text-base font-semibold leading-none">{sectionName}</span>
          <span className="text-[13px] text-black/60 leading-tight mt-1">Latest updates</span>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 bg-gradient-to-t from-black/80 via-black/10 to-transparent">
        <h3 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight text-white">
          {sectionName} News
        </h3>
        <div className="mt-2 text-xs text-gray-300/90">
          <span className="uppercase tracking-wide">Latest</span>
          <span className="mx-2">•</span>
          <time>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</time>
        </div>
        {onTestToast && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onTestToast();
            }}
            className="mt-4 bg-yellow-500/20 backdrop-blur-sm border border-yellow-400/30 rounded-lg px-4 py-2 text-sm font-semibold text-yellow-200 hover:bg-yellow-500/30 transition-all duration-200"
          >
            Test Toast
          </button>
        )}
      </div>
    </a>
  );
}

function FilterControls() {
  return (
    <div className="hidden md:flex items-center gap-2 text-xs text-gray-300">
      <button className="flex items-center gap-2 px-3 h-8 rounded-full border border-white/10 hover:border-white/30 hover:text-white transition">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filter
      </button>
      <button className="flex items-center gap-2 px-3 h-8 rounded-full border border-white/10 hover:border-white/30 hover:text-white transition">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
        </svg>
        Sort
      </button>
      <button className="flex items-center gap-2 px-3 h-8 rounded-full border border-white/10 hover:border-white/30 hover:text-white transition">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 3h6v6H3V3zm0 12h6v6H3v-6zm12-12h6v6h-6V3zm0 12h6v6h-6v-6z" />
        </svg>
        Grid
      </button>
    </div>
  );
}

type Post = {
  id: string;
  title: string;
  tag: string;
  date: string;
  tone: "blue" | "indigo" | "gray";
  category: string;
};

type SectionPost = {
  id: string;
  title: string;
  tag: string;
  date: string;
  tone: "blue" | "green" | "orange" | "pink" | "purple" | "teal";
  category: string;
};


function Thumb({ tone }: {tone: Post["tone"] | SectionPost["tone"];}) {
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

function PostCard({ post }: {post: Post | SectionPost;}) {
  // Create URL-friendly slug from title
  const createSlug = (title: string) => {
    return title.
    toLowerCase().
    replace(/[^a-z0-9]+/g, "-").
    replace(/(^-|-$)/g, "");
  };

  const slug = createSlug(post.title);
  const href = `/articles/${slug}`;

  return (
    <a href={href} className="block" data-oid="stib5jb">
      <Thumb tone={post.tone} data-oid="ee8_0k0" />
      <div className="mt-3" data-oid="dijbh-e">
        <h4 className="text-sm font-medium text-white/95" data-oid="t0a3q6k">
          {post.title}
        </h4>
        <div className="mt-1 text-xs text-gray-400" data-oid="67bhjj_">
          <span className="uppercase tracking-wide" data-oid="imgp4wc">
            {post.tag}
          </span>
          <span className="mx-2" data-oid="4imwu08">
            •
          </span>
          <time data-oid="55op-97">{post.date}</time>
        </div>
      </div>
    </a>);
}



export default function SectionPage({}: SectionPageProps) {
  const params = useParams();
  const slug = params.sectionSlug as string;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [section, setSection] = useState<Section | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { toasts, addToast, removeToast } = useToast();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const testToast = () => {
    addToast('Тестовое уведомление работает!', 'success', 3000);
  };

  const handleCategorySelect = (categorySlug: string) => {
    setSelectedCategory(categorySlug);
    console.log('Selected category:', categorySlug);
    
    // Fetch articles filtered by both section and category
    if (categorySlug !== 'all') {
      fetchArticlesByCategory(categorySlug);
    } else {
      // For 'all' category, refetch all articles for this section
      setArticlesLoading(true);
      const fetchSectionData = async () => {
        try {
          const sectionArticles = await getArticles({
            filters: {
              sections: {
                slug: {
                  $eq: slug,
                },
              },
            },
            sort: ['createdAt:desc'],
            populate: {
              featuredImage: true,
              author: {
                populate: ['avatar'],
              },
              categories: true,
              tags: true,
              sections: true,
            },
          });
          setArticles(sectionArticles);
        } catch (error) {
          console.warn('Failed to refetch all articles:', error);
        } finally {
          setArticlesLoading(false);
        }
      };
      fetchSectionData();
    }
  };

  const fetchArticlesByCategory = async (categorySlug: string) => {
    try {
      setArticlesLoading(true);
      console.log('Fetching articles for section:', slug, 'and category:', categorySlug);
      
      const filteredArticles = await getArticles({
        filters: {
          $and: [
            {
              sections: {
                slug: {
                  $eq: slug,
                },
              },
            },
            {
              categories: {
                slug: {
                  $eq: categorySlug,
                },
              },
            },
          ],
        },
        sort: ['createdAt:desc'],
        populate: {
          featuredImage: true,
          author: {
            populate: ['avatar'],
          },
          categories: true,
          tags: true,
          sections: true,
        },
      });
      
      console.log('Articles filtered by section and category:', filteredArticles);
      setArticles(filteredArticles);
    } catch (error) {
      console.warn('Failed to fetch articles by category, using existing articles:', error);
      // Keep existing articles and filter them client-side
    } finally {
      setArticlesLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;
    
    const fetchSectionData = async () => {
      try {
        setLoading(true);
        setArticlesLoading(true);
        setError(null);
        setNotFound(false);
        
        // Set 15-second timeout for 404 error
        timeoutId = setTimeout(() => {
          if (isMounted) {
            setNotFound(true);
            setLoading(false);
            setArticlesLoading(false);
          }
        }, 15000);
        
        let sectionData: Section | null = null;
        
        // Try to fetch section data from API
        try {
          sectionData = await getSectionBySlug(slug);
          if (sectionData && isMounted) {
            setSection(sectionData);
            setLoading(false); // Section data loaded
            clearTimeout(timeoutId); // Clear timeout if data received
          } else if (isMounted) {
            // Section not found in API, use mock data
            const mockSection: Section = {
              id: 1,
              attributes: {
                name: slug.charAt(0).toUpperCase() + slug.slice(1),
                slug: slug,
                description: `Latest ${slug} news and updates`
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              publishedAt: new Date().toISOString()
            };
            setSection(mockSection);
            setLoading(false);
            clearTimeout(timeoutId);
          }
        } catch (apiError) {
          console.warn('API error fetching section, using mock data:', apiError);
          if (isMounted) {
            // Use mock data when API fails
            const mockSection: Section = {
              id: 1,
              attributes: {
                name: slug.charAt(0).toUpperCase() + slug.slice(1),
                slug: slug,
                description: `Latest ${slug} news and updates`
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              publishedAt: new Date().toISOString()
            };
            setSection(mockSection);
            setLoading(false);
            clearTimeout(timeoutId);
          }
        }

        // Fetch articles for the section
        try {
          console.log('Fetching articles for section slug:', slug);
          
          const sectionArticles = await getArticles({
            filters: {
              sections: {
                slug: {
                  $eq: slug,
                },
              },
            },
            sort: ['createdAt:desc'],
            populate: {
              featuredImage: true,
              author: {
                populate: ['avatar'],
              },
              categories: true,
              tags: true,
              sections: true,
            },
          });
          
          console.log('Articles with section filter:', sectionArticles);
          
          if (isMounted) {
            setArticles(sectionArticles);
            setArticlesLoading(false);
          }
        } catch (apiError) {
          console.warn('Articles API error, using mock data:', apiError);
        if (isMounted) {
            // Use mock articles when API fails
            const mockArticles: Article[] = [
              {
            id: 1,
            attributes: {
                  title: `Sample ${slug} Article 1`,
                  slug: `sample-${slug}-article-1`,
                  excerpt: `This is a sample article for the ${slug} section.`,
                  content: `This is the full content of the sample article for the ${slug} section.`,
                  publishedAt: new Date().toISOString(),
                  featuredImage: { data: null },
                  author: { data: null },
                  categories: { data: [] },
                  tags: { data: [] },
                  sections: { data: [] }
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
                publishedAt: new Date().toISOString()
              },
              {
                id: 2,
                attributes: {
                  title: `Sample ${slug} Article 2`,
                  slug: `sample-${slug}-article-2`,
                  excerpt: `Another sample article for the ${slug} section.`,
                  content: `This is another sample article for the ${slug} section.`,
            publishedAt: new Date().toISOString(),
                  featuredImage: { data: null },
                  author: { data: null },
                  categories: { data: [] },
                  tags: { data: [] },
                  sections: { data: [] }
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                publishedAt: new Date().toISOString()
              }
            ];
            setArticles(mockArticles);
            setArticlesLoading(false);
          }
        }

      } catch (err) {
        console.error('Unexpected error:', err);
        if (isMounted) {
          setNotFound(true);
          setLoading(false);
        }
      }
    };

    if (slug) {
      fetchSectionData();
    }

    // Cleanup function
    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [slug]);

  // Transform API articles to section posts format
  const transformArticlesToPosts = (articles: Article[]): SectionPost[] => {
    return articles.map(article => ({
      id: article.id.toString(),
      title: article.attributes.title,
      tag: article.attributes.categories?.data[0]?.attributes.name || "Article",
      date: new Date(article.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      tone: "blue" as const,
      category: article.attributes.categories?.data[0]?.attributes.slug || slug
    }));
  };


  // Always provide section data (either from API or default)
  const currentSection = section || {
    id: 1,
    attributes: {
      name: slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : 'Section',
      slug: slug || 'section',
      description: `Latest ${slug || 'section'} news and updates`,
    },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
  };

  if (notFound) {
    return <NotFoundError sectionSlug={slug} />;
  }

  if (loading) {
    return <SectionSkeleton />;
  }

  // Transform articles to section posts format
  let sectionPosts = transformArticlesToPosts(articles);

  // Filter posts by selected category
  if (selectedCategory !== 'all') {
    sectionPosts = sectionPosts.filter(post => {
        const article = articles.find(a => a.id.toString() === post.id);
        return article?.attributes.categories?.data.some(cat => 
          cat.attributes.slug === selectedCategory
        );
    });
  }
    
  console.log('Articles from API:', articles);
  console.log('Section posts after filtering:', sectionPosts);
  console.log('Selected category:', selectedCategory);

  return (
    <div className="min-h-screen bg-black text-gray-100" data-oid="rwsv1as">
      <Header
        onToggleMenu={toggleMenu}
        isMenuOpen={isMenuOpen}
        data-oid="op4icmo" />
      {/* <ToastContainer toasts={toasts} onRemoveToast={removeToast} /> */}
      <div className="flex" data-oid="ngvi.xv" key="olk-NeQN">
        <Sidebar isMenuOpen={isMenuOpen} />

        <main
          className={`pt-14 w-full transition-all duration-300 ease-in-out ${isMenuOpen ? "md:ml-64" : "ml-0"}`}
          data-oid="raq.yo:">

          <div
            className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-6 sm:py-8 md:py-10 flex-col justify-between block"
            data-oid="llmo4l2">

            {/* Hero Section */}
            <section id="hero-section" className="mb-12">
              <HeroCard sectionName={currentSection.attributes.name} onTestToast={testToast} />
            </section>

            {/* News Section */}
            <section id="news-section" className="mb-8">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight mb-6">
                {currentSection.attributes.name}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CategoryTabs 
                  sectionSlug={slug} 
                  selectedCategory={selectedCategory}
                  onCategorySelect={handleCategorySelect}
                />
                <FilterControls />
              </div>
              {selectedCategory !== 'all' && (
                <div className="mt-4 text-sm text-gray-400">
                  Showing articles in category: <span className="text-white font-medium">{selectedCategory}</span>
                </div>
              )}
            </section>

            {/* Content Sections */}
            <div className="space-y-16">
                <section
                  key={currentSection.attributes.name}
                  id={`${currentSection.attributes.name.toLowerCase()}-section`}
                  className="mb-16">

                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold tracking-tight text-white">
                      {currentSection.attributes.name}
                    </h2>
                    <button className="text-sm text-gray-300 hover:text-white transition">
                      View all
                    </button>
                  </div>
                
                {articlesLoading ? (
                  <ArticleListSkeleton />
                ) : sectionPosts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                    {sectionPosts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                ) : (
                  <NoArticlesPlaceholder 
                    sectionName={currentSection.attributes.name} 
                    selectedCategory={selectedCategory}
                  />
                )}
              </section>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

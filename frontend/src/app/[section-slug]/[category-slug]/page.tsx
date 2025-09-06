// frontend/src/app/[section-slug]/[category-slug]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";
import ToastContainer from "../../../components/ToastContainer";
import { getSectionBySlug, getCategoryBySlug, getArticles } from "../../../lib/api";
import { useToast } from "../../../lib/hooks/useToast";
import type { Section, Category, Article } from "../../../lib/types";

// 404 Error component
function NotFoundError({ sectionSlug, categorySlug }: { sectionSlug: string; categorySlug: string }) {
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
                  Категория не найдена
                </h2>
                <p className="text-gray-400 mb-8">
                  Категория "{categorySlug}" в разделе "{sectionSlug}" не существует или временно недоступна.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button 
                    onClick={() => window.location.href = `/${sectionSlug}`}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-colors"
                  >
                    К разделу
                  </button>
                  <button 
                    onClick={() => window.location.href = '/'}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-colors"
                  >
                    На главную
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

// Loading component
function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-black text-gray-100">
      <Header onToggleMenu={() => {}} isMenuOpen={false} />
      <div className="flex">
        <Sidebar isMenuOpen={false} />
        <main className="pt-14 w-full ml-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-6 sm:py-8 md:py-10">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function CategoryPage() {
  const params = useParams();
  const sectionSlug = params['section-slug'] as string;
  const categorySlug = params['category-slug'] as string;
  
  const [section, setSection] = useState<Section | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const { showToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch section data
        const sectionData = await getSectionBySlug(sectionSlug);
        if (!sectionData) {
          setError('Section not found');
          return;
        }
        setSection(sectionData);

        // Fetch category data
        const categoryData = await getCategoryBySlug(categorySlug);
        if (!categoryData) {
          setError('Category not found');
          return;
        }
        setCategory(categoryData);

        // Fetch articles for this category
        const articlesData = await getArticles({
          filters: {
            categories: {
              slug: {
                $eq: categorySlug
              }
            },
            section: {
              slug: {
                $eq: sectionSlug
              }
            }
          },
          populate: {
            featuredImage: true,
            author: {
              populate: ['avatar']
            },
            categories: true,
            tags: true
          },
          sort: ['publishedAt:desc']
        });

        setArticles(articlesData);
      } catch (err) {
        console.error('Error fetching category data:', err);
        setError('Failed to load category data');
        showToast('Ошибка загрузки данных категории', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (sectionSlug && categorySlug) {
      fetchData();
    }
  }, [sectionSlug, categorySlug, showToast]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !section || !category) {
    return <NotFoundError sectionSlug={sectionSlug} categorySlug={categorySlug} />;
  }

  return (
    <div className="min-h-screen bg-black text-gray-100">
      <Header onToggleMenu={() => setIsMenuOpen(!isMenuOpen)} isMenuOpen={isMenuOpen} />
      <div className="flex">
        <Sidebar isMenuOpen={isMenuOpen} />
        <main className="pt-14 w-full ml-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-6 sm:py-8 md:py-10">
            
            {/* Breadcrumb */}
            <nav className="mb-8">
              <ol className="flex items-center space-x-2 text-sm text-gray-400">
                <li>
                  <a href="/" className="hover:text-white transition-colors">
                    Главная
                  </a>
                </li>
                <li className="text-gray-500">/</li>
                <li>
                  <a href={`/${sectionSlug}`} className="hover:text-white transition-colors">
                    {section.attributes.title}
                  </a>
                </li>
                <li className="text-gray-500">/</li>
                <li className="text-white">
                  {category.attributes.title}
                </li>
              </ol>
            </nav>

            {/* Category Header */}
            <div className="mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {category.attributes.title}
              </h1>
              {category.attributes.description && (
                <p className="text-xl text-gray-300 max-w-3xl">
                  {category.attributes.description}
                </p>
              )}
            </div>

            {/* Articles Grid */}
            {articles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.map((article) => (
                  <article
                    key={article.id}
                    className="bg-gray-900/50 rounded-lg overflow-hidden hover:bg-gray-900/70 transition-colors group"
                  >
                    {article.attributes.featuredImage?.data && (
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={article.attributes.featuredImage.data.attributes.url}
                          alt={article.attributes.featuredImage.data.attributes.alternativeText || article.attributes.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h2 className="text-xl font-semibold text-white mb-3 group-hover:text-blue-400 transition-colors">
                        <a href={`/${article.attributes.slug}`}>
                          {article.attributes.title}
                        </a>
                      </h2>
                      {article.attributes.excerpt && (
                        <p className="text-gray-300 mb-4 line-clamp-3">
                          {article.attributes.excerpt}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        {article.attributes.author?.data && (
                          <span>
                            {article.attributes.author.data.attributes.name}
                          </span>
                        )}
                        {article.attributes.publishedAt && (
                          <time>
                            {new Date(article.attributes.publishedAt).toLocaleDateString('ru-RU')}
                          </time>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-800 flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Статьи не найдены
                  </h3>
                  <p className="text-gray-400">
                    В этой категории пока нет опубликованных статей.
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}

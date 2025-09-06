// frontend/src/app/page-new.tsx
"use client";

import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import PageContainer from "../components/PageContainer";
import { getCategories, getSections } from "../lib/api";
import type { Category, Section } from "../lib/types";

// Reusable components
function CategoryTabs() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const fetchedCategories = await getCategories();
        setCategories(fetchedCategories);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch categories');
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const fallbackCategories = [
    { name: "All", slug: "all" },
    { name: "Company", slug: "company" },
    { name: "Research", slug: "research" },
    { name: "Product", slug: "product" },
    { name: "Safety", slug: "safety" },
    { name: "Security", slug: "security" },
    { name: "Global Affairs", slug: "global-affairs" }
  ];

  const allCategories = error 
    ? fallbackCategories 
    : [
        { name: "All", slug: "all" },
        ...categories.map(cat => ({
          name: cat.attributes.name,
          slug: cat.attributes.slug
        }))
      ];

  if (loading) {
    return (
      <div className="flex flex-wrap gap-2 text-sm">
        {[...Array(5)].map((_, idx) => (
          <div key={idx} className="px-3 h-8 rounded-full border border-white/10 bg-gray-700 animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 text-sm">
      {allCategories.map((category, i) => (
        <button
          key={category.slug}
          className={`px-3 h-8 rounded-full border transition-colors text-gray-300 hover:text-white hover:border-white/30 ${
            i === 0 ? "border-white/30 text-white" : "border-white/10"
          }`}
        >
          {category.name}
        </button>
      ))}
      {error && (
        <span className="px-3 h-8 flex items-center text-yellow-400 text-xs">
          Using fallback categories
        </span>
      )}
    </div>
  );
}

function HeroCard() {
  return (
    <a
      href="#"
      className="group block overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-tr from-pink-400 via-orange-300 to-indigo-200 h-[320px] md:h-[420px] relative"
    >
      <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_10%_-10%,rgba(255,255,255,0.35),transparent_60%)]" />
      
      <div className="absolute left-6 top-6 md:left-10 md:top-10">
        <div className="inline-flex flex-col rounded-2xl bg-white text-black/90 px-4 py-3 shadow-lg">
          <span className="text-base font-semibold leading-none">GPT-5</span>
          <span className="text-[13px] text-black/60 leading-tight mt-1">Flagship model</span>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 bg-gradient-to-t from-black/80 via-black/10 to-transparent">
        <h3 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight text-white">
          Introducing GPT-5
        </h3>
        <div className="mt-2 text-xs text-gray-300/90">
          <span className="uppercase tracking-wide">Release</span>
          <span className="mx-2">•</span>
          <time>Aug 7, 2025</time>
        </div>
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

export default function HomePage() {
  return (
    <Layout>
      <PageContainer>
        {/* Hero Section */}
        <section id="hero-section" className="mb-12">
          <HeroCard />
        </section>

        {/* News Section */}
        <section id="news-section" className="mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight mb-6">
            News
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CategoryTabs />
            <FilterControls />
          </div>
        </section>

        {/* Content Sections */}
        <div className="space-y-16">
          {/* Placeholder for dynamic content sections */}
          <section className="text-center py-12">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Latest Articles
            </h2>
            <p className="text-gray-400">
              Content will be dynamically loaded from Strapi CMS
            </p>
          </section>
        </div>
      </PageContainer>
    </Layout>
  );
}

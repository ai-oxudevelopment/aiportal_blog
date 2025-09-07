// frontend/src/app/[section-slug]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import WriterActionAgent from "../../components/WriterActionAgent";
import ChatGPTBusinessSection from "../../components/ChatGPTBusinessSection";
import { getSections } from "../../lib/api";
import { useSectionBySlug, useArticles } from "../../lib/hooks";
import type { Category, Section, Article } from "../../lib/types";

function Tabs({ section, loading: sectionLoading }: { section: Section | null; loading: boolean }) {
  // Get categories from the section data
  const sectionCategories = section?.attributes.categories?.data || [];
  
  const allCategories = [
    { name: "All", slug: "all" },
    ...sectionCategories.map(cat => ({
      name: cat.attributes.name,
      slug: cat.attributes.slug
    }))
  ];

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
      {categoriesToShow.map((category, i) =>
        <button
          key={category.slug}
          className={`px-3 h-8 rounded-full border transition-colors text-gray-300 hover:text-white hover:border-white/30 ${
            i === 0 ? "border-white/30 text-white" : "border-white/10"
          }`}
          data-oid="8jr82o9"
        >
          {category.name}
        </button>
      )}
    </div>
  );
}

function Pill({ title, subtitle }: {title: string;subtitle?: string;}) {
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

type KeyDocument = {
  id: string;
  title: string;
  tag: string;
  date: string;
  description: string;
  tone: "blue" | "green" | "orange" | "pink" | "purple" | "teal";
  href?: string;
  cover?: string;
  ctaText?: string;
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
  const href = `/${post.category}/${slug}`;

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

function KeyDocumentCard({ document }: {document: KeyDocument;}) {
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

function Section({ title, posts, articles, loading }: {
  title: string;
  posts?: SectionPost[];
  articles?: Article[];
  loading?: boolean;
}) {
  // Convert articles to post format if provided
  const displayPosts = articles ? articles.map(article => ({
    id: article.id.toString(),
    title: article.attributes.title,
    tag: article.attributes.categories?.data[0]?.attributes?.name || 'Article',
    date: article.attributes.publishedAt 
      ? new Date(article.attributes.publishedAt).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        })
      : 'Recent',
    tone: 'blue' as const,
    category: article.attributes.categories?.data[0]?.attributes?.slug || 'general'
  })) : (posts || []);

  return (
    <section className="mb-16" data-oid="gfd3lvk">
      <div
        className="flex items-center justify-between mb-6"
        data-oid="pxy_r.m">

        <h2
          className="text-2xl font-semibold tracking-tight text-white"
          data-oid="75.2c_u">

          {title}
        </h2>
        <button
          className="text-sm text-gray-300 hover:text-white transition"
          data-oid="-:87evf">

          View all
      </button>
    </div>
      
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-700 rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
          data-oid="n_-yumy">

          {displayPosts.map((post) =>
            <PostCard key={post.id} post={post} data-oid="njxyaq5" />
          )}
        </div>
      )}
    </section>);

}


export default function SectionPage() {
  const params = useParams();
  const slug = params.sectionSlug as string;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Load section data dynamically
  const { data: section, loading: sectionLoading, error: sectionError } = useSectionBySlug(slug);

  // Load articles for this section
  const { data: articles, loading: articlesLoading, error: articlesError } = useArticles({
    filters: {
      sections: {
        slug: {
          $eq: slug
        }
      }
    }
  });

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Get section title from API data or fallback to slug
  const sectionTitle = section?.attributes.name || (slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : 'Section');

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

            {/* Hero Top Books Section */}
            <section id="hero-section" data-oid="lcz75dl">
              <HeroTopCards data-oid="i8zhi4c" />
            </section>

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

                <Tabs section={section} loading={sectionLoading} data-oid="2pwvy8b" />
                <div
                  className="hidden md:flex items-center gap-2 text-xs text-gray-300"
                  data-oid="hb5dtm6">

                  <button
                    className="flex items-center gap-2 px-3 h-8 rounded-full border border-white/10 hover:border-white/30 hover:text-white transition"
                    data-oid="svudr4y">

                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      data-oid="78bz2sd">

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                        data-oid="ku.m20a" />

                    </svg>
                    Filter
                  </button>
                  <button
                    className="flex items-center gap-2 px-3 h-8 rounded-full border border-white/10 hover:border-white/30 hover:text-white transition"
                    data-oid="0prdkn6">

                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      data-oid="mxknymn">

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                        data-oid="zmud2-e" />

                    </svg>
                    Sort
                  </button>
                  <button
                    className="flex items-center gap-2 px-3 h-8 rounded-full border border-white/10 hover:border-white/30 hover:text-white transition"
                    data-oid="hzvobkc">

                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      data-oid="v:keo08">

                      <path
                        d="M3 3h6v6H3V3zm0 12h6v6H3v-6zm12-12h6v6h-6V3zm0 12h6v6h-6v-6z"
                        data-oid="gn--7zq" />

                    </svg>
                    Grid
                  </button>
              </div>
                </div>
            </section>

            <div data-oid="oe-e7c_">
              {/* Show loading state */}
              {sectionLoading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-300 mx-auto"></div>
                  <p className="mt-4 text-gray-400">Loading section...</p>
                </div>
              )}

              {/* Show error state */}
              {sectionError && (
                <div className="text-center py-8">
                  <p className="text-red-400">Error loading section: {sectionError.message}</p>
                </div>
              )}

              {/* Show section articles when loaded */}
              {section && (
                <section
                  id={`${section.attributes.slug}-section`}
                  data-oid="5xf5u-f">

                  <Section
                    title={section.attributes.name}
                    articles={articles || []}
                    loading={articlesLoading}
                    data-oid="cdmkh91" />

                </section>
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

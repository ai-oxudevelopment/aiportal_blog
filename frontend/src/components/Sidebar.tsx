"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getMainSections } from "../lib/api";
import type { Section } from "../lib/types";

interface SidebarProps {
  isMenuOpen: boolean;
}

export default function Sidebar({ isMenuOpen }: SidebarProps) {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        setLoading(true);
        const fetchedSections = await getMainSections();
        setSections(fetchedSections);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch sections');
        console.error('Error fetching sections:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSections();
  }, []);

  // Fallback to hardcoded sections if API is unavailable
  const fallbackSections = [
    {
      name: "Инструменты",
      slug: "tools",
      icon: "🛠️",
      subsections: [
        { name: "Готовые инструкции", slug: "ready-instructions" },
        { name: "AI-агенты", slug: "ai-agents" },
        { name: "MCP", slug: "mcp" }
      ]
    },
    {
      name: "Изучить",
      slug: "learn",
      icon: "📚",
      subsections: [
        { name: "Исследования", slug: "research" },
        { name: "Видеокурсы", slug: "video-courses" },
        { name: "Учебные статьи", slug: "tutorials" },
        { name: "UseCases платформы", slug: "platform-usecases" }
      ]
    },
    {
      name: "Внедрить",
      slug: "implement",
      icon: "🚀",
      subsections: [
        { name: "Истории успеха", slug: "success-stories" },
        { name: "Гайды", slug: "guides" }
      ]
    }
  ];

  const menuItems = (error || sections.length === 0)
    ? fallbackSections 
    : sections.map(section => ({
        name: section.attributes.name,
        slug: section.attributes.slug,
        icon: section.attributes.icon,
        subsections: section.attributes.subsections?.data?.map(sub => ({
          name: sub.attributes.name,
          slug: sub.attributes.slug
        })) || []
      }));

  return (
    <aside
      className={`fixed left-0 top-14 bottom-0 w-full md:w-64 bg-black/90 backdrop-blur-md border-r border-white/10 z-30 transition-all duration-300 ease-in-out ${
        isMenuOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <nav className="flex flex-col h-full px-6 py-8">
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="space-y-1">
                <div className="h-10 bg-gray-700 animate-pulse rounded-md"></div>
                <div className="ml-4 space-y-1">
                  {[...Array(3)].map((_, subIdx) => (
                    <div key={subIdx} className="h-8 bg-gray-600 animate-pulse rounded-md"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {menuItems.map((item) => (
              <div key={item.slug} className="space-y-1">
                {/* Main section */}
                <Link
                  href={`/sections/${item.slug}`}
                  className="flex items-center px-3 py-3 text-sm font-medium text-white hover:bg-white/10 transition-all duration-200 rounded-lg group"
                >
                  <span className="mr-2 text-lg">{item.icon}</span>
                  <span className="group-hover:translate-x-1 transition-transform duration-200">
                    {item.name}
                  </span>
                </Link>
                
                {/* Subsections */}
                {item.subsections && item.subsections.length > 0 && (
                  <ul className="ml-6 space-y-1">
                    {item.subsections.map((subsection) => (
                      <li key={subsection.slug}>
                        <Link
                          href={`/sections/${subsection.slug}`}
                          className="flex items-center px-3 py-2 text-xs text-gray-300 hover:bg-white/5 hover:text-white transition-all duration-200 rounded-md group"
                        >
                          <span className="group-hover:translate-x-1 transition-transform duration-200">
                            {subsection.name}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-md">
            <span className="text-yellow-400 text-xs">
              Using fallback sections
            </span>
          </div>
        )}
      </nav>
    </aside>
  );
}
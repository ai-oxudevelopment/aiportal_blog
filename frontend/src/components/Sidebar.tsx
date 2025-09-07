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

  // Fallback sections if API is unavailable
  const fallbackSections = [
    {
      name: "Библиотека правил",
      slug: "prompts"
    },
    {
      name: "Инструменты",
      slug: "tools"
    },
    {
      name: "Изучить", 
      slug: "learn"
    },
    {
      name: "Внедрить",
      slug: "implement"
    }
  ];

  const menuItems = (error || sections.length === 0)
    ? fallbackSections 
    : sections.map(section => ({
        name: section.attributes.name,
        slug: section.attributes.slug
      }));

  return (
    <aside
      className={`fixed left-0 top-14 bottom-0 w-full md:w-80 bg-black/90 backdrop-blur-md border-r border-white/10 z-30 transition-all duration-300 ease-in-out ${
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
              <Link
                key={item.slug}
                href={`/${item.slug}`}
                className="flex items-center px-3 py-3 text-sm font-medium text-white hover:bg-white/10 transition-all duration-200 rounded-lg group"
              >
                <span className="group-hover:translate-x-1 transition-transform duration-200">
                  {item.name}
                </span>
              </Link>
            ))}
          </div>
        )}
      </nav>
    </aside>
  );
}
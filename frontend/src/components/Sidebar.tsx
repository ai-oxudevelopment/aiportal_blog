"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getSections } from "../lib/api";
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
        const fetchedSections = await getSections();
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
    { name: "Research", slug: "research" },
    { name: "Safety", slug: "safety" },
    { name: "For Business", slug: "for-business" },
    { name: "For Developers", slug: "for-developers" },
    { name: "Stories", slug: "stories" },
    { name: "Company", slug: "company" },
    { name: "News", slug: "news" }
  ];

  const menuItems = error 
    ? fallbackSections 
    : sections.map(section => ({
        name: section.attributes.name,
        slug: section.attributes.slug
      }));

  return (
    <aside
      className={`fixed left-0 top-14 bottom-0 w-full md:w-64 bg-black/90 backdrop-blur-md border-r border-white/10 z-30 transition-all duration-300 ease-in-out ${
        isMenuOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <nav className="flex flex-col h-full px-6 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-white">Sections</h2>
            <Link
              href="/sections"
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              View all
            </Link>
          </div>
          <div className="h-px bg-gradient-to-r from-white/20 to-transparent"></div>
        </div>
        
        {loading ? (
          <div className="space-y-2">
            {[...Array(7)].map((_, idx) => (
              <div key={idx} className="h-10 bg-gray-700 animate-pulse rounded-md"></div>
            ))}
          </div>
        ) : (
          <ul className="space-y-1">
            {menuItems.map((item, idx) => (
              <li key={item.slug}>
                <Link
                  href={`/sections/${item.slug}`}
                  className="flex items-center px-3 py-3 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-200 rounded-lg group"
                >
                  <span className="group-hover:translate-x-1 transition-transform duration-200">
                    {item.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
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
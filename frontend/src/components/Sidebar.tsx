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
      className={`fixed left-0 top-14 bottom-0 w-full md:w-64 bg-black/80 backdrop-blur-sm border-r border-white/10 z-30 transition-all duration-300 ease-in-out ${
        isMenuOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <nav className="flex flex-col h-full px-6 py-8">
        {loading ? (
          <div className="space-y-2">
            {[...Array(7)].map((_, idx) => (
              <div key={idx} className="h-10 bg-gray-700 animate-pulse rounded-md"></div>
            ))}
          </div>
        ) : (
          <ul className="space-y-2">
            {menuItems.map((item, idx) => (
              <li key={item.slug}>
                <Link
                  href={`/sections/${item.slug}`}
                  className={`flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors rounded-md ${
                    idx === menuItems.length - 1 ? "bg-white/10 text-white" : ""
                  }`}
                >
                  {item.name}
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
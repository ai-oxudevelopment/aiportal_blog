// frontend/src/components/MobileMenu.tsx
"use client";

import React from "react";
import Link from "next/link";
import { XMarkIcon } from "@heroicons/react/24/outline";
import SearchBar from "./SearchBar";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  sections?: Array<{ name: string; slug: string }>;
}

export default function MobileMenu({ isOpen, onClose, sections = [] }: MobileMenuProps) {
  if (!isOpen) return null;

  const defaultSections = [
    { name: "Библиотека правил", slug: "prompts" },
    { name: "Инструменты", slug: "tools" },
    { name: "Изучить", slug: "learn" },
    { name: "Внедрить", slug: "implement" }
  ];

  const menuSections = sections.length > 0 ? sections : defaultSections;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Menu Panel */}
      <div className="fixed inset-y-0 left-0 w-full max-w-sm bg-gray-900 shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white">Menu</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
              aria-label="Close menu"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-4 border-b border-white/10">
            <SearchBar placeholder="Search articles..." />
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  onClick={onClose}
                  className="flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors rounded-md"
                >
                  Home
                </Link>
              </li>
              
              {menuSections.map((section) => (
                <li key={section.slug}>
                  <Link
                    href={`/${section.slug}`}
                    onClick={onClose}
                    className="flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors rounded-md"
                  >
                    {section.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/10">
            <div className="flex space-x-4">
              <Link
                href="/about"
                onClick={onClose}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                About
              </Link>
              <Link
                href="/contact"
                onClick={onClose}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

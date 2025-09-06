"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import SearchBar from "./SearchBar";
import MobileMenu from "./MobileMenu";

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity">
      <span className="text-lg font-bold tracking-tight">
        AIWORKPLACE BLOG
      </span>
    </Link>
  );
}

interface HeaderProps {
  onToggleMenu: () => void;
  isMenuOpen: boolean;
  showSearch?: boolean;
}

const navigationItems = [
  { id: "hero-section", label: "Key Documents" },
  { id: "news-section", label: "News" },
  { id: "product-section", label: "Product" },
  { id: "research-section", label: "Research" },
  { id: "company-section", label: "Company" },
  { id: "safety-section", label: "Safety" },
  { id: "security-section", label: "Security" }
];


export default function Header({ onToggleMenu, isMenuOpen, showSearch = true }: HeaderProps) {
  const [activeSection, setActiveSection] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const sections = navigationItems.map((item) =>
      document.getElementById(item.id)
      );
      const scrollPosition = window.scrollY + 100; // Offset for header height

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(navigationItems[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Set initial active section

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = 56; // Height of fixed header
      const elementPosition = element.offsetTop - headerHeight;

      window.scrollTo({
        top: elementPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-20 bg-black/60 backdrop-blur supports-[backdrop-filter]:bg-black/40"
      data-oid="o61u3sq">

      <div
        className="w-full px-4 md:px-8 h-14 flex items-center justify-between"
        data-oid="xsyl5f5">

        <div className="flex items-center gap-4" data-oid="juoq:.1">
          <Brand data-oid="ivhil96" />
          <button
            className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
            title="Toggle menu"
            onClick={onToggleMenu}
            data-oid="thtyyph">

            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              data-oid="5.xc_en">

              <rect
                x="3"
                y="4"
                width="18"
                height="16"
                rx="2"
                strokeWidth="1.5"
                data-oid="92t3n.o" />


              <line
                x1="8"
                y1="6"
                x2="8"
                y2="18"
                strokeWidth="1.5"
                data-oid=":3_lq5e" />

            </svg>
          </button>
        </div>

        <div className="flex items-center gap-3 text-gray-300">
          {showSearch && (
            <div className="hidden md:block w-64">
              <SearchBar placeholder="Search articles..." />
            </div>
          )}
          
          {/* Mobile Search Button */}
          {showSearch && (
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
              aria-label="Open search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          )}
          
          <button
            className="h-8 px-4 rounded-full bg-gradient-to-r from-pink-500 via-orange-500 to-blue-500 hover:from-pink-600 hover:via-orange-600 hover:to-blue-600 border-0 text-white text-xs font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            About Product
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </header>
  );
}
// frontend/src/components/Layout.tsx
"use client";

import React, { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  showFooter?: boolean;
}

export default function Layout({ 
  children, 
  showSidebar = true, 
  showFooter = true 
}: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 flex flex-col">
      <Header onToggleMenu={toggleMenu} isMenuOpen={isMenuOpen} />
      
      <div className="flex flex-1">
        {showSidebar && (
          <Sidebar isMenuOpen={isMenuOpen} />
        )}
        
        <main
          className={`flex-1 transition-all duration-300 ease-in-out ${
            showSidebar && isMenuOpen ? "md:ml-64" : "ml-0"
          }`}
        >
          <div className="pt-14">
            {children}
          </div>
        </main>
      </div>
      
      {showFooter && <Footer />}
    </div>
  );
}

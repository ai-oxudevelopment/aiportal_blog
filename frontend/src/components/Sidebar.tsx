"use client";

import React from "react";

interface SidebarProps {
  isMenuOpen: boolean;
}

export default function Sidebar({ isMenuOpen }: SidebarProps) {
  return (
    <aside
      className={`fixed left-0 top-14 bottom-0 w-full md:w-64 bg-black/90 backdrop-blur-md border-r border-white/10 z-30 transition-all duration-300 ease-in-out ${
        isMenuOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <nav className="flex flex-col h-full px-6 py-8">
        <div className="text-center text-gray-400 mt-8">
          <p>Sidebar content will be added here</p>
        </div>
      </nav>
    </aside>
  );
}
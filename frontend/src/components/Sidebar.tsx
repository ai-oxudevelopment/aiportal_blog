"use client";

import React from "react";

interface SidebarProps {
  isMenuOpen: boolean;
}

export default function Sidebar({ isMenuOpen }: SidebarProps) {
  const items = [
  "Research",
  "Safety",
  "For Business",
  "For Developers",
  "Stories",
  "Company",
  "News"];


  return (
    <aside
      className={`fixed left-0 top-14 bottom-0 w-full md:w-64 bg-black/80 backdrop-blur-sm z-30 transition-all duration-300 ease-in-out outline-none border-none ${
      isMenuOpen ? "translate-x-0" : "-translate-x-full"}`
      }
      data-oid="nfeb93k">

      <nav className="flex flex-col h-full px-6 py-8" data-oid="byuybft">
        <ul className="space-y-2" data-oid="dzbd9fi">
          {items.map((item, idx) =>
          <li key={item} data-oid="g:fq5so">
              <a
              href="#"
              className={`flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors rounded-md ${
              idx === items.length - 1 ? "bg-white/10 text-white" : ""}`
              }
              data-oid="p5es7c3">

                {item}
              </a>
            </li>
          )}
        </ul>
      </nav>
    </aside>);

}
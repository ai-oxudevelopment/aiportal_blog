// frontend/src/components/PageContainer.tsx
"use client";

import React from "react";
import Breadcrumbs from "./Breadcrumbs";

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "6xl" | "7xl" | "full";
}

export default function PageContainer({
  children,
  title,
  description,
  breadcrumbs,
  className = "",
  maxWidth = "7xl"
}: PageContainerProps) {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md", 
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "4xl": "max-w-4xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl",
    full: "max-w-full"
  };

  return (
    <div className={`min-h-screen bg-black text-gray-100 ${className}`}>
      <div className={`mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-10 ${maxWidthClasses[maxWidth]}`}>
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="mb-6">
            <Breadcrumbs items={breadcrumbs} />
          </div>
        )}

        {/* Page Header */}
        {(title || description) && (
          <div className="mb-8">
            {title && (
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white mb-4">
                {title}
              </h1>
            )}
            {description && (
              <p className="text-lg text-gray-300 leading-relaxed max-w-3xl">
                {description}
              </p>
            )}
          </div>
        )}

        {/* Page Content */}
        <div className="space-y-8">
          {children}
        </div>
      </div>
    </div>
  );
}

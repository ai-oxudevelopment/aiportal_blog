// frontend/src/components/EmptyState.tsx
import React from 'react';

interface EmptyStateProps {
  title?: string;
  subtitle?: string;
  imageSrc?: string;
  className?: string;
}

export default function EmptyState({
  title = "Coming Soon",
  subtitle = "Content is being prepared",
  imageSrc,
  className = ""
}: EmptyStateProps) {
  return (
    <div className={`text-center py-16 ${className}`}>
      <div className="max-w-md mx-auto">
        {/* Animated writing illustration */}
        <div className="w-32 h-32 mx-auto mb-6 relative">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={title}
              className="w-full h-full object-contain"
            />
          ) : (
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {/* Background circle with subtle animation */}
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="url(#gradient)"
                opacity="0.1"
                className="animate-pulse"
              />

              {/* Gradient definition */}
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>

              {/* Floating document pages */}
              <g className="animate-bounce" style={{ animationDuration: '3s' }}>
                <rect x="60" y="80" width="30" height="40" rx="2" fill="#3b82f6" opacity="0.8" />
                <rect x="70" y="70" width="30" height="40" rx="2" fill="#6366f1" opacity="0.9" />
                <rect x="80" y="60" width="30" height="40" rx="2" fill="#8b5cf6" opacity="1" />
              </g>

              {/* Writing hand/pen */}
              <g className="animate-pulse" style={{ animationDuration: '2s' }}>
                <path d="M140 90 Q150 85 155 90" stroke="#fbbf24" strokeWidth="4" fill="none" strokeLinecap="round" />
                <circle cx="155" cy="90" r="3" fill="#fbbf24" />
              </g>

              {/* Floating dots representing ideas */}
              <g className="animate-ping" style={{ animationDuration: '4s' }}>
                <circle cx="50" cy="60" r="2" fill="#10b981" opacity="0.7" />
                <circle cx="160" cy="50" r="2" fill="#f59e0b" opacity="0.7" />
                <circle cx="40" cy="140" r="2" fill="#ef4444" opacity="0.7" />
                <circle cx="170" cy="130" r="2" fill="#8b5cf6" opacity="0.7" />
              </g>
            </svg>
          )}
        </div>

        {/* Text content */}
        <h4 className="text-xl font-semibold text-white mb-2">{title}</h4>
        <p className="text-gray-400 text-sm">{subtitle}</p>
      </div>
    </div>
  );
}
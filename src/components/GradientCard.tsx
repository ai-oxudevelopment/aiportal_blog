import React from 'react';

interface GradientCardProps {
  title: string;
  description: string;
  gradient: 'openai' | 'openai-reverse' | 'purple-blue' | 'gray-dark' | 'gray-light';
  className?: string;
  children?: React.ReactNode;
}

export default function GradientCard({ 
  title, 
  description, 
  gradient, 
  className = '',
  children 
}: GradientCardProps) {
  const gradientClasses = {
    'openai': 'gradient-openai',
    'openai-reverse': 'gradient-openai-reverse',
    'purple-blue': 'gradient-purple-blue',
    'gray-dark': 'gradient-gray-dark',
    'gray-light': 'gradient-gray-light'
  };

  return (
    <div className={`rounded-lg p-6 border border-border ${gradientClasses[gradient]} ${className}`}>
      <div className="text-white">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-white/80 mb-4">{description}</p>
        {children}
      </div>
    </div>
  );
}

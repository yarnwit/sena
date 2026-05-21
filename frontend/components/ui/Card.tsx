import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export default function Card({ title, children, className = '', padding = 'md', onClick }: CardProps) {
  const paddings: Record<string, string> = {
    none: '',
    sm: 'p-3',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 shadow-sm ${paddings[padding]} ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${className}`}
      onClick={onClick}
    >
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
      {children}
    </div>
  );
}

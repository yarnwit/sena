'use client';

import React from 'react';
import Link from 'next/link';

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface NavbarProps {
  title?: string;
  items?: NavItem[];
  user?: { full_name?: string; role?: string } | null;
  onLogout?: () => void;
  onMenuToggle?: () => void;
}

export default function Navbar({ title = 'SENA', items = [], user, onLogout, onMenuToggle }: NavbarProps) {
  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <button onClick={onMenuToggle} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <h1 className="text-lg font-bold text-gray-900">{title}</h1>
      </div>

      <div className="hidden md:flex items-center gap-4">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </div>

      {user && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 hidden sm:block">{user.full_name}</span>
          {onLogout && (
            <button
              onClick={onLogout}
              className="text-sm text-gray-500 hover:text-red-600 transition-colors"
            >
              ออกจากระบบ
            </button>
          )}
        </div>
      )}
    </nav>
  );
}

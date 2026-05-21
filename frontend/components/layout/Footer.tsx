import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white px-4 py-3 text-center text-xs text-gray-500">
      <p>© {new Date().getFullYear()} SENA Complaint Management System v1.0.0</p>
    </footer>
  );
}

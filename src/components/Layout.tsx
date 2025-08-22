import React from 'react';
import Link from 'next/link';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className={`min-h-screen bg-gray-900 text-white ${inter.className}`}>
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="text-xl font-bold">AI Portal Blog</div>
            <div className="hidden md:flex space-x-6">
              <Link href="/" className="hover:text-blue-400 transition-colors">
                Home
              </Link>
              <Link href="/articles" className="hover:text-blue-400 transition-colors">
                Articles
              </Link>
              <Link href="/about" className="hover:text-blue-400 transition-colors">
                About
              </Link>
            </div>
          </nav>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      
      <footer className="border-t border-gray-800 mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-gray-400">
            <p>&copy; 2024 AI Portal Blog. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

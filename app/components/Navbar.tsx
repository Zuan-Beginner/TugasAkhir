'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Home, FileText, BookOpen, Target, AlertCircle, BarChart, User } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/blog', label: 'Blog', icon: FileText },
    { href: '/Task2', label: 'Task 2', icon: Target },
    { href: '/Task3', label: 'Task 3', icon: Target },
    { href: '/card', label: 'Card', icon: BookOpen },
    { href: '/learn1', label: 'Learn', icon: BookOpen },
    { href: '/latihan-mandiri', label: 'Latihan Mandiri', icon: BookOpen },
    { href: '/latihan-dari-soal-ai', label: 'Latihan AI', icon: BookOpen },
    { href: '/uts', label: 'UTS', icon: FileText },
    { href: '/perbaikan_kuis', label: 'Perbaikan Kuis', icon: FileText },
    { href: '/tampilan_xl', label: 'Tampilan XL', icon: BarChart },
    { href: '/lapor_mulia', label: 'Lapor Mulia', icon: AlertCircle },
  ];

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-white rounded-lg p-2">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-white font-bold text-xl">My App</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-white/10 transition-colors duration-200"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-colors duration-200"
            aria-expanded="false"
          >
            <span className="sr-only">Open main menu</span>
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-blue-700">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/10 transition-colors duration-200"
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}

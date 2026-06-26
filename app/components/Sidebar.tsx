'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, BookOpen, Target, AlertCircle, BarChart, ChevronRight } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const menuSections = [
    {
      title: 'Main',
      items: [
        { href: '/', label: 'Home', icon: Home },
        { href: '/blog', label: 'Blog', icon: FileText },
      ],
    },
    {
      title: 'Tasks',
      items: [
        { href: '/Task2', label: 'Task 2', icon: Target },
        { href: '/Task3', label: 'Task 3', icon: Target },
      ],
    },
    {
      title: 'Learning',
      items: [
        { href: '/card', label: 'Card', icon: BookOpen },
        { href: '/learn1', label: 'Learn 1', icon: BookOpen },
        { href: '/latihan-mandiri', label: 'Latihan Mandiri', icon: BookOpen },
        { href: '/latihan-dari-soal-ai', label: 'Latihan AI', icon: BookOpen },
      ],
    },
    {
      title: 'Assessments',
      items: [
        { href: '/uts', label: 'UTS', icon: FileText },
        { href: '/perbaikan_kuis', label: 'Perbaikan Kuis', icon: FileText },
      ],
    },
    {
      title: 'Applications',
      items: [
        { href: '/tampilan_xl', label: 'Tampilan XL', icon: BarChart },
        { href: '/lapor_mulia', label: 'Lapor Mulia', icon: AlertCircle },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-white shadow-lg h-screen overflow-y-auto border-r border-gray-200">
      <div className="p-4">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Navigation</h2>
        
        {menuSections.map((section, idx) => (
          <div key={idx} className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {section.title}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${
                        isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`h-5 w-5 ${
                          isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'
                        }`} />
                        <span>{item.label}</span>
                      </div>
                      {isActive && <ChevronRight className="h-4 w-4" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}

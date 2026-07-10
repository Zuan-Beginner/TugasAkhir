'use client';

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { usePathname } from 'next/navigation';
import "./globals.css";
import Navbar from "./components/Navbar";
import BreadcrumbNav from "./components/BreadcrumbNav";
import Footer from "./components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLaporMulia = pathname?.startsWith('/lapor_mulia');

  return (
    <html
      lang="id"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var t = localStorage.getItem('muliaTheme');
            if (t === 'dark' || t === 'light') {
              document.documentElement.setAttribute('data-theme', t);
            } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
              document.documentElement.setAttribute('data-theme', 'dark');
            }
          })();
        ` }} />
      </head>
      <body className={`min-h-full flex flex-col bg-gray-50 ${geistSans.variable} ${geistMono.variable}`} style={{ fontFamily: 'var(--font-geist-sans), system-ui, sans-serif' }}>
        {!isLaporMulia && <Navbar />}
        {!isLaporMulia && <BreadcrumbNav />}
        <main className="flex-1">{children}</main>
        {!isLaporMulia && <Footer />}
      </body>
    </html>
  );
}

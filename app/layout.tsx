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
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50">
        {!isLaporMulia && <Navbar />}
        {!isLaporMulia && <BreadcrumbNav />}
        <main className="flex-1">{children}</main>
        {!isLaporMulia && <Footer />}
      </body>
    </html>
  );
}

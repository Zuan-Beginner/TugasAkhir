'use client';

import { usePathname } from 'next/navigation';
import Navbar from "./components/Navbar";
import BreadcrumbNav from "./components/BreadcrumbNav";
import Footer from "./components/Footer";

export default function LayoutClient({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLaporMulia = pathname?.startsWith('/lapor_mulia');

  return (
    <>
      {!isLaporMulia && <Navbar />}
      {!isLaporMulia && <BreadcrumbNav />}
      <main className="flex-1">{children}</main>
      {!isLaporMulia && <Footer />}
    </>
  );
}

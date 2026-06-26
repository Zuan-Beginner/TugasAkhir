'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getReports } from './lib/storage';
import type { Report } from './lib/types';
import { AuthProvider, useAuth } from './lib/auth-context';
import './styles/globals.css';

const THEME_KEY = 'muliaTheme';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAdmin } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    setReports(getReports());
    const onStorage = () => setReports(getReports());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    const saved = window.localStorage.getItem(THEME_KEY);
    const initial = saved === 'dark' || saved === 'light' ? saved : 'light';
    setTheme(initial);
    document.documentElement.setAttribute('data-theme', initial);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      window.localStorage.setItem(THEME_KEY, next);
      return next;
    });
  };

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 11) return 'Selamat Pagi';
    if (h < 15) return 'Selamat Siang';
    if (h < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  }, []);

  const isPublicRoute = pathname === '/lapor_mulia';

  useEffect(() => {
    if (!user && !isPublicRoute) {
      router.replace('/lapor_mulia');
    }
  }, [isPublicRoute, pathname, router, user]);

  if (!user && !isPublicRoute) {
    return null;
  }

  if (isPublicRoute) {
    return <>{children}</>;
  }

  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <>
      <div className="app-container">
        <header className="app-header">
          <div className="header-top">
            <Link href="/lapor_mulia" className="header-brand">
              <div className="header-brand-icon">⚑</div>
              <div className="header-brand-text">
                <h1>Mulia Lapor</h1>
                <small>Universitas Mulia</small>
              </div>
            </Link>
            <div className="header-actions">
              <button
                type="button"
                className="theme-toggle"
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
                title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
              <Link href="/lapor_mulia/profil" className="header-btn">
                🔔
                {reports.some((r) => r.status === 'Diproses') && <span className="badge-dot" />}
              </Link>
              <Link href="/lapor_mulia/profil" className="header-btn" title={user.name}>{user.avatar}</Link>
              <button
                type="button"
                className="header-btn"
                onClick={logout}
                title="Logout"
                style={{background: 'transparent', border: 'none', cursor: 'pointer'}}
              >
                🚪
              </button>
            </div>
          </div>
          <div className="greeting">
            <h2>{greeting}, {user.name}! 👋</h2>
            <p>{isAdmin() ? '🔐 Administrator' : '👨‍🎓 Mahasiswa'} • {user.role === 'admin' ? 'Pengelola Sistem' : 'Fakultas Teknik Informatika'}</p>
          </div>
        </header>

        <main className="page-content">{children}</main>

        <nav className="bottom-nav">
          <Link href="/lapor_mulia/home" className={isActive('/lapor_mulia/home') ? 'active' : ''}>
            <span className="nav-icon">🏠</span>
            <span className="nav-label">Beranda</span>
          </Link>
          <Link href="/lapor_mulia/layanan" className={isActive('/lapor_mulia/layanan') ? 'active' : ''}>
            <span className="nav-icon">📋</span>
            <span className="nav-label">Layanan</span>
          </Link>
          {isAdmin() ? (
            <Link href="/lapor_mulia/admin" className={`primary-action ${isActive('/lapor_mulia/admin') ? 'active' : ''}`}>
              <span className="nav-icon">🛡️</span>
              <span className="nav-label">Admin</span>
            </Link>
          ) : (
            <Link href="/lapor_mulia/lapor" className={`primary-action ${isActive('/lapor_mulia/lapor') ? 'active' : ''}`}>
              <span className="nav-icon">➕</span>
              <span className="nav-label">Lapor</span>
            </Link>
          )}
          <Link href="/lapor_mulia/forum" className={isActive('/lapor_mulia/forum') ? 'active' : ''}>
            <span className="nav-icon">💬</span>
            <span className="nav-label">Forum</span>
          </Link>
          <Link href="/lapor_mulia/riwayat" className={isActive('/lapor_mulia/riwayat') ? 'active' : ''}>
            <span className="nav-icon">📊</span>
            <span className="nav-label">Riwayat</span>
          </Link>
        </nav>
      </div>
    </>
  );
}

export default function MuliaLaporLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LayoutContent>{children}</LayoutContent>
    </AuthProvider>
  );
}

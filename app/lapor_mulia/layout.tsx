'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getReports } from './lib/storage';
import type { Report } from './lib/types';
import { AuthProvider, useAuth } from './lib/auth-context';
import './styles/globals.css';

const THEME_KEY = 'muliaTheme';

const SunIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const ShieldIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const StudentIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
    <path d="M6 12v5c3 3 9 3 12 0v-5"/>
  </svg>
);

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    setReports(getReports());
    const onStorage = () => setReports(getReports());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    const saved = window.localStorage.getItem(THEME_KEY);
    let initial: 'light' | 'dark';
    if (saved === 'dark' || saved === 'light') {
      initial = saved;
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      initial = 'dark';
    } else {
      initial = 'light';
    }
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

  const isPublicRoute = pathname === '/lapor_mulia' || pathname === '/lapor_mulia/login';
  const router = useRouter();

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

  if (!user) {
    return null;
  }

  const isActive = (path: string) => {
    if (path === '/lapor_mulia') return pathname === '/lapor_mulia';
    return pathname.startsWith(path);
  };

  // Admin page gets standalone layout (no sidebar)
  const isAdminPage = pathname === '/lapor_mulia/admin';

  if (isAdminPage && isAdmin()) {
    return (
      <>
        <style>{`
          .admin-full-layout { min-height: 100vh; display: flex; flex-direction: column; }
          .admin-full-header {
            height: 64px; background: linear-gradient(135deg, var(--primary), var(--primary-dark));
            display: flex; align-items: center; padding: 0 24px; gap: 24px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .admin-full-header-left { display: flex; align-items: center; }
          .admin-brand { display: flex; align-items: center; gap: 12px; text-decoration: none; color: white; }
          .admin-brand-icon { font-size: 28px; }
          .admin-brand-text h1 { font-size: 18px; font-weight: 700; margin: 0; color: white; }
          .admin-brand-text small { font-size: 11px; opacity: 0.8; color: rgba(255,255,255,0.8); }
          .admin-full-header-center { flex: 1; display: flex; justify-content: center; }
          .admin-greeting { color: white; font-size: 15px; font-weight: 500; }
          .admin-full-header-right { display: flex; align-items: center; gap: 16px; }
          .theme-toggle {
            background: rgba(255,255,255,0.2); border: none; border-radius: 8px;
            padding: 8px; cursor: pointer; color: white;
            display: flex; align-items: center; justify-content: center; transition: background 0.2s;
          }
          .theme-toggle:hover { background: rgba(255,255,255,0.3); }
          .admin-badge {
            display: flex; align-items: center; gap: 6px;
            padding: 8px 14px; border-radius: 8px;
            background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3);
            color: white; font-size: 13px; font-weight: 600;
          }
          .admin-badge svg { stroke: white; }
          .logout-btn {
            background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3);
            border-radius: 8px; padding: 8px 16px; color: white; cursor: pointer;
            font-size: 13px; font-weight: 600; transition: all 0.2s;
          }
          .logout-btn:hover { background: rgba(255,255,255,0.3); }
          .admin-full-content { flex: 1; padding: 24px; background: var(--bg); color: var(--text); }
          [data-theme="dark"] .admin-full-content { background: linear-gradient(180deg, #1a1f35 0%, #1e2442 50%, #1a1f35 100%); }
        `}</style>
        <div className="admin-full-layout">
          <header className="admin-full-header">
            <div className="admin-full-header-left">
              <div className="admin-brand">
                <span className="admin-brand-icon">⚑</span>
                <div className="admin-brand-text">
                  <h1>Mulia Lapor</h1>
                  <small>Panel Administrator</small>
                </div>
              </div>
            </div>
            <div className="admin-full-header-center">
              <span className="admin-greeting">Selamat datang, {user.name}</span>
            </div>
            <div className="admin-full-header-right">
              <button className="theme-toggle" onClick={toggleTheme}>
                {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
              </button>
              <span className="admin-badge" title="Administrator">
                <ShieldIcon />
                Admin
              </span>
              <button className="logout-btn" onClick={() => { logout(); router.push('/lapor_mulia'); }}>
                Keluar
              </button>
            </div>
          </header>
          <main className="admin-full-content">{children}</main>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="app-layout">
        <nav className="left-sidebar">
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">🏫</div>
            <div className="sidebar-brand-text">
              <h1>Mulia Lapor</h1>
              <small>Universitas Mulia</small>
            </div>
          </div>
          <div className="sidebar-menu">
            <Link href="/lapor_mulia/home" className={isActive('/lapor_mulia/home') ? 'active' : ''}>
              <span className="nav-icon">🏠</span>
              <span className="nav-label">Beranda</span>
            </Link>
            <Link href="/lapor_mulia/layanan" className={isActive('/lapor_mulia/layanan') ? 'active' : ''}>
              <span className="nav-icon">📋</span>
              <span className="nav-label">Layanan</span>
            </Link>
            <Link href="/lapor_mulia/forum" className={isActive('/lapor_mulia/forum') ? 'active' : ''}>
              <span className="nav-icon">💬</span>
              <span className="nav-label">Forum</span>
            </Link>
            <Link href="/lapor_mulia/riwayat" className={isActive('/lapor_mulia/riwayat') ? 'active' : ''}>
              <span className="nav-icon">📊</span>
              <span className="nav-label">Riwayat</span>
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
          </div>
          <div className="sidebar-footer">
            <button
              type="button"
              className="sidebar-logout-btn"
              onClick={() => { logout(); router.push('/lapor_mulia'); }}
            >
              <span className="nav-icon">🚪</span>
              <span className="nav-label">Keluar</span>
            </button>
          </div>
        </nav>
        <div className="app-container">
          <header className="app-header">
          <div className="header-top">
            <div className="header-title">
              <h2>{greeting}, {user.name}</h2>
              <div className="header-badge">
                {isAdmin() ? <ShieldIcon /> : <StudentIcon />}
                <span>{isAdmin() ? 'Administrator' : 'Mahasiswa'}</span>
              </div>
            </div>
            <div className="header-actions">
              <button
                type="button"
                className="header-btn"
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
              >
                {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
              </button>
              <Link href="/lapor_mulia/profil" className="header-btn header-user-btn">
                <span className="header-user-avatar">{user.name.charAt(0).toUpperCase()}</span>
                {reports.some((r) => r.status === 'Diproses') && <span className="badge-dot" />}
              </Link>
            </div>
          </div>
        </header>

        <main className="page-content">{children}</main>

        </div>
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

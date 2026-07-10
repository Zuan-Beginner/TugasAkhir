'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getReports } from './lib/storage';
import type { Report } from './lib/types';
import { AuthProvider, useAuth } from './lib/auth-context';
import { LoginModal } from './components/LoginModal';
import './styles/globals.css';

const THEME_KEY = 'muliaTheme';

// SVG Icons - Line style (stroke)
const FlagIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
    <line x1="4" y1="22" x2="4" y2="15"/>
  </svg>
);

const BellIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

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

const LogoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const HomeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const ClipboardIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const MessageIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const ChartIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);

const UserIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
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
  const { user, login, logout, isAdmin } = useAuth();
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

  const processingReports = useMemo(() =>
    reports.filter((r) => r.status === 'Diproses'),
    [reports]
  );

  const isPublicRoute = pathname === '/lapor_mulia' || pathname === '/lapor_mulia/login';

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

  // At this point, user is guaranteed to exist (protected route)
  if (!user) {
    return <LoginModal onLogin={login} />;
  }

  const isActive = (path: string) => {
    if (path === '/lapor_mulia') return pathname === '/lapor_mulia';
    return pathname.startsWith(path);
  };

  return (
    <>
      <div className="app-layout">
        <nav className="left-sidebar">
          <Link href="/lapor_mulia" className="sidebar-brand">
            <div className="sidebar-brand-icon">🏫</div>
            <div className="sidebar-brand-text">
              <h1>Mulia Lapor</h1>
              <small>Universitas Mulia</small>
            </div>
          </Link>
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



        <Modal
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
          title="Notifikasi"
          icon="🔔"
        >
          <style>{`
            .notification-list {
              display: flex;
              flex-direction: column;
              gap: 12px;
              max-height: 400px;
              overflow-y: auto;
              padding: 16px 0;
            }
            .notification-item {
              padding: 16px;
              background: var(--bg);
              border-radius: 12px;
              border-left: 4px solid var(--primary);
              cursor: pointer;
              transition: all 0.3s;
            }
            .notification-item:hover {
              background: var(--bg-card);
              transform: translateX(4px);
            }
            .notification-item-title {
              font-weight: 700;
              margin-bottom: 6px;
              color: var(--text);
              font-size: 15px;
            }
            .notification-item-desc {
              font-size: 13px;
              color: var(--muted);
              margin-bottom: 6px;
            }
            .notification-item-meta {
              display: flex;
              justify-content: space-between;
              font-size: 12px;
              color: var(--muted);
            }
            .notification-item-status {
              background: var(--primary-light);
              color: var(--primary);
              padding: 4px 8px;
              border-radius: 6px;
              font-weight: 600;
            }
            .notification-empty {
              text-align: center;
              padding: 32px 16px;
              color: var(--muted);
            }
            .notification-empty-icon {
              font-size: 48px;
              margin-bottom: 12px;
            }
          `}</style>

          <div className="notification-list">
            {processingReports.length > 0 ? (
              processingReports.map((report) => (
                <div
                  key={report.ticket}
                  className="notification-item"
                  onClick={() => {
                    router.push('/lapor_mulia/riwayat');
                    setShowNotifications(false);
                  }}
                >
                  <div className="notification-item-title">{report.title}</div>
                  <div className="notification-item-desc">
                    📍 {report.location} • {report.category}
                  </div>
                  <div className="notification-item-meta">
                    <span>Ticket: {report.ticket}</span>
                    <span className="notification-item-status">{report.status}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="notification-empty">
                <div className="notification-empty-icon">😊</div>
                <p>Tidak ada notifikasi baru</p>
              </div>
            )}
          </div>
        </Modal>
        </div> {/* closing of app-container */}
      </div> {/* closing of app-layout */}
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

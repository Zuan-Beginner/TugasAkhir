'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getReports } from './lib/storage';
import type { Report } from './lib/types';
import { AuthProvider, useAuth } from './lib/auth-context';
import Modal from './components/Modal';
import './styles/globals.css';

const THEME_KEY = 'muliaTheme';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAdmin } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showNotifications, setShowNotifications] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setMousePos({ x, y });
      document.documentElement.style.setProperty('--mouse-x', `${x}%`);
      document.documentElement.style.setProperty('--mouse-y', `${y}%`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
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
    return null;
  }

  const isActive = (path: string) => pathname.startsWith(path);

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
              <button
                type="button"
                className="header-btn"
                onClick={() => setShowNotifications(true)}
                title={processingReports.length > 0 ? `${processingReports.length} notifikasi` : 'Notifikasi'}
              >
                🔔
                {processingReports.length > 0 && <span className="badge-dot" />}
              </button>
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

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getReports } from './lib/storage';
import type { Report } from './lib/types';

export default function WelcomePage() {
  const [stats, setStats] = useState({ total: 0, selesai: 0, diproses: 0 });

  useEffect(() => {
    const reports: Report[] = getReports();
    setStats({
      total: reports.length,
      selesai: reports.filter(r => r.status === 'Selesai').length,
      diproses: reports.filter(r => r.status === 'Diproses').length,
    });
  }, []);
  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }

        .lantas-page {
          min-height: 100vh;
          background: #FAF8F5;
          color: #1A1A1A;
        }

        /* ===== HEADER ===== */
        .lantas-header {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .lantas-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          color: #1A1A1A;
        }
        .lantas-brand-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: #1A1A1A;
          display: grid;
          place-items: center;
          color: #fff;
          font-size: 18px;
          font-weight: 800;
        }
        .lantas-brand-name {
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }
        .lantas-nav {
          display: flex;
          align-items: center;
          gap: 32px;
        }
        .lantas-nav a {
          font-size: 14px;
          font-weight: 500;
          color: #6B7280;
          text-decoration: none;
          transition: color 0.2s;
        }
        .lantas-nav a:hover { color: #1A1A1A; }
        .lantas-nav-cta {
          padding: 10px 24px;
          background: #1A1A1A;
          color: #fff !important;
          border-radius: 50px;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s;
        }
        .lantas-nav-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        }

        /* ===== HERO ===== */
        .lantas-hero {
          max-width: 1200px;
          margin: 0 auto;
          padding: 80px 32px 60px;
          text-align: center;
          animation: heroFadeIn 0.8s ease-out;
        }
        @keyframes heroFadeIn {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .lantas-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 18px;
          background: #fff;
          border: 1px solid #E8E5E0;
          border-radius: 50px;
          font-size: 13px;
          font-weight: 600;
          color: #6B7280;
          margin-bottom: 40px;
        }
        .lantas-hero-badge-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #4CAF50;
        }
        .lantas-hero h1 {
          font-size: clamp(40px, 6vw, 72px);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -2px;
          color: #1A1A1A;
          margin-bottom: 12px;
        }
        .lantas-hero-sub {
          font-size: clamp(24px, 3.5vw, 42px);
          font-weight: 700;
          letter-spacing: -1px;
          background: linear-gradient(135deg, #C9A96E, #A8854A);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 24px;
        }
        .lantas-hero p {
          font-size: 17px;
          line-height: 1.7;
          color: #6B7280;
          max-width: 600px;
          margin: 0 auto 40px;
        }
        .lantas-hero-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
        }
        .lantas-btn-primary {
          padding: 14px 32px;
          background: #1A1A1A;
          color: #fff;
          border: none;
          border-radius: 50px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s;
        }
        .lantas-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.2);
        }
        .lantas-btn-outline {
          padding: 14px 32px;
          background: transparent;
          color: #1A1A1A;
          border: 2px solid #E8E5E0;
          border-radius: 50px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s;
        }
        .lantas-btn-outline:hover {
          border-color: #1A1A1A;
          transform: translateY(-2px);
        }

        /* ===== MOCKUP PREVIEW ===== */
        .lantas-preview {
          max-width: 1000px;
          margin: 0 auto 80px;
          padding: 0 32px;
          animation: heroFadeIn 1s ease-out 0.3s both;
        }
        .lantas-preview-window {
          background: #fff;
          border-radius: 20px;
          border: 1px solid #E8E5E0;
          overflow: hidden;
          box-shadow: 0 24px 80px rgba(0,0,0,0.08);
        }
        .lantas-preview-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 14px 18px;
          background: #F9F7F5;
          border-bottom: 1px solid #E8E5E0;
        }
        .lantas-preview-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }
        .lantas-preview-dot.red { background: #FF5F57; }
        .lantas-preview-dot.yellow { background: #FFBD2E; }
        .lantas-preview-dot.green { background: #28CA41; }
        .lantas-preview-bar-text {
          margin-left: 12px;
          font-size: 13px;
          color: #9CA3AF;
          font-weight: 500;
        }
        .lantas-preview-body {
          padding: 32px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .lantas-preview-stat {
          background: #F9F7F5;
          border-radius: 14px;
          padding: 20px;
          text-align: center;
          border: 1px solid #E8E5E0;
        }
        .lantas-preview-stat-icon {
          font-size: 24px;
          margin-bottom: 8px;
        }
        .lantas-preview-stat-num {
          font-size: 28px;
          font-weight: 800;
          color: #1A1A1A;
        }
        .lantas-preview-stat-label {
          font-size: 12px;
          color: #9CA3AF;
          font-weight: 600;
          margin-top: 2px;
        }

        /* ===== FEATURES ===== */
        .lantas-features {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 32px 100px;
        }
        .lantas-features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .lantas-feature-card {
          background: #fff;
          border: 1px solid #E8E5E0;
          border-radius: 20px;
          padding: 32px;
          transition: all 0.3s;
          animation: heroFadeIn 0.8s ease-out both;
        }
        .lantas-feature-card:nth-child(1) { animation-delay: 0.1s; }
        .lantas-feature-card:nth-child(2) { animation-delay: 0.2s; }
        .lantas-feature-card:nth-child(3) { animation-delay: 0.3s; }
        .lantas-feature-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 48px rgba(0,0,0,0.08);
        }
        .lantas-feature-icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          font-size: 24px;
          margin-bottom: 20px;
        }
        .lantas-feature-card h3 {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 8px;
          color: #1A1A1A;
        }
        .lantas-feature-card p {
          font-size: 14px;
          line-height: 1.6;
          color: #6B7280;
        }

        /* ===== FOOTER ===== */
        .lantas-footer {
          background: #1A1A1A;
          padding: 40px 32px;
          text-align: center;
        }
        .lantas-footer-brand {
          font-size: 18px;
          font-weight: 800;
          color: #fff;
          margin-bottom: 8px;
        }
        .lantas-footer p {
          font-size: 13px;
          color: #9CA3AF;
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 768px) {
          .lantas-header { padding: 16px 20px; }
          .lantas-nav { gap: 16px; }
          .lantas-nav a:not(.lantas-nav-cta) { display: none; }
          .lantas-hero { padding: 60px 20px 40px; }
          .lantas-hero p { font-size: 15px; }
          .lantas-preview-body { grid-template-columns: 1fr; padding: 20px; }
          .lantas-features-grid { grid-template-columns: 1fr; }
          .lantas-hero-actions { flex-direction: column; }
        }

        @media (prefers-reduced-motion: reduce) {
          .lantas-hero,
          .lantas-preview,
          .lantas-feature-card {
            animation: none;
          }
        }
      `}</style>

      {/* Header */}
      <header className="lantas-header">
        <Link href="/lapor_mulia" className="lantas-brand">
          <div className="lantas-brand-icon">🏛️</div>
          <span className="lantas-brand-name">LANTAS</span>
        </Link>
        <nav className="lantas-nav">
          <a href="#fitur">Fitur</a>
          <a href="#cara-kerja">Cara Kerja</a>
          <a href="#tentang">Tentang</a>
          <Link href="/lapor_mulia/login" className="lantas-nav-cta">Masuk</Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="lantas-hero">
        <div className="lantas-hero-badge">
          <span className="lantas-hero-badge-dot" />
          Gratis untuk seluruh civitas akademika
        </div>

        <h1>Melaporkan dan<br />Mengatasi Masalah<br />Kampus Bersama</h1>
        <div className="lantas-hero-sub">Lantas — Lapor dan Atasi</div>
        <p>
          Mahasiswa tidak hanya melapor, tapi juga memberikan solusi.
          Pihak kampus mengeksekusi. Transparan, terukur, dan terpercaya.
        </p>

        <div className="lantas-hero-actions">
          <Link href="/lapor_mulia/login" className="lantas-btn-primary">
            Mulai Lapor →
          </Link>
          <a href="#fitur" className="lantas-btn-outline">
            Pelajari Lebih Lanjut
          </a>
        </div>
      </section>

      {/* Preview Mockup */}
      <section className="lantas-preview">
        <div className="lantas-preview-window">
          <div className="lantas-preview-bar">
            <span className="lantas-preview-dot red" />
            <span className="lantas-preview-dot yellow" />
            <span className="lantas-preview-dot green" />
            <span className="lantas-preview-bar-text">LANTAS Dashboard</span>
          </div>
          <div className="lantas-preview-body">
            <div className="lantas-preview-stat">
              <div className="lantas-preview-stat-icon">📋</div>
              <div className="lantas-preview-stat-num">{stats.total}</div>
              <div className="lantas-preview-stat-label">Total Laporan</div>
            </div>
            <div className="lantas-preview-stat">
              <div className="lantas-preview-stat-icon">✅</div>
              <div className="lantas-preview-stat-num">{stats.selesai}</div>
              <div className="lantas-preview-stat-label">Selesai</div>
            </div>
            <div className="lantas-preview-stat">
              <div className="lantas-preview-stat-icon">⏳</div>
              <div className="lantas-preview-stat-num">{stats.diproses}</div>
              <div className="lantas-preview-stat-label">Diproses</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="lantas-features" id="fitur">
        <div className="lantas-features-grid">
          <div className="lantas-feature-card">
            <div className="lantas-feature-icon" style={{background: '#EEF2FF', color: '#4F46E5'}}>📝</div>
            <h3>Melapor & Solusi</h3>
            <p>Laporkan masalah kampus beserta usulan solusi Anda. Bukan sekadar komplain, tapi aksi nyata.</p>
          </div>
          <div className="lantas-feature-card">
            <div className="lantas-feature-icon" style={{background: '#FEF3C7', color: '#D97706'}}>👥</div>
            <h3>Kolaborasi</h3>
            <p>Diskusi bersama komunitas kampus. Temukan solusi terbaik dari berbagai sudut pandang.</p>
          </div>
          <div className="lantas-feature-card">
            <div className="lantas-feature-icon" style={{background: '#D1FAE5', color: '#059669'}}>⚡</div>
            <h3>Eksekusi Cepat</h3>
            <p>Pihak kampus menindaklanjuti laporan secara transparan dan terukur hingga tuntas.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="lantas-footer">
        <div className="lantas-footer-brand">🏛️ LANTAS</div>
        <p>Universitas Mulia — Sistem Pengaduan & Layanan Kampus Terpadu</p>
      </footer>
    </>
  );
}

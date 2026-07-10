import Link from 'next/link';

const features = [
  {
    title: 'Pengaduan Kampus',
    description: 'Sampaikan kendala fasilitas, akademik, dan lingkungan kampus dengan alur yang mudah dipantau.',
  },
  {
    title: 'Layanan Terpadu',
    description: 'Akses informasi layanan kampus dalam satu tempat tanpa harus berpindah kanal.',
  },
  {
    title: 'Forum Aspirasi',
    description: 'Bangun ruang diskusi yang rapi untuk mahasiswa, dosen, dan pengelola sistem.',
  },
];

const stats = [
  { value: '24/7', label: 'Akses laporan' },
  { value: '1', label: 'Pusat layanan' },
  { value: '3', label: 'Fitur utama' },
];

export default function WelcomePage() {
  return (
    <>
      <style>{`
        .welcome-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at 15% 20%, rgba(123, 16, 35, 0.16), transparent 34%),
            radial-gradient(circle at 85% 10%, rgba(22, 119, 190, 0.12), transparent 32%),
            linear-gradient(135deg, var(--bg) 0%, var(--bg-card) 100%);
          color: var(--text);
          overflow: hidden;
        }
        @keyframes welcomeFadeUp {
          from {
            opacity: 0;
            transform: translateY(32px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes welcomeFadeDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes welcomeScaleIn {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.94);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes welcomeFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .welcome-shell {
          width: min(1120px, calc(100% - 40px));
          margin: 0 auto;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 40px;
          padding: 28px 0 36px;
        }
        .welcome-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          opacity: 0;
          animation: welcomeFadeDown 0.75s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .welcome-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--text);
          text-decoration: none;
        }
        .welcome-brand-mark {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          color: white;
          font-size: 22px;
          font-weight: var(--fw-extrabold);
          box-shadow: 0 16px 32px rgba(123, 16, 35, 0.22);
        }
        .welcome-brand-title {
          display: block;
          font-size: var(--text-lg);
          font-weight: var(--fw-extrabold);
          line-height: var(--lh-tight);
        }
        .welcome-brand-subtitle {
          display: block;
          color: var(--muted);
          font-size: var(--text-sm);
          line-height: var(--lh-normal);
        }
        .welcome-login-link {
          color: var(--primary);
          text-decoration: none;
          font-weight: var(--fw-bold);
          padding: 10px 16px;
          border: 1px solid rgba(123, 16, 35, 0.22);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.72);
        }
        .welcome-main {
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(320px, 0.95fr);
          gap: 48px;
          align-items: center;
        }
        .welcome-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          width: fit-content;
          padding: 8px 12px;
          border-radius: 999px;
          background: var(--primary-light);
          color: var(--primary);
          font-size: var(--text-sm);
          font-weight: var(--fw-bold);
          margin-bottom: 18px;
          opacity: 0;
          animation: welcomeFadeUp 0.75s cubic-bezier(0.22, 1, 0.36, 1) 0.12s forwards;
        }
        .welcome-title {
          font-size: clamp(42px, 7vw, 72px);
          line-height: 0.98;
          letter-spacing: 0;
          margin: 0 0 22px;
          font-weight: var(--fw-extrabold);
          color: var(--text);
          opacity: 0;
          animation: welcomeFadeUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.2s forwards;
        }
        .welcome-title span {
          color: var(--primary);
        }
        .welcome-description {
          max-width: 620px;
          color: var(--muted);
          font-size: var(--text-lg);
          line-height: var(--lh-relaxed);
          margin: 0 0 30px;
          opacity: 0;
          animation: welcomeFadeUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.3s forwards;
        }
        .welcome-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          align-items: center;
          margin-bottom: 34px;
          opacity: 0;
          animation: welcomeFadeUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.4s forwards;
        }
        .welcome-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 52px;
          padding: 0 24px;
          border-radius: 14px;
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          color: white;
          font-size: var(--text-md);
          font-weight: var(--fw-bold);
          text-decoration: none;
          box-shadow: 0 18px 34px rgba(123, 16, 35, 0.28);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .welcome-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 22px 42px rgba(123, 16, 35, 0.34);
        }
        .welcome-secondary {
          color: var(--muted);
          font-size: var(--text-base);
          line-height: var(--lh-normal);
        }
        .welcome-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          max-width: 560px;
        }
        .welcome-stat {
          padding: 16px;
          border-radius: 16px;
          border: 1px solid rgba(123, 16, 35, 0.12);
          background: rgba(255, 255, 255, 0.72);
          opacity: 0;
          animation: welcomeFadeUp 0.65s ease forwards;
        }
        .welcome-stat:nth-child(1) {
          animation-delay: 0.48s;
        }
        .welcome-stat:nth-child(2) {
          animation-delay: 0.56s;
        }
        .welcome-stat:nth-child(3) {
          animation-delay: 0.64s;
        }
        .welcome-stat strong {
          display: block;
          color: var(--primary);
          font-size: var(--text-2xl);
          line-height: var(--lh-tight);
          margin-bottom: 4px;
        }
        .welcome-stat span {
          color: var(--muted);
          font-size: var(--text-sm);
        }
        .welcome-preview {
          position: relative;
          min-height: 500px;
          display: grid;
          place-items: center;
        }
        .welcome-device {
          width: min(420px, 100%);
          border-radius: 32px;
          padding: 18px;
          background: #ffffff;
          border: 1px solid rgba(123, 16, 35, 0.12);
          box-shadow: 0 30px 80px rgba(18, 25, 38, 0.18);
          opacity: 0;
          animation:
            welcomeScaleIn 0.85s cubic-bezier(0.2, 0.8, 0.2, 1) 0.28s forwards,
            welcomeFloat 5s ease-in-out 1.25s infinite;
        }
        [data-theme='dark'] .welcome-device,
        [data-theme='dark'] .welcome-stat,
        [data-theme='dark'] .welcome-login-link,
        [data-theme='dark'] .welcome-feature {
          background: rgba(20, 25, 45, 0.78);
        }
        .welcome-device-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
        }
        .welcome-device-title {
          font-weight: var(--fw-extrabold);
          color: var(--text);
        }
        .welcome-device-pill {
          padding: 6px 10px;
          border-radius: 999px;
          color: var(--primary);
          background: var(--primary-light);
          font-size: var(--text-xs);
          font-weight: var(--fw-bold);
        }
        .welcome-report-card {
          padding: 18px;
          border-radius: 22px;
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          color: white;
          margin-bottom: 14px;
          opacity: 0;
          animation: welcomeFadeUp 0.75s cubic-bezier(0.22, 1, 0.36, 1) 0.72s forwards;
        }
        .welcome-report-card small {
          display: block;
          opacity: 0.78;
          margin-bottom: 10px;
        }
        .welcome-report-card strong {
          display: block;
          font-size: var(--text-xl);
          line-height: var(--lh-tight);
          margin-bottom: 14px;
        }
        .welcome-progress {
          height: 8px;
          background: rgba(255, 255, 255, 0.24);
          border-radius: 999px;
          overflow: hidden;
        }
        .welcome-progress span {
          display: block;
          width: 68%;
          height: 100%;
          background: #ffffff;
          border-radius: inherit;
        }
        .welcome-feature-list {
          display: grid;
          gap: 12px;
        }
        .welcome-feature {
          display: grid;
          grid-template-columns: 42px 1fr;
          gap: 12px;
          align-items: center;
          padding: 14px;
          border-radius: 18px;
          background: var(--bg);
          border: 1px solid var(--border);
          opacity: 0;
          animation: welcomeFadeUp 0.65s ease forwards;
        }
        .welcome-feature:nth-child(1) {
          animation-delay: 0.86s;
        }
        .welcome-feature:nth-child(2) {
          animation-delay: 0.96s;
        }
        .welcome-feature:nth-child(3) {
          animation-delay: 1.06s;
        }
        .welcome-feature-icon {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          background: var(--primary-light);
          color: var(--primary);
          font-weight: var(--fw-extrabold);
        }
        .welcome-feature h2 {
          font-size: var(--text-base);
          margin: 0 0 4px;
          line-height: var(--lh-tight);
        }
        .welcome-feature p {
          font-size: var(--text-sm);
          margin: 0;
          color: var(--muted);
          line-height: var(--lh-normal);
        }
        .welcome-footer {
          color: var(--muted);
          font-size: var(--text-sm);
          opacity: 0;
          animation: welcomeFadeUp 0.75s cubic-bezier(0.22, 1, 0.36, 1) 0.72s forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .welcome-nav,
          .welcome-eyebrow,
          .welcome-title,
          .welcome-description,
          .welcome-actions,
          .welcome-stat,
          .welcome-device,
          .welcome-report-card,
          .welcome-feature,
          .welcome-footer {
            opacity: 1;
            transform: none;
            animation: none;
          }
        }
        @media (max-width: 860px) {
          .welcome-shell {
            width: min(100% - 28px, 640px);
            padding-top: 20px;
          }
          .welcome-main {
            grid-template-columns: 1fr;
            gap: 34px;
          }
          .welcome-preview {
            min-height: auto;
            place-items: stretch;
          }
          .welcome-title {
            font-size: clamp(38px, 13vw, 56px);
          }
          .welcome-stats {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 520px) {
          .welcome-nav {
            align-items: flex-start;
          }
          .welcome-brand-subtitle {
            display: none;
          }
          .welcome-login-link {
            padding: 9px 12px;
          }
          .welcome-description {
            font-size: var(--text-md);
          }
          .welcome-actions {
            align-items: stretch;
          }
          .welcome-cta {
            width: 100%;
          }
          .welcome-device {
            border-radius: 24px;
            padding: 14px;
          }
        }
      `}</style>

      <div className="welcome-page">
        <div className="welcome-shell">
          <nav className="welcome-nav" aria-label="Welcome navigation">
            <Link href="/lapor_mulia" className="welcome-brand">
              <span className="welcome-brand-mark">M</span>
              <span>
                <span className="welcome-brand-title">Mulia Lapor</span>
                <span className="welcome-brand-subtitle">Universitas Mulia</span>
              </span>
            </Link>
            <Link href="/lapor_mulia/login" className="welcome-login-link">
              Login
            </Link>
          </nav>

          <main className="welcome-main">
            <section aria-labelledby="welcome-title">
              <div className="welcome-eyebrow">Sistem layanan kampus terpadu</div>
              <h1 id="welcome-title" className="welcome-title">
                Suara kampus jadi lebih <span>terarah.</span>
              </h1>
              <p className="welcome-description">
                Mulia Lapor membantu mahasiswa, dosen, dan admin mengelola pengaduan,
                layanan, serta aspirasi kampus dalam satu pengalaman yang sederhana.
              </p>
              <div className="welcome-actions">
                <Link href="/lapor_mulia/login" className="welcome-cta">
                  Get Started
                </Link>
                <span className="welcome-secondary">Masuk sebagai user atau admin sesuai kebutuhan.</span>
              </div>
              <div className="welcome-stats" aria-label="Ringkasan Mulia Lapor">
                {stats.map((item) => (
                  <div key={item.label} className="welcome-stat">
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="welcome-preview" aria-label="Preview fitur Mulia Lapor">
              <div className="welcome-device">
                <div className="welcome-device-top">
                  <span className="welcome-device-title">Dashboard Laporan</span>
                  <span className="welcome-device-pill">Aktif</span>
                </div>
                <div className="welcome-report-card">
                  <small>Status laporan terbaru</small>
                  <strong>Fasilitas kelas sedang diproses</strong>
                  <div className="welcome-progress"><span /></div>
                </div>
                <div className="welcome-feature-list">
                  {features.map((feature, index) => (
                    <article key={feature.title} className="welcome-feature">
                      <div className="welcome-feature-icon">0{index + 1}</div>
                      <div>
                        <h2>{feature.title}</h2>
                        <p>{feature.description}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          </main>

          <footer className="welcome-footer">
            Universitas Mulia - Sistem Pengaduan & Layanan Kampus Terpadu
          </footer>
        </div>
      </div>
    </>
  );
}


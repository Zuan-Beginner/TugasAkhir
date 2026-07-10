'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const ADMIN_KEY = 'muliaAdminSession';
const ADMIN_CODE = 'admin123';

export default function AdminForumLoginPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if already logged in as admin
    if (typeof window !== 'undefined') {
      const isAdmin = window.localStorage.getItem(ADMIN_KEY);
      if (isAdmin === 'true') {
        router.push('/lapor_mulia/forum');
      }
    }
  }, [router]);

  function handleLogin() {
    setIsLoading(true);
    setError('');

    if (code.trim() === ADMIN_CODE) {
      localStorage.setItem(ADMIN_KEY, 'true');
      setTimeout(() => {
        router.push('/lapor_mulia/forum');
      }, 500);
    } else {
      setError('Kode admin salah. Silakan coba lagi.');
      setIsLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }

        .admin-login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
          position: relative;
          overflow: hidden;
        }
        .admin-login-container::before {
          content: '';
          position: absolute;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: move 20s linear infinite;
        }
        @keyframes move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }

        .admin-login-box {
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 48px 40px;
          width: 100%;
          max-width: 440px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          position: relative;
          z-index: 1;
          animation: fadeInUp 0.6s ease-out;
        }

        .admin-login-header {
          text-align: center;
          margin-bottom: 32px;
        }
        .admin-login-logo {
          width: 80px;
          height: 80px;
          margin: 0 auto 16px;
          border-radius: 20px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          display: grid;
          place-items: center;
          font-size: 40px;
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
          animation: pulse 2s infinite;
        }
        .admin-login-title {
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 8px;
          color: #1a1a1a;
        }
        .admin-login-subtitle {
          font-size: 14px;
          color: #666;
          font-weight: 500;
        }

        .admin-input-group {
          margin-bottom: 24px;
        }
        .admin-input-group label {
          display: block;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 8px;
          color: #333;
        }
        .admin-input-group input {
          width: 100%;
          padding: 14px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 15px;
          outline: none;
          transition: all 0.2s;
          background: #fafbfc;
          font-family: inherit;
        }
        .admin-input-group input:focus {
          border-color: #667eea;
          background: var(--card, white);
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
        }

        .admin-login-btn {
          width: 100%;
          padding: 16px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .admin-login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(102, 126, 234, 0.4);
        }
        .admin-login-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .admin-error {
          margin-top: 16px;
          padding: 12px 16px;
          border-radius: 10px;
          background: #fee;
          color: #c00;
          font-size: 13px;
          font-weight: 600;
          display: none;
          border-left: 4px solid #c00;
          animation: shake 0.5s;
        }
        .admin-error.show {
          display: block;
        }

        .admin-login-footer {
          text-align: center;
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid #e5e7eb;
        }
        .admin-login-footer a {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          transition: color 0.2s;
        }
        .admin-login-footer a:hover {
          color: #764ba2;
        }

        .admin-demo-hint {
          margin-top: 16px;
          padding: 12px;
          background: #f0f9ff;
          border-radius: 10px;
          font-size: 12px;
          color: #0369a1;
          text-align: center;
        }

        .admin-features {
          margin-top: 24px;
          padding: 16px;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
          border-radius: 12px;
        }
        .admin-features-title {
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 12px;
          color: #333;
        }
        .admin-feature-item {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-size: 12px;
          color: #666;
        }
        .admin-feature-icon {
          font-size: 16px;
        }
        /* Dark mode overrides */
        [data-theme="dark"] .admin-login-container { background: linear-gradient(135deg, #1a1a2e, #16213e); }
        [data-theme="dark"] .admin-login-box { background: var(--card, #1A1D24); }
        [data-theme="dark"] .admin-login-title { color: var(--text, #ECEDEE); }
        [data-theme="dark"] .admin-login-subtitle { color: var(--muted, #9BA1A6); }
        [data-theme="dark"] .admin-input-group input { background: var(--card, #1A1D24); color: var(--text, #ECEDEE); border-color: var(--border, #2A2E37); }
        [data-theme="dark"] .admin-input-group label { color: var(--text, #ECEDEE); }
        [data-theme="dark"] .admin-feature-item { color: var(--muted, #9BA1A6); }
      `}</style>

      <div className="admin-login-container">
        <div className="admin-login-box">
          <div className="admin-login-header">
            <div className="admin-login-logo">👑</div>
            <h1 className="admin-login-title">Admin Forum Login</h1>
            <p className="admin-login-subtitle">Login sebagai admin untuk akses fitur khusus</p>
          </div>

          <div className="admin-input-group">
            <label>Kode Admin</label>
            <input
              type="password"
              placeholder="Masukkan kode admin"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isLoading) {
                  handleLogin();
                }
              }}
              disabled={isLoading}
            />
          </div>

          <button
            className="admin-login-btn"
            onClick={handleLogin}
            disabled={isLoading || !code.trim()}
          >
            {isLoading ? (
              <>
                <span>⏳</span>
                <span>Memverifikasi...</span>
              </>
            ) : (
              <>
                <span>🚀</span>
                <span>Login sebagai Admin</span>
              </>
            )}
          </button>

          <div className={`admin-error ${error ? 'show' : ''}`}>
            {error}
          </div>

          <div className="admin-demo-hint">
            💡 <strong>Demo:</strong> Gunakan kode{' '}
            <code style={{padding: '2px 6px', background: 'white', borderRadius: '4px', fontWeight: 700}}>
              admin123
            </code>
          </div>

          <div className="admin-features">
            <div className="admin-features-title">Fitur Admin Forum:</div>
            <div className="admin-feature-item">
              <span className="admin-feature-icon">📌</span>
              <span>Pin pesan penting untuk semua pengguna</span>
            </div>
            <div className="admin-feature-item">
              <span className="admin-feature-icon">🗑️</span>
              <span>Hapus pesan yang tidak sesuai</span>
            </div>
            <div className="admin-feature-item">
              <span className="admin-feature-icon">👁️</span>
              <span>Filter khusus untuk pesan yang di-pin</span>
            </div>
            <div className="admin-feature-item">
              <span className="admin-feature-icon">⭐</span>
              <span>Tandai pesan favorit dengan bintang</span>
            </div>
          </div>

          <div className="admin-login-footer">
            <a href="/lapor_mulia/forum">← Kembali ke Forum (sebagai user)</a>
          </div>
        </div>
      </div>
    </>
  );
}

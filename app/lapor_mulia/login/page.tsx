'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth-context';

const avatarEmojis = ['👨', '👩', '🧑', '👨‍🎓', '👩‍🎓', '👨‍💼', '👩‍💼', '🧑‍💼', '👨‍🏫', '👩‍🏫'];
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_MULIA_ADMIN_PASSWORD ?? '';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'user' | 'admin'>('user');
  const [name, setName] = useState('');
  const [nim, setNim] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(avatarEmojis[0]);
  const [error, setError] = useState('');

  function handleSubmit() {
    setError('');
    if (selectedRole === 'user') {
      if (!nim.trim()) {
        setError('NIM harus diisi.');
        return;
      }
      if (!/^\d+$/.test(nim.trim())) {
        setError('NIM hanya boleh berisi angka.');
        return;
      }
      // Nama otomatis dari NIM
      const autoName = name.trim() || `Mahasiswa ${nim.trim()}`;
      login(autoName, 'user', selectedAvatar, undefined, nim.trim());
      router.push('/lapor_mulia/home');
      return;
    }

    if (!name.trim() || !password.trim()) {
      setError('Nama dan Password admin harus diisi.');
      return;
    }

    if (password.trim() !== ADMIN_PASSWORD) {
      setError('Password admin salah.');
      return;
    }

    login(name.trim() || 'Admin', 'admin', selectedAvatar, undefined, nim.trim() || undefined);
    router.push('/lapor_mulia/admin');
  }

  return (
    <>
      <style>{`
        .login-page-wrapper {
          min-height: 100vh;
          background: linear-gradient(135deg, var(--bg) 0%, var(--bg-card) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(32px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
<<<<<<< HEAD
=======
          to { opacity: 1; transform: translateY(0); }
        }
>>>>>>> 28cf1dbfc8506dadfd2e8a1e5984d8a5720a8f1d
        .login-box {
          background: white;
          border-radius: 24px;
          padding: 40px;
          max-width: 480px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0,0,0,0.1);
          animation: slideUp 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }
        [data-theme='dark'] .login-box {
          background: var(--bg-card);
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        }
        .login-logo {
          text-align: center;
          font-size: 64px;
          margin-bottom: 16px;
        }
        .login-title {
          font-size: var(--text-3xl);
          font-weight: var(--fw-extrabold);
          text-align: center;
          margin-bottom: 8px;
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .login-subtitle {
          font-size: var(--text-base);
          line-height: var(--lh-normal);
          color: var(--muted);
          text-align: center;
          margin-bottom: 32px;
        }
        .login-input {
          width: 100%;
          padding: 14px 16px;
          border: 2px solid var(--border);
          border-radius: 12px;
          font-size: var(--text-base);
          outline: none;
          margin-bottom: 20px;
          transition: all 0.3s;
          background: var(--bg);
          color: var(--text);
        }
        .login-input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(123, 16, 35, 0.1);
        }
        .role-selector {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 24px;
        }
        .role-option {
          padding: 16px;
          border: 3px solid var(--border);
          border-radius: 16px;
          background: var(--bg-card);
          cursor: pointer;
          transition: all 0.3s;
          text-align: center;
          color: var(--text);
        }
        .role-option:hover {
          border-color: var(--primary);
          transform: translateY(-2px);
        }
        .role-option.selected {
          border-color: var(--primary);
          background: linear-gradient(135deg, var(--primary-light), var(--bg-card));
          box-shadow: 0 4px 12px rgba(123, 16, 35, 0.1);
        }
        .role-icon {
          font-size: 32px;
          margin-bottom: 8px;
        }
        .role-name {
          font-size: var(--text-md);
          font-weight: var(--fw-bold);
          margin-bottom: 4px;
        }
        .role-desc {
          font-size: var(--text-sm);
          color: var(--muted);
        }
        .avatar-section-title {
          font-size: var(--text-sm);
          font-weight: var(--fw-bold);
          margin-bottom: 12px;
          color: var(--text);
        }
        .avatar-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 10px;
          margin-bottom: 32px;
        }
        .avatar-option {
          width: 100%;
          aspect-ratio: 1;
          border-radius: 50%;
          border: 3px solid var(--border);
          background: linear-gradient(135deg, #667eea, #764ba2);
          display: grid;
          place-items: center;
          font-size: 28px;
          cursor: pointer;
          transition: all 0.3s;
        }
        .avatar-option:hover {
          transform: scale(1.15) rotate(10deg);
          border-color: var(--primary);
        }
        .avatar-option.selected {
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(123, 16, 35, 0.2);
          transform: scale(1.1);
        }
        .login-btn {
          width: 100%;
          padding: 16px;
          border: none;
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          color: white;
          border-radius: 12px;
          font-size: var(--text-md);
          font-weight: var(--fw-bold);
          cursor: pointer;
          transition: all 0.3s;
        }
        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(123, 16, 35, 0.4);
        }
        .login-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .error-message {
          color: var(--danger, #E53935);
          font-size: var(--text-base);
          line-height: var(--lh-normal);
          text-align: center;
          margin-bottom: 16px;
          background: rgba(229, 57, 53, 0.1);
          padding: 8px;
          border-radius: 8px;
        }
      `}</style>

      <div className="login-page-wrapper">
        <div className="login-box">
          <div className="login-logo">🏛️</div>
          <h1 className="login-title">Mulia Lapor</h1>
          <p className="login-subtitle">Sistem Pengaduan & Layanan Kampus Terpadu</p>

          <div className="role-selector">
            <div
              className={`role-option ${selectedRole === 'user' ? 'selected' : ''}`}
              onClick={() => { setSelectedRole('user'); setError(''); }}
            >
              <div className="role-icon">👨‍🎓</div>
              <div className="role-name">User</div>
              <div className="role-desc">Mahasiswa & Dosen</div>
            </div>
            <div
              className={`role-option ${selectedRole === 'admin' ? 'selected' : ''}`}
              onClick={() => { setSelectedRole('admin'); setError(''); }}
            >
              <div className="role-icon">👨‍💼</div>
              <div className="role-name">Admin</div>
              <div className="role-desc">Pengelola Sistem</div>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          {selectedRole === 'user' ? (
            <>
              <input
                className="login-input"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="NIM (wajib)"
                value={nim}
                onChange={(e) => setNim(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
              <input
                className="login-input"
                type="text"
                placeholder="Nama (opsional, default: Mahasiswa {NIM})"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </>
          ) : (
            <>
              <input
                className="login-input"
                type="text"
                placeholder="Nama Admin"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
              <input
                className="login-input"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </>
          )}

          <div className="avatar-section-title">Pilih Avatar:</div>
          <div className="avatar-grid">
            {avatarEmojis.map((emoji) => (
              <div
                key={emoji}
                className={`avatar-option ${selectedAvatar === emoji ? 'selected' : ''}`}
                onClick={() => setSelectedAvatar(emoji)}
              >
                {emoji}
              </div>
            ))}
          </div>

          <button className="login-btn" onClick={handleSubmit}>
            {selectedRole === 'admin' ? 'Masuk sebagai Admin' : 'Masuk sebagai User'}
          </button>
        </div>
      </div>
    </>
  );
}


'use client';

import { useState } from 'react';

type LoginModalProps = {
  onLogin: (name: string, role: 'admin' | 'user', avatar: string) => void;
};

const avatarEmojis = ['👨', '👩', '🧑', '👨‍🎓', '👩‍🎓', '👨‍💼', '👩‍💼', '🧑‍💼', '👨‍🏫', '👩‍🏫'];

export function LoginModal({ onLogin }: LoginModalProps) {
  const [userName, setUserName] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'user'>('user');
  const [selectedAvatar, setSelectedAvatar] = useState(avatarEmojis[0]);

  const handleSubmit = () => {
    if (!userName.trim()) return;
    onLogin(userName.trim(), selectedRole, selectedAvatar);
  };

  return (
    <>
      <style>{`
        .login-overlay {
          position: fixed;
          inset: 0;
          background: linear-gradient(135deg, rgba(123, 16, 35, 0.95), rgba(50, 5, 15, 0.95));
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .login-box {
          background: white;
          border-radius: 24px;
          padding: 40px;
          max-width: 480px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0,0,0,0.4);
          animation: slideUp 0.5s ease-out;
        }
        .login-logo {
          text-align: center;
          font-size: 64px;
          margin-bottom: 16px;
        }
        .login-title {
          font-size: 28px;
          font-weight: 800;
          text-align: center;
          margin-bottom: 8px;
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .login-subtitle {
          font-size: 14px;
          color: var(--muted);
          text-align: center;
          margin-bottom: 32px;
        }
        .login-input {
          width: 100%;
          padding: 14px 16px;
          border: 2px solid var(--border);
          border-radius: 12px;
          font-size: 15px;
          outline: none;
          margin-bottom: 20px;
          transition: all 0.3s;
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
          background: white;
          cursor: pointer;
          transition: all 0.3s;
          text-align: center;
        }
        .role-option:hover {
          border-color: var(--primary);
          transform: translateY(-2px);
        }
        .role-option.selected {
          border-color: var(--primary);
          background: linear-gradient(135deg, var(--primary-light), white);
          box-shadow: 0 4px 12px rgba(123, 16, 35, 0.2);
        }
        .role-icon {
          font-size: 32px;
          margin-bottom: 8px;
        }
        .role-name {
          font-size: 15px;
          font-weight: 700;
          margin-bottom: 4px;
        }
        .role-desc {
          font-size: 12px;
          color: var(--muted);
        }
        .avatar-section-title {
          font-size: 13px;
          font-weight: 700;
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
          font-size: 16px;
          font-weight: 700;
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
      `}</style>

      <div className="login-overlay">
        <div className="login-box">
          <div className="login-logo">🏛️</div>
          <h1 className="login-title">Mulia Lapor</h1>
          <p className="login-subtitle">Sistem Pengaduan & Layanan Kampus Terpadu</p>

          <input
            className="login-input"
            type="text"
            placeholder="Nama Anda (NIM atau Nama Lengkap)"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            autoFocus
          />

          <div className="role-selector">
            <div
              className={`role-option ${selectedRole === 'user' ? 'selected' : ''}`}
              onClick={() => setSelectedRole('user')}
            >
              <div className="role-icon">👨‍🎓</div>
              <div className="role-name">User</div>
              <div className="role-desc">Mahasiswa & Dosen</div>
            </div>
            <div
              className={`role-option ${selectedRole === 'admin' ? 'selected' : ''}`}
              onClick={() => setSelectedRole('admin')}
            >
              <div className="role-icon">👨‍💼</div>
              <div className="role-name">Admin</div>
              <div className="role-desc">Pengelola Sistem</div>
            </div>
          </div>

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

          <button className="login-btn" onClick={handleSubmit} disabled={!userName.trim()}>
            {selectedRole === 'admin' ? '🔐 Masuk sebagai Admin' : '✨ Masuk sebagai User'}
          </button>
        </div>
      </div>
    </>
  );
}

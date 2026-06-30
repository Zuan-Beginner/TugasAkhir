'use client';

import { useState } from 'react';

type LoginModalProps = {
  onLogin: (name: string, role: 'admin' | 'user', avatar: string, gender: string, nim?: string) => void;
};

export function LoginModal({ onLogin }: LoginModalProps) {
  const [loginType, setLoginType] = useState<'identity' | 'anonymous'>('identity');
  const [userName, setUserName] = useState('');
  const [userNim, setUserNim] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'user'>('user');
  const [selectedGender, setSelectedGender] = useState<'laki' | 'perempuan'>('laki');
  const [isSignUp, setIsSignUp] = useState(false);
  const [signUpPassword, setSignUpPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const isAdminRole = selectedRole === 'admin';

  const handleSubmit = () => {
    if (isAdminRole) {
      if (!userName.trim() || !userPassword.trim()) return;
      onLogin(userName.trim(), 'admin', '', '');
    } else {
      if (loginType === 'identity') {
        if (!userName.trim() || !userNim.trim()) return;
        onLogin(userName.trim(), 'user', '', selectedGender, userNim.trim());
      } else {
        const anonName = selectedGender === 'laki' ? 'Pelapor Laki-laki' : 'Pelapor Perempuan';
        onLogin(anonName, 'user', '', selectedGender);
      }
    }
  };

  const isFormValid = isAdminRole
    ? userName.trim() && userPassword.trim()
    : loginType === 'identity'
      ? userName.trim() && userNim.trim()
      : true;

  return (
    <>
      <style>{`
        .login-overlay {
          position: fixed;
          inset: 0;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
          overflow-y: auto;
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
          border-radius: 20px;
          padding: 36px 28px;
          max-width: 440px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0,0,0,0.4);
          animation: slideUp 0.5s ease-out;
          margin: 20px 0 40px;
        }
        .login-logo {
          text-align: center;
          margin-bottom: 12px;
        }
        .login-logo-icon {
          width: 72px;
          height: 72px;
          background: linear-gradient(135deg, #0f3460, #1a1a2e);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          box-shadow: 0 8px 24px rgba(15, 52, 96, 0.3);
        }
        .login-logo-icon svg {
          width: 36px;
          height: 36px;
          fill: white;
        }
        .login-title {
          font-size: 26px;
          font-weight: 800;
          text-align: center;
          margin-bottom: 6px;
          color: #1a1a2e;
          letter-spacing: -0.5px;
        }
        .login-subtitle {
          font-size: 13px;
          color: #64748b;
          text-align: center;
          margin-bottom: 28px;
        }
        .login-type-selector {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 24px;
        }
        .login-type-btn {
          padding: 14px 10px;
          border: 2px solid #e2e8f0;
          border-radius: 14px;
          background: white;
          cursor: pointer;
          transition: all 0.3s;
          text-align: center;
          font-size: 13px;
          font-weight: 600;
          color: #64748b;
        }
        .login-type-btn:hover {
          border-color: #0f3460;
          color: #0f3460;
        }
        .login-type-btn.selected {
          border-color: #0f3460;
          background: linear-gradient(135deg, #e8f0fe, #f0f4ff);
          color: #0f3460;
          box-shadow: 0 4px 12px rgba(15, 52, 96, 0.15);
        }
        .login-type-icon {
          font-size: 22px;
          margin-bottom: 6px;
        }
        .login-type-label {
          font-size: 13px;
          font-weight: 700;
        }
        .login-input {
          width: 100%;
          padding: 13px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 14px;
          outline: none;
          margin-bottom: 14px;
          transition: all 0.3s;
          box-sizing: border-box;
        }
        .login-input:focus {
          border-color: #0f3460;
          box-shadow: 0 0 0 3px rgba(15, 52, 96, 0.1);
        }
        .login-input::placeholder {
          color: #94a3b8;
        }
        .gender-label {
          font-size: 13px;
          font-weight: 700;
          color: #334155;
          margin-bottom: 10px;
        }
        .gender-selector {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 20px;
        }
        .gender-option {
          padding: 12px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          background: white;
          cursor: pointer;
          transition: all 0.3s;
          text-align: center;
          font-size: 13px;
          font-weight: 600;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .gender-option:hover {
          border-color: #0f3460;
          color: #0f3460;
        }
        .gender-option.selected {
          border-color: #0f3460;
          background: linear-gradient(135deg, #e8f0fe, #f0f4ff);
          color: #0f3460;
          box-shadow: 0 4px 12px rgba(15, 52, 96, 0.15);
        }
        .gender-dot {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
          flex-shrink: 0;
        }
        .gender-option.selected .gender-dot {
          border-color: #0f3460;
          background: #0f3460;
        }
        .gender-option.selected .gender-dot::after {
          content: '';
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: white;
        }
        .role-label {
          font-size: 13px;
          font-weight: 700;
          color: #334155;
          margin-bottom: 10px;
        }
        .role-selector {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 24px;
        }
        .role-option {
          padding: 14px 10px;
          border: 2px solid #e2e8f0;
          border-radius: 14px;
          background: white;
          cursor: pointer;
          transition: all 0.3s;
          text-align: center;
        }
        .role-option:hover {
          border-color: #0f3460;
        }
        .role-option.selected {
          border-color: #0f3460;
          background: linear-gradient(135deg, #e8f0fe, #f0f4ff);
          box-shadow: 0 4px 12px rgba(15, 52, 96, 0.15);
        }
        .role-icon-wrapper {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 8px;
          transition: all 0.3s;
        }
        .role-option:nth-child(1) .role-icon-wrapper {
          background: #e8f0fe;
        }
        .role-option:nth-child(2) .role-icon-wrapper {
          background: #fce7f3;
        }
        .role-option.selected:nth-child(1) .role-icon-wrapper {
          background: #0f3460;
        }
        .role-option.selected:nth-child(2) .role-icon-wrapper {
          background: #0f3460;
        }
        .role-icon-wrapper svg {
          width: 20px;
          height: 20px;
          fill: #64748b;
        }
        .role-option.selected .role-icon-wrapper svg {
          fill: white;
        }
        .role-name {
          font-size: 13px;
          font-weight: 700;
          color: #334155;
          margin-bottom: 2px;
        }
        .role-desc {
          font-size: 11px;
          color: #94a3b8;
        }
        .login-btn {
          width: 100%;
          padding: 15px;
          border: none;
          background: linear-gradient(135deg, #0f3460, #1a1a2e);
          color: white;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
          letter-spacing: 0.3px;
        }
        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(15, 52, 96, 0.4);
        }
        .login-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .anon-note {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 12px 14px;
          margin-bottom: 20px;
          font-size: 12px;
          color: #64748b;
          line-height: 1.5;
        }
        .anon-note strong {
          color: #334155;
        }
        .admin-badge {
          display: inline-block;
          padding: 4px 12px;
          background: linear-gradient(135deg, #0f3460, #1a1a2e);
          color: white;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 700;
          margin-bottom: 16px;
          text-align: center;
          width: 100%;
        }
      `}</style>

      <div className="login-overlay">
        <div className="login-box">
          <div className="login-logo">
            <div className="login-logo-icon">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7V10H22V7L12 2ZM4 12V18H8V12H4ZM10 12V18H14V12H10ZM16 12V18H20V12H16ZM2 20V22H22V20H2Z"/>
              </svg>
            </div>
          </div>
          <h1 className="login-title">Mulia Lapor</h1>
          <p className="login-subtitle">Sistem Pengaduan & Layanan Kampus Terpadu</p>

          {/* Role Selector - Always shown */}
          <div className="role-label">Masuk Sebagai</div>
          <div className="role-selector">
            <div
              className={`role-option ${selectedRole === 'user' ? 'selected' : ''}`}
              onClick={() => {
                setSelectedRole('user');
                setUserName('');
                setUserNim('');
                setUserPassword('');
                setLoginType('identity');
              }}
            >
              <div className="role-icon-wrapper">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM16 18H8V16H16V18ZM16 14H8V12H16V14ZM13 9V3.5L18.5 9H13Z"/>
                </svg>
              </div>
              <div className="role-name">Pelapor</div>
              <div className="role-desc">Buat Laporan</div>
            </div>
            <div
              className={`role-option ${selectedRole === 'admin' ? 'selected' : ''}`}
              onClick={() => {
                setSelectedRole('admin');
                setUserName('');
                setUserNim('');
                setUserPassword('');
              }}
            >
              <div className="role-icon-wrapper">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM10.94 15.54L7.4 12L8.81 10.59L10.93 12.71L15.17 8.47L16.58 9.88L10.94 15.54Z"/>
                </svg>
              </div>
              <div className="role-name">Admin</div>
              <div className="role-desc">Pengelola Sistem</div>
            </div>
          </div>

          {/* Admin Login: Identity only (Name + Password) */}
          {isAdminRole && (
            <>
              <div className="admin-badge">Masuk dengan Admin</div>
              <input
                className="login-input"
                type="text"
                placeholder="Nama Administrator"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                autoFocus
              />
              <input
                className="login-input"
                type="password"
                placeholder="Password"
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
              />
            </>
          )}

          {/* Pelapor Login: Identity / Anonymous toggle */}
          {!isAdminRole && (
            <>
              {/* Login Type Selector */}
              <div className="login-type-selector">
                <div
                  className={`login-type-btn ${loginType === 'identity' ? 'selected' : ''}`}
                  onClick={() => setLoginType('identity')}
                >
                  <div className="login-type-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 21V19C20 17.94 19.1 17 18 19H14C12.9 17 12 17.94 12 19V21H18C19.1 21 20 20.06 20 19ZM12 17C14.21 17 16 15.21 16 13C16 10.79 14.21 9 12 9C9.79 9 8 10.79 8 13C8 15.21 9.79 17 12 17ZM18 8H20V13H18V8ZM6 8V13H8V8H6ZM12 2C10.34 2 9 3.34 9 5C9 6.66 10.34 8 12 8C13.66 8 15 6.66 15 5C15 3.34 13.66 2 12 2Z" fill="#64748B"/>
                    </svg>
                  </div>
                  <div className="login-type-label">Identitas</div>
                </div>
                <div
                  className={`login-type-btn ${loginType === 'anonymous' ? 'selected' : ''}`}
                  onClick={() => setLoginType('anonymous')}
                >
                  <div className="login-type-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM9 11.99C9 10.34 10.34 9 12 9C13.66 9 15 10.34 15 11.99C15 13.64 13.66 14.99 12 14.99C10.34 14.99 9 13.64 9 11.99ZM6 17.5C6 15 9 13.5 12 13.5C15 13.5 18 15 18 17.5V18H6V17.5Z" fill="#64748B"/>
                    </svg>
                  </div>
                  <div className="login-type-label">Anonim</div>
                </div>
              </div>

              {/* Identity Fields: Name + NIM */}
              {loginType === 'identity' && (
                <>
                  <input
                    className="login-input"
                    type="text"
                    placeholder="Nama Lengkap"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    autoFocus
                  />
                  <input
                    className="login-input"
                    type="text"
                    placeholder="NIM"
                    value={userNim}
                    onChange={(e) => setUserNim(e.target.value)}
                  />
                </>
              )}

              {/* Anonymous Note */}
              {loginType === 'anonymous' && (
                <div className="anon-note">
                  <strong>Laporan Anonim:</strong> Identitas Anda tidak akan ditampilkan. Namun, admin tidak dapat menghubungi Anda untuk klarifikasi lebih lanjut.
                </div>
              )}

              {/* Gender Selector */}
              <div className="gender-label">Jenis Kelamin</div>
              <div className="gender-selector">
                <div
                  className={`gender-option ${selectedGender === 'laki' ? 'selected' : ''}`}
                  onClick={() => setSelectedGender('laki')}
                >
                  <div className="gender-dot"></div>
                  Laki-laki
                </div>
                <div
                  className={`gender-option ${selectedGender === 'perempuan' ? 'selected' : ''}`}
                  onClick={() => setSelectedGender('perempuan')}
                >
                  <div className="gender-dot"></div>
                  Perempuan
                </div>
              </div>
            </>
          )}

          <button className="login-btn" onClick={handleSubmit} disabled={!isFormValid}>
            {isAdminRole ? 'Masuk dengan Admin' : loginType === 'identity' ? 'Masuk dengan Identitas' : 'Masuk sebagai Anonim'}
          </button>
        </div>
      </div>
    </>
  );
}
 

//
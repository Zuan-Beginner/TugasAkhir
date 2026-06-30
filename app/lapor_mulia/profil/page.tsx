'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getReports, saveReports, getBilling } from '../lib/storage';
import { getStatusColor } from '../lib/constants';
import type { Report, ReportStatus } from '../lib/types';
import { useAuth } from '../lib/auth-context';

type ProfilModal = 'notifikasi' | 'pengaturan' | 'bantuan' | null;

export default function ProfilPage() {
  const { user, isAdmin, logout } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [activeModal, setActiveModal] = useState<ProfilModal>(null);
  const [adminCode, setAdminCode] = useState('');
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [pushNotif, setPushNotif] = useState(true);
  const [emailNotif, setEmailNotif] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setReports(getReports());
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  const counts = useMemo(() => ({
    all: reports.length,
    done: reports.filter((r) => r.status === 'Selesai').length,
    process: reports.filter((r) => r.status === 'Diproses').length,
  }), [reports]);

  const notifications = useMemo(() => {
    return reports.filter((r) => r.status !== 'Terkirim').map((r) => ({
      ticket: r.ticket,
      title: r.title,
      status: r.status,
      date: r.createdAt,
    }));
  }, [reports]);

  function adminLogin() {
    if (adminCode.trim() !== 'admin123') {
      window.alert('Kode admin salah.');
      setAdminLoggedIn(false);
      return;
    }
    setAdminLoggedIn(true);
  }

  function updateStatus(ticket: string, status: ReportStatus) {
    const next = reports.map((r) => r.ticket === ticket ? { ...r, status } : r);
    saveReports(next);
    setReports(next);
  }

  function deleteReport(ticket: string) {
    if (!window.confirm('Hapus laporan ini?')) return;
    const next = reports.filter((r) => r.ticket !== ticket);
    saveReports(next);
    setReports(next);
  }

  function clearAllData() {
    if (!window.confirm('Hapus semua data laporan? Tindakan ini tidak dapat dibatalkan.')) return;
    saveReports([]);
    setReports([]);
    window.alert('Semua data laporan telah dihapus.');
  }

  const faqItems = [
    { q: 'Bagaimana cara membuat laporan?', a: 'Klik tombol "➕ Lapor" di navigasi bawah, pilih kategori, isi form, lalu klik "Kirim Laporan".' },
    { q: 'Bagaimana cara melacak laporan?', a: 'Buka halaman "📊 Riwayat" untuk melihat semua laporan dan statusnya. Anda juga bisa mencari berdasarkan nomor tiket.' },
    { q: 'Berapa lama proses penanganan?', a: 'Biasanya 1-3 hari kerja tergantung urgensi dan kompleksitas masalah.' },
    { q: 'Apakah laporan anonim bisa ditindaklanjuti?', a: 'Laporan anonim tetap dicatat, namun kami tidak dapat menghubungi Anda untuk klarifikasi.' },
    { q: 'Bagaimana jika laporan saya ditolak?', a: 'Laporan ditolak jika tidak sesuai kategori atau duplikat. Silakan buat laporan baru dengan data yang lebih lengkap.' },
  ];

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes bounceIn {
          0% { opacity: 0; transform: scale(0.3); }
          50% { opacity: 1; transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }

        .fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }
        .slide-in-left {
          animation: slideInLeft 0.6s ease-out forwards;
          opacity: 0;
        }
        .slide-in-right {
          animation: slideInRight 0.6s ease-out forwards;
          opacity: 0;
        }
        .scale-in {
          animation: scaleIn 0.5s ease-out forwards;
          opacity: 0;
        }
        .bounce-in {
          animation: bounceIn 0.6s ease-out forwards;
          opacity: 0;
        }

        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        .stagger-4 { animation-delay: 0.4s; }
        .stagger-5 { animation-delay: 0.5s; }
        .stagger-6 { animation-delay: 0.6s; }

        .layanan-banner {
          transition: all 0.3s ease;
        }

        .profile-avatar {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .profile-avatar:hover {
          transform: scale(1.1) rotate(5deg);
        }

        .service-card-detailed {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .service-card-detailed:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.12);
        }

        .stat-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .stat-card:hover {
          transform: translateY(-4px) scale(1.05);
          box-shadow: 0 12px 24px rgba(0,0,0,0.15);
        }

        .btn-primary, .btn-secondary, .btn-danger {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(123, 16, 35, 0.2);
        }
        .btn-secondary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.1);
        }
        .btn-danger:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(220, 38, 38, 0.2);
        }

        .faq-item {
          transition: all 0.3s ease;
        }
        .faq-item:hover {
          background: #f5f5f5;
        }
      `}</style>

      {/* Page Banner */}
      <div className={`layanan-banner ${isLoaded ? 'fade-in-up' : ''}`}>
        <div className="profile-avatar" style={{width:80,height:80,fontSize:40,margin:'0 auto 16px'}}>{user?.name?.charAt(0)?.toUpperCase() || '?'}</div>
        <div className="layanan-banner-content" style={{textAlign:'center'}}>
          <h1>{user?.name || 'Pengguna'}</h1>
          <p>
            {isAdmin()
              ? 'Administrator'
              : user?.nim
                ? `NIM: ${user.nim} • ${user.faculty || '-'}`
                : 'Pelaporan Anonim'
            }
          </p>
        </div>
        <div className="layanan-banner-stats">
          <div>
            <strong>{counts.all}</strong>
            <span>Laporan</span>
          </div>
          <div>
            <strong>{counts.done}</strong>
            <span>Selesai</span>
          </div>
        </div>
      </div>

      {/* Menu */}
      <section className="section">
        <div className="section-header">
          <h3>Menu Profil</h3>
        </div>
        <div className="service-grid-modern">
          <Link href="/lapor_mulia/riwayat" className={`service-card-detailed ${isLoaded ? 'slide-in-left stagger-1' : ''}`}>
            <div className="service-card-detailed-icon" style={{background:'#E3F2FD'}}>📋</div>
            <div className="service-card-detailed-content">
              <div className="service-card-detailed-name">Riwayat Laporan</div>
              <div className="service-card-detailed-desc">Lihat semua laporan Anda</div>
            </div>
            <div className="service-card-detailed-arrow">→</div>
          </Link>
          <button className={`service-card-detailed ${isLoaded ? 'slide-in-right stagger-2' : ''}`} onClick={() => setActiveModal('notifikasi')}>
            <div className="service-card-detailed-icon" style={{background:'#FFF3E0'}}>🔔</div>
            <div className="service-card-detailed-content">
              <div className="service-card-detailed-name">Notifikasi</div>
              <div className="service-card-detailed-desc">Update status laporan</div>
            </div>
            <div className="service-card-detailed-arrow">→</div>
            {notifications.length > 0 && <div className="service-card-detailed-badge" style={{background:'var(--danger)',color:'white'}}>{notifications.length}</div>}
          </button>
          <button className={`service-card-detailed ${isLoaded ? 'slide-in-left stagger-3' : ''}`} onClick={() => setActiveModal('pengaturan')}>
            <div className="service-card-detailed-icon" style={{background:'#E8F5E9'}}>⚙️</div>
            <div className="service-card-detailed-content">
              <div className="service-card-detailed-name">Pengaturan</div>
              <div className="service-card-detailed-desc">Kelola akun & preferensi</div>
            </div>
            <div className="service-card-detailed-arrow">→</div>
          </button>
          <button className={`service-card-detailed ${isLoaded ? 'slide-in-right stagger-4' : ''}`} onClick={() => setActiveModal('bantuan')}>
            <div className="service-card-detailed-icon" style={{background:'#F3E5F5'}}>❓</div>
            <div className="service-card-detailed-content">
              <div className="service-card-detailed-name">Bantuan</div>
              <div className="service-card-detailed-desc">FAQ & kontak support</div>
            </div>
            <div className="service-card-detailed-arrow">→</div>
          </button>
          <button className={`service-card-detailed ${isLoaded ? 'slide-in-left stagger-5' : ''}`} onClick={logout} style={{borderColor:'var(--danger)'}}>
            <div className="service-card-detailed-icon" style={{background:'#FFEBEE',color:'var(--danger)'}}>🚪</div>
            <div className="service-card-detailed-content">
              <div className="service-card-detailed-name" style={{color:'var(--danger)'}}>Keluar</div>
              <div className="service-card-detailed-desc">Logout dari aplikasi</div>
            </div>
            <div className="service-card-detailed-arrow" style={{color:'var(--danger)'}}>→</div>
          </button>
        </div>
      </section>

      {/* Admin Panel */}
      <section className="section">
        <div className="section-header"><h3>🔐 Admin Panel</h3></div>
        <div className="admin-section">
          {isAdmin() ? (
            <div>
              <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
                <Link href="/lapor_mulia/admin" className="btn-primary" style={{padding:'10px 16px',fontSize:13,textDecoration:'none',display:'inline-flex',alignItems:'center',gap:6}}>
                  📊 Buka Admin Panel
                </Link>
                <button className="btn-secondary" type="button" onClick={() => setAdminLoggedIn(false)} style={{fontSize: 12, padding: '10px 16px'}}>
                  🚪 Logout
                </button>
              </div>

              {/* Quick Stats */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:16}}>
                <div className={`stat-card ${isLoaded ? 'scale-in stagger-1' : ''}`} style={{background:'var(--bg)',padding:10,borderRadius:10,textAlign:'center'}}>
                  <div style={{fontSize:18,fontWeight:800,color:'var(--primary)'}}>{reports.length}</div>
                  <div style={{fontSize:10,color:'var(--muted)',fontWeight:600}}>Total</div>
                </div>
                <div className={`stat-card ${isLoaded ? 'scale-in stagger-2' : ''}`} style={{background:'var(--bg)',padding:10,borderRadius:10,textAlign:'center'}}>
                  <div style={{fontSize:18,fontWeight:800,color:'#1E88E5'}}>{reports.filter((r) => r.status === 'Terkirim').length}</div>
                  <div style={{fontSize:10,color:'var(--muted)',fontWeight:600}}>Terkirim</div>
                </div>
                <div className={`stat-card ${isLoaded ? 'scale-in stagger-3' : ''}`} style={{background:'var(--bg)',padding:10,borderRadius:10,textAlign:'center'}}>
                  <div style={{fontSize:18,fontWeight:800,color:'#FF9800'}}>{reports.filter((r) => r.status === 'Diproses').length}</div>
                  <div style={{fontSize:10,color:'var(--muted)',fontWeight:600}}>Diproses</div>
                </div>
                <div className={`stat-card ${isLoaded ? 'scale-in stagger-4' : ''}`} style={{background:'var(--bg)',padding:10,borderRadius:10,textAlign:'center'}}>
                  <div style={{fontSize:18,fontWeight:800,color:'#4CAF50'}}>{reports.filter((r) => r.status === 'Selesai').length}</div>
                  <div style={{fontSize:10,color:'var(--muted)',fontWeight:600}}>Selesai</div>
                </div>
              </div>

              {/* Recent Reports Quick View */}
              <div style={{fontWeight:700,fontSize:13,marginBottom:8}}>Laporan Terbaru</div>
              {reports.length === 0 ? (
                <div className="empty-state">Belum ada laporan</div>
              ) : (
                <div className="report-list">
                  {reports.slice(0, 3).map((r, idx) => (
                    <div key={r.ticket} className={`report-card ${isLoaded ? `fade-in-up stagger-${idx + 1}` : ''}`}>
                      <div className="report-card-top">
                        <span className="report-ticket">{r.ticket}</span>
                        <span className="report-status" style={{background:getStatusColor(r.status)+'20',color:getStatusColor(r.status)}}>{r.status}</span>
                      </div>
                      <div className="report-title">{r.title}</div>
                      <div className="report-meta">
                        <span>📂 {r.category}</span>
                        <span>📍 {r.location}</span>
                      </div>
                      <div className="report-card-bottom">
                        <span className="report-card-date">📅 {r.createdAt}</span>
                        <select
                          value={r.status}
                          onChange={(e) => updateStatus(r.ticket, e.target.value as ReportStatus)}
                          style={{padding:'4px 8px',border:'1px solid var(--border)',borderRadius:8,fontSize:11,fontWeight:600}}
                        >
                          {['Terkirim','Diproses','Selesai','Ditolak'].map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {reports.length > 3 && (
                <Link href="/lapor_mulia/admin" style={{display:'block',textAlign:'center',marginTop:12,fontSize:12,color:'var(--accent)',fontWeight:700}}>
                  Lihat semua {reports.length} laporan →
                </Link>
              )}
            </div>
          ) : (
            <div style={{display: 'grid', gap: 12, maxWidth: 320}}>
              <div style={{fontSize:13,color:'var(--muted)',marginBottom:4}}>
                Masuk sebagai admin untuk mengelola laporan mahasiswa.
              </div>
              <Link href="/lapor_mulia/admin" className="btn-primary" style={{padding: 12, fontSize: 13, textAlign:'center', textDecoration:'none'}}>
                🔐 Login Admin
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Notifikasi Modal */}
      {activeModal === 'notifikasi' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>🔔 Notifikasi</h3><button className="modal-close" onClick={() => setActiveModal(null)}>✕</button></div>
            {notifications.length === 0 ? (
              <div className="empty-state">Tidak ada notifikasi baru</div>
            ) : (
              <div className="report-list">
                {notifications.map((n) => (
                  <div key={n.ticket} className="report-card">
                    <div className="report-card-top">
                      <span className="report-ticket">{n.ticket}</span>
                      <span className="report-status" style={{background:getStatusColor(n.status)+'20',color:getStatusColor(n.status)}}>{n.status}</span>
                    </div>
                    <div className="report-title">{n.title}</div>
                    <div className="report-meta"><span>📅 {n.date}</span></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pengaturan Modal */}
      {activeModal === 'pengaturan' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>⚙️ Pengaturan</h3><button className="modal-close" onClick={() => setActiveModal(null)}>✕</button></div>

            <div className="settings-group">
              <div className="settings-group-title">Profil Akun</div>
              <div className="form-grid">
                <div className="form-field full">
                  <label>Nama</label>
                  <input type="text" defaultValue={user?.name || ''} readOnly />
                </div>
                <div className="form-field">
                  <label>NIM</label>
                  <input type="text" defaultValue={user?.nim || '-'} readOnly />
                </div>
                <div className="form-field">
                  <label>Fakultas</label>
                  <input type="text" defaultValue={user?.faculty || '-'} readOnly />
                </div>
              </div>
            </div>

            <div className="settings-group">
              <div className="settings-group-title">Notifikasi</div>
              <div style={{display:'grid',gap:12}}>
                <div className="settings-toggle">
                  <span className="settings-toggle-label">Push Notification</span>
                  <input type="checkbox" checked={pushNotif} onChange={(e) => setPushNotif(e.target.checked)} />
                </div>
                <div className="settings-toggle">
                  <span className="settings-toggle-label">Email Notification</span>
                  <input type="checkbox" checked={emailNotif} onChange={(e) => setEmailNotif(e.target.checked)} />
                </div>
              </div>
            </div>

            <div className="settings-group">
              <div className="settings-group-title">Data</div>
              <button className="btn-secondary" style={{color:'var(--danger)',border:'1.5px solid var(--danger)'}} onClick={clearAllData}>🗑️ Hapus Semua Data Laporan</button>
            </div>

            <button className="btn-primary" onClick={() => setActiveModal(null)}>Simpan Pengaturan</button>
          </div>
        </div>
      )}

      {/* Bantuan Modal */}
      {activeModal === 'bantuan' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>❓ Bantuan</h3><button className="modal-close" onClick={() => setActiveModal(null)}>✕</button></div>

            <div className="settings-group">
              <div className="settings-group-title">FAQ</div>
              <div className="faq-list">
                {faqItems.map((faq, i) => (
                  <div key={i} className="faq-item">
                    <button
                      className="faq-question"
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    >
                      {faq.q}
                      <span className={`faq-arrow ${openFaq === i ? 'open' : ''}`}>▼</span>
                    </button>
                    {openFaq === i && (
                      <div className="faq-answer">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div style={{fontWeight:700,fontSize:14,marginBottom:12}}>Hubungi Kami</div>
              <div className="contact-list">
                <div className="contact-card">
                  <div className="contact-icon">📧</div>
                  <div className="contact-info">
                    <div className="name">Email</div>
                    <div className="role">helpdesk@universitasmulia.ac.id</div>
                  </div>
                </div>
                <div className="contact-card">
                  <div className="contact-icon">📞</div>
                  <div className="contact-info">
                    <div className="name">Telepon</div>
                    <div className="role">(0541) 765-4321</div>
                  </div>
                </div>
                <div className="contact-card">
                  <div className="contact-icon">💬</div>
                  <div className="contact-info">
                    <div className="name">WhatsApp</div>
                    <div className="role">0812-3456-7890</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

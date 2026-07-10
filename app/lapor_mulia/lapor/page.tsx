'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getReports, saveReports, createTicketNumber, getDraft, saveDraft, clearDraft } from '../lib/storage';
import { categories, priorities, initialForm } from '../lib/constants';
import type { Report, ReportFormState } from '../lib/types';
import { useAuth } from '../lib/auth-context';

function isDraftWorthSaving(f: ReportFormState) {
  return Boolean(
    f.category || f.priority || f.location.trim() || f.title.trim() ||
    f.description.trim() || f.name.trim() || f.contact.trim()
  );
}

export default function LaporPage() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [formData, setFormData] = useState<ReportFormState>(initialForm);
  const [message, setMessage] = useState({ text: '', type: '' as 'success' | 'error' | '' });
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [isLoaded, setIsLoaded] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState('');
  const [submittedCategory, setSubmittedCategory] = useState('');
  const [submittedLocation, setSubmittedLocation] = useState('');

  useEffect(() => {
    const all = getReports();
    setRecentReports(all.slice(0, 3));
    const draft = getDraft();
    if (draft && isDraftWorthSaving(draft)) {
      // Pulihkan draft, tapi minta pengguna mencentang ulang "Data benar".
      setFormData({ ...initialForm, ...draft, agree: false });
      setDraftRestored(true);
    }
    setDraftLoaded(true);
    
  }, []);

  useEffect(() => {
    if (formData.category) {
      setCurrentStep(2);
    } else {
      setCurrentStep(1);
    }
  }, [formData.category]);

  useEffect(() => {
    if (!showSuccess) return;
    const timer = setTimeout(() => router.push('/lapor_mulia/riwayat'), 5000);
    return () => clearTimeout(timer);
  }, [showSuccess, router]);

  // Auto-simpan draft setiap form berubah (setelah draft awal selesai dimuat).
  useEffect(() => {
    if (!draftLoaded) return;
    if (isDraftWorthSaving(formData)) {
      saveDraft(formData);
      setDraftSaved(true);
    } else {
      clearDraft();
      setDraftSaved(false);
    }
  }, [formData, draftLoaded]);

  function discardDraft() {
    clearDraft();
    setFormData(initialForm);
    setMessage({ text: '', type: '' });
    setDraftRestored(false);
    setDraftSaved(false);
  }

  function updateForm<K extends keyof ReportFormState>(key: K, value: ReportFormState[K]) {
    setFormData((c) => ({ ...c, [key]: value }));
    setDraftRestored(false);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const desc = formData.description.trim();
    if (desc.length < 10) {
      setMessage({ text: 'Deskripsi minimal 10 karakter.', type: 'error' });
      return;
    }
    const report: Report = {
      ticket: createTicketNumber(),
      category: formData.category,
      priority: formData.priority,
      location: formData.location.trim(),
      title: formData.title.trim(),
      description: desc,
      name: user?.name || 'Anonim',
      contact: isAdmin() ? 'Admin' : (user?.nim || 'Disembunyikan'),
      status: 'Terkirim',
      createdAt: new Date().toLocaleString('id-ID'),
    };
    const all = getReports();
    const next = [report, ...all];
    saveReports(next);
    clearDraft();
    setDraftSaved(false);
    setDraftRestored(false);
    setRecentReports(next.slice(0, 3));
    setFormData(initialForm);
    setSubmittedTicket(report.ticket);
    setSubmittedCategory(report.category);
    setSubmittedLocation(report.location);
    setShowSuccess(true);
  }

  return (
    <>
      <style>{`
        .layanan-banner {
          transition: all 0.3s ease;
        }
        
        .category-card-lapor {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .category-card-lapor::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          transition: left 0.5s;
        }
        .category-card-lapor:hover::before {
          left: 100%;
        }
        .category-card-lapor:hover {
          transform: translateY(-8px) scale(1.05);
          box-shadow: 0 16px 32px rgba(0,0,0,0.15);
        }
        .category-card-lapor.active {
          animation: none;
          border-width: 3px;
          box-shadow: 0 0 0 3px rgba(15,52,96,0.15), 0 8px 24px rgba(15,52,96,0.2);
          transform: scale(1.05);
        }
        .category-card-lapor.active .category-card-name {
          color: var(--primary);
          font-weight: 800;
        }
        .category-card-lapor:hover .category-card-icon {
          transform: scale(1.2) rotate(15deg);
        }
        .category-card-icon {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .form-field {
          transition: all 0.3s ease;
        }
        .form-field:focus-within {
          transform: translateY(-2px);
        }
        .form-field input:focus,
        .form-field select:focus,
        .form-field textarea:focus {
          transform: scale(1.01);
          box-shadow: 0 0 0 4px rgba(123, 16, 35, 0.1);
        }
        
        .btn-primary {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .btn-primary::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255,255,255,0.3);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }
        .btn-primary:hover::before {
          width: 300px;
          height: 300px;
        }
        .btn-primary:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 12px 32px rgba(123, 16, 35, 0.3);
        }
        .btn-primary:active {
          transform: translateY(-2px) scale(0.98);
        }
        
        .btn-secondary {
          transition: all 0.3s ease;
        }
        .btn-secondary:hover {
          transform: translateY(-2px);
          border-color: var(--primary);
          color: var(--primary);
        }
        
        .recent-report-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }
        .recent-report-card::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: linear-gradient(135deg, rgba(123, 16, 35, 0.05), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .recent-report-card:hover::after {
          opacity: 1;
        }
        .recent-report-card:hover {
          transform: translateY(-8px) rotate(1deg);
          box-shadow: 0 16px 40px rgba(0,0,0,0.15);
        }
        .recent-report-card:hover .success-icon {
          transform: scale(1.2) rotate(360deg);
        }
        .success-icon {
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .message-box {
          transition: all 0.3s ease;
        }
        .message-box.show {
          animation: slideInFromRight 0.5s ease-out;
        }
        .message-box.success {
          animation: bounceIn 0.6s ease-out;
        }
        .message-box.error {
          animation: shake 0.5s ease-out;
        }
        
        .category-selection-badge {
          transition: all 0.3s ease;
        }
        .category-selection-header:hover .category-selection-badge {
          transform: scale(1.15) rotate(5deg);
        }
        
        .toggle-label {
          transition: all 0.2s ease;
        }
        .toggle-label:hover {
          transform: translateX(4px);
        }

        @keyframes confettiFall {
          0% { top: -5%; opacity: 1; transform: rotate(0deg) translateX(0); }
          100% { top: 110%; opacity: 0; transform: rotate(720deg) translateX(var(--drift, 50px)); }
        }
        @keyframes successCardIn {
          0% { opacity: 0; transform: scale(0.8) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes checkCircle {
          0% { stroke-dashoffset: 226; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes checkDraw {
          0% { stroke-dashoffset: 50; }
          100% { stroke-dashoffset: 0; }
        }
      `}</style>
      {/* Page Banner */}
      <div className={`layanan-banner ${isLoaded ? 'anim-fade-up' : ''}`}>
        <div className="layanan-banner-icon">📝</div>
        <div className="layanan-banner-content">
          <h1>Buat Laporan</h1>
          <p>Laporkan masalah atau pengaduan kampus Anda</p>
        </div>
        <div className="layanan-banner-stats">
          <div>
            <strong>{recentReports.length}</strong>
            <span>Terkirim</span>
          </div>
          <div>
            <strong>{categories.length}</strong>
            <span>Kategori</span>
          </div>
        </div>
      </div>

      <section className={`section ${isLoaded ? 'anim-fade-up delay-2' : ''}`} id="lapor-section">
        <div className="section-header">
          <h3>Form Laporan</h3>
          <span className="section-count">Langkah {currentStep} dari 2</span>
        </div>

        {/* Draft restored banner */}
        {draftRestored && (
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'var(--accent-light)', color: 'var(--accent)',
              border: '1px solid var(--accent)', borderRadius: 'var(--radius)',
              padding: '10px 14px', fontSize: 13, fontWeight: 600, marginBottom: 12,
            }}
          >
            <span style={{ fontSize: 18 }}>📝</span>
            <span style={{ flex: 1 }}>Draft sebelumnya dipulihkan. Lanjutkan mengisi atau hapus.</span>
            <button
              type="button"
              onClick={discardDraft}
              style={{
                border: 'none', background: 'transparent', color: 'var(--danger)',
                fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              🗑️ Hapus
            </button>
          </div>
        )}

        {/* Category Selection */}
        <div className={`category-selection-card ${isLoaded ? 'anim-slide-left delay-4' : ''}`}>
          <div className="category-selection-header">
            <div className="category-selection-badge">1</div>
            <h4>Pilih Kategori Laporan</h4>
          </div>
          <div className="category-grid-lapor">
            {categories.map((cat, idx) => (
              <button
                key={cat.name}
                className={`category-card-lapor ${formData.category === cat.name ? 'active' : ''} ${isLoaded ? 'anim-scale-in' : ''}`}
                style={{animationDelay: `${0.3 + idx * 0.05}s`}}
                type="button"
                onClick={() => updateForm('category', cat.name)}
              >
                <div className="category-card-icon" style={{background: cat.color + '20', color: cat.color}}>{cat.icon}</div>
                <span className="category-card-name">{cat.name}</span>
                {formData.category === cat.name && <div className="category-card-check">✓</div>}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className={`form-section-modern ${isLoaded ? 'anim-slide-right delay-6' : ''}`}>
          <div className="form-section-header">
            <div className="category-selection-badge">2</div>
            <h4>Detail Laporan</h4>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-field">
                <label>Kategori</label>
                <select required value={formData.category} onChange={(e) => updateForm('category', e.target.value)}>
                  <option value="">Pilih kategori</option>
                  {categories.map((c) => <option key={c.name} value={c.name}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Urgensi</label>
                <select required value={formData.priority} onChange={(e) => updateForm('priority', e.target.value)}>
                  <option value="">Pilih</option>
                  {priorities.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-field full">
                <label>Lokasi</label>
                <input type="text" placeholder="Contoh: Gedung A Lantai 2" required value={formData.location} onChange={(e) => updateForm('location', e.target.value)} />
              </div>
              <div className="form-field full">
                <label>Judul Masalah</label>
                <input type="text" placeholder="Contoh: AC kelas mati" required value={formData.title} onChange={(e) => updateForm('title', e.target.value)} />
              </div>
              <div className="form-field full">
                <label>Deskripsi</label>
                <textarea placeholder="Jelaskan masalah minimal 10 karakter..." required value={formData.description} onChange={(e) => updateForm('description', e.target.value)} />
              </div>
              <div className="form-field full">
                <label>Bukti (Opsional)</label>
                <input type="file" accept="image/*,.pdf" />
              </div>
              <div className="form-field full">
                <div style={{display:'flex',alignItems:'center',gap:8,padding:'10px 14px',background:'var(--primary-light)',borderRadius:10,fontSize:13,color:'var(--primary)',fontWeight:600}}>
                  <span>👤</span>
                  Laporan akan dikirim sebagai: <strong>{user?.name || 'Anonim'}</strong>
                  {user?.nim && <span style={{color:'var(--muted)',fontWeight:400}}> (NIM: {user.nim})</span>}
                </div>
              </div>
            </div>
            <div className="helper" style={{marginTop: 8}}>
              Pastikan data yang diisi benar. Laporan anonim tidak dapat ditindaklanjuti secara langsung.
            </div>
            {draftSaved && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--success)', fontWeight: 600, marginTop: 8 }}>
                <span>💾</span> Draft tersimpan otomatis
              </div>
            )}
            <div className="form-actions">
              <button className="btn-primary" type="submit">🚀 Kirim Laporan</button>
              <button className="btn-secondary" type="button" onClick={discardDraft}>Reset</button>
            </div>
            <div className={`message-box show ${message.type}`}>{message.text}</div>
          </form>
        </div>
      </section>

      {/* Recent Reports */}
      {recentReports.length > 0 && (
        <section className={`section ${isLoaded ? 'anim-fade-up delay-7' : ''}`}>
          <div className="section-header">
            <h3>Laporan Terakhir</h3>
            <span className="section-count">{recentReports.length} laporan</span>
          </div>
          <div className="recent-reports-grid">
            {recentReports.map((r, idx) => (
              <div key={r.ticket} className={`recent-report-card ${isLoaded ? 'anim-bounce-in' : ''}`} style={{animationDelay: `${0.5 + idx * 0.1}s`}}>
                <div className="recent-report-status-badge" style={{background: '#E3F2FD', color: 'var(--accent)'}}>
                  📨 {r.status}
                </div>
                <div className="recent-report-ticket">{r.ticket}</div>
                <div className="recent-report-title">{r.title}</div>
                <div className="recent-report-meta">
                  <span>📂 {r.category}</span>
                  <span>📍 {r.location}</span>
                </div>
                <div className="recent-report-success-indicator">
                  <div className="success-icon">✓</div>
                  <span>Terkirim</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      {/* Success Overlay */}
      {showSuccess && (
        <div style={{
          position:'fixed', inset:0, zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center',
          background:'rgba(0,0,0,0.6)', backdropFilter:'blur(8px)',
          animation:'fadeIn 0.3s ease-out',
        }}>
          {/* Confetti Particles */}
          {Array.from({length: 30}).map((_, i) => (
            <div key={i} style={{
              position:'absolute',
              width: `${Math.random() * 10 + 6}px`,
              height: `${Math.random() * 10 + 6}px`,
              background: ['#FF6B6B','#4ECDC4','#45B7D1','#FFA07A','#98D8C8','#F7DC6F','#BB8FCE','#85C1E9'][i % 8],
              borderRadius: i % 3 === 0 ? '50%' : i % 3 === 1 ? '2px' : '0',
              left: `${Math.random() * 100}%`,
              top: `-5%`,
              animation: `confettiFall ${Math.random() * 2 + 2}s ease-in forwards`,
              animationDelay: `${Math.random() * 0.5}s`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }} />
          ))}
          {/* Success Card */}
          <div style={{
            background:'var(--card)', borderRadius:24, padding:'40px 32px', maxWidth:380, width:'100%',
            textAlign:'center', position:'relative', zIndex:10,
            boxShadow:'0 24px 64px rgba(0,0,0,0.3)',
            animation:'successCardIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
            opacity:0, transform:'scale(0.8)',
          }}>
            {/* Animated Checkmark */}
            <div style={{margin:'0 auto 20px',width:80,height:80}}>
              <svg viewBox="0 0 80 80" style={{width:'100%',height:'100%'}}>
                <circle cx="40" cy="40" r="36" fill="none" stroke="#4CAF50" strokeWidth="4"
                  strokeDasharray="226" strokeDashoffset="226"
                  style={{animation:'checkCircle 0.6s ease-out 0.2s forwards'}} />
                <path d="M24 40 L35 51 L56 30" fill="none" stroke="#4CAF50" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
                  strokeDasharray="50" strokeDashoffset="50"
                  style={{animation:'checkDraw 0.4s ease-out 0.7s forwards'}} />
              </svg>
            </div>
            <h2 style={{fontSize:22,fontWeight:800,margin:'0 0 8px',color:'var(--text)'}}>Laporan Berhasil Dikirim! 🎉</h2>
            <p style={{fontSize:14,color:'var(--muted)',margin:'0 0 16px'}}>Terima kasih telah melaporkan masalah kampus</p>
            <div style={{background:'var(--bg)',borderRadius:12,padding:'16px',marginBottom:20}}>
              <div style={{fontSize:11,color:'var(--muted)',fontWeight:600,textTransform:'uppercase',letterSpacing:1,marginBottom:4}}>Nomor Tiket</div>
              <div style={{fontSize:24,fontWeight:800,color:'var(--primary)',letterSpacing:1}}>{submittedTicket}</div>
              <div style={{fontSize:12,color:'var(--muted)',marginTop:8}}>
                📂 {submittedCategory} • 📍 {submittedLocation}
              </div>
            </div>
            <div style={{display:'flex',gap:10}}>
              <button onClick={() => router.push('/lapor_mulia/riwayat')} style={{
                flex:1,padding:'12px 16px',border:'none',borderRadius:12,background:'var(--primary)',color:'white',
                fontSize:14,fontWeight:700,cursor:'pointer',transition:'all 0.2s',
              }}>📋 Lihat Riwayat</button>
              <button onClick={() => { setShowSuccess(false); setFormData(initialForm); }} style={{
                flex:1,padding:'12px 16px',border:'2px solid var(--border)',borderRadius:12,background:'var(--card)',color:'var(--text)',
                fontSize:14,fontWeight:700,cursor:'pointer',transition:'all 0.2s',
              }}>✏️ Buat Baru</button>
            </div>
            <p style={{fontSize:11,color:'var(--muted)',marginTop:12}}>Auto-redirect ke riwayat dalam 5 detik...</p>
          </div>
        </div>
      )}
    </>
  );
}


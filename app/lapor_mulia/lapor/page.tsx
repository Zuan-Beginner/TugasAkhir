'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getReports, saveReports, createTicketNumber, getDraft, saveDraft, clearDraft } from '../lib/storage';
import { categories, priorities, initialForm } from '../lib/constants';
import type { Report, ReportFormState } from '../lib/types';

function isDraftWorthSaving(f: ReportFormState) {
  return Boolean(
    f.category || f.priority || f.location.trim() || f.title.trim() ||
    f.description.trim() || f.name.trim() || f.contact.trim()
  );
}

export default function LaporPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ReportFormState>(initialForm);
  const [message, setMessage] = useState({ text: '', type: '' as 'success' | 'error' | '' });
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

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
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  useEffect(() => {
    if (formData.category) {
      setCurrentStep(2);
    } else {
      setCurrentStep(1);
    }
  }, [formData.category]);

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
    if (!formData.agree) {
      setMessage({ text: 'Centang "Data benar" untuk melanjutkan.', type: 'error' });
      return;
    }
    const report: Report = {
      ticket: createTicketNumber(),
      category: formData.category,
      priority: formData.priority,
      location: formData.location.trim(),
      title: formData.title.trim(),
      description: desc,
      name: formData.anonymous ? 'Anonim' : formData.name.trim() || 'Tidak diisi',
      contact: formData.anonymous ? 'Disembunyikan' : formData.contact.trim() || 'Tidak diisi',
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
    setMessage({ text: `Laporan terkirim! Tiket: ${report.ticket}`, type: 'success' });
    setTimeout(() => router.push('/lapor_mulia/riwayat'), 2000);
  }

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
        @keyframes slideInFromLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInFromRight {
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
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(123, 16, 35, 0.7); }
          50% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(123, 16, 35, 0); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 5px rgba(123, 16, 35, 0.5); }
          50% { box-shadow: 0 0 20px rgba(123, 16, 35, 0.8); }
        }
        
        .fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }
        .slide-in-left {
          animation: slideInFromLeft 0.6s ease-out forwards;
          opacity: 0;
        }
        .slide-in-right {
          animation: slideInFromRight 0.6s ease-out forwards;
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
          animation: pulse 1.5s infinite;
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
      `}</style>
      {/* Page Banner */}
      <div className={`layanan-banner ${isLoaded ? 'fade-in-up' : ''}`}>
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

      <section className={`section ${isLoaded ? 'fade-in-up stagger-1' : ''}`} id="lapor-section">
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
        <div className={`category-selection-card ${isLoaded ? 'slide-in-left stagger-2' : ''}`}>
          <div className="category-selection-header">
            <div className="category-selection-badge">1</div>
            <h4>Pilih Kategori Laporan</h4>
          </div>
          <div className="category-grid-lapor">
            {categories.map((cat, idx) => (
              <button
                key={cat.name}
                className={`category-card-lapor ${formData.category === cat.name ? 'active' : ''} ${isLoaded ? 'scale-in' : ''}`}
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
        <div className={`form-section-modern ${isLoaded ? 'slide-in-right stagger-3' : ''}`}>
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
                <div className="toggle-row">
                  <label className="toggle-label">
                    <input type="checkbox" checked={formData.anonymous} onChange={(e) => updateForm('anonymous', e.target.checked)} />
                    🔒 Anonim
                  </label>
                  <label className="toggle-label">
                    <input type="checkbox" required checked={formData.agree} onChange={(e) => updateForm('agree', e.target.checked)} />
                    ✅ Data benar
                  </label>
                </div>
              </div>
              {!formData.anonymous && (
                <>
                  <div className="form-field">
                    <label>Identitas</label>
                    <input type="text" placeholder="Nama / NIM" value={formData.name} onChange={(e) => updateForm('name', e.target.value)} />
                  </div>
                  <div className="form-field">
                    <label>Kontak</label>
                    <input type="text" placeholder="Email / HP" value={formData.contact} onChange={(e) => updateForm('contact', e.target.value)} />
                  </div>
                </>
              )}
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
        <section className={`section ${isLoaded ? 'fade-in-up stagger-4' : ''}`}>
          <div className="section-header">
            <h3>Laporan Terakhir</h3>
            <span className="section-count">{recentReports.length} laporan</span>
          </div>
          <div className="recent-reports-grid">
            {recentReports.map((r, idx) => (
              <div key={r.ticket} className={`recent-report-card ${isLoaded ? 'bounce-in' : ''}`} style={{animationDelay: `${0.5 + idx * 0.1}s`}}>
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
    </>
  );
}

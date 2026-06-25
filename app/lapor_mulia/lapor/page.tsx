'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getReports, saveReports, createTicketNumber } from '../lib/storage';
import { categories, priorities, initialForm } from '../lib/constants';
import type { Report, ReportFormState } from '../lib/types';

export default function LaporPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ReportFormState>(initialForm);
  const [message, setMessage] = useState({ text: '', type: '' as 'success' | 'error' | '' });
  const [recentReports, setRecentReports] = useState<Report[]>([]);

  useEffect(() => {
    const all = getReports();
    setRecentReports(all.slice(0, 3));
  }, []);

  function updateForm<K extends keyof ReportFormState>(key: K, value: ReportFormState[K]) {
    setFormData((c) => ({ ...c, [key]: value }));
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
    setRecentReports(next.slice(0, 3));
    setFormData(initialForm);
    setMessage({ text: `Laporan terkirim! Tiket: ${report.ticket}`, type: 'success' });
    setTimeout(() => router.push('/lapor_mulia/riwayat'), 2000);
  }

  return (
    <>
      {/* Page Banner */}
      <div className="layanan-banner">
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

      <section className="section" id="lapor-section">
        <div className="section-header">
          <h3>Form Laporan</h3>
          <span className="section-count">Langkah 1 dari 2</span>
        </div>

        {/* Category Selection */}
        <div className="category-selection-card">
          <div className="category-selection-header">
            <div className="category-selection-badge">1</div>
            <h4>Pilih Kategori Laporan</h4>
          </div>
          <div className="category-grid-lapor">
            {categories.map((cat) => (
              <button
                key={cat.name}
                className={`category-card-lapor ${formData.category === cat.name ? 'active' : ''}`}
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
        <div className="form-section-modern">
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
            <div className="form-actions">
              <button className="btn-primary" type="submit">🚀 Kirim Laporan</button>
              <button className="btn-secondary" type="button" onClick={() => { setFormData(initialForm); setMessage({ text: '', type: '' }); }}>Reset</button>
            </div>
            <div className={`message-box show ${message.type}`}>{message.text}</div>
          </form>
        </div>
      </section>

      {/* Recent Reports */}
      {recentReports.length > 0 && (
        <section className="section">
          <div className="section-header">
            <h3>Laporan Terakhir</h3>
            <span className="section-count">{recentReports.length} laporan</span>
          </div>
          <div className="recent-reports-grid">
            {recentReports.map((r) => (
              <div key={r.ticket} className="recent-report-card">
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

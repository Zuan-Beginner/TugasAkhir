'use client';

import { useEffect, useMemo, useState } from 'react';
import { getReports, saveReports } from '../lib/storage';
import { getStatusColor, getStatusStep, statuses } from '../lib/constants';
import type { Report, ReportStatus } from '../lib/types';

export default function RiwayatPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [ticketSearch, setTicketSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'Semua'>('Semua');
  const [showDetail, setShowDetail] = useState<Report | null>(null);

  useEffect(() => {
    setReports(getReports());
  }, []);

  const filtered = useMemo(() => {
    let result = reports;
    if (statusFilter !== 'Semua') {
      result = result.filter((r) => r.status === statusFilter);
    }
    if (ticketSearch.trim()) {
      const key = ticketSearch.trim().toUpperCase();
      result = result.filter((r) => r.ticket.toUpperCase().includes(key) || r.title.toLowerCase().includes(ticketSearch.toLowerCase()));
    }
    return result;
  }, [reports, statusFilter, ticketSearch]);

  function deleteReport(ticket: string) {
    if (!window.confirm('Hapus laporan ini?')) return;
    const next = reports.filter((r) => r.ticket !== ticket);
    saveReports(next);
    setReports(next);
    setShowDetail(null);
  }

  function exportReports() {
    const headers = ['Tiket', 'Kategori', 'Judul', 'Status', 'Tanggal'];
    const rows = filtered.map((r) => [r.ticket, r.category, r.title, r.status, r.createdAt].join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan_mulia_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filterOptions: (ReportStatus | 'Semua')[] = ['Semua', ...statuses];

  return (
    <>
      {/* Page Banner */}
      <div className="layanan-banner">
        <div className="layanan-banner-icon">📋</div>
        <div className="layanan-banner-content">
          <h1>Riwayat Laporan</h1>
          <p>Lacak dan pantau status laporan Anda</p>
        </div>
        <div className="layanan-banner-stats">
          <div>
            <strong>{reports.length}</strong>
            <span>Total</span>
          </div>
          <div>
            <strong>{filtered.length}</strong>
            <span>Ditampilkan</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <section className="section">
        <div className="search-bar-modern">
          <div className="search-icon">🔍</div>
          <input 
            type="text" 
            placeholder="Cari tiket atau judul laporan..." 
            value={ticketSearch} 
            onChange={(e) => setTicketSearch(e.target.value)} 
          />
          {ticketSearch && (
            <button className="search-clear" onClick={() => setTicketSearch('')}>✕</button>
          )}
        </div>
      </section>

      {/* Category Filter */}
      <section className="section" style={{marginTop: 0}}>
        <div className="category-filter-grid">
          {filterOptions.map((s) => {
            const icons = {
              'Semua': '📋',
              'Terkirim': '📨',
              'Diproses': '⏳',
              'Selesai': '✅',
              'Ditolak': '❌'
            };
            const count = s === 'Semua' ? reports.length : reports.filter(r => r.status === s).length;
            return (
              <button 
                key={s} 
                className={`category-filter-card ${statusFilter === s ? 'active' : ''}`} 
                onClick={() => setStatusFilter(s)}
              >
                <div className="category-filter-icon">{icons[s as keyof typeof icons]}</div>
                <div className="category-filter-label">{s}</div>
                <div className="category-filter-count">{count}</div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <h3>Laporan {statusFilter !== 'Semua' ? statusFilter : ''}</h3>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span className="section-count">{filtered.length} laporan</span>
            {reports.length > 0 && (
              <button 
                style={{border:'none',background:'var(--accent)',color:'white',fontSize:'11px',fontWeight:700,cursor:'pointer',padding:'6px 12px',borderRadius:'8px'}}
                onClick={exportReports}
              >
                📥 Export
              </button>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state-modern">
            <div className="empty-state-icon">📄</div>
            <h3>{reports.length === 0 ? 'Belum Ada Laporan' : 'Tidak Ada Hasil'}</h3>
            <p>{reports.length === 0 ? 'Buat laporan pertama Anda sekarang' : 'Tidak ada laporan yang sesuai dengan filter'}</p>
            <button className="btn-primary" onClick={() => { setTicketSearch(''); setStatusFilter('Semua'); }}>
              {reports.length === 0 ? 'Buat Laporan' : 'Tampilkan Semua'}
            </button>
          </div>
        ) : (
          <div className="service-grid-modern">
            {filtered.map((report) => (
              <button key={report.ticket} className="service-card-detailed" onClick={() => setShowDetail(report)}>
                <div className="service-card-detailed-icon" style={{ background: getStatusColor(report.status) + '20', color: getStatusColor(report.status) }}>
                  {report.status === 'Terkirim' && '📨'}
                  {report.status === 'Diproses' && '⏳'}
                  {report.status === 'Selesai' && '✅'}
                  {report.status === 'Ditolak' && '❌'}
                </div>
                <div className="service-card-detailed-content">
                  <div className="service-card-detailed-name">{report.title}</div>
                  <div className="service-card-detailed-desc">
                    {report.ticket} • {report.category} • {report.location}
                  </div>
                </div>
                <div className="service-card-detailed-arrow">→</div>
                <div className="service-card-detailed-badge">{report.status}</div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Report Count Summary */}
      {reports.length > 0 && (
        <section className="section">
          <div className="stats-grid">
            <div className="stat-card"><div className="stat-icon">📋</div><div className="stat-num">{reports.length}</div><div className="stat-label">Total</div></div>
            <div className="stat-card"><div className="stat-icon">📨</div><div className="stat-num">{reports.filter((r) => r.status === 'Terkirim').length}</div><div className="stat-label">Terkirim</div></div>
            <div className="stat-card"><div className="stat-icon">⏳</div><div className="stat-num">{reports.filter((r) => r.status === 'Diproses').length}</div><div className="stat-label">Diproses</div></div>
            <div className="stat-card"><div className="stat-icon">✅</div><div className="stat-num">{reports.filter((r) => r.status === 'Selesai').length}</div><div className="stat-label">Selesai</div></div>
          </div>
        </section>
      )}

      {/* Detail Modal */}
      {showDetail && (
        <div className="modal-overlay" onClick={() => setShowDetail(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>📋 Detail Laporan</h3><button className="modal-close" onClick={() => setShowDetail(null)}>✕</button></div>
            <div style={{marginBottom:12}}>
              <span className="report-ticket">{showDetail.ticket}</span>
              <span className="report-status" style={{marginLeft:8,background:getStatusColor(showDetail.status)+'20',color:getStatusColor(showDetail.status)}}>{showDetail.status}</span>
            </div>
            <div style={{fontSize:16,fontWeight:700,marginBottom:8}}>{showDetail.title}</div>
            <div style={{fontSize:13,color:'var(--muted)',marginBottom:12,lineHeight:1.5}}>{showDetail.description}</div>
            <div className="grid-2" style={{marginBottom:16}}>
              <div><strong>Kategori:</strong> {showDetail.category}</div>
              <div><strong>Urgensi:</strong> {showDetail.priority}</div>
              <div><strong>Lokasi:</strong> {showDetail.location}</div>
              <div><strong>Pelapor:</strong> {showDetail.name}</div>
              <div><strong>Kontak:</strong> {showDetail.contact}</div>
              <div><strong>Tanggal:</strong> {showDetail.createdAt}</div>
            </div>
            <div style={{fontWeight:700,fontSize:13,marginBottom:8}}>Status Timeline</div>
            <div className="timeline">
              {(['Terkirim', 'Diproses', 'Selesai'] as ReportStatus[]).map((s, i) => {
                const current = getStatusStep(showDetail.status);
                const step = i + 1;
                return (
                  <div key={s} className="timeline-step">
                    <div className={`timeline-dot ${step < current ? 'done' : step === current ? 'active' : ''}`}>{step < current ? '✓' : step}</div>
                    {i < 2 && <div className={`timeline-line ${step < current ? 'done' : step === current ? 'active' : ''}`} />}
                    <div className="timeline-label">{s}</div>
                  </div>
                );
              })}
            </div>
            {showDetail.status === 'Ditolak' && (
              <div style={{marginTop:12,padding:12,background:'#FFEBEE',borderRadius:12,fontSize:13,color:'var(--danger)',fontWeight:600}}>
                Laporan ditolak oleh admin.
              </div>
            )}
            <div style={{marginTop:16,display:'flex',gap:8}}>
              <button className="btn-secondary" style={{flex:1}} onClick={() => deleteReport(showDetail.ticket)}>🗑️ Hapus</button>
              <button className="btn-primary" style={{flex:1}} onClick={() => setShowDetail(null)}>Tutup</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

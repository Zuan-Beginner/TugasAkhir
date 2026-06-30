'use client';

import { useMemo, useState, useEffect } from 'react';
import { getReports, saveReports } from '../lib/storage';
import { getStatusColor, getStatusStep, statuses } from '../lib/constants';
import { useAuth } from '../lib/auth-context';
import type { Report, ReportStatus } from '../lib/types';

export default function RiwayatPage() {
  const { user, isAdmin } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [ticketSearch, setTicketSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'Semua'>('Semua');
  const [showDetail, setShowDetail] = useState<Report | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setReports(getReports());
    setTimeout(() => setIsLoaded(true), 100);
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

        .category-filter-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .category-filter-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.5s;
        }
        .category-filter-card:hover::before {
          left: 100%;
        }
        .category-filter-card:hover {
          transform: translateY(-6px) scale(1.03);
          box-shadow: 0 16px 32px rgba(123, 16, 35, 0.2);
        }
        .category-filter-card.active {
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          color: white;
          box-shadow: 0 8px 24px rgba(123, 16, 35, 0.3);
        }
        .category-filter-card.active .category-filter-icon {
          transform: scale(1.2);
        }
        .category-filter-card.active .category-filter-count {
          background: rgba(255,255,255,0.2);
          color: white;
        }
        .category-filter-card:active {
          transform: translateY(-2px) scale(1.01);
        }
        .category-filter-icon {
          transition: all 0.3s ease;
        }

        .report-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .report-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.12);
        }

        .btn-primary, .btn-secondary, .btn-danger {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .btn-primary:hover, .btn-secondary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(123, 16, 35, 0.2);
        }
        .btn-danger:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(220, 38, 38, 0.2);
        }
        .btn-primary:active, .btn-secondary:active, .btn-danger:active {
          transform: translateY(0);
        }

        .search-bar-modern {
          transition: all 0.3s ease;
          position: relative;
        }
        .search-bar-modern::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--primary), var(--accent));
          transform: scaleX(0);
          transition: transform 0.3s;
          border-radius: 0 0 12px 12px;
        }
        .search-bar-modern:focus-within::after {
          transform: scaleX(1);
        }
        .search-bar-modern:focus-within {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(123, 16, 35, 0.15);
        }
        .search-clear {
          transition: all 0.2s;
        }
        .search-clear:hover {
          transform: rotate(90deg) scale(1.2);
          color: var(--danger);
        }
      `}</style>

      {/* Page Banner */}
      <div className={`layanan-banner ${isLoaded ? 'fade-in-up' : ''}`}>
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
        <div className={`search-bar-modern ${isLoaded ? 'slide-in-left stagger-1' : ''}`}>
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
        <div className="section-header" style={{marginBottom: 16}}>
          <h3 style={{fontSize: 16, fontWeight: 700, color: 'var(--text)'}}>📊 Filter Status</h3>
          {filtered.length !== reports.length && (
            <button 
              style={{
                border: 'none',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                padding: '6px 12px',
                borderRadius: '8px',
                transition: 'all 0.2s'
              }}
              onClick={() => { setStatusFilter('Semua'); setTicketSearch(''); }}
            >
              🔄 Reset Filter
            </button>
          )}
        </div>
        <div className="category-filter-grid">
          {filterOptions.map((s, idx) => {
            const icons = {
              'Semua': '📋',
              'Terkirim': '📨',
              'Diproses': '⏳',
              'Selesai': '✅',
              'Ditolak': '❌'
            };
            const colors = {
              'Semua': '#667eea',
              'Terkirim': '#3b82f6',
              'Diproses': '#f59e0b',
              'Selesai': '#10b981',
              'Ditolak': '#ef4444'
            };
            const count = s === 'Semua' ? reports.length : reports.filter(r => r.status === s).length;
            const isActive = statusFilter === s;
            return (
              <button
                key={s}
                className={`category-filter-card ${isActive ? 'active' : ''} ${isLoaded ? `scale-in stagger-${idx + 2}` : ''}`}
                onClick={() => setStatusFilter(s)}
                style={{
                  borderColor: isActive ? colors[s as keyof typeof colors] : 'var(--border)',
                  borderWidth: '2px',
                  borderStyle: 'solid'
                }}
              >
                <div className="category-filter-icon" style={{
                  fontSize: '24px',
                  color: isActive ? colors[s as keyof typeof colors] : 'var(--text)',
                  transform: isActive ? 'scale(1.15)' : 'none',
                  transition: 'all 0.3s'
                }}>{icons[s as keyof typeof icons]}</div>
                <div className="category-filter-label" style={{
                  fontWeight: isActive ? 800 : 600,
                  color: isActive ? colors[s as keyof typeof colors] : 'var(--text)'
                }}>{s}</div>
                <div className="category-filter-count" style={{
                  background: isActive ? 'rgba(255,255,255,0.2)' : colors[s as keyof typeof colors] + '15',
                  color: isActive ? 'white' : colors[s as keyof typeof colors],
                  fontWeight: 800,
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '13px'
                }}>{count}</div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <h3>📋 Laporan {statusFilter !== 'Semua' ? statusFilter : ''}</h3>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span className="section-count" style={{
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 700
            }}>{filtered.length} laporan</span>
            {reports.length > 0 && (
              <button 
                style={{
                  border: 'none',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                  transition: 'all 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onClick={exportReports}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                }}
              >
                📥 Export CSV
              </button>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state-modern" style={{
            background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
            border: '2px dashed var(--border)',
            borderRadius: '20px',
            padding: '48px 32px'
          }}>
            <div className="empty-state-icon" style={{fontSize: '64px', marginBottom: '16px'}}>📄</div>
            <h3 style={{fontSize: '20px', fontWeight: 800, marginBottom: '8px', color: 'var(--text)'}}>
              {reports.length === 0 ? 'Belum Ada Laporan' : 'Tidak Ada Hasil'}
            </h3>
            <p style={{fontSize: '14px', color: 'var(--muted)', marginBottom: '24px'}}>
              {reports.length === 0 ? 'Buat laporan pertama Anda sekarang' : 'Tidak ada laporan yang sesuai dengan filter'}
            </p>
            <button 
              className="btn-primary" 
              onClick={() => { 
                if (reports.length === 0) {
                  window.location.href = '/lapor_mulia/lapor';
                } else {
                  setTicketSearch(''); 
                  setStatusFilter('Semua');
                }
              }}
              style={{
                background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                padding: '12px 32px',
                fontSize: '14px',
                borderRadius: '12px',
                boxShadow: '0 8px 20px rgba(123, 16, 35, 0.3)'
              }}
            >
              {reports.length === 0 ? '📝 Buat Laporan Sekarang' : '🔄 Tampilkan Semua Laporan'}
            </button>
          </div>
        ) : (
          <div className="service-grid-modern">
            {filtered.map((report, idx) => (
              <button key={report.ticket} className={`service-card-detailed ${isLoaded ? `fade-in-up stagger-${Math.min(idx + 1, 6)}` : ''}`} onClick={() => setShowDetail(report)}>
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
            <div className={`stat-card ${isLoaded ? 'scale-in stagger-1' : ''}`}><div className="stat-icon">📋</div><div className="stat-num">{reports.length}</div><div className="stat-label">Total</div></div>
            <div className={`stat-card ${isLoaded ? 'scale-in stagger-2' : ''}`}><div className="stat-icon">📨</div><div className="stat-num">{reports.filter((r) => r.status === 'Terkirim').length}</div><div className="stat-label">Terkirim</div></div>
            <div className={`stat-card ${isLoaded ? 'scale-in stagger-3' : ''}`}><div className="stat-icon">⏳</div><div className="stat-num">{reports.filter((r) => r.status === 'Diproses').length}</div><div className="stat-label">Diproses</div></div>
            <div className={`stat-card ${isLoaded ? 'scale-in stagger-4' : ''}`}><div className="stat-icon">✅</div><div className="stat-num">{reports.filter((r) => r.status === 'Selesai').length}</div><div className="stat-label">Selesai</div></div>
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

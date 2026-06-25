'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type ReportStatus = 'Terkirim' | 'Diproses' | 'Selesai' | 'Ditolak';

type Report = {
  ticket: string;
  category: string;
  priority: string;
  location: string;
  title: string;
  description: string;
  name: string;
  contact: string;
  status: ReportStatus;
  createdAt: string;
};

type FilterStatus = 'Semua' | ReportStatus;

const STORAGE_KEY = 'muliaLaporReportsFull';
const ADMIN_KEY = 'muliaAdminSession';
const statuses: ReportStatus[] = ['Terkirim', 'Diproses', 'Selesai', 'Ditolak'];
const filterStatuses: FilterStatus[] = ['Semua', 'Terkirim', 'Diproses', 'Selesai', 'Ditolak'];

const priorityColors: Record<string, string> = {
  'Rendah': '#4CAF50',
  'Sedang': '#FF9800',
  'Tinggi': '#F44336',
  'Darurat': '#9C27B0',
};

const statusColors: Record<ReportStatus, string> = {
  'Terkirim': '#1E88E5',
  'Diproses': '#FF9800',
  'Selesai': '#4CAF50',
  'Ditolak': '#E53935',
};

export default function AdminPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [adminCode, setAdminCode] = useState('');
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    const session = window.localStorage.getItem(ADMIN_KEY);
    if (session === 'true') setAdminLoggedIn(true);

    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setReports(JSON.parse(saved) as Report[]); } catch { setReports([]); }
    }
  }, []);

  const filteredReports = useMemo(() => {
    let result = reports;
    if (filterStatus !== 'Semua') {
      result = result.filter((r) => r.status === filterStatus);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((r) =>
        r.ticket.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q)
      );
    }
    return result;
  }, [reports, filterStatus, searchQuery]);

  const stats = useMemo(() => ({
    total: reports.length,
    terkirim: reports.filter((r) => r.status === 'Terkirim').length,
    diproses: reports.filter((r) => r.status === 'Diproses').length,
    selesai: reports.filter((r) => r.status === 'Selesai').length,
    ditolak: reports.filter((r) => r.status === 'Ditolak').length,
    darurat: reports.filter((r) => r.priority === 'Darurat').length,
  }), [reports]);

  function adminLogin() {
    if (adminCode.trim() !== 'admin123') {
      setLoginError('Kode admin salah. Silakan coba lagi.');
      return;
    }
    setAdminLoggedIn(true);
    setLoginError('');
    window.localStorage.setItem(ADMIN_KEY, 'true');
  }

  function adminLogout() {
    setAdminLoggedIn(false);
    window.localStorage.removeItem(ADMIN_KEY);
    setAdminCode('');
  }

  function saveReports(next: Report[]) {
    setReports(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function updateStatus(ticket: string, status: ReportStatus) {
    saveReports(reports.map((r) => r.ticket === ticket ? { ...r, status } : r));
  }

  function deleteReport(ticket: string) {
    saveReports(reports.filter((r) => r.ticket !== ticket));
    setShowDeleteConfirm(null);
    setSelectedReport(null);
  }

  if (!adminLoggedIn) {
    return (
      <>
        <style>{`
          :root {
            --primary: #7b1023; --primary-dark: #520816; --primary-light: #FDF2F4;
            --accent: #1E88E5; --accent-light: #E3F2FD; --gold: #d7a640;
            --success: #4CAF50; --warning: #FF9800; --danger: #E53935;
            --bg: #F5F7FA; --card: #FFFFFF; --text: #1A1A1A; --muted: #6B7280;
            --border: #E5E7EB; --shadow: 0 4px 20px rgba(0,0,0,0.08);
            --shadow-lg: 0 8px 32px rgba(0,0,0,0.12); --radius: 16px; --radius-lg: 24px;
          }
          * { margin: 0; padding: 0; box-sizing: border-box; font-family: Inter, Poppins, -apple-system, sans-serif; }
          body { background: var(--bg); color: var(--text); min-height: 100vh; }
          .login-page {
            min-height: 100vh; display: flex; align-items: center; justify-content: center;
            background: linear-gradient(135deg, var(--primary-dark), var(--primary));
            padding: 20px;
          }
          .login-card {
            background: var(--card); border-radius: var(--radius-lg); padding: 40px 32px;
            width: 100%; max-width: 400px; box-shadow: var(--shadow-lg); text-align: center;
          }
          .login-icon { font-size: 48px; margin-bottom: 16px; }
          .login-title { font-size: 22px; font-weight: 800; margin-bottom: 4px; }
          .login-sub { font-size: 13px; color: var(--muted); margin-bottom: 24px; }
          .login-field { display: grid; gap: 6px; margin-bottom: 16px; text-align: left; }
          .login-field label { font-size: 12px; font-weight: 700; }
          .login-field input {
            width: 100%; padding: 14px; border: 1.5px solid var(--border); border-radius: 12px;
            font-size: 14px; outline: none; background: #FAFBFC;
          }
          .login-field input:focus { border-color: var(--primary); background: white; }
          .login-btn {
            width: 100%; padding: 14px; border: none; border-radius: 14px;
            background: var(--primary); color: white; font-weight: 800; font-size: 15px;
            cursor: pointer; box-shadow: 0 4px 16px rgba(123,16,35,0.3);
            transition: transform 0.15s;
          }
          .login-btn:hover { transform: translateY(-2px); }
          .login-error {
            margin-top: 12px; padding: 10px; border-radius: 10px; font-size: 13px;
            font-weight: 700; background: #FFEBEE; color: var(--danger); display: none;
          }
          .login-error.show { display: block; }
          .login-back {
            display: inline-block; margin-top: 16px; font-size: 13px; color: var(--accent);
            font-weight: 600; text-decoration: none;
          }
        `}</style>
        <div className="login-page">
          <div className="login-card">
            <div className="login-icon">🔐</div>
            <div className="login-title">Admin Panel</div>
            <div className="login-sub">Masukkan kode admin untuk mengakses panel</div>
            <div className="login-field">
              <label>Kode Admin</label>
              <input type="password" placeholder="Masukkan kode admin" value={adminCode} onChange={(e) => { setAdminCode(e.target.value); setLoginError(''); }} onKeyDown={(e) => e.key === 'Enter' && adminLogin()} />
            </div>
            <button className="login-btn" type="button" onClick={adminLogin}>Masuk</button>
            <div className={`login-error ${loginError ? 'show' : ''}`}>{loginError}</div>
            <Link href="/lapor_mulia" className="login-back">← Kembali ke Beranda</Link>
            <div style={{marginTop: 16, fontSize: 11, color: 'var(--muted)'}}>Kode demo: <b>admin123</b></div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        :root {
          --primary: #7b1023; --primary-dark: #520816; --primary-light: #FDF2F4;
          --accent: #1E88E5; --accent-light: #E3F2FD; --gold: #d7a640;
          --success: #4CAF50; --warning: #FF9800; --danger: #E53935;
          --bg: #F5F7FA; --card: #FFFFFF; --text: #1A1A1A; --muted: #6B7280;
          --border: #E5E7EB; --shadow: 0 4px 20px rgba(0,0,0,0.08);
          --shadow-lg: 0 8px 32px rgba(0,0,0,0.12); --radius: 16px; --radius-lg: 24px;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: Inter, Poppins, -apple-system, sans-serif; }
        html { scroll-behavior: smooth; }
        body { background: var(--bg); color: var(--text); min-height: 100vh; }
        a { color: inherit; text-decoration: none; }

        .admin-container { max-width: 1200px; margin: 0 auto; padding: 0 16px; }

        /* Header */
        .admin-header {
          background: var(--primary); padding: 16px; margin: 0 -16px;
          border-radius: 0 0 24px 24px; margin-bottom: 20px;
        }
        .admin-header-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .admin-brand { display: flex; align-items: center; gap: 10px; color: white; }
        .admin-brand-icon {
          width: 40px; height: 40px; border-radius: 12px;
          background: rgba(255,255,255,0.2); display: grid; place-items: center; font-size: 20px;
        }
        .admin-brand h1 { font-size: 16px; font-weight: 800; }
        .admin-brand small { font-size: 11px; opacity: 0.8; display: block; }
        .admin-actions { display: flex; gap: 8px; }
        .admin-btn {
          padding: 8px 14px; border-radius: 10px; border: none; font-size: 12px;
          font-weight: 700; cursor: pointer; transition: transform 0.15s;
        }
        .admin-btn:hover { transform: translateY(-1px); }
        .admin-btn.outline { background: rgba(255,255,255,0.15); color: white; border: 1px solid rgba(255,255,255,0.2); }
        .admin-btn.danger { background: var(--danger); color: white; }
        .admin-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 12px; border-radius: 8px; background: rgba(255,255,255,0.15);
          color: white; font-size: 12px; font-weight: 700;
        }

        /* Stats */
        .stats-row { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; margin-bottom: 20px; }
        .stat-box {
          background: var(--card); border-radius: 14px; padding: 14px; text-align: center;
          box-shadow: var(--shadow); cursor: pointer; transition: transform 0.15s;
          min-width: 0; overflow: hidden;
        }
        .stat-box:hover { transform: translateY(-2px); }
        .stat-box.active { border: 2px solid var(--primary); }
        .stat-box .num { font-size: 24px; font-weight: 800; line-height: 1; min-height: 24px; display: flex; align-items: center; justify-content: center; }
        .stat-box .lbl { font-size: 11px; color: var(--muted); font-weight: 600; margin-top: 4px; white-space: nowrap; }

        /* Toolbar */
        .toolbar {
          display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; align-items: center;
        }
        .search-input {
          flex: 1; min-width: 200px; padding: 10px 14px; border: 1.5px solid var(--border);
          border-radius: 12px; font-size: 13px; outline: none; background: var(--card);
        }
        .search-input:focus { border-color: var(--primary); }
        .filter-tabs { display: flex; gap: 4px; flex-wrap: nowrap; overflow-x: auto; padding-bottom: 2px; }
        .filter-tab {
          padding: 8px 12px; border-radius: 10px; border: none; font-size: 12px;
          font-weight: 700; cursor: pointer; background: var(--card); color: var(--muted);
          box-shadow: var(--shadow); transition: all 0.15s; white-space: nowrap; flex-shrink: 0;
        }
        .filter-tab.active { background: var(--primary); color: white; }
        .filter-tab:hover:not(.active) { background: #f0f0f0; }
        .result-count { font-size: 12px; color: var(--muted); font-weight: 600; white-space: nowrap; }

        /* Table */
        .table-card {
          background: var(--card); border-radius: var(--radius-lg); box-shadow: var(--shadow);
          overflow: hidden;
        }
        .table-wrap { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; min-width: 900px; }
        th, td { padding: 12px 14px; text-align: left; font-size: 13px; border-bottom: 1px solid var(--border); }
        th {
          background: var(--primary-light); color: var(--primary); font-weight: 800;
          font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;
          position: sticky; top: 0; z-index: 5;
        }
        td { vertical-align: middle; }
        tr:hover td { background: #FAFBFC; }
        tr:last-child td { border-bottom: none; }

        .ticket-badge {
          font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 8px;
          background: var(--primary-light); color: var(--primary); white-space: nowrap;
        }
        .status-badge {
          font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 8px;
          white-space: nowrap;
        }
        .priority-badge {
          font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px;
          white-space: nowrap;
        }
        .cell-title { font-weight: 700; font-size: 13px; }
        .cell-sub { font-size: 11px; color: var(--muted); margin-top: 2px; }

        .status-select {
          padding: 6px 10px; border-radius: 8px; border: 1.5px solid var(--border);
          font-size: 12px; font-weight: 600; cursor: pointer; background: white;
        }
        .status-select:focus { border-color: var(--primary); outline: none; }

        .action-btns { display: flex; gap: 6px; }
        .action-btn {
          padding: 6px 10px; border: none; border-radius: 8px; font-size: 11px;
          font-weight: 700; cursor: pointer; transition: transform 0.1s;
        }
        .action-btn:hover { transform: scale(1.05); }
        .action-btn.view { background: var(--accent-light); color: var(--accent); }
        .action-btn.delete { background: #FFEBEE; color: var(--danger); }

        /* Detail Modal */
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200;
          display: flex; align-items: center; justify-content: center; padding: 16px;
          animation: fadeIn 0.2s;
        }
        .modal-box {
          background: var(--card); border-radius: var(--radius-lg); width: 100%;
          max-width: 600px; max-height: 85vh; overflow-y: auto; padding: 28px;
          box-shadow: var(--shadow-lg); animation: slideUp 0.25s;
        }
        .modal-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .modal-top h3 { font-size: 18px; font-weight: 800; }
        .modal-close {
          width: 36px; height: 36px; border-radius: 50%; border: none;
          background: var(--bg); font-size: 18px; cursor: pointer; display: grid; place-items: center;
        }
        .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
        .detail-item { padding: 10px; background: var(--bg); border-radius: 10px; }
        .detail-label { font-size: 11px; color: var(--muted); font-weight: 600; margin-bottom: 2px; }
        .detail-value { font-size: 13px; font-weight: 700; }
        .detail-full { grid-column: 1 / -1; }
        .detail-desc {
          padding: 14px; background: var(--bg); border-radius: 12px; font-size: 13px;
          line-height: 1.6; margin-bottom: 16px;
        }
        .detail-actions { display: flex; gap: 8px; flex-wrap: wrap; }
        .detail-actions select {
          padding: 10px 14px; border-radius: 10px; border: 1.5px solid var(--border);
          font-size: 13px; font-weight: 600;
        }
        .detail-actions .btn-action {
          padding: 10px 18px; border: none; border-radius: 10px; font-size: 13px;
          font-weight: 700; cursor: pointer; transition: transform 0.15s;
        }
        .detail-actions .btn-action:hover { transform: translateY(-1px); }
        .detail-actions .btn-save { background: var(--primary); color: white; }
        .detail-actions .btn-delete { background: #FFEBEE; color: var(--danger); }

        /* Delete Confirm */
        .confirm-box {
          background: var(--card); border-radius: var(--radius-lg); padding: 28px;
          width: 100%; max-width: 400px; text-align: center; box-shadow: var(--shadow-lg);
        }
        .confirm-icon { font-size: 48px; margin-bottom: 12px; }
        .confirm-title { font-size: 18px; font-weight: 800; margin-bottom: 8px; }
        .confirm-text { font-size: 13px; color: var(--muted); margin-bottom: 20px; }
        .confirm-btns { display: flex; gap: 10px; justify-content: center; }
        .confirm-btn {
          padding: 10px 20px; border: none; border-radius: 10px; font-size: 13px;
          font-weight: 700; cursor: pointer;
        }
        .confirm-btn.cancel { background: var(--bg); color: var(--text); }
        .confirm-btn.confirm-delete { background: var(--danger); color: white; }

        /* Empty */
        .empty {
          text-align: center; padding: 40px 20px; color: var(--muted);
        }
        .empty-icon { font-size: 48px; margin-bottom: 12px; }
        .empty-text { font-size: 14px; font-weight: 600; }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        /* Responsive: Tablet */
        @media (min-width: 768px) {
          .admin-container { padding: 0 24px; }
          .admin-header { border-radius: 0 0 28px 28px; padding: 20px 24px; margin: 0 -24px; margin-bottom: 24px; }
          .stats-row { grid-template-columns: repeat(6, 1fr); gap: 12px; }
          .stat-box { padding: 16px; border-radius: 16px; }
          .stat-box .num { font-size: 28px; min-height: 28px; }
          .table-card { border-radius: var(--radius-lg); }
        }

        /* Responsive: Desktop */
        @media (min-width: 1024px) {
          .admin-container { padding: 0 32px; }
          .admin-header { border-radius: 0 0 32px 32px; padding: 24px 32px; margin: 0 -32px; margin-bottom: 28px; }
          .admin-brand-icon { width: 48px; height: 48px; font-size: 24px; }
          .admin-brand h1 { font-size: 18px; }
          .stats-row { gap: 14px; margin-bottom: 24px; }
          .stat-box { padding: 20px; }
          .stat-box .num { font-size: 32px; min-height: 32px; }
          .stat-box .lbl { font-size: 12px; }
          .toolbar { margin-bottom: 20px; }
          .search-input { padding: 12px 16px; font-size: 14px; }
          .filter-tab { padding: 10px 14px; font-size: 13px; }
          th, td { padding: 14px 16px; font-size: 14px; }
          .modal-box { padding: 32px; }
        }

        @media (max-width: 640px) {
          .stats-row { grid-template-columns: repeat(3, 1fr); }
          .stat-box .num { font-size: 20px; min-height: 20px; }
          .toolbar { flex-direction: column; }
          .detail-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="admin-container">
        {/* Header */}
        <header className="admin-header">
          <div className="admin-header-top">
            <Link href="/lapor_mulia" className="admin-brand">
              <div className="admin-brand-icon">⚑</div>
              <div>
                <h1>Mulia Lapor — Admin</h1>
                <small>Universitas Mulia</small>
              </div>
            </Link>
            <div className="admin-actions">
              <span className="admin-badge">👤 Admin</span>
              <button className="admin-btn outline" type="button" onClick={adminLogout}>Logout</button>
            </div>
          </div>
        </header>

        {/* Stats */}
        <div className="stats-row">
          <div className={`stat-box ${filterStatus === 'Semua' ? 'active' : ''}`} onClick={() => setFilterStatus('Semua')}>
            <div className="num" style={{color: 'var(--primary)'}}>{stats.total}</div>
            <div className="lbl">Total</div>
          </div>
          <div className={`stat-box ${filterStatus === 'Terkirim' ? 'active' : ''}`} onClick={() => setFilterStatus('Terkirim')}>
            <div className="num" style={{color: 'var(--accent)'}}>{stats.terkirim}</div>
            <div className="lbl">Terkirim</div>
          </div>
          <div className={`stat-box ${filterStatus === 'Diproses' ? 'active' : ''}`} onClick={() => setFilterStatus('Diproses')}>
            <div className="num" style={{color: 'var(--warning)'}}>{stats.diproses}</div>
            <div className="lbl">Diproses</div>
          </div>
          <div className={`stat-box ${filterStatus === 'Selesai' ? 'active' : ''}`} onClick={() => setFilterStatus('Selesai')}>
            <div className="num" style={{color: 'var(--success)'}}>{stats.selesai}</div>
            <div className="lbl">Selesai</div>
          </div>
          <div className={`stat-box ${filterStatus === 'Ditolak' ? 'active' : ''}`} onClick={() => setFilterStatus('Ditolak')}>
            <div className="num" style={{color: 'var(--danger)'}}>{stats.ditolak}</div>
            <div className="lbl">Ditolak</div>
          </div>
          <div className="stat-box">
            <div className="num" style={{color: '#9C27B0'}}>{stats.darurat}</div>
            <div className="lbl">Darurat</div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <input
            className="search-input"
            type="text"
            placeholder="Cari tiket, judul, kategori, lokasi, atau nama..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="filter-tabs">
            {filterStatuses.map((fs) => (
              <button
                key={fs}
                className={`filter-tab ${filterStatus === fs ? 'active' : ''}`}
                type="button"
                onClick={() => setFilterStatus(fs)}
              >
                {fs}
              </button>
            ))}
          </div>
          <span className="result-count">{filteredReports.length} laporan</span>
        </div>

        {/* Table */}
        <div className="table-card">
          {filteredReports.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">📋</div>
              <div className="empty-text">Tidak ada laporan ditemukan</div>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Tiket</th>
                    <th>Judul</th>
                    <th>Kategori</th>
                    <th>Lokasi</th>
                    <th>Pelapor</th>
                    <th>Urgensi</th>
                    <th>Status</th>
                    <th>Tanggal</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((report) => (
                    <tr key={report.ticket}>
                      <td><span className="ticket-badge">{report.ticket}</span></td>
                      <td>
                        <div className="cell-title">{report.title}</div>
                        <div className="cell-sub">{report.description.slice(0, 50)}...</div>
                      </td>
                      <td>{report.category}</td>
                      <td>{report.location}</td>
                      <td>
                        <div style={{fontSize: 13, fontWeight: 600}}>{report.name}</div>
                        <div className="cell-sub">{report.contact}</div>
                      </td>
                      <td>
                        <span className="priority-badge" style={{background: (priorityColors[report.priority] || '#999') + '20', color: priorityColors[report.priority] || '#999'}}>
                          {report.priority}
                        </span>
                      </td>
                      <td>
                        <select
                          className="status-select"
                          value={report.status}
                          onChange={(e) => updateStatus(report.ticket, e.target.value as ReportStatus)}
                          style={{borderColor: statusColors[report.status] + '40'}}
                        >
                          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td style={{fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap'}}>{report.createdAt}</td>
                      <td>
                        <div className="action-btns">
                          <button className="action-btn view" type="button" onClick={() => setSelectedReport(report)}>Detail</button>
                          <button className="action-btn delete" type="button" onClick={() => setShowDeleteConfirm(filteredReports.indexOf(report))}>Hapus</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {selectedReport && (
          <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <div className="modal-top">
                <h3>Detail Laporan</h3>
                <button className="modal-close" type="button" onClick={() => setSelectedReport(null)}>✕</button>
              </div>
              <div className="detail-grid">
                <div className="detail-item">
                  <div className="detail-label">Nomor Tiket</div>
                  <div className="detail-value">{selectedReport.ticket}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Status</div>
                  <div className="detail-value" style={{color: statusColors[selectedReport.status]}}>{selectedReport.status}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Kategori</div>
                  <div className="detail-value">{selectedReport.category}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Urgensi</div>
                  <div className="detail-value" style={{color: priorityColors[selectedReport.priority]}}>{selectedReport.priority}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Lokasi</div>
                  <div className="detail-value">{selectedReport.location}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Tanggal</div>
                  <div className="detail-value">{selectedReport.createdAt}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Pelapor</div>
                  <div className="detail-value">{selectedReport.name}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Kontak</div>
                  <div className="detail-value">{selectedReport.contact}</div>
                </div>
              </div>
              <div className="detail-full" style={{marginBottom: 16}}>
                <div style={{fontSize: 12, fontWeight: 700, marginBottom: 6}}>Deskripsi</div>
                <div className="detail-desc">{selectedReport.description}</div>
              </div>
              <div className="detail-actions">
                <select
                  value={selectedReport.status}
                  onChange={(e) => {
                    const newStatus = e.target.value as ReportStatus;
                    updateStatus(selectedReport.ticket, newStatus);
                    setSelectedReport({ ...selectedReport, status: newStatus });
                  }}
                >
                  {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <button className="btn-action btn-delete" type="button" onClick={() => { setShowDeleteConfirm(filteredReports.indexOf(selectedReport)); setSelectedReport(null); }}>
                  🗑️ Hapus
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirm */}
        {showDeleteConfirm !== null && (
          <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
            <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
              <div className="confirm-icon">⚠️</div>
              <div className="confirm-title">Hapus Laporan?</div>
              <div className="confirm-text">
                Laporan <b>{filteredReports[showDeleteConfirm]?.ticket}</b> akan dihapus permanen.
              </div>
              <div className="confirm-btns">
                <button className="confirm-btn cancel" type="button" onClick={() => setShowDeleteConfirm(null)}>Batal</button>
                <button className="confirm-btn confirm-delete" type="button" onClick={() => deleteReport(filteredReports[showDeleteConfirm].ticket)}>Hapus</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

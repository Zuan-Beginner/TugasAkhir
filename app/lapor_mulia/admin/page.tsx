'use client';

import { useMemo, useState } from 'react';
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
  const [reports, setReports] = useState<Report[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    try {
      return JSON.parse(saved) as Report[];
    } catch {
      return [];
    }
  });
  const [adminCode, setAdminCode] = useState('');
  const [adminLoggedIn, setAdminLoggedIn] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(ADMIN_KEY) === 'true';
  });
  const [loginError, setLoginError] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [sortColumn, setSortColumn] = useState<'ticket' | 'title' | 'createdAt' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

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

  const sortedReports = useMemo(() => {
    if (!sortColumn) return filteredReports;
    return [...filteredReports].sort((a, b) => {
      let aVal: string | number = a[sortColumn];
      let bVal: string | number = b[sortColumn];
      if (sortColumn === 'createdAt') {
        aVal = new Date(aVal as string).getTime();
        bVal = new Date(bVal as string).getTime();
      }
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });
  }, [filteredReports, sortColumn, sortDirection]);

  // Gunakan semua laporan terurut (tidak ada pagination)

  function handleSort(column: 'ticket' | 'title' | 'createdAt') {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  }

  function toggleRowSelection(ticket: string) {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(ticket)) {
      newSelection.delete(ticket);
    } else {
      newSelection.add(ticket);
    }
    setSelectedRows(newSelection);
  }

  function toggleAllRows() {
    if (selectedRows.size === sortedReports.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(sortedReports.map(r => r.ticket)));
    }
  }

  function bulkDelete() {
    if (selectedRows.size === 0) return;
    if (!confirm(`Hapus ${selectedRows.size} laporan yang dipilih?`)) return;
    saveReports(reports.filter(r => !selectedRows.has(r.ticket)));
    setSelectedRows(new Set());
  }

  async function exportToPDF() {
    try {
      // Dynamic import untuk jspdf dan autotable
      const jsPDF = (await import('jspdf')).default;
      const autoTable = (await import('jspdf-autotable')).default;

      const doc = new jsPDF('l', 'mm', 'a4'); // landscape

      // ========== HEADER SECTION ==========
      // Background header
      doc.setFillColor(123, 16, 35);
      doc.rect(0, 0, 297, 35, 'F');
      
      // Logo placeholder (icon universitas)
      doc.setFillColor(255, 255, 255);
      doc.circle(20, 17, 8, 'F');
      doc.setFontSize(14);
      doc.setTextColor(123, 16, 35);
      doc.text('U', 20, 21, { align: 'center' });
      
      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('Arial', 'bold');
      doc.text('LAPORAN PENGADUAN', 35, 15);
      
      doc.setFontSize(11);
      doc.setFont('Arial', 'normal');
      doc.text('Universitas Mulia - Sistem Pengaduan Terpadu', 35, 23);
      
      // Date badge
      const exportDate = new Date().toLocaleDateString('id-ID', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      doc.setFillColor(255, 255, 255, 0.2);
      doc.roundedRect(200, 10, 85, 15, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text('Diekspor:', 205, 15);
      doc.setFontSize(9);
      doc.text(exportDate, 205, 21);

      // ========== STATISTICS SECTION ==========
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('Arial', 'bold');
      doc.text('RINGKASAN STATISTIK', 14, 45);
      
      // Stats cards
      const statsData = [
        { label: 'Total Laporan', value: reports.length, color: [123, 16, 35] },
        { label: 'Terkirim', value: reports.filter(r => r.status === 'Terkirim').length, color: [59, 130, 246] },
        { label: 'Diproses', value: reports.filter(r => r.status === 'Diproses').length, color: [245, 158, 11] },
        { label: 'Selesai', value: reports.filter(r => r.status === 'Selesai').length, color: [34, 197, 94] },
        { label: 'Ditolak', value: reports.filter(r => r.status === 'Ditolak').length, color: [239, 68, 68] }
      ];

      let xPos = 14;
      statsData.forEach((stat, idx) => {
        // Card background
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(xPos, 50, 50, 18, 2, 2, 'F');
        
        // Color indicator
        doc.setFillColor(stat.color[0], stat.color[1], stat.color[2]);
        doc.roundedRect(xPos, 50, 4, 18, 2, 2, 'F');
        
        // Value
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.setFont('Arial', 'bold');
        doc.text(stat.value.toString(), xPos + 8, 60);
        
        // Label
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(7);
        doc.setFont('Arial', 'normal');
        doc.text(stat.label, xPos + 8, 65);
        
        xPos += 55;
      });

      // ========== TABLE SECTION ==========
      // Table headers
      const headers = ['No', 'Tiket', 'Judul Laporan', 'Kategori', 'Lokasi', 'Pelapor', 'Urgensi', 'Status', 'Tanggal'];
      
      // Table data dengan nomor urut
      const data = sortedReports.map((r, idx) => [
        idx + 1,
        r.ticket,
        r.title.length > 35 ? r.title.substring(0, 35) + '...' : r.title,
        r.category,
        r.location,
        r.name,
        r.priority,
        r.status,
        r.createdAt
      ]);

      // Status color mapping
      const getStatusColor = (status: string): [number, number, number] => {
        switch(status) {
          case 'Terkirim': return [59, 130, 246];
          case 'Diproses': return [245, 158, 11];
          case 'Selesai': return [34, 197, 94];
          case 'Ditolak': return [239, 68, 68];
          default: return [128, 128, 128];
        }
      };

      // Priority color mapping
      const getPriorityColor = (priority: string): [number, number, number] => {
        switch(priority) {
          case 'Darurat': return [239, 68, 68];
          case 'Tinggi': return [249, 115, 22];
          case 'Sedang': return [234, 179, 8];
          case 'Rendah': return [34, 197, 94];
          default: return [128, 128, 128];
        }
      };

      // Add table dengan styling improved
      autoTable(doc, {
        head: [headers],
        body: data,
        startY: 75,
        margin: { left: 10, right: 10 },
        headStyles: {
          fillColor: [123, 16, 35],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8,
          cellPadding: 4,
          halign: 'center',
          valign: 'middle',
          lineColor: [123, 16, 35],
          lineWidth: 0.5
        },
        bodyStyles: {
          fontSize: 8,
          cellPadding: 3,
          textColor: [30, 30, 30],
          lineColor: [220, 220, 220],
          lineWidth: 0.3,
          valign: 'middle'
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center', fontStyle: 'bold' },
          1: { cellWidth: 22, halign: 'center', fontStyle: 'bold' },
          2: { cellWidth: 45, halign: 'left' },
          3: { cellWidth: 25, halign: 'center' },
          4: { cellWidth: 25, halign: 'center' },
          5: { cellWidth: 25, halign: 'left' },
          6: { cellWidth: 20, halign: 'center' },
          7: { cellWidth: 20, halign: 'center' },
          8: { cellWidth: 22, halign: 'center' }
        },
        didParseCell: function(data) {
          // Style status column (index 7)
          if (data.column.index === 7 && data.section === 'body') {
            const status = String(data.cell.raw || '');
            const color = getStatusColor(status);
            data.cell.styles.textColor = color;
            data.cell.styles.fontStyle = 'bold';
          }
          // Style priority column (index 6)
          if (data.column.index === 6 && data.section === 'body') {
            const priority = String(data.cell.raw || '');
            const color = getPriorityColor(priority);
            data.cell.styles.textColor = color;
            data.cell.styles.fontStyle = 'bold';
          }
        },
        didDrawPage: function(data) {
          // Footer
          const pageCount = doc.getNumberOfPages();
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.getHeight();
          const footerY = pageHeight - 8;

          // Footer line
          doc.setDrawColor(220, 220, 220);
          doc.line(10, footerY - 5, 287, footerY - 5);

          // Footer text
          doc.setFontSize(7);
          doc.setTextColor(150, 150, 150);
          doc.text(
            'Dokumen ini digenerate secara otomatis oleh Sistem Lapor Mulia - Universitas Mulia',
            pageSize.getWidth() / 2,
            footerY,
            { align: 'center' }
          );
          doc.text(
            `Halaman ${data.pageNumber} dari ${pageCount}`,
            287,
            footerY,
            { align: 'right' }
          );
        }
      });

      // ========== SAVE PDF ==========
      const filename = `Laporan-Pengaduan-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
      
      alert('PDF berhasil diekspor!');
    } catch (error) {
      alert('Gagal export PDF. Pastikan library jspdf dan jspdf-autotable sudah ter-install.');
      console.error(error);
    }
  }

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
          @keyframes adminFadeUp {
            from { opacity: 0; transform: translateY(32px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes adminScaleIn {
            from { opacity: 0; transform: translateY(16px) scale(0.92); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          .login-page {
            min-height: 100vh; display: flex; align-items: center; justify-content: center;
            background: linear-gradient(135deg, var(--primary-dark), var(--primary));
            padding: 20px;
          }
          .login-card {
            background: var(--card); border-radius: var(--radius-lg); padding: 40px 32px;
            width: 100%; max-width: 400px; box-shadow: var(--shadow-lg); text-align: center;
            opacity: 0; animation: adminScaleIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
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
          @media (prefers-reduced-motion: reduce) {
            .login-card {
              opacity: 1; transform: none; animation: none;
            }
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
        @keyframes adminFadeUp {
            from { opacity: 0; transform: translateY(32px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
        @keyframes adminFadeDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes adminScaleIn {
            from { opacity: 0; transform: translateY(16px) scale(0.92); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }

        /* Header */
        .admin-header {
          background: var(--primary); padding: 16px; margin: 0 -16px;
          border-radius: 0 0 24px 24px; margin-bottom: 20px;
          opacity: 0; animation: adminFadeDown 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
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
          opacity: 0; animation: adminFadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .stat-box:nth-child(1) { animation-delay: 0.12s; }
        .stat-box:nth-child(2) { animation-delay: 0.18s; }
        .stat-box:nth-child(3) { animation-delay: 0.24s; }
        .stat-box:nth-child(4) { animation-delay: 0.30s; }
        .stat-box:nth-child(5) { animation-delay: 0.36s; }
        .stat-box:nth-child(6) { animation-delay: 0.42s; }
        .stat-box:hover { transform: translateY(-2px); }
        .stat-box.active { border: 2px solid var(--primary); }
        .stat-box .num { font-size: 24px; font-weight: 800; line-height: 1; min-height: 24px; display: flex; align-items: center; justify-content: center; }
        .stat-box .lbl { font-size: 11px; color: var(--muted); font-weight: 600; margin-top: 4px; white-space: nowrap; }

        /* Toolbar */
        .toolbar {
          display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; align-items: center;
          background: var(--card); padding: 20px; border-radius: 16px; box-shadow: var(--shadow);
          opacity: 0; animation: adminFadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.36s forwards;
        }
        .search-input {
          flex: 1; min-width: 250px; padding: 12px 16px; border: 2px solid var(--border);
          border-radius: 12px; font-size: 14px; outline: none; background: var(--bg);
          transition: all 0.2s;
        }
        .search-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(123, 16, 35, 0.1); background: white; }
        .filter-tabs { display: flex; gap: 8px; flex-wrap: wrap; }
        .filter-tab {
          padding: 10px 16px; border-radius: 10px; border: 2px solid var(--border); font-size: 13px;
          font-weight: 700; cursor: pointer; background: white; color: var(--text);
          transition: all 0.2s; white-space: nowrap;
        }
        .filter-tab.active { background: var(--primary); color: white; border-color: var(--primary); }
        .filter-tab:hover:not(.active) { border-color: var(--primary); transform: translateY(-1px); }
        .result-count { 
          font-size: 13px; color: var(--muted); font-weight: 600; white-space: nowrap;
          padding: 10px 16px; background: var(--primary-light); border-radius: 10px;
          color: var(--primary);
        }
        .toolbar-actions {
          display: flex; gap: 8px; margin-left: auto;
        }
        .toolbar-btn {
          padding: 10px 16px; border: 2px solid var(--border); border-radius: 10px;
          background: white; font-size: 13px; font-weight: 700; cursor: pointer;
          transition: all 0.2s; display: flex; align-items: center; gap: 8px;
        }
        .toolbar-btn:hover { border-color: var(--primary); color: var(--primary); transform: translateY(-1px); }
        .toolbar-btn.danger { border-color: var(--danger); color: var(--danger); }
        .toolbar-btn.danger:hover { background: var(--danger); color: white; }
        .toolbar-btn.success { border-color: var(--success); color: var(--success); }
        .toolbar-btn.success:hover { background: var(--success); color: white; }

        /* Table */
        .table-card {
          background: var(--card); border-radius: var(--radius-lg); box-shadow: var(--shadow-lg);
          overflow: hidden; border: 1px solid var(--border);
          opacity: 0; animation: adminFadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.48s forwards;
        }
        .table-wrap { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 12px 10px; text-align: left; font-size: 12px; }
        th {
          background: linear-gradient(135deg, var(--primary-light), #fff);
          color: var(--text); font-weight: 800;
          font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px;
          position: sticky; top: 0; z-index: 5; border-bottom: 2px solid var(--primary);
          cursor: pointer; user-select: none; transition: background 0.2s;
        }
        th:hover { background: var(--primary-light); }
        th.sortable { position: relative; padding-right: 24px; }
        .sort-icon {
          position: absolute; right: 6px; top: 50%; transform: translateY(-50%);
          font-size: 10px; color: var(--muted); transition: color 0.2s;
        }
        th.sorted .sort-icon { color: var(--primary); }
        td { vertical-align: middle; border-bottom: 1px solid var(--border); }
        tbody tr { transition: all 0.2s; }
        tbody tr {
          opacity: 0;
          animation: adminFadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        tbody tr:nth-child(1) { animation-delay: 0.56s; }
        tbody tr:nth-child(2) { animation-delay: 0.60s; }
        tbody tr:nth-child(3) { animation-delay: 0.64s; }
        tbody tr:nth-child(4) { animation-delay: 0.68s; }
        tbody tr:nth-child(5) { animation-delay: 0.72s; }
        tbody tr:nth-child(n + 6) { animation-delay: 0.76s; }
        tbody tr:hover { background: var(--bg); transform: scale(1.001); box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        tbody tr.selected { background: var(--primary-light); }
        tr:last-child td { border-bottom: none; }
        .checkbox-cell { width: 36px; text-align: center; padding: 12px 8px; }
        .row-checkbox {
          width: 16px; height: 16px; cursor: pointer; accent-color: var(--primary);
        }

        .ticket-badge {
          font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 6px;
          background: var(--primary-light); color: var(--primary); white-space: nowrap;
        }
        .status-badge {
          font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 6px;
          white-space: nowrap;
        }
        .priority-badge {
          font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;
          white-space: nowrap;
        }
        .cell-title { font-weight: 700; font-size: 12px; }

        .status-select {
          padding: 4px 8px; border-radius: 6px; border: 1px solid var(--border);
          font-size: 11px; font-weight: 600; cursor: pointer; background: white;
        }
        .status-select:focus { border-color: var(--primary); outline: none; }

        .action-btns { display: flex; gap: 6px; }
        .action-btn {
          padding: 6px 10px; border: none; border-radius: 8px; font-size: 11px;
          font-weight: 700; cursor: pointer; transition: transform 0.1s;
        }
        .action-btn:hover { transform: scale(1.05); box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
        .action-btn.view { background: #E3F2FD; color: #1976D2; }
        .action-btn.delete { background: #FFEBEE; color: var(--danger); }

        /* Pagination */
        .pagination {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px; background: var(--card); border-top: 1px solid var(--border);
        }
        .pagination-info {
          font-size: 13px; color: var(--muted); font-weight: 600;
        }
        .pagination-controls {
          display: flex; gap: 8px; align-items: center;
        }
        .page-btn {
          width: 36px; height: 36px; border: 2px solid var(--border); border-radius: 8px;
          background: white; cursor: pointer; font-size: 13px; font-weight: 700;
          transition: all 0.2s; display: grid; place-items: center;
        }
        .page-btn:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); transform: translateY(-1px); }
        .page-btn.active { background: var(--primary); color: white; border-color: var(--primary); }
        .page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .page-jump {
          display: flex; gap: 8px; align-items: center;
        }
        .page-input {
          width: 60px; padding: 8px; border: 2px solid var(--border); border-radius: 8px;
          text-align: center; font-size: 13px; font-weight: 700;
        }

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
          animation: adminScaleIn 0.25s ease;
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

        @media (prefers-reduced-motion: reduce) {
          .admin-header,
          .stat-box,
          .toolbar,
          .table-card,
          tbody tr,
          .modal-overlay,
          .modal-box,
          .confirm-box {
            opacity: 1;
            transform: none;
            animation: none;
          }
        }

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
            placeholder="🔍 Cari tiket, judul, kategori, lokasi, atau nama..."
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
          <span className="result-count">{sortedReports.length} laporan</span>
          <div className="toolbar-actions">
            {selectedRows.size > 0 && (
              <button className="toolbar-btn danger" type="button" onClick={bulkDelete}>
                🗑️ Hapus ({selectedRows.size})
              </button>
            )}
            <button className="toolbar-btn success" type="button" onClick={exportToPDF}>
              📄 Export PDF
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="table-card">
          {sortedReports.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">📋</div>
              <div className="empty-text">Tidak ada laporan ditemukan</div>
            </div>
          ) : (
            <>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th className="checkbox-cell">
                        <input
                          type="checkbox"
                          className="row-checkbox"
                          checked={selectedRows.size === sortedReports.length && sortedReports.length > 0}
                          onChange={toggleAllRows}
                        />
                      </th>
                      <th className={`sortable ${sortColumn === 'ticket' ? 'sorted' : ''}`} onClick={() => handleSort('ticket')}>
                        Tiket
                        <span className="sort-icon">{sortColumn === 'ticket' ? (sortDirection === 'asc' ? '▲' : '▼') : '▲▼'}</span>
                      </th>
                      <th className={`sortable ${sortColumn === 'title' ? 'sorted' : ''}`} onClick={() => handleSort('title')}>
                        Judul
                        <span className="sort-icon">{sortColumn === 'title' ? (sortDirection === 'asc' ? '▲' : '▼') : '▲▼'}</span>
                      </th>
                      <th>Kategori</th>
                      <th>Lokasi</th>
                      <th>Pelapor</th>
                      <th>Urgensi</th>
                      <th>Status</th>
                      <th className={`sortable ${sortColumn === 'createdAt' ? 'sorted' : ''}`} onClick={() => handleSort('createdAt')}>
                        Tanggal
                        <span className="sort-icon">{sortColumn === 'createdAt' ? (sortDirection === 'asc' ? '▲' : '▼') : '▲▼'}</span>
                      </th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedReports.map((report) => (
                      <tr key={report.ticket} className={selectedRows.has(report.ticket) ? 'selected' : ''}>
                        <td className="checkbox-cell">
                          <input
                            type="checkbox"
                            className="row-checkbox"
                            checked={selectedRows.has(report.ticket)}
                            onChange={() => toggleRowSelection(report.ticket)}
                          />
                        </td>
                        <td><span className="ticket-badge">{report.ticket}</span></td>
                        <td>
                          <div className="cell-title">{report.title}</div>
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
                            <button className="action-btn view" type="button" onClick={() => setSelectedReport(report)}>👁️</button>
                            <button className="action-btn delete" type="button" onClick={() => setShowDeleteConfirm(sortedReports.indexOf(report))}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
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
                Laporan <b>{sortedReports[showDeleteConfirm]?.ticket}</b> akan dihapus permanen.
              </div>
              <div className="confirm-btns">
                <button className="confirm-btn cancel" type="button" onClick={() => setShowDeleteConfirm(null)}>Batal</button>
                <button className="confirm-btn confirm-delete" type="button" onClick={() => deleteReport(sortedReports[showDeleteConfirm].ticket)}>Hapus</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}


'use client';

import { useMemo, useState } from 'react';
import { STORAGE_KEY, statuses } from '../lib/constants';
import type { Report, ReportStatus, ForumMessage, ForumReply } from '../lib/types';
import { getForumMessages, saveForumMessages } from '../lib/storage';
import { useAuth } from '../lib/auth-context';

type FilterStatus = 'Semua' | ReportStatus;

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
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [sortColumn, setSortColumn] = useState<'ticket' | 'title' | 'createdAt' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [activeTab, setActiveTab] = useState<'laporan' | 'forum'>('laporan');
  const [forumMessages, setForumMessages] = useState<ForumMessage[]>([]);
  const [newForumMsg, setNewForumMsg] = useState('');
  const forumEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      if (isAdmin()) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
        router.push('/lapor_mulia');
      }
    }
  }, [user, isAdmin, router]);

  useEffect(() => {
    if (isAuthorized === true) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          setReports(JSON.parse(saved));
        } catch (e) {
          console.error('Error loading reports:', e);
        }
      }
    }
  }, [isAuthorized]);

  useEffect(() => {
    if (isAuthorized) {
      setForumMessages(getForumMessages());
      const interval = setInterval(() => setForumMessages(getForumMessages()), 3000);
      return () => clearInterval(interval);
    }
  }, [isAuthorized]);

  function sendForumMessage() {
    if (!newForumMsg.trim() || !user) return;
    const msg: ForumMessage = {
      id: Date.now().toString(),
      author: user.name,
      avatar: user.avatar,
      message: newForumMsg.trim(),
      timestamp: new Date().toLocaleString('id-ID'),
      likes: 0, likedBy: [], replies: [],
    };
    const updated = [msg, ...forumMessages];
    saveForumMessages(updated);
    setForumMessages(updated);
    setNewForumMsg('');
  }

  function sendForumReply(messageId: string) {
    if (!newForumMsg.trim() || !user) return;
    const reply: ForumReply = {
      id: Date.now().toString(),
      author: user.name,
      avatar: user.avatar,
      message: newForumMsg.trim(),
      timestamp: new Date().toLocaleString('id-ID'),
      likes: 0, likedBy: [],
    };
    const updated = forumMessages.map(m => m.id === messageId ? { ...m, replies: [...m.replies, reply] } : m);
    saveForumMessages(updated);
    setForumMessages(updated);
    setNewForumMsg('');
  }

  function deleteForumMessage(messageId: string) {
    if (!confirm('Hapus pesan ini?')) return;
    const updated = forumMessages.filter(m => m.id !== messageId);
    saveForumMessages(updated);
    setForumMessages(updated);
  }

  function togglePinForum(messageId: string) {
    const updated = forumMessages.map(m => m.id === messageId ? { ...m, isPinned: !m.isPinned } : m);
    saveForumMessages(updated);
    setForumMessages(updated);
  }

  const sortedForum = useMemo(() => {
    return [...forumMessages].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });
  }, [forumMessages]);

  const forumParticipants = useMemo(() => {
    return [...new Set(forumMessages.map(m => m.author))];
  }, [forumMessages]);

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

  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedReports.slice(start, start + itemsPerPage);
  }, [sortedReports, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedReports.length / itemsPerPage);

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
    if (selectedRows.size === paginatedReports.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedReports.map(r => r.ticket)));
    }
  }

  function bulkDelete() {
    if (selectedRows.size === 0) return;
    if (!confirm(`Hapus ${selectedRows.size} laporan yang dipilih?`)) return;
    saveReports(reports.filter(r => !selectedRows.has(r.ticket)));
    // Hapus juga dari forum
    const forumMessages = getForumMessages();
    const updatedForum = forumMessages.filter(m => !m.reportId || !selectedRows.has(m.reportId));
    saveForumMessages(updatedForum);
    setSelectedRows(new Set());
  }

  function exportToCSV() {
    const headers = ['Tiket', 'Judul', 'Kategori', 'Prioritas', 'Status', 'Lokasi', 'Pelapor', 'Tanggal'];
    const rows = sortedReports.map(r => [
      r.ticket,
      r.title,
      r.category,
      r.priority,
      r.status,
      r.location,
      r.name,
      r.createdAt,
    ]);
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `laporan_mulia_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
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

  // Stats baru untuk dashboard
  const todayReports = useMemo(() => {
    const today = new Date().toLocaleDateString('id-ID');
    return reports.filter(r => r.createdAt.includes(today)).length;
  }, [reports]);

  const urgentReports = useMemo(() => {
    return reports.filter(r => r.priority === 'Darurat' || r.priority === 'Tinggi').length;
  }, [reports]);

  const unprocessedReports = useMemo(() => {
    return reports.filter(r => r.status === 'Terkirim').length;
  }, [reports]);

  // Top 5 kategori
  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    reports.forEach(r => {
      counts[r.category] = (counts[r.category] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [reports]);

  const maxCategoryCount = useMemo(() => {
    return categoryStats.length > 0 ? categoryStats[0][1] : 1;
  }, [categoryStats]);

  // 5 laporan terbaru (perlu ditindaklanjuti)
  const recentUrgent = useMemo(() => {
    return reports
      .filter(r => r.status === 'Terkirim')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [reports]);

  // Ringkasan performa
  const performanceStats = useMemo(() => {
    const completed = reports.filter(r => r.status === 'Selesai');
    const completionRate = reports.length > 0 ? Math.round((completed.length / reports.length) * 100) : 0;
    return { completionRate };
  }, [reports]);

  // Kategori icons
  const categoryIcons: Record<string, string> = {
    'Fasilitas': '🪑',
    'Kebersihan': '🧹',
    'Bullying': '🛡️',
    'Keamanan': '🚨',
    'Sistem': '💻',
    'Layanan': '🏢',
    'Lingkungan': '🌿',
    'Lainnya': '✍️',
  };

  const categoryColors: Record<string, string> = {
    'Fasilitas': '#1E88E5',
    'Kebersihan': '#4CAF50',
    'Bullying': '#E53935',
    'Keamanan': '#FF9800',
    'Sistem': '#7B1FA2',
    'Layanan': '#00897B',
    'Lingkungan': '#43A047',
    'Lainnya': '#546E7A',
  };

  function saveReports(next: Report[]) {
    setReports(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function updateStatus(ticket: string, status: ReportStatus) {
    saveReports(reports.map((r) => r.ticket === ticket ? { ...r, status } : r));
  }

  function deleteReport(ticket: string) {
    saveReports(reports.filter((r) => r.ticket !== ticket));
    // Hapus juga dari forum
    const forumMessages = getForumMessages();
    const updatedForum = forumMessages.filter(m => m.reportId !== ticket);
    saveForumMessages(updatedForum);
    setShowDeleteConfirm(null);
    setSelectedReport(null);
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

        .admin-page { max-width: 1400px; margin: 0 auto; animation: adminFadeUp 0.6s ease; }
        @keyframes adminFadeUp {
          from { opacity: 0; transform: translateY(32px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
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
        .search-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(123, 16, 35, 0.1); background: var(--card); }
        .filter-tabs { display: flex; gap: 8px; flex-wrap: wrap; }
        .filter-tab {
          padding: 10px 16px; border-radius: 10px; border: 2px solid var(--border); font-size: 13px;
          font-weight: 700; cursor: pointer; background: var(--card); color: var(--text);
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
          background: var(--card); font-size: 13px; font-weight: 700; cursor: pointer;
          transition: all 0.2s; display: flex; align-items: center; gap: 8px;
        }
        .toolbar-btn:hover { border-color: var(--primary); color: var(--primary); transform: translateY(-1px); }
        .toolbar-btn.danger { border-color: var(--danger); color: var(--danger); }
        .toolbar-btn.danger:hover { background: var(--danger); color: white; }
        .toolbar-btn.success { border-color: var(--success); color: var(--success); }
        .toolbar-btn.success:hover { background: var(--success); color: white; }

        /* Quick Stats */
        .quick-stats-row {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;
        }
        .quick-stat-card {
          background: var(--card); border-radius: 20px; padding: 24px;
          display: flex; align-items: center; gap: 16px;
          box-shadow: var(--shadow); transition: all 0.3s;
          border: 1px solid var(--border); position: relative; overflow: hidden;
          opacity: 0; animation: adminFadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .quick-stat-card::before { content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: var(--accent); border-radius: 4px 0 0 4px; }
        .quick-stat-card:nth-child(1) { animation-delay: 0.1s; }
        .quick-stat-card:nth-child(2) { animation-delay: 0.15s; }
        .quick-stat-card:nth-child(3) { animation-delay: 0.2s; }
        .quick-stat-card:nth-child(4) { animation-delay: 0.25s; }
        .quick-stat-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
        .quick-stat-icon {
          width: 64px; height: 64px; border-radius: 16px;
          display: grid; place-items: center; font-size: 28px; color: white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .quick-stat-num { font-size: 32px; font-weight: 800; color: var(--text); line-height: 1; }
        .quick-stat-label { font-size: 14px; color: var(--muted); margin-top: 4px; font-weight: 500; }

        /* Charts */
        .charts-row {
          display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 24px;
        }
        .chart-card {
          background: var(--card); border-radius: 20px; padding: 24px;
          box-shadow: var(--shadow); border: 1px solid var(--border);
          opacity: 0; animation: adminFadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.3s forwards;
        }
        .chart-title {
          font-size: 16px; font-weight: 800; color: var(--text); margin-bottom: 20px;
          display: flex; align-items: center; gap: 8px;
        }
        .chart-title::after { content: ''; flex: 1; height: 2px; background: linear-gradient(90deg, var(--border), transparent); margin-left: 12px; }
        .empty-chart {
          text-align: center; padding: 32px; color: var(--muted); font-size: 13px;
        }

        /* Bar Chart */
        .bar-chart { display: flex; flex-direction: column; gap: 12px; }
        .bar-row { display: flex; align-items: center; gap: 12px; padding: 8px 0; }
        .bar-label { width: 80px; font-size: 13px; font-weight: 600; color: var(--muted); }
        .bar-track { flex: 1; height: 28px; background: var(--bg); border-radius: 14px; overflow: hidden; }
        .bar-fill { height: 100%; border-radius: 14px; transition: width 0.8s ease; min-width: 4px; position: relative; }
        .bar-fill::after { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(180deg, rgba(255,255,255,0.2), transparent); border-radius: 14px; }
        .bar-value { width: 40px; text-align: right; font-size: 15px; font-weight: 700; color: var(--text); }

        /* Kategori List */
        .kategori-list { display: flex; flex-direction: column; gap: 4px; }
        .kategori-item {
          display: flex; align-items: center; gap: 12px; padding: 12px 8px;
          border-bottom: 1px solid var(--border);
          border-radius: 8px; transition: all 0.2s;
        }
        .kategori-item:hover { background: var(--bg); }
        .kategori-item:last-child { border-bottom: none; }
        .kategori-rank { font-size: 12px; font-weight: 700; color: var(--primary); width: 28px; height: 28px; display: grid; place-items: center; background: var(--primary-light); border-radius: 8px; }
        .kategori-icon { font-size: 20px; }
        .kategori-name { flex: 1; font-size: 14px; font-weight: 600; color: var(--text); }
        .kategori-bar { width: 100px; height: 10px; background: var(--bg); border-radius: 5px; overflow: hidden; }
        .kategori-fill { height: 100%; border-radius: 5px; transition: width 0.5s ease; }
        .kategori-count { width: 32px; text-align: right; font-size: 14px; font-weight: 700; color: var(--text); }

        /* Recent List */
        .recent-list { display: flex; flex-direction: column; gap: 10px; }
        .recent-item {
          display: flex; align-items: center; gap: 14px; padding: 14px;
          border-radius: 14px; background: var(--bg); cursor: pointer;
          transition: all 0.2s; border: 1px solid transparent;
        }
        .recent-item:hover { background: var(--primary-light); transform: translateX(4px); border-color: var(--primary); }
        .recent-status {
          width: 40px; height: 40px; border-radius: 10px;
          display: grid; place-items: center; font-size: 16px;
        }
        .recent-info { flex: 1; }
        .recent-ticket { font-size: 12px; font-weight: 700; color: var(--primary); }
        .recent-title { font-size: 14px; font-weight: 600; color: var(--text); margin-top: 2px; }
        .recent-meta { text-align: right; }
        .recent-category { font-size: 12px; color: var(--muted); display: block; padding: 2px 8px; background: var(--card); border-radius: 6px; }
        .recent-time { font-size: 11px; color: var(--muted); margin-top: 4px; display: block; }
        .recent-urgent {
          padding: 4px 10px; border-radius: 8px; font-size: 11px;
          font-weight: 700; color: white;
        }

        /* Performance */
        .performance-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .performance-stat { text-align: center; padding: 20px; background: var(--bg); border-radius: 14px; border: 1px solid var(--border); }
        .performance-value { font-size: 32px; font-weight: 800; }
        .performance-label { font-size: 13px; color: var(--muted); margin-top: 8px; font-weight: 500; }
        .performance-bar {
          width: 100%; height: 10px; background: var(--border); border-radius: 5px;
          margin-top: 16px; overflow: hidden;
        }
        .performance-fill { height: 100%; border-radius: 5px; transition: width 0.5s ease; background: linear-gradient(90deg, var(--success), #81C784); }

        /* Table */
        .table-card {
          background: var(--card); border-radius: var(--radius-lg); box-shadow: var(--shadow-lg);
          overflow: hidden; border: 1px solid var(--border);
          opacity: 0; animation: adminFadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.48s forwards;
        }
        .table-wrap { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; min-width: 1100px; }
        th, td { padding: 16px 14px; text-align: left; font-size: 13px; }
        th {
          background: linear-gradient(135deg, var(--primary-light), #fff);
          color: var(--text); font-weight: 800;
          font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px;
          position: sticky; top: 0; z-index: 5; border-bottom: 2px solid var(--primary);
          cursor: pointer; user-select: none; transition: background 0.2s;
        }
        th:hover { background: var(--primary-light); }
        th.sortable { position: relative; padding-right: 28px; }
        .sort-icon {
          position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
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
        .checkbox-cell { width: 40px; text-align: center; }
        .row-checkbox {
          width: 18px; height: 18px; cursor: pointer; accent-color: var(--primary);
        }

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
          font-size: 12px; font-weight: 600; cursor: pointer; background: var(--card);
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
          background: var(--card); cursor: pointer; font-size: 13px; font-weight: 700;
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
          .admin-page { padding: 0 8px; }
          .stats-row { grid-template-columns: repeat(6, 1fr); gap: 12px; }
          .stat-box { padding: 16px; border-radius: 16px; }
          .stat-box .num { font-size: 28px; min-height: 28px; }
          .table-card { border-radius: var(--radius-lg); }
        }

        /* Responsive: Desktop */
        @media (min-width: 1024px) {
          .admin-page { padding: 0 16px; }
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
          .quick-stats-row { grid-template-columns: repeat(2, 1fr); }
          .quick-stat-card { padding: 16px; }
          .quick-stat-icon { width: 48px; height: 48px; font-size: 20px; }
          .quick-stat-num { font-size: 24px; }
          .charts-row { grid-template-columns: 1fr; }
          .performance-grid { grid-template-columns: 1fr; }
        }

        /* Dark mode overrides */
        [data-theme="dark"] :root {
          --bg: #1a1f35; --card: #252b45; --text: #e8eaf6; --muted: #9fa8c2;
          --border: #3d4566; --primary-light: rgba(255,255,255,0.08); --accent: #64b5f6;
        }
        [data-theme="dark"] body { background: linear-gradient(180deg, #1a1f35 0%, #1e2442 50%, #1a1f35 100%); color: var(--text); }
        [data-theme="dark"] .admin-page { color: var(--text); background: transparent; }
        [data-theme="dark"] .quick-stat-card { background: var(--card); border-color: var(--border); }
        [data-theme="dark"] .quick-stat-num { color: var(--text); }
        [data-theme="dark"] .quick-stat-label { color: var(--muted); }
        [data-theme="dark"] .chart-card { background: var(--card); border-color: var(--border); }
        [data-theme="dark"] .chart-title { color: var(--text); }
        [data-theme="dark"] .chart-title::after { background: linear-gradient(90deg, var(--border), transparent); }
        [data-theme="dark"] .bar-label { color: var(--muted); }
        [data-theme="dark"] .bar-value { color: var(--text); }
        [data-theme="dark"] .bar-track { background: rgba(0,0,0,0.2); }
        [data-theme="dark"] .kategori-list { color: var(--text); }
        [data-theme="dark"] .kategori-item { border-color: var(--border); }
        [data-theme="dark"] .kategori-name { color: var(--text); }
        [data-theme="dark"] .kategori-bar { background: rgba(0,0,0,0.2); }
        [data-theme="dark"] .kategori-count { color: var(--text); }
        [data-theme="dark"] .recent-list { color: var(--text); }
        [data-theme="dark"] .recent-item { background: rgba(0,0,0,0.2); border-color: var(--border); }
        [data-theme="dark"] .recent-item:hover { background: rgba(100,181,246,0.1); border-color: var(--accent); }
        [data-theme="dark"] .recent-ticket { color: var(--accent); }
        [data-theme="dark"] .recent-title { color: var(--text); }
        [data-theme="dark"] .recent-category { background: var(--card); color: var(--muted); }
        [data-theme="dark"] .recent-time { color: var(--muted); }
        [data-theme="dark"] .performance-grid { color: var(--text); }
        [data-theme="dark"] .performance-stat { background: var(--card); border-color: var(--border); }
        [data-theme="dark"] .performance-value { color: var(--text); }
        [data-theme="dark"] .performance-label { color: var(--muted); }
        [data-theme="dark"] .performance-bar { background: rgba(0,0,0,0.2); }
        [data-theme="dark"] .stat-box { background: var(--card); border-color: var(--border); color: var(--text); }
        [data-theme="dark"] .stat-box .lbl { color: var(--muted); }
        [data-theme="dark"] .toolbar { background: var(--card); }
        [data-theme="dark"] .search-input { background: var(--bg); color: var(--text); border-color: var(--border); }
        [data-theme="dark"] .search-input:focus { background: var(--card); border-color: var(--accent); }
        [data-theme="dark"] .filter-tab { background: var(--card); color: var(--text); border-color: var(--border); }
        [data-theme="dark"] .filter-tab.active { background: var(--primary); color: white; }
        [data-theme="dark"] .toolbar-btn { background: var(--card); color: var(--text); border-color: var(--border); }
        [data-theme="dark"] .result-count { background: var(--card); color: var(--accent); }
        [data-theme="dark"] .table-card { background: var(--card); border-color: var(--border); }
        [data-theme="dark"] th { background: var(--card); color: var(--text); border-color: var(--border); }
        [data-theme="dark"] td { color: var(--text); border-color: var(--border); }
        [data-theme="dark"] tbody tr:hover { background: rgba(0,0,0,0.2); }
        [data-theme="dark"] .status-select { background: var(--card); color: var(--text); border-color: var(--border); }
        [data-theme="dark"] .page-btn { background: var(--card); color: var(--text); border-color: var(--border); }
        [data-theme="dark"] .modal-box { background: var(--card); color: var(--text); border-color: var(--border); }
        [data-theme="dark"] .confirm-box { background: var(--card); color: var(--text); }
        [data-theme="dark"] .detail-item { background: rgba(0,0,0,0.2); color: var(--text); }
        [data-theme="dark"] .detail-desc { background: rgba(0,0,0,0.2); color: var(--text); }
        [data-theme="dark"] .detail-actions .btn-delete { background: #3D1520; }
        [data-theme="dark"] .action-btn.view { background: #1A2744; }
        [data-theme="dark"] .action-btn.delete { background: #3D1520; }
        [data-theme="dark"] .pagination { background: var(--card); border-color: var(--border); color: var(--text); }
        [data-theme="dark"] .page-input { background: var(--card); color: var(--text); border-color: var(--border); }
        [data-theme="dark"] .empty-state { color: var(--muted); }
        [data-theme="dark"] .empty-state-icon { opacity: 0.5; }
      `}</style>

      <div className="admin-page">
        {/* Quick Stats */}
        <div className="quick-stats-row">
          <div className="quick-stat-card">
            <div className="quick-stat-icon" style={{background: 'linear-gradient(135deg, #1E88E5, #1565C0)'}}>📋</div>
            <div className="quick-stat-info">
              <div className="quick-stat-num">{stats.total}</div>
              <div className="quick-stat-label">Total Laporan</div>
            </div>
          </div>
          <div className="quick-stat-card">
            <div className="quick-stat-icon" style={{background: 'linear-gradient(135deg, #FF9800, #F57C00)'}}>📅</div>
            <div className="quick-stat-info">
              <div className="quick-stat-num">{todayReports}</div>
              <div className="quick-stat-label">Hari Ini</div>
            </div>
          </div>
          <div className="quick-stat-card">
            <div className="quick-stat-icon" style={{background: 'linear-gradient(135deg, #E53935, #C62828)'}}>🚨</div>
            <div className="quick-stat-info">
              <div className="quick-stat-num">{urgentReports}</div>
              <div className="quick-stat-label">Urgent</div>
            </div>
          </div>
          <div className="quick-stat-card">
            <div className="quick-stat-icon" style={{background: 'linear-gradient(135deg, #9C27B0, #7B1FA2)'}}>⏳</div>
            <div className="quick-stat-info">
              <div className="quick-stat-num">{unprocessedReports}</div>
              <div className="quick-stat-label">Belum Diproses</div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="charts-row">
          {/* Chart Status */}
          <div className="chart-card">
            <h3 className="chart-title">📊 Distribusi Status</h3>
            <div className="bar-chart">
              <div className="bar-row">
                <span className="bar-label">Terkirim</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{width: `${stats.total > 0 ? (stats.terkirim / stats.total) * 100 : 0}%`, background: '#1E88E5'}} />
                </div>
                <span className="bar-value">{stats.terkirim}</span>
              </div>
              <div className="bar-row">
                <span className="bar-label">Diproses</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{width: `${stats.total > 0 ? (stats.diproses / stats.total) * 100 : 0}%`, background: '#FF9800'}} />
                </div>
                <span className="bar-value">{stats.diproses}</span>
              </div>
              <div className="bar-row">
                <span className="bar-label">Selesai</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{width: `${stats.total > 0 ? (stats.selesai / stats.total) * 100 : 0}%`, background: '#4CAF50'}} />
                </div>
                <span className="bar-value">{stats.selesai}</span>
              </div>
              <div className="bar-row">
                <span className="bar-label">Ditolak</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{width: `${stats.total > 0 ? (stats.ditolak / stats.total) * 100 : 0}%`, background: '#E53935'}} />
                </div>
                <span className="bar-value">{stats.ditolak}</span>
              </div>
            </div>
          </div>

          {/* Top Kategori */}
          <div className="chart-card">
            <h3 className="chart-title">🏆 Top 5 Kategori</h3>
            {categoryStats.length === 0 ? (
              <div className="empty-chart">Belum ada data</div>
            ) : (
              <div className="kategori-list">
                {categoryStats.map(([category, count], idx) => (
                  <div key={category} className="kategori-item">
                    <span className="kategori-rank">#{idx + 1}</span>
                    <span className="kategori-icon">{categoryIcons[category] || '📋'}</span>
                    <span className="kategori-name">{category}</span>
                    <div className="kategori-bar">
                      <div className="kategori-fill" style={{width: `${(count / maxCategoryCount) * 100}%`, background: categoryColors[category] || '#667eea'}} />
                    </div>
                    <span className="kategori-count">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Row */}
        <div className="charts-row">
          {/* Laporan Terbaru */}
          <div className="chart-card">
            <h3 className="chart-title">🆕 Laporan Terbaru (Perlu Ditindak)</h3>
            {recentUrgent.length === 0 ? (
              <div className="empty-chart">Tidak ada laporan baru</div>
            ) : (
              <div className="recent-list">
                {recentUrgent.map((report) => (
                  <div key={report.ticket} className="recent-item" onClick={() => setSelectedReport(report)}>
                    <span className="recent-status" style={{background: '#E3F2FD', color: '#1976D2'}}>📨</span>
                    <div className="recent-info">
                      <div className="recent-ticket">{report.ticket}</div>
                      <div className="recent-title">{report.title}</div>
                    </div>
                    <div className="recent-meta">
                      <span className="recent-category">{report.category}</span>
                      <span className="recent-time">{report.createdAt.split(',')[0]}</span>
                    </div>
                    {(report.priority === 'Darurat' || report.priority === 'Tinggi') && (
                      <span className="recent-urgent" style={{background: report.priority === 'Darurat' ? '#E53935' : '#FF9800'}}>
                        {report.priority}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ringkasan Performa */}
          <div className="chart-card">
            <h3 className="chart-title">📈 Ringkasan Performa</h3>
            <div className="performance-grid">
              <div className="performance-stat">
                <div className="performance-value" style={{color: 'var(--success)'}}>{performanceStats.completionRate}%</div>
                <div className="performance-label">Tingkat Penyelesaian</div>
                <div className="performance-bar">
                  <div className="performance-fill" style={{width: `${performanceStats.completionRate}%`, background: 'var(--success)'}} />
                </div>
              </div>
              <div className="performance-stat">
                <div className="performance-value" style={{color: 'var(--primary)'}}>{stats.selesai}</div>
                <div className="performance-label">Total Selesai</div>
              </div>
              <div className="performance-stat">
                <div className="performance-value" style={{color: 'var(--warning)'}}>{stats.diproses}</div>
                <div className="performance-label">Sedang Diproses</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
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
            <button className="toolbar-btn success" type="button" onClick={exportToCSV}>
              📥 Export CSV
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
                          checked={selectedRows.size === paginatedReports.length && paginatedReports.length > 0}
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
                    {paginatedReports.map((report) => (
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
                            <button className="action-btn view" type="button" onClick={() => setSelectedReport(report)}>👁️</button>
                            <button className="action-btn delete" type="button" onClick={() => setShowDeleteConfirm(sortedReports.indexOf(report))}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <div className="pagination-info">
                    Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, sortedReports.length)} dari {sortedReports.length} laporan
                  </div>
                  <div className="pagination-controls">
                    <button
                      className="page-btn"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    >
                      «
                    </button>
                    <button
                      className="page-btn"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      ‹
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      className="page-btn"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      ›
                    </button>
                    <button
                      className="page-btn"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      »
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        </>
        ) : (
        /* ===== FORUM TAB ===== */
        <div className="forum-admin">
          <div className="forum-admin-header">
            <h3>💬 Forum Diskusi</h3>
            <div className="forum-admin-participants">
              {forumParticipants.map(name => (
                <span key={name} className="forum-admin-participant">👤 {name}</span>
              ))}
            </div>
          </div>
          <div className="forum-admin-messages">
            {sortedForum.length === 0 ? (
              <div style={{textAlign: 'center', padding: '40px 20px', color: 'var(--muted)'}}>
                <div style={{fontSize: 48, marginBottom: 12}}>💬</div>
                <p>Belum ada pesan di forum</p>
              </div>
            ) : sortedForum.map(msg => (
              <div key={msg.id} className={`forum-admin-msg ${msg.isPinned ? 'pinned' : ''}`}>
                <div className="forum-admin-msg-header">
                  <div className="forum-admin-msg-author">
                    <div className="forum-admin-msg-avatar">{msg.avatar}</div>
                    <div>
                      <div className="forum-admin-msg-name">{msg.author}</div>
                      <div className="forum-admin-msg-time">{msg.timestamp}</div>
                    </div>
                  </div>
                  {msg.isReport && <span style={{fontSize:11,background:'var(--primary-light)',color:'var(--primary)',padding:'3px 8px',borderRadius:8,fontWeight:700}}>📋 Laporan</span>}
                  {msg.isPinned && <span style={{fontSize:11,background:'#FEF3C7',color:'#D97706',padding:'3px 8px',borderRadius:8,fontWeight:700}}>📌 Pinned</span>}
                </div>
                <div className="forum-admin-msg-text">{msg.message}</div>
                <div className="forum-admin-msg-actions">
                  <button className="forum-admin-msg-btn" onClick={() => togglePinForum(msg.id)}>📌 {msg.isPinned ? 'Unpin' : 'Pin'}</button>
                  <button className="forum-admin-msg-btn delete" onClick={() => deleteForumMessage(msg.id)}>🗑️ Hapus</button>
                  <span style={{fontSize:11, color:'var(--muted)'}}>❤️ {msg.likes} · 💬 {msg.replies.length}</span>
                </div>
                {msg.replies.length > 0 && (
                  <div className="forum-admin-replies">
                    {msg.replies.map(reply => (
                      <div key={reply.id} className="forum-admin-reply">
                        <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
                          <span style={{fontSize:14}}>{reply.avatar}</span>
                          <strong style={{fontSize:12,color:'var(--primary)'}}>{reply.author}</strong>
                          <span style={{fontSize:10,color:'var(--muted)'}}>{reply.timestamp}</span>
                        </div>
                        <div>{reply.message}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={forumEndRef} />
          </div>
          <div className="forum-admin-compose">
            <input
              type="text"
              placeholder="Tulis pesan ke forum..."
              value={newForumMsg}
              onChange={(e) => setNewForumMsg(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') sendForumMessage(); }}
            />
            <button onClick={sendForumMessage} disabled={!newForumMsg.trim()}>🚀 Kirim</button>
          </div>
        </div>
        )}

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


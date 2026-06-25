'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getReports, getAnnouncements, getBilling } from './lib/storage';
import { heroImages, defaultSchedule, getStatusColor, getStatusStep, defaultContacts } from './lib/constants';
import { Modal, StatGrid, EmptyState, ReportChart } from './components';
import type { Announcement, BillingItem, ModalType, Report, ReportStatus } from './lib/types';

export default function BerandaPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [billing, setBilling] = useState<BillingItem[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [showReportDetail, setShowReportDetail] = useState<Report | null>(null);

  useEffect(() => {
    setReports(getReports());
    setAnnouncements(getAnnouncements());
    setBilling(getBilling());
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  function prevSlide() {
    setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  }
  function nextSlide() {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  }

  const dashboardCounts = useMemo(() => ({
    all: reports.length,
    sent: reports.filter((r) => r.status === 'Terkirim').length,
    process: reports.filter((r) => r.status === 'Diproses').length,
    done: reports.filter((r) => r.status === 'Selesai').length,
  }), [reports]);

  const recentReports = useMemo(() => reports.slice(0, 5), [reports]);
  const unpaidCount = useMemo(() => billing.filter((b) => b.status !== 'Lunas').length, [billing]);

  const services = [
    { icon: '📢', name: 'Pengumuman', modal: 'pengumuman' as ModalType, bg: '#E3F2FD' },
    { icon: '📋', name: 'Pengaduan', modal: null, href: '/lapor_mulia/lapor', bg: '#FDF2F4' },
    { icon: '💰', name: 'Keuangan', modal: 'keuangan' as ModalType, bg: '#FFF3E0' },
    { icon: '🚨', name: 'Darurat', modal: 'darurat' as ModalType, bg: '#FFEBEE' },
    { icon: '📅', name: 'Jadwal', modal: 'jadwal' as ModalType, bg: '#E8F5E9' },
    { icon: '📖', name: 'Perpustakaan', modal: 'perpustakaan' as ModalType, bg: '#F3E5F5' },
    { icon: '🏢', name: 'Direktori', modal: 'direktori' as ModalType, bg: '#E0F7FA' },
    { icon: '📚', name: 'E-Learning', modal: 'elearning' as ModalType, bg: '#FBE9E7' },
  ];

  return (
    <>
      {/* Hero Carousel */}
      <div className="hero-banner">
        <div className="hero-slider" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
          {heroImages.map((src, i) => (
            <div key={i} className="hero-slide">
              <img src={src} alt={`Gedung Universitas Mulia Balikpapan ${i + 1}`} />
            </div>
          ))}
        </div>
        <button className="hero-nav-btn left" type="button" onClick={prevSlide} aria-label="Sebelumnya">❮</button>
        <button className="hero-nav-btn right" type="button" onClick={nextSlide} aria-label="Selanjutnya">❯</button>
        <div className="hero-dots">
          {heroImages.map((_, i) => (
            <button key={i} className={`hero-dot ${i === currentSlide ? 'active' : ''}`} type="button" onClick={() => setCurrentSlide(i)} aria-label={`Slide ${i + 1}`} />
          ))}
        </div>
        <div className="hero-text">
          <h3>🏛️ Universitas Mulia</h3>
          <p>Sistem Pengaduan & Layanan Kampus Terpadu</p>
        </div>
      </div>

      {/* Stats */}
      <section className="section">
        <div className="section-header">
          <h3>Statistik Laporan</h3>
          <Link href="/lapor_mulia/riwayat" style={{fontSize:'12px',color:'var(--accent)',fontWeight:700}}>Lihat Semua</Link>
        </div>
        <StatGrid items={[
          { icon: '📋', num: dashboardCounts.all, label: 'Total' },
          { icon: '📨', num: dashboardCounts.sent, label: 'Terkirim' },
          { icon: '⏳', num: dashboardCounts.process, label: 'Diproses' },
          { icon: '✅', num: dashboardCounts.done, label: 'Selesai' },
        ]} />
      </section>

      {/* Quick Actions */}
      <div className="quick-actions">
        <Link href="/lapor_mulia/lapor" className="quick-action-btn"><span className="qa-icon">📝</span> Buat Laporan</Link>
        <Link href="/lapor_mulia/riwayat" className="quick-action-btn"><span className="qa-icon">🔍</span> Cek Status</Link>
        <button className="quick-action-btn" type="button" onClick={() => setActiveModal('pengumuman')}><span className="qa-icon">📢</span> Pengumuman</button>
        <button className="quick-action-btn" type="button" onClick={() => setActiveModal('keuangan')}>
          <span className="qa-icon">💰</span> Keuangan {unpaidCount > 0 && <span style={{background:'#FF9800',color:'white',padding:'2px 6px',borderRadius:'6px',fontSize:'10px'}}>{unpaidCount}</span>}
        </button>
        <button className="quick-action-btn" type="button" onClick={() => setActiveModal('darurat')}><span className="qa-icon">🚨</span> Darurat</button>
      </div>

      {/* Service Grid */}
      <section className="section">
        <div className="section-header"><h3>Layanan Kampus</h3></div>
        <div className="service-grid">
          {services.map((svc) => (
            svc.modal ? (
              <button key={svc.name} className="service-card" type="button" onClick={() => setActiveModal(svc.modal)}>
                <div className="svc-icon" style={{ background: svc.bg }}>{svc.icon}</div>
                <span className="svc-name">{svc.name}</span>
              </button>
            ) : (
              <Link key={svc.name} href={svc.href!} className="service-card">
                <div className="svc-icon" style={{ background: svc.bg }}>{svc.icon}</div>
                <span className="svc-name">{svc.name}</span>
              </Link>
            )
          ))}
        </div>
      </section>

      {/* Pengumuman Terbaru */}
      <section className="section">
        <div className="section-header">
          <h3>Pengumuman Terbaru</h3>
          <button style={{border:'none',background:'none',color:'var(--accent)',fontSize:'12px',fontWeight:700,cursor:'pointer'}} onClick={() => setActiveModal('pengumuman')}>Lihat Semua</button>
        </div>
        <div className="announce-list">
          {announcements.slice(0, 3).map((ann) => (
            <div key={ann.id} className={`announce-card ${ann.urgent ? 'urgent' : ''}`}>
              <div className="announce-header">
                <span className={`announce-badge ${ann.urgent ? 'urgent' : 'normal'}`}>{ann.urgent ? '🔴 Urgent' : '🔵 Info'}</span>
                <span className="announce-date">{ann.date}</span>
              </div>
              <div className="announce-title">{ann.title}</div>
              <div className="announce-content">{ann.content}</div>
              <div className="announce-author">Oleh: {ann.author}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Jadwal Mendatang */}
      <section className="section">
        <div className="section-header">
          <h3>Jadwal Mendatang</h3>
          <button style={{border:'none',background:'none',color:'var(--accent)',fontSize:'12px',fontWeight:700,cursor:'pointer'}} onClick={() => setActiveModal('jadwal')}>Lihat Semua</button>
        </div>
        <div className="schedule-list">
          {defaultSchedule.slice(0, 3).map((sch, i) => (
            <div key={i} className="schedule-item">
              <div className="schedule-date">
                <div className="day">{sch.date.split(' ')[0]}</div>
                <div className="month">{sch.date.split(' ')[1]}</div>
              </div>
              <div className="schedule-info">
                <div className="event">{sch.event}</div>
                <div className="location">{sch.location}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Laporan Terakhir */}
      {recentReports.length > 0 && (
        <section className="section">
          <div className="section-header">
            <h3>Laporan Terakhir</h3>
            <Link href="/lapor_mulia/riwayat" style={{fontSize:'12px',color:'var(--accent)',fontWeight:700}}>Lihat Semua</Link>
          </div>
          <div className="service-grid-modern">
            {recentReports.map((report) => (
              <button 
                key={report.ticket} 
                className="service-card-detailed"
                onClick={() => setShowReportDetail(report)}
              >
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
        </section>
      )}

      {/* Modals */}
      <Modal isOpen={activeModal === 'pengumuman'} onClose={() => setActiveModal(null)} title="Pengumuman" icon="📢">
        <div className="announce-list">
          {announcements.map((ann) => (
            <div key={ann.id} className={`announce-card ${ann.urgent ? 'urgent' : ''}`}>
              <div className="announce-header">
                <span className={`announce-badge ${ann.urgent ? 'urgent' : 'normal'}`}>{ann.urgent ? '🔴 Urgent' : '🔵 Info'}</span>
                <span className="announce-date">{ann.date}</span>
              </div>
              <div className="announce-title">{ann.title}</div>
              <div className="announce-content">{ann.content}</div>
              <div className="announce-author">Oleh: {ann.author}</div>
            </div>
          ))}
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'keuangan'} onClose={() => setActiveModal(null)} title="Keuangan" icon="💰">
        <div style={{marginBottom:12,padding:12,background:'#FFF3E0',borderRadius:12,fontSize:13,fontWeight:700}}>
          Tagihan belum dibayar: <span style={{color:'var(--warning)'}}>{unpaidCount}</span>
        </div>
        <div className="billing-list">
          {billing.map((b) => (
            <div key={b.id} className="billing-card">
              <div className="billing-top">
                <div className="billing-name">{b.name}</div>
                <div className="billing-amount">{b.amount}</div>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span className={`billing-status ${b.status === 'Lunas' ? 'lunas' : 'belum'}`}>{b.status}</span>
                <span className="billing-due">Jatuh tempo: {b.dueDate}</span>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'darurat'} onClose={() => setActiveModal(null)} title="Kontak Darurat" icon="🚨">
        <div className="contact-list">
          {defaultContacts.map((c, i) => (
            <div key={i} className="contact-card">
              <div className="contact-icon">{c.icon}</div>
              <div className="contact-info">
                <div className="name">{c.name}</div>
                <div className="role">{c.role} • {c.phone}</div>
              </div>
              <a href={`tel:${c.phone.replace(/[^0-9+]/g, '')}`} className="contact-call">📞 Hubungi</a>
            </div>
          ))}
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'jadwal'} onClose={() => setActiveModal(null)} title="Jadwal Akademik" icon="📅">
        <div className="schedule-list">
          {defaultSchedule.map((sch, i) => (
            <div key={i} className="schedule-item">
              <div className="schedule-date">
                <div className="day">{sch.date.split(' ')[0]}</div>
                <div className="month">{sch.date.split(' ')[1]}</div>
              </div>
              <div className="schedule-info">
                <div className="event">{sch.event}</div>
                <div className="location">{sch.location}</div>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'perpustakaan'} onClose={() => setActiveModal(null)} title="Perpustakaan" icon="📖">
        <div style={{marginBottom:16}}>
          <div style={{fontWeight:700,fontSize:14,marginBottom:8}}>Jam Operasional</div>
          <div style={{fontSize:13,color:'var(--muted)',lineHeight:1.6}}>
            Senin - Jumat: 08:00 - 16:00<br/>
            Sabtu: 08:00 - 12:00<br/>
            Minggu & Hari Libur: Tutup
          </div>
        </div>
        <div style={{marginBottom:16}}>
          <div style={{fontWeight:700,fontSize:14,marginBottom:8}}>Buku Sedang Dipinjam</div>
          <div className="report-list">
            {[
              { title: 'Pemrograman Web Lanjut', due: '30 Jun 2026', status: 'Dipinjam' },
              { title: 'Basis Data Relasional', due: '05 Jul 2026', status: 'Dipinjam' },
            ].map((book, i) => (
              <div key={i} className="report-card">
                <div className="report-title">{book.title}</div>
                <div className="report-meta"><span>📅 Kembali: {book.due}</span><span className="report-status" style={{background:'#E3F2FD',color:'var(--accent)'}}>{book.status}</span></div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{fontWeight:700,fontSize:14,marginBottom:8}}>Cari Buku</div>
          <div className="search-bar">
            <input type="text" placeholder="Judul buku atau ISBN..." />
            <button type="button">Cari</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'direktori'} onClose={() => setActiveModal(null)} title="Direktori Kampus" icon="🏢">
        <div className="contact-list">
          {[
            { name: 'BAAK', role: 'Biro Administrasi Akademik & Kemahasiswaan', phone: '(0541) 765-4322', icon: '📚' },
            { name: 'Biro Keuangan', role: 'Pembayaran & Tagihan', phone: '(0541) 765-4323', icon: '💰' },
            { name: 'Kemahasiswaan', role: 'Organisasi & Beasiswa', phone: '(0541) 765-4324', icon: '🎓' },
            { name: 'Sarana Prasarana', role: 'Fasilitas & Perawatan', phone: '(0541) 765-4325', icon: '🔧' },
          ].map((c, i) => (
            <div key={i} className="contact-card">
              <div className="contact-icon">{c.icon}</div>
              <div className="contact-info">
                <div className="name">{c.name}</div>
                <div className="role">{c.role} • {c.phone}</div>
              </div>
              <a href={`tel:${c.phone.replace(/[^0-9+]/g, '')}`} className="contact-call">📞</a>
            </div>
          ))}
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'elearning'} onClose={() => setActiveModal(null)} title="E-Learning" icon="📚">
        <div className="report-list">
          {[
            { code: 'CS201', name: 'Pemrograman Web', lecturer: 'Dr. Ahmad', status: 'Aktif', progress: 75 },
            { code: 'CS301', name: 'Basis Data', lecturer: 'Prof. Siti', status: 'Aktif', progress: 60 },
            { code: 'CS302', name: 'Jaringan Komputer', lecturer: 'Dr. Budi', status: 'Aktif', progress: 45 },
            { code: 'CS401', name: 'Kecerdasan Buatan', lecturer: 'Dr. Dewi', status: 'Selesai', progress: 100 },
          ].map((course, i) => (
            <div key={i} className="report-card">
              <div className="report-card-top">
                <span className="report-ticket">{course.code}</span>
                <span className="report-status" style={{background: course.status === 'Aktif' ? '#E3F2FD' : '#E8F5E9', color: course.status === 'Aktif' ? 'var(--accent)' : 'var(--success)'}}>{course.status}</span>
              </div>
              <div className="report-title">{course.name}</div>
              <div className="report-meta"><span>👨‍🏫 {course.lecturer}</span></div>
              <div className="course-progress">
                <div className="course-progress-bar" style={{width:`${course.progress}%`}} />
              </div>
              <div className="course-progress-text">{course.progress}% selesai</div>
            </div>
          ))}
        </div>
      </Modal>

      <Modal isOpen={!!showReportDetail} onClose={() => setShowReportDetail(null)} title="" icon="">
        {showReportDetail && (
          <>
            {/* Detail Header */}
            <div className="report-detail-header">
              <div className="report-detail-ticket">{showReportDetail.ticket}</div>
              <div className="report-detail-title">{showReportDetail.title}</div>
              <div className="report-detail-status">
                {showReportDetail.status === 'Terkirim' && '📨'}
                {showReportDetail.status === 'Diproses' && '⏳'}
                {showReportDetail.status === 'Selesai' && '✅'}
                {showReportDetail.status === 'Ditolak' && '❌'}
                {' '}{showReportDetail.status}
              </div>
            </div>

            {/* Detail Body */}
            <div className="report-detail-body">
              {/* Deskripsi */}
              <div className="report-detail-section">
                <div className="report-detail-section-title">Deskripsi</div>
                <div className="report-detail-desc">{showReportDetail.description}</div>
              </div>

              {/* Info Grid */}
              <div className="report-detail-section">
                <div className="report-detail-section-title">Informasi</div>
                <div className="report-detail-info">
                  <div className="report-detail-info-item">
                    <div className="report-detail-info-label">Kategori</div>
                    <div className="report-detail-info-value">📂 {showReportDetail.category}</div>
                  </div>
                  <div className="report-detail-info-item">
                    <div className="report-detail-info-label">Urgensi</div>
                    <div className="report-detail-info-value">
                      {showReportDetail.priority === 'Darurat' && '🔴'}
                      {showReportDetail.priority === 'Tinggi' && '🟠'}
                      {showReportDetail.priority === 'Sedang' && '🟡'}
                      {showReportDetail.priority === 'Rendah' && '🟢'}
                      {' '}{showReportDetail.priority}
                    </div>
                  </div>
                  <div className="report-detail-info-item">
                    <div className="report-detail-info-label">Lokasi</div>
                    <div className="report-detail-info-value">📍 {showReportDetail.location}</div>
                  </div>
                  <div className="report-detail-info-item">
                    <div className="report-detail-info-label">Pelapor</div>
                    <div className="report-detail-info-value">👤 {showReportDetail.name}</div>
                  </div>
                  <div className="report-detail-info-item" style={{gridColumn:'1/-1'}}>
                    <div className="report-detail-info-label">Kontak</div>
                    <div className="report-detail-info-value">📞 {showReportDetail.contact}</div>
                  </div>
                  <div className="report-detail-info-item" style={{gridColumn:'1/-1'}}>
                    <div className="report-detail-info-label">Tanggal</div>
                    <div className="report-detail-info-value">📅 {showReportDetail.createdAt}</div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="report-detail-section">
                <div className="report-detail-section-title">Status Timeline</div>
                <div className="timeline">
                  {(['Terkirim', 'Diproses', 'Selesai'] as ReportStatus[]).map((s, i) => {
                    const current = getStatusStep(showReportDetail.status);
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
              </div>

              {/* Ditolak Notice */}
              {showReportDetail.status === 'Ditolak' && (
                <div style={{padding:12,background:'#FFEBEE',borderRadius:12,fontSize:13,color:'var(--danger)',fontWeight:600,display:'flex',alignItems:'center',gap:8}}>
                  ❌ Laporan ditolak oleh admin. Silakan hubungi BAAK untuk informasi lebih lanjut.
                </div>
              )}

              {/* Selesai Notice */}
              {showReportDetail.status === 'Selesai' && (
                <div style={{padding:12,background:'#E8F5E9',borderRadius:12,fontSize:13,color:'var(--success)',fontWeight:600,display:'flex',alignItems:'center',gap:8}}>
                  ✅ Laporan telah selesai ditangani. Terima kasih atas partisipasi Anda.
                </div>
              )}
            </div>
          </>
        )}
      </Modal>
    </>
  );
}

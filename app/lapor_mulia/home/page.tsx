'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getReports, getAnnouncements, getBilling } from '../lib/storage';
import { heroImages, defaultSchedule, defaultContacts, getStatusColor } from '../lib/constants';
import type { Report, Announcement, BillingItem, ModalType } from '../lib/types';
import { StatGrid, Modal, ReportDetailModal } from '../components';
import { useAuth } from '../lib/auth-context';

export default function DashboardHome() {
  const { user, isAdmin } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [billing, setBilling] = useState<BillingItem[]>([]);
  const isLoaded = true;
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

  // Filter reports: user biasa hanya lihat laporannya sendiri, admin lihat semua
  const userReports = useMemo(() => {
    if (isAdmin()) return reports;
    return reports.filter(r => r.name === user?.name);
  }, [reports, user, isAdmin]);

  const dashboardCounts = useMemo(() => ({
    all: userReports.length,
    sent: userReports.filter((r) => r.status === 'Terkirim').length,
    process: userReports.filter((r) => r.status === 'Diproses').length,
    done: userReports.filter((r) => r.status === 'Selesai').length,
  }), [userReports]);

  const recentReports = useMemo(() => userReports.slice(0, 5), [userReports]);
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
      <style>{`
        .hero-banner {
          position: relative;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hero-text {
          animation: fadeInUp 1s ease-out 0.3s forwards;
          opacity: 0;
        }
        .quick-actions {
          transition: all 0.3s ease;
        }
        .quick-action-btn {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .quick-action-btn:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 12px 24px rgba(123, 16, 35, 0.15);
        }
        .quick-action-btn:active {
          transform: translateY(-2px) scale(0.98);
        }
        .service-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .service-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.5s;
        }
        .service-card:hover::before {
          left: 100%;
        }
        .service-card:hover {
          transform: translateY(-8px) rotate(1deg);
          box-shadow: 0 16px 32px rgba(0,0,0,0.15);
        }
        .service-card:hover .svc-icon {
          transform: scale(1.2) rotate(10deg);
        }
        .svc-icon {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .announce-card {
          transition: all 0.3s ease;
          position: relative;
        }
        .announce-card:hover {
          transform: translateX(8px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
        }
        .announce-card::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: linear-gradient(180deg, var(--primary), var(--accent));
          transform: scaleY(0);
          transition: transform 0.3s;
        }
        .announce-card:hover::before {
          transform: scaleY(1);
        }
        .schedule-item {
          transition: all 0.3s ease;
        }
        .schedule-item:hover {
          transform: translateX(8px);
          background: var(--primary-light);
        }
        .schedule-item:hover .schedule-date {
          transform: scale(1.1) rotate(-5deg);
        }
        .schedule-date {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .service-card-detailed {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }
        .service-card-detailed:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(0,0,0,0.12);
        }
        .service-card-detailed:hover .service-card-detailed-arrow {
          transform: translateX(8px);
        }
        .service-card-detailed-arrow {
          transition: transform 0.3s ease;
        }
        .service-card-detailed-icon {
          transition: all 0.3s ease;
        }
        .service-card-detailed:hover .service-card-detailed-icon {
          transform: scale(1.15) rotate(5deg);
        }
        .hero-nav-btn {
          transition: all 0.3s ease;
        }
        .hero-nav-btn:hover {
          transform: scale(1.1);
          background: rgba(123, 16, 35, 0.95);
        }
        .hero-dot {
          transition: all 0.3s ease;
        }
        .hero-dot:hover {
          transform: scale(1.3);
        }
        .contact-card,
        .billing-card {
          transition: all 0.3s ease;
        }
        .contact-card:hover,
        .billing-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        }
        .stat-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .stat-card:hover {
          transform: translateY(-6px) scale(1.02);
          box-shadow: 0 12px 32px rgba(0,0,0,0.15);
        }
      `}</style>
      {/* Hero Banner - Pajangan Saja */}
      <div className={`hero-banner ${isLoaded ? 'anim-fade-up' : ''}`}>
        <div className="hero-slider" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
          {heroImages.map((src, i) => (
            <div key={i} className="hero-slide">
              <img src={src} alt={`Gedung Universitas Mulia Balikpapan ${i + 1}`} />
            </div>
          ))}
        </div>
        <div className="hero-text">
          <h3>🏛️ Universitas Mulia</h3>
          <p>Sistem Pengaduan & Layanan Kampus Terpadu</p>
        </div>
      </div>

      {/* Stats */}
      <section className={`section ${isLoaded ? 'anim-fade-up delay-2' : ''}`}>
        <div className="section-header">
          <h3>Statistik Laporan</h3>
          <Link href="/lapor_mulia/riwayat" style={{fontSize:'var(--text-sm)',color:'var(--accent)',fontWeight:'var(--fw-bold)'}}>Lihat Semua</Link>
        </div>
        <StatGrid items={[
          { icon: '📋', num: dashboardCounts.all, label: 'Total' },
          { icon: '📨', num: dashboardCounts.sent, label: 'Terkirim' },
          { icon: '⏳', num: dashboardCounts.process, label: 'Diproses' },
          { icon: '✅', num: dashboardCounts.done, label: 'Selesai' },
        ]} />
      </section>

      {/* Quick Actions */}
      <div className={`quick-actions ${isLoaded ? 'anim-fade-up delay-4' : ''}`}>
        <Link href="/lapor_mulia/lapor" className="quick-action-btn"><span className="qa-icon">📝</span> Buat Laporan</Link>
        <Link href="/lapor_mulia/riwayat" className="quick-action-btn"><span className="qa-icon">🔍</span> Cek Status</Link>
        <button className="quick-action-btn" type="button" onClick={() => setActiveModal('pengumuman')}><span className="qa-icon">📢</span> Pengumuman</button>
        <button className="quick-action-btn" type="button" onClick={() => setActiveModal('keuangan')}>
          <span className="qa-icon">💰</span> Keuangan {unpaidCount > 0 && <span style={{background:'#FF9800',color:'white',padding:'2px 6px',borderRadius:'6px',fontSize:'var(--text-xs)'}}>{unpaidCount}</span>}
        </button>
        <button className="quick-action-btn" type="button" onClick={() => setActiveModal('darurat')}><span className="qa-icon">🚨</span> Darurat</button>
        <button className="quick-action-btn" type="button" onClick={() => setActiveModal('jadwal')}><span className="qa-icon">📅</span> Jadwal</button>
        <button className="quick-action-btn" type="button" onClick={() => setActiveModal('perpustakaan')}><span className="qa-icon">📖</span> Perpustakaan</button>
        <button className="quick-action-btn" type="button" onClick={() => setActiveModal('direktori')}><span className="qa-icon">🏢</span> Direktori</button>
        <button className="quick-action-btn" type="button" onClick={() => setActiveModal('elearning')}><span className="qa-icon">📚</span> E-Learning</button>
      </div>

      {/* Service Grid */}
      <section className={`section ${isLoaded ? 'anim-fade-up delay-6' : ''}`}>
        <div className="section-header"><h3>Layanan Kampus</h3></div>
        <div className="service-grid">
          {services.map((svc, idx) => (
            svc.modal ? (
              <button key={svc.name} className={`service-card ${isLoaded ? 'anim-scale-in' : ''}`} style={{animationDelay: `${0.4 + idx * 0.05}s`}} type="button" onClick={() => setActiveModal(svc.modal)}>
                <div className="svc-icon" style={{ background: svc.bg }}>{svc.icon}</div>
                <span className="svc-name">{svc.name}</span>
              </button>
            ) : (
              <Link key={svc.name} href={svc.href!} className={`service-card ${isLoaded ? 'anim-scale-in' : ''}`} style={{animationDelay: `${0.4 + idx * 0.05}s`}}>
                <div className="svc-icon" style={{ background: svc.bg }}>{svc.icon}</div>
                <span className="svc-name">{svc.name}</span>
              </Link>
            )
          ))}
        </div>
      </section>

      {/* Pengumuman Terbaru */}
      <section className={`section ${isLoaded ? 'anim-slide-left delay-7' : ''}`}>
        <div className="section-header">
          <h3>Pengumuman Terbaru</h3>
          <button style={{border:'none',background:'none',color:'var(--accent)',fontSize:'var(--text-sm)',fontWeight:'var(--fw-bold)',cursor:'pointer'}} onClick={() => setActiveModal('pengumuman')}>Lihat Semua</button>
        </div>
        <div className="announce-list">
          {announcements.slice(0, 3).map((ann, idx) => (
            <div key={ann.id} className={`announce-card ${ann.urgent ? 'urgent' : ''} ${isLoaded ? 'anim-fade-up' : ''}`} style={{animationDelay: `${0.5 + idx * 0.1}s`}}>
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
      <section className={`section ${isLoaded ? 'anim-slide-right delay-8' : ''}`}>
        <div className="section-header">
          <h3>Jadwal Mendatang</h3>
          <button style={{border:'none',background:'none',color:'var(--accent)',fontSize:'12px',fontWeight:700,cursor:'pointer'}} onClick={() => setActiveModal('jadwal')}>Lihat Semua</button>
        </div>
        <div className="schedule-list">
          {defaultSchedule.slice(0, 3).map((sch, i) => (
            <div key={i} className={`schedule-item ${isLoaded ? 'anim-fade-up' : ''}`} style={{animationDelay: `${0.6 + i * 0.1}s`}}>
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
        <section className={`section ${isLoaded ? 'anim-fade-up delay-9' : ''}`}>
          <div className="section-header">
            <h3>Laporan Terakhir</h3>
            <Link href="/lapor_mulia/riwayat" style={{fontSize:'var(--text-sm)',color:'var(--accent)',fontWeight:'var(--fw-bold)'}}>Lihat Semua</Link>
          </div>
          <div className="service-grid-modern">
            {recentReports.map((report, idx) => (
              <button
                key={report.ticket}
                className={`service-card-detailed ${isLoaded ? 'anim-scale-in' : ''}`}
                style={{animationDelay: `${0.7 + idx * 0.08}s`}}
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
        <div style={{marginBottom:12,padding:12,background:'#FFF3E0',borderRadius:12,fontSize:'var(--text-sm)',fontWeight:'var(--fw-bold)'}}>
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
          <div style={{fontWeight:'var(--fw-bold)',fontSize:'var(--text-base)',marginBottom:8}}>Jam Operasional</div>
          <div style={{fontSize:'var(--text-sm)',color:'var(--muted)',lineHeight:'var(--lh-relaxed)'}}>
            Senin - Jumat: 08:00 - 16:00<br/>
            Sabtu: 08:00 - 12:00<br/>
            Minggu & Hari Libur: Tutup
          </div>
        </div>
        <div style={{marginBottom:16}}>
          <div style={{fontWeight:'var(--fw-bold)',fontSize:'var(--text-base)',marginBottom:8}}>Buku Sedang Dipinjam</div>
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
          <div style={{fontWeight:'var(--fw-bold)',fontSize:'var(--text-base)',marginBottom:8}}>Cari Buku</div>
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

      <ReportDetailModal
        isOpen={!!showReportDetail}
        report={showReportDetail}
        onClose={() => setShowReportDetail(null)}
      />
    </>
  );
}


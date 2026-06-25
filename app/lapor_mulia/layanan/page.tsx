'use client';

import { useMemo, useState } from 'react';
import { defaultContacts, defaultSchedule, defaultAnnouncements, defaultBilling } from '../lib/constants';
import type { ModalType } from '../lib/types';

const allServices = [
  { icon: '📢', name: 'Pengumuman', modal: 'pengumuman' as ModalType, bg: '#E3F2FD', desc: 'Info & pengumuman kampus', category: 'Informasi' },
  { icon: '📋', name: 'Pengaduan', modal: null, href: '/lapor_mulia/lapor', bg: '#FDF2F4', desc: 'Laporkan masalah kampus', category: 'Laporan' },
  { icon: '💰', name: 'Keuangan', modal: 'keuangan' as ModalType, bg: '#FFF3E0', desc: 'Tagihan & pembayaran', category: 'Keuangan' },
  { icon: '🚨', name: 'Darurat', modal: 'darurat' as ModalType, bg: '#FFEBEE', desc: 'Kontak darurat kampus', category: 'Darurat' },
  { icon: '📅', name: 'Jadwal', modal: 'jadwal' as ModalType, bg: '#E8F5E9', desc: 'Jadwal akademik', category: 'Akademik' },
  { icon: '📖', name: 'Perpustakaan', modal: 'perpustakaan' as ModalType, bg: '#F3E5F5', desc: 'Pinjam & cari buku', category: 'Akademik' },
  { icon: '🏢', name: 'Direktori', modal: 'direktori' as ModalType, bg: '#E0F7FA', desc: 'Nomor kontak unit', category: 'Informasi' },
  { icon: '📚', name: 'E-Learning', modal: 'elearning' as ModalType, bg: '#FBE9E7', desc: 'Mata kuliah online', category: 'Akademik' },
  { icon: '🎓', name: 'Akademik', modal: null, bg: '#E8EAF6', desc: 'Nilai & transkrip', category: 'Akademik' },
  { icon: '💳', name: 'Pembayaran', modal: 'keuangan' as ModalType, bg: '#FFF8E1', desc: 'Bayar tagihan online', category: 'Keuangan' },
  { icon: '🏥', name: 'Kesehatan', modal: 'darurat' as ModalType, bg: '#F1F8E9', desc: 'Layanan klinik kampus', category: 'Darurat' },
  { icon: '🚌', name: 'Transportasi', modal: null, bg: '#E0F2F1', desc: 'Info shuttle kampus', category: 'Informasi' },
];

const categories = ['Semua', 'Akademik', 'Keuangan', 'Darurat', 'Informasi', 'Laporan'];

export default function LayananPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const filtered = useMemo(() => {
    return allServices.filter((s) => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.desc.toLowerCase().includes(search.toLowerCase());
      const matchCat = activeCategory === 'Semua' || s.category === activeCategory;
      return matchSearch && matchCat;
    });
  }, [search, activeCategory]);

  return (
    <>
      {/* Page Banner */}
      <div className="layanan-banner">
        <div className="layanan-banner-icon">📋</div>
        <div className="layanan-banner-content">
          <h1>Layanan Kampus</h1>
          <p>Akses semua layanan Universitas Mulia dalam satu tempat</p>
        </div>
        <div className="layanan-banner-stats">
          <div>
            <strong>{allServices.length}</strong>
            <span>Layanan</span>
          </div>
          <div>
            <strong>{filtered.length}</strong>
            <span>Tersedia</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <section className="section">
        <div className="search-bar-modern">
          <div className="search-icon">🔍</div>
          <input 
            type="text" 
            placeholder="Cari layanan kampus..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')}>✕</button>
          )}
        </div>
      </section>

      {/* Category Filter */}
      <section className="section" style={{marginTop: 0}}>
        <div className="category-filter-grid">
          {categories.map((cat) => {
            const icons = {
              'Semua': '📋',
              'Akademik': '📚',
              'Keuangan': '💰',
              'Darurat': '🚨',
              'Informasi': '📢',
              'Laporan': '📝'
            };
            const count = cat === 'Semua' ? allServices.length : allServices.filter(s => s.category === cat).length;
            return (
              <button 
                key={cat} 
                className={`category-filter-card ${activeCategory === cat ? 'active' : ''}`} 
                onClick={() => setActiveCategory(cat)}
              >
                <div className="category-filter-icon">{icons[cat as keyof typeof icons]}</div>
                <div className="category-filter-label">{cat}</div>
                <div className="category-filter-count">{count}</div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <h3>{activeCategory === 'Semua' ? 'Semua Layanan' : `Layanan ${activeCategory}`}</h3>
          <span className="section-count">{filtered.length} layanan</span>
        </div>

        {filtered.length > 0 ? (
          <div className="layanan-grid-simple">
            {filtered.map((svc) => (
              svc.modal ? (
                <button key={svc.name} className="layanan-card-simple" type="button" onClick={() => setActiveModal(svc.modal)}>
                  <div className="layanan-card-icon" style={{ background: svc.bg }}>{svc.icon}</div>
                  <div className="layanan-card-content">
                    <div className="layanan-card-name">{svc.name}</div>
                    <div className="layanan-card-desc">{svc.desc}</div>
                  </div>
                  <div className="layanan-card-arrow">›</div>
                </button>
              ) : (
                <a key={svc.name} href={svc.href || '#'} className="layanan-card-simple">
                  <div className="layanan-card-icon" style={{ background: svc.bg }}>{svc.icon}</div>
                  <div className="layanan-card-content">
                    <div className="layanan-card-name">{svc.name}</div>
                    <div className="layanan-card-desc">{svc.desc}</div>
                  </div>
                  <div className="layanan-card-arrow">›</div>
                </a>
              )
            ))}
          </div>
        ) : (
          <div className="empty-state-modern">
            <div className="empty-state-icon">🔍</div>
            <h3>Tidak Ada Layanan</h3>
            <p>Layanan yang Anda cari tidak ditemukan</p>
            <button className="btn-primary" onClick={() => { setSearch(''); setActiveCategory('Semua'); }}>Tampilkan Semua</button>
          </div>
        )}
      </section>

      {/* Modals */}
      {activeModal === 'pengumuman' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>📢 Pengumuman</h3><button className="modal-close" onClick={() => setActiveModal(null)}>✕</button></div>
            <div className="announce-list">
              {defaultAnnouncements.map((ann) => (
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
          </div>
        </div>
      )}

      {activeModal === 'keuangan' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>💰 Keuangan</h3><button className="modal-close" onClick={() => setActiveModal(null)}>✕</button></div>
            <div className="billing-list">
              {defaultBilling.map((b) => (
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
          </div>
        </div>
      )}

      {activeModal === 'darurat' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>🚨 Kontak Darurat</h3><button className="modal-close" onClick={() => setActiveModal(null)}>✕</button></div>
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
          </div>
        </div>
      )}

      {activeModal === 'jadwal' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>📅 Jadwal Akademik</h3><button className="modal-close" onClick={() => setActiveModal(null)}>✕</button></div>
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
          </div>
        </div>
      )}

      {activeModal === 'perpustakaan' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>📖 Perpustakaan</h3><button className="modal-close" onClick={() => setActiveModal(null)}>✕</button></div>
            <div style={{marginBottom:16}}>
              <div style={{fontWeight:700,fontSize:14,marginBottom:8}}>Jam Operasional</div>
              <div style={{fontSize:13,color:'var(--muted)',lineHeight:1.6}}>
                Senin - Jumat: 08:00 - 16:00<br/>
                Sabtu: 08:00 - 12:00<br/>
                Minggu & Hari Libur: Tutup
              </div>
            </div>
            <div>
              <div style={{fontWeight:700,fontSize:14,marginBottom:8}}>Cari Buku</div>
              <div className="search-bar">
                <input type="text" placeholder="Judul buku atau ISBN..." />
                <button type="button">Cari</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'direktori' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>🏢 Direktori Kampus</h3><button className="modal-close" onClick={() => setActiveModal(null)}>✕</button></div>
            <div className="contact-list">
              {[
                { name: 'BAAK', role: 'Biro Administrasi Akademik', phone: '(0541) 765-4322', icon: '📚' },
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
          </div>
        </div>
      )}

      {activeModal === 'elearning' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>📚 E-Learning</h3><button className="modal-close" onClick={() => setActiveModal(null)}>✕</button></div>
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
          </div>
        </div>
      )}
    </>
  );
}

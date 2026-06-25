import type { Announcement, BillingItem, ContactItem, ReportFormState, ReportStatus, ScheduleItem } from './types';

export const STORAGE_KEY = 'muliaLaporReportsFull';
export const ANNOUNCEMENT_KEY = 'muliaAnnouncements';
export const BILLING_KEY = 'muliaBilling';

export const categories = [
  { name: 'Fasilitas', icon: '🪑', desc: 'AC, kursi, LCD, toilet', color: '#1E88E5' },
  { name: 'Kebersihan', icon: '🧹', desc: 'Sampah, ruang kotor', color: '#4CAF50' },
  { name: 'Bullying', icon: '🛡️', desc: 'Perundungan, intimidasi', color: '#E53935' },
  { name: 'Keamanan', icon: '🚨', desc: 'Kehilangan, area rawan', color: '#FF9800' },
  { name: 'Sistem', icon: '💻', desc: 'Portal, absensi, akun', color: '#7B1FA2' },
  { name: 'Layanan', icon: '🏢', desc: 'Admin, informasi, antrean', color: '#00897B' },
  { name: 'Lingkungan', icon: '🌿', desc: 'Parkir, kantin, lampu', color: '#43A047' },
  { name: 'Lainnya', icon: '✍️', desc: 'Masalah lain', color: '#546E7A' },
];

export const priorities = ['Rendah', 'Sedang', 'Tinggi', 'Darurat'];
export const statuses: ReportStatus[] = ['Terkirim', 'Diproses', 'Selesai', 'Ditolak'];

export const defaultAnnouncements: Announcement[] = [
  { id: 1, title: 'Pemadaman Listrik Gedung A', content: 'Akan ada pemadaman listrik di Gedung A pada tanggal 23 Juni 2026 dari jam 08:00-12:00. Harap persiapkan diri.', date: '21 Jun 2026', urgent: true, author: 'Rektorat' },
  { id: 2, title: 'Jadwal UTS Semester Ganjil', content: 'Jadwal UTS telah dirilis. Silakan cek portal akademik untuk detail lengkap setiap mata kuliah.', date: '20 Jun 2026', urgent: false, author: 'Akademik' },
  { id: 3, title: 'Pendaftaran Organisasi Mahasiswa', content: 'Pendaftaran organisasi mahasiswa baru dibuka hingga 30 Juni 2026. Daftar di BEM atau sekretariat.', date: '19 Jun 2026', urgent: false, author: 'Kemahasiswaan' },
  { id: 4, title: 'Workshop Penulisan Ilmiah', content: 'Workshop penulisan ilmiah akan diadakan pada 25 Juni 2026 di Aula Utama. Terbuka untuk semua mahasiswa.', date: '18 Jun 2026', urgent: false, author: 'LPPM' },
];

export const defaultBilling: BillingItem[] = [
  { id: 1, name: 'SPP Semester Ganjil 2026', amount: 'Rp 7.500.000', status: 'Lunas', dueDate: '15 Jul 2026' },
  { id: 2, name: 'Biaya Praktikum', amount: 'Rp 500.000', status: 'Belum Bayar', dueDate: '30 Jun 2026' },
  { id: 3, name: 'Asuransi Mahasiswa', amount: 'Rp 150.000', status: 'Lunas', dueDate: '01 Jul 2026' },
];

export const defaultSchedule: ScheduleItem[] = [
  { date: '23 Jun', event: 'Pendaftaran UTS', location: 'Portal Akademik' },
  { date: '25 Jun', event: 'Batas Pengumpulan Tugas', location: 'Online' },
  { date: '01 Jul', event: 'Libur Semester', location: 'Kampus' },
  { date: '15 Jul', event: 'Pembayaran SPP', location: 'Bank / Online' },
];

export const defaultContacts: ContactItem[] = [
  { name: 'Security Kampus', phone: '0812-3456-7890', role: 'Keamanan 24 Jam', icon: '🛡️' },
  { name: 'Klinik Kampus', phone: '0813-4567-8901', role: 'Layanan Kesehatan', icon: '🏥' },
  { name: 'Rektorat', phone: '(0541) 765-4321', role: 'Informasi Umum', icon: '🏛️' },
  { name: 'BAAK', phone: '(0541) 765-4322', role: 'Akademik', icon: '📚' },
];

export const initialForm: ReportFormState = {
  category: '',
  priority: '',
  location: '',
  title: '',
  description: '',
  anonymous: false,
  agree: false,
  name: '',
  contact: '',
};

export const heroImages = ['/images.jpg', '/images (1).jpg', '/MULIA2-1.jpg'];

export function getStatusColor(status: ReportStatus) {
  if (status === 'Diproses') return '#FF9800';
  if (status === 'Selesai') return '#4CAF50';
  if (status === 'Ditolak') return '#E53935';
  return '#1E88E5';
}

export function getStatusStep(status: ReportStatus) {
  if (status === 'Terkirim') return 1;
  if (status === 'Diproses') return 2;
  if (status === 'Selesai') return 3;
  return 0;
}

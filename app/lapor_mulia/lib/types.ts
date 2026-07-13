export type ReportStatus = 'Terkirim' | 'Diproses' | 'Selesai' | 'Ditolak';
export type MessageType = 'success' | 'error' | '';
export type ModalType = 'pengumuman' | 'keuangan' | 'darurat' | 'jadwal' | 'perpustakaan' | 'direktori' | 'elearning' | 'notifikasi' | 'pengaturan' | 'bantuan' | null;

export type Report = {
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
  userId?: string;
};

export type ReportFormState = {
  category: string;
  priority: string;
  location: string;
  title: string;
  description: string;
  anonymous: boolean;
  agree: boolean;
  name: string;
  contact: string;
};

export type Announcement = {
  id: number;
  title: string;
  content: string;
  date: string;
  urgent: boolean;
  author: string;
};

export type BillingItem = {
  id: number;
  name: string;
  amount: string;
  status: 'Lunas' | 'Belum Bayar' | 'Jatuh Tempo';
  dueDate: string;
};

export type ScheduleItem = {
  date: string;
  event: string;
  location: string;
};

export type ContactItem = {
  name: string;
  phone: string;
  role: string;
  icon: string;
};

export type ForumReply = {
  id: string;
  author: string;
  avatar: string;
  message: string;
  timestamp: string;
  likes: number;
  likedBy: string[];
};

export type ForumMessage = {
  id: string;
  author: string;
  avatar: string;
  message: string;
  timestamp: string;
  likes: number;
  likedBy: string[];
  replies: ForumReply[];
  isPinned?: boolean;
  starredBy?: string[];
  // Field untuk laporan
  reportId?: string;
  reportCategory?: string;
  reportPriority?: string;
  reportStatus?: string;
  reportLocation?: string;
  isReport?: boolean;
};

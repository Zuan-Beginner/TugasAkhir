import { STORAGE_KEY, ANNOUNCEMENT_KEY, BILLING_KEY, DRAFT_KEY, defaultAnnouncements, defaultBilling } from './constants';
import type { Announcement, BillingItem, ForumMessage, Report, ReportFormState } from './types';

export function createTicketNumber() {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ML-${new Date().getFullYear()}-${random}`;
}

export function getReports(): Report[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function saveReports(reports: Report[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

export function getReportsByUserId(userId: string): Report[] {
  return getReports().filter(r => r.userId === userId);
}

export function getAllReports(): Report[] {
  return getReports();
}

export function getAnnouncements(): Announcement[] {
  if (typeof window === 'undefined') return defaultAnnouncements;
  try {
    const saved = window.localStorage.getItem(ANNOUNCEMENT_KEY);
    return saved ? JSON.parse(saved) : defaultAnnouncements;
  } catch {
    return defaultAnnouncements;
  }
}

export function getBilling(): BillingItem[] {
  if (typeof window === 'undefined') return defaultBilling;
  try {
    const saved = window.localStorage.getItem(BILLING_KEY);
    return saved ? JSON.parse(saved) : defaultBilling;
  } catch {
    return defaultBilling;
  }
}

export function saveBilling(billing: BillingItem[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(BILLING_KEY, JSON.stringify(billing));
}

export function getDraft(): ReportFormState | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = window.localStorage.getItem(DRAFT_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export function saveDraft(form: ReportFormState) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
}

export function clearDraft() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(DRAFT_KEY);
}

// Forum functions
const FORUM_KEY = 'muliaForumMessages';

export function getForumMessages(): ForumMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = window.localStorage.getItem(FORUM_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function saveForumMessages(messages: ForumMessage[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(FORUM_KEY, JSON.stringify(messages));
}

export function createForumPostFromReport(report: Report, avatar?: string): ForumMessage {
  return {
    id: `report-${report.ticket}`,
    author: report.name,
    avatar: avatar || '👤',
    message: report.description,
    timestamp: report.createdAt,
    likes: 0,
    likedBy: [],
    replies: [],
    isReport: true,
    reportId: report.ticket,
    reportCategory: report.category,
    reportPriority: report.priority,
    reportStatus: report.status,
    reportLocation: report.location,
  };
}

export function syncReportsToForum(reports: Report[]) {
  const forumMessages = getForumMessages();
  const existingReportIds = new Set(
    forumMessages.filter(m => m.isReport && m.reportId).map(m => m.reportId)
  );

  const newForumPosts = reports
    .filter(r => !existingReportIds.has(r.ticket))
    .map(r => createForumPostFromReport(r));

  if (newForumPosts.length > 0) {
    saveForumMessages([...newForumPosts, ...forumMessages]);
  }
}

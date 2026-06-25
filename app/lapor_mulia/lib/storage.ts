import { STORAGE_KEY, ANNOUNCEMENT_KEY, BILLING_KEY, defaultAnnouncements, defaultBilling } from './constants';
import type { Announcement, BillingItem, Report } from './types';

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

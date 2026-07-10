'use client';

import { useState, useEffect } from 'react';
import { Modal } from '.';
import type { Report, ReportStatus } from '../lib/types';
import { getStatusColor, getStatusStep } from '../lib/constants';

type ReportDetailModalProps = {
  isOpen: boolean;
  report: Report | null;
  onClose: () => void;
};

export default function ReportDetailModal({ isOpen, report, onClose }: ReportDetailModalProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoaded(true);
    } else {
      setIsLoaded(false);
    }
  }, [isOpen]);

  if (!report) return null;

  return (
    <>
      <style>{`
        .report-detail-header {
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid var(--border);
        }
        .report-detail-ticket {
          font-size: 12px;
          font-weight: 700;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }
        .report-detail-title {
          font-size: 24px;
          font-weight: 800;
          color: var(--text);
          margin-bottom: 12px;
          line-height: 1.3;
        }
        .report-detail-status {
          font-size: 14px;
          font-weight: 700;
          color: var(--accent);
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: var(--primary-light);
          border-radius: 8px;
          width: fit-content;
        }
        .report-detail-body {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .report-detail-section {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }
        .report-detail-section:nth-child(1) { animation-delay: 0.1s; }
        .report-detail-section:nth-child(2) { animation-delay: 0.2s; }
        .report-detail-section:nth-child(3) { animation-delay: 0.3s; }
        .report-detail-section:nth-child(4) { animation-delay: 0.4s; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .report-detail-section-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          opacity: 0.7;
        }
        .report-detail-desc {
          font-size: 14px;
          color: var(--text);
          line-height: 1.6;
          padding: 12px;
          background: var(--bg-card);
          border-radius: 8px;
          border-left: 3px solid var(--primary);
        }
        .report-detail-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .report-detail-info-item {
          padding: 12px;
          background: var(--bg-card);
          border-radius: 8px;
          border: 1px solid var(--border);
          transition: all 0.3s ease;
        }
        .report-detail-info-item:hover {
          border-color: var(--primary);
          box-shadow: 0 4px 12px rgba(123, 16, 35, 0.08);
        }
        .report-detail-info-label {
          font-size: 11px;
          font-weight: 700;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }
        .report-detail-info-value {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
        }
        .timeline {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 16px;
        }
        .timeline-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
        }
        .timeline-dot {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--bg-card);
          border: 2px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 700;
          color: var(--text);
          transition: all 0.4s ease;
          margin-bottom: 8px;
        }
        .timeline-dot.active {
          background: linear-gradient(135deg, var(--primary), var(--accent));
          color: white;
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(123, 16, 35, 0.1);
          animation: pulse 2s infinite;
        }
        .timeline-dot.done {
          background: var(--success);
          color: white;
          border-color: var(--success);
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .timeline-line {
          flex: 1;
          height: 2px;
          background: var(--border);
          margin: 0 -4px;
          margin-top: -48px;
          margin-bottom: 8px;
          transition: all 0.4s ease;
        }
        .timeline-line.active {
          background: linear-gradient(90deg, var(--primary), var(--accent));
        }
        .timeline-line.done {
          background: var(--success);
        }
        .timeline-label {
          font-size: 12px;
          font-weight: 700;
          color: var(--text);
          text-align: center;
        }
        .report-notice {
          padding: 12px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          animation: fadeInUp 0.6s ease-out 0.4s forwards;
          opacity: 0;
        }
        .report-notice.rejected {
          background: #FFEBEE;
          color: var(--danger);
        }
        .report-notice.completed {
          background: #E8F5E9;
          color: var(--success);
        }
      `}</style>

      <Modal isOpen={isOpen} onClose={onClose} title="" icon="">
        {report && (
          <>
            {/* Detail Header */}
            <div className="report-detail-header">
              <div className="report-detail-ticket">{report.ticket}</div>
              <div className="report-detail-title">{report.title}</div>
              <div className="report-detail-status">
                {report.status === 'Terkirim' && '📨'}
                {report.status === 'Diproses' && '⏳'}
                {report.status === 'Selesai' && '✅'}
                {report.status === 'Ditolak' && '❌'}
                {' '}{report.status}
              </div>
            </div>

            {/* Detail Body */}
            <div className="report-detail-body">
              {/* Deskripsi */}
              <div className="report-detail-section">
                <div className="report-detail-section-title">Deskripsi</div>
                <div className="report-detail-desc">{report.description}</div>
              </div>

              {/* Info Grid */}
              <div className="report-detail-section">
                <div className="report-detail-section-title">Informasi</div>
                <div className="report-detail-info">
                  <div className="report-detail-info-item">
                    <div className="report-detail-info-label">Kategori</div>
                    <div className="report-detail-info-value">📂 {report.category}</div>
                  </div>
                  <div className="report-detail-info-item">
                    <div className="report-detail-info-label">Urgensi</div>
                    <div className="report-detail-info-value">
                      {report.priority === 'Darurat' && '🔴'}
                      {report.priority === 'Tinggi' && '🟠'}
                      {report.priority === 'Sedang' && '🟡'}
                      {report.priority === 'Rendah' && '🟢'}
                      {' '}{report.priority}
                    </div>
                  </div>
                  <div className="report-detail-info-item">
                    <div className="report-detail-info-label">Lokasi</div>
                    <div className="report-detail-info-value">📍 {report.location}</div>
                  </div>
                  <div className="report-detail-info-item">
                    <div className="report-detail-info-label">Pelapor</div>
                    <div className="report-detail-info-value">👤 {report.name}</div>
                  </div>
                  <div className="report-detail-info-item" style={{ gridColumn: '1/-1' }}>
                    <div className="report-detail-info-label">Kontak</div>
                    <div className="report-detail-info-value">📞 {report.contact}</div>
                  </div>
                  <div className="report-detail-info-item" style={{ gridColumn: '1/-1' }}>
                    <div className="report-detail-info-label">Tanggal</div>
                    <div className="report-detail-info-value">📅 {report.createdAt}</div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="report-detail-section">
                <div className="report-detail-section-title">Status Timeline</div>
                <div className="timeline">
                  {(['Terkirim', 'Diproses', 'Selesai'] as ReportStatus[]).map((s, i) => {
                    const current = getStatusStep(report.status);
                    const step = i + 1;
                    return (
                      <div key={s} className="timeline-step">
                        <div className={`timeline-dot ${step < current ? 'done' : step === current ? 'active' : ''}`}>
                          {step < current ? '✓' : step}
                        </div>
                        {i < 2 && <div className={`timeline-line ${step < current ? 'done' : step === current ? 'active' : ''}`} />}
                        <div className="timeline-label">{s}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Notices */}
              {report.status === 'Ditolak' && (
                <div className="report-notice rejected">
                  ❌ Laporan ditolak oleh admin. Silakan hubungi BAAK untuk informasi lebih lanjut.
                </div>
              )}

              {report.status === 'Selesai' && (
                <div className="report-notice completed">
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

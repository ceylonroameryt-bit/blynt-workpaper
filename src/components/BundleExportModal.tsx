import React from 'react';
import { Download, X, FileText, CheckCircle2, ShieldCheck, Printer } from 'lucide-react';
import { ClientEngagement, WorkpaperInstance } from '../types';

interface BundleExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  engagement: ClientEngagement;
  workpapers: WorkpaperInstance[];
}

export const BundleExportModal: React.FC<BundleExportModalProps> = ({
  isOpen,
  onClose,
  engagement,
  workpapers,
}) => {
  if (!isOpen) return null;

  const handleDownloadJSON = () => {
    const bundleData = {
      engagement,
      exportedAt: new Date().toISOString(),
      workpapers,
    };
    const blob = new Blob([JSON.stringify(bundleData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${engagement.clientName.replace(/\s+/g, '_')}_Audit_Bundle_FY2026.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 110,
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '650px',
          backgroundColor: '#0f172a',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
              <Download size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
                Export Audit Workpaper Bundle
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                Complete assembled engagement binder with digital signatures &amp; tick-marks
              </div>
            </div>
          </div>

          <button onClick={onClose} style={{ color: '#94a3b8' }}>
            <X size={18} />
          </button>
        </div>

        {/* Bundle Summary */}
        <div style={{ padding: '0.85rem', backgroundColor: '#0d1424', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
            {engagement.clientName} · {engagement.periodLabel}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Framework: {engagement.framework} · Assembly Window: {engagement.framework === 'US_GAAS' ? '14 Days (PCAOB AS 1215)' : '60 Days (ISA 230)'}
          </div>

          <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {workpapers.map((wp) => (
              <div key={wp.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#cbd5e1' }}>
                <span>
                  <strong style={{ color: '#93c5fd', fontFamily: 'var(--font-mono)' }}>WP {wp.refCode}</strong>: {wp.title}
                </span>
                <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>
                  {wp.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button
            onClick={() => window.print()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 1rem',
              borderRadius: '6px',
              backgroundColor: '#1e293b',
              color: '#e2e8f0',
              border: '1px solid #334155',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            <Printer size={15} />
            <span>Print / PDF View</span>
          </button>

          <button
            onClick={handleDownloadJSON}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 1.1rem',
              borderRadius: '6px',
              backgroundColor: 'var(--accent-blue)',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 700,
            }}
          >
            <Download size={15} />
            <span>Download JSON Bundle</span>
          </button>
        </div>
      </div>
    </div>
  );
};

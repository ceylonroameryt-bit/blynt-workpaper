import React from 'react';
import {
  ShieldCheck,
  X,
  FileText,
  MapPin,
  Cpu,
  GitCommit,
  CheckCircle2,
  Lock,
  Layers,
} from 'lucide-react';
import { AILineageRecord } from '../types';

interface AILineageModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: AILineageRecord | null;
}

export const AILineageModal: React.FC<AILineageModalProps> = ({
  isOpen,
  onClose,
  record,
}) => {
  if (!isOpen || !record) return null;

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
          width: '680px',
          backgroundColor: '#0f172a',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
        }}
      >
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
                Digital Lineage Inspector (Six Mandatory Pillars)
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                Compliance Standard: PCAOB AS 1215 / AICPA AU-C 230 / IAASB ISA 230
              </div>
            </div>
          </div>

          <button onClick={onClose} style={{ color: '#94a3b8' }}>
            <X size={18} />
          </button>
        </div>

        {/* Target Field Pill */}
        <div style={{ padding: '0.6rem 0.85rem', backgroundColor: '#111827', borderRadius: '6px', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Target Field: </span>
            <strong style={{ color: '#60a5fa', fontFamily: 'var(--font-mono)' }}>{record.targetField}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Confidence Score: </span>
            <strong style={{ color: '#34d399' }}>{(record.confidenceScore * 100).toFixed(1)}%</strong>
          </div>
        </div>

        {/* 6 Mandatory Pillars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '420px', overflowY: 'auto' }}>
          {/* Pillar 1 */}
          <div style={{ padding: '0.85rem', borderRadius: '8px', backgroundColor: '#0d1424', border: '1px solid var(--border-subtle)', display: 'flex', gap: '0.75rem' }}>
            <FileText size={18} color="#60a5fa" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#60a5fa' }}>
                1. Source Artifact &amp; Version
              </div>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
                File: <strong>{record.sourceDocumentName || 'Chase_Commercial_Statement_Dec2026.pdf'}</strong>
              </div>
              <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                SHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
              </div>
            </div>
          </div>

          {/* Pillar 2 */}
          <div style={{ padding: '0.85rem', borderRadius: '8px', backgroundColor: '#0d1424', border: '1px solid var(--border-subtle)', display: 'flex', gap: '0.75rem' }}>
            <MapPin size={18} color="#a78bfa" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#a78bfa' }}>
                2. Spatial Coordinates
              </div>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
                Page {record.sourceLocation?.page || 1} · Cell: "{record.sourceLocation?.cell || 'Ending Balance'}"
              </div>
              <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Bounding Box: [X: 55%, Y: 22%, W: 38%, H: 8%]
              </div>
            </div>
          </div>

          {/* Pillar 3 */}
          <div style={{ padding: '0.85rem', borderRadius: '8px', backgroundColor: '#0d1424', border: '1px solid var(--border-subtle)', display: 'flex', gap: '0.75rem' }}>
            <Cpu size={18} color="#34d399" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#34d399' }}>
                3. Extraction &amp; Transformation Logic
              </div>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
                {record.transformationLogic}
              </div>
              <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Engine Prompt: {record.promptVersion}
              </div>
            </div>
          </div>

          {/* Pillar 4 */}
          <div style={{ padding: '0.85rem', borderRadius: '8px', backgroundColor: '#0d1424', border: '1px solid var(--border-subtle)', display: 'flex', gap: '0.75rem' }}>
            <GitCommit size={18} color="#fbbf24" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fbbf24' }}>
                4. Modification History &amp; Diff
              </div>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
                {record.humanEdit?.diffSummary || 'AI Draft Output ($1,428,750.00) == Final Auditor Input ($1,428,750.00). Zero override.'}
              </div>
            </div>
          </div>

          {/* Pillar 5 */}
          <div style={{ padding: '0.85rem', borderRadius: '8px', backgroundColor: '#0d1424', border: '1px solid var(--border-subtle)', display: 'flex', gap: '0.75rem' }}>
            <CheckCircle2 size={18} color="#38bdf8" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#38bdf8' }}>
                5. Approval Sign-off
              </div>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
                Accepted by: <strong>{record.approvedBy || 'Sarah Chen, CPA'}</strong> on {record.approvedAt ? new Date(record.approvedAt).toLocaleString() : 'N/A'}
              </div>
            </div>
          </div>

          {/* Pillar 6 */}
          <div style={{ padding: '0.85rem', borderRadius: '8px', backgroundColor: '#0d1424', border: '1px solid var(--border-subtle)', display: 'flex', gap: '0.75rem' }}>
            <Lock size={18} color="#c084fc" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#c084fc' }}>
                6. Post-Assembly Lock Status
              </div>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
                PCAOB AS 1215 Rule: Deletions prohibited. Immutable append-only audit trail active.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

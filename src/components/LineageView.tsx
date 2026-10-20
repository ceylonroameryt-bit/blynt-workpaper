import React from 'react';
import { ShieldCheck, Lock, CheckCircle2, FileText, Cpu, GitCommit, AlertOctagon, Scale } from 'lucide-react';
import { AILineageRecord, ClientEngagement } from '../types';

interface LineageViewProps {
  engagement: ClientEngagement;
  lineageRecords: AILineageRecord[];
  onInspectRecord: (record: AILineageRecord) => void;
}

export const LineageView: React.FC<LineageViewProps> = ({
  engagement,
  lineageRecords,
  onInspectRecord,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge badge-purple">Regulatory Compliance Engine</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Section 8: Compliance &amp; Digital Lineage
            </span>
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginTop: '0.35rem' }}>
            Audit Evidence Standards &amp; AI Digital Lineage
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Full compliance comparison across PCAOB AS 1215, AICPA AU-C 230, and IAASB ISA 230, enforcing the Experienced Auditor Test.
          </p>
        </div>
      </div>

      {/* Compliance Standards Comparison Table (Section 8) */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Scale size={16} color="#60a5fa" />
            <span>Audit Documentation Standard Comparison</span>
          </div>
        </div>

        <table className="excel-table">
          <thead>
            <tr>
              <th>Standard</th>
              <th>Applies To</th>
              <th>Assembly Window</th>
              <th>Retention Period</th>
              <th>Changes After Assembly</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ background: engagement.framework === 'US_GAAS' ? 'rgba(59, 130, 246, 0.08)' : 'transparent' }}>
              <td style={{ fontWeight: 800, color: '#60a5fa' }}>PCAOB AS 1215</td>
              <td>Public issuers and broker-dealers</td>
              <td style={{ color: '#f87171', fontWeight: 700 }}>14 calendar days after report release</td>
              <td>7 years</td>
              <td>Deletions prohibited; additions need date, author, reviewer, reason</td>
            </tr>
            <tr style={{ background: engagement.framework === 'AICPA' ? 'rgba(59, 130, 246, 0.08)' : 'transparent' }}>
              <td style={{ fontWeight: 800, color: '#34d399' }}>AICPA AU-C 230</td>
              <td>U.S. private non-issuers</td>
              <td style={{ color: '#34d399', fontWeight: 700 }}>60 calendar days after report release</td>
              <td>5 years</td>
              <td>Nothing deleted before retention ends; changes fully tracked</td>
            </tr>
            <tr style={{ background: engagement.framework === 'ISA' ? 'rgba(59, 130, 246, 0.08)' : 'transparent' }}>
              <td style={{ fontWeight: 800, color: '#c084fc' }}>IAASB ISA 230</td>
              <td>International audits</td>
              <td style={{ color: '#c084fc', fontWeight: 700 }}>Ordinarily 60 days after report date</td>
              <td>5 years (local law minimum)</td>
              <td>Deletions prohibited; changes record reasons, personnel, and dates</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Six Mandatory Lineage Pillars Breakdown */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.75rem' }}>
          Six Mandatory Lineage Pillars for AI-Assisted Data Points
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
          <div style={{ padding: '0.85rem', backgroundColor: '#0d1424', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#60a5fa', marginBottom: '0.2rem' }}>1. Source Artifact &amp; Version</div>
            <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>Client file name, SHA-256 hash, and upload timestamp immutably logged.</div>
          </div>
          <div style={{ padding: '0.85rem', backgroundColor: '#0d1424', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#a78bfa', marginBottom: '0.2rem' }}>2. Spatial Coordinates</div>
            <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>Page number, table index, and precise bounding box coordinates [X, Y, W, H].</div>
          </div>
          <div style={{ padding: '0.85rem', backgroundColor: '#0d1424', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#34d399', marginBottom: '0.2rem' }}>3. Extraction &amp; Transformation Logic</div>
            <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>Normalization rules, currency FX factors, and AI model prompt version.</div>
          </div>
          <div style={{ padding: '0.85rem', backgroundColor: '#0d1424', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fbbf24', marginBottom: '0.2rem' }}>4. Modification History (Diff)</div>
            <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>Full diff showing whether an auditor adjusted, verified, or overrode the AI draft.</div>
          </div>
          <div style={{ padding: '0.85rem', backgroundColor: '#0d1424', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.2rem' }}>5. Approval Sign-Off</div>
            <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>User ID, CPA credentials, and exact microsecond timestamp of supervisor acceptance.</div>
          </div>
          <div style={{ padding: '0.85rem', backgroundColor: '#0d1424', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#c084fc', marginBottom: '0.2rem' }}>6. Post-Assembly Lock Log</div>
            <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>Author, timestamp, and written justification for any post-lock changes.</div>
          </div>
        </div>
      </div>

      {/* Active Lineage Records Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>
            Active AI Lineage Records in File ({lineageRecords.length})
          </div>
        </div>

        <table className="excel-table">
          <thead>
            <tr>
              <th>Target Field</th>
              <th>Source Document</th>
              <th>Confidence</th>
              <th>Approved By</th>
              <th>Assembly Lock</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {lineageRecords.map((rec) => (
              <tr key={rec.id}>
                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#93c5fd' }}>
                  {rec.targetField}
                </td>
                <td>{rec.sourceDocumentName}</td>
                <td>
                  <span className="badge badge-purple">{(rec.confidenceScore * 100).toFixed(1)}%</span>
                </td>
                <td>
                  {rec.approvedBy ? (
                    <span style={{ color: '#34d399', fontWeight: 600 }}>✓ {rec.approvedBy}</span>
                  ) : (
                    <span style={{ color: '#fbbf24' }}>Pending Approval</span>
                  )}
                </td>
                <td>
                  <span className="badge badge-green">Enforced</span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    onClick={() => onInspectRecord(rec)}
                    style={{
                      padding: '0.25rem 0.55rem',
                      borderRadius: '4px',
                      backgroundColor: 'var(--accent-blue)',
                      color: '#ffffff',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                    }}
                  >
                    Inspect 6 Pillars
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

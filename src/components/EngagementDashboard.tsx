import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Sparkles,
  FileSpreadsheet,
  RotateCw,
  FolderLock,
  Layers,
  FileCheck,
  TrendingUp,
} from 'lucide-react';
import { ClientEngagement, ReviewNote, TrialBalanceRow, WorkpaperInstance } from '../types';

interface EngagementDashboardProps {
  engagement: ClientEngagement;
  workpapers: WorkpaperInstance[];
  trialBalance: TrialBalanceRow[];
  reviewNotes: ReviewNote[];
  onOpenWorkpaper: (id: string) => void;
  onNavigateToTB: () => void;
  onRollForward: () => void;
}

export const EngagementDashboard: React.FC<EngagementDashboardProps> = ({
  engagement,
  workpapers,
  trialBalance,
  reviewNotes,
  onOpenWorkpaper,
  onNavigateToTB,
  onRollForward,
}) => {
  const totalWps = workpapers.length;
  const preparedWps = workpapers.filter((w) => ['Prepared', 'Reviewed', 'Partner Approved'].includes(w.status)).length;
  const reviewedWps = workpapers.filter((w) => ['Reviewed', 'Partner Approved'].includes(w.status)).length;
  const approvedWps = workpapers.filter((w) => w.status === 'Partner Approved').length;
  const progressPct = Math.round((preparedWps / (totalWps || 1)) * 100);

  const openNotes = reviewNotes.filter((n) => n.status === 'Open').length;
  const unmappedCount = trialBalance.filter((r) => r.mappingStatus !== 'confirmed').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* Top Banner / Hero */}
      <div
        className="glass-panel"
        style={{
          padding: '1.5rem 1.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.25) 0%, rgba(15, 23, 42, 0.9) 100%)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
            <span className="badge badge-blue">V1 Wedge Live</span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Standard: {engagement.framework === 'US_GAAS' ? 'PCAOB AS 1215 / US GAAS' : 'IAASB ISA 230'}
            </span>
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            {engagement.clientName}
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            Audit File Progress: <strong>{progressPct}% Prepared</strong> ({preparedWps}/{totalWps} Workpapers) · Sign-off Lock Enabled
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={onRollForward}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              backgroundColor: '#1e293b',
              color: '#e2e8f0',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.825rem',
              fontWeight: 600,
            }}
            title="One-click Roll-Forward from FY2025"
          >
            <RotateCw size={15} />
            <span>Roll-Forward File</span>
          </button>

          <button
            onClick={onNavigateToTB}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1.1rem',
              borderRadius: '8px',
              backgroundColor: 'var(--accent-blue)',
              color: '#ffffff',
              fontSize: '0.825rem',
              fontWeight: 700,
              boxShadow: '0 2px 10px rgba(59, 130, 246, 0.35)',
            }}
          >
            <FileSpreadsheet size={15} />
            <span>View Trial Balance</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
        {/* Card 1: File Readiness */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              File Completion
            </span>
            <div style={{ padding: '0.35rem', borderRadius: '6px', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
              <TrendingUp size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.5rem' }}>
            {progressPct}%
          </div>
          <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>
            <span>{preparedWps} Prepared</span> ·
            <span>{reviewedWps} Reviewed</span> ·
            <span>{approvedWps} Locked</span>
          </div>
        </div>

        {/* Card 2: Materiality Thresholds */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Audit Materiality
            </span>
            <div style={{ padding: '0.35rem', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <FileCheck size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399', marginTop: '0.5rem' }}>
            ${(engagement.overallMateriality / 1000).toLocaleString()}k
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>
            Tolerable Misstatement: <strong>${(engagement.tolerableMisstatement / 1000).toLocaleString()}k</strong> (50%)
          </div>
        </div>

        {/* Card 3: Tie-out & Plain-Language Breaks */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Formula & Tie-out Health
            </span>
            <div style={{ padding: '0.35rem', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#34d399', marginTop: '0.5rem' }}>
            0 Unadjusted Breaks
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>
            Bank rec, fixed assets, & prepayments formulas tie to GL.
          </div>
        </div>

        {/* Card 4: Review Notes & AI Items */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Open Action Items
            </span>
            <div style={{ padding: '0.35rem', borderRadius: '6px', background: openNotes > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)', color: openNotes > 0 ? '#f87171' : '#60a5fa' }}>
              <AlertTriangle size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: openNotes > 0 ? '#f87171' : '#f8fafc', marginTop: '0.5rem' }}>
            {openNotes} Notes
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>
            {unmappedCount > 0 ? (
              <span style={{ color: '#fbbf24' }}>{unmappedCount} accounts await AI mapping</span>
            ) : (
              <span>All trial balance accounts mapped</span>
            )}
          </div>
        </div>
      </div>

      {/* Workpaper Catalog Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
              Standard Workpaper Catalog (First-Release Wedge)
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Configuration-driven JSON templates executing live calculations, tick-marks, and sign-offs.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <span className="badge badge-blue">Template Engine v1.0</span>
          </div>
        </div>

        <table className="excel-table">
          <thead>
            <tr>
              <th style={{ width: '80px' }}>Ref</th>
              <th>Workpaper Name</th>
              <th>Area</th>
              <th>Category</th>
              <th>Status</th>
              <th>Sign-Offs</th>
              <th>Blocking Items</th>
              <th style={{ textAlign: 'right', width: '100px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {workpapers.map((wp) => {
              const hasCheckBreak = wp.id === 'wp_fixed_assets' && false;
              const hasOpenNote = reviewNotes.some((n) => n.workpaperId === wp.id && n.status === 'Open');

              return (
                <tr key={wp.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#93c5fd' }}>
                    {wp.refCode}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#f1f5f9' }}>{wp.title}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Template: {wp.template_id} (v{wp.template_version})
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>{wp.area}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {wp.template_id.includes('sample') || wp.template_id.includes('analytical') || wp.template_id.includes('confirmation')
                        ? 'Generic Building Block'
                        : 'Lead Schedule'}
                    </span>
                  </td>
                  <td>
                    {wp.status === 'Partner Approved' && <span className="badge badge-purple">Approved</span>}
                    {wp.status === 'Reviewed' && <span className="badge badge-green">Reviewed</span>}
                    {wp.status === 'Prepared' && <span className="badge badge-blue">Prepared</span>}
                    {wp.status === 'In Progress' && <span className="badge badge-amber">In Progress</span>}
                    {wp.status === 'Not Started' && <span className="badge">Not Started</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <span
                        title="Preparer"
                        style={{
                          fontSize: '0.65rem',
                          padding: '0.1rem 0.35rem',
                          borderRadius: '3px',
                          background: wp.signoffs.some((s) => s.role === 'preparer') ? 'rgba(16, 185, 129, 0.2)' : '#1e293b',
                          color: wp.signoffs.some((s) => s.role === 'preparer') ? '#34d399' : '#64748b',
                          fontWeight: 700,
                        }}
                      >
                        P
                      </span>
                      <span
                        title="Reviewer"
                        style={{
                          fontSize: '0.65rem',
                          padding: '0.1rem 0.35rem',
                          borderRadius: '3px',
                          background: wp.signoffs.some((s) => s.role === 'reviewer') ? 'rgba(59, 130, 246, 0.2)' : '#1e293b',
                          color: wp.signoffs.some((s) => s.role === 'reviewer') ? '#60a5fa' : '#64748b',
                          fontWeight: 700,
                        }}
                      >
                        R
                      </span>
                      <span
                        title="Partner"
                        style={{
                          fontSize: '0.65rem',
                          padding: '0.1rem 0.35rem',
                          borderRadius: '3px',
                          background: wp.signoffs.some((s) => s.role === 'partner') ? 'rgba(139, 92, 246, 0.2)' : '#1e293b',
                          color: wp.signoffs.some((s) => s.role === 'partner') ? '#c084fc' : '#64748b',
                          fontWeight: 700,
                        }}
                      >
                        PT
                      </span>
                    </div>
                  </td>
                  <td>
                    {hasOpenNote ? (
                      <span style={{ fontSize: '0.72rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <AlertTriangle size={12} /> 1 Open Review Note
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.72rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <CheckCircle2 size={12} /> Clear
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => onOpenWorkpaper(wp.id)}
                      style={{
                        padding: '0.3rem 0.65rem',
                        borderRadius: '4px',
                        backgroundColor: '#1e293b',
                        color: '#60a5fa',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      <span>Open</span>
                      <ArrowRight size={12} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

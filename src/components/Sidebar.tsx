import React from 'react';
import {
  LayoutDashboard,
  TableProperties,
  FileSpreadsheet,
  FileCheck2,
  FolderOpen,
  MessageSquareWarning,
  FileText,
  BadgeAlert,
  GitBranch,
  CheckCircle2,
  Clock,
  BookOpen,
  ShieldCheck,
} from 'lucide-react';
import { ReviewNote, TrialBalanceRow, WorkpaperInstance } from '../types';

interface SidebarProps {
  currentView: string;
  selectedWorkpaperId: string | null;
  onSelectView: (view: string, workpaperId?: string) => void;
  workpapers: WorkpaperInstance[];
  trialBalance: TrialBalanceRow[];
  reviewNotes: ReviewNote[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  selectedWorkpaperId,
  onSelectView,
  workpapers,
  trialBalance,
  reviewNotes,
}) => {
  const unmappedCount = trialBalance.filter((row) => row.mappingStatus !== 'confirmed').length;
  const openNotesCount = reviewNotes.filter((n) => n.status === 'Open').length;

  const groupedWorkpapers: Record<string, WorkpaperInstance[]> = {};
  workpapers.forEach((wp) => {
    if (!groupedWorkpapers[wp.area]) {
      groupedWorkpapers[wp.area] = [];
    }
    groupedWorkpapers[wp.area].push(wp);
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Partner Approved':
        return <span className="badge badge-purple">Approved</span>;
      case 'Reviewed':
        return <span className="badge badge-green">Reviewed</span>;
      case 'Prepared':
        return <span className="badge badge-blue">Prepared</span>;
      case 'In Progress':
        return <span className="badge badge-amber">In Progress</span>;
      default:
        return <span className="badge" style={{ background: '#334155', color: '#94a3b8' }}>Draft</span>;
    }
  };

  return (
    <aside
      style={{
        width: '270px',
        backgroundColor: '#0d131f',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflowY: 'auto',
      }}
    >
      <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
          Engagement File Index
        </div>
      </div>

      <div style={{ padding: '0.65rem 0.65rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
        {/* Dashboard */}
        <button
          onClick={() => onSelectView('dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.5rem 0.75rem',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: currentView === 'dashboard' ? '#60a5fa' : '#cbd5e1',
            backgroundColor: currentView === 'dashboard' ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <LayoutDashboard size={16} />
            <span>Overview & Dashboard</span>
          </div>
        </button>

        {/* Trial Balance & COA */}
        <button
          onClick={() => onSelectView('trial_balance')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.5rem 0.75rem',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: currentView === 'trial_balance' ? '#60a5fa' : '#cbd5e1',
            backgroundColor: currentView === 'trial_balance' ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <TableProperties size={16} />
            <span>Trial Balance & COA</span>
          </div>
          {unmappedCount > 0 && (
            <span
              style={{
                fontSize: '0.65rem',
                padding: '0.1rem 0.4rem',
                borderRadius: '999px',
                background: 'rgba(245, 158, 11, 0.2)',
                color: '#fbbf24',
                fontWeight: 700,
              }}
            >
              {unmappedCount} auto-map
            </span>
          )}
        </button>

        {/* Adjusting Journal Entries */}
        <button
          onClick={() => onSelectView('aje')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.5rem 0.75rem',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: currentView === 'aje' ? '#60a5fa' : '#cbd5e1',
            backgroundColor: currentView === 'aje' ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <GitBranch size={16} />
            <span>Adjusting Entries (AJEs)</span>
          </div>
        </button>
      </div>

      <div style={{ padding: '0.5rem 1rem 0.25rem', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Standard Workpapers (V1)
      </div>

      {/* Workpaper Areas */}
      <div style={{ flex: 1, padding: '0 0.65rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {Object.entries(groupedWorkpapers).map(([area, wps]) => (
          <div key={area}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.72rem',
                color: '#94a3b8',
                fontWeight: 600,
                padding: '0.2rem 0.5rem',
              }}
            >
              <FolderOpen size={13} color="#64748b" />
              <span>{area}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', marginTop: '0.2rem' }}>
              {wps.map((wp) => {
                const isSelected = currentView === 'workpaper' && selectedWorkpaperId === wp.id;
                return (
                  <button
                    key={wp.id}
                    onClick={() => onSelectView('workpaper', wp.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      padding: '0.45rem 0.65rem',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                      border: isSelected ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
                      textAlign: 'left',
                      transition: 'all 0.1s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            color: isSelected ? '#93c5fd' : '#cbd5e1',
                            background: '#1e293b',
                            padding: '0.1rem 0.3rem',
                            borderRadius: '3px',
                          }}
                        >
                          {wp.refCode}
                        </span>
                        <span
                          style={{
                            fontWeight: isSelected ? 700 : 500,
                            color: isSelected ? '#f8fafc' : '#cbd5e1',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '120px',
                          }}
                          title={wp.title}
                        >
                          {wp.title.split('-')[0].trim()}
                        </span>
                      </div>
                      {getStatusBadge(wp.status)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Auxiliary Sections */}
      <div style={{ padding: '0.65rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
        {/* Document Vault */}
        <button
          onClick={() => onSelectView('documents')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.45rem 0.65rem',
            borderRadius: '6px',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: currentView === 'documents' ? '#60a5fa' : '#cbd5e1',
            backgroundColor: currentView === 'documents' ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={15} />
            <span>Document Vault (4)</span>
          </div>
        </button>

        {/* Review Notes Inbox */}
        <button
          onClick={() => onSelectView('review_notes')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.45rem 0.65rem',
            borderRadius: '6px',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: currentView === 'review_notes' ? '#60a5fa' : '#cbd5e1',
            backgroundColor: currentView === 'review_notes' ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquareWarning size={15} />
            <span>Review Notes</span>
          </div>
          {openNotesCount > 0 && (
            <span
              style={{
                fontSize: '0.65rem',
                padding: '0.1rem 0.4rem',
                borderRadius: '999px',
                background: 'rgba(239, 68, 68, 0.2)',
                color: '#f87171',
                fontWeight: 700,
              }}
            >
              {openNotesCount} open
            </span>
          )}
        </button>

        {/* Digital Lineage & Compliance */}
        <button
          onClick={() => onSelectView('lineage')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.45rem 0.65rem',
            borderRadius: '6px',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: currentView === 'lineage' ? '#60a5fa' : '#cbd5e1',
            backgroundColor: currentView === 'lineage' ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
            textAlign: 'left',
          }}
        >
          <ShieldCheck size={15} />
          <span>Digital Lineage (PCAOB)</span>
        </button>
      </div>
    </aside>
  );
};

import React from 'react';
import {
  ShieldCheck,
  Sparkles,
  SplitSquareVertical,
  History,
  Download,
  Clock,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { ClientEngagement, Framework, UserProfile } from '../types';

interface HeaderProps {
  engagement: ClientEngagement;
  currentUser: UserProfile;
  allUsers: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
  onFrameworkChange: (framework: Framework) => void;
  splitScreen: boolean;
  onToggleSplitScreen: () => void;
  onOpenAIModal: (tab: 'chat' | 'review') => void;
  onOpenAuditLog: () => void;
  onOpenExportModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  engagement,
  currentUser,
  allUsers,
  onSelectUser,
  onFrameworkChange,
  splitScreen,
  onToggleSplitScreen,
  onOpenAIModal,
  onOpenAuditLog,
  onOpenExportModal,
}) => {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.65rem 1.25rem',
        backgroundColor: '#0c111d',
        borderBottom: '1px solid var(--border-subtle)',
        zIndex: 50,
      }}
    >
      {/* Brand & Client Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)',
            }}
          >
            <Layers size={18} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.02em', color: '#ffffff' }}>
                BLYNT
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: '#93c5fd',
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  padding: '0.1rem 0.35rem',
                  borderRadius: '4px',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                }}
              >
                WP STUDIO
              </span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Financial Working Paper Platform
            </div>
          </div>
        </div>

        <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-subtle)' }} />

        {/* Engagement Metadata */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#f1f5f9' }}>
              {engagement.clientName}
            </span>
            <span className="badge badge-blue">{engagement.periodLabel}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            <span>Mat: <strong style={{ color: '#e2e8f0' }}>${(engagement.overallMateriality / 1000).toFixed(0)}k</strong></span>
            <span>·</span>
            <span>Tolerable: <strong style={{ color: '#e2e8f0' }}>${(engagement.tolerableMisstatement / 1000).toFixed(0)}k</strong></span>
          </div>
        </div>
      </div>

      {/* Center: Framework Switcher & Assembly Window Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#111827',
            padding: '0.2rem 0.4rem',
            borderRadius: '6px',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.75rem',
          }}
        >
          <span style={{ color: 'var(--text-muted)', marginRight: '0.4rem', fontSize: '0.7rem', fontWeight: 600 }}>
            FRAMEWORK:
          </span>
          {(['ISA', 'US_GAAS', 'AICPA'] as Framework[]).map((f) => (
            <button
              key={f}
              onClick={() => onFrameworkChange(f)}
              style={{
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.72rem',
                fontWeight: 600,
                color: engagement.framework === f ? '#ffffff' : 'var(--text-muted)',
                backgroundColor: engagement.framework === f ? 'var(--accent-blue)' : 'transparent',
              }}
            >
              {f === 'US_GAAS' ? 'PCAOB / US GAAS' : f}
            </button>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.3rem 0.65rem',
            borderRadius: '6px',
            backgroundColor: engagement.framework === 'US_GAAS' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(59, 130, 246, 0.1)',
            border: `1px solid ${engagement.framework === 'US_GAAS' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.25)'}`,
            fontSize: '0.72rem',
          }}
        >
          <Clock size={13} color={engagement.framework === 'US_GAAS' ? '#f87171' : '#60a5fa'} />
          <span style={{ color: engagement.framework === 'US_GAAS' ? '#fca5a5' : '#93c5fd', fontWeight: 600 }}>
            {engagement.framework === 'US_GAAS' ? '14-Day PCAOB Assembly Window' : '60-Day ISA 230 Assembly Window'}
          </span>
        </div>
      </div>

      {/* Right Controls: Actions & User Persona */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        {/* Split Screen Toggle */}
        <button
          onClick={onToggleSplitScreen}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.4rem 0.75rem',
            borderRadius: '6px',
            fontSize: '0.78rem',
            fontWeight: 600,
            backgroundColor: splitScreen ? 'rgba(59, 130, 246, 0.25)' : '#1e293b',
            color: splitScreen ? '#93c5fd' : '#cbd5e1',
            border: `1px solid ${splitScreen ? '#3b82f6' : 'var(--border-subtle)'}`,
          }}
          title="Toggle Split-Screen Document & Tick-mark Evidence Viewer"
        >
          <SplitSquareVertical size={14} />
          <span>{splitScreen ? 'Split Screen (Active)' : 'Split Evidence'}</span>
        </button>

        {/* AI Assistant */}
        <button
          onClick={() => onOpenAIModal('chat')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.4rem 0.75rem',
            borderRadius: '6px',
            fontSize: '0.78rem',
            fontWeight: 600,
            backgroundColor: 'rgba(139, 92, 246, 0.18)',
            color: '#c084fc',
            border: '1px solid rgba(139, 92, 246, 0.35)',
          }}
        >
          <Sparkles size={14} />
          <span>Ask-the-File</span>
        </button>

        {/* AI Review Assistant */}
        <button
          onClick={() => onOpenAIModal('review')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.4rem 0.75rem',
            borderRadius: '6px',
            fontSize: '0.78rem',
            fontWeight: 600,
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            color: '#34d399',
            border: '1px solid rgba(16, 185, 129, 0.3)',
          }}
        >
          <ShieldCheck size={14} />
          <span>Review Assistant</span>
        </button>

        {/* Audit Log */}
        <button
          onClick={onOpenAuditLog}
          style={{
            padding: '0.45rem',
            borderRadius: '6px',
            backgroundColor: '#1e293b',
            color: '#94a3b8',
            border: '1px solid var(--border-subtle)',
          }}
          title="Append-Only Audit Trail (Section 7)"
        >
          <History size={16} />
        </button>

        {/* Bundle Export */}
        <button
          onClick={onOpenExportModal}
          style={{
            padding: '0.45rem',
            borderRadius: '6px',
            backgroundColor: '#1e293b',
            color: '#94a3b8',
            border: '1px solid var(--border-subtle)',
          }}
          title="Export Audit Workpaper Package"
        >
          <Download size={16} />
        </button>

        <div style={{ width: '1px', height: '22px', backgroundColor: 'var(--border-subtle)' }} />

        {/* Current User Switcher */}
        <div style={{ position: 'relative' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.3rem 0.6rem',
              backgroundColor: '#172033',
              borderRadius: '6px',
              border: '1px solid #334155',
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor:
                  currentUser.role === 'partner'
                    ? '#8b5cf6'
                    : currentUser.role === 'reviewer'
                    ? '#3b82f6'
                    : '#10b981',
                color: '#ffffff',
                fontSize: '0.65rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {currentUser.avatar}
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1.1 }}>
                {currentUser.name.split(',')[0]}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                {currentUser.role.toUpperCase()}
              </div>
            </div>
            <select
              value={currentUser.id}
              onChange={(e) => {
                const found = allUsers.find((u) => u.id === e.target.value);
                if (found) onSelectUser(found);
              }}
              style={{
                opacity: 0,
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                cursor: 'pointer',
              }}
            >
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  Switch to: {u.name} ({u.title})
                </option>
              ))}
            </select>
            <ChevronDown size={12} color="var(--text-muted)" />
          </div>
        </div>
      </div>
    </header>
  );
};

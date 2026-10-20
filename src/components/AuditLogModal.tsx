import React from 'react';
import { History, X, Shield, Clock, User, Filter } from 'lucide-react';
import { AuditLogEntry } from '../types';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AuditLogEntry[];
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({
  isOpen,
  onClose,
  logs,
}) => {
  if (!isOpen) return null;

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
          width: '760px',
          maxHeight: '620px',
          backgroundColor: '#0f172a',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
        }}
      >
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
              <History size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
                Append-Only Audit Trail (Section 7)
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                PostgreSQL RLS Protected · Immutable write-only log (Deletions Prohibited)
              </div>
            </div>
          </div>

          <button onClick={onClose} style={{ color: '#94a3b8' }}>
            <X size={18} />
          </button>
        </div>

        {/* Audit Log Table */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <table className="excel-table">
            <thead>
              <tr>
                <th style={{ width: '130px' }}>Timestamp</th>
                <th style={{ width: '130px' }}>Auditor</th>
                <th style={{ width: '90px' }}>Action</th>
                <th>Entity / Target</th>
                <th>Details &amp; Reason</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td style={{ fontSize: '0.75rem' }}>
                    <strong>{log.userName.split(',')[0]}</strong>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{log.userRole.toUpperCase()}</div>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        padding: '0.15rem 0.35rem',
                        borderRadius: '3px',
                        background:
                          log.action === 'SIGN_OFF'
                            ? 'rgba(16, 185, 129, 0.2)'
                            : log.action === 'AI_ACCEPT'
                            ? 'rgba(139, 92, 246, 0.2)'
                            : '#1e293b',
                        color:
                          log.action === 'SIGN_OFF'
                            ? '#34d399'
                            : log.action === 'AI_ACCEPT'
                            ? '#c084fc'
                            : '#93c5fd',
                      }}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{log.entityName}</span>
                  </td>
                  <td style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                    {log.newValue && <div>{log.newValue}</div>}
                    {log.reason && <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Reason: {log.reason}</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

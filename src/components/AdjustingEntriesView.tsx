import React, { useState } from 'react';
import {
  GitBranch,
  Plus,
  Trash2,
  CheckCircle2,
  AlertOctagon,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { AdjustingEntry, MasterCOAItem, UserProfile } from '../types';
import { formatCurrency } from '../engine/evaluator';

interface AdjustingEntriesViewProps {
  entries: AdjustingEntry[];
  masterCOA: MasterCOAItem[];
  currentUser: UserProfile;
  onCreateEntry: (entry: AdjustingEntry) => void;
  onApproveEntry: (entryId: string) => void;
}

export const AdjustingEntriesView: React.FC<AdjustingEntriesViewProps> = ({
  entries,
  masterCOA,
  currentUser,
  onCreateEntry,
  onApproveEntry,
}) => {
  const [showNewModal, setShowNewModal] = useState(false);
  const [description, setDescription] = useState('');
  const [lines, setLines] = useState([
    { id: '1', accountCode: '1300', description: 'Prepaid Expenses', debit: 12000, credit: 0 },
    { id: '2', accountCode: '6050', description: 'Facilities Expense', debit: 0, credit: 12000 },
  ]);

  const entryDebits = lines.reduce((acc, l) => acc + (parseFloat(l.debit as any) || 0), 0);
  const entryCredits = lines.reduce((acc, l) => acc + (parseFloat(l.credit as any) || 0), 0);
  const diff = Math.abs(entryDebits - entryCredits);
  const isBalanced = diff < 0.01 && entryDebits > 0;

  const handleCreate = () => {
    if (!isBalanced || !description.trim()) return;
    const newEntry: AdjustingEntry = {
      id: `aje_${Date.now()}`,
      reference: `AJE-${entries.length + 1}`,
      date: new Date().toISOString().split('T')[0],
      description,
      status: 'Proposed',
      lines: lines.map((l) => ({
        id: l.id,
        accountCode: l.accountCode,
        description: l.description,
        debit: parseFloat(l.debit as any) || 0,
        credit: parseFloat(l.credit as any) || 0,
      })),
      preparedBy: currentUser.name,
    };
    onCreateEntry(newEntry);
    setShowNewModal(false);
    setDescription('');
  };

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
            <span className="badge badge-purple">Audit Workpapers V1</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Section 7: Adjusting Journal Entries (AJEs)
            </span>
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginTop: '0.35rem' }}>
            Summary of Adjusting Journal Entries (AJEs)
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Proposed adjustments, reclassifications, and unadjusted audit differences with strict debit = credit constraint enforcement.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.55rem 1rem',
            borderRadius: '6px',
            backgroundColor: 'var(--accent-blue)',
            color: '#ffffff',
            fontSize: '0.8rem',
            fontWeight: 700,
          }}
        >
          <Plus size={15} />
          <span>Propose New AJE</span>
        </button>
      </div>

      {/* List of AJEs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {entries.map((entry) => (
          <div key={entry.id} className="glass-panel" style={{ overflow: 'hidden' }}>
            <div
              style={{
                padding: '0.85rem 1.25rem',
                backgroundColor: '#111827',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    color: '#60a5fa',
                    backgroundColor: '#1e293b',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                  }}
                >
                  {entry.reference}
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f8fafc' }}>
                  {entry.description}
                </span>
                <span className={`badge ${entry.status === 'Approved' ? 'badge-green' : 'badge-amber'}`}>
                  {entry.status}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Prepared by <strong>{entry.preparedBy}</strong>
                </span>
                {entry.status === 'Proposed' && currentUser.role !== 'preparer' && (
                  <button
                    onClick={() => onApproveEntry(entry.id)}
                    style={{
                      padding: '0.3rem 0.65rem',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                      color: '#34d399',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    Approve Entry
                  </button>
                )}
              </div>
            </div>

            <table className="excel-table">
              <thead>
                <tr>
                  <th style={{ width: '120px' }}>Account</th>
                  <th>Description</th>
                  <th style={{ textAlign: 'right', width: '150px' }}>Debit ($)</th>
                  <th style={{ textAlign: 'right', width: '150px' }}>Credit ($)</th>
                </tr>
              </thead>
              <tbody>
                {entry.lines.map((l) => (
                  <tr key={l.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', color: '#93c5fd' }}>{l.accountCode}</td>
                    <td>{l.description}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                      {l.debit ? formatCurrency(l.debit) : '-'}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                      {l.credit ? formatCurrency(l.credit) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {/* New AJE Modal */}
      {showNewModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: '600px',
              padding: '1.5rem',
              backgroundColor: '#0f172a',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>
              Propose Adjusting Journal Entry (AJE)
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                AJE Description / Audit Rationale
              </label>
              <input
                type="text"
                placeholder="e.g. Reclassify prepaid insurance amortization difference to current year expense"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            {/* Strict balance check */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.65rem 0.85rem',
                borderRadius: '6px',
                backgroundColor: isBalanced ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${isBalanced ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                fontSize: '0.78rem',
              }}
            >
              <span>Total Debits: <strong>{formatCurrency(entryDebits)}</strong></span>
              <span>Total Credits: <strong>{formatCurrency(entryCredits)}</strong></span>
              <span style={{ color: isBalanced ? '#34d399' : '#f87171', fontWeight: 700 }}>
                {isBalanced ? '✓ Debits Equal Credits' : `Break: ${formatCurrency(diff)}`}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                onClick={() => setShowNewModal(false)}
                style={{ padding: '0.45rem 0.85rem', borderRadius: '6px', color: '#94a3b8' }}
              >
                Cancel
              </button>
              <button
                disabled={!isBalanced || !description.trim()}
                onClick={handleCreate}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: '6px',
                  backgroundColor: isBalanced && description.trim() ? 'var(--accent-blue)' : '#334155',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: isBalanced && description.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                Create Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

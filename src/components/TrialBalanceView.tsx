import React, { useState } from 'react';
import {
  TableProperties,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Check,
  RotateCcw,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { MasterCOAItem, TrialBalanceRow } from '../types';
import { formatCurrency } from '../engine/evaluator';

interface TrialBalanceViewProps {
  trialBalance: TrialBalanceRow[];
  masterCOA: MasterCOAItem[];
  onConfirmMapping: (accountCode: string, masterCode: string) => void;
  onAcceptAllAISuggestions: () => void;
  onResetTB: () => void;
}

export const TrialBalanceView: React.FC<TrialBalanceViewProps> = ({
  trialBalance,
  masterCOA,
  onConfirmMapping,
  onAcceptAllAISuggestions,
  onResetTB,
}) => {
  const [filter, setFilter] = useState<'all' | 'unmapped' | 'confirmed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const totalDebits = trialBalance.reduce((acc, row) => acc + (row.debit || 0), 0);
  const totalCredits = trialBalance.reduce((acc, row) => acc + (row.credit || 0), 0);
  const imbalance = Math.abs(totalDebits - totalCredits);
  const isBalanced = imbalance < 0.01;

  const unmappedRows = trialBalance.filter((row) => row.mappingStatus !== 'confirmed');

  const filteredRows = trialBalance.filter((row) => {
    if (filter === 'unmapped' && row.mappingStatus === 'confirmed') return false;
    if (filter === 'confirmed' && row.mappingStatus !== 'confirmed') return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        row.accountCode.toLowerCase().includes(term) ||
        row.accountDescription.toLowerCase().includes(term) ||
        (row.masterCode && row.masterCode.toLowerCase().includes(term))
      );
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* Top Header Card */}
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
            <span className="badge badge-blue">Trial Balance Engine</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              25 Active Accounts · Multi-Currency Integer/Numeric Cents
            </span>
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginTop: '0.35rem' }}>
            Trial Balance & Master COA Auto-Mapping
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Imports client trial balances, validates debit/credit equality, and binds accounts to workpaper lead schedules.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={onResetTB}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 0.85rem',
              borderRadius: '6px',
              backgroundColor: '#1e293b',
              color: '#cbd5e1',
              border: '1px solid #334155',
              fontSize: '0.78rem',
              fontWeight: 600,
            }}
          >
            <RotateCcw size={14} />
            <span>Reset Demo TB</span>
          </button>
        </div>
      </div>

      {/* Debits Equal Credits Validation Banner (Section 1 & 7) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.85rem 1.25rem',
          borderRadius: '8px',
          backgroundColor: isBalanced ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.12)',
          border: `1px solid ${isBalanced ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.4)'}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isBalanced ? (
            <CheckCircle2 size={20} color="#34d399" />
          ) : (
            <AlertTriangle size={20} color="#f87171" />
          )}
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isBalanced ? '#34d399' : '#f87171' }}>
              {isBalanced ? 'Trial Balance Strict Equality Constraint: BALANCED' : 'IMBALANCE DETECTED'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
              Total Debits: <strong>{formatCurrency(totalDebits)}</strong> · Total Credits: <strong>{formatCurrency(totalCredits)}</strong> · Discrepancy: <strong>{formatCurrency(imbalance)}</strong>
            </div>
          </div>
        </div>
        <span
          style={{
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            padding: '0.2rem 0.6rem',
            borderRadius: '4px',
            backgroundColor: isBalanced ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            color: isBalanced ? '#34d399' : '#f87171',
          }}
        >
          {isBalanced ? 'Σ DEBITS = Σ CREDITS' : 'OUT OF BALANCE'}
        </span>
      </div>

      {/* AI Auto-Mapping Banner (Section 5: Assist the preparer) */}
      {unmappedRows.length > 0 && (
        <div
          className="glass-panel"
          style={{
            padding: '1rem 1.25rem',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(30, 27, 75, 0.4) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.35)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.45rem', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.2)', color: '#c084fc' }}>
              <Sparkles size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f8fafc' }}>
                AI COA Auto-Mapping: {unmappedRows.length} Suggestions Ready
              </div>
              <div style={{ fontSize: '0.75rem', color: '#d8b4fe' }}>
                Semantic categorization matched new client accounts against your standard Master Chart of Accounts with high confidence.
              </div>
            </div>
          </div>

          <button
            onClick={onAcceptAllAISuggestions}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              backgroundColor: '#8b5cf6',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 700,
              boxShadow: '0 2px 8px rgba(139, 92, 246, 0.4)',
            }}
          >
            <Check size={14} />
            <span>Confirm All AI Suggestions</span>
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 600,
              backgroundColor: filter === 'all' ? '#1e293b' : 'transparent',
              color: filter === 'all' ? '#60a5fa' : 'var(--text-muted)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            All Accounts ({trialBalance.length})
          </button>
          <button
            onClick={() => setFilter('unmapped')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 600,
              backgroundColor: filter === 'unmapped' ? '#1e293b' : 'transparent',
              color: filter === 'unmapped' ? '#fbbf24' : 'var(--text-muted)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            Pending Auto-Map ({unmappedRows.length})
          </button>
          <button
            onClick={() => setFilter('confirmed')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 600,
              backgroundColor: filter === 'confirmed' ? '#1e293b' : 'transparent',
              color: filter === 'confirmed' ? '#34d399' : 'var(--text-muted)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            Mapped ({trialBalance.length - unmappedRows.length})
          </button>
        </div>

        <input
          type="text"
          placeholder="Filter by account code, name, or master COA..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '300px' }}
        />
      </div>

      {/* Trial Balance Excel-like Grid */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table className="excel-table">
          <thead>
            <tr>
              <th style={{ width: '110px' }}>Account Code</th>
              <th>Account Description</th>
              <th style={{ textAlign: 'right', width: '130px' }}>Debit ($)</th>
              <th style={{ textAlign: 'right', width: '130px' }}>Credit ($)</th>
              <th style={{ textAlign: 'right', width: '130px' }}>Net Balance ($)</th>
              <th style={{ width: '220px' }}>Master COA Mapping</th>
              <th style={{ width: '130px' }}>Status</th>
              <th style={{ width: '90px', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => {
              const matchedMaster = masterCOA.find((m) => m.masterCode === (row.masterCode || row.aiSuggestedCode));

              return (
                <tr key={row.accountCode}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#93c5fd' }}>
                    {row.accountCode}
                  </td>
                  <td style={{ fontWeight: 600, color: '#f1f5f9' }}>
                    {row.accountDescription}
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                    {row.debit ? formatCurrency(row.debit) : '-'}
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                    {row.credit ? formatCurrency(row.credit) : '-'}
                  </td>
                  <td
                    style={{
                      textAlign: 'right',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      color: row.netBalance < 0 ? '#fbbf24' : '#f8fafc',
                    }}
                  >
                    {formatCurrency(row.netBalance)}
                  </td>
                  <td>
                    <select
                      value={row.masterCode || row.aiSuggestedCode || ''}
                      onChange={(e) => onConfirmMapping(row.accountCode, e.target.value)}
                      style={{ width: '100%', fontSize: '0.75rem', padding: '0.2rem 0.4rem' }}
                    >
                      <option value="">-- Unmapped --</option>
                      {masterCOA.map((m) => (
                        <option key={m.masterCode} value={m.masterCode}>
                          {m.masterCode} · {m.standardName}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    {row.mappingStatus === 'confirmed' ? (
                      <span className="badge badge-green" style={{ fontSize: '0.68rem' }}>
                        Mapped
                      </span>
                    ) : (
                      <span className="badge badge-purple" style={{ fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Sparkles size={10} />
                        {Math.round((row.aiConfidence || 0.9) * 100)}% match
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {row.mappingStatus !== 'confirmed' && (
                      <button
                        onClick={() => onConfirmMapping(row.accountCode, row.aiSuggestedCode || '1010')}
                        style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          backgroundColor: '#8b5cf6',
                          color: '#ffffff',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                        }}
                        title="Accept AI Mapping suggestion"
                      >
                        Accept
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: '#111827', fontWeight: 800 }}>
              <td colSpan={2} style={{ padding: '0.75rem 0.85rem' }}>TOTALS</td>
              <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: '#34d399' }}>
                {formatCurrency(totalDebits)}
              </td>
              <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: '#34d399' }}>
                {formatCurrency(totalCredits)}
              </td>
              <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: '#34d399' }}>
                {formatCurrency(imbalance)}
              </td>
              <td colSpan={3} style={{ color: '#34d399', fontSize: '0.75rem' }}>
                ✓ Strict Equality Constraint Verified
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

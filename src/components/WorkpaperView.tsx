import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertOctagon,
  Lock,
  Unlock,
  Plus,
  Trash2,
  FileText,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  ExternalLink,
  MessageSquarePlus,
  Check,
  Clock,
} from 'lucide-react';
import {
  Tickmark,
  TrialBalanceRow,
  UserProfile,
  WorkpaperInstance,
  WorkpaperTemplate,
} from '../types';
import { evaluateBindings, evaluateTemplate, formatCurrency } from '../engine/evaluator';

interface WorkpaperViewProps {
  workpaper: WorkpaperInstance;
  template: WorkpaperTemplate;
  trialBalance: TrialBalanceRow[];
  currentUser: UserProfile;
  tickmarks: Tickmark[];
  onUpdatePayload: (workpaperId: string, newPayload: Record<string, any>) => void;
  onUpdateProcedures: (workpaperId: string, updatedProcedures: any[]) => void;
  onSignoff: (workpaperId: string, role: 'preparer' | 'reviewer' | 'partner', comment?: string) => void;
  onSelectTickmark: (tickmark: Tickmark) => void;
  onAddReviewNote: (workpaperId: string, ref: string, text: string) => void;
  onOpenSplitScreen: () => void;
  onInspectLineage: (fieldId: string) => void;
}

export const WorkpaperView: React.FC<WorkpaperViewProps> = ({
  workpaper,
  template,
  trialBalance,
  currentUser,
  tickmarks,
  onUpdatePayload,
  onUpdateProcedures,
  onSignoff,
  onSelectTickmark,
  onAddReviewNote,
  onOpenSplitScreen,
  onInspectLineage,
}) => {
  const [activeFormula, setActiveFormula] = useState<string>(
    template.formulas['difference'] || template.formulas['cost_diff'] || 'fx: active cell calculation'
  );
  const [reviewNoteText, setReviewNoteText] = useState('');
  const [showAddNote, setShowAddNote] = useState(false);

  // Evaluate template bindings against trial balance
  const boundValues = evaluateBindings(template.bindings, trialBalance);
  const evalResult = evaluateTemplate(template, workpaper.dataPayload, boundValues);

  const handleFieldChange = (fieldId: string, val: any) => {
    if (workpaper.isLocked && currentUser.role !== 'partner') return;
    const newPayload = {
      ...workpaper.dataPayload,
      [fieldId]: val,
    };
    onUpdatePayload(workpaper.id, newPayload);
  };

  const handleTableRowChange = (sectionId: string, rowIndex: number, colId: string, val: any) => {
    if (workpaper.isLocked && currentUser.role !== 'partner') return;
    const currentRows = [...(workpaper.dataPayload[sectionId] || [])];
    if (currentRows[rowIndex]) {
      currentRows[rowIndex] = { ...currentRows[rowIndex], [colId]: val };
      onUpdatePayload(workpaper.id, {
        ...workpaper.dataPayload,
        [sectionId]: currentRows,
      });
    }
  };

  const handleAddTableRow = (sectionId: string) => {
    if (workpaper.isLocked && currentUser.role !== 'partner') return;
    const currentRows = [...(workpaper.dataPayload[sectionId] || [])];
    const newRowId = `row_${Date.now()}`;
    const emptyRow: any = { id: newRowId };

    if (template.template_id === 'bank_rec') {
      emptyRow.date = '2026-12-31';
      emptyRow.reference = 'CHK-';
      emptyRow.payee = 'New Vendor';
      emptyRow.type = 'cheque';
      emptyRow.amount = 0;
      emptyRow.clearing_date = '2027-01-05';
    } else if (template.template_id === 'fixed_assets') {
      emptyRow.asset_id = 'TAG-';
      emptyRow.description = 'New Equipment Addition';
      emptyRow.date = '2026-12-15';
      emptyRow.vendor = 'Supplier Corp';
      emptyRow.useful_life = 5;
      emptyRow.amount = 0;
      emptyRow.vouched = 'Pending';
    } else if (template.template_id === 'prepayments') {
      emptyRow.vendor = 'New Vendor Policy';
      emptyRow.description = 'Annual Prepayment';
      emptyRow.start_date = '2026-06-01';
      emptyRow.end_date = '2027-05-31';
      emptyRow.total_amount = 0;
      emptyRow.cy_amortised = 0;
      emptyRow.unexpired_balance = 0;
      emptyRow.active = true;
    } else {
      emptyRow.description = 'New sample line';
      emptyRow.amount = 0;
    }

    currentRows.push(emptyRow);
    onUpdatePayload(workpaper.id, {
      ...workpaper.dataPayload,
      [sectionId]: currentRows,
    });
  };

  const handleDeleteTableRow = (sectionId: string, rowIndex: number) => {
    if (workpaper.isLocked && currentUser.role !== 'partner') return;
    const currentRows = [...(workpaper.dataPayload[sectionId] || [])];
    currentRows.splice(rowIndex, 1);
    onUpdatePayload(workpaper.id, {
      ...workpaper.dataPayload,
      [sectionId]: currentRows,
    });
  };

  // AI draft procedure narrative
  const handleAIDraftProcedure = (idx: number) => {
    const updated = [...workpaper.procedureStatuses];
    let draft = '';

    if (template.template_id === 'bank_rec') {
      if (idx === 0) {
        draft = `AI Draft: Agreed bank statement balance of ${formatCurrency(
          evalResult.computedValues.bank_balance as number
        )} to independent third-party bank confirmation letter and verified zero differences.`;
      } else if (idx === 1) {
        draft =
          'AI Draft: Tested 100% of outstanding cheques and deposits in transit. Traced subsequent clearing in January bank statement within allowable business days.';
      } else {
        draft = `AI Draft: Mathematical recalculation confirmed. Adjusted bank balance matches general ledger balance with $0.00 discrepancy. Pass.`;
      }
    } else if (template.template_id === 'fixed_assets') {
      draft = `AI Draft: Evaluated capital additions against $37,500 tolerable misstatement. Vouched vendor invoice, tax stamp, and verified depreciation rate parameters.`;
    } else {
      draft = `AI Draft: Completed substantive analytical verification. Documentation examined and deemed sufficient for financial reporting objectives under ${workpaper.title}.`;
    }

    updated[idx] = {
      ...updated[idx],
      procedureIndex: idx,
      status: 'completed',
      conclusion: draft,
      performedBy: currentUser.name,
      performedAt: new Date().toISOString(),
    };
    onUpdateProcedures(workpaper.id, updated);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Workpaper Header & Metadata */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderLeft: '4px solid var(--accent-blue)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.9rem',
                fontWeight: 800,
                color: '#60a5fa',
                background: '#1e293b',
                padding: '0.2rem 0.55rem',
                borderRadius: '4px',
                border: '1px solid #334155',
              }}
            >
              WP {workpaper.refCode}
            </span>
            <span className="badge badge-blue">{template.area}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Template: {template.template_id} (Version {workpaper.template_version})
            </span>
            {workpaper.isLocked ? (
              <span className="badge badge-purple" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Lock size={11} /> Locked
              </span>
            ) : (
              <span className="badge badge-green" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Unlock size={11} /> Editable
              </span>
            )}
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginTop: '0.35rem' }}>
            {workpaper.title}
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            {template.description}
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={onOpenSplitScreen}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 0.85rem',
              borderRadius: '6px',
              backgroundColor: '#1e293b',
              color: '#93c5fd',
              border: '1px solid #334155',
              fontSize: '0.78rem',
              fontWeight: 600,
            }}
          >
            <ExternalLink size={14} />
            <span>Open Split Evidence</span>
          </button>

          <button
            onClick={() => setShowAddNote(!showAddNote)}
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
            <MessageSquarePlus size={14} />
            <span>Add Review Note</span>
          </button>
        </div>
      </div>

      {/* Review Note Quick Input Drawer */}
      {showAddNote && (
        <div className="glass-panel" style={{ padding: '1rem', border: '1px solid #f59e0b', background: 'rgba(245, 158, 11, 0.05)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fbbf24', marginBottom: '0.4rem' }}>
            New Review Note for {workpaper.refCode} ({currentUser.name})
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="e.g. Please verify invoice approval date or clarify variance explanation..."
              value={reviewNoteText}
              onChange={(e) => setReviewNoteText(e.target.value)}
              style={{ flex: 1 }}
            />
            <button
              onClick={() => {
                if (reviewNoteText.trim()) {
                  onAddReviewNote(workpaper.id, workpaper.refCode, reviewNoteText);
                  setReviewNoteText('');
                  setShowAddNote(false);
                }
              }}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                background: 'var(--accent-amber)',
                color: '#000000',
                fontWeight: 700,
                fontSize: '0.8rem',
              }}
            >
              Post Note
            </button>
          </div>
        </div>
      )}

      {/* Visible Formulas Bar (Feels like Excel principle) */}
      <div className="formulas-bar">
        <span className="formula-tag">fx</span>
        <div style={{ width: '1px', height: '14px', backgroundColor: '#334155' }} />
        <span style={{ color: '#e2e8f0', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {activeFormula}
        </span>
        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Formula Engine (Reactive)</span>
      </div>

      {/* Plain-Language Check Alerts (Section 4 & 5) */}
      {evalResult.checkResults.map((check, idx) => (
        <div
          key={idx}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1.15rem',
            borderRadius: '8px',
            backgroundColor: check.passed ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.12)',
            border: `1px solid ${check.passed ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.4)'}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {check.passed ? (
              <CheckCircle2 size={18} color="#34d399" />
            ) : (
              <AlertOctagon size={18} color="#f87171" />
            )}
            <div>
              <div style={{ fontSize: '0.825rem', fontWeight: 700, color: check.passed ? '#34d399' : '#f87171' }}>
                {check.passed ? 'Tie-out Verified (Check Rule Satisfied)' : 'Plain-Language Discrepancy Alert'}
              </div>
              <div style={{ fontSize: '0.775rem', color: '#cbd5e1' }}>
                {check.passed ? `Rule [${check.rule}] holds without variance.` : check.message}
              </div>
            </div>
          </div>
          <span
            style={{
              fontSize: '0.7rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              padding: '0.15rem 0.45rem',
              borderRadius: '4px',
              backgroundColor: check.passed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              color: check.passed ? '#34d399' : '#f87171',
            }}
          >
            {check.passed ? 'TIE PASS' : 'BREAK'}
          </span>
        </div>
      ))}

      {/* Sections rendering (Summary fields, Tables, etc.) */}
      {template.sections.map((section) => {
        if (section.type === 'fields' && section.fields) {
          return (
            <div key={section.id} className="glass-panel" style={{ padding: '1.25rem' }}>
              {section.title && (
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                  {section.title}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                {section.fields.map((field) => {
                  const val = evalResult.computedValues[field.id];
                  const hasTickmark = tickmarks.find((tm) => tm.workpaperId === workpaper.id && tm.targetField === field.id);

                  return (
                    <div
                      key={field.id}
                      onClick={() => {
                        if (field.formula) setActiveFormula(`${field.id} = ${field.formula}`);
                        else if (field.source) setActiveFormula(`${field.id} <- ${template.bindings[field.source]}`);
                      }}
                      style={{
                        padding: '0.85rem',
                        backgroundColor: '#0d1424',
                        borderRadius: '8px',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.35rem',
                        position: 'relative',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.725rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                          {field.label}
                        </span>
                        {field.source && (
                          <span className="badge badge-blue" style={{ fontSize: '0.625rem' }}>
                            TB Binding
                          </span>
                        )}
                      </div>

                      {field.locked ? (
                        <div
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '1.15rem',
                            fontWeight: 700,
                            color: field.id.includes('diff') && Math.abs(Number(val) || 0) > 0.01 ? '#f87171' : '#f8fafc',
                          }}
                        >
                          {typeof val === 'number' ? formatCurrency(val) : val ?? '$0.00'}
                        </div>
                      ) : (
                        <input
                          type="number"
                          value={workpaper.dataPayload[field.id] ?? ''}
                          onChange={(e) => handleFieldChange(field.id, parseFloat(e.target.value) || 0)}
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            color: '#ffffff',
                            backgroundColor: '#111827',
                            border: '1px solid #334155',
                          }}
                        />
                      )}

                      {/* Tickmark or Evidence Linking */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.3rem' }}>
                        {hasTickmark ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectTickmark(hasTickmark);
                            }}
                            className="tickmark-pill"
                            style={{
                              backgroundColor: `${hasTickmark.markColor}22`,
                              color: hasTickmark.markColor,
                              border: `1px solid ${hasTickmark.markColor}55`,
                            }}
                            title={`Tied to ${hasTickmark.documentTitle} (Click to view)`}
                          >
                            <span>{hasTickmark.markSymbol}</span>
                            <span style={{ fontSize: '0.65rem' }}>{hasTickmark.documentTitle.split(' ')[0]}</span>
                          </button>
                        ) : field.evidence ? (
                          <button
                            onClick={() => onOpenSplitScreen()}
                            style={{
                              fontSize: '0.68rem',
                              color: '#60a5fa',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                            }}
                          >
                            <Sparkles size={11} />
                            <span>Link to Evidence Doc</span>
                          </button>
                        ) : null}

                        {field.evidence && (
                          <button
                            onClick={() => onInspectLineage(field.id)}
                            style={{ fontSize: '0.65rem', color: '#a78bfa', textDecoration: 'underline' }}
                          >
                            Inspect Lineage
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }

        if (section.type === 'table' && section.columns) {
          const rows: any[] = workpaper.dataPayload[section.id] || [];

          return (
            <div key={section.id} className="glass-panel" style={{ overflow: 'hidden' }}>
              <div
                style={{
                  padding: '0.85rem 1.25rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>
                    {section.title || 'Data Grid'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Excel-like grid: inline editing, reactive formulas, and post-year-end clearing.
                  </div>
                </div>

                {section.allowAddRows && !workpaper.isLocked && (
                  <button
                    onClick={() => handleAddTableRow(section.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(59, 130, 246, 0.15)',
                      color: '#93c5fd',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  >
                    <Plus size={13} />
                    <span>Add Row</span>
                  </button>
                )}
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="excel-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>#</th>
                      {section.columns.map((col) => (
                        <th key={col.id}>{col.label}</th>
                      ))}
                      {!workpaper.isLocked && <th style={{ width: '45px', textAlign: 'center' }}>Del</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, rIdx) => (
                      <tr key={row.id || rIdx}>
                        <td style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
                          {rIdx + 1}
                        </td>
                        {section.columns?.map((col) => {
                          const val = row[col.id] ?? '';
                          return (
                            <td key={col.id}>
                              {col.type === 'select' && col.options ? (
                                <select
                                  value={val}
                                  disabled={workpaper.isLocked}
                                  onChange={(e) => handleTableRowChange(section.id, rIdx, col.id, e.target.value)}
                                  style={{ width: '100%', padding: '0.15rem 0.35rem', fontSize: '0.78rem' }}
                                >
                                  {col.options.map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                              ) : col.type === 'currency' ? (
                                <input
                                  type="number"
                                  value={val}
                                  disabled={workpaper.isLocked}
                                  onChange={(e) => handleTableRowChange(section.id, rIdx, col.id, parseFloat(e.target.value) || 0)}
                                  style={{
                                    fontFamily: 'var(--font-mono)',
                                    textAlign: 'right',
                                  }}
                                />
                              ) : (
                                <input
                                  type={col.type === 'date' ? 'date' : 'text'}
                                  value={val}
                                  disabled={workpaper.isLocked}
                                  onChange={(e) => handleTableRowChange(section.id, rIdx, col.id, e.target.value)}
                                />
                              )}
                            </td>
                          );
                        })}
                        {!workpaper.isLocked && (
                          <td style={{ textAlign: 'center' }}>
                            <button
                              onClick={() => handleDeleteTableRow(section.id, rIdx)}
                              style={{ color: '#ef4444', padding: '0.2rem', borderRadius: '4px' }}
                              title="Delete row"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                    {rows.length === 0 && (
                      <tr>
                        <td colSpan={(section.columns.length || 0) + 2} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                          No line items recorded. Click "Add Row" to populate schedule items.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          );
        }

        return null;
      })}

      {/* Procedures & Conclusions Checklist (Section 2, 3) */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>
              Standard Audit Procedures & Conclusions
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Procedures configured in JSON template with tick-mark slots and conclusion narratives.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {template.procedures.map((proc, pIdx) => {
            const statusObj = workpaper.procedureStatuses.find((p) => p.procedureIndex === pIdx) || {
              procedureIndex: pIdx,
              status: 'pending',
              conclusion: '',
            };

            return (
              <div
                key={pIdx}
                style={{
                  padding: '1rem',
                  backgroundColor: '#0d1424',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', flex: 1 }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#60a5fa',
                        background: '#1e293b',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                      }}
                    >
                      P-{pIdx + 1}
                    </span>
                    <span style={{ fontSize: '0.825rem', fontWeight: 600, color: '#e2e8f0' }}>
                      {proc}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <select
                      value={statusObj.status}
                      disabled={workpaper.isLocked}
                      onChange={(e) => {
                        const updated = [...workpaper.procedureStatuses];
                        updated[pIdx] = {
                          ...statusObj,
                          status: e.target.value as any,
                          performedBy: currentUser.name,
                          performedAt: new Date().toISOString(),
                        };
                        onUpdateProcedures(workpaper.id, updated);
                      }}
                      style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                    >
                      <option value="pending">⏳ Pending</option>
                      <option value="completed">✓ Completed</option>
                      <option value="exception">⚠️ Exception Found</option>
                      <option value="na">N/A</option>
                    </select>

                    <button
                      onClick={() => handleAIDraftProcedure(pIdx)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: '0.25rem 0.55rem',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(139, 92, 246, 0.15)',
                        color: '#c084fc',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                      }}
                      title="AI drafts narrative for routine steps based on recorded results (Section 5)"
                    >
                      <Sparkles size={11} />
                      <span>AI Draft Narrative</span>
                    </button>
                  </div>
                </div>

                {/* Conclusion Text Box */}
                <div>
                  <textarea
                    rows={2}
                    placeholder="Enter audit conclusion, tick-mark cross-references, or findings..."
                    value={statusObj.conclusion}
                    disabled={workpaper.isLocked}
                    onChange={(e) => {
                      const updated = [...workpaper.procedureStatuses];
                      updated[pIdx] = {
                        ...statusObj,
                        conclusion: e.target.value,
                        performedBy: currentUser.name,
                        performedAt: new Date().toISOString(),
                      };
                      onUpdateProcedures(workpaper.id, updated);
                    }}
                    style={{
                      width: '100%',
                      fontSize: '0.8rem',
                      lineHeight: 1.4,
                      background: '#111827',
                    }}
                  />
                  {statusObj.performedBy && (
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Documented by <strong>{statusObj.performedBy}</strong> on {statusObj.performedAt ? new Date(statusObj.performedAt).toLocaleDateString() : 'N/A'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Multi-tier Sign-off & Stage Locking (Section 1, 2, 7) */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          borderTop: '2px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
              Multi-Tier Sign-Off & Stage Locking
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Sign-off hierarchy: Preparer -&gt; Reviewer -&gt; Partner. Signing locks the workpaper version.
            </div>
          </div>
          <span className="badge badge-purple">Audit Trail Enabled</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {/* Preparer Slot */}
          {(() => {
            const signoff = workpaper.signoffs.find((s) => s.role === 'preparer');
            return (
              <div
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  backgroundColor: signoff ? 'rgba(16, 185, 129, 0.08)' : '#0d1424',
                  border: `1px solid ${signoff ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    1. Preparer Sign-Off
                  </span>
                  {signoff ? <CheckCircle2 size={16} color="#34d399" /> : <Clock size={16} color="#64748b" />}
                </div>

                {signoff ? (
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>{signoff.userName}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                      {new Date(signoff.signedAt).toLocaleString()}
                    </div>
                    {signoff.comments && (
                      <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: '0.35rem', fontStyle: 'italic' }}>
                        "{signoff.comments}"
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      Sign off when all data fields, tie-outs, and procedures are complete.
                    </div>
                    <button
                      onClick={() => onSignoff(workpaper.id, 'preparer', 'Workpaper completed and tied out.')}
                      style={{
                        width: '100%',
                        padding: '0.45rem',
                        borderRadius: '6px',
                        backgroundColor: 'var(--accent-blue)',
                        color: '#ffffff',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      Sign as Preparer
                    </button>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Reviewer Slot */}
          {(() => {
            const signoff = workpaper.signoffs.find((s) => s.role === 'reviewer');
            const preparerDone = workpaper.signoffs.some((s) => s.role === 'preparer');
            return (
              <div
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  backgroundColor: signoff ? 'rgba(59, 130, 246, 0.08)' : '#0d1424',
                  border: `1px solid ${signoff ? 'rgba(59, 130, 246, 0.3)' : 'var(--border-subtle)'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    2. Reviewer Sign-Off
                  </span>
                  {signoff ? <CheckCircle2 size={16} color="#60a5fa" /> : <Clock size={16} color="#64748b" />}
                </div>

                {signoff ? (
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>{signoff.userName}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                      {new Date(signoff.signedAt).toLocaleString()}
                    </div>
                    {signoff.comments && (
                      <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: '0.35rem', fontStyle: 'italic' }}>
                        "{signoff.comments}"
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      Verify documentation sufficiency, tick-marks, and clear review points.
                    </div>
                    <button
                      disabled={!preparerDone}
                      onClick={() => onSignoff(workpaper.id, 'reviewer', 'Reviewed and approved.')}
                      style={{
                        width: '100%',
                        padding: '0.45rem',
                        borderRadius: '6px',
                        backgroundColor: preparerDone ? 'var(--accent-blue)' : '#334155',
                        color: preparerDone ? '#ffffff' : '#94a3b8',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: preparerDone ? 'pointer' : 'not-allowed',
                      }}
                    >
                      {preparerDone ? 'Sign as Reviewer' : 'Awaiting Preparer'}
                    </button>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Partner Approval Slot */}
          {(() => {
            const signoff = workpaper.signoffs.find((s) => s.role === 'partner');
            const reviewerDone = workpaper.signoffs.some((s) => s.role === 'reviewer');
            return (
              <div
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  backgroundColor: signoff ? 'rgba(139, 92, 246, 0.08)' : '#0d1424',
                  border: `1px solid ${signoff ? 'rgba(139, 92, 246, 0.3)' : 'var(--border-subtle)'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    3. Partner Final Approval
                  </span>
                  {signoff ? <Lock size={16} color="#c084fc" /> : <Clock size={16} color="#64748b" />}
                </div>

                {signoff ? (
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>{signoff.userName}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                      {new Date(signoff.signedAt).toLocaleString()}
                    </div>
                    <span className="badge badge-purple" style={{ marginTop: '0.4rem' }}>
                      Post-Assembly Locked
                    </span>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      Final engagement partner authorization. Immutably locks workpaper data.
                    </div>
                    <button
                      disabled={!reviewerDone}
                      onClick={() => onSignoff(workpaper.id, 'partner', 'Partner authorization completed. Locked.')}
                      style={{
                        width: '100%',
                        padding: '0.45rem',
                        borderRadius: '6px',
                        backgroundColor: reviewerDone ? 'var(--accent-purple)' : '#334155',
                        color: reviewerDone ? '#ffffff' : '#94a3b8',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: reviewerDone ? 'pointer' : 'not-allowed',
                      }}
                    >
                      {reviewerDone ? 'Partner Final Sign & Lock' : 'Awaiting Reviewer'}
                    </button>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

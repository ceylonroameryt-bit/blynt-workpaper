'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { asPence, formatPence } from '@/lib/money';
import type { Attachment } from '@/lib/types/models';
import type { PaperResult } from '@/lib/workpapers/engine';
import { MoneyInput, TextInput, RowFiles, AddOption, fmtTb } from './parts';

export interface ScheduleProps {
  data: Record<string, any>;
  result: PaperResult;
  locked: boolean;
  save: (patch: Record<string, any>) => void;
  filesFor: (rowId: string) => Attachment[];
  attachTo: (rowId: string) => void;
  preview: (a: Attachment) => void;
  tickFor: (rowId: string, label: string) => React.ReactNode;
  /** The paper's latest data. Writes build on this, so quick successive edits never overwrite each other. */
  live: () => Record<string, any>;
}

const newId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
const th = 'p-2 text-[10px] font-bold uppercase tracking-wider text-[#5B6478] whitespace-nowrap';
const addBtn =
  'inline-flex items-center gap-1 min-h-[32px] px-3 text-xs font-bold text-[#102654] bg-white border border-[#D5DBE7] hover:border-[#102654] rounded-[8px] disabled:opacity-40';

function RemoveButton({ onClick, label, disabled }: { onClick: () => void; label: string; disabled: boolean }) {
  if (disabled) return null;
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className="p-1 text-[#7E8DA6] hover:text-[#B42318]">
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  );
}

/* ---------- B-10 style: ledger to statement reconciliation ---------- */
export function ReconciliationSchedule({ data, result, locked, save, filesFor, attachTo, preview, tickFor, live }: ScheduleProps) {
  const sections: any[] = data.sections ?? [];
  const updateRow = (sid: string, rid: string, patch: Record<string, any>) =>
    save({
      sections: (live().sections ?? []).map((s: any) =>
        s.id !== sid ? s : { ...s, rows: s.rows.map((r: any) => (r.id === rid ? { ...r, ...patch } : r)) }
      ),
    });
  const addRow = (sid: string) =>
    save({
      sections: (live().sections ?? []).map((s: any) =>
        s.id !== sid ? s : { ...s, rows: [...s.rows, { id: newId('r'), desc: '', detail: '', amount_p: '0', tick: '' }] }
      ),
    });
  const removeRow = (sid: string, rid: string) =>
    save({ sections: (live().sections ?? []).map((s: any) => (s.id !== sid ? s : { ...s, rows: s.rows.filter((r: any) => r.id !== rid) })) });

  const diff = result.totals.difference ?? 0n;
  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-xs max-w-md">
        <span className="font-semibold text-[#102654]">Bank and account</span>
        <TextInput
          label="Bank and account"
          value={data.bank_name}
          disabled={locked}
          placeholder="e.g. Barclays current account"
          onCommit={(v) => save({ bank_name: v })}
        />
      </label>
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-[#102654]">
          <thead className="bg-[#F6F7FB]">
            <tr>
              <th className={`${th} text-left`}>Line</th>
              <th className={`${th} text-right w-[150px]`}>This year</th>
              <th className={`${th} text-left`}>Evidence</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E3E7EF]">
            <tr>
              <td className="p-2">
                <div className="font-semibold">Balance per ledger</div>
                <div className="text-[10px] text-[#5B6478]">Locked to the trial balance</div>
              </td>
              <td className="p-2 text-right font-mono font-bold">{formatPence(result.totals.ledger ?? 0n)}</td>
              <td className="p-2 text-[10px] text-[#5B6478]">TB</td>
              <td />
            </tr>
            <tr>
              <td className="p-2 font-semibold">Balance per bank statement</td>
              <td className="p-1.5">
                <MoneyInput label="Balance per bank statement" value={data.statement_p} disabled={locked} onCommit={(p) => save({ statement_p: p })} />
              </td>
              <td className="p-2">
                <div className="flex items-center gap-2 flex-wrap">{tickFor('statement', "the statement balance")}<RowFiles files={filesFor('statement')} onPreview={preview} onAttach={() => attachTo('statement')} disabled={locked} label="the statement balance" /></div>
              </td>
              <td />
            </tr>
            {sections.map((s) => (
              <React.Fragment key={s.id}>
                <tr className="bg-[#F6F7FB]/60">
                  <td colSpan={4} className="p-2 text-[10px] font-bold uppercase tracking-wider text-[#5B6478]">
                    {s.label}
                  </td>
                </tr>
                {s.rows.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-2 text-[11px] text-[#7E8DA6]">
                      No items.
                    </td>
                  </tr>
                )}
                {s.rows.map((r: any) => (
                  <tr key={r.id}>
                    <td className="p-1.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        <TextInput label="Description" value={r.desc} disabled={locked} placeholder="Description" onCommit={(v) => updateRow(s.id, r.id, { desc: v })} />
                        <TextInput label="Detail" value={r.detail} disabled={locked} placeholder="e.g. cleared 3 Apr" onCommit={(v) => updateRow(s.id, r.id, { detail: v })} />
                      </div>
                    </td>
                    <td className="p-1.5">
                      <MoneyInput label={`${r.desc || 'item'} amount`} value={r.amount_p} disabled={locked} allowNegative={false} onCommit={(p) => updateRow(s.id, r.id, { amount_p: p })} />
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-2 flex-wrap">{tickFor(r.id, r.desc || 'this item')}<RowFiles files={filesFor(r.id)} onPreview={preview} onAttach={() => attachTo(r.id)} disabled={locked} label={r.desc || 'this item'} /></div>
                    </td>
                    <td className="p-1 text-right">
                      <RemoveButton onClick={() => removeRow(s.id, r.id)} label="Remove item" disabled={locked} />
                    </td>
                  </tr>
                ))}
                {!locked && (
                  <tr>
                    <td colSpan={4} className="p-1.5">
                      <button type="button" className={addBtn} onClick={() => addRow(s.id)}>
                        <Plus className="w-3.5 h-3.5" /> Add item
                      </button>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-[#102654]/20 font-bold">
            <tr>
              <td className="p-2">Adjusted bank balance</td>
              <td className="p-2 text-right font-mono">{formatPence(result.totals.adjusted ?? 0n)}</td>
              <td colSpan={2} className={`p-2 text-[11px] ${diff === 0n ? 'text-[#0B6B52]' : 'text-[#B42318]'}`}>
                {diff === 0n ? '✓ Ties to ledger' : `Difference ${formatPence(diff)}`}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      <label className="grid grid-cols-1 sm:grid-cols-[1fr_150px] items-center gap-2 text-xs max-w-md">
        <span className="font-semibold text-[#102654]">Balance per bank confirmation (optional)</span>
        <MoneyInput label="Balance per bank confirmation" value={data.confirmation_p} disabled={locked} onCommit={(p) => save({ confirmation_p: p })} />
      </label>
    </div>
  );
}

/* ---------- F-10 style: asset register, additions and disposals ---------- */
export function AssetsSchedule({ data, result, locked, save, filesFor, attachTo, preview, tickFor, live }: ScheduleProps) {
  const classes: any[] = data.classes ?? [];
  const movements: any[] = data.movements ?? [];
  const t = result.totals;
  const setClass = (id: string, patch: Record<string, any>) =>
    save({ classes: (live().classes ?? []).map((c: any) => (c.id === id ? { ...c, ...patch } : c)) });
  const setMove = (id: string, patch: Record<string, any>) =>
    save({ movements: (live().movements ?? []).map((m: any) => (m.id === id ? { ...m, ...patch } : m)) });
  const addMove = (type: 'addition' | 'disposal') =>
    save({
      movements: [
        ...(live().movements ?? []),
        { id: newId('m'), type, date: '', item: '', supplier: '', class_id: classes[0]?.id ?? '', cost_p: '0', deprec_p: '0', proceeds_p: '0' },
      ],
    });

  return (
    <div className="flex flex-col gap-5">
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-[#102654]">
          <thead className="bg-[#F6F7FB]">
            <tr>
              <th className={`${th} text-left`} rowSpan={2}>
                Class
              </th>
              <th className={`${th} text-center border-b border-[#E3E7EF]`} colSpan={4}>
                Cost
              </th>
              <th className={`${th} text-center border-b border-[#E3E7EF]`} colSpan={4}>
                Depreciation
              </th>
              <th className={`${th} text-right`} rowSpan={2}>
                NBV
              </th>
              <th className={`${th} text-left`} rowSpan={2}>
                Files
              </th>
              <th rowSpan={2} />
            </tr>
            <tr>
              {['Opening', 'Additions', 'Disposals', 'Closing', 'Opening', 'Charge', 'Disposals', 'Closing'].map((h, i) => (
                <th key={i} className={`${th} text-right`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E3E7EF]">
            {classes.map((c) => (
              <tr key={c.id}>
                <td className="p-1.5 min-w-[150px]">
                  <TextInput label="Class name" value={c.name} disabled={locked} onCommit={(v) => setClass(c.id, { name: v })} />
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-[#5B6478]">
                    <input
                      aria-label={`${c.name} depreciation rate`}
                      type="number"
                      min={0}
                      max={100}
                      step="0.5"
                      disabled={locked}
                      defaultValue={c.rate}
                      onBlur={(e) => e.target.value !== String(c.rate) && setClass(c.id, { rate: e.target.value })}
                      className="w-14 px-1 py-0.5 border border-[#D5DBE7] rounded text-right font-mono"
                    />
                    % straight line
                  </div>
                </td>
                <td className="p-1.5">
                  <MoneyInput label={`${c.name} opening cost`} value={c.cost_opening_p} disabled={locked} onCommit={(p) => setClass(c.id, { cost_opening_p: p })} />
                </td>
                <td className="p-2 text-right font-mono">{formatPence(t[`${c.id}_additions`] ?? 0n, { symbol: '' })}</td>
                <td className="p-2 text-right font-mono">{fmtTb(-(t[`${c.id}_disposals`] ?? 0n))}</td>
                <td className="p-2 text-right font-mono font-bold">{formatPence(t[`${c.id}_cost`] ?? 0n, { symbol: '' })}</td>
                <td className="p-1.5">
                  <MoneyInput label={`${c.name} opening depreciation`} value={c.deprec_opening_p} disabled={locked} onCommit={(p) => setClass(c.id, { deprec_opening_p: p })} />
                </td>
                <td className="p-1.5">
                  <MoneyInput label={`${c.name} depreciation charge`} value={c.charge_p} disabled={locked} onCommit={(p) => setClass(c.id, { charge_p: p })} />
                </td>
                <td className="p-2 text-right font-mono">{fmtTb(-(t[`${c.id}_dep_disposals`] ?? 0n))}</td>
                <td className="p-2 text-right font-mono font-bold">{formatPence(t[`${c.id}_dep`] ?? 0n, { symbol: '' })}</td>
                <td className="p-2 text-right font-mono font-bold">{formatPence(t[`${c.id}_nbv`] ?? 0n, { symbol: '' })}</td>
                <td className="p-2">
                  <div className="flex items-center gap-2 flex-wrap">{tickFor(c.id, c.name)}<RowFiles files={filesFor(c.id)} onPreview={preview} onAttach={() => attachTo(c.id)} disabled={locked} label={c.name} /></div>
                </td>
                <td className="p-1">
                  <RemoveButton
                    disabled={locked || classes.length <= 1}
                    label={`Remove ${c.name}`}
                    onClick={() =>
                      save({
                        classes: (live().classes ?? []).filter((x: any) => x.id !== c.id),
                        movements: (live().movements ?? []).filter((m: any) => m.class_id !== c.id),
                      })
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-[#102654]/20 font-bold">
            <tr>
              <td className="p-2">Total</td>
              <td colSpan={3} />
              <td className="p-2 text-right font-mono">{formatPence(t.cost ?? 0n, { symbol: '' })}</td>
              <td />
              <td className="p-2 text-right font-mono">{formatPence(t.charge ?? 0n, { symbol: '' })}</td>
              <td />
              <td className="p-2 text-right font-mono">{formatPence(t.dep ?? 0n, { symbol: '' })}</td>
              <td className="p-2 text-right font-mono text-[#0B6B52]">{formatPence(t.nbv ?? 0n)}</td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      </div>
      {!locked && (
        <div>
          <button
            type="button"
            className={addBtn}
            onClick={() =>
              save({ classes: [...(live().classes ?? []), { id: newId('c'), name: 'New class', rate: '25', cost_opening_p: '0', deprec_opening_p: '0', charge_p: '0' }] })
            }
          >
            <Plus className="w-3.5 h-3.5" /> Add asset class
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <label className="p-3 rounded-[10px] bg-[#F6F7FB] border border-[#E3E7EF] flex flex-col gap-1">
          <span className="font-bold text-[#102654]">Depreciation policy</span>
          <TextInput label="Depreciation policy" value={data.policy} disabled={locked} onCommit={(v) => save({ policy: v })} />
        </label>
        <div className="p-3 rounded-[10px] bg-[#F6F7FB] border border-[#E3E7EF]">
          <div className="font-bold text-[#102654]">Proof in total</div>
          <div className="mt-1 text-[#5B6478]">
            {classes.map((c) => `${formatPence(t[`${c.id}_cost`] ?? 0n, { symbol: '' })} × ${c.rate}%`).join(' + ')} ={' '}
            <strong className="font-mono text-[#102654]">{formatPence(t.expected ?? 0n)}</strong>
            {(t.expected ?? 0n) === (t.charge ?? 0n) ? ' · matches the charge ✓' : ` · charge is ${formatPence(t.charge ?? 0n)}`}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold text-[#102654] mb-2">Additions and disposals in the year</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-[#102654]">
            <thead className="bg-[#F6F7FB]">
              <tr>
                {['Type', 'Date', 'Item', 'Class', 'Cost', 'Depreciation out', 'Proceeds', 'Profit / (loss)', 'Evidence', ''].map((h, i) => (
                  <th key={i} className={`${th} ${i >= 4 && i <= 7 ? 'text-right' : 'text-left'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E7EF]">
              {movements.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-3 text-[11px] text-[#7E8DA6]">
                    No additions or disposals yet.
                  </td>
                </tr>
              )}
              {movements.map((m) => {
                const isDisp = m.type === 'disposal';
                const pl = asPence(m.proceeds_p) - (asPence(m.cost_p) - asPence(m.deprec_p));
                return (
                  <tr key={m.id}>
                    <td className="p-2 font-semibold whitespace-nowrap">{isDisp ? 'Disposal' : 'Addition'}</td>
                    <td className="p-1.5">
                      <input
                        type="date"
                        aria-label="Date"
                        disabled={locked}
                        defaultValue={m.date}
                        onBlur={(e) => e.target.value !== m.date && setMove(m.id, { date: e.target.value })}
                        className="px-1.5 py-1 border border-[#D5DBE7] rounded-[8px] text-xs"
                      />
                    </td>
                    <td className="p-1.5 min-w-[160px]">
                      <TextInput label="Item" value={m.item} disabled={locked} placeholder="e.g. 2 laptops" onCommit={(v) => setMove(m.id, { item: v })} />
                    </td>
                    <td className="p-1.5">
                      <select
                        aria-label="Asset class"
                        disabled={locked}
                        value={m.class_id}
                        onChange={(e) => setMove(m.id, { class_id: e.target.value })}
                        className="px-1.5 py-1 border border-[#D5DBE7] rounded-[8px] text-xs bg-white"
                      >
                        {classes.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-1.5">
                      <MoneyInput label="Cost" value={m.cost_p} disabled={locked} allowNegative={false} onCommit={(p) => setMove(m.id, { cost_p: p })} />
                    </td>
                    <td className="p-1.5">
                      {isDisp ? (
                        <MoneyInput label="Depreciation out" value={m.deprec_p} disabled={locked} allowNegative={false} onCommit={(p) => setMove(m.id, { deprec_p: p })} />
                      ) : (
                        <span className="block text-right text-[#7E8DA6]">—</span>
                      )}
                    </td>
                    <td className="p-1.5">
                      {isDisp ? (
                        <MoneyInput label="Proceeds" value={m.proceeds_p} disabled={locked} allowNegative={false} onCommit={(p) => setMove(m.id, { proceeds_p: p })} />
                      ) : (
                        <span className="block text-right text-[#7E8DA6]">—</span>
                      )}
                    </td>
                    <td className={`p-2 text-right font-mono ${isDisp && pl < 0n ? 'text-[#B42318]' : ''}`}>{isDisp ? fmtTb(pl) : '—'}</td>
                    <td className="p-2">
                      <div className="flex items-center gap-2 flex-wrap">{tickFor(m.id, m.item || 'this item')}<RowFiles files={filesFor(m.id)} onPreview={preview} onAttach={() => attachTo(m.id)} disabled={locked} label={m.item || 'this item'} /></div>
                    </td>
                    <td className="p-1">
                      <RemoveButton disabled={locked} label="Remove item" onClick={() => save({ movements: (live().movements ?? []).filter((x: any) => x.id !== m.id) })} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!locked && (
          <div className="flex gap-2 mt-2">
            <button type="button" className={addBtn} onClick={() => addMove('addition')}>
              <Plus className="w-3.5 h-3.5" /> Add addition
            </button>
            <button type="button" className={addBtn} onClick={() => addMove('disposal')}>
              <Plus className="w-3.5 h-3.5" /> Add disposal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Generic line schedule (debtors, creditors, stock, tax, income, costs, equity) ---------- */
export function LinesSchedule({ data, result, locked, save, filesFor, attachTo, preview, tickFor, live }: ScheduleProps) {
  const t = result.template;
  const extraCols: { key: string; label: string; money?: boolean; inTotal?: boolean; custom?: boolean }[] = data.extra_columns ?? [];
  const cols = [...(t.columns ?? [{ key: 'amount', label: 'Amount' }]), ...extraCols];
  const lines: any[] = data.lines ?? [];
  const addColumn = (label: string, money: boolean) => {
    const key = `x${Date.now().toString(36)}`;
    save({ extra_columns: [...(live().extra_columns ?? []), { key, label, money, inTotal: false, custom: true }] });
  };
  const setLine = (id: string, patch: Record<string, any>) =>
    save({ lines: (live().lines ?? []).map((l: any) => (l.id === id ? { ...l, ...patch } : l)) });
  const addLine = () => {
    const blank: Record<string, any> = { id: newId('l'), desc: '', ref: '' };
    cols.forEach((c) => (blank[c.money === false ? c.key : `${c.key}_p`] = c.money === false ? '' : '0'));
    save({ lines: [...(live().lines ?? []), blank] });
  };
  const colTotal = (key: string) => lines.reduce<bigint>((acc, l) => acc + asPence(l[`${key}_p`]), 0n);
  const totalCheck = result.checks.find((c) => c.id === 'total_tb');

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-[#102654]">
          <thead className="bg-[#F6F7FB]">
            <tr>
              <th className={`${th} text-left`}>Description</th>
              <th className={`${th} text-left`}>Reference</th>
              {cols.map((c: any) => (
                <th key={c.key} className={`${th} text-right`}>
                  {c.label}
                  {c.custom && !locked && (
                    <button
                      type="button"
                      aria-label={`Remove column ${c.label}`}
                      title="Remove column"
                      onClick={() => save({ extra_columns: (live().extra_columns ?? []).filter((x: any) => x.key !== c.key) })}
                      className="ml-1 text-[#7E8DA6] hover:text-[#B42318]"
                    >
                      ×
                    </button>
                  )}
                </th>
              ))}
              <th className={`${th} text-left`}>Evidence</th>
              <th />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E3E7EF]">
            {lines.length === 0 && (
              <tr>
                <td colSpan={cols.length + 4} className="p-3 text-[11px] text-[#7E8DA6]">
                  No lines yet. Add the balances that make up this area.
                </td>
              </tr>
            )}
            {lines.map((l) => (
              <tr key={l.id}>
                <td className="p-1.5 min-w-[180px]">
                  <TextInput label="Description" value={l.desc} disabled={locked} placeholder="e.g. Customer or supplier" onCommit={(v) => setLine(l.id, { desc: v })} />
                </td>
                <td className="p-1.5 min-w-[100px]">
                  <TextInput label="Reference" value={l.ref} disabled={locked} placeholder="Ref" onCommit={(v) => setLine(l.id, { ref: v })} />
                </td>
                {cols.map((c) => (
                  <td key={c.key} className="p-1.5">
                    {c.money === false ? (
                      <TextInput label={c.label} value={l[c.key]} disabled={locked} className="text-right font-mono" onCommit={(v) => setLine(l.id, { [c.key]: v })} />
                    ) : (
                      <MoneyInput label={`${l.desc || 'line'} ${c.label}`} value={l[`${c.key}_p`]} disabled={locked} onCommit={(p) => setLine(l.id, { [`${c.key}_p`]: p })} />
                    )}
                  </td>
                ))}
                <td className="p-2">
                  <div className="flex items-center gap-2 flex-wrap">{tickFor(l.id, l.desc || 'this line')}<RowFiles files={filesFor(l.id)} onPreview={preview} onAttach={() => attachTo(l.id)} disabled={locked} label={l.desc || 'this line'} /></div>
                </td>
                <td className="p-1">
                  <RemoveButton disabled={locked} label="Remove line" onClick={() => save({ lines: (live().lines ?? []).filter((x: any) => x.id !== l.id) })} />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-[#102654]/20 font-bold">
            <tr>
              <td className="p-2" colSpan={2}>
                Total
              </td>
              {cols.map((c) => (
                <td key={c.key} className="p-2 text-right font-mono">
                  {c.money === false ? '' : formatPence(colTotal(c.key), { symbol: '' })}
                </td>
              ))}
              <td colSpan={2} className={`p-2 text-[11px] ${totalCheck?.passed ? 'text-[#0B6B52]' : 'text-[#A23A27]'}`}>
                {totalCheck?.passed ? '✓ Agrees to TB' : 'Does not agree to TB yet'}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      {!locked && (
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className={addBtn} onClick={addLine}>
            <Plus className="w-3.5 h-3.5" /> Add line
          </button>
          <AddOption label="Add money column" placeholder="Column name" onAdd={(v) => addColumn(v, true)} />
          <AddOption label="Add text column" placeholder="Column name" onAdd={(v) => addColumn(v, false)} />
        </div>
      )}
      {cols.some((c) => c.inTotal === false && c.money !== false) && (
        <p className="text-[10px] text-[#5B6478]">
          {cols
            .filter((c) => c.inTotal === false && c.money !== false)
            .map((c) => c.label)
            .join(' and ')}{' '}
          {cols.filter((c) => c.inTotal === false && c.money !== false).length > 1 ? 'are' : 'is'} for comparison and not included in the total.
        </p>
      )}
    </div>
  );
}

/* ---------- Checklists (planning, completion, disclosures) ---------- */
export function ChecklistSchedule({ data, result, locked, save, filesFor, attachTo, preview, tickFor, live }: ScheduleProps) {
  const items: any[] = data.items ?? [];
  const setItem = (id: string, patch: Record<string, any>) =>
    save({ items: (live().items ?? []).map((i: any) => (i.id === id ? { ...i, ...patch } : i)) });
  const t = result.totals;
  return (
    <div className="flex flex-col gap-4">
      {result.template.materiality && (
        <div className="p-4 rounded-[12px] bg-[#F6F7FB] border border-[#E3E7EF] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <label className="flex flex-col gap-1">
            <span className="font-semibold">Benchmark</span>
            <TextInput label="Benchmark name" value={data.benchmark_name} disabled={locked} onCommit={(v) => save({ benchmark_name: v })} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-semibold">Benchmark amount</span>
            <MoneyInput label="Benchmark amount" value={data.benchmark_p} disabled={locked} allowNegative={false} onCommit={(p) => save({ benchmark_p: p })} />
            {!locked && (t.benchmark_tb ?? 0n) > 0n && (
              <button type="button" className="text-[10px] font-bold text-[#B8432F] hover:underline text-left" onClick={() => save({ benchmark_p: String(t.benchmark_tb) })}>
                Use revenue from TB ({formatPence(t.benchmark_tb)})
              </button>
            )}
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-semibold">Materiality %</span>
            <input
              type="number"
              min={0}
              step="0.1"
              aria-label="Materiality percentage"
              disabled={locked}
              defaultValue={data.percent}
              onBlur={(e) => e.target.value !== String(data.percent) && save({ percent: e.target.value })}
              className="px-2 py-1.5 border border-[#D5DBE7] rounded-[8px] font-mono text-right bg-white"
            />
            <span className="text-[10px] text-[#5B6478]">Materiality {formatPence(t.materiality ?? 0n)}</span>
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-semibold">Performance materiality %</span>
            <input
              type="number"
              min={0}
              max={100}
              step="5"
              aria-label="Performance materiality percentage"
              disabled={locked}
              defaultValue={data.pm_percent}
              onBlur={(e) => e.target.value !== String(data.pm_percent) && save({ pm_percent: e.target.value })}
              className="px-2 py-1.5 border border-[#D5DBE7] rounded-[8px] font-mono text-right bg-white"
            />
            <span className="text-[10px] text-[#5B6478]">Performance {formatPence(t.performance ?? 0n)}</span>
          </label>
        </div>
      )}
      <ul className="divide-y divide-[#E3E7EF] border border-[#E3E7EF] rounded-[12px]">
        {items.map((i) => (
          <li key={i.id} className="p-3 flex flex-col gap-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-xs font-semibold text-[#102654] flex-1">{i.question}</span>
              <div className="flex gap-1" role="group" aria-label={`Answer: ${i.question}`}>
                {(['yes', 'no', 'na'] as const).map((a) => (
                  <button
                    key={a}
                    type="button"
                    disabled={locked}
                    aria-pressed={i.answer === a}
                    onClick={() => setItem(i.id, { answer: i.answer === a ? null : a })}
                    className={`min-w-[44px] min-h-[30px] px-2 text-[11px] font-bold rounded-[8px] border ${
                      i.answer === a
                        ? a === 'no'
                          ? 'bg-[#FFF1EE] border-[#FF7D6B] text-[#A23A27]'
                          : 'bg-[#102654] border-[#102654] text-white'
                        : 'bg-white border-[#D5DBE7] text-[#102654] hover:border-[#102654]'
                    } disabled:opacity-60`}
                  >
                    {a === 'na' ? 'N/A' : a === 'yes' ? 'Yes' : 'No'}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <TextInput
                label={`Comment: ${i.question}`}
                value={i.comment}
                disabled={locked}
                placeholder={i.answer === 'no' ? 'Explain the exception (required)' : 'Comment (optional)'}
                onCommit={(v) => setItem(i.id, { comment: v })}
              />
              <div className="flex items-center gap-2 flex-wrap">{tickFor(i.id, i.question)}<RowFiles files={filesFor(i.id)} onPreview={preview} onAttach={() => attachTo(i.id)} disabled={locked} label={i.question} /><RemoveButton disabled={locked} label="Remove question" onClick={() => save({ items: (live().items ?? []).filter((x: any) => x.id !== i.id) })} /></div>
            </div>
          </li>
        ))}
        {items.length === 0 && <li className="p-3 text-[11px] text-[#7E8DA6]">No questions. Add one below.</li>}
      </ul>
      <AddOption
        label="Add question"
        placeholder="Question to answer"
        disabled={locked}
        onAdd={(q) => save({ items: [...(live().items ?? []), { id: newId('q'), question: q, answer: null, comment: '' }] })}
      />
    </div>
  );
}

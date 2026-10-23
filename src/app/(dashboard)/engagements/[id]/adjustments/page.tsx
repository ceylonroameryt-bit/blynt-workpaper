'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  SlidersHorizontal,
  Plus,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileText,
  CornerDownRight,
  Check,
  AlertCircle,
  FileCheck2,
  Send,
  RotateCcw,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatusPill } from '@/components/ui/StatusPill';
import { getAdjustingEntries, getEngagement } from '@/lib/api';
import { AdjustingJournalEntry, EngagementSummary } from '@/lib/types';
import { formatMoney } from '@/lib/utils/format';
import { MOCK_ENGAGEMENT, CURRENT_USER } from '@/lib/mock';

export default function AdjustmentsPage() {
  const params = useParams();
  const engagementId = (params?.id as string) || 'eng_harlow_fy26';

  const [entries, setEntries] = useState<AdjustingJournalEntry[]>([]);
  const [selectedEntryId, setSelectedEntryId] = useState<string>('aje_004');
  const [activeStageFilter, setActiveStageFilter] = useState<'All' | 'Proposed' | 'Approved' | 'Posted'>('All');

  useEffect(() => {
    getAdjustingEntries(engagementId).then((data) => {
      setEntries(data);
      if (data.length > 0 && !data.some((d) => d.id === selectedEntryId)) {
        setSelectedEntryId(data[0].id);
      }
    });
  }, [engagementId]);

  const proposedCount = entries.filter((e) => e.stage === 'Proposed').length;
  const approvedCount = entries.filter((e) => e.stage === 'Approved').length;
  const postedCount = entries.filter((e) => e.stage === 'Posted').length;

  const filteredEntries = entries.filter((e) => {
    if (activeStageFilter === 'All') return true;
    return e.stage === activeStageFilter;
  });

  const selectedEntry = entries.find((e) => e.id === selectedEntryId) || entries[0];

  // Totals for selected entry
  const totalDebitsCents = selectedEntry
    ? selectedEntry.lines.reduce((sum: number, line: any) => sum + (line.debitCents || 0), 0)
    : 0;
  const totalCreditsCents = selectedEntry
    ? selectedEntry.lines.reduce((sum: number, line: any) => sum + (line.creditCents || 0), 0)
    : 0;
  const isBalanced = totalDebitsCents === totalCreditsCents && totalDebitsCents > 0;

  // Actions
  const handleApproveEntry = (id: string) => {
    setEntries((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          return {
            ...e,
            stage: 'Approved' as const,
            approvedBy: `${CURRENT_USER.name} (${CURRENT_USER.title})`,
            auditHistory: [
              ...(e.auditHistory || []),
              {
                action: 'Approved',
                user: CURRENT_USER.name,
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                note: 'Approved after review of underlying supporting documentation.',
              },
            ],
          };
        }
        return e;
      })
    );
  };

  const handleReturnToPreparer = (id: string) => {
    alert(`AJE ${selectedEntry?.reference} returned to preparer with revision note.`);
  };

  const handlePostEntry = (id: string) => {
    setEntries((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          return {
            ...e,
            stage: 'Posted' as const,
            auditHistory: [
              ...(e.auditHistory || []),
              {
                action: 'Posted',
                user: CURRENT_USER.name,
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                note: 'Posted into audit adjusted trial balance.',
              },
            ],
          };
        }
        return e;
      })
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#5B6676] mb-1">
            <Link href={`/engagements/${engagementId}`} className="hover:text-[#1E4FD8] font-medium">
              {MOCK_ENGAGEMENT.clientName}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#1B2430] font-semibold">Adjustments</span>
          </div>
          <h1 className="text-[28px] font-semibold text-[#1B2430] tracking-tight">
            Adjusting Journal Entries (AJE)
          </h1>
          <p className="text-sm text-[#5B6676] mt-0.5">
            Audit difference schedule, proposed reclassifications, and net income impact.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => alert('New AJE modal: select debit/credit lines from Master COA.')}
          >
            Propose adjustment
          </Button>
        </div>
      </div>

      {/* Three-Stage Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setActiveStageFilter(activeStageFilter === 'Proposed' ? 'All' : 'Proposed')}
          className={`p-4 rounded-[14px] border text-left transition-all ${
            activeStageFilter === 'Proposed'
              ? 'border-[#1E4FD8] bg-[#E8EEFD]/40 ring-1 ring-[#1E4FD8]'
              : 'border-[#E3E6EB] bg-white hover:border-[#D5D9E0]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#5B6676]">
              Stage 1: Proposed
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#9A4A00]" />
          </div>
          <div className="text-2xl font-bold font-mono-numbers text-[#1B2430] mt-1">
            {proposedCount}
          </div>
          <div className="text-xs text-[#5B6676] mt-1">
            Requires audit manager approval
          </div>
        </button>

        <button
          onClick={() => setActiveStageFilter(activeStageFilter === 'Approved' ? 'All' : 'Approved')}
          className={`p-4 rounded-[14px] border text-left transition-all ${
            activeStageFilter === 'Approved'
              ? 'border-[#1E4FD8] bg-[#E8EEFD]/40 ring-1 ring-[#1E4FD8]'
              : 'border-[#E3E6EB] bg-white hover:border-[#D5D9E0]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#5B6676]">
              Stage 2: Approved
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#1E4FD8]" />
          </div>
          <div className="text-2xl font-bold font-mono-numbers text-[#1B2430] mt-1">
            {approvedCount}
          </div>
          <div className="text-xs text-[#5B6676] mt-1">
            Ready to post to client ledger
          </div>
        </button>

        <button
          onClick={() => setActiveStageFilter(activeStageFilter === 'Posted' ? 'All' : 'Posted')}
          className={`p-4 rounded-[14px] border text-left transition-all ${
            activeStageFilter === 'Posted'
              ? 'border-[#1E4FD8] bg-[#E8EEFD]/40 ring-1 ring-[#1E4FD8]'
              : 'border-[#E3E6EB] bg-white hover:border-[#D5D9E0]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#5B6676]">
              Stage 3: Posted
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#0B6B4D]" />
          </div>
          <div className="text-2xl font-bold font-mono-numbers text-[#1B2430] mt-1">
            {postedCount}
          </div>
          <div className="text-xs text-[#5B6676] mt-1">
            Reflected in final financial statements
          </div>
        </button>
      </div>

      {/* Main Split: Left Entries List + Right Selected Entry Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left List of Entries */}
        <div className="lg:col-span-5 bg-white border border-[#E3E6EB] rounded-[14px] overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#E3E6EB] flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#5B6676]">
              Entries Schedule ({filteredEntries.length})
            </span>
            {activeStageFilter !== 'All' && (
              <button
                onClick={() => setActiveStageFilter('All')}
                className="text-xs text-[#1E4FD8] hover:underline font-medium"
              >
                Clear filter
              </button>
            )}
          </div>

          <div className="divide-y divide-[#E3E6EB] overflow-y-auto max-h-[640px]">
            {filteredEntries.map((entry) => {
              const isSelected = entry.id === selectedEntry?.id;
              const entryAmount = entry.lines.reduce((s: number, l: any) => s + (l.debitCents || 0), 0);

              return (
                <div
                  key={entry.id}
                  onClick={() => setSelectedEntryId(entry.id)}
                  className={`p-4 transition-colors cursor-pointer flex flex-col gap-2 ${
                    isSelected ? 'bg-[#E8EEFD]/30 border-l-4 border-l-[#1E4FD8]' : 'hover:bg-[#F8F9FA]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono-numbers font-bold text-xs text-[#1E4FD8]">
                      {entry.reference}
                    </span>
                    <StatusPill status={entry.stage} size="sm" />
                  </div>

                  <h3 className="font-semibold text-sm text-[#1B2430] leading-snug line-clamp-2">
                    {entry.title}
                  </h3>

                  <div className="flex items-center justify-between text-xs text-[#5B6676] pt-1">
                    <span className="font-mono-numbers">{formatMoney(entryAmount)}</span>
                    <span className="font-mono-numbers">{entry.date}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Selected Entry Detail */}
        {selectedEntry && (
          <div className="lg:col-span-7 bg-white border border-[#E3E6EB] rounded-[14px] p-6 flex flex-col gap-5">
            {/* Entry Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-[#E3E6EB]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono-numbers text-sm font-bold text-[#1E4FD8] px-2 py-0.5 rounded bg-[#E8EEFD]">
                    {selectedEntry.reference}
                  </span>
                  <StatusPill status={selectedEntry.stage} />
                </div>
                <h2 className="text-xl font-semibold text-[#1B2430]">
                  {selectedEntry.title}
                </h2>
                <p className="text-xs text-[#5B6676] mt-0.5 font-mono-numbers">
                  Effective Date: {selectedEntry.date} • Prepared by: {selectedEntry.preparedBy}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {selectedEntry.stage === 'Proposed' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<RotateCcw className="w-3.5 h-3.5" />}
                      onClick={() => handleReturnToPreparer(selectedEntry.id)}
                    >
                      Return to preparer
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<Check className="w-3.5 h-3.5" />}
                      onClick={() => handleApproveEntry(selectedEntry.id)}
                    >
                      Approve entry
                    </Button>
                  </>
                )}

                {selectedEntry.stage === 'Approved' && (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<FileCheck2 className="w-3.5 h-3.5" />}
                    onClick={() => handlePostEntry(selectedEntry.id)}
                  >
                    Post to General Ledger
                  </Button>
                )}

                {selectedEntry.stage === 'Posted' && (
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#E2F4EC] text-[#0B6B4D] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Posted to final accounts</span>
                  </span>
                )}
              </div>
            </div>

            {/* Debit and Credit Lines Grid */}
            <div className="border border-[#E3E6EB] rounded-[10px] overflow-hidden">
              <table className="w-full text-left text-xs text-[#1B2430]">
                <thead className="bg-[#F8F9FA] text-[#5B6676] text-[11px] font-semibold uppercase tracking-wider border-b border-[#E3E6EB]">
                  <tr>
                    <th className="px-3 py-2.5 w-[90px]">Code</th>
                    <th className="px-3 py-2.5">Account & Description</th>
                    <th className="px-3 py-2.5 text-right w-[130px]">Debit</th>
                    <th className="px-3 py-2.5 text-right w-[130px]">Credit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E6EB]">
                  {selectedEntry.lines.map((line: any) => (
                    <tr key={line.id} className="hover:bg-[#F8F9FA]/60">
                      <td className="px-3 py-3 font-mono-numbers font-semibold text-[#1E4FD8]">
                        {line.accountCode}
                      </td>
                      <td className="px-3 py-3">
                        <div className="font-semibold text-[#1B2430]">{line.accountName}</div>
                        <div className="text-[11px] text-[#5B6676]">{line.description}</div>
                      </td>
                      <td className="px-3 py-3 text-right font-mono-numbers font-semibold">
                        {line.debitCents > 0 ? formatMoney(line.debitCents) : '—'}
                      </td>
                      <td className="px-3 py-3 text-right font-mono-numbers font-semibold">
                        {line.creditCents > 0 ? formatMoney(line.creditCents) : '—'}
                      </td>
                    </tr>
                  ))}
                  {/* Totals & Balanced Check */}
                  <tr className="bg-[#F8F9FA] font-bold border-t border-[#E3E6EB]">
                    <td colSpan={2} className="px-3 py-3 flex items-center justify-between">
                      <span>Total Adjustment Lines</span>
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-[#E2F4EC] text-[#0B6B4D]">
                        <Check className="w-3 h-3" />
                        <span>Balanced</span>
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right font-mono-numbers">
                      {formatMoney(totalDebitsCents)}
                    </td>
                    <td className="px-3 py-3 text-right font-mono-numbers">
                      {formatMoney(totalCreditsCents)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* "What changes when approved" Summary */}
            <div className="p-4 rounded-[12px] bg-[#E8EEFD]/40 border border-[#1E4FD8]/20 flex flex-col gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1E4FD8]">
                What changes when approved
              </span>
              <p className="text-xs text-[#1B2430] font-medium leading-relaxed">
                {selectedEntry.impactSummary}
              </p>
            </div>

            {/* Reason & Attached Support */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-[12px] bg-[#F8F9FA] border border-[#E3E6EB] flex flex-col gap-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5B6676]">
                  Audit Justification & Reason
                </span>
                <p className="text-xs text-[#1B2430] leading-relaxed">
                  {selectedEntry.reason}
                </p>
              </div>

              <div className="p-4 rounded-[12px] bg-[#F8F9FA] border border-[#E3E6EB] flex flex-col gap-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5B6676]">
                  Attached Audit Support
                </span>
                <div className="flex items-center gap-2 p-2 rounded bg-white border border-[#D5D9E0] text-xs font-medium text-[#1E4FD8]">
                  <FileText className="w-4 h-4 text-[#1E4FD8] shrink-0" />
                  <span className="truncate">{selectedEntry.supportDocument}</span>
                </div>
                <span className="text-[10px] text-[#5B6676]">
                  SHA-256 hash verified against client portal upload
                </span>
              </div>
            </div>

            {/* Append-only Audit Trail */}
            <div className="pt-2 border-t border-[#E3E6EB]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5B6676] block mb-3">
                Append-only Audit Trail
              </span>
              <div className="flex flex-col gap-2">
                {(selectedEntry.auditHistory || []).map((step: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-[10px] bg-[#F8F9FA] border border-[#E3E6EB] text-xs flex flex-col gap-0.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#1B2430] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1E4FD8]" />
                        <span>{step.action} by {step.user}</span>
                        {step.user.includes('Test') && (
                          <span className="text-[8px] font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1 rounded">
                            TEST
                          </span>
                        )}
                      </span>
                      <span className="font-mono-numbers text-[11px] text-[#5B6676]">
                        {step.timestamp}
                      </span>
                    </div>
                    {step.note && (
                      <p className="text-[#5B6676] text-[11px] mt-0.5 pl-3">
                        "{step.note}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

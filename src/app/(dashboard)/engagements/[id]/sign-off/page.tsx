'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  FileText,
  ShieldCheck,
  UserCheck,
  Clock,
  ArrowRight,
  ExternalLink,
  Download,
  FileSpreadsheet,
  ChevronRight,
  Ban,
  Check,
  AlertTriangle,
  History,
  FileArchive,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatusPill } from '@/components/ui/StatusPill';
import { Dialog } from '@/components/ui/Dialog';
import { MOCK_ENGAGEMENT, CURRENT_USER, TEAM_MEMBERS } from '@/lib/mock';
import { StatusKey } from '@/lib/types';

interface MatrixRow {
  workpaperId: string;
  ref: string;
  title: string;
  status: string;
  preparer: { initials: string; signed_at: string; is_stale: boolean } | null;
  reviewer: { initials: string; signed_at: string; is_stale: boolean } | null;
  partner: { initials: string; signed_at: string; is_stale: boolean } | null;
}

export default function SignOffAndLockPage() {
  const params = useParams();
  const router = useRouter();
  const engagementId = (params?.id as string) || 'eng_harlow_fy26';

  const [blockersData, setBlockersData] = useState<any>(null);
  const [matrix, setMatrix] = useState<MatrixRow[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [reportDate, setReportDate] = useState('2026-09-30');
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState<any>(null);

  const [isLocking, setIsLocking] = useState(false);
  const [isEngagementLocked, setIsEngagementLocked] = useState(false);
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false);
  const [unlockReason, setUnlockReason] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const [staleModalPaper, setStaleModalPaper] = useState<MatrixRow | null>(null);

  const loadData = async () => {
    try {
      // 1. Fetch live blockers
      const bRes = await fetch(`/api/v1/engagements/${engagementId}/blockers`);
      if (bRes.ok) {
        const bData = await bRes.json();
        setBlockersData(bData);
        setIsEngagementLocked(bData.summary?.isLocked || false);
      }

      // 2. Fetch engagement details
      const eRes = await fetch(`/api/v1/engagements/${engagementId}`);
      if (eRes.ok) {
        const eData = await eRes.json();
        setIsEngagementLocked(eData.engagement?.status === 'locked');
      }

      // 3. Fetch audit logs
      const aRes = await fetch(`/api/v1/engagements/${engagementId}/audit-log`);
      if (aRes.ok) {
        const aData = await aRes.json();
        setAuditLogs(aData.logs || []);
      }

      // 4. Matrix state
      const mockMatrix: MatrixRow[] = [
        {
          workpaperId: 'wp_f10',
          ref: 'F-10',
          title: 'Fixed asset register and depreciation',
          status: 'Prepared',
          preparer: { initials: 'AK', signed_at: '02 Oct 2026, 09:35', is_stale: false },
          reviewer: { initials: 'SR', signed_at: '02 Oct 2026, 11:20', is_stale: true },
          partner: null,
        },
        {
          workpaperId: 'wp_b10',
          ref: 'B-10',
          title: 'Bank reconciliation - Barclays Operating',
          status: 'Prepared',
          preparer: { initials: 'AK', signed_at: '01 Oct 2026, 14:15', is_stale: false },
          reviewer: { initials: 'SR', signed_at: '01 Oct 2026, 16:40', is_stale: false },
          partner: null,
        },
        {
          workpaperId: 'wp_c01',
          ref: 'C-01',
          title: 'Trade debtors circularisation and aging',
          status: 'Prepared',
          preparer: { initials: 'JM', signed_at: '30 Sep 2026, 16:00', is_stale: false },
          reviewer: null,
          partner: null,
        },
        {
          workpaperId: 'wp_k01',
          ref: 'K-01',
          title: 'Trade creditors and unrecorded liabilities search',
          status: 'In progress',
          preparer: null,
          reviewer: null,
          partner: null,
        },
      ];
      setMatrix(mockMatrix);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [engagementId]);

  const blockers = blockersData?.blockers || [];
  const blockedCount = blockers.length;
  const isLockDisabled = blockedCount > 0 || isEngagementLocked;

  const handleExportBundle = async () => {
    setIsExporting(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/v1/engagements/${engagementId}/export`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error || 'Failed to export bundle.');
      } else {
        setExportResult(data);
      }
    } catch (err: any) {
      setActionError(err.message || 'Export error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleLockEngagement = async () => {
    setIsLocking(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/v1/engagements/${engagementId}/lock`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error || 'Failed to lock engagement.');
      } else {
        setIsEngagementLocked(true);
        loadData();
      }
    } catch (err: any) {
      setActionError(err.message || 'Lock error');
    } finally {
      setIsLocking(false);
    }
  };

  const handleUnlockEngagement = async () => {
    if (!unlockReason.trim()) {
      setActionError('A mandatory documented reason is required to unlock this engagement.');
      return;
    }
    setActionError(null);
    try {
      const res = await fetch(`/api/v1/engagements/${engagementId}/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: unlockReason }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error || 'Failed to unlock engagement.');
      } else {
        setIsEngagementLocked(false);
        setUnlockDialogOpen(false);
        setUnlockReason('');
        loadData();
      }
    } catch (err: any) {
      setActionError(err.message || 'Unlock error');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#5B6478] mb-1">
            <Link href={`/engagements/${engagementId}`} className="hover:text-[#102654] font-medium">
              {MOCK_ENGAGEMENT.clientName}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#102654] font-semibold">Sign-off and lock</span>
          </div>
          <h1 className="text-[28px] font-semibold text-[#102654] tracking-tight">
            Sign-off Matrix & File Assembly Lock
          </h1>
          <p className="text-sm text-[#5B6478] mt-0.5">
            Three-tier ISA sign-off governance, content hash stale tracking, and partner archive lock.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isEngagementLocked ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#E6F4EF] text-[#0B6B52] border border-[#0B6B52]/20 font-mono">
                <Lock className="w-3.5 h-3.5" /> LOCKED ARCHIVE
              </span>
              <Button
                variant="outline"
                size="sm"
                icon={<Unlock className="w-4 h-4 text-[#B8432F]" />}
                onClick={() => setUnlockDialogOpen(true)}
              >
                Unlock file (Partner only)
              </Button>
            </div>
          ) : (
            <Link href={`/engagements/${engagementId}`}>
              <Button
                variant="outline"
                size="md"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Binder overview
              </Button>
            </Link>
          )}
        </div>
      </div>

      {actionError && (
        <div className="p-4 rounded-[12px] bg-[#FDECEA] border border-[#B42318]/30 text-xs text-[#B42318] flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <AlertCircle className="w-4 h-4" />
            <span>{actionError}</span>
          </div>
          <button
            onClick={() => setActionError(null)}
            className="text-xs font-bold underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Three Sign-Off Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Preparer Card */}
        <div className="bg-white border border-[#E3E7EF] rounded-[16px] p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5B6478]">
                Tier 1: Preparer
              </span>
              <span className="text-xs font-bold text-[#0B6B52] bg-[#E6F4EF] px-2 py-0.5 rounded-full">
                ✓ Ready
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-[#102654]">
                Anika Kapoor
              </span>
            </div>
            <div className="text-xs text-[#5B6478] mt-0.5">
              Senior Associate &bull; Lead Preparer
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E3E7EF] text-xs font-mono text-[#0B6B52] flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>3 of 4 papers prepared</span>
          </div>
        </div>

        {/* Reviewer Card */}
        <div className="bg-white border border-[#E3E7EF] rounded-[16px] p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5B6478]">
                Tier 2: Manager Review
              </span>
              <span className="text-xs font-bold text-[#6B4700] bg-[#FFF4DB] px-2 py-0.5 rounded-full">
                ⚠ 1 Stale Sign-off
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-[#102654]">
                Sam Rivera
              </span>
            </div>
            <div className="text-xs text-[#5B6478] mt-0.5">
              Audit Manager &bull; Reviewer
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E3E7EF] text-xs text-[#1D4E89] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>2 signed, 1 marked stale by F-10 edit</span>
          </div>
        </div>

        {/* Partner Lock Card */}
        <div className="bg-white border border-[#E3E7EF] rounded-[16px] p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5B6676]">
                Tier 3: Partner Lock
              </span>
              {isEngagementLocked ? (
                <span className="text-xs font-bold text-[#0B6B52] bg-[#E6F4EF] px-2 py-0.5 rounded-full">
                  ✓ Locked
                </span>
              ) : (
                <span className="text-xs font-bold text-[#B42318] bg-[#FDECEA] px-2 py-0.5 rounded-full">
                  ! Blocked ({blockedCount})
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-[#102654]">
                Priya Lal
              </span>
            </div>
            <div className="text-xs text-[#5B6478] mt-0.5">
              Engagement Partner &bull; Responsible Individual
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E3E7EF] text-xs text-[#B42318] flex items-center gap-1.5">
            {isEngagementLocked ? (
              <span className="text-[#0B6B52] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Locked on {new Date().toLocaleDateString('en-GB')}</span>
              </span>
            ) : (
              <>
                <Ban className="w-3.5 h-3.5" />
                <span>{blockedCount} blocking prerequisite(s) pending</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* MATRIX OF PAPERS × PREPARER / REVIEWER / PARTNER (Ground Rule 16) */}
      <div className="bg-white border border-[#E3E7EF] rounded-[16px] p-6 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-[#102654]">
              Working Papers Sign-off Matrix
            </h2>
            <p className="text-xs text-[#5B6478] mt-0.5">
              Signs are recorded with cryptographic content hashes. If a paper is edited after review, its sign-off is immediately set to <strong>⚠ Stale</strong>.
            </p>
          </div>
          <div className="text-xs font-mono text-[#5B6478] flex items-center gap-3">
            <span className="flex items-center gap-1"><span className="text-[#0B6B52]">✓</span> Signed</span>
            <span className="flex items-center gap-1"><span className="text-[#6B4700]">⚠</span> Stale</span>
            <span className="flex items-center gap-1"><span className="text-[#5B6478]">○</span> Not signed</span>
          </div>
        </div>

        <div className="overflow-x-auto border border-[#E3E7EF] rounded-[12px]">
          <table className="w-full text-left text-xs border-collapse">
            <caption className="sr-only">Sign-off matrix by working paper and review tier</caption>
            <thead className="bg-[#F6F7FB] border-b border-[#E3E7EF] text-[#5B6478] uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th scope="col" className="p-3.5 w-[90px]">Ref</th>
                <th scope="col" className="p-3.5">Working paper</th>
                <th scope="col" className="p-3.5 w-[130px]">Status</th>
                <th scope="col" className="p-3.5 w-[170px] text-center">Preparer</th>
                <th scope="col" className="p-3.5 w-[190px] text-center">Reviewer</th>
                <th scope="col" className="p-3.5 w-[160px] text-center">Partner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E7EF]">
              {matrix.map((row) => (
                <tr key={row.workpaperId} className="hover:bg-[#F6F7FB]/50 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-[#102654]">
                    <Link
                      href={`/engagements/${engagementId}/workpapers/${row.workpaperId}`}
                      className="hover:text-[#B8432F] underline"
                    >
                      {row.ref}
                    </Link>
                  </td>
                  <td className="p-3.5 font-medium text-[#102654]">
                    {row.title}
                  </td>
                  <td className="p-3.5">
                    <StatusPill status={row.status} size="sm" />
                  </td>

                  {/* Preparer Tier */}
                  <td className="p-3.5 text-center">
                    {row.preparer ? (
                      <div className="inline-flex flex-col items-center">
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-[#0B6B52] bg-[#E6F4EF] px-2 py-0.5 rounded-full">
                          ✓ {row.preparer.initials}
                        </span>
                        <span className="text-[10px] text-[#5B6478] mt-0.5">{row.preparer.signed_at.split(',')[0]}</span>
                      </div>
                    ) : (
                      <span className="text-[#5B6478] font-mono">○ Not signed</span>
                    )}
                  </td>

                  {/* Reviewer Tier */}
                  <td className="p-3.5 text-center">
                    {row.reviewer ? (
                      row.reviewer.is_stale ? (
                        <div className="inline-flex flex-col items-center">
                          <button
                            onClick={() => setStaleModalPaper(row)}
                            className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-[#6B4700] bg-[#FFF4DB] px-2 py-0.5 rounded-full border border-[#6B4700]/30 hover:bg-[#FFE8B8] cursor-pointer"
                            aria-label={`Stale sign-off on ${row.ref}. Click to see what changed.`}
                          >
                            <span>⚠ {row.reviewer.initials}</span>
                            <span className="underline ml-0.5 text-[10px]">see changes</span>
                          </button>
                          <span className="text-[10px] text-[#6B4700] mt-0.5">Content modified</span>
                        </div>
                      ) : (
                        <div className="inline-flex flex-col items-center">
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-[#0B6B52] bg-[#E6F4EF] px-2 py-0.5 rounded-full">
                            ✓ {row.reviewer.initials}
                          </span>
                          <span className="text-[10px] text-[#5B6478] mt-0.5">{row.reviewer.signed_at.split(',')[0]}</span>
                        </div>
                      )
                    ) : (
                      <span className="text-[#5B6478] font-mono">○ Not signed</span>
                    )}
                  </td>

                  {/* Partner Tier */}
                  <td className="p-3.5 text-center">
                    {row.partner ? (
                      <div className="inline-flex flex-col items-center">
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-[#0B6B52] bg-[#E6F4EF] px-2 py-0.5 rounded-full">
                          ✓ {row.partner.initials}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[#5B6478] font-mono">○ Not signed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Split: Left Lock Blocker Checklist + Right Archive Bundle & Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Checklist of What Blocks the Lock */}
        <div className="lg:col-span-7 bg-white border border-[#E3E7EF] rounded-[16px] p-6 flex flex-col gap-4 shadow-xs">
          <div>
            <h2 className="text-lg font-semibold text-[#102654]">
              Assembly Lock Blockers ({blockers.length})
            </h2>
            <p className="text-xs text-[#5B6478] mt-0.5">
              Ground rule: Every blocker must be resolved before file locking is permitted by the partner.
            </p>
          </div>

          <div className="flex flex-col gap-3 mt-1">
            {blockers.length === 0 ? (
              <div className="p-6 rounded-[12px] bg-[#E6F4EF] border border-[#0B6B52]/20 text-xs text-[#0B6B52] flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <div>
                  <strong>All assembly prerequisites cleared.</strong> File is ready for Partner sign-off and permanent lock.
                </div>
              </div>
            ) : (
              blockers.map((item: any) => (
                <div
                  key={item.id}
                  className="p-4 rounded-[12px] border border-[#B42318]/25 bg-[#FDECEA]/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 shrink-0">
                      <StatusPill status="needs_you" size="sm" />
                    </span>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-[#5B6478]">
                        {item.category}
                      </div>
                      <div className="text-sm font-semibold text-[#102654] mt-0.5 leading-snug">
                        {item.title}
                      </div>
                    </div>
                  </div>

                  <Link
                    href={item.fixHref}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#B8432F] hover:text-[#912D1C] px-3 py-1.5 rounded-[10px] bg-white border border-[#D5DBE7] hover:bg-[#FFF1EE] transition-colors shrink-0 self-start sm:self-center"
                  >
                    <span>{item.fixLinkText}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Archive Bundle Card + Immutable Activity Log */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Archive Bundle Card */}
          <div className="bg-white border border-[#E3E7EF] rounded-[16px] p-6 flex flex-col gap-4 shadow-xs">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FileArchive className="w-5 h-5 text-[#FF7D6B]" />
                <h3 className="font-semibold text-base text-[#102654]">
                  Immutable PDF Audit Archive Bundle
                </h3>
              </div>
              <p className="text-xs text-[#5B6478]">
                Generates a single consolidated PDF binder (index, trial balance, workpapers, verified attachments, and cryptographic SHA-256 audit log).
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="signoff-report-date" className="text-xs font-semibold uppercase tracking-wider text-[#5B6478]">
                Independent Auditor's Report Date
              </label>
              <input
                id="signoff-report-date"
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2.5 bg-white border border-[#D5DBE7] rounded-[10px] text-sm text-[#102654] focus-visible:outline-2 focus-visible:outline-[#FF7D6B] focus-visible:outline-offset-2"
              />
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                variant="outline"
                size="md"
                loading={isExporting}
                icon={<Download className="w-4 h-4" />}
                onClick={handleExportBundle}
              >
                Generate verified PDF bundle
              </Button>

              {exportResult && (
                <div className="p-3 rounded-[10px] bg-[#E6F4EF] border border-[#0B6B52]/20 text-xs text-[#0B6B52] flex flex-col gap-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Bundle generated & SHA-256 verified!</span>
                  </div>
                  <div className="font-mono text-[10px] break-all text-[#102654]">
                    Hash: {exportResult.checksum}
                  </div>
                </div>
              )}

              {/* Lock File Button */}
              <div className="flex flex-col gap-1.5 mt-2">
                <Button
                  variant="primary"
                  size="md"
                  disabled={isLockDisabled}
                  loading={isLocking}
                  icon={<Lock className="w-4 h-4" />}
                  onClick={handleLockEngagement}
                  className="w-full min-h-[44px]"
                >
                  {isEngagementLocked ? 'File permanently locked' : 'Lock file & complete assembly'}
                </Button>

                {blockedCount > 0 && !isEngagementLocked && (
                  <p className="text-xs text-[#6B4700] flex items-start gap-1.5 bg-[#FFF4DB] p-2.5 rounded-[10px] leading-relaxed">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#6B4700]" />
                    <span>
                      <strong>Lock file disabled</strong>: {blockedCount} blockers must be cleared before partner sign-off can seal the archive.
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Activity Log (Cannot be edited) */}
          <div className="bg-white border border-[#E3E7EF] rounded-[16px] p-6 flex flex-col gap-3 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#E3E7EF]">
              <h3 className="font-semibold text-sm text-[#102654]">
                Activity Log (Append-only)
              </h3>
              <span className="text-[10px] uppercase font-bold text-[#5B6478] bg-[#F6F7FB] px-2 py-0.5 rounded">
                Immutable
              </span>
            </div>

            <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-1">
              {auditLogs.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#5B6478]">
                  Audit log records will appear here as actions occur.
                </div>
              ) : (
                auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-[10px] bg-[#F6F7FB] border border-[#E3E7EF] text-xs flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between font-mono text-[11px] text-[#5B6478]">
                      <span>{log.at || log.timestamp}</span>
                      <span className="font-semibold text-[#102654]">{log.action}</span>
                    </div>
                    <div className="font-semibold text-[#102654]">
                      {log.actor_name || log.user || 'Auditor'} ({log.actor_role || log.role || 'Preparer'})
                    </div>
                    <div className="text-[#5B6478] leading-relaxed">
                      {log.entity} #{log.entity_id}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stale Signoff Details Modal */}
      {staleModalPaper && (
        <Dialog
          isOpen={true}
          onClose={() => setStaleModalPaper(null)}
          title={`⚠ Stale Sign-off: ${staleModalPaper.ref} - ${staleModalPaper.title}`}
        >
          <div className="flex flex-col gap-4 text-xs">
            <div className="p-3 rounded-[10px] bg-[#FFF4DB] border border-[#6B4700]/20 text-[#6B4700]">
              <strong>Why is this sign-off stale?</strong>
              <p className="mt-1">
                The reviewer signed this workpaper on 02 Oct 2026. Afterwards, an asset addition of £2,400.00 was modified in the schedule, changing the cryptographic content hash.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-[#102654]">What changed:</span>
              <ul className="list-disc pl-5 text-[#5B6478] space-y-1">
                <li>Cell <code>additions.computer_equipment</code> updated from £0.00 to £2,400.00</li>
                <li>Invoice attachment <code>INV-Dell-7741.pdf</code> linked to line 2</li>
                <li>Total NBV recalculation triggered</li>
              </ul>
            </div>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E3E7EF]">
              <Link href={`/engagements/${engagementId}/workpapers/${staleModalPaper.workpaperId}`}>
                <Button variant="primary" size="sm">
                  Review & re-sign paper
                </Button>
              </Link>
            </div>
          </div>
        </Dialog>
      )}

      {/* Unlock File Dialog with Mandatory Justification Reason */}
      {unlockDialogOpen && (
        <Dialog
          isOpen={true}
          onClose={() => setUnlockDialogOpen(false)}
          title="Unlock File Archive (Partner Authorization)"
        >
          <div className="flex flex-col gap-4 text-xs">
            <div className="p-3 rounded-[10px] bg-[#FDECEA] border border-[#B42318]/20 text-[#B42318]">
              <strong>Caution: Unlocking an assembled audit file is an audited event.</strong>
              <p className="mt-1">
                Under ISA 230, reopening an engagement after assembly requires documented partner justification. The reason and timestamp are permanently written to the immutable audit trail.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="unlock-reason" className="font-semibold text-[#102654]">
                Mandatory Documentation Reason:
              </label>
              <textarea
                id="unlock-reason"
                rows={4}
                value={unlockReason}
                onChange={(e) => setUnlockReason(e.target.value)}
                placeholder="State the technical rationale (e.g. Subsequent discovery of post-balance sheet adjusting event per IAS 10)..."
                className="w-full p-3 border border-[#D5DBE7] rounded-[10px] text-xs focus-visible:outline-2 focus-visible:outline-[#FF7D6B]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E3E7EF]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUnlockDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleUnlockEngagement}
              >
                Confirm unlock & log to audit
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}

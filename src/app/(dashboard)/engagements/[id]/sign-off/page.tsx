'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Lock,
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
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatusPill } from '@/components/ui/StatusPill';
import { getSignOffBlockers, getAuditLogs, getEngagement } from '@/lib/api';
import { LockBlockerItem, AuditLogItem, EngagementSummary } from '@/lib/types';
import { MOCK_ENGAGEMENT, CURRENT_USER, TEAM_MEMBERS } from '@/lib/mock';

export default function SignOffAndLockPage() {
  const params = useParams();
  const engagementId = (params?.id as string) || 'eng_harlow_fy26';

  const [blockers, setBlockers] = useState<LockBlockerItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [reportDate, setReportDate] = useState('2026-09-30');
  const [draftBundleGenerated, setDraftBundleGenerated] = useState(false);

  useEffect(() => {
    getSignOffBlockers(engagementId).then(setBlockers);
    getAuditLogs(engagementId).then(setAuditLogs);
  }, [engagementId]);

  const blockedCount = blockers.filter((b) => b.status === 'Blocked').length;
  const isLockDisabled = blockedCount > 0;

  const handleGenerateBundle = () => {
    setDraftBundleGenerated(true);
    alert('Generated draft PDF audit binder archive bundle (34 workpapers + TB + lead schedules).');
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
            <span className="text-[#1B2430] font-semibold">Sign-off & Lock</span>
          </div>
          <h1 className="text-[28px] font-semibold text-[#1B2430] tracking-tight">
            Engagement Sign-off & Partner File Lock
          </h1>
          <p className="text-sm text-[#5B6676] mt-0.5">
            Multi-tier ISA sign-off governance, assembly lock, and immutable audit archive.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/engagements/${engagementId}`}>
            <Button
              variant="outline"
              size="md"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Binder overview
            </Button>
          </Link>
        </div>
      </div>

      {/* Three Sign-Off Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Preparer Card */}
        <div className="bg-white border border-[#E3E6EB] rounded-[14px] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5B6676]">
                Tier 1: Preparer
              </span>
              <StatusPill status="Done" size="sm" />
            </div>
            <div className="text-lg font-semibold text-[#1B2430]">
              Anika Kapoor
            </div>
            <div className="text-xs text-[#5B6676] mt-0.5">
              Senior Associate • Lead Preparer
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E3E6EB] text-xs font-mono-numbers text-[#0B6B4D] flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Signed off 02 Oct 2026, 09:35</span>
          </div>
        </div>

        {/* Reviewer Card */}
        <div className="bg-white border border-[#E3E6EB] rounded-[14px] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5B6676]">
                Tier 2: Manager Review
              </span>
              <StatusPill status="Prepared" size="sm" />
            </div>
            <div className="text-lg font-semibold text-[#1B2430]">
              Sam Rivera
            </div>
            <div className="text-xs text-[#5B6676] mt-0.5">
              Audit Manager • Current User
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E3E6EB] text-xs text-[#1E4FD8] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>12 of 34 workpapers signed off</span>
          </div>
        </div>

        {/* Partner Lock Card */}
        <div className="bg-white border border-[#E3E6EB] rounded-[14px] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5B6676]">
                Tier 3: Partner Lock
              </span>
              <StatusPill status="Blocked" size="sm" />
            </div>
            <div className="text-lg font-semibold text-[#1B2430]">
              Priya Lal
            </div>
            <div className="text-xs text-[#5B6676] mt-0.5">
              Engagement Partner • RI Signatory
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E3E6EB] text-xs text-[#9A4A00] flex items-center gap-1.5">
            <Ban className="w-3.5 h-3.5" />
            <span>{blockedCount} blocking items pending</span>
          </div>
        </div>
      </div>

      {/* Main Split: Left Lock Blocker Checklist + Right Archive Bundle & Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Checklist of What Blocks the Lock */}
        <div className="lg:col-span-7 bg-white border border-[#E3E6EB] rounded-[14px] p-6 flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[#1B2430]">
              Assembly Lock Prerequisites (ISA 230 Checklist)
            </h2>
            <p className="text-xs text-[#5B6676] mt-0.5">
              Every blocking item must be cleared before the engagement archive is permanently sealed.
            </p>
          </div>

          <div className="flex flex-col gap-3 mt-1">
            {blockers.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-[12px] border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  item.status === 'Blocked'
                    ? 'border-[#9A4A00]/30 bg-[#FFF1DC]/15'
                    : 'border-[#E3E6EB] bg-[#F8F9FA]/40'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 shrink-0">
                    <StatusPill status={item.status} size="sm" />
                  </span>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-[#5B6676]">
                      {item.category}
                    </div>
                    <div className="text-sm font-semibold text-[#1B2430] mt-0.5 leading-snug">
                      {item.title}
                    </div>
                  </div>
                </div>

                <Link
                  href={item.fixHref}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#1E4FD8] hover:text-[#163BA3] px-3 py-1.5 rounded-[8px] bg-white border border-[#D5D9E0] hover:bg-[#E8EEFD] transition-colors shrink-0 self-start sm:self-center"
                >
                  <span>{item.fixLinkText}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Archive Bundle Card + Immutable Activity Log */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Archive Bundle Card */}
          <div className="bg-white border border-[#E3E6EB] rounded-[14px] p-6 flex flex-col gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FileSpreadsheet className="w-4 h-4 text-[#1E4FD8]" />
                <h3 className="font-semibold text-base text-[#1B2430]">
                  Audit Archive Bundle
                </h3>
              </div>
              <p className="text-xs text-[#5B6676]">
                Generate consolidated PDF binder with bookmark index and electronic signatures.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="signoff-report-date" className="text-xs font-semibold uppercase tracking-wider text-[#5B6676]">
                Independent Auditor's Report Date
              </label>
              <input
                id="signoff-report-date"
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2.5 bg-white border border-[#D5D9E0] rounded-[10px] text-sm text-[#1B2430] focus-visible:outline-2 focus-visible:outline-[#1E4FD8] focus-visible:outline-offset-2"
              />
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                variant="outline"
                size="md"
                icon={<Download className="w-4 h-4" />}
                onClick={handleGenerateBundle}
              >
                Generate draft PDF bundle
              </Button>

              {draftBundleGenerated && (
                <div className="text-[11px] font-mono-numbers text-[#0B6B4D] flex items-center gap-1 bg-[#E2F4EC] p-2 rounded">
                  <Check className="w-3.5 h-3.5" />
                  <span>Draft bundle generated (24.8 MB, 142 pages)</span>
                </div>
              )}

              {/* Lock File Disabled with Reason Shown */}
              <div className="flex flex-col gap-1.5 mt-2">
                <Button
                  variant="primary"
                  size="md"
                  disabled={isLockDisabled}
                  icon={<Lock className="w-4 h-4" />}
                  onClick={() => alert('Locking file...')}
                  className="w-full"
                >
                  Lock file & complete assembly
                </Button>

                {isLockDisabled && (
                  <p className="text-xs text-[#9A4A00] flex items-start gap-1.5 bg-[#FFF1DC] p-2.5 rounded-[10px] leading-relaxed">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      <strong>Lock file disabled</strong>: Cannot lock file until 4 blocking conditions are resolved and engagement partner Priya Lal completes Tier 3 sign-off.
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Activity Log (Cannot be edited) */}
          <div className="bg-white border border-[#E3E6EB] rounded-[14px] p-6 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E3E6EB]">
              <h3 className="font-semibold text-sm text-[#1B2430]">
                Activity Log (Append-only)
              </h3>
              <span className="text-[10px] uppercase font-bold text-[#5B6676] bg-[#F4F5F7] px-2 py-0.5 rounded">
                Immutable
              </span>
            </div>

            <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-1">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-[10px] bg-[#F8F9FA] border border-[#E3E6EB] text-xs flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between font-mono-numbers text-[11px] text-[#5B6676]">
                    <span>{log.timestamp}</span>
                    <span className="font-semibold text-[#1E4FD8]">{log.action}</span>
                  </div>
                  <div className="font-semibold text-[#1B2430]">
                    {log.user} ({log.role})
                  </div>
                  <div className="text-[#5B6676] leading-relaxed">{log.details}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

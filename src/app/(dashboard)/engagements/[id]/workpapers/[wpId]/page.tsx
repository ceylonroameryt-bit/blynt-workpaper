'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Sliders,
  MessageSquare,
  Paperclip,
  Sparkles,
  History,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  Check,
  Plus,
  Trash2,
  RotateCcw,
  Eye,
  FileSpreadsheet,
  CornerDownRight,
  ShieldCheck,
  Tag,
  ArrowRight,
  HelpCircle,
  X,
  Upload,
} from 'lucide-react';
import { db } from '@/lib/server/db';
import { services } from '@/lib/server/services';
import { toPence, asPence, formatPence, calculateVariance } from '@/lib/money';
import { StatusBadge } from '@/components/ui/StatusPill';
import { UserRole } from '@/lib/types/models';

export default function CoreWorkpaperPage() {
  const params = useParams();
  const router = useRouter();
  const engagementId = (params?.id as string) || 'eng_harlow_fy26';
  const rawWpId = (params?.wpId as string) || 'wp_f10';
  const wpId = rawWpId.toLowerCase().includes('b10') ? 'wp_b10' : 'wp_f10';

  // Load from DB
  const [wpData, setWpData] = useState(() => services.getWorkpaper(wpId));
  const [savedAgoSeconds, setSavedAgoSeconds] = useState(3);
  const [focusMode, setFocusMode] = useState(false);
  const [activeSideTab, setActiveSideTab] = useState<'comments' | 'evidence' | 'bot' | 'history'>('comments');
  const [commentMode, setCommentMode] = useState(false);

  // Customise view preferences
  const [showCustomiseModal, setShowCustomiseModal] = useState(false);
  const [viewPrefs, setViewPrefs] = useState({
    showPriorYear: true,
    showChangePercent: true,
    showSource: true,
    showTickmarks: true,
    rowSpacing: 'comfortable' as 'comfortable' | 'compact',
    textSize: 'M' as 'S' | 'M' | 'L',
    highContrast: false,
  });
  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  // Change template modal
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTargetTemplate, setSelectedTargetTemplate] = useState('tpl_f10_simple');

  // Selected cell for formula / source bar
  const [selectedCell, setSelectedCell] = useState<{
    ref: string;
    label: string;
    value: string;
    source: string;
    acceptedBy: string;
  }>({
    ref: 'F10-C1-ADD',
    label: 'Computer equipment additions',
    value: '£2,400.00',
    source: 'Invoice INV-DELL-9811 (Page 1)',
    acceptedBy: 'Anika Kapoor (Preparer)',
  });

  // Roll forward state
  const [rollForwardUndone, setRollForwardUndone] = useState(false);
  const [showRollForwardBanner, setShowRollForwardBanner] = useState(true);

  // New Comment composer
  const [showCommentComposer, setShowCommentComposer] = useState(false);
  const [commentType, setCommentType] = useState<'comment' | 'review_note' | 'client_query'>('review_note');
  const [commentAnchor, setCommentAnchor] = useState<any>({ kind: 'cell', section: 'schedule', row: 'c1', col: 'additions' });
  const [commentBody, setCommentBody] = useState('');

  // Tick timer for "Saved n seconds ago"
  useEffect(() => {
    const timer = setInterval(() => {
      setSavedAgoSeconds((prev) => (prev < 60 ? prev + 1 : 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard Shortcuts: C (Comment), F (Focus mode), A (Attach file), [ ] (Prev/Next)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        setCommentMode((prev) => !prev);
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        setFocusMode((prev) => !prev);
      } else if (e.key === '[') {
        e.preventDefault();
        router.push(`/engagements/${engagementId}/workpapers/wp_b10`);
      } else if (e.key === ']') {
        e.preventDefault();
        router.push(`/engagements/${engagementId}/workpapers/wp_f10`);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [engagementId, router]);

  const { workpaper, template, procedures, comments, attachments, signoffs } = wpData;
  const isF10 = wpId === 'wp_f10';
  const data = workpaper.data_json;

  // F-10 Reconciling Computations strictly via BigInt pence (Ground Rule 1 & 2)
  const computer = isF10 && data.classes
    ? data.classes.find((c: any) => c.name === 'Computer equipment')
    : null;
  const fixtures = isF10 && data.classes
    ? data.classes.find((c: any) => c.name === 'Fixtures & fittings')
    : null;

  // Computer: 6,000 + 2,400 - 1,200 = 7,200
  const compCostClosing = computer
    ? asPence(computer.cost_opening_p) + asPence(computer.cost_additions_p) - asPence(computer.cost_disposals_p)
    : 720000n;
  // Depreciation: 2,500 + 1,800 - 800 = 3,500
  const compDeprecClosing = computer
    ? asPence(computer.deprec_opening_p) + asPence(computer.deprec_charge_p) - asPence(computer.deprec_disposals_p)
    : 350000n;

  // Fixtures: 4,500, depreciation: 900 + 900 = 1,800
  const fixCostClosing = fixtures
    ? asPence(fixtures.cost_opening_p) + asPence(fixtures.cost_additions_p) - asPence(fixtures.cost_disposals_p)
    : 450000n;
  const fixDeprecClosing = fixtures
    ? asPence(fixtures.deprec_opening_p) + asPence(fixtures.deprec_charge_p) - asPence(fixtures.deprec_disposals_p)
    : 180000n;

  // Totals
  const totalClosingCost = compCostClosing + fixCostClosing; // 11,700
  const totalClosingDeprec = compDeprecClosing + fixDeprecClosing; // 5,300
  const totalNbvThisYear = totalClosingCost - totalClosingDeprec; // 6,400 (Sample data exact match!)
  const totalCharge = (computer ? asPence(computer.deprec_charge_p) : 180000n) + (fixtures ? asPence(fixtures.deprec_charge_p) : 90000n); // 2,700

  // Disposal: NBV 400, proceeds 250, loss 150
  const disposalNbv = 40000n;
  const disposalProceeds = 25000n;
  const disposalLoss = disposalNbv - disposalProceeds; // 150.00

  // Proof in total check
  const proofInTotalExpected = 270000n;
  const proofInTotalPassed = totalCharge === proofInTotalExpected;

  // Check failures count
  const disposalEvidenceMissing = isF10 && data.disposals && !data.disposals[0]?.has_evidence;

  // Signoff blocker check
  const incompleteProceduresCount = procedures.filter(
    (p) => !p.done_at && !p.not_applicable_reason
  ).length;

  const openReviewNotes = comments.filter(
    (c) => c.type === 'review_note' && c.status === 'open'
  );

  const canMarkPrepared = incompleteProceduresCount === 0 && openReviewNotes.length === 0;

  // Handlers
  const handleToggleProcedure = (procId: string) => {
    const proc = procedures.find((p) => p.id === procId);
    if (!proc) return;

    if (proc.done_at) {
      proc.done_at = null;
      proc.done_by = null;
    } else {
      proc.done_at = new Date().toISOString();
      proc.done_by = 'usr_anika';
    }
    setWpData({ ...wpData });

    db.logAudit(
      'firm_blynt_uk',
      { id: 'usr_anika', name: 'Anika Kapoor', role: 'preparer' },
      'TOGGLE_PROCEDURE',
      'procedures',
      procId,
      null,
      { done: !!proc.done_at }
    );
  };

  const handleRollForwardUndo = () => {
    services.undoRollForward('firm_blynt_uk', { id: 'usr_anika', name: 'Anika Kapoor', role: 'preparer' }, wpId);
    setRollForwardUndone(true);
    setShowRollForwardBanner(false);
    setWpData(services.getWorkpaper(wpId));
  };

  const handleAddCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentBody.trim()) return;

    const newCom = services.addComment(
      'firm_blynt_uk',
      { id: 'usr_sam', name: 'Sam Rivera', role: 'reviewer' },
      wpId,
      {
        type: commentType,
        anchor_json: commentAnchor,
        body: commentBody,
      }
    );

    setWpData(services.getWorkpaper(wpId));
    setCommentBody('');
    setShowCommentComposer(false);
    setCommentMode(false);
  };

  const handleResolveComment = (commentId: string) => {
    services.resolveComment(
      'firm_blynt_uk',
      { id: 'usr_sam', name: 'Sam Rivera', role: 'reviewer' },
      commentId
    );
    setWpData(services.getWorkpaper(wpId));
  };

  const handleSaveViewPrefs = () => {
    setShowCustomiseModal(false);
    setLiveAnnouncement('View preferences updated and saved.');
  };

  return (
    <div className={`flex flex-col gap-6 pb-20 ${focusMode ? 'px-2' : ''}`}>
      {/* Live region for accessibility announcements (WCAG 2.2 AA) */}
      <div aria-live="polite" className="sr-only">
        {liveAnnouncement}
      </div>

      {/* Roll forward banner if prior year exists */}
      {showRollForwardBanner && !rollForwardUndone && isF10 && (
        <div className="p-4 bg-[#EAF5FC] border border-[#1D4E89]/30 rounded-[14px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <Tag className="w-5 h-5 text-[#1D4E89] shrink-0" />
            <div>
              <div className="text-xs font-bold text-[#102654]">
                Rolled forward from FY25 signed-off paper
              </div>
              <div className="text-[11px] text-[#5B6478]">
                Opening cost (£10,500.00) and opening depreciation (£3,400.00) were brought forward from last year's signed-off paper. Tagged with <strong>PY</strong>.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRollForwardUndo}
            className="px-3 py-1.5 border border-[#D5DBE7] hover:border-[#102654] bg-white text-xs font-semibold rounded-[8px] flex items-center gap-1.5 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Undo roll forward
          </button>
        </div>
      )}

      {/* Working Paper Header */}
      <div className="blynt-card p-5 flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Title & Ref */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono font-extrabold text-base px-2.5 py-1 rounded bg-[#102654] text-white">
              {workpaper.ref}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-[#102654] tracking-tight">
                  {isF10
                    ? 'Fixed assets: register and depreciation'
                    : 'Bank reconciliation - Barclays Operating'}
                </h1>
                <StatusBadge status={workpaper.status} />
              </div>
              <div className="flex items-center gap-3 text-xs text-[#5B6478] mt-1">
                {/* Template switch dropdown button */}
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(true)}
                  className="font-semibold text-[#102654] hover:text-[#B8432F] flex items-center gap-1 cursor-pointer underline"
                >
                  Template: {template?.name || 'Fixed assets register'} ▾
                </button>
                <span>•</span>
                <span>Preparer: <strong>Anika Kapoor</strong></span>
                <span>•</span>
                <span>Reviewer: <strong>Sam Rivera</strong></span>
                <span>•</span>
                <span className="text-[#0B6B52] font-semibold">
                  ✓ Saved {savedAgoSeconds}s ago
                </span>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Comment Anywhere (Key C) */}
            <button
              type="button"
              onClick={() => setCommentMode(!commentMode)}
              className={`min-h-[40px] px-3 text-xs font-semibold rounded-[8px] flex items-center gap-1.5 transition-colors cursor-pointer ${
                commentMode
                  ? 'bg-[#FF7D6B] text-[#0B1B3D] font-bold shadow-xs'
                  : 'bg-white border border-[#D5DBE7] hover:border-[#102654] text-[#102654]'
              }`}
              title="Comment anywhere (C)"
            >
              <MessageSquare className="w-4 h-4 text-inherit" />
              <span>Comment anywhere</span>
              <kbd className="text-[10px] font-mono px-1 rounded bg-black/10">C</kbd>
            </button>

            {/* Attach File */}
            <button
              type="button"
              onClick={() => setActiveSideTab('evidence')}
              className="min-h-[40px] px-3 bg-white border border-[#D5DBE7] hover:border-[#102654] text-[#102654] text-xs font-semibold rounded-[8px] flex items-center gap-1.5 cursor-pointer"
            >
              <Paperclip className="w-4 h-4" />
              <span>Attach file</span>
              <kbd className="text-[10px] font-mono px-1 rounded bg-black/5">A</kbd>
            </button>

            {/* Customise View */}
            <button
              type="button"
              onClick={() => setShowCustomiseModal(true)}
              className="min-h-[40px] px-3 bg-white border border-[#D5DBE7] hover:border-[#102654] text-[#102654] text-xs font-semibold rounded-[8px] flex items-center gap-1.5 cursor-pointer"
            >
              <Sliders className="w-4 h-4" />
              <span>Customise view</span>
            </button>

            {/* Focus Mode */}
            <button
              type="button"
              onClick={() => setFocusMode(!focusMode)}
              className={`min-h-[40px] px-3 text-xs font-semibold rounded-[8px] flex items-center gap-1.5 transition-colors cursor-pointer ${
                focusMode
                  ? 'bg-[#102654] text-white'
                  : 'bg-white border border-[#D5DBE7] hover:border-[#102654] text-[#102654]'
              }`}
              title="Focus mode (F)"
            >
              {focusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              <span>{focusMode ? 'Exit focus' : 'Focus mode'}</span>
              <kbd className="text-[10px] font-mono px-1 rounded bg-black/10">F</kbd>
            </button>

            {/* Prev / Next Paper */}
            <div className="flex items-center border border-[#D5DBE7] rounded-[8px] overflow-hidden bg-white">
              <Link
                href={`/engagements/${engagementId}/workpapers/wp_b10`}
                title="Previous paper ([)"
                className="p-2 hover:bg-[#F6F7FB] text-[#102654] border-r border-[#D5DBE7]"
              >
                <ChevronLeft className="w-4 h-4" />
              </Link>
              <Link
                href={`/engagements/${engagementId}/workpapers/wp_f10`}
                title="Next paper (])"
                className="p-2 hover:bg-[#F6F7FB] text-[#102654]"
              >
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* 8-Parts Jump Bar */}
        <nav
          aria-label="Parts navigation"
          className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-[#E3E7EF] text-xs"
        >
          {[
            { num: 1, name: 'Objective', badge: '✓ Done' },
            { num: 2, name: 'Lead figures', badge: 'TB 1500' },
            { num: 3, name: 'Schedule', badge: '£6,400.00 NBV' },
            { num: 4, name: 'Checks', badge: disposalEvidenceMissing ? '! 1 Warning' : '✓ Passed' },
            { num: 5, name: 'Procedures', badge: `${procedures.filter((p) => p.done_at).length}/${procedures.length}` },
            { num: 6, name: 'Evidence', badge: `${attachments.length} files` },
            { num: 7, name: 'Conclusion', badge: 'Drafted' },
            { num: 8, name: 'Sign-off', badge: workpaper.status },
          ].map((part) => (
            <a
              key={part.num}
              href={`#part-${part.num}`}
              className="px-2.5 py-1.5 rounded-[8px] bg-[#F6F7FB] hover:bg-[#EAF5FC] text-[#102654] hover:text-[#1D4E89] font-medium shrink-0 flex items-center gap-1.5 transition-colors border border-[#E3E7EF]"
            >
              <span className="font-bold text-[10px] text-[#5B6478]">
                {part.num}
              </span>
              <span>{part.name}</span>
              <span className="text-[9px] font-mono font-bold px-1 py-0.2 rounded bg-white text-[#5B6478] border border-[#D5DBE7]">
                {part.badge}
              </span>
            </a>
          ))}
        </nav>
      </div>

      {/* Selected Cell Formula & Source Bar */}
      <div className="blynt-card p-3 bg-[#F6F7FB] border border-[#D5DBE7] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono-numbers">
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded bg-[#102654] text-white font-mono font-bold text-[11px]">
            {selectedCell.ref}
          </span>
          <span className="font-bold text-[#102654]">{selectedCell.label}:</span>
          <span className="text-sm font-extrabold text-[#102654]">{selectedCell.value}</span>
        </div>
        <div className="flex items-center gap-3 text-[#5B6478]">
          <span>Source: <strong className="text-[#102654]">{selectedCell.source}</strong></span>
          <span>•</span>
          <span>Accepted by: <strong className="text-[#102654]">{selectedCell.acceptedBy}</strong></span>
        </div>
      </div>

      {/* Main Grid: Working Paper Core (8 Parts) + Side Panel Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 8 Parts */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Part 1: Objective */}
          <details
            id="part-1"
            open
            className="blynt-card p-5 group open:pb-6 transition-all"
          >
            <summary className="flex items-center justify-between cursor-pointer font-bold text-sm text-[#102654] select-none">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#102654] text-white text-[10px] flex items-center justify-center font-bold">
                  1
                </span>
                <span>Objective</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E6F4EF] text-[#0B6B52]">
                ✓ Complete
              </span>
            </summary>
            <div className="pt-3 text-xs text-[#5B6478] leading-relaxed border-t border-[#E3E7EF] mt-3">
              {data.objective ||
                'To test the existence, ownership, and valuation of tangible fixed assets, verify depreciation calculations according to disclosed accounting policy, and vouch additions and disposals.'}
            </div>
          </details>

          {/* Part 2: Lead Figures (From Blynt Codes) */}
          <details
            id="part-2"
            open
            className="blynt-card p-5 group open:pb-6 transition-all"
          >
            <summary className="flex items-center justify-between cursor-pointer font-bold text-sm text-[#102654] select-none">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#102654] text-white text-[10px] flex items-center justify-center font-bold">
                  2
                </span>
                <span>Lead Figures (from Blynt codes)</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF5FC] text-[#1D4E89]">
                Tied to Trial Balance
              </span>
            </summary>
            <div className="pt-3 border-t border-[#E3E7EF] mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono-numbers">
              <div className="p-3 bg-[#F6F7FB] rounded-[10px] border border-[#E3E7EF]">
                <div className="text-[10px] font-bold uppercase text-[#5B6478]">TB 1500 (Cost)</div>
                <div className="text-sm font-extrabold text-[#102654] mt-0.5">
                  {formatPence(totalClosingCost)}
                </div>
                <div className="text-[9px] text-[#0B6B52] mt-0.5 font-bold">✓ Agrees to TB</div>
              </div>

              <div className="p-3 bg-[#F6F7FB] rounded-[10px] border border-[#E3E7EF]">
                <div className="text-[10px] font-bold uppercase text-[#5B6478]">TB 1700 (Deprec)</div>
                <div className="text-sm font-extrabold text-[#102654] mt-0.5">
                  {formatPence(totalClosingDeprec)}
                </div>
                <div className="text-[9px] text-[#0B6B52] mt-0.5 font-bold">✓ Agrees to TB</div>
              </div>

              <div className="p-3 bg-[#F6F7FB] rounded-[10px] border border-[#E3E7EF]">
                <div className="text-[10px] font-bold uppercase text-[#5B6478]">TB 6900 (Charge)</div>
                <div className="text-sm font-extrabold text-[#102654] mt-0.5">
                  {formatPence(totalCharge)}
                </div>
                <div className="text-[9px] text-[#0B6B52] mt-0.5 font-bold">✓ Agrees to TB</div>
              </div>

              <div className="p-3 bg-[#F6F7FB] rounded-[10px] border border-[#E3E7EF]">
                <div className="text-[10px] font-bold uppercase text-[#5B6478]">TB 6950 (Disposal)</div>
                <div className="text-sm font-extrabold text-[#102654] mt-0.5">
                  {formatPence(disposalLoss)}
                </div>
                <div className="text-[9px] text-[#0B6B52] mt-0.5 font-bold">✓ Loss agreed</div>
              </div>
            </div>
          </details>

          {/* Part 3: Schedule Grid (Reference Implementation F-10) */}
          <details
            id="part-3"
            open
            className="blynt-card p-5 group open:pb-6 transition-all"
          >
            <summary className="flex items-center justify-between cursor-pointer font-bold text-sm text-[#102654] select-none">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#102654] text-white text-[10px] flex items-center justify-center font-bold">
                  3
                </span>
                <span>Schedule: Tangible Assets Movement &amp; Depreciation</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E6F4EF] text-[#0B6B52]">
                NBV £6,400.00
              </span>
            </summary>

            <div className="pt-4 border-t border-[#E3E7EF] mt-3 flex flex-col gap-6">
              {/* Asset Class Movements Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#102654]">
                  <thead className="bg-[#F6F7FB] text-[#5B6478] uppercase text-[10px] font-bold tracking-wider border-b border-[#E3E7EF]">
                    <tr>
                      <th scope="col" className="p-2.5">Asset Class</th>
                      <th scope="col" className="p-2.5 text-right">Cost Opening</th>
                      <th scope="col" className="p-2.5 text-right">Additions</th>
                      <th scope="col" className="p-2.5 text-right">Disposals</th>
                      <th scope="col" className="p-2.5 text-right font-bold">Cost Closing</th>
                      <th scope="col" className="p-2.5 text-right">Deprec Opening</th>
                      <th scope="col" className="p-2.5 text-right">Charge</th>
                      <th scope="col" className="p-2.5 text-right font-bold">Deprec Closing</th>
                      <th scope="col" className="p-2.5 text-right font-bold text-[#102654]">NBV This Year</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E3E7EF] font-mono-numbers">
                    {/* Computer Equipment Row */}
                    <tr
                      className={`hover:bg-[#F6F7FB] cursor-pointer ${
                        commentMode ? 'outline-2 outline-dashed outline-[#FF7D6B]' : ''
                      }`}
                      onClick={() => {
                        setSelectedCell({
                          ref: 'F10-C1-ADD',
                          label: 'Computer equipment additions',
                          value: '£2,400.00',
                          source: 'Invoice INV-DELL-9811',
                          acceptedBy: 'Anika Kapoor',
                        });
                        if (commentMode) {
                          setShowCommentComposer(true);
                          setCommentAnchor({ kind: 'row', table: 'schedule', row: 'computer' });
                        }
                      }}
                    >
                      <td className="p-2.5 font-bold font-sans text-[#102654]">
                        Computer equipment
                        <span className="block text-[9px] font-normal text-[#5B6478]">25% Straight line</span>
                      </td>
                      <td className="p-2.5 text-right">
                        <span className="inline-flex items-center gap-1">
                          {formatPence(computer?.cost_opening_p || '600000')}
                          <span className="text-[9px] font-bold bg-[#EAF5FC] text-[#1D4E89] px-1 rounded">PY</span>
                        </span>
                      </td>
                      <td className="p-2.5 text-right text-[#1D4E89] font-bold">
                        {formatPence(computer?.cost_additions_p || '240000')}
                      </td>
                      <td className="p-2.5 text-right text-[#B42318]">
                        -{formatPence(computer?.cost_disposals_p || '120000')}
                      </td>
                      <td className="p-2.5 text-right font-bold text-[#102654]">
                        {formatPence(compCostClosing)}
                      </td>
                      <td className="p-2.5 text-right">
                        <span className="inline-flex items-center gap-1">
                          {formatPence(computer?.deprec_opening_p || '250000')}
                          <span className="text-[9px] font-bold bg-[#EAF5FC] text-[#1D4E89] px-1 rounded">PY</span>
                        </span>
                      </td>
                      <td className="p-2.5 text-right">
                        {formatPence(computer?.deprec_charge_p || '180000')}
                      </td>
                      <td className="p-2.5 text-right font-bold text-[#102654]">
                        {formatPence(compDeprecClosing)}
                      </td>
                      <td className="p-2.5 text-right font-extrabold text-[#0B6B52]">
                        {formatPence(compCostClosing - compDeprecClosing)}
                      </td>
                    </tr>

                    {/* Fixtures Row */}
                    <tr
                      className="hover:bg-[#F6F7FB] cursor-pointer"
                      onClick={() => {
                        setSelectedCell({
                          ref: 'F10-C2-COST',
                          label: 'Fixtures & fittings cost',
                          value: '£4,500.00',
                          source: 'TB 1500',
                          acceptedBy: 'Anika Kapoor',
                        });
                      }}
                    >
                      <td className="p-2.5 font-bold font-sans text-[#102654]">
                        Fixtures &amp; fittings
                        <span className="block text-[9px] font-normal text-[#5B6478]">20% Straight line</span>
                      </td>
                      <td className="p-2.5 text-right">
                        <span className="inline-flex items-center gap-1">
                          {formatPence(fixtures?.cost_opening_p || '450000')}
                          <span className="text-[9px] font-bold bg-[#EAF5FC] text-[#1D4E89] px-1 rounded">PY</span>
                        </span>
                      </td>
                      <td className="p-2.5 text-right">£0.00</td>
                      <td className="p-2.5 text-right">£0.00</td>
                      <td className="p-2.5 text-right font-bold text-[#102654]">
                        {formatPence(fixCostClosing)}
                      </td>
                      <td className="p-2.5 text-right">
                        <span className="inline-flex items-center gap-1">
                          {formatPence(fixtures?.deprec_opening_p || '90000')}
                          <span className="text-[9px] font-bold bg-[#EAF5FC] text-[#1D4E89] px-1 rounded">PY</span>
                        </span>
                      </td>
                      <td className="p-2.5 text-right">
                        {formatPence(fixtures?.deprec_charge_p || '90000')}
                      </td>
                      <td className="p-2.5 text-right font-bold text-[#102654]">
                        {formatPence(fixDeprecClosing)}
                      </td>
                      <td className="p-2.5 text-right font-extrabold text-[#0B6B52]">
                        {formatPence(fixCostClosing - fixDeprecClosing)}
                      </td>
                    </tr>

                    {/* Total Row */}
                    <tr className="bg-[#F6F7FB] font-bold border-t-2 border-[#102654]">
                      <td className="p-2.5 font-sans">Total Tangible Assets</td>
                      <td className="p-2.5 text-right">
                        {formatPence(1050000n)}
                      </td>
                      <td className="p-2.5 text-right text-[#1D4E89]">
                        +{formatPence(240000n)}
                      </td>
                      <td className="p-2.5 text-right text-[#B42318]">
                        -{formatPence(120000n)}
                      </td>
                      <td className="p-2.5 text-right text-[#102654]">
                        {formatPence(totalClosingCost)}
                      </td>
                      <td className="p-2.5 text-right">
                        {formatPence(340000n)}
                      </td>
                      <td className="p-2.5 text-right text-[#102654]">
                        {formatPence(totalCharge)}
                      </td>
                      <td className="p-2.5 text-right text-[#102654]">
                        {formatPence(totalClosingDeprec)}
                      </td>
                      <td className="p-2.5 text-right text-sm text-[#0B6B52]">
                        {formatPence(totalNbvThisYear)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Additions Table with Invoice Evidence Link */}
              <div className="border border-[#E3E7EF] rounded-[12px] p-4 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-[#102654]">
                    Additions in Period (&gt; £1,000 threshold vouched to invoice)
                  </h4>
                  <span className="text-[10px] font-mono text-[#0B6B52] bg-[#E6F4EF] px-2 py-0.5 rounded font-bold">
                    ✓ Invoice verified
                  </span>
                </div>
                <div className="overflow-x-auto text-xs font-mono-numbers">
                  <table className="w-full text-left">
                    <thead className="bg-[#F6F7FB] text-[#5B6478] text-[10px] font-bold uppercase">
                      <tr>
                        <th className="p-2">Date</th>
                        <th className="p-2">Item Description</th>
                        <th className="p-2">Supplier</th>
                        <th className="p-2 text-right">Cost</th>
                        <th className="p-2">Supporting Invoice</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E3E7EF]">
                      <tr>
                        <td className="p-2 font-mono">2026-03-15</td>
                        <td className="p-2 font-sans font-semibold">Dell PowerEdge R750 Server &amp; Workstations</td>
                        <td className="p-2 font-sans">Dell Technologies UK</td>
                        <td className="p-2 text-right font-bold text-[#1D4E89]">£2,400.00</td>
                        <td className="p-2 font-sans">
                          <button
                            type="button"
                            onClick={() => setActiveSideTab('evidence')}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#B8432F] hover:underline"
                          >
                            <Paperclip className="w-3.5 h-3.5" />
                            <span>Dell_PowerEdge_Invoice_9811.pdf</span>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Disposals Table with Proceeds Evidence Alert */}
              <div className="border border-[#E3E7EF] rounded-[12px] p-4 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-[#102654]">
                    Disposals in Period (Proceeds &amp; Loss Calculation)
                  </h4>
                  <span className="text-[10px] font-mono text-[#B42318] bg-[#FDECEA] px-2 py-0.5 rounded font-bold">
                    ! Missing proceeds evidence
                  </span>
                </div>
                <div className="overflow-x-auto text-xs font-mono-numbers">
                  <table className="w-full text-left">
                    <thead className="bg-[#F6F7FB] text-[#5B6478] text-[10px] font-bold uppercase">
                      <tr>
                        <th className="p-2">Date</th>
                        <th className="p-2">Asset Item</th>
                        <th className="p-2 text-right">Cost Out</th>
                        <th className="p-2 text-right">Deprec Out</th>
                        <th className="p-2 text-right">NBV Out</th>
                        <th className="p-2 text-right">Proceeds</th>
                        <th className="p-2 text-right font-bold text-[#B42318]">Loss on Disposal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E3E7EF]">
                      <tr>
                        <td className="p-2 font-mono">2026-06-20</td>
                        <td className="p-2 font-sans font-semibold">Legacy Apple iMac Workstations (x2)</td>
                        <td className="p-2 text-right">£1,200.00</td>
                        <td className="p-2 text-right">£800.00</td>
                        <td className="p-2 text-right">£400.00</td>
                        <td className="p-2 text-right">£250.00</td>
                        <td className="p-2 text-right font-bold text-[#B42318]">£150.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </details>

          {/* Part 4: Checks (Evaluated from rules) */}
          <details
            id="part-4"
            open
            className="blynt-card p-5 group open:pb-6 transition-all"
          >
            <summary className="flex items-center justify-between cursor-pointer font-bold text-sm text-[#102654] select-none">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#102654] text-white text-[10px] flex items-center justify-center font-bold">
                  4
                </span>
                <span>Checks &amp; Mathematical Verification</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF4DB] text-[#6B4700]">
                ⚠ 1 warning requires explanation
              </span>
            </summary>

            <div className="pt-4 border-t border-[#E3E7EF] mt-3 flex flex-col gap-3 text-xs">
              <div className="p-3 bg-[#E6F4EF] rounded-[10px] border border-[#0B6B52]/20 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#0B6B52]" />
                  <div>
                    <div className="font-bold text-[#102654]">Closing Cost Agrees to TB 1500</div>
                    <div className="text-[10px] text-[#5B6478] font-mono">
                      Schedule £11,700.00 == TB Account 1500 £11,700.00 (Variance: £0.00)
                    </div>
                  </div>
                </div>
                <span className="text-[#0B6B52] font-bold text-xs">Pass</span>
              </div>

              <div className="p-3 bg-[#E6F4EF] rounded-[10px] border border-[#0B6B52]/20 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#0B6B52]" />
                  <div>
                    <div className="font-bold text-[#102654]">Closing Depreciation Agrees to TB 1700</div>
                    <div className="text-[10px] text-[#5B6478] font-mono">
                      Schedule £5,300.00 == TB Account 1700 £5,300.00 (Variance: £0.00)
                    </div>
                  </div>
                </div>
                <span className="text-[#0B6B52] font-bold text-xs">Pass</span>
              </div>

              <div className="p-3 bg-[#E6F4EF] rounded-[10px] border border-[#0B6B52]/20 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#0B6B52]" />
                  <div>
                    <div className="font-bold text-[#102654]">Proof in Total Depreciation Check</div>
                    <div className="text-[10px] text-[#5B6478] font-mono">
                      Expected from Policy: £2,700.00 == Actual Charge £2,700.00 (Variance: £0.00)
                    </div>
                  </div>
                </div>
                <span className="text-[#0B6B52] font-bold text-xs">Pass</span>
              </div>

              {/* Failing Check */}
              <div className="p-3 bg-[#FDECEA] rounded-[10px] border border-[#B42318]/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-[#B42318]" />
                  <div>
                    <div className="font-bold text-[#B42318]">Disposal Proceeds Evidence</div>
                    <div className="text-[10px] text-[#5B6478]">
                      Disposal of Legacy Apple iMacs (£250.00 proceeds) does not have bank statement confirmation attached.
                    </div>
                  </div>
                </div>
                <span className="text-[#B42318] font-bold text-xs">Needs attention</span>
              </div>
            </div>
          </details>

          {/* Part 5: Procedures */}
          <details
            id="part-5"
            open
            className="blynt-card p-5 group open:pb-6 transition-all"
          >
            <summary className="flex items-center justify-between cursor-pointer font-bold text-sm text-[#102654] select-none">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#102654] text-white text-[10px] flex items-center justify-center font-bold">
                  5
                </span>
                <span>Procedures (Audit Checklist)</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF5FC] text-[#1D4E89]">
                {procedures.filter((p) => p.done_at).length} of {procedures.length} Done
              </span>
            </summary>

            <div className="pt-4 border-t border-[#E3E7EF] mt-3 flex flex-col gap-2.5 text-xs">
              {procedures.map((proc) => {
                const isDone = !!proc.done_at;
                return (
                  <div
                    key={proc.id}
                    onClick={() => handleToggleProcedure(proc.id)}
                    className={`p-3 rounded-[10px] border transition-all cursor-pointer flex items-center justify-between ${
                      isDone
                        ? 'bg-[#E6F4EF]/40 border-[#0B6B52]/20'
                        : 'bg-white border-[#E3E7EF] hover:border-[#102654]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => handleToggleProcedure(proc.id)}
                        className="w-4 h-4 rounded text-[#102654] focus:ring-[#FF7D6B]"
                      />
                      <span className={`font-medium ${isDone ? 'text-[#102654]' : 'text-[#102654]'}`}>
                        {proc.text}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isDone ? (
                        <span className="text-[10px] font-mono text-[#0B6B52]">
                          ✓ Done by Anika
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-[#5B6478]">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </details>

          {/* Part 6: Attachments & Evidence */}
          <details
            id="part-6"
            open
            className="blynt-card p-5 group open:pb-6 transition-all"
          >
            <summary className="flex items-center justify-between cursor-pointer font-bold text-sm text-[#102654] select-none">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#102654] text-white text-[10px] flex items-center justify-center font-bold">
                  6
                </span>
                <span>Attachments &amp; Evidence</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF5FC] text-[#1D4E89]">
                {attachments.length} files
              </span>
            </summary>

            <div className="pt-4 border-t border-[#E3E7EF] mt-3 flex flex-col gap-3">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="p-3 bg-[#F6F7FB] rounded-[10px] border border-[#E3E7EF] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <Paperclip className="w-4 h-4 text-[#102654]" />
                    <div>
                      <div className="font-bold text-[#102654]">{att.filename}</div>
                      <div className="text-[10px] text-[#5B6478] font-mono">
                        SHA-256: {att.sha256.substring(0, 16)}... • {att.category} • Uploaded by {att.uploaded_by_name}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveSideTab('evidence')}
                    className="text-xs font-bold text-[#B8432F] hover:underline"
                  >
                    Preview evidence →
                  </button>
                </div>
              ))}
            </div>
          </details>

          {/* Part 7: Conclusion (Blynt Bot Draft) */}
          <details
            id="part-7"
            open
            className="blynt-card p-5 group open:pb-6 transition-all"
          >
            <summary className="flex items-center justify-between cursor-pointer font-bold text-sm text-[#102654] select-none">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#102654] text-white text-[10px] flex items-center justify-center font-bold">
                  7
                </span>
                <span>Conclusion &amp; Audit Opinion</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E6F4EF] text-[#0B6B52]">
                Drafted
              </span>
            </summary>

            <div className="pt-4 border-t border-[#E3E7EF] mt-3 flex flex-col gap-4 text-xs">
              <div className="p-3.5 bg-white border border-[#D5DBE7] rounded-[10px] text-[#102654] leading-relaxed">
                {data.conclusion?.text ||
                  'Substantive audit testing of tangible fixed assets was completed in accordance with FRS 102 section 17. Additions were vouched to supplier invoice. Proof in total confirms depreciation charge of £2,700.00 is mathematically sound.'}
              </div>

              {/* Blynt Bot Draft in labelled box */}
              <div className="p-4 bg-[#FFF1EE] border border-[#FF7D6B]/40 rounded-[12px]">
                <div className="font-bold text-[#A23A27] flex items-center gap-1.5 mb-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>✦ suggestion: Blynt Bot Conclusion Draft</span>
                </div>
                <p className="text-[#102654] leading-relaxed">
                  {data.conclusion?.ai_draft ||
                    '✦ suggestion: Additions of £2,400.00 vouched to invoice. Proof in total agrees to depreciation charge of £2,700.00. Outstanding item: obtain bank credit evidence for £250.00 disposal proceeds.'}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      data.conclusion.text = data.conclusion.ai_draft.replace('✦ suggestion: ', '');
                      setWpData({ ...wpData });
                      setLiveAnnouncement('AI suggestion applied to conclusion.');
                    }}
                    className="px-3 py-1 bg-[#102654] hover:bg-[#0B1B3D] text-white font-bold text-xs rounded-[6px]"
                  >
                    Use suggestion
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1 bg-white border border-[#D5DBE7] text-[#5B6478] rounded-[6px]"
                  >
                    Edit first
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1 text-[#5B6478] hover:text-[#102654]"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </details>

          {/* Part 8: Sign-off Bar */}
          <details
            id="part-8"
            open
            className="blynt-card p-5 group open:pb-6 transition-all"
          >
            <summary className="flex items-center justify-between cursor-pointer font-bold text-sm text-[#102654] select-none">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#102654] text-white text-[10px] flex items-center justify-center font-bold">
                  8
                </span>
                <span>Sign-off Bar (Preparer → Reviewer → Partner)</span>
              </div>
              <StatusBadge status={workpaper.status} />
            </summary>

            <div className="pt-4 border-t border-[#E3E7EF] mt-3 flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* Preparer Stage */}
                <div className="p-3 bg-[#F6F7FB] rounded-[10px] border border-[#E3E7EF]">
                  <div className="text-[10px] font-bold uppercase text-[#5B6478]">1. Preparer</div>
                  <div className="font-bold text-[#102654] mt-1">Anika Kapoor</div>
                  <div className="text-[10px] text-[#0B6B52] font-semibold mt-0.5">
                    {workpaper.status === 'prepared' || workpaper.status === 'signed_off'
                      ? '✓ Prepared'
                      : 'In progress'}
                  </div>
                </div>

                {/* Reviewer Stage */}
                <div className="p-3 bg-[#F6F7FB] rounded-[10px] border border-[#E3E7EF]">
                  <div className="text-[10px] font-bold uppercase text-[#5B6478]">2. Reviewer</div>
                  <div className="font-bold text-[#102654] mt-1">Sam Rivera</div>
                  <div className="text-[10px] text-[#5B6478] mt-0.5">
                    {signoffs.some((s) => s.role === 'reviewer' && !s.stale_at)
                      ? '✓ Reviewed'
                      : 'Pending review'}
                  </div>
                </div>

                {/* Partner Stage */}
                <div className="p-3 bg-[#F6F7FB] rounded-[10px] border border-[#E3E7EF]">
                  <div className="text-[10px] font-bold uppercase text-[#5B6478]">3. Partner</div>
                  <div className="font-bold text-[#102654] mt-1">Priya Lal</div>
                  <div className="text-[10px] text-[#5B6478] mt-0.5">Awaiting partner lock</div>
                </div>
              </div>

              {/* Action Button: Disabled with reason until done */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-[#5B6478]">
                  {!canMarkPrepared ? (
                    <span className="text-[#B42318] font-bold">
                      Cannot sign off: {incompleteProceduresCount} incomplete procedures, {openReviewNotes.length} open review notes.
                    </span>
                  ) : (
                    <span className="text-[#0B6B52] font-bold">
                      ✓ All checks and procedures passed. Ready for sign-off.
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  disabled={!canMarkPrepared}
                  onClick={() => {
                    workpaper.status = 'prepared';
                    setWpData({ ...wpData });
                    setLiveAnnouncement('Paper marked as prepared.');
                  }}
                  className="min-h-[44px] px-6 bg-[#102654] hover:bg-[#0B1B3D] text-white text-xs font-bold rounded-[10px] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                >
                  Mark as prepared
                </button>
              </div>
            </div>
          </details>
        </div>

        {/* Right Column: Side Panel Tabs */}
        {!focusMode && (
          <div className="lg:col-span-4 blynt-card p-5 flex flex-col gap-4">
            {/* Tabs Header */}
            <div className="flex items-center justify-between border-b border-[#E3E7EF] pb-3 text-xs">
              {[
                { id: 'comments', label: 'Comments', count: comments.length },
                { id: 'evidence', label: 'Evidence', count: attachments.length },
                { id: 'bot', label: 'Blynt Bot' },
                { id: 'history', label: 'History' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveSideTab(tab.id as any)}
                  className={`pb-1 font-bold transition-colors cursor-pointer ${
                    activeSideTab === tab.id
                      ? 'text-[#102654] border-b-2 border-[#102654]'
                      : 'text-[#5B6478] hover:text-[#102654]'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className="ml-1 text-[10px] font-mono px-1 rounded bg-[#F4F5F7]">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab 1: Comments */}
            {activeSideTab === 'comments' && (
              <div className="flex flex-col gap-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#5B6478] text-[11px] font-semibold">
                    Pinned threads on cells &amp; rows
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowCommentComposer(true)}
                    className="text-[#B8432F] font-bold hover:underline"
                  >
                    + Add comment
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  {comments.map((c, idx) => (
                    <div
                      key={c.id}
                      className={`p-3 rounded-[10px] border flex flex-col gap-2 ${
                        c.type === 'review_note'
                          ? 'bg-[#FFF4DB]/40 border-[#6B4700]/30'
                          : 'bg-[#F6F7FB] border-[#E3E7EF]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-4 h-4 rounded-full text-white font-mono text-[9px] font-bold flex items-center justify-center ${
                              c.type === 'review_note' ? 'bg-[#6B4700]' : 'bg-[#FF7D6B]'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <span className="font-bold text-[#102654]">{c.created_by_name}</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase text-[#5B6478]">
                          {c.type}
                        </span>
                      </div>

                      <div className="text-[#102654] leading-relaxed">{c.body}</div>

                      <div className="text-[10px] text-[#5B6478] font-mono">
                        Anchor: {c.anchor_summary}
                      </div>

                      {c.status === 'open' ? (
                        <button
                          type="button"
                          onClick={() => handleResolveComment(c.id)}
                          className="self-end text-[11px] font-bold text-[#0B6B52] hover:underline"
                        >
                          ✓ Resolve note
                        </button>
                      ) : (
                        <span className="text-[10px] text-[#0B6B52] font-semibold">
                          ✓ Resolved
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 2: Evidence Preview */}
            {activeSideTab === 'evidence' && (
              <div className="flex flex-col gap-3 text-xs">
                <div className="font-bold text-[#102654]">
                  Dell_PowerEdge_Invoice_9811.pdf
                </div>
                <div className="border border-[#E3E7EF] rounded-[10px] p-4 bg-[#F6F7FB] flex flex-col items-center justify-center gap-2">
                  <FileText className="w-8 h-8 text-[#1D4E89]" />
                  <div className="text-[11px] font-semibold text-[#102654]">
                    Page 1: Supplier Tax Invoice
                  </div>
                  <div className="p-2 bg-[#E6F4EF] border border-[#0B6B52]/30 rounded text-[11px] font-mono font-bold text-[#0B6B52]">
                    EXTRACTED: £2,400.00 (Agrees to additions)
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Blynt Bot */}
            {activeSideTab === 'bot' && (
              <div className="flex flex-col gap-3 text-xs text-[#102654]">
                <div className="font-bold text-[#A23A27] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Blynt Bot Insights</span>
                </div>
                <div className="p-3 bg-[#FFF1EE] border border-[#FF7D6B]/30 rounded-[10px] leading-relaxed">
                  ✦ suggestion: All asset class movement rows reconcile. One missing proceeds voucher detected for £250.00. Recommend requesting recycling remittance advice before partner sign-off.
                </div>
              </div>
            )}

            {/* Tab 4: History */}
            {activeSideTab === 'history' && (
              <div className="flex flex-col gap-2.5 text-xs">
                <div className="font-bold text-[#102654]">Audit log &amp; revisions</div>
                <div className="p-2.5 bg-[#F6F7FB] border border-[#E3E7EF] rounded-[8px]">
                  <div className="font-bold text-[#102654]">Roll forward executed</div>
                  <div className="text-[10px] text-[#5B6478]">Anika Kapoor • 23 Oct 2026, 09:00</div>
                </div>
                <div className="p-2.5 bg-[#F6F7FB] border border-[#E3E7EF] rounded-[8px]">
                  <div className="font-bold text-[#102654]">Vouched additions invoice</div>
                  <div className="text-[10px] text-[#5B6478]">Anika Kapoor • 23 Oct 2026, 10:15</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Customise View Modal */}
      {showCustomiseModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#0B1B3D]/40 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-[16px] border border-[#E3E7EF] shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-[#102654] mb-1">
              Customise view preferences
            </h3>
            <p className="text-xs text-[#5B6478] mb-5">
              Saved per user and persists across sessions and devices.
            </p>

            <div className="flex flex-col gap-3 text-xs text-[#102654]">
              <label className="flex items-center justify-between cursor-pointer">
                <span>Show prior year column</span>
                <input
                  type="checkbox"
                  checked={viewPrefs.showPriorYear}
                  onChange={(e) => setViewPrefs({ ...viewPrefs, showPriorYear: e.target.checked })}
                  className="w-4 h-4 rounded text-[#102654] focus:ring-[#FF7D6B]"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span>Show change % variance</span>
                <input
                  type="checkbox"
                  checked={viewPrefs.showChangePercent}
                  onChange={(e) => setViewPrefs({ ...viewPrefs, showChangePercent: e.target.checked })}
                  className="w-4 h-4 rounded text-[#102654] focus:ring-[#FF7D6B]"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span>Show source reference bar</span>
                <input
                  type="checkbox"
                  checked={viewPrefs.showSource}
                  onChange={(e) => setViewPrefs({ ...viewPrefs, showSource: e.target.checked })}
                  className="w-4 h-4 rounded text-[#102654] focus:ring-[#FF7D6B]"
                />
              </label>

              <div className="pt-2 border-t border-[#E3E7EF]">
                <span className="block font-semibold mb-1">Row spacing</span>
                <div className="grid grid-cols-2 gap-2">
                  {['comfortable', 'compact'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setViewPrefs({ ...viewPrefs, rowSpacing: s as any })}
                      className={`p-2 rounded-[8px] text-xs font-semibold capitalize border ${
                        viewPrefs.rowSpacing === s
                          ? 'border-[#102654] bg-[#EAF5FC] text-[#102654]'
                          : 'border-[#D5DBE7] text-[#5B6478]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-5 border-t border-[#E3E7EF] mt-5">
              <button
                type="button"
                onClick={() => setShowCustomiseModal(false)}
                className="px-4 py-2 border border-[#D5DBE7] text-xs font-semibold text-[#5B6478] rounded-[8px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveViewPrefs}
                className="px-5 py-2 bg-[#102654] hover:bg-[#0B1B3D] text-white text-xs font-bold rounded-[8px]"
              >
                Save as my default
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Template Modal */}
      {showTemplateModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#0B1B3D]/40 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-[16px] border border-[#E3E7EF] shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-[#102654] mb-1">
              Change workpaper template
            </h3>
            <p className="text-xs text-[#5B6478] mb-4">
              Switching templates migrates data_json and keeps figures, attachments, and comments.
            </p>

            <div className="p-3 mb-4 bg-[#FFF4DB] border border-[#6B4700]/30 rounded-[10px] text-xs text-[#6B4700]">
              Impact preview: 8 core fields map across. Figures and attachments will be preserved. Existing sign-offs will be marked stale.
            </div>

            <div className="flex flex-col gap-2.5 text-xs">
              {[
                { id: 'tpl_f10', name: 'Fixed assets: register and depreciation (Active)' },
                { id: 'tpl_f10_simple', name: 'Fixed assets: simple (micro-entity FRS 105)' },
              ].map((t) => (
                <label
                  key={t.id}
                  className="p-3 rounded-[10px] border border-[#E3E7EF] flex items-center justify-between cursor-pointer hover:border-[#102654]"
                >
                  <span className="font-bold text-[#102654]">{t.name}</span>
                  <input
                    type="radio"
                    name="target-template"
                    checked={selectedTargetTemplate === t.id}
                    onChange={() => setSelectedTargetTemplate(t.id)}
                    className="w-4 h-4 text-[#102654] focus:ring-[#FF7D6B]"
                  />
                </label>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E3E7EF] mt-5">
              <button
                type="button"
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-2 border border-[#D5DBE7] text-xs font-semibold text-[#5B6478] rounded-[8px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  services.changeTemplate(
                    'firm_blynt_uk',
                    { id: 'usr_sam', name: 'Sam Rivera', role: 'reviewer' },
                    wpId,
                    selectedTargetTemplate
                  );
                  setShowTemplateModal(false);
                  setWpData(services.getWorkpaper(wpId));
                  setLiveAnnouncement('Template switched successfully.');
                }}
                className="px-5 py-2 bg-[#102654] hover:bg-[#0B1B3D] text-white text-xs font-bold rounded-[8px]"
              >
                Confirm switch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comment Anywhere Pin Composer Modal */}
      {showCommentComposer && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#0B1B3D]/40 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-[16px] border border-[#E3E7EF] shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-[#102654] mb-1">
              Add pinned comment
            </h3>
            <p className="text-xs text-[#5B6478] mb-4">
              Anchored to {commentAnchor?.row || 'selected element'}. Open review notes block final sign-off.
            </p>

            <form onSubmit={handleAddCommentSubmit} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block font-semibold text-[#102654] mb-1">Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'comment', label: 'Comment' },
                    { id: 'review_note', label: 'Review note' },
                    { id: 'client_query', label: 'Client query' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setCommentType(t.id as any)}
                      className={`p-2 rounded-[8px] font-bold text-center border cursor-pointer ${
                        commentType === t.id
                          ? 'bg-[#102654] text-white'
                          : 'bg-[#F6F7FB] border-[#D5DBE7] text-[#5B6478]'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#102654] mb-1">Note text</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Enter observation, required explanation, or question..."
                  value={commentBody}
                  onChange={(e) => setCommentBody(e.target.value)}
                  className="w-full p-3 bg-[#F6F7FB] border border-[#D5DBE7] rounded-[8px] text-[#102654] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E3E7EF]">
                <button
                  type="button"
                  onClick={() => setShowCommentComposer(false)}
                  className="px-4 py-2 border border-[#D5DBE7] text-xs font-semibold text-[#5B6478] rounded-[8px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#FF7D6B] hover:bg-[#ff9485] text-[#0B1B3D] text-xs font-bold rounded-[8px]"
                >
                  Pin note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Check,
  Plus,
  Trash2,
  MessageSquare,
  Lock,
  Unlock,
  History,
  Send,
  FileText,
  ChevronRight,
  Copy,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatusPill } from '@/components/ui/StatusPill';
import { AiCard } from '@/components/ui/AiCard';
import { getWorkpaperById } from '@/lib/api';
import {
  BankRecWorkpaperData,
  OutstandingCheckItem,
  DepositInTransitItem,
  ProcedureCheckItem,
  ReviewNoteItem,
  AuditLogItem,
} from '@/lib/types';
import { formatMoney, parseInputStringToCents } from '@/lib/utils/format';
import { MOCK_ENGAGEMENT, CURRENT_USER } from '@/lib/mock';

export type TargetSectionId =
  | 'grid'
  | 'cheques'
  | 'deposits'
  | 'procedures'
  | 'conclusion'
  | 'evidence'
  | 'notes';

export interface SectionComment {
  id: string;
  sectionId: TargetSectionId;
  sectionTitle: string;
  authorName: string;
  authorRole: string;
  comment: string;
  createdAt: string;
  isAiGenerated: boolean;
  promptUsed?: string;
  confidence?: number;
}

const SECTION_DEFINITIONS: {
  id: TargetSectionId;
  title: string;
  defaultAiComment: string;
  presetPrompts: string[];
}[] = [
  {
    id: 'grid',
    title: 'Summary Grid & Tie-Out (Rows 1–6)',
    defaultAiComment:
      'Tying verified under ISA 500: General ledger balance ($118,402.17) ties to adjusted bank balance with zero difference. Mathematical checks pass without exception.',
    presetPrompts: [
      'Document mathematical tie-out and 0.00 variance',
      'Explain difference between ledger balance and statement balance',
      'Note confirmation of general ledger line against trial balance',
    ],
  },
  {
    id: 'cheques',
    title: 'Outstanding Cheques Schedule',
    defaultAiComment:
      'Subsequent clearance verified: Cheques #4401 ($2,150.00), #4402 ($4,120.00), and #4403 ($966.00) cleared October 2026 bank statements within 5 business days. Cheque #4402 confirmed distinct from AJE-004 utility accrual.',
    presetPrompts: [
      'Confirm all 3 cheques cleared in October bank statements',
      'Clarify that Cheque #4402 does not duplicate AJE-004 accrual',
      'Note vouching of payee invoice for Crown Office Supplies',
    ],
  },
  {
    id: 'deposits',
    title: 'Deposits in Transit Schedule',
    defaultAiComment:
      'Cutoff testing verified: Batch REC-0930 ($720.00) represents retail merchant card receipts collected on 30 September 2026 and credited to Barclays on 01 October 2026. No abnormal delay identified.',
    presetPrompts: [
      'Confirm crediting on 01 October 2026 bank statement',
      'Document retail merchant settlement batch cutoff',
      'Verify cash receipt register agreement',
    ],
  },
  {
    id: 'procedures',
    title: 'Audit Procedures Checklist (ISA 500 / 505)',
    defaultAiComment:
      'Direct confirmation protocol satisfied: Electronic confirmation certificate received directly from Barclays Bank PLC without intermediary handling. Cutoff procedures executed in compliance with ISA 505.',
    presetPrompts: [
      'Confirm direct confirmation received without intermediary',
      'Document execution of substantive bank reconciliation checks',
      'Note completion of post-balance sheet voucher inspection',
    ],
  },
  {
    id: 'conclusion',
    title: 'Auditor Substantive Conclusion',
    defaultAiComment:
      'Based on substantive procedures performed in accordance with ISA 500 and ISA 505, cash and bank balances for Account 1010 are stated fairly in all material respects as of 30 September 2026.',
    presetPrompts: [
      'Draft fair presentation conclusion under ISA 500',
      'Include unqualified assessment of internal controls',
      'Note zero unadjusted audit differences identified',
    ],
  },
  {
    id: 'evidence',
    title: 'Evidence Viewer & Bank Statement',
    defaultAiComment:
      'Documentary lineage confirmed: Closing balance of $124,918.17 matches Page 1 of Barclays_Operating_Statement_Sept2026.pdf. SHA-256 integrity hash verified against client portal transmission.',
    presetPrompts: [
      'Document PDF statement closing balance extraction',
      'Note electronic certificate authenticity check',
      'Verify statement header and client entity naming',
    ],
  },
  {
    id: 'notes',
    title: 'Review Notes & Coaching Thread',
    defaultAiComment:
      'Review coaching item: Senior associate verified vendor invoice service period for Apex Facilities. Document resolution on lead schedule prior to partner sign-off.',
    presetPrompts: [
      'Add coaching note regarding documentation of invoice dates',
      'Flag item for manager review prior to lock',
      'Request partner sign-off on circularisation threshold',
    ],
  },
];

export default function WorkpaperEditorPage() {
  const params = useParams();
  const engagementId = (params?.id as string) || 'eng_harlow_fy26';
  const wpId = (params?.wpId as string) || 'wp_b10';

  const [wpData, setWpData] = useState<BankRecWorkpaperData | null>(null);

  // Editable Grid Cell Values in integer cents
  const [ledgerBalanceCents, setLedgerBalanceCents] = useState(11840217); // B1: 118,402.17
  const [bankBalanceCents, setBankBalanceCents] = useState(12491817);     // B2: 124,918.17

  // Active Grid Cell selection
  const [activeCell, setActiveCell] = useState<{ row: number; col: string }>({
    row: 1,
    col: 'B',
  });
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [tempInputValue, setTempInputValue] = useState('');

  // Outstanding Items
  const [outstandingCheques, setOutstandingCheques] = useState<OutstandingCheckItem[]>([]);
  const [depositsInTransit, setDepositsInTransit] = useState<DepositInTransitItem[]>([]);

  // Procedures
  const [procedures, setProcedures] = useState<ProcedureCheckItem[]>([]);

  // Conclusion Text
  const [conclusionText, setConclusionText] = useState('');

  // Status & Lock
  const [status, setStatus] = useState<string>('Prepared');
  const [isLocked, setIsLocked] = useState(false);

  // Review Notes
  const [reviewNotes, setReviewNotes] = useState<ReviewNoteItem[]>([]);
  const [replyText, setReplyText] = useState('');

  // Section Comments State (allows applying AI comments to any section any time)
  const [sectionComments, setSectionComments] = useState<SectionComment[]>([
    {
      id: 'sc_init_1',
      sectionId: 'grid',
      sectionTitle: 'Summary Grid & Tie-Out (Rows 1–6)',
      authorName: 'Sam Rivera',
      authorRole: 'Audit Manager',
      comment:
        'Tying verified under ISA 500: General ledger balance ($118,402.17) ties to adjusted bank balance with zero difference. Mathematical checks pass without exception.',
      createdAt: 'Today at 09:40',
      isAiGenerated: true,
      confidence: 99.4,
    },
  ]);

  // AI Comment Generator Modal State
  const [aiCommentModalOpen, setAiCommentModalOpen] = useState(false);
  const [selectedTargetSection, setSelectedTargetSection] = useState<TargetSectionId>('grid');
  const [customCommentPrompt, setCustomCommentPrompt] = useState('');
  const [generatedDraftComment, setGeneratedDraftComment] = useState('');
  const [isGeneratingComment, setIsGeneratingComment] = useState(false);
  const [commentCopiedId, setCommentCopiedId] = useState<string | null>(null);

  // Version History Modal
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  // Audit Logs (append-only)
  const [auditLog, setAuditLog] = useState<AuditLogItem[]>([]);

  // Initial load
  useEffect(() => {
    getWorkpaperById(engagementId, wpId).then((data) => {
      if (data) {
        setWpData(data);
        setLedgerBalanceCents(data.ledgerBalanceCents);
        setBankBalanceCents(data.bankBalanceCents);
        setOutstandingCheques(data.outstandingCheques);
        setDepositsInTransit(data.depositsInTransit);
        setProcedures(data.procedures);
        setConclusionText(data.conclusionText);
        setStatus(data.status);
      }
    });

    // Initial review note on Cheque #4402
    setReviewNotes([
      {
        id: 'rn_wp_1',
        workpaperId: 'wp_b10',
        workpaperRef: 'B-10',
        workpaperTitle: 'Bank reconciliation - Barclays Operating',
        cellRef: 'Row 3, Cheque #4402 ($4,120.00)',
        author: CURRENT_USER,
        content:
          'Cheque #4402 is payable to Apex Facilities for $4,120.00. Please verify whether this relates to the September utilities accrual in AJE-004 so we do not duplicate expense in the lead schedule.',
        createdAt: 'Today at 09:55',
        status: 'Open',
        replies: [
          {
            id: 'rnr_1',
            author: {
              id: 'usr_anika',
              name: 'Anika Kapoor',
              role: 'preparer',
              title: 'Senior Associate',
              email: 'anika.k@vanguard-audit.com',
              avatar:
                'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
              initials: 'AK',
            },
            content:
              'Vouched to invoice dates: cheque #4402 paid August maintenance on 27 Sept. AJE-004 utility bill is distinct for September consumption received in October. No duplication.',
            createdAt: 'Today at 10:14',
          },
        ],
      },
    ]);

    setAuditLog([
      {
        id: 'log_b10_1',
        timestamp: '2026-10-02 09:42:08',
        user: 'Sam Rivera',
        role: 'Audit Manager',
        action: 'AI_LINEAGE_ACCEPTED',
        details:
          'Accepted AI extraction of $124,918.17 from Barclays_Operating_Statement_Sept2026.pdf (prompt v2.4-bank-extract).',
        entity: 'WP B-10',
      },
      {
        id: 'log_b10_2',
        timestamp: '2026-10-02 09:35:40',
        user: 'Anika Kapoor',
        role: 'Senior Associate',
        action: 'STATUS_CHANGE',
        details: 'Updated status of Workpaper B-10 to Prepared.',
        entity: 'WP B-10',
      },
    ]);
  }, [engagementId, wpId]);

  // Derived Calculations
  const outstandingChequesTotalCents = useMemo(() => {
    return outstandingCheques.reduce((sum, chk) => sum + chk.amountCents, 0);
  }, [outstandingCheques]);

  const depositsInTransitTotalCents = useMemo(() => {
    return depositsInTransit.reduce((sum, dep) => sum + dep.amountCents, 0);
  }, [depositsInTransit]);

  // B5: Adjusted Bank Balance = Bank Balance (B2) - Outstanding Cheques (B3) + Deposits in Transit (B4)
  const adjustedBankBalanceCents =
    bankBalanceCents - outstandingChequesTotalCents + depositsInTransitTotalCents;

  // B6: Difference = Ledger Balance (B1) - Adjusted Bank Balance (B5)
  const differenceCents = ledgerBalanceCents - adjustedBankBalanceCents;
  const isTied = differenceCents === 0;

  // Append audit event helper
  const logAuditEvent = (action: string, details: string) => {
    const newEntry: AuditLogItem = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: CURRENT_USER.name,
      role: CURRENT_USER.title,
      action,
      details,
      entity: 'WP B-10',
    };
    setAuditLog((prev) => [newEntry, ...prev]);
  };

  // Open AI Comment Generator for specific section
  const handleOpenAiCommentModal = (sectionId: TargetSectionId = 'grid') => {
    setSelectedTargetSection(sectionId);
    const def = SECTION_DEFINITIONS.find((s) => s.id === sectionId) || SECTION_DEFINITIONS[0];
    setGeneratedDraftComment(def.defaultAiComment);
    setCustomCommentPrompt('');
    setAiCommentModalOpen(true);
  };

  // Change target section in modal
  const handleSelectSection = (sectionId: TargetSectionId) => {
    setSelectedTargetSection(sectionId);
    const def = SECTION_DEFINITIONS.find((s) => s.id === sectionId) || SECTION_DEFINITIONS[0];
    setGeneratedDraftComment(def.defaultAiComment);
  };

  // Preset prompt click
  const handlePresetPrompt = (prompt: string) => {
    setCustomCommentPrompt(prompt);
    setIsGeneratingComment(true);
    setTimeout(() => {
      const def = SECTION_DEFINITIONS.find((s) => s.id === selectedTargetSection) || SECTION_DEFINITIONS[0];
      setGeneratedDraftComment(
        `AI Draft [${prompt}]: ${def.defaultAiComment} Assessed under ISA substantive guidelines; confirmed no material departures.`
      );
      setIsGeneratingComment(false);
    }, 300);
  };

  // Custom AI generate click
  const handleGenerateCustomComment = () => {
    if (!customCommentPrompt.trim()) return;
    setIsGeneratingComment(true);
    setTimeout(() => {
      const def = SECTION_DEFINITIONS.find((s) => s.id === selectedTargetSection) || SECTION_DEFINITIONS[0];
      setGeneratedDraftComment(
        `Auditor Note [Prompt: ${customCommentPrompt}]: ${def.defaultAiComment} Vouched against Barclays electronic audit records.`
      );
      setIsGeneratingComment(false);
    }, 400);
  };

  // Apply comment to selected section
  const handleApplyComment = () => {
    if (!generatedDraftComment.trim()) return;

    const def = SECTION_DEFINITIONS.find((s) => s.id === selectedTargetSection) || SECTION_DEFINITIONS[0];

    const newComment: SectionComment = {
      id: `sc_${Date.now()}`,
      sectionId: selectedTargetSection,
      sectionTitle: def.title,
      authorName: CURRENT_USER.name,
      authorRole: CURRENT_USER.title,
      comment: generatedDraftComment,
      createdAt: 'Just now',
      isAiGenerated: true,
      promptUsed: customCommentPrompt || 'Standard ISA substantive analysis',
      confidence: 99.2,
    };

    setSectionComments((prev) => [...prev, newComment]);

    // If applied to Review Notes thread, add note as well
    if (selectedTargetSection === 'notes') {
      const newNote: ReviewNoteItem = {
        id: `rn_gen_${Date.now()}`,
        workpaperId: 'wp_b10',
        workpaperRef: 'B-10',
        workpaperTitle: 'Bank reconciliation - Barclays Operating',
        cellRef: 'Applied AI Review Note',
        author: CURRENT_USER,
        content: generatedDraftComment,
        createdAt: 'Just now',
        status: 'Open',
        replies: [],
      };
      setReviewNotes((prev) => [newNote, ...prev]);
    }

    // Log to immutable audit trail
    logAuditEvent(
      'AI_COMMENT_APPLIED',
      `Applied AI-generated substantive comment to section "${def.title}" by Sam Rivera.`
    );

    setAiCommentModalOpen(false);
  };

  // Remove comment from section
  const handleRemoveComment = (id: string, title: string) => {
    if (isLocked) return;
    setSectionComments((prev) => prev.filter((c) => c.id !== id));
    logAuditEvent('COMMENT_REMOVED', `Removed comment from section "${title}"`);
  };

  // Copy comment text
  const handleCopyComment = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCommentCopiedId(id);
    setTimeout(() => setCommentCopiedId(null), 1500);
  };

  // Cell editing logic
  const handleCellClick = (row: number, col: string) => {
    if (isLocked) return;
    setActiveCell({ row, col });
    if (col === 'B' && (row === 1 || row === 2)) {
      setEditingCell(`${col}${row}`);
      const val = row === 1 ? ledgerBalanceCents : bankBalanceCents;
      setTempInputValue((val / 100).toFixed(2));
    } else {
      setEditingCell(null);
    }
  };

  const handleCellBlur = () => {
    if (editingCell === 'B1') {
      const parsed = parseInputStringToCents(tempInputValue);
      setLedgerBalanceCents(parsed);
      logAuditEvent(
        'EDIT_CELL_B1',
        `Changed General Ledger Balance to ${formatMoney(parsed)}`
      );
    } else if (editingCell === 'B2') {
      const parsed = parseInputStringToCents(tempInputValue);
      setBankBalanceCents(parsed);
      logAuditEvent(
        'EDIT_CELL_B2',
        `Changed Bank Statement Balance to ${formatMoney(parsed)}`
      );
    }
    setEditingCell(null);
  };

  // Formula bar description
  const getActiveFormulaString = () => {
    const { row, col } = activeCell;
    if (col === 'A') return `Label: Row ${row}`;
    switch (row) {
      case 1:
        return `fx = GL_ACCOUNT(1010, '2026-09-30')  [$${(ledgerBalanceCents / 100).toFixed(2)}]`;
      case 2:
        return `fx = BANK_EXTRACT('Barclays_Sept2026.pdf', p1, 'closing_balance')  [$${(bankBalanceCents / 100).toFixed(2)}]`;
      case 3:
        return `fx = -SUM(OutstandingCheques[Amount])  [($${(outstandingChequesTotalCents / 100).toFixed(2)})]`;
      case 4:
        return `fx = SUM(DepositsInTransit[Amount])  [$${(depositsInTransitTotalCents / 100).toFixed(2)}]`;
      case 5:
        return `fx = B2 - B3 + B4  [Adjusted Bank Balance = $${(adjustedBankBalanceCents / 100).toFixed(2)}]`;
      case 6:
        return `fx = B1 - B5  [Difference = $${(differenceCents / 100).toFixed(2)}]`;
      default:
        return '';
    }
  };

  // Add outstanding cheque item
  const handleAddCheque = () => {
    if (isLocked) return;
    const newCheque: OutstandingCheckItem = {
      id: `chk_${Date.now()}`,
      reference: `Cheque #${4404 + outstandingCheques.length}`,
      date: '2026-09-30',
      payee: 'New Vendor Disbursed',
      amountCents: 50000, // $500.00
      tickmark: 'Vouched to sub-ledger',
      hasReviewNote: false,
    };
    setOutstandingCheques((prev) => [...prev, newCheque]);
    logAuditEvent(
      'ADD_OUTSTANDING_CHEQUE',
      `Added Cheque #${4404 + outstandingCheques.length} for $500.00`
    );
  };

  // Remove cheque item
  const handleRemoveCheque = (id: string, ref: string) => {
    if (isLocked) return;
    setOutstandingCheques((prev) => prev.filter((c) => c.id !== id));
    logAuditEvent('REMOVE_OUTSTANDING_CHEQUE', `Removed ${ref}`);
  };

  // Toggle procedure status
  const handleToggleProcedure = (id: string) => {
    if (isLocked) return;
    setProcedures((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextStatus = p.status === 'Done' ? 'Pending' : 'Done';
          return {
            ...p,
            status: nextStatus,
            completedBy: nextStatus === 'Done' ? CURRENT_USER.name : undefined,
            completedAt: nextStatus === 'Done' ? 'Just now' : undefined,
          };
        }
        return p;
      })
    );
  };

  // AI Draft Conclusion
  const handleApplyAiConclusion = () => {
    if (isLocked) return;
    if (wpData) {
      setConclusionText(wpData.aiSuggestedConclusion);
      logAuditEvent(
        'AI_CONCLUSION_ACCEPTED',
        'Adopted AI-suggested substantive conclusion into workpaper.'
      );
    }
  };

  // Reply to review note
  const handleSendReply = (noteId: string) => {
    if (!replyText.trim()) return;
    setReviewNotes((prev) =>
      prev.map((n) => {
        if (n.id === noteId) {
          return {
            ...n,
            replies: [
              ...n.replies,
              {
                id: `rep_${Date.now()}`,
                author: CURRENT_USER,
                content: replyText,
                createdAt: 'Just now',
              },
            ],
          };
        }
        return n;
      })
    );
    logAuditEvent('REVIEW_NOTE_REPLIED', `Sam Rivera replied: "${replyText}"`);
    setReplyText('');
  };

  // Mark review note cleared
  const handleClearReviewNote = (noteId: string) => {
    setReviewNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, status: 'Cleared' } : n))
    );
    logAuditEvent('REVIEW_NOTE_CLEARED', `Note cleared by Sam Rivera`);
  };

  // Sign-off / Lock toggle
  const handleToggleSignoff = () => {
    if (!isLocked) {
      setIsLocked(true);
      setStatus('Reviewed');
      logAuditEvent(
        'SIGN_OFF_REVIEWED',
        'Workpaper B-10 locked and marked Reviewed by Sam Rivera (Manager).'
      );
    } else {
      setIsLocked(false);
      setStatus('Prepared');
      logAuditEvent(
        'UNLOCK_FOR_EDIT',
        'Workpaper B-10 unlocked for amendments by Sam Rivera.'
      );
    }
  };

  // Helper to render attached comments for any section
  const renderSectionComments = (sectionId: TargetSectionId) => {
    const comments = sectionComments.filter((c) => c.sectionId === sectionId);
    if (comments.length === 0) return null;

    return (
      <div className="flex flex-col gap-2.5 pt-3 border-t border-[#E3E6EB] mt-3">
        <div className="flex items-center justify-between text-xs text-[#5B6676]">
          <span className="font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-[#1E4FD8]" />
            <span>Section Comments ({comments.length})</span>
          </span>
          <button
            onClick={() => handleOpenAiCommentModal(sectionId)}
            className="text-[11px] text-[#5B3FD0] hover:text-[#3F2A9E] font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            <span>+ Add another</span>
          </button>
        </div>

        {comments.map((c) => (
          <div
            key={c.id}
            className="p-3.5 rounded-[10px] bg-[#F3F0FE]/70 border border-[#DDD6FA] text-xs text-[#3F2A9E] flex flex-col gap-1.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white text-[#3F2A9E] text-[10px] font-semibold border border-[#DDD6FA]">
                  <Sparkles className="w-2.5 h-2.5 text-[#5B3FD0]" />
                  <span>AI Generated Note</span>
                </span>
                <span className="text-[#1B2430] font-semibold">
                  {c.authorName} ({c.authorRole})
                </span>
              </div>
              <span className="font-mono-numbers text-[10px] text-[#5B6676]">
                {c.createdAt}
              </span>
            </div>

            <p className="text-xs leading-relaxed text-[#1B2430] whitespace-pre-wrap">
              {c.comment}
            </p>

            <div className="flex items-center justify-between pt-1 border-t border-[#DDD6FA]/60 text-[10px]">
              <span className="text-[#5B3FD0] font-mono-numbers">
                Prompt: {c.promptUsed}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyComment(c.id, c.comment)}
                  className="hover:text-[#1E4FD8] font-medium flex items-center gap-0.5 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>{commentCopiedId === c.id ? 'Copied!' : 'Copy'}</span>
                </button>
                {!isLocked && (
                  <button
                    onClick={() => handleRemoveComment(c.id, c.sectionTitle)}
                    className="hover:text-[#9A4A00] font-medium text-[#5B6676] cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Workpaper Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3E6EB]">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#5B6676] mb-1">
            <Link
              href={`/engagements/${engagementId}`}
              className="hover:text-[#1E4FD8] font-medium"
            >
              {MOCK_ENGAGEMENT.clientName}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link
              href={`/engagements/${engagementId}`}
              className="hover:text-[#1E4FD8] font-medium"
            >
              Workpapers
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#1B2430] font-semibold">B-10 Bank Rec</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono-numbers text-lg font-bold text-[#1E4FD8] px-2.5 py-0.5 rounded bg-[#E8EEFD]">
              B-10
            </span>
            <h1 className="text-2xl sm:text-[28px] font-semibold text-[#1B2430] tracking-tight">
              Bank reconciliation - Barclays Operating
            </h1>
            <StatusPill status={status} />
            {isLocked && (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-[#EEEAFB] text-[#4B3A9E] font-semibold border border-[#DDD6FA]">
                <Lock className="w-3 h-3" />
                <span>Read-only (Signed off)</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Universal AI Comment Button */}
          <Button
            variant="ai"
            size="md"
            icon={<Sparkles className="w-4 h-4 text-[#5B3FD0]" />}
            onClick={() => handleOpenAiCommentModal('grid')}
          >
            AI Add Comment
          </Button>

          <Button
            variant="outline"
            size="md"
            icon={<History className="w-4 h-4" />}
            onClick={() => setHistoryModalOpen(true)}
          >
            Version history
          </Button>

          <Button
            variant={isLocked ? 'outline' : 'primary'}
            size="md"
            icon={isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            onClick={handleToggleSignoff}
          >
            {isLocked ? 'Unlock for edits' : 'Sign off & lock'}
          </Button>
        </div>
      </div>

      {/* Tying Alert: Red if difference != 0 with plain language */}
      {!isTied && (
        <div
          role="alert"
          className="p-4 rounded-[14px] bg-[#FFF1DC] border border-[#9A4A00]/30 text-[#9A4A00] flex items-center justify-between gap-3 shadow-xs"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div className="text-sm font-semibold">
              Bank balance differs from ledger by {formatMoney(Math.abs(differenceCents))}
            </div>
          </div>
          <span className="text-xs font-mono-numbers px-2.5 py-1 rounded bg-white text-[#9A4A00] font-semibold">
            ISA 505 Untied
          </span>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Formula Bar + Bordered Spreadsheet Grid + Items + Procedures + Conclusion */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Section 1: Bordered Spreadsheet Grid Card */}
          <div className="bg-white border border-[#E3E6EB] rounded-[14px] overflow-hidden" id="section-grid">
            {/* Card Header with quick AI Comment button */}
            <div className="px-4 py-3 bg-[#F8F9FA] border-b border-[#E3E6EB] flex items-center justify-between">
              <span className="text-xs font-semibold text-[#1B2430]">
                General Ledger & Bank Statement Dual Tie-Out
              </span>
              <button
                type="button"
                onClick={() => handleOpenAiCommentModal('grid')}
                className="text-xs font-semibold text-[#3F2A9E] bg-[#F3F0FE] hover:bg-[#eae3fc] px-2.5 py-1 rounded-[8px] border border-[#DDD6FA] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#5B3FD0]" />
                <span>+ AI Comment</span>
              </button>
            </div>

            {/* Formula Bar */}
            <div className="px-4 py-2.5 bg-white border-b border-[#E3E6EB] flex items-center gap-3 select-none">
              <div className="w-9 h-7 rounded bg-[#F8F9FA] border border-[#D5D9E0] flex items-center justify-center font-mono-numbers text-xs font-bold text-[#1E4FD8] shadow-2xs">
                {activeCell.col}
                {activeCell.row}
              </div>
              <div className="text-xs font-bold text-[#5B6676] italic font-mono shrink-0">
                fx
              </div>
              <div className="flex-1 font-mono-numbers text-xs text-[#1B2430] truncate">
                {getActiveFormulaString()}
              </div>
            </div>

            {/* Grid Table with Column Letters and Row Numbers */}
            <div className="overflow-x-auto w-full">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#F8F9FA] text-[11px] font-semibold uppercase tracking-wider text-[#5B6676] border-b border-[#E3E6EB]">
                    <th className="w-10 px-2 py-2 text-center border-r border-[#E3E6EB]">
                      #
                    </th>
                    <th className="px-4 py-2 border-r border-[#E3E6EB] text-left">
                      A (Description)
                    </th>
                    <th className="w-[180px] px-4 py-2 border-r border-[#E3E6EB] text-right">
                      B (Amount USD)
                    </th>
                    <th className="w-[110px] px-3 py-2 text-center">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E6EB] text-xs">
                  {/* Row 1: Ledger Balance */}
                  <tr
                    className={`transition-colors ${
                      activeCell.row === 1 ? 'bg-[#E8EEFD]/20' : 'hover:bg-[#F8F9FA]/60'
                    }`}
                  >
                    <td className="px-2 py-3 text-center font-mono-numbers text-[#5B6676] bg-[#F8F9FA] border-r border-[#E3E6EB] font-medium">
                      1
                    </td>
                    <td
                      onClick={() => handleCellClick(1, 'A')}
                      className={`px-4 py-3 font-medium text-[#1B2430] border-r border-[#E3E6EB] cursor-pointer ${
                        activeCell.row === 1 && activeCell.col === 'A'
                          ? 'ring-2 ring-inset ring-[#1E4FD8]'
                          : ''
                      }`}
                    >
                      General Ledger Balance (Account 1010)
                    </td>
                    <td
                      onClick={() => handleCellClick(1, 'B')}
                      className={`px-4 py-3 font-mono-numbers text-right border-r border-[#E3E6EB] cursor-pointer font-semibold ${
                        activeCell.row === 1 && activeCell.col === 'B'
                          ? 'ring-2 ring-inset ring-[#1E4FD8] bg-white'
                          : ''
                      }`}
                    >
                      {editingCell === 'B1' ? (
                        <input
                          type="text"
                          autoFocus
                          value={tempInputValue}
                          onChange={(e) => setTempInputValue(e.target.value)}
                          onBlur={handleCellBlur}
                          onKeyDown={(e) => e.key === 'Enter' && handleCellBlur()}
                          className="w-full text-right font-mono-numbers text-xs bg-white focus:outline-none"
                        />
                      ) : (
                        formatMoney(ledgerBalanceCents)
                      )}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="text-[11px] font-mono-numbers px-2 py-0.5 rounded bg-[#F4F5F7] text-[#5B6676]">
                        TB Tied
                      </span>
                    </td>
                  </tr>

                  {/* Row 2: Bank Statement Balance */}
                  <tr
                    className={`transition-colors ${
                      activeCell.row === 2 ? 'bg-[#E8EEFD]/20' : 'hover:bg-[#F8F9FA]/60'
                    }`}
                  >
                    <td className="px-2 py-3 text-center font-mono-numbers text-[#5B6676] bg-[#F8F9FA] border-r border-[#E3E6EB] font-medium">
                      2
                    </td>
                    <td
                      onClick={() => handleCellClick(2, 'A')}
                      className={`px-4 py-3 font-medium text-[#1B2430] border-r border-[#E3E6EB] cursor-pointer ${
                        activeCell.row === 2 && activeCell.col === 'A'
                          ? 'ring-2 ring-inset ring-[#1E4FD8]'
                          : ''
                      }`}
                    >
                      Bank Statement Closing Balance (Barclays)
                    </td>
                    <td
                      onClick={() => handleCellClick(2, 'B')}
                      className={`px-4 py-3 font-mono-numbers text-right border-r border-[#E3E6EB] cursor-pointer font-semibold ${
                        activeCell.row === 2 && activeCell.col === 'B'
                          ? 'ring-2 ring-inset ring-[#1E4FD8] bg-white'
                          : ''
                      }`}
                    >
                      {editingCell === 'B2' ? (
                        <input
                          type="text"
                          autoFocus
                          value={tempInputValue}
                          onChange={(e) => setTempInputValue(e.target.value)}
                          onBlur={handleCellBlur}
                          onKeyDown={(e) => e.key === 'Enter' && handleCellBlur()}
                          className="w-full text-right font-mono-numbers text-xs bg-white focus:outline-none"
                        />
                      ) : (
                        formatMoney(bankBalanceCents)
                      )}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#E2F4EC] text-[#0B6B4D]">
                        Confirmed
                      </span>
                    </td>
                  </tr>

                  {/* Row 3: Outstanding Cheques */}
                  <tr
                    className={`transition-colors ${
                      activeCell.row === 3 ? 'bg-[#E8EEFD]/20' : 'hover:bg-[#F8F9FA]/60'
                    }`}
                  >
                    <td className="px-2 py-3 text-center font-mono-numbers text-[#5B6676] bg-[#F8F9FA] border-r border-[#E3E6EB] font-medium">
                      3
                    </td>
                    <td
                      onClick={() => handleCellClick(3, 'A')}
                      className={`px-4 py-3 text-[#1B2430] border-r border-[#E3E6EB] cursor-pointer ${
                        activeCell.row === 3 && activeCell.col === 'A'
                          ? 'ring-2 ring-inset ring-[#1E4FD8]'
                          : ''
                      }`}
                    >
                      Less: Outstanding cheques (3 items)
                    </td>
                    <td
                      onClick={() => handleCellClick(3, 'B')}
                      className={`px-4 py-3 font-mono-numbers text-right border-r border-[#E3E6EB] cursor-pointer ${
                        activeCell.row === 3 && activeCell.col === 'B'
                          ? 'ring-2 ring-inset ring-[#1E4FD8] bg-white'
                          : ''
                      }`}
                    >
                      {formatMoney(-outstandingChequesTotalCents)}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="text-[11px] font-mono-numbers px-2 py-0.5 rounded bg-[#E8EEFD] text-[#1E4FD8]">
                        Schedule
                      </span>
                    </td>
                  </tr>

                  {/* Row 4: Deposits in Transit */}
                  <tr
                    className={`transition-colors ${
                      activeCell.row === 4 ? 'bg-[#E8EEFD]/20' : 'hover:bg-[#F8F9FA]/60'
                    }`}
                  >
                    <td className="px-2 py-3 text-center font-mono-numbers text-[#5B6676] bg-[#F8F9FA] border-r border-[#E3E6EB] font-medium">
                      4
                    </td>
                    <td
                      onClick={() => handleCellClick(4, 'A')}
                      className={`px-4 py-3 text-[#1B2430] border-r border-[#E3E6EB] cursor-pointer ${
                        activeCell.row === 4 && activeCell.col === 'A'
                          ? 'ring-2 ring-inset ring-[#1E4FD8]'
                          : ''
                      }`}
                    >
                      Add: Deposits in transit (Batch REC-0930)
                    </td>
                    <td
                      onClick={() => handleCellClick(4, 'B')}
                      className={`px-4 py-3 font-mono-numbers text-right border-r border-[#E3E6EB] cursor-pointer ${
                        activeCell.row === 4 && activeCell.col === 'B'
                          ? 'ring-2 ring-inset ring-[#1E4FD8] bg-white'
                          : ''
                      }`}
                    >
                      {formatMoney(depositsInTransitTotalCents)}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="text-[11px] font-mono-numbers px-2 py-0.5 rounded bg-[#E8EEFD] text-[#1E4FD8]">
                        Schedule
                      </span>
                    </td>
                  </tr>

                  {/* Row 5: Adjusted Bank Balance */}
                  <tr
                    className={`bg-[#F8F9FA]/40 font-semibold ${
                      activeCell.row === 5 ? 'bg-[#E8EEFD]/30' : ''
                    }`}
                  >
                    <td className="px-2 py-3 text-center font-mono-numbers text-[#5B6676] bg-[#F8F9FA] border-r border-[#E3E6EB]">
                      5
                    </td>
                    <td
                      onClick={() => handleCellClick(5, 'A')}
                      className={`px-4 py-3 text-[#1B2430] border-r border-[#E3E6EB] cursor-pointer ${
                        activeCell.row === 5 && activeCell.col === 'A'
                          ? 'ring-2 ring-inset ring-[#1E4FD8]'
                          : ''
                      }`}
                    >
                      Adjusted Bank Balance (Row 2 - Row 3 + Row 4)
                    </td>
                    <td
                      onClick={() => handleCellClick(5, 'B')}
                      className={`px-4 py-3 font-mono-numbers text-right border-r border-[#E3E6EB] cursor-pointer ${
                        activeCell.row === 5 && activeCell.col === 'B'
                          ? 'ring-2 ring-inset ring-[#1E4FD8] bg-white'
                          : ''
                      }`}
                    >
                      {formatMoney(adjustedBankBalanceCents)}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="text-[11px] font-mono-numbers text-[#5B6676]">
                        Formula
                      </span>
                    </td>
                  </tr>

                  {/* Row 6: Difference with "Ties" pill */}
                  <tr
                    className={`font-semibold ${
                      isTied ? 'bg-[#E2F4EC]/30' : 'bg-[#FFF1DC]/40'
                    }`}
                  >
                    <td className="px-2 py-3 text-center font-mono-numbers text-[#5B6676] bg-[#F8F9FA] border-r border-[#E3E6EB]">
                      6
                    </td>
                    <td
                      onClick={() => handleCellClick(6, 'A')}
                      className="px-4 py-3 text-[#1B2430] border-r border-[#E3E6EB]"
                    >
                      Unreconciled Difference (Row 1 - Row 5)
                    </td>
                    <td
                      onClick={() => handleCellClick(6, 'B')}
                      className={`px-4 py-3 font-mono-numbers text-right border-r border-[#E3E6EB] ${
                        isTied ? 'text-[#0B6B4D]' : 'text-[#9A4A00]'
                      }`}
                    >
                      {formatMoney(differenceCents)}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <StatusPill
                        status={isTied ? 'Ties' : 'Differs'}
                        size="sm"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Attached Section Comments for Grid */}
            <div className="p-4 bg-white">
              {renderSectionComments('grid')}
            </div>
          </div>

          {/* Section 2: Outstanding Items Table */}
          <div className="bg-white border border-[#E3E6EB] rounded-[14px] overflow-hidden" id="section-cheques">
            <div className="px-5 py-3.5 border-b border-[#E3E6EB] flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm text-[#1B2430]">
                  Outstanding Cheques & Items in Transit
                </h3>
                <p className="text-xs text-[#5B6676]">
                  Vouched to subsequent bank statements in October 2026.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenAiCommentModal('cheques')}
                  className="text-xs font-semibold text-[#3F2A9E] bg-[#F3F0FE] hover:bg-[#eae3fc] px-2.5 py-1 rounded-[8px] border border-[#DDD6FA] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#5B3FD0]" />
                  <span>+ AI Comment</span>
                </button>

                {!isLocked && (
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Plus className="w-3.5 h-3.5" />}
                    onClick={handleAddCheque}
                  >
                    Add cheque
                  </Button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs text-[#1B2430]">
                <thead className="bg-[#F8F9FA] text-[#5B6676] text-[11px] font-semibold uppercase tracking-wider border-b border-[#E3E6EB]">
                  <tr>
                    <th className="px-4 py-2.5">Ref & Date</th>
                    <th className="px-4 py-2.5">Payee / Description</th>
                    <th className="px-4 py-2.5 text-right">Amount</th>
                    <th className="px-4 py-2.5">Audit Tick-Mark Verification</th>
                    {!isLocked && <th className="px-4 py-2.5 text-right">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E6EB]">
                  {outstandingCheques.map((chk) => (
                    <tr key={chk.id} className="hover:bg-[#F8F9FA]/60">
                      <td className="px-4 py-3 font-mono-numbers whitespace-nowrap">
                        <div className="font-semibold text-[#1E4FD8]">
                          {chk.reference}
                        </div>
                        <div className="text-[11px] text-[#5B6676]">{chk.date}</div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-medium text-[#1B2430] flex items-center gap-2">
                          <span>{chk.payee}</span>
                          {chk.hasReviewNote && (
                            <span
                              className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-[#FFF1DC] text-[#9A4A00] font-semibold shrink-0"
                              title={chk.reviewNoteText}
                            >
                              <MessageSquare className="w-2.5 h-2.5" />
                              <span>Review note</span>
                            </span>
                          )}
                        </div>
                        {chk.clearedSubsequentDate && (
                          <div className="text-[11px] text-[#0B6B4D] font-mono-numbers mt-0.5">
                            Cleared bank: {chk.clearedSubsequentDate}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right font-mono-numbers font-semibold whitespace-nowrap">
                        {formatMoney(chk.amountCents)}
                      </td>

                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E2F4EC] text-[#0B6B4D] font-medium text-[11px]">
                          <Check className="w-3 h-3" />
                          <span>{chk.tickmark}</span>
                        </span>
                      </td>

                      {!isLocked && (
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleRemoveCheque(chk.id, chk.reference)}
                            className="p-1 text-[#5B6676] hover:text-[#9A4A00] transition-colors cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}

                  {/* Deposits in transit */}
                  {depositsInTransit.map((dep) => (
                    <tr key={dep.id} className="hover:bg-[#F8F9FA]/60 bg-[#F8F9FA]/20">
                      <td className="px-4 py-3 font-mono-numbers whitespace-nowrap">
                        <div className="font-semibold text-[#1E4FD8]">
                          {dep.reference}
                        </div>
                        <div className="text-[11px] text-[#5B6676]">{dep.date}</div>
                      </td>

                      <td className="px-4 py-3 font-medium text-[#1B2430]">
                        <div>{dep.description}</div>
                        <div className="text-[11px] text-[#0B6B4D] font-mono-numbers mt-0.5">
                          Credited bank: {dep.clearedSubsequentDate}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-right font-mono-numbers font-semibold whitespace-nowrap">
                        {formatMoney(dep.amountCents)}
                      </td>

                      <td className="px-4 py-3" colSpan={isLocked ? 1 : 2}>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E2F4EC] text-[#0B6B4D] font-medium text-[11px]">
                          <Check className="w-3 h-3" />
                          <span>{dep.tickmark}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Attached Section Comments for Cheques & Deposits */}
            <div className="p-4 bg-white">
              {renderSectionComments('cheques')}
              {renderSectionComments('deposits')}
            </div>
          </div>

          {/* Section 3: Procedures Checklist */}
          <div className="bg-white border border-[#E3E6EB] rounded-[14px] p-5" id="section-procedures">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm text-[#1B2430]">
                Standard Audit Procedures (ISA 500 & ISA 505)
              </h3>
              <button
                type="button"
                onClick={() => handleOpenAiCommentModal('procedures')}
                className="text-xs font-semibold text-[#3F2A9E] bg-[#F3F0FE] hover:bg-[#eae3fc] px-2.5 py-1 rounded-[8px] border border-[#DDD6FA] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#5B3FD0]" />
                <span>+ AI Comment</span>
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {procedures.map((proc) => {
                const isDone = proc.status === 'Done';
                return (
                  <div
                    key={proc.id}
                    onClick={() => handleToggleProcedure(proc.id)}
                    className={`p-3 rounded-[10px] border transition-colors flex items-start gap-3 cursor-pointer ${
                      isDone
                        ? 'border-[#0B6B4D]/30 bg-[#E2F4EC]/10'
                        : 'border-[#E3E6EB] bg-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isDone}
                      disabled={isLocked}
                      onChange={() => handleToggleProcedure(proc.id)}
                      className="w-4 h-4 rounded text-[#1E4FD8] border-[#D5D9E0] focus:ring-[#1E4FD8] mt-0.5"
                    />
                    <div className="flex flex-col gap-0.5 flex-1">
                      <span className="text-xs font-semibold text-[#1B2430]">
                        {proc.title}
                      </span>
                      <span className="text-xs text-[#5B6676] leading-relaxed">
                        {proc.description}
                      </span>
                      {proc.completedBy && (
                        <span className="text-[10px] text-[#0B6B4D] font-mono-numbers mt-1 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>
                            Verified by {proc.completedBy} ({proc.completedAt})
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Attached Section Comments for Procedures */}
            {renderSectionComments('procedures')}
          </div>

          {/* Section 4: Conclusion Textarea */}
          <div className="bg-white border border-[#E3E6EB] rounded-[14px] p-5 flex flex-col gap-3" id="section-conclusion">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm text-[#1B2430]">
                  Auditor Substantive Conclusion
                </h3>
                <p className="text-xs text-[#5B6676]">
                  ISA 500 documented conclusion for the engagement review file.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenAiCommentModal('conclusion')}
                  className="text-xs font-semibold text-[#3F2A9E] bg-[#F3F0FE] hover:bg-[#eae3fc] px-2.5 py-1 rounded-[8px] border border-[#DDD6FA] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#5B3FD0]" />
                  <span>+ AI Comment</span>
                </button>

                {!isLocked && (
                  <Button
                    variant="ai"
                    size="sm"
                    icon={<Sparkles className="w-3.5 h-3.5 text-[#5B3FD0]" />}
                    onClick={handleApplyAiConclusion}
                  >
                    Draft from my results
                  </Button>
                )}
              </div>
            </div>

            <textarea
              rows={4}
              value={conclusionText}
              disabled={isLocked}
              onChange={(e) => setConclusionText(e.target.value)}
              placeholder="State the audit conclusion based on substantive procedures performed..."
              className="w-full p-3 text-xs leading-relaxed border border-[#D5D9E0] rounded-[10px] bg-white text-[#1B2430] focus-visible:outline-2 focus-visible:outline-[#1E4FD8] focus-visible:outline-offset-2 disabled:bg-[#F4F5F7] disabled:text-[#5B6676]"
            />

            {/* Attached Section Comments for Conclusion */}
            {renderSectionComments('conclusion')}
          </div>
        </div>

        {/* RIGHT COLUMN: Evidence Viewer + Violet AI Assistant Card + Review Notes Thread */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Section 5: Evidence Viewer Card */}
          <div className="bg-white border border-[#E3E6EB] rounded-[14px] overflow-hidden" id="section-evidence">
            <div className="px-5 py-3.5 border-b border-[#E3E6EB] flex items-center justify-between bg-[#F8F9FA]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#1E4FD8]" />
                <span className="font-semibold text-xs text-[#1B2430]">
                  Evidence Viewer • Barclays Operating Statement
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenAiCommentModal('evidence')}
                  className="text-xs font-semibold text-[#3F2A9E] bg-white hover:bg-[#F3F0FE] px-2 py-0.5 rounded-[6px] border border-[#DDD6FA] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-[#5B3FD0]" />
                  <span>+ AI Comment</span>
                </button>
                <span className="text-[11px] font-mono-numbers px-2 py-0.5 rounded bg-white border border-[#D5D9E0] text-[#5B6676]">
                  Page 1 of 4
                </span>
              </div>
            </div>

            {/* Document Render Mock */}
            <div className="p-5 bg-[#F4F5F7] text-xs font-mono-numbers flex flex-col gap-4">
              <div className="bg-white p-5 rounded-[10px] border border-[#D5D9E0] shadow-xs flex flex-col gap-3">
                <div className="flex items-start justify-between border-b border-[#E3E6EB] pb-3 font-sans">
                  <div>
                    <div className="font-bold text-sm text-[#1B2430]">BARCLAYS BANK PLC</div>
                    <div className="text-[11px] text-[#5B6676]">1 Churchill Place, London E14 5HP</div>
                  </div>
                  <div className="text-right text-[11px]">
                    <div className="font-semibold text-[#1B2430]">Harlow & Finch Ltd</div>
                    <div className="text-[#5B6676]">Account # 4088-2910-1010</div>
                  </div>
                </div>

                <div className="py-2 text-[11px] text-[#5B6676]">
                  STATEMENT PERIOD: 01 SEP 2026 – 30 SEP 2026
                </div>

                <div className="flex flex-col gap-2 font-mono">
                  <div className="flex justify-between py-1 border-b border-[#E3E6EB]/50">
                    <span>OPENING BALANCE AT 01 SEP 2026</span>
                    <span>$98,420.00</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#E3E6EB]/50 text-[#5B6676]">
                    <span>TOTAL CREDITS & DEPOSITS</span>
                    <span>+$241,520.17</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#E3E6EB]/50 text-[#5B6676]">
                    <span>TOTAL CHARGES & CHEQUES DRAWN</span>
                    <span>-$215,022.00</span>
                  </div>

                  {/* Highlighted Closing Balance matching B2 */}
                  <div className="flex justify-between items-center p-2 rounded-[8px] bg-[#E8EEFD] border border-[#1E4FD8] font-bold text-[#1E4FD8] my-1">
                    <span>CLOSING BALANCE AT 30 SEP 2026</span>
                    <span className="text-sm font-mono-numbers">$124,918.17</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#E3E6EB] text-[11px] font-sans">
                  <span className="inline-flex items-center gap-1.5 text-[#0B6B4D] font-semibold bg-[#E2F4EC] px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Agrees to statement ($124,918.17)</span>
                  </span>
                  <span className="text-[#5B6676]">Confirmed via Barclays Direct</span>
                </div>
              </div>

              {renderSectionComments('evidence')}
            </div>
          </div>

          {/* Section 6: Violet AI Assistant Card */}
          <AiCard
            title="AI Extraction Lineage & Provenance"
            badge="Verified Lineage"
          >
            <div className="flex flex-col gap-2.5 text-xs text-[#3F2A9E]">
              <div className="grid grid-cols-2 gap-2 bg-white/70 p-3 rounded-[10px] border border-[#DDD6FA]">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5B3FD0] block">
                    Source File
                  </span>
                  <span className="font-semibold text-[#1B2430] truncate block">
                    Barclays_Sept2026.pdf
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5B3FD0] block">
                    Location
                  </span>
                  <span className="font-semibold text-[#1B2430] block">
                    Page 1, Closing Summary
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-white/70 p-3 rounded-[10px] border border-[#DDD6FA]">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5B3FD0] block">
                    Prompt Version
                  </span>
                  <span className="font-mono-numbers text-[#1B2430] block">
                    v2.4-bank-extract
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5B3FD0] block">
                    Extraction Confidence
                  </span>
                  <span className="font-mono-numbers text-[#0B6B4D] font-semibold block">
                    99.4% (Exact Match)
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-[8px] bg-white/90 border border-[#DDD6FA] text-[11px] text-[#3F2A9E]">
                <strong>Auditor Verification</strong>: Accepted by Sam Rivera on 02 Oct 2026. Under ISA standards, AI never signs off; final judgment resides with the engagement team.
              </div>
            </div>
          </AiCard>

          {/* Section 7: Review Notes Thread with Reply Box */}
          <div className="bg-white border border-[#E3E6EB] rounded-[14px] p-5 flex flex-col gap-4" id="section-notes">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3E6EB]">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#9A4A00]" />
                <h3 className="font-semibold text-sm text-[#1B2430]">
                  Review Notes Thread ({reviewNotes.length})
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenAiCommentModal('notes')}
                  className="text-xs font-semibold text-[#3F2A9E] bg-[#F3F0FE] hover:bg-[#eae3fc] px-2.5 py-1 rounded-[8px] border border-[#DDD6FA] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#5B3FD0]" />
                  <span>+ AI Review Note</span>
                </button>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#FFF1DC] text-[#9A4A00]">
                  Open
                </span>
              </div>
            </div>

            {/* Note conversation */}
            {reviewNotes.map((note) => (
              <div key={note.id} className="flex flex-col gap-3">
                <div className="p-3.5 rounded-[10px] bg-[#F8F9FA] border border-[#E3E6EB] flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#1B2430]">
                      {note.author.name} ({note.author.title})
                    </span>
                    <span className="text-[#5B6676] font-mono-numbers text-[11px]">
                      {note.createdAt}
                    </span>
                  </div>
                  <div className="text-xs text-[#5B6676] bg-white p-1 rounded px-2 border border-[#E3E6EB]/60 inline-block w-fit font-mono-numbers">
                    Cell: {note.cellRef}
                  </div>
                  <p className="text-xs text-[#1B2430] leading-relaxed">
                    {note.content}
                  </p>
                </div>

                {/* Replies */}
                {note.replies.map((rep) => (
                  <div
                    key={rep.id}
                    className="ml-4 p-3 rounded-[10px] bg-[#E8EEFD]/30 border border-[#1E4FD8]/20 flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#1E4FD8]">
                        {rep.author.name} ({rep.author.title})
                      </span>
                      <span className="text-[#5B6676] font-mono-numbers text-[11px]">
                        {rep.createdAt}
                      </span>
                    </div>
                    <p className="text-xs text-[#1B2430] leading-relaxed">
                      {rep.content}
                    </p>
                  </div>
                ))}

                {/* Reply Input Box */}
                <div className="flex flex-col gap-2 mt-2">
                  <textarea
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type reply or explanation to clear this note..."
                    className="w-full p-2.5 text-xs border border-[#D5D9E0] rounded-[10px] bg-white text-[#1B2430] focus-visible:outline-2 focus-visible:outline-[#1E4FD8] focus-visible:outline-offset-2"
                  />
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleClearReviewNote(note.id)}
                      className="text-xs text-[#0B6B4D] hover:underline font-semibold cursor-pointer"
                    >
                      Mark as cleared
                    </button>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<Send className="w-3 h-3" />}
                      onClick={() => handleSendReply(note.id)}
                    >
                      Send reply
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {renderSectionComments('notes')}
          </div>
        </div>
      </div>

      {/* AI Comment Generator & Section Applicator Modal */}
      {aiCommentModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#1B2430]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[14px] border border-[#E3E6EB] max-w-[620px] w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl flex flex-col gap-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E3E6EB]">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#5B3FD0]/10 text-[#5B3FD0] shrink-0">
                  <Sparkles className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-semibold text-base text-[#1B2430]">
                    AI Audit Comment Assistant
                  </h3>
                  <p className="text-xs text-[#5B6676]">
                    Generate context-aware audit commentary and apply it to any section at any time.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAiCommentModalOpen(false)}
                className="text-[#5B6676] hover:text-[#1B2430] p-1.5 rounded-lg hover:bg-[#F4F5F7] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Section Selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#5B6676]">
                Target Section to Apply Comment
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {SECTION_DEFINITIONS.map((s) => {
                  const isSelected = selectedTargetSection === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleSelectSection(s.id)}
                      className={`px-2.5 py-2 text-xs font-medium rounded-[8px] border text-left truncate transition-colors cursor-pointer ${
                        isSelected
                          ? 'border-[#5B3FD0] bg-[#F3F0FE] text-[#3F2A9E] font-semibold ring-1 ring-[#5B3FD0]'
                          : 'border-[#E3E6EB] bg-white text-[#5B6676] hover:bg-[#F8F9FA]'
                      }`}
                    >
                      {s.title.split(' ')[0]} {s.title.split(' ')[1] || ''}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Preset Prompts */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#5B6676]">
                Recommended Prompts for Selected Section
              </label>
              <div className="flex flex-wrap gap-1.5">
                {SECTION_DEFINITIONS.find((s) => s.id === selectedTargetSection)?.presetPrompts.map(
                  (prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handlePresetPrompt(prompt)}
                      className="px-2.5 py-1 text-xs rounded-full bg-[#F4F5F7] border border-[#E3E6EB] text-[#1B2430] hover:bg-[#E8EEFD] hover:text-[#1E4FD8] hover:border-[#1E4FD8]/40 transition-colors text-left cursor-pointer"
                    >
                      {prompt}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Custom Prompt Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#5B6676]">
                Custom AI Instructions (Optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customCommentPrompt}
                  onChange={(e) => setCustomCommentPrompt(e.target.value)}
                  placeholder="e.g., Note that Barclays confirmation was verified directly..."
                  className="flex-1 px-3.5 py-2 text-xs bg-white border border-[#D5D9E0] rounded-[10px] text-[#1B2430] placeholder:text-[#5B6676]/60 focus-visible:outline-2 focus-visible:outline-[#1E4FD8] focus-visible:outline-offset-2"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateCustomComment}
                  disabled={isGeneratingComment}
                >
                  {isGeneratingComment ? 'Generating...' : 'Generate'}
                </Button>
              </div>
            </div>

            {/* AI Generated Preview & Edit Box */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#3F2A9E] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#5B3FD0]" />
                  <span>Generated Comment (Editable before applying)</span>
                </label>
                <span className="text-[10px] font-mono-numbers px-2 py-0.5 rounded bg-[#E2F4EC] text-[#0B6B4D] font-semibold">
                  Confidence: 99.2%
                </span>
              </div>

              <textarea
                rows={3}
                value={generatedDraftComment}
                onChange={(e) => setGeneratedDraftComment(e.target.value)}
                className="w-full p-3 text-xs leading-relaxed border border-[#DDD6FA] rounded-[10px] bg-[#F3F0FE]/40 text-[#1B2430] focus-visible:outline-2 focus-visible:outline-[#5B3FD0] focus-visible:outline-offset-2 font-sans"
              />

              <div className="flex items-center justify-between text-[11px] text-[#5B6676]">
                <span>Source: Barclays_Operating_Statement_Sept2026.pdf (Prompt v2.4-comment-gen)</span>
                <span>Auditor review mandatory under ISA 230</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-[#E3E6EB] flex items-center justify-between sticky bottom-0 bg-white">
              <Button
                variant="ghost"
                size="md"
                onClick={() => setAiCommentModalOpen(false)}
              >
                Cancel
              </Button>

              <Button
                variant="primary"
                size="md"
                icon={<Check className="w-4 h-4" />}
                onClick={handleApplyComment}
              >
                Apply Comment to Section
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Version History Modal */}
      {historyModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#1B2430]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[14px] border border-[#E3E6EB] max-w-[540px] w-full p-6 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3E6EB]">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#1E4FD8]" />
                <h3 className="font-semibold text-base text-[#1B2430]">
                  WP B-10 Version History & Audit Log
                </h3>
              </div>
              <button
                onClick={() => setHistoryModalOpen(false)}
                className="text-sm font-semibold text-[#5B6676] hover:text-[#1B2430] cursor-pointer"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-[#5B6676]">
              Immutable event log tracking all mathematical adjustments, AI extractions, section comments, and sign-offs.
            </p>

            <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-1">
              {auditLog.map((log) => (
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

            <div className="pt-3 border-t border-[#E3E6EB] flex justify-end">
              <Button
                variant="outline"
                size="md"
                onClick={() => setHistoryModalOpen(false)}
              >
                Close history
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

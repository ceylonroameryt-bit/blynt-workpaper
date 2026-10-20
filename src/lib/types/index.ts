export type Framework = 'ISA' | 'US_GAAS' | 'AICPA';

export type UserRole = 'preparer' | 'reviewer' | 'partner' | 'manager';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  title: string;
  email: string;
  avatar: string;
  initials: string;
}

export type WorkpaperStatus =
  | 'Reviewed'
  | 'Prepared'
  | 'In progress'
  | 'Needs attention'
  | 'Not started'
  | 'Locked';

export type EngagementStage =
  | 'Planning'
  | 'Fieldwork'
  | 'Review'
  | 'Partner sign-off'
  | 'Locked';

export interface Client {
  id: string;
  name: string;
  industry: string;
  yearEnd: string;
  framework: Framework;
  currentEngagementId: string;
  stage: EngagementStage;
  progressPercent: number;
  openNotesCount: number;
  leadPartner: string;
  team: UserProfile[];
}

export interface EngagementSummary {
  id: string;
  clientId: string;
  clientName: string;
  period: string;
  yearEnd: string;
  framework: Framework;
  stage: EngagementStage;
  totalWorkpapers: number;
  preparedWorkpapers: number;
  reviewedWorkpapers: number;
  openReviewNotes: number;
  partnerLockStatus: 'Not started' | 'In progress' | 'Locked';
  materialityCents: number;
  performanceMaterialityCents: number;
  team: UserProfile[];
}

export interface TrialBalanceItem {
  id: string;
  code: string;
  accountName: string;
  closingBalanceCents: number; // positive = debit, negative = credit or stored as signed net
  debitCents: number;
  creditCents: number;
  priorYearCents: number;
  standardCategory: string;
  confidenceScore: number; // 0 to 100
  status: 'Confirmed' | 'AI suggested' | 'Needs category';
  fsLine: string;
  masterCode?: string;
}

export interface WorkpaperItem {
  id: string;
  ref: string; // e.g. "B-10", "A-01", "C-05"
  name: string;
  area: string; // e.g. "Cash & Cash Equivalents", "Revenue", "Prepayments"
  preparer: string;
  reviewer?: string;
  status: WorkpaperStatus;
  notesCount: number;
  updatedAt: string;
  flaggedByAi?: boolean;
  aiFlagReason?: string;
}

export interface OutstandingCheckItem {
  id: string;
  reference: string;
  date: string;
  payee: string;
  amountCents: number;
  tickmark?: string;
  clearedSubsequentDate?: string;
  hasReviewNote?: boolean;
  reviewNoteText?: string;
}

export interface DepositInTransitItem {
  id: string;
  reference: string;
  date: string;
  description: string;
  amountCents: number;
  tickmark?: string;
  clearedSubsequentDate?: string;
}

export interface ProcedureCheckItem {
  id: string;
  title: string;
  description: string;
  status: 'Done' | 'Pending' | 'Flagged';
  completedBy?: string;
  completedAt?: string;
}

export interface BankRecWorkpaperData {
  id: string;
  ref: string;
  title: string;
  status: WorkpaperStatus;
  lastUpdated: string;
  currency: string;
  // Summary Grid Amounts in integer cents
  ledgerBalanceCents: number;
  bankBalanceCents: number;
  outstandingChequesTotalCents: number;
  depositsInTransitTotalCents: number;
  adjustedBankBalanceCents: number;
  differenceCents: number;
  ties: boolean;
  
  // Lists
  outstandingCheques: OutstandingCheckItem[];
  depositsInTransit: DepositInTransitItem[];
  procedures: ProcedureCheckItem[];
  
  // Conclusion & AI
  conclusionText: string;
  aiSuggestedConclusion: string;
  
  // Evidence & Lineage
  evidence: {
    documentName: string;
    page: number;
    extractedValueCents: number;
    matchStatus: string;
    sourceSnippet: string;
  };
  aiLineage: {
    sourceFile: string;
    pageNumber: number;
    locationDescription: string;
    promptVersion: string;
    acceptedBy: string;
    acceptedAt: string;
    confidence: number;
  };
}

export interface ReviewNoteItem {
  id: string;
  workpaperId: string;
  workpaperRef: string;
  workpaperTitle: string;
  cellRef?: string;
  author: UserProfile;
  content: string;
  createdAt: string;
  status: 'Open' | 'Waiting on me' | 'Cleared';
  replies: {
    id: string;
    author: UserProfile;
    content: string;
    createdAt: string;
  }[];
}

export interface AdjustingEntryLine {
  id: string;
  accountCode: string;
  accountName: string;
  debitCents: number;
  creditCents: number;
  description: string;
}

export interface AdjustingJournalEntry {
  id: string;
  reference: string; // e.g. "AJE-004"
  title: string;
  date: string;
  stage: 'Proposed' | 'Approved' | 'Posted';
  reason: string;
  supportDocument: string;
  impactSummary: string;
  preparedBy: string;
  approvedBy?: string;
  lines: AdjustingEntryLine[];
  auditHistory: {
    action: string;
    user: string;
    timestamp: string;
    note?: string;
  }[];
}

export interface SignoffStage {
  role: 'Preparer' | 'Reviewer' | 'Partner lock';
  personName?: string;
  signedAt?: string;
  status: 'Done' | 'Pending' | 'Blocked';
}

export interface LockBlockerItem {
  id: string;
  title: string;
  category: string;
  status: 'Done' | 'Blocked';
  fixLinkText: string;
  fixHref: string;
}

export interface TemplateCardItem {
  id: string;
  name: string;
  area: string;
  description: string;
  version: string;
  category: 'Built-in' | 'Your firm' | 'Drafts';
  icon: string;
  proceduresCount: number;
  checksCount: number;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  details: string;
  entity: string;
}

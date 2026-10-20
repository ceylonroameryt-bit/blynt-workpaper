export type Framework = 'ISA' | 'US_GAAS' | 'AICPA';

export type UserRole = 'preparer' | 'reviewer' | 'partner';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  title: string;
  email: string;
  avatar: string;
}

export interface ClientEngagement {
  id: string;
  clientName: string;
  periodEnd: string;
  periodLabel: string;
  framework: Framework;
  organizationId: string;
  overallMateriality: number;
  tolerableMisstatement: number;
  assemblyDeadlineDays: number;
  reportReleaseDate?: string;
  isAssemblyLocked: boolean;
}

export interface MasterCOAItem {
  masterCode: string;
  standardName: string;
  category: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  fsLine: string;
  normalBalance: 'Debit' | 'Credit';
}

export interface TrialBalanceRow {
  accountCode: string;
  accountDescription: string;
  debit: number;
  credit: number;
  netBalance: number;
  priorYearBalance: number;
  masterCode?: string;
  aiSuggestedCode?: string;
  aiConfidence?: number;
  mappingStatus: 'unmapped' | 'suggested' | 'confirmed';
}

export interface AdjustingEntryLine {
  id: string;
  accountCode: string;
  description: string;
  debit: number;
  credit: number;
}

export interface AdjustingEntry {
  id: string;
  reference: string;
  date: string;
  description: string;
  status: 'Proposed' | 'Approved' | 'Posted';
  lines: AdjustingEntryLine[];
  preparedBy: string;
  reviewedBy?: string;
}

// Template Engine Types
export interface TemplateBinding {
  [key: string]: string; // e.g. "gl_balance": "sum(tb where master_code = 1010)"
}

export interface TemplateField {
  id: string;
  label: string;
  source?: string;
  input?: 'number' | 'text' | 'date' | 'boolean';
  locked?: boolean;
  evidence?: boolean;
  formula?: string;
  tickmarkAllowed?: boolean;
}

export interface TableColumn {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'currency';
  options?: string[];
  readOnly?: boolean;
}

export interface TemplateSection {
  id: string;
  title?: string;
  type: 'fields' | 'table' | 'custom' | 'analytics' | 'sampling';
  fields?: TemplateField[];
  columns?: TableColumn[];
  allowAddRows?: boolean;
}

export interface CheckRule {
  rule: string; // e.g. "difference = 0"
  message: string; // e.g. "Bank balance differs from ledger by {difference}"
  severity?: 'error' | 'warning';
}

export interface WorkpaperTemplate {
  template_id: string;
  version: number;
  title: string;
  category: string;
  area: string;
  description: string;
  bindings: TemplateBinding;
  sections: TemplateSection[];
  formulas: { [key: string]: string };
  checks: CheckRule[];
  procedures: string[];
  signoff: UserRole[];
}

export interface ProcedureStatus {
  procedureIndex: number;
  status: 'pending' | 'in_progress' | 'completed' | 'exception' | 'na';
  tickmark?: string;
  conclusion: string;
  performedBy?: string;
  performedAt?: string;
}

export interface SignoffRecord {
  role: UserRole;
  signedBy: string;
  userName: string;
  signedAt: string;
  comments?: string;
}

export interface WorkpaperInstance {
  id: string;
  template_id: string;
  template_version: number;
  title: string;
  refCode: string; // e.g. "A.1", "B.2"
  area: string;
  status: 'Not Started' | 'In Progress' | 'Prepared' | 'Reviewed' | 'Partner Approved';
  dataPayload: Record<string, any>;
  procedureStatuses: ProcedureStatus[];
  signoffs: SignoffRecord[];
  isLocked: boolean;
  lastUpdated: string;
  assignedTo: string;
  reviewerId: string;
}

// Tickmark & Evidence Linking
export interface BoundingBox {
  page: number;
  x: number; // percentage
  y: number; // percentage
  width: number;
  height: number;
}

export type TickmarkType =
  | 'agrees_to_ledger'
  | 'agrees_to_bank_statement'
  | 'tested_and_verified'
  | 'invoiced_and_vouched'
  | 'calculation_checked'
  | 'subsequent_receipt_tested'
  | 'confirmed_independent';

export interface Tickmark {
  id: string;
  workpaperId: string;
  targetField: string; // e.g. "bank_balance" or "outstanding[0].amount"
  documentId: string;
  documentTitle: string;
  pageNo: number;
  boundingBox?: BoundingBox;
  markType: TickmarkType;
  markSymbol: string;
  markColor: string;
  placedBy: string;
  placedAt: string;
  explanation: string;
}

export interface DocumentItem {
  id: string;
  periodId: string;
  fileName: string;
  fileType: string;
  fileHash: string; // SHA-256
  storageKey: string;
  uploadedBy: string;
  uploadedAt: string;
  fileSize: string;
  category: string;
  previewUrl?: string;
  annotations?: {
    id: string;
    label: string;
    page: number;
    box: BoundingBox;
    matchedValue?: string | number;
  }[];
}

// Review Notes
export interface ReviewNote {
  id: string;
  workpaperId: string;
  workpaperRef: string;
  fieldRef?: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  text: string;
  status: 'Open' | 'Cleared' | 'Rejected';
  createdAt: string;
  clearedBy?: string;
  clearedAt?: string;
  clearedExplanation?: string;
}

// AI Lineage & Audit Log
export interface AILineageRecord {
  id: string;
  workpaperId: string;
  targetField: string;
  sourceDocumentId?: string;
  sourceDocumentName?: string;
  sourceLocation?: {
    page?: number;
    tableIndex?: number;
    boundingBox?: BoundingBox;
    cell?: string;
  };
  promptVersion: string;
  transformationLogic: string;
  aiOutput: any;
  confidenceScore: number;
  humanEdit?: {
    hasEdited: boolean;
    originalAI: any;
    auditorFinal: any;
    diffSummary: string;
  };
  approvedBy?: string;
  approvedAt?: string;
  isPostAssemblyLocked: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  entityType: 'workpaper' | 'trial_balance' | 'document' | 'signoff' | 'mapping' | 'aje';
  entityId: string;
  entityName: string;
  action: 'CREATE' | 'UPDATE' | 'SIGN_OFF' | 'LOCK' | 'REJECT' | 'AI_ACCEPT' | 'TICKMARK_ADD';
  oldValue?: string;
  newValue?: string;
  reason?: string;
}

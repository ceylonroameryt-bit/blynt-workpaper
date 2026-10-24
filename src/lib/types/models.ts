/**
 * Blynt Workpapers Data Models
 * Exactly matches the database schema & ground rules.
 */

export type UserRole = 'preparer' | 'reviewer' | 'manager' | 'partner' | 'admin';

export type StatusKey =
  | 'not_started'
  | 'in_progress'
  | 'prepared'
  | 'signed_off'
  | 'needs_you'
  | 'stale'
  | 'waiting_on_client'
  | 'ai_suggestion';

export interface StatusMeta {
  key: StatusKey;
  symbol: string;
  label: string;
  colorClass: string;
  bgClass: string;
}

export const STATUS_DEFINITIONS: Record<StatusKey, StatusMeta> = {
  not_started: {
    key: 'not_started',
    symbol: '○',
    label: 'Not started',
    colorClass: 'text-[#5B6478]',
    bgClass: 'bg-[#F4F5F7]',
  },
  in_progress: {
    key: 'in_progress',
    symbol: '◑',
    label: 'In progress',
    colorClass: 'text-[#1D4E89]',
    bgClass: 'bg-[#EAF5FC]',
  },
  prepared: {
    key: 'prepared',
    symbol: '●',
    label: 'Prepared',
    colorClass: 'text-[#102654]',
    bgClass: 'bg-[#EAF5FC]',
  },
  signed_off: {
    key: 'signed_off',
    symbol: '✓',
    label: 'Signed off',
    colorClass: 'text-[#0B6B52]',
    bgClass: 'bg-[#E6F4EF]',
  },
  needs_you: {
    key: 'needs_you',
    symbol: '!',
    label: 'Needs you',
    colorClass: 'text-[#B8432F]',
    bgClass: 'bg-[#FFF1EE]',
  },
  stale: {
    key: 'stale',
    symbol: '⚠',
    label: 'Stale',
    colorClass: 'text-[#6B4700]',
    bgClass: 'bg-[#FFF4DB]',
  },
  waiting_on_client: {
    key: 'waiting_on_client',
    symbol: '◷',
    label: 'Waiting on client',
    colorClass: 'text-[#5B6478]',
    bgClass: 'bg-[#F4F5F7]',
  },
  ai_suggestion: {
    key: 'ai_suggestion',
    symbol: '✦',
    label: 'AI suggestion',
    colorClass: 'text-[#A23A27]',
    bgClass: 'bg-[#FFF1EE]',
  },
};

export type CompanyType =
  | 'Sole trader'
  | 'Partnership'
  | 'LLP (FRS 102 + LLP SORP)'
  | 'Micro-entity (FRS 105)'
  | 'Small company (FRS 102 1A)'
  | 'Medium/large (FRS 102)'
  | 'IFRS company/group'
  | 'Charity (SORP)'
  | 'Academy trust';

export type DataSource = 'blynt' | 'xero' | 'quickbooks' | 'csv' | 'freeagent' | 'sage';

export interface Firm {
  id: string;
  name: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  initials: string;
  title: string;
  mfa_enabled: boolean;
  avatar?: string;
}

export interface Membership {
  user_id: string;
  firm_id: string;
  role: UserRole;
}

export interface Client {
  id: string;
  firm_id?: string;
  name: string;
  company_no?: string;
  company_type?: CompanyType;
  year_end?: string;
  yearEnd?: string;
  data_source?: DataSource;
  reconnect_needed?: boolean;
  industry?: string;
  framework?: string;
  currentEngagementId?: string;
  [key: string]: any;
}

export interface Engagement {
  id: string;
  client_id: string;
  firm_id: string;
  period_start: string;
  period_end: string;
  framework: string;
  template_pack_id: string;
  status: 'planning' | 'fieldwork' | 'review' | 'locked';
  locked_at: string | null;
  locked_by?: string | null;
  prior_engagement_id: string | null;
}

export interface BlyntAccount {
  code: string;
  name: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Cost of Sales' | 'Overhead';
  normal_balance: 'Debit' | 'Credit';
  lead_letter: string; // e.g. "A", "B", "C", "D", "E", "F", "K", "Q", "Z"
  is_control: boolean;
  is_system: boolean;
  used_by_count?: number;
}

export interface MappingList {
  id: string;
  firm_id: string;
  company_type: CompanyType;
  version: number;
  status: 'draft' | 'published';
  rule_count?: number;
  clients_using?: number;
}

export interface MappingRule {
  id: string;
  mapping_list_id: string;
  source_system: DataSource;
  source_code: string;
  source_name_pattern: string;
  blynt_code: string;
  scope: 'client' | 'firm';
}

export interface TbSnapshot {
  id: string;
  engagement_id: string;
  source: DataSource;
  as_at: string;
  raw_json: string;
  sha256: string;
  created_by: string;
  created_at: string;
}

export interface TbLine {
  id: string;
  snapshot_id: string;
  source_code: string;
  source_name: string;
  source_type: string;
  debit_p: string; // stored as string for exact bigint serialization
  credit_p: string;
}

export interface AccountMapping {
  id: string;
  engagement_id: string;
  source_code: string;
  source_name: string;
  source_type: string;
  balance_p: string; // Net balance in pence (string for bigint)
  blynt_code: string | null;
  status: 'suggested' | 'confirmed' | 'needs_you';
  confidence: number; // 0 - 100
  method: 'rule' | 'ai' | 'manual';
  ai_alternatives?: { blynt_code: string; name: string; reason: string; confidence: number }[];
  confirmed_by: string | null;
  confirmed_at: string | null;
  comment_count?: number;
}

export interface AdjustmentLine {
  id: string;
  adjustment_id: string;
  blynt_code: string;
  debit_p: string; // string for bigint
  credit_p: string;
  narrative?: string;
}

export interface Adjustment {
  id: string;
  engagement_id: string;
  ref: string; // e.g. AJE-001
  narrative: string;
  status: 'proposed' | 'approved' | 'posted';
  proposed_by: string;
  proposed_by_name: string;
  approved_by: string | null;
  approved_by_name?: string | null;
  created_at: string;
  lines: AdjustmentLine[];
}

export interface Template {
  id: string;
  key: string;
  name: string;
  area_letter: string;
  company_types: CompanyType[];
  version: number;
  schema_json: Record<string, any>;
  status: 'published' | 'draft';
  used_by_count?: number;
  is_builtin?: boolean;
}

export interface Workpaper {
  id: string;
  engagement_id: string;
  ref: string; // e.g. "F-10", "B-10"
  template_id: string;
  template_version: number;
  data_json: Record<string, any>;
  status: StatusKey;
  rolled_from_workpaper_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Procedure {
  id: string;
  workpaper_id: string;
  text: string;
  done_by: string | null;
  done_at: string | null;
  not_applicable_reason: string | null;
}

export type AnchorJson =
  | { kind: 'cell'; section: string; row: string; col: string }
  | { kind: 'text'; section: string; start: number; end: number }
  | { kind: 'row'; table: string; row: string }
  | { kind: 'file'; attachment_id: string }
  | { kind: 'paper' };

export interface Comment {
  id: string;
  workpaper_id: string;
  type: 'comment' | 'review_note' | 'client_query';
  anchor_json: AnchorJson;
  anchor_summary?: string;
  status: 'open' | 'resolved';
  created_by: string;
  created_by_name: string;
  created_at: string;
  resolved_by: string | null;
  resolved_by_name?: string | null;
  resolved_at?: string | null;
  body: string;
  replies?: CommentReply[];
}

export interface CommentReply {
  id: string;
  comment_id: string;
  body: string;
  mentions: string[];
  created_by: string;
  created_by_name: string;
  created_at: string;
}

export type AttachmentCategory =
  | 'Invoice'
  | 'Register'
  | 'Statement'
  | 'Photo'
  | 'Board minute'
  | 'Valuation'
  | 'Confirmation'
  | 'From client'
  | 'Other';

export interface Attachment {
  id: string;
  engagement_id: string;
  workpaper_id: string | null;
  file_key: string;
  filename: string;
  mime: string;
  size: number;
  sha256: string;
  category: AttachmentCategory;
  is_permanent: boolean;
  uploaded_by: string;
  uploaded_by_name: string;
  uploaded_at: string;
  links?: AttachmentLink[];
}

export interface AttachmentLink {
  attachment_id: string;
  anchor_json: AnchorJson;
}

export interface Signoff {
  id: string;
  workpaper_id: string;
  role: 'preparer' | 'reviewer' | 'partner';
  user_id: string;
  user_name: string;
  signed_at: string;
  content_hash: string;
  stale_at: string | null;
  stale_reason?: string | null;
}

export interface ViewPrefs {
  user_id: string;
  scope: 'user' | 'firm';
  key: string;
  value_json: {
    showPriorYear?: boolean;
    showChangePercent?: boolean;
    showSource?: boolean;
    showTickmarks?: boolean;
    rowSpacing?: 'comfortable' | 'compact';
    textSize?: 'S' | 'M' | 'L';
    highContrast?: boolean;
    inactivityTimeoutMinutes?: number;
    selectedClientId?: string;
    onboardingCompleted?: boolean;
    primaryCompanyType?: string;
    jurisdiction?: string;
    [key: string]: any;
  };
}

export interface AuditLog {
  id: string;
  firm_id: string;
  actor_id: string;
  actor_name: string;
  actor_role: UserRole;
  action: string;
  entity: string;
  entity_id: string;
  before_json: string | null;
  after_json: string | null;
  at: string;
}

export interface AiLineage {
  id: string;
  entity: string;
  entity_id: string;
  field: string;
  source_attachment_id: string | null;
  page: number | null;
  model: string;
  prompt_version: string;
  accepted_by: string;
  accepted_at: string;
}

import {
  MOCK_CLIENTS,
  MOCK_ENGAGEMENT,
  MOCK_WORKPAPERS,
  MOCK_BANK_REC,
  MOCK_TRIAL_BALANCE,
  MOCK_REVIEW_NOTES,
  MOCK_ADJUSTMENTS,
  MOCK_SIGN_OFF_BLOCKERS,
  MOCK_TEMPLATES,
  MOCK_AUDIT_LOGS,
  CURRENT_USER,
  TEAM_MEMBERS,
} from '../mock';

import {
  Client,
  EngagementSummary,
  WorkpaperItem,
  BankRecWorkpaperData,
  TrialBalanceItem,
  ReviewNoteItem,
  AdjustingJournalEntry,
  LockBlockerItem,
  TemplateCardItem,
  AuditLogItem,
  UserProfile,
} from '../types';

/**
 * /lib/api layer
 * Structured so a real backend / fetch / REST client can replace these async mocks.
 */

export async function getCurrentUser(): Promise<UserProfile> {
  return CURRENT_USER;
}

export async function getTeamMembers(): Promise<UserProfile[]> {
  return TEAM_MEMBERS;
}

export async function getClients(): Promise<Client[]> {
  return [...MOCK_CLIENTS];
}

export async function getClientById(id: string): Promise<Client | undefined> {
  return MOCK_CLIENTS.find((c) => c.id === id);
}

export async function getEngagement(engagementId: string): Promise<EngagementSummary> {
  return { ...MOCK_ENGAGEMENT, id: engagementId };
}

export async function getWorkpapers(
  engagementId: string,
  filter?: 'all' | 'mine' | 'needs_review' | 'flagged'
): Promise<WorkpaperItem[]> {
  let list = [...MOCK_WORKPAPERS];
  if (filter === 'mine') {
    list = list.filter((w) => w.preparer === CURRENT_USER.name || w.reviewer === CURRENT_USER.name);
  } else if (filter === 'needs_review') {
    list = list.filter((w) => w.status === 'Prepared' || w.status === 'Needs attention');
  } else if (filter === 'flagged') {
    list = list.filter((w) => w.flaggedByAi === true);
  }
  return list;
}

export async function getWorkpaperById(
  engagementId: string,
  workpaperId: string
): Promise<BankRecWorkpaperData | null> {
  if (workpaperId === 'wp_b10' || workpaperId === 'B-10' || workpaperId === 'b-10') {
    return { ...MOCK_BANK_REC };
  }
  return {
    ...MOCK_BANK_REC,
    id: workpaperId,
    ref: 'B-10',
    title: 'Bank reconciliation - Barclays Operating',
  };
}

export async function getTrialBalance(_engagementId: string): Promise<TrialBalanceItem[]> {
  return [...MOCK_TRIAL_BALANCE];
}

export async function getReviewNotes(
  _engagementId: string,
  workpaperId?: string
): Promise<ReviewNoteItem[]> {
  if (workpaperId) {
    return MOCK_REVIEW_NOTES.filter((n) => n.workpaperId === workpaperId);
  }
  return [...MOCK_REVIEW_NOTES];
}

export async function getAdjustingEntries(
  _engagementId: string,
  stage?: 'Proposed' | 'Approved' | 'Posted'
): Promise<AdjustingJournalEntry[]> {
  if (stage) {
    return MOCK_ADJUSTMENTS.filter((a) => a.stage === stage);
  }
  return [...MOCK_ADJUSTMENTS];
}

export async function getSignOffBlockers(_engagementId: string): Promise<LockBlockerItem[]> {
  return [...MOCK_SIGN_OFF_BLOCKERS];
}

export async function getTemplates(
  category?: 'Built-in' | 'Your firm' | 'Drafts'
): Promise<TemplateCardItem[]> {
  if (category) {
    return MOCK_TEMPLATES.filter((t) => t.category === category);
  }
  return [...MOCK_TEMPLATES];
}

export async function getAuditLogs(_engagementId: string): Promise<AuditLogItem[]> {
  return [...MOCK_AUDIT_LOGS];
}

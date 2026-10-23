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
  ProcedureCheckItem,
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
    list = list.filter(
      (w) =>
        w.preparer === CURRENT_USER.name ||
        w.reviewer === CURRENT_USER.name ||
        w.preparer.includes('Sam Rivera') ||
        (w.reviewer ? w.reviewer.includes('Sam Rivera') : false)
    );
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
  // 1. Direct match for Barclays bank reconciliation
  if (workpaperId === 'wp_b10' || workpaperId === 'B-10' || workpaperId === 'b-10') {
    return {
      ...MOCK_BANK_REC,
      area: 'Cash & Cash Equivalents',
      standardRef: 'ISA (UK) 505 / 500',
      framework: 'ISA (UK)',
      businessType: 'General Commercial',
      tbBindings: ['1010 Cash & Equivalents'],
    };
  }

  // 2. Check in MOCK_TEMPLATES (51 UK standards across all sectors)
  const template = MOCK_TEMPLATES.find(
    (t) =>
      t.id === workpaperId ||
      t.leadRef?.toLowerCase() === workpaperId.toLowerCase() ||
      t.id.toLowerCase() === workpaperId.toLowerCase()
  );

  // 3. Check in MOCK_WORKPAPERS
  const wp = MOCK_WORKPAPERS.find(
    (w) => w.id === workpaperId || w.ref.toLowerCase() === workpaperId.toLowerCase()
  );

  if (template) {
    const procedures: ProcedureCheckItem[] = (
      template.keyProcedures && template.keyProcedures.length > 0
        ? template.keyProcedures
        : [
            'Agree schedule balances to general ledger nominal accounts without variance',
            'Vouch supporting documentation and third-party certifications',
            'Verify compliance with UK statutory disclosure and filing requirements',
            'Recalculate mathematical footing, cross-casts, and tax apportionments',
          ]
    ).map((proc: string, idx: number) => ({
      id: `proc_${idx + 1}`,
      title: proc,
      description: `Statutory audit procedure conducted under ${template.standardRef || 'ISA (UK)'}.`,
      status: idx === 0 || idx === 1 ? 'Done' : 'Pending',
      completedBy: idx === 0 || idx === 1 ? CURRENT_USER.name : undefined,
      completedAt: idx === 0 || idx === 1 ? 'Today at 09:30' : undefined,
    }));

    const rawBindings =
      template.tbBindings && template.tbBindings.length > 0
        ? template.tbBindings
        : [`TB Lead Account for ${template.leadRef || 'WP'}`];

    const scheduleRows = rawBindings.map((binding: string, idx: number) => {
      const priorYear = 14500000 + idx * 5600000;
      const draftTb = 16800000 + idx * 6200000;
      const adjustments = idx === 1 ? -412000 : 0;
      const audited = draftTb + adjustments;
      const variancePercent = Number((((audited - priorYear) / priorYear) * 100).toFixed(1));
      return {
        id: `row_${idx + 1}`,
        accountCode: binding.split(' ')[0] || `GL-${1000 + idx * 10}`,
        description: binding,
        priorYearCents: priorYear,
        draftTbCents: draftTb,
        adjustmentsCents: adjustments,
        auditedCents: audited,
        variancePercent,
        tickmark: '✓',
        notes: idx === 1 ? 'Adjusted per AJE-004' : 'Footed and agreed to trial balance',
      };
    });

    const totalAudited = scheduleRows.reduce((sum: number, r: any) => sum + r.auditedCents, 0);

    return {
      ...MOCK_BANK_REC,
      id: template.id,
      ref: template.leadRef || 'WP-01',
      title: template.name,
      area: template.area,
      standardRef: template.standardRef,
      framework: template.framework,
      businessType: template.businessType,
      tbBindings: template.tbBindings,
      ledgerBalanceCents: totalAudited,
      bankBalanceCents: totalAudited,
      adjustedBankBalanceCents: totalAudited,
      outstandingChequesTotalCents: 0,
      depositsInTransitTotalCents: 0,
      differenceCents: 0,
      ties: true,
      procedures,
      scheduleRows,
      conclusionText: `Substantive audit testing of ${template.name} performed in accordance with ${template.standardRef || 'applicable UK standards'}. All balances tie to general ledger nominals with zero unadjusted differences. No material misstatements noted.`,
      aiSuggestedConclusion: `Based on automated recalculation, supporting document vouching, and nominal tie-out to ${template.tbBindings?.join(', ') || 'trial balance'}, ${template.name} reflects true and fair value under ${template.framework || 'UK GAAP'}.`,
      evidence: {
        documentName: `${(template.leadRef || 'WP').replace(/[^a-zA-Z0-9]/g, '_')}_Statutory_Audit_Evidence_FY26.pdf`,
        page: 1,
        extractedValueCents: totalAudited,
        matchStatus: 'Exact Match (100%)',
        sourceSnippet: `Statutory verification schedule for ${template.name} tied directly to Trial Balance accounts: ${template.tbBindings?.join(', ') || 'N/A'}.`,
      },
      aiLineage: {
        sourceFile: `${(template.leadRef || 'WP').replace(/[^a-zA-Z0-9]/g, '_')}_Evidence_FY26.pdf`,
        pageNumber: 1,
        locationDescription: `Primary Schedule Tie-Out (${template.leadRef || 'General'})`,
        promptVersion: 'v3.5-uk-standard',
        acceptedBy: 'Sam Rivera (Test - Audit Manager)',
        acceptedAt: 'Today at 09:42',
        confidence: 0.99,
      },
    };
  }

  // 4. Fallback for workpaper in MOCK_WORKPAPERS
  if (wp) {
    return {
      ...MOCK_BANK_REC,
      id: wp.id,
      ref: wp.ref,
      title: wp.name,
      area: wp.area,
      standardRef: 'UK Statutory Practice',
      framework: 'FRS 102',
    };
  }

  // 5. General fallback
  return {
    ...MOCK_BANK_REC,
    id: workpaperId,
    ref: 'WP-GEN',
    title: `Workpaper ${workpaperId}`,
    area: 'General Audit Workpaper',
    standardRef: 'UK Standard',
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

/**
 * Working paper template library.
 * Every paper has the same shape: objective, lead figures from the Blynt chart,
 * schedule, checks, procedures, evidence, conclusion and sign-off.
 * The schedule kind decides how the schedule is laid out and calculated.
 */

export type ScheduleKind = 'reconciliation' | 'assets' | 'lines' | 'checklist';

export interface LeadDef {
  code: string; // Blynt chart code, matched by prefix (e.g. "15" covers 1500-1599)
  label: string;
}

export interface LineColumn {
  key: string;
  label: string;
  money?: boolean; // default true
  inTotal?: boolean; // counts towards the line total (default true for money columns)
}

export interface TemplateDef {
  ref: string;
  area: string; // area letter
  areaName: string;
  title: string;
  version: number;
  summary: string;
  objective: string;
  assertions: string[];
  leads: LeadDef[];
  /** Credit-balance areas (creditors, income, equity, tax) show the TB as a positive figure. */
  creditArea?: boolean;
  kind: ScheduleKind;
  /** For 'lines': the columns of each line. */
  columns?: LineColumn[];
  /** For 'checklist': the questions. */
  questions?: string[];
  /** For 'checklist': whether to show the materiality calculator (A-10). */
  materiality?: boolean;
  procedures: string[];
  allTypes?: boolean;
}

export const TEMPLATES: TemplateDef[] = [
  {
    ref: 'A-10',
    area: 'A',
    areaName: 'Planning',
    title: 'Planning and materiality',
    version: 4,
    summary: 'Materiality, risks, team briefing.',
    objective: 'Plan the engagement: set materiality, identify the key risks and brief the team before fieldwork starts.',
    assertions: ['Planning', 'Risk assessment'],
    leads: [
      { code: '40', label: 'Revenue' },
      { code: '41', label: 'Export revenue' },
    ],
    creditArea: true,
    kind: 'checklist',
    materiality: true,
    questions: [
      'Engagement letter signed and on file for this year',
      'Independence and ethics confirmed for every team member',
      'Prior year file and points forward reviewed',
      'Key risks identified and responses planned',
      'Team briefing held and recorded',
    ],
    procedures: [
      'Set overall and performance materiality and record the benchmark used.',
      'Document the significant risks and the planned response to each.',
      'Brief the team on risks, materiality and deadlines.',
    ],
    allTypes: true,
  },
  {
    ref: 'B-10',
    area: 'B',
    areaName: 'Cash and bank',
    title: 'Bank reconciliation',
    version: 3,
    summary: 'Ledger to statement, reconciling items, bank confirmation.',
    objective: 'Confirm the bank balance exists, is complete and is correctly cut off at the year end.',
    assertions: ['Existence', 'Completeness', 'Accuracy', 'Cut-off'],
    leads: [
      { code: '1000', label: 'Petty cash' },
      { code: '1010', label: 'Bank current account' },
      { code: '1020', label: 'Bank deposit account' },
    ],
    kind: 'reconciliation',
    procedures: [
      'Agree ledger balance to trial balance.',
      'Agree statement balance to bank statement and confirmation.',
      'Vouch reconciling items to after-date statements.',
      'Check for unusual items around year end.',
    ],
    allTypes: true,
  },
  {
    ref: 'C-10',
    area: 'C',
    areaName: 'Debtors',
    title: 'Debtors lead and ageing',
    version: 3,
    summary: 'Ageing, recoverability, after-date receipts.',
    objective: 'Confirm trade debtors exist, are recoverable and are stated net of any required provision.',
    assertions: ['Existence', 'Valuation', 'Rights'],
    leads: [
      { code: '1200', label: 'Trade debtors control' },
      { code: '1210', label: 'Bad debt provision' },
      { code: '1400', label: 'Prepayments' },
    ],
    kind: 'lines',
    columns: [
      { key: 'current', label: 'Current' },
      { key: 'd30', label: '31–60 days' },
      { key: 'd60', label: '61–90 days' },
      { key: 'd90', label: '90+ days' },
      { key: 'after_date', label: 'After-date receipts', inTotal: false },
    ],
    procedures: [
      'Agree the aged debtors listing to the control account.',
      'Test after-date receipts for the largest balances.',
      'Review old balances and assess the need for a provision.',
    ],
  },
  {
    ref: 'D-10',
    area: 'D',
    areaName: 'Stock',
    title: 'Stock and work in progress',
    version: 2,
    summary: 'Count results, cost and net realisable value.',
    objective: 'Confirm stock exists and is valued at the lower of cost and net realisable value.',
    assertions: ['Existence', 'Valuation', 'Completeness'],
    leads: [{ code: '1300', label: 'Finished goods stock' }],
    kind: 'lines',
    columns: [
      { key: 'qty', label: 'Quantity', money: false, inTotal: false },
      { key: 'amount', label: 'Value at cost' },
    ],
    procedures: [
      'Attend or review the stock count and agree count sheets to the listing.',
      'Test the cost of a sample of lines to purchase invoices.',
      'Compare cost to selling price after the year end for net realisable value.',
    ],
  },
  {
    ref: 'E-10',
    area: 'E',
    areaName: 'Equity and reserves',
    title: 'Equity and reserves',
    version: 2,
    summary: 'Share capital, reserves movement, dividends.',
    objective: 'Confirm share capital and reserves are correctly stated and movements are explained.',
    assertions: ['Accuracy', 'Presentation'],
    leads: [
      { code: '30', label: 'Share capital' },
      { code: '31', label: 'Reserves' },
    ],
    creditArea: true,
    kind: 'lines',
    columns: [{ key: 'amount', label: 'Amount' }],
    procedures: [
      'Agree share capital to the Companies House confirmation statement.',
      'Reconcile the movement in reserves to profit and dividends.',
      'Check dividends are supported by minutes and distributable reserves.',
    ],
  },
  {
    ref: 'F-10',
    area: 'F',
    areaName: 'Fixed assets',
    title: 'Fixed assets and depreciation',
    version: 2,
    summary: 'Additions, disposals, depreciation proof.',
    objective:
      'Confirm fixed assets exist, are owned, are recorded at cost less depreciation in line with the stated policies, and that additions and disposals are correctly recorded.',
    assertions: ['Existence', 'Rights', 'Valuation', 'Completeness'],
    leads: [
      { code: '15', label: 'Equipment (cost)' },
      { code: '17', label: 'Accumulated depreciation' },
      { code: '6900', label: 'Depreciation charge' },
      { code: '6950', label: 'Loss or profit on disposal' },
    ],
    kind: 'assets',
    procedures: [
      'Agree closing cost and accumulated depreciation to the trial balance.',
      'Vouch additions over £1,000 to purchase invoices.',
      'Inspect evidence of disposal proceeds and check the profit or loss.',
      'Perform a proof in total of the depreciation charge.',
    ],
  },
  {
    ref: 'I-10',
    area: 'I',
    areaName: 'Income',
    title: 'Revenue',
    version: 2,
    summary: 'Revenue analysis, cut-off, analytical review.',
    objective: 'Confirm revenue is complete, accurate and recorded in the correct period.',
    assertions: ['Occurrence', 'Completeness', 'Cut-off'],
    leads: [
      { code: '40', label: 'UK sales' },
      { code: '41', label: 'Export sales' },
    ],
    creditArea: true,
    kind: 'lines',
    columns: [
      { key: 'amount', label: 'This year' },
      { key: 'prior', label: 'Prior year', inTotal: false },
    ],
    procedures: [
      'Analyse revenue by stream and explain significant movements.',
      'Test sales cut-off either side of the year end.',
      'Agree a sample of sales to invoices and receipts.',
    ],
  },
  {
    ref: 'K-10',
    area: 'K',
    areaName: 'Creditors',
    title: 'Creditors and accruals',
    version: 3,
    summary: 'Supplier statements, search for unrecorded liabilities.',
    objective: 'Confirm creditors and accruals are complete and correctly stated at the year end.',
    assertions: ['Completeness', 'Accuracy', 'Cut-off'],
    leads: [
      { code: '2000', label: 'Trade creditors' },
      { code: '2100', label: 'Accruals' },
    ],
    creditArea: true,
    kind: 'lines',
    columns: [
      { key: 'amount', label: 'Per ledger' },
      { key: 'statement', label: 'Per supplier statement', inTotal: false },
    ],
    procedures: [
      'Reconcile the largest supplier balances to supplier statements.',
      'Search for unrecorded liabilities in after-date payments.',
      'Review accruals for completeness and reasonableness.',
    ],
  },
  {
    ref: 'P-10',
    area: 'P',
    areaName: 'Costs and overheads',
    title: 'Costs and overheads',
    version: 2,
    summary: 'Cost analysis, payroll, analytical review.',
    objective: 'Confirm costs and overheads are complete, accurate and relate to the business.',
    assertions: ['Occurrence', 'Accuracy', 'Classification'],
    leads: [
      { code: '5', label: 'Cost of sales' },
      { code: '60', label: 'Premises costs' },
      { code: '61', label: 'Utilities' },
      { code: '62', label: 'Staff costs' },
    ],
    kind: 'lines',
    columns: [
      { key: 'amount', label: 'This year' },
      { key: 'prior', label: 'Prior year', inTotal: false },
    ],
    procedures: [
      'Analyse costs by category and explain significant movements.',
      'Agree payroll costs to payroll summaries and RTI submissions.',
      'Vouch a sample of costs to invoices.',
    ],
  },
  {
    ref: 'T-10',
    area: 'T',
    areaName: 'Tax',
    title: 'Tax balances',
    version: 2,
    summary: 'VAT, PAYE and corporation tax balances.',
    objective: 'Confirm tax liabilities are complete and agree to returns filed after the year end.',
    assertions: ['Completeness', 'Accuracy'],
    leads: [
      { code: '2200', label: 'VAT liability' },
      { code: '2300', label: 'PAYE and NIC' },
    ],
    creditArea: true,
    kind: 'lines',
    columns: [
      { key: 'amount', label: 'Per ledger' },
      { key: 'return', label: 'Per return', inTotal: false },
    ],
    procedures: [
      'Agree the VAT liability to the return for the final quarter.',
      'Agree PAYE and NIC to the month 12 payroll submission.',
      'Review the corporation tax computation and charge.',
    ],
  },
  {
    ref: 'Z-10',
    area: 'Z',
    areaName: 'Completion',
    title: 'Completion checklist',
    version: 5,
    summary: 'Subsequent events, going concern, representations.',
    objective: 'Complete the engagement: confirm nothing has happened since the year end that changes the accounts.',
    assertions: ['Presentation', 'Going concern'],
    leads: [],
    kind: 'checklist',
    questions: [
      'Subsequent events reviewed up to the date of approval',
      'Going concern assessment documented and supported',
      'Management representation letter obtained',
      'Final analytical review completed',
      'All review notes cleared',
    ],
    procedures: [
      'Review board minutes and post year-end transactions for subsequent events.',
      'Obtain and file the signed management representation letter.',
    ],
    allTypes: true,
  },
  {
    ref: 'Z-20',
    area: 'Z',
    areaName: 'Completion',
    title: 'FRS 102 1A disclosure checklist',
    version: 2,
    summary: 'Required notes for small companies.',
    objective: 'Confirm the accounts include every disclosure required for a small company under FRS 102 Section 1A.',
    assertions: ['Presentation', 'Disclosure'],
    leads: [],
    kind: 'checklist',
    questions: [
      'Accounting policies note included',
      'Average number of employees disclosed',
      'Directors’ advances, credits and guarantees disclosed',
      'Financial commitments and contingencies disclosed',
      'Related party transactions disclosed where required',
    ],
    procedures: ['Complete the disclosure checklist against the draft accounts.'],
  },
];

/** Papers each company type starts with. */
export const PACKS: Record<string, string[]> = {
  'Sole trader': ['A-10', 'B-10', 'C-10', 'K-10', 'I-10', 'P-10', 'Z-10'],
  Partnership: ['A-10', 'B-10', 'C-10', 'F-10', 'K-10', 'E-10', 'I-10', 'P-10', 'Z-10'],
  'LLP (FRS 102 + LLP SORP)': ['A-10', 'B-10', 'C-10', 'F-10', 'K-10', 'E-10', 'I-10', 'P-10', 'T-10', 'Z-10'],
  'Micro-entity (FRS 105)': ['A-10', 'B-10', 'C-10', 'F-10', 'K-10', 'T-10', 'Z-10'],
  'Small company (FRS 102 1A)': ['A-10', 'B-10', 'C-10', 'D-10', 'F-10', 'K-10', 'T-10', 'E-10', 'I-10', 'P-10', 'Z-10', 'Z-20'],
  'Medium/large (FRS 102)': ['A-10', 'B-10', 'C-10', 'D-10', 'F-10', 'K-10', 'T-10', 'E-10', 'I-10', 'P-10', 'Z-10'],
  'IFRS company/group': ['A-10', 'B-10', 'C-10', 'D-10', 'F-10', 'K-10', 'T-10', 'E-10', 'I-10', 'P-10', 'Z-10'],
  'Charity (SORP)': ['A-10', 'B-10', 'C-10', 'F-10', 'K-10', 'E-10', 'I-10', 'P-10', 'Z-10'],
  'Academy trust': ['A-10', 'B-10', 'C-10', 'F-10', 'K-10', 'E-10', 'I-10', 'P-10', 'Z-10'],
};

/** Optional papers that only some engagements need. */
export const OPTIONAL_REFS = ['D-10', 'Z-20'];

export function packFor(companyType: string | undefined, includeOptional = true): string[] {
  const refs = PACKS[companyType ?? ''] ?? PACKS['Small company (FRS 102 1A)'];
  return includeOptional ? refs : refs.filter((r) => !OPTIONAL_REFS.includes(r));
}

export function templateFor(ref: string): TemplateDef | undefined {
  return TEMPLATES.find((t) => t.ref === ref);
}

/** Blank data for a new paper of this template. */
export function blankPaperData(t: TemplateDef): Record<string, any> {
  const base = {
    title: t.title,
    objective: t.objective,
    assertions: t.assertions,
    conclusion: { text: '', bot_dismissed: false },
    explanations: {} as Record<string, string>,
  };
  if (t.kind === 'reconciliation') {
    return {
      ...base,
      bank_name: '',
      statement_p: '0',
      confirmation_p: '0',
      sections: [
        { id: 'less', label: 'Less: unpresented cheques', sign: -1, rows: [] },
        { id: 'add', label: 'Add: deposits in transit', sign: 1, rows: [] },
      ],
    };
  }
  if (t.kind === 'assets') {
    return {
      ...base,
      classes: [
        { id: 'c1', name: 'Computer equipment', rate: '25', cost_opening_p: '0', deprec_opening_p: '0' },
        { id: 'c2', name: 'Fixtures and fittings', rate: '20', cost_opening_p: '0', deprec_opening_p: '0' },
      ],
      movements: [],
      policy: 'Straight line on cost. A full year’s charge in the year of purchase, none in the year of sale.',
    };
  }
  if (t.kind === 'lines') {
    return { ...base, lines: [] };
  }
  return {
    ...base,
    items: (t.questions ?? []).map((q, i) => ({ id: `q${i + 1}`, question: q, answer: null, comment: '' })),
    ...(t.materiality ? { benchmark_p: '0', benchmark_name: 'Revenue', percent: '1', pm_percent: '75' } : {}),
  };
}

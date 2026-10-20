import { WorkpaperTemplate } from '../types';

export const BANK_REC_TEMPLATE: WorkpaperTemplate = {
  template_id: 'bank_rec',
  version: 1,
  title: 'Bank Reconciliation (Operating Account)',
  category: 'Lead Schedules',
  area: 'Cash and bank',
  description: 'Reconciles the general ledger cash balance to the year-end bank statement balance with audit trail and tick-marks.',
  bindings: {
    gl_balance: 'sum(tb where master_code = 1010)',
  },
  sections: [
    {
      id: 'summary',
      title: 'Cash Balance Summary & Tie-out',
      type: 'fields',
      fields: [
        {
          id: 'gl_balance',
          label: 'Balance per General Ledger (TB 1010)',
          source: 'gl_balance',
          locked: true,
          tickmarkAllowed: true,
        },
        {
          id: 'bank_balance',
          label: 'Balance per Bank Statement (Dec 31)',
          input: 'number',
          evidence: true,
          tickmarkAllowed: true,
        },
        {
          id: 'adjusted_bank',
          label: 'Adjusted Bank Balance',
          formula: "bank_balance - sum(outstanding where type = 'cheque') + sum(outstanding where type = 'deposit')",
          locked: true,
        },
        {
          id: 'difference',
          label: 'Reconciling Discrepancy (Unadjusted)',
          formula: 'gl_balance - adjusted_bank',
          locked: true,
        },
      ],
    },
    {
      id: 'outstanding',
      title: 'Outstanding Cheques & Deposits in Transit',
      type: 'table',
      allowAddRows: true,
      columns: [
        { id: 'date', label: 'Date', type: 'date' },
        { id: 'reference', label: 'Ref / Check #', type: 'text' },
        { id: 'payee', label: 'Payee / Description', type: 'text' },
        {
          id: 'type',
          label: 'Item Type',
          type: 'select',
          options: ['cheque', 'deposit'],
        },
        { id: 'amount', label: 'Amount ($)', type: 'currency' },
        { id: 'clearing_date', label: 'Post-YE Clearing Date', type: 'date' },
        { id: 'tickmark', label: 'Audit Tickmark', type: 'text' },
      ],
    },
  ],
  formulas: {
    adjusted_bank: "bank_balance - sum(outstanding where type = 'cheque') + sum(outstanding where type = 'deposit')",
    difference: 'gl_balance - adjusted_bank',
  },
  checks: [
    {
      rule: 'difference = 0',
      message: 'Bank balance differs from ledger by {difference}',
      severity: 'error',
    },
    {
      rule: 'bank_balance > 0',
      message: 'Bank statement balance cannot be negative for operating account',
      severity: 'warning',
    },
  ],
  procedures: [
    'Agree bank balance to year-end bank confirmation & statement (tick: Agrees to statement)',
    'Agree outstanding items to post-year-end clearing in subsequent bank statements',
    'Recalculate mathematical accuracy and tie unadjusted difference to materiality limits',
  ],
  signoff: ['preparer', 'reviewer', 'partner'],
};

export const FIXED_ASSETS_TEMPLATE: WorkpaperTemplate = {
  template_id: 'fixed_assets',
  version: 1,
  title: 'Fixed Assets Roll-Forward & Depreciation Recalculation',
  category: 'Lead Schedules',
  area: 'Fixed assets',
  description: 'Roll-forward of property, plant, and equipment cost and accumulated depreciation with addition vouching.',
  bindings: {
    gl_cost: 'sum(tb where master_code = 1500)',
    gl_accum_dep: 'sum(tb where master_code = 1550)',
  },
  sections: [
    {
      id: 'summary',
      title: 'Asset Cost & Reserve Summary',
      type: 'fields',
      fields: [
        { id: 'gl_cost', label: 'GL Asset Cost Balance (TB 1500)', source: 'gl_cost', locked: true, tickmarkAllowed: true },
        { id: 'gl_accum_dep', label: 'GL Accumulated Depreciation (TB 1550)', source: 'gl_accum_dep', locked: true, tickmarkAllowed: true },
        { id: 'beginning_cost', label: 'Beginning Cost (PY Audited)', input: 'number', tickmarkAllowed: true },
        { id: 'additions_total', label: 'Current Year Additions', formula: "sum(additions where status != 'void')", locked: true },
        { id: 'disposals_total', label: 'Current Year Disposals', formula: "sum(disposals where status != 'void')", locked: true },
        { id: 'ending_cost_calc', label: 'Computed Ending Cost', formula: 'beginning_cost + additions_total - disposals_total', locked: true },
        { id: 'cost_diff', label: 'Cost Tie-out Variance', formula: 'gl_cost - ending_cost_calc', locked: true },
      ],
    },
    {
      id: 'additions',
      title: 'Fixed Asset Additions Testing (Threshold > $37,500)',
      type: 'table',
      allowAddRows: true,
      columns: [
        { id: 'asset_id', label: 'Asset Tag #', type: 'text' },
        { id: 'description', label: 'Asset Description', type: 'text' },
        { id: 'date', label: 'Acquisition Date', type: 'date' },
        { id: 'vendor', label: 'Vendor / Supplier', type: 'text' },
        { id: 'useful_life', label: 'Useful Life (Yrs)', type: 'number' },
        { id: 'amount', label: 'Capitalized Cost ($)', type: 'currency' },
        { id: 'vouched', label: 'Invoice Vouched', type: 'select', options: ['Yes', 'No', 'Pending'] },
        { id: 'tickmark', label: 'Tickmark', type: 'text' },
      ],
    },
    {
      id: 'depreciation_recalc',
      title: 'Depreciation Independent Recalculation',
      type: 'table',
      allowAddRows: true,
      columns: [
        { id: 'category', label: 'Asset Class', type: 'text' },
        { id: 'cost_basis', label: 'Depreciable Base ($)', type: 'currency' },
        { id: 'method', label: 'Method', type: 'select', options: ['Straight-line', 'Double Declining'] },
        { id: 'rate', label: 'Annual Rate %', type: 'number' },
        { id: 'client_dep', label: 'Client Recorded ($)', type: 'currency' },
        { id: 'auditor_dep', label: 'Auditor Recalc ($)', type: 'currency' },
        { id: 'variance', label: 'Variance ($)', type: 'currency' },
      ],
    },
  ],
  formulas: {
    additions_total: "sum(additions where status != 'void')",
    disposals_total: "sum(disposals where status != 'void')",
    ending_cost_calc: 'beginning_cost + additions_total - disposals_total',
    cost_diff: 'gl_cost - ending_cost_calc',
  },
  checks: [
    {
      rule: 'cost_diff = 0',
      message: 'Fixed asset roll-forward cost does not tie to ledger by {cost_diff}',
      severity: 'error',
    },
  ],
  procedures: [
    'Agree beginning gross book values and accumulated depreciation to prior year audited working papers',
    'Sample and vouch additions to purchase agreements, vendor invoices, and physical inspection tags',
    'Perform analytical recalculation of straight-line depreciation across all major asset categories',
  ],
  signoff: ['preparer', 'reviewer', 'partner'],
};

export const PREPAYMENTS_TEMPLATE: WorkpaperTemplate = {
  template_id: 'prepayments',
  version: 1,
  title: 'Prepayments & Deferred Charges Amortisation',
  category: 'Lead Schedules',
  area: 'Prepayments',
  description: 'Detailed analysis of prepaid expenses, insurance, software subscriptions, and lease deposits.',
  bindings: {
    gl_prepayments: 'sum(tb where master_code = 1300)',
  },
  sections: [
    {
      id: 'summary',
      title: 'Prepayments Tie-Out Summary',
      type: 'fields',
      fields: [
        { id: 'gl_prepayments', label: 'General Ledger Balance (TB 1300)', source: 'gl_prepayments', locked: true, tickmarkAllowed: true },
        { id: 'schedule_total', label: 'Total Unexpired Balance per Schedule', formula: 'sum(schedule where active = true)', locked: true },
        { id: 'prepayment_diff', label: 'Discrepancy to Ledger', formula: 'gl_prepayments - schedule_total', locked: true },
      ],
    },
    {
      id: 'schedule',
      title: 'Prepaid Contracts & Amortisation Schedule',
      type: 'table',
      allowAddRows: true,
      columns: [
        { id: 'vendor', label: 'Vendor / Service', type: 'text' },
        { id: 'description', label: 'Description / Policy #', type: 'text' },
        { id: 'start_date', label: 'Period From', type: 'date' },
        { id: 'end_date', label: 'Period To', type: 'date' },
        { id: 'total_amount', label: 'Total Invoiced ($)', type: 'currency' },
        { id: 'cy_amortised', label: 'CY Expensed ($)', type: 'currency' },
        { id: 'unexpired_balance', label: 'Unexpired at YE ($)', type: 'currency' },
        { id: 'tickmark', label: 'Evidence Tickmark', type: 'text' },
      ],
    },
  ],
  formulas: {
    schedule_total: 'sum(schedule where active = true)',
    prepayment_diff: 'gl_prepayments - schedule_total',
  },
  checks: [
    {
      rule: 'prepayment_diff = 0',
      message: 'Prepayment schedule unexpired total differs from general ledger by {prepayment_diff}',
      severity: 'error',
    },
  ],
  procedures: [
    'Agree sample of prepaid additions to invoices and evidence of payment',
    'Recalculate monthly amortisation based on coverage periods extending beyond year-end',
    'Confirm unexpired balances meet the definition of an asset under the applicable reporting framework',
  ],
  signoff: ['preparer', 'reviewer', 'partner'],
};

export const SAMPLE_TESTING_TEMPLATE: WorkpaperTemplate = {
  template_id: 'sample_testing',
  version: 1,
  title: 'Substantive Sample Testing (Generic Building Block)',
  category: 'Generic Building Blocks',
  area: 'Receivables',
  description: 'Audit sampling tool supporting representative selection, documentation verification, and exception projection.',
  bindings: {
    population_val: 'sum(tb where master_code = 1200)',
  },
  sections: [
    {
      id: 'parameters',
      title: 'Sampling Design & Parameters',
      type: 'fields',
      fields: [
        { id: 'population_val', label: 'Total Population Value ($)', source: 'population_val', locked: true },
        { id: 'population_count', label: 'Total Population Items', input: 'number' },
        { id: 'tolerable_misstatement', label: 'Tolerable Misstatement ($)', input: 'number' },
        { id: 'sample_size', label: 'Determined Sample Size', input: 'number' },
        { id: 'sample_value_tested', label: 'Sampled Value ($)', formula: 'sum(sample_items where status != "void")', locked: true },
        { id: 'coverage_pct', label: 'Audit Coverage %', formula: '(sample_value_tested / population_val) * 100', locked: true },
      ],
    },
    {
      id: 'sample_items',
      title: 'Selected Sample Line Items & Testing Results',
      type: 'table',
      allowAddRows: true,
      columns: [
        { id: 'item_no', label: 'Sample #', type: 'number' },
        { id: 'source_doc', label: 'Invoice / Doc Ref', type: 'text' },
        { id: 'date', label: 'Document Date', type: 'date' },
        { id: 'customer', label: 'Customer / Counterparty', type: 'text' },
        { id: 'book_value', label: 'Recorded Amount ($)', type: 'currency' },
        { id: 'audited_value', label: 'Audited Amount ($)', type: 'currency' },
        { id: 'variance', label: 'Misstatement ($)', type: 'currency' },
        { id: 'status', label: 'Testing Result', type: 'select', options: ['Satisfactory', 'Exception', 'Timing Difference', 'Pending'] },
        { id: 'tickmark', label: 'Tickmark', type: 'text' },
      ],
    },
  ],
  formulas: {
    sample_value_tested: 'sum(sample_items where status != "void")',
    coverage_pct: '(sample_value_tested / population_val) * 100',
  },
  checks: [
    {
      rule: 'sample_size >= 10',
      message: 'Sample size must be statistically sufficient for high-risk accounts',
      severity: 'warning',
    },
  ],
  procedures: [
    'Obtain complete population listing and reconcile total value to trial balance',
    'Vouch sampled items to underlying contracts, shipping documents, and approved orders',
    'Evaluate whether projected misstatement exceeds tolerable misstatement threshold',
  ],
  signoff: ['preparer', 'reviewer', 'partner'],
};

export const ANALYTICAL_REVIEW_TEMPLATE: WorkpaperTemplate = {
  template_id: 'analytical_review',
  version: 1,
  title: 'Analytical Review & Fluctuation Analysis (Generic Building Block)',
  category: 'Generic Building Blocks',
  area: 'Revenue',
  description: 'Year-over-year movement analysis with threshold triggers, AI drafted commentaries, and auditor evaluations.',
  bindings: {},
  sections: [
    {
      id: 'analytics_table',
      title: 'Current Year vs Prior Year Variances',
      type: 'table',
      allowAddRows: true,
      columns: [
        { id: 'fs_line', label: 'Financial Statement Line', type: 'text' },
        { id: 'py_amount', label: 'Prior Year ($)', type: 'currency' },
        { id: 'cy_amount', label: 'Current Year ($)', type: 'currency' },
        { id: 'var_dollar', label: 'Variance ($)', type: 'currency' },
        { id: 'var_pct', label: 'Variance %', type: 'number' },
        { id: 'investigate', label: 'Requires Investigation?', type: 'select', options: ['YES', 'NO'] },
        { id: 'commentary', label: 'Auditor Explanation & Evidence', type: 'text' },
      ],
    },
  ],
  formulas: {},
  checks: [],
  procedures: [
    'Define investigation threshold based on overall materiality and tolerable error',
    'Corroborate major business driver explanations with non-financial indicators and executive interview notes',
    'Assess risk of management bias or unrecorded transactions in abnormal movements',
  ],
  signoff: ['preparer', 'reviewer', 'partner'],
};

export const CONFIRMATION_TRACKER_TEMPLATE: WorkpaperTemplate = {
  template_id: 'confirmation_tracker',
  version: 1,
  title: 'Third-Party Confirmation Tracker (Generic Building Block)',
  category: 'Generic Building Blocks',
  area: 'Cash and bank',
  description: 'Tracks independent external confirmations sent to banks, customers, suppliers, and legal counsel.',
  bindings: {},
  sections: [
    {
      id: 'confirmations',
      title: 'Confirmation Status & Reconciliation',
      type: 'table',
      allowAddRows: true,
      columns: [
        { id: 'counterparty', label: 'Counterparty / Entity', type: 'text' },
        { id: 'category', label: 'Category', type: 'select', options: ['Bank', 'Debtor', 'Creditor', 'Legal Counsel', 'Lender'] },
        { id: 'gl_amount', label: 'GL Amount ($)', type: 'currency' },
        { id: 'sent_date', label: 'Request Sent', type: 'date' },
        { id: 'received_date', label: 'Reply Received', type: 'date' },
        { id: 'confirmed_amount', label: 'Confirmed ($)', type: 'currency' },
        { id: 'difference', label: 'Difference ($)', type: 'currency' },
        { id: 'status', label: 'Status', type: 'select', options: ['Confirmed OK', 'Discrepancy Investigated', 'Pending Reply', 'Alternative Procedures Done'] },
        { id: 'tickmark', label: 'Tickmark', type: 'text' },
      ],
    },
  ],
  formulas: {},
  checks: [],
  procedures: [
    'Maintain direct control over confirmation distribution and receipt',
    'Investigate any reported differences between confirmation reply and client ledger',
    'Execute alternative procedures (subsequent cash testing / shipping documents) for non-replies',
  ],
  signoff: ['preparer', 'reviewer', 'partner'],
};

export const BUILT_IN_TEMPLATES: Record<string, WorkpaperTemplate> = {
  bank_rec: BANK_REC_TEMPLATE,
  fixed_assets: FIXED_ASSETS_TEMPLATE,
  prepayments: PREPAYMENTS_TEMPLATE,
  sample_testing: SAMPLE_TESTING_TEMPLATE,
  analytical_review: ANALYTICAL_REVIEW_TEMPLATE,
  confirmation_tracker: CONFIRMATION_TRACKER_TEMPLATE,
};

import { CheckRule, TrialBalanceRow, WorkpaperTemplate } from '../types';

export interface EvaluatorResult {
  computedValues: Record<string, number | string>;
  checkResults: {
    rule: string;
    passed: boolean;
    message: string;
    severity: 'error' | 'warning';
  }[];
  boundValues: Record<string, number>;
}

export function formatCurrency(value: number): string {
  if (isNaN(value) || value === null || value === undefined) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function evaluateBindings(
  bindings: Record<string, string>,
  tbRows: TrialBalanceRow[]
): Record<string, number> {
  const result: Record<string, number> = {};

  for (const [key, expr] of Object.entries(bindings)) {
    // pattern: sum(tb where master_code = 1010)
    const match = expr.match(/sum\(tb\s+where\s+master_code\s*=\s*['"]?([0-9a-zA-Z_]+)['"]?\)/i);
    if (match) {
      const targetCode = match[1];
      const sum = tbRows
        .filter((row) => (row.masterCode || row.accountCode) === targetCode)
        .reduce((acc, row) => acc + (row.netBalance || 0), 0);
      result[key] = sum;
    } else {
      result[key] = 0;
    }
  }

  return result;
}

export function evaluateTemplate(
  template: WorkpaperTemplate,
  payload: Record<string, any>,
  boundValues: Record<string, number>
): EvaluatorResult {
  const context: Record<string, any> = { ...boundValues, ...(payload || {}) };

  // Compute table sums if needed
  if (template.template_id === 'bank_rec') {
    const outstanding: any[] = payload.outstanding || [];
    const chequesSum = outstanding
      .filter((row) => row.type === 'cheque')
      .reduce((acc, row) => acc + (parseFloat(row.amount) || 0), 0);
    const depositsSum = outstanding
      .filter((row) => row.type === 'deposit')
      .reduce((acc, row) => acc + (parseFloat(row.amount) || 0), 0);

    const bankBalance = parseFloat(context.bank_balance) || 0;
    const glBalance = parseFloat(context.gl_balance) || 0;
    const adjustedBank = bankBalance - chequesSum + depositsSum;
    const difference = glBalance - adjustedBank;

    context.cheques_sum = chequesSum;
    context.deposits_sum = depositsSum;
    context.adjusted_bank = adjustedBank;
    context.difference = difference;
  } else if (template.template_id === 'fixed_assets') {
    const additions: any[] = payload.additions || [];
    const disposals: any[] = payload.disposals || [];

    const additionsTotal = additions
      .filter((row) => row.status !== 'void')
      .reduce((acc, row) => acc + (parseFloat(row.amount) || 0), 0);
    const disposalsTotal = disposals
      .filter((row) => row.status !== 'void')
      .reduce((acc, row) => acc + (parseFloat(row.amount) || 0), 0);

    const beginningCost = parseFloat(context.beginning_cost) || 0;
    const glCost = parseFloat(context.gl_cost) || 0;
    const endingCostCalc = beginningCost + additionsTotal - disposalsTotal;
    const costDiff = glCost - endingCostCalc;

    context.additions_total = additionsTotal;
    context.disposals_total = disposalsTotal;
    context.ending_cost_calc = endingCostCalc;
    context.cost_diff = costDiff;
  } else if (template.template_id === 'prepayments') {
    const schedule: any[] = payload.schedule || [];
    const scheduleTotal = schedule.reduce((acc, row) => acc + (parseFloat(row.unexpired_balance) || 0), 0);
    const glPrepayments = parseFloat(context.gl_prepayments) || 0;
    const prepaymentDiff = glPrepayments - scheduleTotal;

    context.schedule_total = scheduleTotal;
    context.prepayment_diff = prepaymentDiff;
  } else if (template.template_id === 'sample_testing') {
    const sampleItems: any[] = payload.sample_items || [];
    const sampleValueTested = sampleItems.reduce((acc, row) => acc + (parseFloat(row.book_value) || 0), 0);
    const populationVal = parseFloat(context.population_val) || 1;
    const coveragePct = (sampleValueTested / (populationVal || 1)) * 100;

    context.sample_value_tested = sampleValueTested;
    context.coverage_pct = coveragePct;
  }

  // Evaluate checks
  const checkResults = (template.checks || []).map((check: CheckRule) => {
    let passed = true;
    let message = check.message;

    if (check.rule === 'difference = 0') {
      const diff = Math.abs(context.difference ?? 0);
      passed = diff < 0.01;
      const formattedDiff = formatCurrency(context.difference ?? 0);
      message = message.replace('{difference}', formattedDiff);
    } else if (check.rule === 'cost_diff = 0') {
      const diff = Math.abs(context.cost_diff ?? 0);
      passed = diff < 0.01;
      const formattedDiff = formatCurrency(context.cost_diff ?? 0);
      message = message.replace('{cost_diff}', formattedDiff);
    } else if (check.rule === 'prepayment_diff = 0') {
      const diff = Math.abs(context.prepayment_diff ?? 0);
      passed = diff < 0.01;
      const formattedDiff = formatCurrency(context.prepayment_diff ?? 0);
      message = message.replace('{prepayment_diff}', formattedDiff);
    } else if (check.rule === 'bank_balance > 0') {
      passed = (context.bank_balance ?? 0) > 0;
    } else if (check.rule.includes('sample_size >=')) {
      const min = parseInt(check.rule.split('>=')[1]?.trim() || '10');
      passed = (context.sample_size ?? 0) >= min;
    }

    return {
      rule: check.rule,
      passed,
      message,
      severity: check.severity || 'error',
    };
  });

  return {
    computedValues: context,
    checkResults,
    boundValues,
  };
}

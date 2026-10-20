/**
 * Money utilities:
 * Money is stored as integer cents and formatted with 2 decimals,
 * right-aligned, tabular numerals, negatives in brackets.
 */

export function formatMoney(cents: number, showCurrency = true): string {
  const isNegative = cents < 0;
  const absCents = Math.abs(cents);
  const dollars = (absCents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const currencySymbol = showCurrency ? '$' : '';

  if (isNegative) {
    return `(${currencySymbol}${dollars})`;
  }
  return `${currencySymbol}${dollars}`;
}

/**
 * Raw numeric string without brackets (useful for editable inputs)
 */
export function centsToInputString(cents: number): string {
  return (cents / 100).toFixed(2);
}

/**
 * Parse an input string like "1,234.56" or "(500.00)" or "-500" into integer cents
 */
export function parseInputStringToCents(val: string): number {
  if (!val) return 0;
  const clean = val.trim();
  const isNegative = clean.startsWith('(') && clean.endsWith(')') || clean.startsWith('-');
  const digitsAndDot = clean.replace(/[^0-9.]/g, '');
  const parsedFloat = parseFloat(digitsAndDot);
  if (isNaN(parsedFloat)) return 0;
  const cents = Math.round(parsedFloat * 100);
  return isNegative ? -cents : cents;
}

export function formatPercent(val: number): string {
  return `${Math.round(val)}%`;
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

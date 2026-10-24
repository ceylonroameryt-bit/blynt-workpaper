/**
 * Blynt Format Utilities
 * Money is stored as integer cents and formatted with 2 decimals,
 * right-aligned, tabular numerals, negatives in brackets.
 *
 * Prefer the locale-aware formatMoney / formatDate from LocaleContext
 * when inside a React component. These utilities are for non-React code paths.
 */

export function formatMoney(
  cents: number,
  showCurrency = true,
  locale = 'en-GB',
  currency = 'GBP',
): string {
  const isNegative = cents < 0;
  const abs = Math.abs(cents) / 100;
  try {
    const formatted = new Intl.NumberFormat(locale, {
      style: showCurrency ? 'currency' : 'decimal',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(abs);
    return isNegative ? `(${formatted})` : formatted;
  } catch {
    const sym = showCurrency ? 'GBP' : '';
    const val = abs.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return isNegative ? `(${sym}${val})` : `${sym}${val}`;
  }
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
  const isNegative = (clean.startsWith('(') && clean.endsWith(')')) || clean.startsWith('-');
  const digitsAndDot = clean.replace(/[^0-9.]/g, '');
  const parsedFloat = parseFloat(digitsAndDot);
  if (isNaN(parsedFloat)) return 0;
  const cents = Math.round(parsedFloat * 100);
  return isNegative ? -cents : cents;
}

export function formatPercent(val: number): string {
  return `${Math.round(val)}%`;
}

export function formatDate(dateString: string, locale = 'en-GB'): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString(locale, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

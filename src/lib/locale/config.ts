/**
 * Blynt Locale Configuration
 * Defines all supported jurisdictions with their locale tokens.
 * All currency amounts are stored as integer cents; only formatting varies.
 */

export type JurisdictionCode =
  | 'GB'   // United Kingdom
  | 'IE'   // Ireland
  | 'US'   // United States
  | 'CA'   // Canada
  | 'AU'   // Australia
  | 'NZ'   // New Zealand
  | 'ZA'   // South Africa
  | 'IN'   // India
  | 'SG'   // Singapore
  | 'AE'   // UAE
  | 'EU';  // Generic EU (Euro zone)

export interface JurisdictionConfig {
  code: JurisdictionCode;
  flag: string;
  label: string;
  /** BCP-47 locale tag used for Intl APIs */
  locale: string;
  currency: string;
  currencySymbol: string;
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  regulator: string;
  companyNumberLabel: string;
  filingDeadlineLabel: string;
  taxLabel: string;
  frameworkLabel: string;
  registryName: string;
  signatoryTitle: string;
  fiscalYearLabel: string;
}

export const JURISDICTIONS: Record<JurisdictionCode, JurisdictionConfig> = {
  GB: {
    code: 'GB', flag: 'GB', label: 'United Kingdom', locale: 'en-GB',
    currency: 'GBP', currencySymbol: 'GBP', dateFormat: 'DD/MM/YYYY',
    regulator: 'FRC / ICAEW', companyNumberLabel: 'Companies House Number',
    filingDeadlineLabel: 'Statutory accounts filing (Companies House)',
    taxLabel: 'VAT', frameworkLabel: 'FRS 102 / FRS 105',
    registryName: 'Companies House', signatoryTitle: 'Director',
    fiscalYearLabel: 'Financial year',
  },
  IE: {
    code: 'IE', flag: 'IE', label: 'Ireland', locale: 'en-IE',
    currency: 'EUR', currencySymbol: 'EUR', dateFormat: 'DD/MM/YYYY',
    regulator: 'IAASA / CRO', companyNumberLabel: 'CRO Number',
    filingDeadlineLabel: 'Annual return filing (CRO)',
    taxLabel: 'VAT', frameworkLabel: 'FRS 102 / GAAP (Ireland)',
    registryName: 'Companies Registration Office (CRO)', signatoryTitle: 'Director',
    fiscalYearLabel: 'Financial year',
  },
  US: {
    code: 'US', flag: 'US', label: 'United States', locale: 'en-US',
    currency: 'USD', currencySymbol: 'USD', dateFormat: 'MM/DD/YYYY',
    regulator: 'PCAOB / AICPA', companyNumberLabel: 'EIN / Tax ID',
    filingDeadlineLabel: 'Annual report / 10-K filing (SEC)',
    taxLabel: 'Sales Tax', frameworkLabel: 'US GAAP',
    registryName: 'Secretary of State', signatoryTitle: 'CEO / CFO',
    fiscalYearLabel: 'Fiscal year',
  },
  CA: {
    code: 'CA', flag: 'CA', label: 'Canada', locale: 'en-CA',
    currency: 'CAD', currencySymbol: 'CAD', dateFormat: 'DD/MM/YYYY',
    regulator: 'CPA Canada', companyNumberLabel: 'Business Number (BN)',
    filingDeadlineLabel: 'Annual corporate return (Corporations Canada)',
    taxLabel: 'GST / HST', frameworkLabel: 'ASPE / IFRS',
    registryName: 'Corporations Canada', signatoryTitle: 'Director',
    fiscalYearLabel: 'Fiscal year',
  },
  AU: {
    code: 'AU', flag: 'AU', label: 'Australia', locale: 'en-AU',
    currency: 'AUD', currencySymbol: 'AUD', dateFormat: 'DD/MM/YYYY',
    regulator: 'ASIC / AUASB', companyNumberLabel: 'ACN / ABN',
    filingDeadlineLabel: 'Financial report lodgement (ASIC)',
    taxLabel: 'GST', frameworkLabel: 'AASB / IFRS',
    registryName: 'ASIC', signatoryTitle: 'Director',
    fiscalYearLabel: 'Financial year',
  },
  NZ: {
    code: 'NZ', flag: 'NZ', label: 'New Zealand', locale: 'en-NZ',
    currency: 'NZD', currencySymbol: 'NZD', dateFormat: 'DD/MM/YYYY',
    regulator: 'XRB / FMA', companyNumberLabel: 'NZBN / Company Number',
    filingDeadlineLabel: 'Annual return (Companies Office)',
    taxLabel: 'GST', frameworkLabel: 'NZ IFRS / PBE Standards',
    registryName: 'Companies Office', signatoryTitle: 'Director',
    fiscalYearLabel: 'Financial year',
  },
  ZA: {
    code: 'ZA', flag: 'ZA', label: 'South Africa', locale: 'en-ZA',
    currency: 'ZAR', currencySymbol: 'ZAR', dateFormat: 'DD/MM/YYYY',
    regulator: 'IRBA / SAICA', companyNumberLabel: 'Company Registration Number',
    filingDeadlineLabel: 'Annual returns filing (CIPC)',
    taxLabel: 'VAT', frameworkLabel: 'IFRS / IFRS for SMEs',
    registryName: 'CIPC', signatoryTitle: 'Director',
    fiscalYearLabel: 'Financial year',
  },
  IN: {
    code: 'IN', flag: 'IN', label: 'India', locale: 'en-IN',
    currency: 'INR', currencySymbol: 'INR', dateFormat: 'DD/MM/YYYY',
    regulator: 'ICAI / MCA', companyNumberLabel: 'CIN (Corporate Identification Number)',
    filingDeadlineLabel: 'Annual filing (MCA / ROC)',
    taxLabel: 'GST', frameworkLabel: 'Ind AS / AS',
    registryName: 'Registrar of Companies (ROC)', signatoryTitle: 'Director',
    fiscalYearLabel: 'Financial year',
  },
  SG: {
    code: 'SG', flag: 'SG', label: 'Singapore', locale: 'en-SG',
    currency: 'SGD', currencySymbol: 'SGD', dateFormat: 'DD/MM/YYYY',
    regulator: 'ACRA / ISCA', companyNumberLabel: 'UEN (Unique Entity Number)',
    filingDeadlineLabel: 'Annual return filing (ACRA)',
    taxLabel: 'GST', frameworkLabel: 'SFRS / IFRS',
    registryName: 'ACRA', signatoryTitle: 'Director',
    fiscalYearLabel: 'Financial year',
  },
  AE: {
    code: 'AE', flag: 'AE', label: 'United Arab Emirates', locale: 'en-AE',
    currency: 'AED', currencySymbol: 'AED', dateFormat: 'DD/MM/YYYY',
    regulator: 'CBUAE / DED', companyNumberLabel: 'Trade Licence Number',
    filingDeadlineLabel: 'Annual financial statements (Ministry of Economy)',
    taxLabel: 'VAT', frameworkLabel: 'IFRS',
    registryName: 'DED / ADGM / DIFC', signatoryTitle: 'Director / Manager',
    fiscalYearLabel: 'Financial year',
  },
  EU: {
    code: 'EU', flag: 'EU', label: 'European Union (Euro)', locale: 'de-DE',
    currency: 'EUR', currencySymbol: 'EUR', dateFormat: 'DD/MM/YYYY',
    regulator: 'EFRAG / Local NCA', companyNumberLabel: 'Registration Number',
    filingDeadlineLabel: 'Annual accounts filing (local registry)',
    taxLabel: 'VAT', frameworkLabel: 'IFRS / Local GAAP',
    registryName: 'National Company Registry', signatoryTitle: 'Director / Managing Director',
    fiscalYearLabel: 'Financial year',
  },
};

export const DEFAULT_JURISDICTION: JurisdictionCode = 'GB';

export function getJurisdiction(code?: string | null): JurisdictionConfig {
  if (code && code in JURISDICTIONS) {
    return JURISDICTIONS[code as JurisdictionCode];
  }
  return JURISDICTIONS[DEFAULT_JURISDICTION];
}

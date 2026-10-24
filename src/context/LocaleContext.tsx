'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { JurisdictionCode, JurisdictionConfig, JURISDICTIONS, DEFAULT_JURISDICTION, getJurisdiction } from '@/lib/locale/config';

const JURISDICTION_STORAGE_KEY = 'blynt_jurisdiction';

interface LocaleContextType {
  jurisdictionCode: JurisdictionCode;
  jurisdiction: JurisdictionConfig;
  setJurisdiction: (code: JurisdictionCode) => void;
  /** Format a money value (integer cents) as a locale string */
  formatMoney: (cents: number, showSymbol?: boolean) => string;
  /** Format a date ISO string using the locale date format */
  formatDate: (iso: string, opts?: Intl.DateTimeFormatOptions) => string;
  /** Format a number with locale thousand separators */
  formatNumber: (n: number, fractionDigits?: number) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [jurisdictionCode, setJurisdictionCodeState] = useState<JurisdictionCode>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(JURISDICTION_STORAGE_KEY);
      if (stored && stored in JURISDICTIONS) return stored as JurisdictionCode;
    }
    return DEFAULT_JURISDICTION;
  });

  // Sync with localStorage on mount (handles SSR)
  useEffect(() => {
    const stored = localStorage.getItem(JURISDICTION_STORAGE_KEY);
    if (stored && stored in JURISDICTIONS && stored !== jurisdictionCode) {
      setJurisdictionCodeState(stored as JurisdictionCode);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setJurisdiction = useCallback((code: JurisdictionCode) => {
    setJurisdictionCodeState(code);
    if (typeof window !== 'undefined') {
      localStorage.setItem(JURISDICTION_STORAGE_KEY, code);
    }
  }, []);

  const jurisdiction = useMemo(() => getJurisdiction(jurisdictionCode), [jurisdictionCode]);

  const formatMoney = useCallback(
    (cents: number, showSymbol = true) => {
      const isNeg = cents < 0;
      const abs = Math.abs(cents) / 100;
      try {
        const formatted = new Intl.NumberFormat(jurisdiction.locale, {
          style: showSymbol ? 'currency' : 'decimal',
          currency: jurisdiction.currency,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(abs);
        return isNeg ? `(${formatted})` : formatted;
      } catch {
        const sym = showSymbol ? jurisdiction.currencySymbol : '';
        const val = abs.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return isNeg ? `(${sym}${val})` : `${sym}${val}`;
      }
    },
    [jurisdiction]
  );

  const formatDate = useCallback(
    (iso: string, opts?: Intl.DateTimeFormatOptions) => {
      try {
        const d = new Date(iso);
        if (isNaN(d.getTime())) return iso;
        const defaultOpts: Intl.DateTimeFormatOptions = opts ?? {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        };
        return d.toLocaleDateString(jurisdiction.locale, defaultOpts);
      } catch {
        return iso;
      }
    },
    [jurisdiction]
  );

  const formatNumber = useCallback(
    (n: number, fractionDigits = 0) => {
      try {
        return new Intl.NumberFormat(jurisdiction.locale, {
          minimumFractionDigits: fractionDigits,
          maximumFractionDigits: fractionDigits,
        }).format(n);
      } catch {
        return n.toFixed(fractionDigits);
      }
    },
    [jurisdiction]
  );

  const value = useMemo(
    () => ({
      jurisdictionCode,
      jurisdiction,
      setJurisdiction,
      formatMoney,
      formatDate,
      formatNumber,
    }),
    [jurisdictionCode, jurisdiction, setJurisdiction, formatMoney, formatDate, formatNumber]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};

export const useLocale = (): LocaleContextType => {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within a LocaleProvider');
  return ctx;
};

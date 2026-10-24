'use client';

import React, { useState } from 'react';
import {
  Building2,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Shield,
  Clock,
  Sliders,
  Globe,
  X,
} from 'lucide-react';
import { useCompany } from '@/context/CompanyContext';
import { useLocale } from '@/context/LocaleContext';
import { db } from '@/lib/server/db';
import { getCurrentUserId, getActor } from '@/lib/session';
import { CompanyType, DataSource, UserRole } from '@/lib/types/models';
import { JURISDICTIONS, JurisdictionCode } from '@/lib/locale/config';

interface OnboardingModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ forceOpen = false, onClose }) => {
  const {
    onboardingCompleted,
    setOnboardingCompleted,
    addCompany,
    setActiveCompanyId,
    setInactivityTimeoutMinutes,
  } = useCompany();

  const [open, setOpen] = useState(true);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const { setJurisdiction } = useLocale();

  const [auditorName, setAuditorName] = useState(() => getActor().name || 'Dev Administrator');
  const [firmName, setFirmName] = useState(() => db.firms[0]?.name || 'Blynt Practice & Co LLP');
  const [auditorRole, setAuditorRole] = useState<UserRole>('admin');

  const [companyName, setCompanyName] = useState('');
  const [companyNo, setCompanyNo] = useState('');
  const [companyType, setCompanyType] = useState<CompanyType>('Small company (FRS 102 1A)');
  const [yearEnd, setYearEnd] = useState('2026-09-30');
  const [dataSource, setDataSource] = useState<DataSource>('xero');
  const [jurisdictionCode, setJurisdictionCode] = useState<JurisdictionCode>('GB');

  const [timeoutMins, setTimeoutMins] = useState<number>(15);
  const [rowSpacing, setRowSpacing] = useState<'comfortable' | 'compact'>('comfortable');

  const [submitting, setSubmitting] = useState(false);
  const [completedNotification, setCompletedNotification] = useState(false);

  // If already completed and not forced open, do not show
  if (onboardingCompleted && !forceOpen) return null;
  if (!open && !forceOpen) return null;

  const handleCompleteSetup = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const firmId = db.firms[0]?.id || 'firm_blynt_uk';
      const userId = getCurrentUserId();

      // 1. Update user profile details
      const user = db.users.find((u) => u.id === userId) || db.users[0];
      if (user) {
        user.name = auditorName.trim() || user.name;
        const parts = user.name.split(' ');
        user.initials = (parts[0]?.[0] || 'S') + (parts[1]?.[0] || 'J');
      }

      // 2. Update firm name
      if (db.firms[0] && firmName.trim()) {
        db.firms[0].name = firmName.trim();
      }

      // 3. Create or register customized client company
      const clientId = `cli_${companyName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8)}_${Date.now().toString().slice(-4)}`;
      const newClient = {
        id: clientId,
        firm_id: firmId,
        name: companyName.trim() || 'New Client Ltd',
        company_no: companyNo.trim() || '12345678',
        company_type: companyType,
        year_end: yearEnd || '2026-09-30',
        data_source: dataSource,
        reconnect_needed: false,
      };

      // Framework mapping based on company type
      const framework =
        companyType === 'Micro-entity (FRS 105)'
          ? 'FRS 105'
          : companyType === 'LLP (FRS 102 + LLP SORP)'
            ? 'FRS 102 + LLP SORP'
            : companyType === 'Charity (SORP)'
              ? 'Charities SORP (FRS 102)'
              : companyType === 'Medium/large (FRS 102)'
                ? 'FRS 102'
                : companyType === 'IFRS company/group'
                  ? 'IFRS'
                  : 'FRS 102 1A';

      // 4. Register client and build company-specific template pack
      const newEng = addCompany(newClient, framework);

      // 5. Save preferences
      setInactivityTimeoutMinutes(timeoutMins);

      // 6. Apply locale / jurisdiction globally
      setJurisdiction(jurisdictionCode);

      // Save view preferences
      const pref = db.view_prefs.find((p) => p.user_id === userId && p.key === 'general_view');
      if (pref) {
        pref.value_json.inactivityTimeoutMinutes = timeoutMins;
        pref.value_json.rowSpacing = rowSpacing;
        pref.value_json.selectedClientId = newClient.id;
        pref.value_json.onboardingCompleted = true;
        pref.value_json.jurisdiction = jurisdictionCode;
      }

      // Mark completed
      setOnboardingCompleted(true);
      setCompletedNotification(true);

      setTimeout(() => {
        setOpen(false);
        if (onClose) onClose();
      }, 1500);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      className="fixed inset-0 z-50 bg-[#0B1B3D]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
    >
      <div className="bg-white border border-[#E3E7EF] rounded-[24px] shadow-2xl max-w-2xl w-full p-6 sm:p-8 flex flex-col relative my-8">
        {/* Close button if user opened via settings */}
        {forceOpen && (
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              if (onClose) onClose();
            }}
            className="absolute top-5 right-5 p-2 text-[#5B6478] hover:text-[#102654] rounded-full hover:bg-[#F6F7FB]"
            aria-label="Close setup modal"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Top Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#0B1B3D] text-[#FF7D6B] flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 id="onboarding-title" className="text-xl sm:text-2xl font-extrabold text-[#102654] tracking-tight">
              Welcome to Blynt Workpapers
            </h1>
            <p className="text-xs text-[#5B6478] mt-0.5">
              Customize your practice profile, primary client company, and security settings.
            </p>
          </div>
        </div>

        {/* 3-Step Indicator */}
        <div className="grid grid-cols-3 gap-2 mb-8">
          {[
            { num: 1, title: 'Your Profile' },
            { num: 2, title: 'Company Details' },
            { num: 3, title: 'Customization' },
          ].map((s) => (
            <button
              key={s.num}
              type="button"
              onClick={() => setStep(s.num as any)}
              className={`p-2.5 rounded-xl text-left border transition-colors cursor-pointer flex items-center gap-2.5 ${
                step === s.num
                  ? 'bg-[#102654] text-white border-[#102654] shadow-xs'
                  : step > s.num
                    ? 'bg-[#E6F4EF] text-[#0B6B52] border-[#0B6B52]/20 font-medium'
                    : 'bg-[#F6F7FB] text-[#5B6478] border-[#E3E7EF]'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === s.num
                    ? 'bg-[#FF7D6B] text-[#0B1B3D]'
                    : step > s.num
                      ? 'bg-[#0B6B52] text-white'
                      : 'bg-white text-[#5B6478]'
                }`}
              >
                {step > s.num ? '✓' : s.num}
              </div>
              <span className="text-xs font-semibold hidden sm:inline">{s.title}</span>
            </button>
          ))}
        </div>

        {completedNotification ? (
          <div className="py-12 flex flex-col items-center justify-center text-center gap-4 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-[#E6F4EF] text-[#0B6B52] flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#102654]">System Customized Successfully!</h2>
              <p className="text-xs text-[#5B6478] mt-1.5 max-w-sm">
                Your workspace, primary client company <strong>{companyName}</strong>, and working papers pack have been configured. Directing to your dashboard…
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCompleteSetup} className="flex flex-col gap-6">
            {/* STEP 1: Auditor & Practice */}
            {step === 1 && (
              <div className="flex flex-col gap-4 animate-in fade-in">
                <div className="bg-[#F6F7FB] border border-[#E3E7EF] p-4 rounded-2xl flex items-start gap-3">
                  <Shield className="w-5 h-5 text-[#102654] shrink-0 mt-0.5" />
                  <div className="text-xs text-[#5B6478] leading-relaxed">
                    Set your professional identity. In Blynt Workpapers, all procedural sign-offs and conclusion notes require a named, accountable user.
                  </div>
                </div>

                <div>
                  <label htmlFor="onboard-auditor-name" className="block text-xs font-bold text-[#102654] mb-1.5">
                    Your Full Name
                  </label>
                  <input
                    id="onboard-auditor-name"
                    type="text"
                    required
                    value={auditorName}
                    onChange={(e) => setAuditorName(e.target.value)}
                    placeholder="e.g. Alex Wright"
                    className="w-full min-h-[44px] px-3.5 text-xs bg-[#F6F7FB] border border-[#D5DBE7] rounded-[10px] text-[#102654] outline-none focus:border-[#FF7D6B]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="onboard-firm-name" className="block text-xs font-bold text-[#102654] mb-1.5">
                      Accounting Firm / Practice Name
                    </label>
                    <input
                      id="onboard-firm-name"
                      type="text"
                      required
                      value={firmName}
                      onChange={(e) => setFirmName(e.target.value)}
                      placeholder="e.g. Blynt Practice & Co LLP"
                      className="w-full min-h-[44px] px-3.5 text-xs bg-[#F6F7FB] border border-[#D5DBE7] rounded-[10px] text-[#102654] outline-none focus:border-[#FF7D6B]"
                    />
                  </div>

                  <div>
                    <label htmlFor="onboard-role" className="block text-xs font-bold text-[#102654] mb-1.5">
                      Your Audit Role
                    </label>
                    <select
                      id="onboard-role"
                      value={auditorRole}
                      onChange={(e) => setAuditorRole(e.target.value as UserRole)}
                      className="w-full min-h-[44px] px-3 text-xs bg-[#F6F7FB] border border-[#D5DBE7] rounded-[10px] text-[#102654] outline-none focus:border-[#FF7D6B]"
                    >
                      <option value="reviewer">Audit Manager (Reviewer)</option>
                      <option value="preparer">Senior Associate (Preparer)</option>
                      <option value="partner">Engagement Partner (Sign-off &amp; Lock)</option>
                      <option value="admin">Firm Administrator</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="min-h-[44px] px-5 bg-[#102654] hover:bg-[#0B1B3D] text-white text-xs font-bold rounded-[10px] flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <span>Next: Company Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Company / Client Details */}
            {step === 2 && (
              <div className="flex flex-col gap-4 animate-in fade-in">
                <div className="bg-[#EAF5FC] border border-[#1D4E89]/20 p-4 rounded-2xl flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-[#1D4E89] shrink-0 mt-0.5" />
                  <div className="text-xs text-[#102654] leading-relaxed">
                    Set up your primary client company. The system will automatically configure tailored working papers, statutory check formulas, and nominal ledger mapping rules based on your company type.
                  </div>
                </div>

                {/* Jurisdiction / Country Selector */}
                <div>
                  <label htmlFor="onboard-jurisdiction" className="block text-xs font-bold text-[#102654] mb-1.5 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#1D4E89]" />
                    <span>Jurisdiction / Country of Incorporation</span>
                  </label>
                  <select
                    id="onboard-jurisdiction"
                    value={jurisdictionCode}
                    onChange={(e) => setJurisdictionCode(e.target.value as JurisdictionCode)}
                    className="w-full min-h-[44px] px-3 text-xs bg-[#F6F7FB] border border-[#D5DBE7] rounded-[10px] text-[#102654] outline-none focus:border-[#FF7D6B]"
                  >
                    {Object.values(JURISDICTIONS).map((j) => (
                      <option key={j.code} value={j.code}>
                        {j.label} &mdash; {j.currency} &bull; {j.registryName}
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-[#7E8DA6] mt-1 block">
                    Sets currency, date format, regulatory labels ({JURISDICTIONS[jurisdictionCode]?.taxLabel}, {JURISDICTIONS[jurisdictionCode]?.registryName}) across the entire system.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="onboard-company-name" className="block text-xs font-bold text-[#102654] mb-1.5">
                      Company / Client Legal Name
                    </label>
                    <input
                      id="onboard-company-name"
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Acme Precision Engineering Ltd"
                      className="w-full min-h-[44px] px-3.5 text-xs bg-[#F6F7FB] border border-[#D5DBE7] rounded-[10px] text-[#102654] outline-none focus:border-[#FF7D6B]"
                    />
                  </div>

                  <div>
                    <label htmlFor="onboard-company-no" className="block text-xs font-bold text-[#102654] mb-1.5">
                      {JURISDICTIONS[jurisdictionCode]?.companyNumberLabel || 'Company Registration Number'}
                    </label>
                    <input
                      id="onboard-company-no"
                      type="text"
                      required
                      value={companyNo}
                      onChange={(e) => setCompanyNo(e.target.value)}
                      placeholder="e.g. 08942150"
                      className="w-full min-h-[44px] px-3.5 text-xs bg-[#F6F7FB] border border-[#D5DBE7] rounded-[10px] text-[#102654] outline-none focus:border-[#FF7D6B]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="onboard-company-type" className="block text-xs font-bold text-[#102654] mb-1.5">
                      Entity &amp; Framework Type
                    </label>
                    <select
                      id="onboard-company-type"
                      value={companyType}
                      onChange={(e) => setCompanyType(e.target.value as CompanyType)}
                      className="w-full min-h-[44px] px-3 text-xs bg-[#F6F7FB] border border-[#D5DBE7] rounded-[10px] text-[#102654] outline-none focus:border-[#FF7D6B]"
                    >
                      <option value="Small company (FRS 102 1A)">Small company (FRS 102 1A)</option>
                      <option value="Medium/large (FRS 102)">Medium / Large company (FRS 102)</option>
                      <option value="Micro-entity (FRS 105)">Micro-entity (FRS 105)</option>
                      <option value="LLP (FRS 102 + LLP SORP)">LLP (FRS 102 + LLP SORP)</option>
                      <option value="Charity (SORP)">Charity (Charities SORP)</option>
                      <option value="IFRS company/group">IFRS company / group</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="onboard-year-end" className="block text-xs font-bold text-[#102654] mb-1.5">
                      Accounting Period Year End
                    </label>
                    <input
                      id="onboard-year-end"
                      type="date"
                      required
                      value={yearEnd}
                      onChange={(e) => setYearEnd(e.target.value)}
                      className="w-full min-h-[44px] px-3.5 text-xs bg-[#F6F7FB] border border-[#D5DBE7] rounded-[10px] text-[#102654] outline-none focus:border-[#FF7D6B]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="onboard-data-source" className="block text-xs font-bold text-[#102654] mb-1.5">
                    Primary Accounting Software / Data Source
                  </label>
                  <select
                    id="onboard-data-source"
                    value={dataSource}
                    onChange={(e) => setDataSource(e.target.value as DataSource)}
                    className="w-full min-h-[44px] px-3 text-xs bg-[#F6F7FB] border border-[#D5DBE7] rounded-[10px] text-[#102654] outline-none focus:border-[#FF7D6B]"
                  >
                    <option value="xero">Xero Cloud Accounting</option>
                    <option value="quickbooks">QuickBooks Online</option>
                    <option value="sage">Sage Accounting / Line 50</option>
                    <option value="freeagent">FreeAgent</option>
                    <option value="csv">CSV / Excel Trial Balance Upload</option>
                    <option value="blynt">Blynt Integrated Bookkeeping</option>
                  </select>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs text-[#5B6478] hover:text-[#102654] font-medium"
                  >
                    ← Back to Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="min-h-[44px] px-5 bg-[#102654] hover:bg-[#0B1B3D] text-white text-xs font-bold rounded-[10px] flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <span>Next: System Customization</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: System & Security Customization */}
            {step === 3 && (
              <div className="flex flex-col gap-4 animate-in fade-in">
                <div className="bg-[#FFF1EE] border border-[#FF7D6B]/30 p-4 rounded-2xl flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#B8432F] shrink-0 mt-0.5" />
                  <div className="text-xs text-[#102654] leading-relaxed">
                    <strong>Auto Log-off &amp; Compliance Configuration:</strong> When clients and auditors leave their station inactive, Blynt automatically terminates the session to safeguard financial workpapers and unreleased statutory figures.
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="onboard-timeout" className="block text-xs font-bold text-[#102654] mb-1.5 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#B8432F]" />
                      <span>Inactivity Auto Log-Off Timer</span>
                    </label>
                    <select
                      id="onboard-timeout"
                      value={timeoutMins}
                      onChange={(e) => setTimeoutMins(parseInt(e.target.value, 10))}
                      className="w-full min-h-[44px] px-3 text-xs bg-[#F6F7FB] border border-[#D5DBE7] rounded-[10px] text-[#102654] outline-none focus:border-[#FF7D6B]"
                    >
                      <option value={5}>5 minutes (High Security / Public Station)</option>
                      <option value={10}>10 minutes (Recommended)</option>
                      <option value={15}>15 minutes (Standard Practice)</option>
                      <option value={30}>30 minutes</option>
                      <option value={60}>60 minutes</option>
                    </select>
                    <span className="text-[10px] text-[#7E8DA6] mt-1 block">
                      A 60-second warning countdown modal is shown before sign-out.
                    </span>
                  </div>

                  <div>
                    <label htmlFor="onboard-density" className="block text-xs font-bold text-[#102654] mb-1.5 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-[#102654]" />
                      <span>Working Paper Density</span>
                    </label>
                    <select
                      id="onboard-density"
                      value={rowSpacing}
                      onChange={(e) => setRowSpacing(e.target.value as any)}
                      className="w-full min-h-[44px] px-3 text-xs bg-[#F6F7FB] border border-[#D5DBE7] rounded-[10px] text-[#102654] outline-none focus:border-[#FF7D6B]"
                    >
                      <option value="comfortable">Comfortable (Optimal readability &amp; touchscreen)</option>
                      <option value="compact">Compact (High data density for large screens)</option>
                    </select>
                    <span className="text-[10px] text-[#7E8DA6] mt-1 block">
                      Controls row padding in trial balance and working paper grids.
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-[#E3E7EF] bg-[#F6F7FB] text-xs flex flex-col gap-2">
                  <div className="font-bold text-[#102654]">What happens when you confirm:</div>
                  <div className="flex items-center gap-2 text-[#5B6478]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Selected company is registered and activated globally across your dashboard</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#5B6478]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Auto log-off inactivity timer is enabled ({timeoutMins} minutes)</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#5B6478]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Standard working papers (Fixed Assets, Bank Rec, Trial Balance) are initialized</span>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-xs text-[#5B6478] hover:text-[#102654] font-medium"
                  >
                    ← Back to Company
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="min-h-[44px] px-6 bg-[#FF7D6B] hover:bg-[#ff9485] text-[#0B1B3D] text-xs font-bold rounded-[10px] flex items-center gap-2 cursor-pointer shadow-sm transition-transform active:scale-[0.98] disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Finish Setup &amp; Customize System</span>
                  </button>
                </div>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

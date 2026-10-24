'use client';

import { packFor, templateFor } from '@/lib/workpapers/templates';

import { getActor, getCurrentUserId } from '@/lib/session';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  ShieldCheck,
  UserCheck,
  FileCheck2,
  Plus,
  ArrowRight,
  Database,
  FileSpreadsheet,
} from 'lucide-react';
import { db } from '@/lib/server/db';
import { CompanyType, DataSource } from '@/lib/types/models';
import { useCompany } from '@/context/CompanyContext';

const COMPANY_TYPES: {
  type: CompanyType;
  framework: string;
  packName: string;
  description: string;
  areaCounts: { area: string; letter: string; count: number }[];
}[] = [
  {
    type: 'Small company (FRS 102 1A)',
    framework: 'FRS 102 Section 1A',
    packName: 'UK Small Company Standard Pack',
    description: 'Statutory pack for small UK limited companies with streamlined disclosures.',
    areaCounts: [
      { letter: 'A', area: 'Trading & Operations', count: 4 },
      { letter: 'B', area: 'Bank & Cash', count: 3 },
      { letter: 'C', area: 'Trade Debtors', count: 4 },
      { letter: 'D', area: 'Stock / Inventory', count: 3 },
      { letter: 'E', area: 'Prepayments & Overheads', count: 3 },
      { letter: 'F', area: 'Fixed Assets & Tangibles', count: 4 },
      { letter: 'K', area: 'Trade Creditors & Accruals', count: 4 },
      { letter: 'T', area: 'Corporation & Payroll Tax', count: 3 },
      { letter: 'I', area: 'Loans & Borrowings', count: 2 },
      { letter: 'Z', area: 'Reserves & Sign-off', count: 3 },
    ],
  },
  {
    type: 'Micro-entity (FRS 105)',
    framework: 'FRS 105',
    packName: 'Micro-Entity Simplified Pack',
    description: 'Presumed true and fair under Companies Act 2006; minimal required workpapers.',
    areaCounts: [
      { letter: 'A', area: 'Income Statement Summary', count: 2 },
      { letter: 'B', area: 'Bank & Petty Cash', count: 2 },
      { letter: 'C', area: 'Debtors', count: 2 },
      { letter: 'F', area: 'Tangible Assets (Micro)', count: 2 },
      { letter: 'K', area: 'Creditors Due within 1 Year', count: 2 },
      { letter: 'Z', area: 'Capital & Reserves', count: 2 },
    ],
  },
  {
    type: 'Medium/large (FRS 102)',
    framework: 'FRS 102 Full',
    packName: 'UK Medium & Large Company Pack',
    description: 'Comprehensive audit pack including leases, financial instruments, and deferred tax.',
    areaCounts: [
      { letter: 'A', area: 'Revenue & Margin Cutoff', count: 6 },
      { letter: 'B', area: 'Bank & Treasury', count: 5 },
      { letter: 'C', area: 'Trade & Other Receivables', count: 6 },
      { letter: 'D', area: 'Inventory Valuation & NRV', count: 5 },
      { letter: 'E', area: 'Prepayments & Leases', count: 4 },
      { letter: 'F', area: 'Fixed Assets & Depreciation', count: 5 },
      { letter: 'K', area: 'Trade Payables & Provisions', count: 6 },
      { letter: 'T', area: 'Taxation & Deferred Tax', count: 4 },
      { letter: 'I', area: 'Bank Debt & Covenants', count: 4 },
      { letter: 'Z', area: 'Statutory Disclosures', count: 5 },
    ],
  },
  {
    type: 'Sole trader',
    framework: 'UK GAAP (Cash/Accruals)',
    packName: 'Sole Trader Working Paper Pack',
    description: 'Personal tax & self-assessment preparation pack for sole proprietors.',
    areaCounts: [
      { letter: 'A', area: 'Turnover & Receipts', count: 2 },
      { letter: 'B', area: 'Business Bank Account', count: 2 },
      { letter: 'E', area: 'Allowable Business Expenses', count: 3 },
      { letter: 'F', area: 'Capital Allowances', count: 2 },
      { letter: 'Z', area: 'Capital Account & Drawings', count: 2 },
    ],
  },
  {
    type: 'Partnership',
    framework: 'UK GAAP',
    packName: 'General Partnership Pack',
    description: 'Partnership tax return and partner profit-sharing ratio allocation schedule.',
    areaCounts: [
      { letter: 'A', area: 'Trading Income', count: 3 },
      { letter: 'B', area: 'Bank Reconciliation', count: 2 },
      { letter: 'E', area: 'Operating Costs', count: 3 },
      { letter: 'Z', area: 'Partners Capital & Current Accounts', count: 3 },
    ],
  },
  {
    type: 'LLP (FRS 102 + LLP SORP)',
    framework: 'FRS 102 + LLP SORP',
    packName: 'Limited Liability Partnership Pack',
    description: 'Compliant with SORP 2024: members remuneration, equity vs liability classification.',
    areaCounts: [
      { letter: 'A', area: 'Turnover & Billings', count: 4 },
      { letter: 'B', area: 'Client & Office Bank Accounts', count: 4 },
      { letter: 'C', area: 'Work in Progress & Debtors', count: 4 },
      { letter: 'F', area: 'Tangible Assets', count: 3 },
      { letter: 'K', area: 'Trade & Other Payables', count: 4 },
      { letter: 'Z', area: 'Members Interests & Capital', count: 5 },
    ],
  },
  {
    type: 'IFRS company/group',
    framework: 'UK-adopted IFRS',
    packName: 'IFRS Full Commercial & Group Pack',
    description: 'IFRS 15, IFRS 16, IFRS 9 ECL and group consolidation schedules.',
    areaCounts: [
      { letter: 'A', area: 'IFRS 15 Revenue Contracts', count: 6 },
      { letter: 'B', area: 'Cash & Cash Equivalents', count: 4 },
      { letter: 'C', area: 'IFRS 9 Expected Credit Losses', count: 5 },
      { letter: 'F', area: 'PPE & Impairment (IAS 36)', count: 6 },
      { letter: 'E', area: 'IFRS 16 Leases & Right-of-Use', count: 5 },
      { letter: 'Z', area: 'Group Consolidation & Equity', count: 6 },
    ],
  },
  {
    type: 'Charity (SORP)',
    framework: 'Charities SORP (FRS 102)',
    packName: 'UK Charity Statement of Recommended Practice Pack',
    description: 'Restricted, endowment and unrestricted funds analysis, trustees report checks.',
    areaCounts: [
      { letter: 'A', area: 'Voluntary Income & Grants', count: 5 },
      { letter: 'B', area: 'Charity Bank Accounts', count: 3 },
      { letter: 'E', area: 'Charitable Activities vs Governance', count: 4 },
      { letter: 'F', area: 'Heritage & Functional Tangibles', count: 3 },
      { letter: 'Z', area: 'Fund Accounting & SOFA', count: 6 },
    ],
  },
  {
    type: 'Academy trust',
    framework: 'Academies Accounts Direction',
    packName: 'ESFA Academy Trust Pack',
    description: 'GAG funding reconciliations, regularity audit checks, Teachers Pension returns.',
    areaCounts: [
      { letter: 'A', area: 'ESFA & GAG Grants', count: 5 },
      { letter: 'B', area: 'Academy Bank Accounts', count: 3 },
      { letter: 'T', area: 'Payroll & LGPS Pension Deficit', count: 4 },
      { letter: 'F', area: 'Land & Buildings Valuation', count: 4 },
      { letter: 'Z', area: 'Regularity & Statement of Truth', count: 5 },
    ],
  },
];

const NEW_CLIENT = '__new__';

export default function NewEngagementWizard() {
  const router = useRouter();
  const { setActiveCompanyId, refreshCompanyData } = useCompany();
  const [step, setStep] = useState(1);

  // Step 1: Client & Year End
  const [clientId, setClientId] = useState(db.clients[0]?.id ?? NEW_CLIENT);
  const [newClientName, setNewClientName] = useState('');
  const [newClientNo, setNewClientNo] = useState('');
  const [yearEnd, setYearEnd] = useState('2026-09-30');
  const [periodStart, setPeriodStart] = useState('2025-10-01');

  // Step 2: Company Type
  const [selectedType, setSelectedType] = useState<CompanyType>('Small company (FRS 102 1A)');

  // Step 3: Template pack options
  const [includeAllOptionalPapers, setIncludeAllOptionalPapers] = useState(true);

  // Step 4: Team
  const [selectedTeam, setSelectedTeam] = useState(['usr_test_preparer', 'usr_test_reviewer', 'usr_test_partner']);

  // Step 5: Data Source
  const [dataSource, setDataSource] = useState<DataSource>('csv');

  const isNewClient = clientId === NEW_CLIENT;
  const selectedClient = db.clients.find((c) => c.id === clientId);
  const typeConfig = COMPANY_TYPES.find((c) => c.type === selectedType) || COMPANY_TYPES[0];

  // Prior engagement auto-link detection
  const priorEngagement = db.engagements.find(
    (e) => e.client_id === clientId && e.status === 'locked'
  );

  const packTemplates = packFor(selectedType, includeAllOptionalPapers)
    .map((ref) => templateFor(ref))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));
  const totalPaperCount = packTemplates.length;

  const handleCreate = () => {
    // Ground Rule: create engagement and link prior if exists
    let client = selectedClient;
    if (isNewClient) {
      if (!newClientName.trim()) {
        setStep(1);
        return;
      }
      client = {
        id: `cli_${Date.now()}`,
        firm_id: 'firm_blynt_uk',
        name: newClientName.trim(),
        company_no: newClientNo.trim(),
        company_type: selectedType,
        year_end: yearEnd,
        data_source: dataSource,
      };
      db.clients.push(client);
      db.logAudit(
        'firm_blynt_uk',
        getActor(),
        'CREATE_CLIENT',
        'clients',
        client.id,
        null,
        client
      );
    }
    if (!client) return;
    const newEngId = `eng_${client.id}_${Date.now()}`;
    const newEngagement = {
      id: newEngId,
      client_id: client.id,
      firm_id: 'firm_blynt_uk',
      period_start: periodStart,
      period_end: yearEnd,
      framework: typeConfig.framework,
      template_pack_id: `pack_${selectedType.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      status: 'planning' as const,
      locked_at: null,
      prior_engagement_id: priorEngagement ? priorEngagement.id : null,
    };

    db.engagements.push(newEngagement);
    db.createEngagementWorkpapers(newEngId, selectedType, includeAllOptionalPapers);
    db.logAudit(
      'firm_blynt_uk',
      getActor(),
      'CREATE_ENGAGEMENT',
      'engagements',
      newEngId,
      null,
      newEngagement
    );

    setActiveCompanyId(client.id);
    refreshCompanyData();
    router.push(`/engagements/${newEngId}/import`);
  };

  const stepsList = [
    { num: 1, title: 'Client & year end' },
    { num: 2, title: 'Company type' },
    { num: 3, title: 'Template pack' },
    { num: 4, title: 'Team' },
    { num: 5, title: 'Data source' },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-16">
      {/* Top Back bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/clients"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5B6478] hover:text-[#102654]"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to clients</span>
        </Link>
        <span className="text-xs text-[#5B6478]">Step {step} of 5</span>
      </div>

      {/* 5-Step Stepper Header */}
      <div className="blynt-card p-4 sm:p-6">
        <div className="flex items-center justify-between">
          {stepsList.map((s, idx) => {
            const isActive = step === s.num;
            const isCompleted = step > s.num;
            return (
              <React.Fragment key={s.num}>
                <button
                  type="button"
                  onClick={() => s.num < step && setStep(s.num)}
                  disabled={s.num > step}
                  className={`flex items-center gap-2 text-left cursor-pointer disabled:cursor-not-allowed`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      isActive
                        ? 'bg-[#102654] text-white ring-4 ring-[#FF7D6B]/20'
                        : isCompleted
                        ? 'bg-emerald-500 text-white'
                        : 'bg-[#F6F7FB] text-[#5B6478] border border-[#D5DBE7]'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                  </div>
                  <span
                    className={`text-xs hidden md:inline ${
                      isActive
                        ? 'font-bold text-[#102654]'
                        : isCompleted
                        ? 'font-medium text-[#102654]'
                        : 'text-[#5B6478]'
                    }`}
                  >
                    {s.title}
                  </span>
                </button>
                {idx < stepsList.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      step > idx + 1 ? 'bg-emerald-500' : 'bg-[#E3E7EF]'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="blynt-card p-6 sm:p-8 flex flex-col justify-between min-h-[460px]">
        {/* Step 1: Client and Year End */}
        {step === 1 && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-bold text-[#102654]">
                Step 1: Client and financial year end
              </h2>
              <p className="text-xs text-[#5B6478] mt-1">
                Select the client entity and set the statutory accounting period dates.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#102654] mb-1.5">
                  Client legal entity
                </label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 text-xs bg-[#F6F7FB] border border-[#D5DBE7] rounded-[10px] text-[#102654] outline-none focus:border-[#FF7D6B]"
                >
                  {db.clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                      {c.company_no ? ` (Co #${c.company_no})` : ''}
                      {c.company_type ? ` • ${c.company_type}` : ''}
                    </option>
                  ))}
                  <option value={NEW_CLIENT}>+ Add a new client</option>
                </select>
              </div>

              {isNewClient && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-[#102654] mb-1.5">
                      Client name
                    </label>
                    <input
                      type="text"
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      placeholder="e.g. Example Trading Ltd"
                      className="w-full min-h-[44px] px-3.5 text-xs bg-[#F6F7FB] border border-[#D5DBE7] rounded-[10px] text-[#102654] outline-none focus:border-[#FF7D6B]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#102654] mb-1.5">
                      Company number (optional)
                    </label>
                    <input
                      type="text"
                      value={newClientNo}
                      onChange={(e) => setNewClientNo(e.target.value)}
                      placeholder="e.g. 01234567"
                      className="w-full min-h-[44px] px-3.5 text-xs bg-[#F6F7FB] border border-[#D5DBE7] rounded-[10px] text-[#102654] outline-none focus:border-[#FF7D6B]"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#102654] mb-1.5">
                  Period start date
                </label>
                <input
                  type="date"
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 text-xs bg-[#F6F7FB] border border-[#D5DBE7] rounded-[10px] text-[#102654] outline-none focus:border-[#FF7D6B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#102654] mb-1.5">
                  Year-end date
                </label>
                <input
                  type="date"
                  value={yearEnd}
                  onChange={(e) => setYearEnd(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 text-xs bg-[#F6F7FB] border border-[#D5DBE7] rounded-[10px] text-[#102654] outline-none focus:border-[#FF7D6B]"
                />
              </div>
            </div>

            {/* Prior Year Auto-link notice */}
            {priorEngagement ? (
              <div className="p-4 bg-[#E6F4EF] border border-[#0B6B52]/20 rounded-[12px] text-xs text-[#0B6B52] flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Prior year engagement found &amp; linked</div>
                  <div className="text-[11px] mt-0.5">
                    Locked engagement {priorEngagement.id} (Period ended 30 Sep 2025) will be linked as prior_engagement_id for automated roll-forward.
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-[#F6F7FB] border border-[#E3E7EF] rounded-[12px] text-xs text-[#5B6478]">
                First year engagement for this client (no prior engagement file detected).
              </div>
            )}
          </div>
        )}

        {/* Step 2: Company Type (9 Options) */}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-xl font-bold text-[#102654]">
                Step 2: Company type &amp; regulatory framework
              </h2>
              <p className="text-xs text-[#5B6478] mt-1">
                The company type automatically determines the statutory framework, default mapping list, and template pack.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
              {COMPANY_TYPES.map((ct) => {
                const isSelected = selectedType === ct.type;
                return (
                  <div
                    key={ct.type}
                    onClick={() => setSelectedType(ct.type)}
                    className={`p-3.5 rounded-[12px] border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#102654] bg-[#EAF5FC]/50 ring-2 ring-[#102654]'
                        : 'border-[#E3E7EF] hover:border-[#D5DBE7] bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-[#102654]">{ct.type}</span>
                        <input
                          type="radio"
                          name="company-type"
                          checked={isSelected}
                          onChange={() => setSelectedType(ct.type)}
                          className="w-4 h-4 text-[#102654] focus:ring-[#FF7D6B]"
                        />
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white border border-[#D5DBE7] text-[#5B6478]">
                        {ct.framework}
                      </span>
                      <p className="text-[11px] text-[#5B6478] mt-1.5 leading-snug">
                        {ct.description}
                      </p>
                    </div>

                    <div className="text-[10px] text-[#1D4E89] font-semibold mt-2.5 pt-2 border-t border-[#E3E7EF]/60">
                      {ct.packName}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Template Pack Preview */}
        {step === 3 && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#102654]">
                  Step 3: Template pack preview
                </h2>
                <p className="text-xs text-[#5B6478] mt-1">
                  These working papers are created for {selectedType}. You can add more later from the paper list.
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 bg-[#102654] text-white rounded-full">
                {totalPaperCount} papers in pack
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {packTemplates.map((tpl) => (
                <div
                  key={tpl.ref}
                  className="p-3 bg-[#F6F7FB] border border-[#E3E7EF] rounded-[12px] flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-1.5 h-6 rounded-md bg-[#102654] text-white flex items-center justify-center font-mono font-bold text-xs">
                      {tpl.ref}
                    </span>
                  </div>
                  <div className="text-[11px] font-medium text-[#102654] mt-2" title={tpl.summary}>
                    {tpl.title}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3.5 bg-white border border-[#E3E7EF] rounded-[12px] flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-[#102654]">
                  Include optional papers
                </div>
                <div className="text-[11px] text-[#5B6478]">
                  Stock (D-10) and the FRS 102 1A disclosure checklist (Z-20), where the pack has them.
                </div>
              </div>
              <input
                type="checkbox"
                checked={includeAllOptionalPapers}
                onChange={(e) => setIncludeAllOptionalPapers(e.target.checked)}
                className="w-4 h-4 rounded text-[#102654] focus:ring-[#FF7D6B]"
              />
            </div>
          </div>
        )}

        {/* Step 4: Team */}
        {step === 4 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-xl font-bold text-[#102654]">
                Step 4: Audit &amp; accounting team assignment
              </h2>
              <p className="text-xs text-[#5B6478] mt-1">
                Assign preparers, reviewers, and signing partners with distinct role-based permissions.
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              {db.users.map((u) => {
                const membership = db.memberships.find((m) => m.user_id === u.id);
                const isSelected = selectedTeam.includes(u.id);

                return (
                  <div
                    key={u.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedTeam(selectedTeam.filter((id) => id !== u.id));
                      } else {
                        setSelectedTeam([...selectedTeam, u.id]);
                      }
                    }}
                    className={`p-3.5 rounded-[12px] border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-[#102654] bg-[#EAF5FC]/30'
                        : 'border-[#E3E7EF] bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#102654] text-white flex items-center justify-center text-xs font-bold">
                        {u.initials}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#102654]">{u.name}</div>
                        <div className="text-[11px] text-[#5B6478]">{u.title}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-[#F6F7FB] border border-[#D5DBE7] text-[#102654]">
                        {membership?.role}
                      </span>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-4 h-4 rounded text-[#102654] focus:ring-[#FF7D6B]"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 5: Data Source */}
        {step === 5 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-xl font-bold text-[#102654]">
                Step 5: Client accounting data source
              </h2>
              <p className="text-xs text-[#5B6478] mt-1">
                Connect directly to cloud accounting software or upload trial balance CSV / Excel spreadsheets.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  id: 'blynt',
                  name: 'Blynt Accounting',
                  badge: 'Direct (No mapping needed)',
                  badgeColor: 'bg-[#E6F4EF] text-[#0B6B52]',
                  desc: 'Uses identical native chart of accounts. Balances flow directly into workpapers.',
                },
                {
                  id: 'csv',
                  name: 'CSV / Excel spreadsheet',
                  badge: 'Universal import',
                  badgeColor: 'bg-[#EAF5FC] text-[#1D4E89]',
                  desc: 'Upload standard CSV with column matching, balancing checks, and hash snapshot.',
                },
                {
                  id: 'xero',
                  name: 'Xero Cloud Accounting',
                  badge: 'Read-only OAuth',
                  badgeColor: 'bg-[#F4F5F7] text-[#5B6478]',
                  desc: 'Secure read-only API connection to Xero nominal balances and journals.',
                },
                {
                  id: 'quickbooks',
                  name: 'QuickBooks Online',
                  badge: 'Intuit OAuth 2.0',
                  badgeColor: 'bg-[#F4F5F7] text-[#5B6478]',
                  desc: 'Encrypted token connection with automated chart of accounts mapping suggestions.',
                },
              ].map((src) => {
                const isSelected = dataSource === src.id;
                return (
                  <div
                    key={src.id}
                    onClick={() => setDataSource(src.id as DataSource)}
                    className={`p-4 rounded-[12px] border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#102654] bg-[#EAF5FC]/40 ring-2 ring-[#102654]'
                        : 'border-[#E3E7EF] hover:border-[#D5DBE7] bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-[#102654]">{src.name}</span>
                        <input
                          type="radio"
                          name="data-source"
                          checked={isSelected}
                          onChange={() => setDataSource(src.id as DataSource)}
                          className="w-4 h-4 text-[#102654] focus:ring-[#FF7D6B]"
                        />
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${src.badgeColor}`}>
                        {src.badge}
                      </span>
                      <p className="text-[11px] text-[#5B6478] mt-2 leading-relaxed">
                        {src.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Stepper Navigation Actions */}
        <div className="mt-8 pt-4 border-t border-[#E3E7EF] flex items-center justify-between">
          <button
            type="button"
            disabled={step === 1}
            onClick={() => setStep((prev) => prev - 1)}
            className="min-h-[44px] px-4 py-2 border border-[#D5DBE7] text-xs font-semibold text-[#102654] rounded-[10px] hover:bg-[#F6F7FB] disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          {step < 5 ? (
            <button
              type="button"
              onClick={() => setStep((prev) => prev + 1)}
              className="min-h-[44px] px-5 py-2 bg-[#102654] hover:bg-[#0B1B3D] text-white text-xs font-bold rounded-[10px] cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCreate}
              className="min-h-[44px] px-6 py-2 bg-[#FF7D6B] hover:bg-[#ff9485] text-[#0B1B3D] text-xs font-bold rounded-[10px] cursor-pointer flex items-center gap-2 shadow-sm transition-transform active:scale-[0.98]"
            >
              <CheckCircle2 className="w-4 h-4" />
              Create &amp; initialize engagement
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

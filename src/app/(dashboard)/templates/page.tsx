'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileSpreadsheet,
  Sparkles,
  Plus,
  Landmark,
  Users,
  Package,
  Layers,
  TrendingUp,
  ShieldCheck,
  Search,
  CheckCircle2,
  Info,
  Scale,
  FileCheck2,
  X,
  CheckSquare2,
  BookOpen,
  ChevronRight,
  Filter,
  Briefcase,
  Building2,
  Check,
  Trash2,
  Settings,
  Sliders,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { getTemplates } from '@/lib/api';
import { TemplateCardItem } from '@/lib/types';

const UK_CATEGORIES = [
  'All',
  'Planning & Risk Assessment',
  'Cash & Cash Equivalents',
  'Trade & Other Receivables',
  'Inventory & Stock',
  'Tangible & Intangible Fixed Assets',
  'Trade Creditors & Accruals',
  'Loans & Financing',
  'UK Taxation & VAT (HMRC)',
  'Equity & Statutory Reserves',
  'Revenue & Payroll RTI',
  'Audit Completion & Going Concern',
  'Emerging & Special Assets',
] as const;

const UK_BUSINESS_TYPES = [
  'All Business Sectors',
  'General Commercial',
  'Charities & Non-Profit',
  'Solicitors & Legal (SRA)',
  'Real Estate & Property',
  'Construction & CIS',
  'Tech & SaaS',
  'Hospitality & Retail',
  'Healthcare & Medical',
  'FCA Regulated & FinTech',
  'LLPs & Partnerships',
  'Agriculture & Farming',
] as const;

const UK_FRAMEWORKS = [
  'All Frameworks',
  'ISA (UK)',
  'FRS 102',
  'Charities SORP',
  'SRA Rules',
  'LLP SORP',
  'FCA Rules',
  'Companies Act 2006',
  'HMRC / UK Tax',
] as const;

export default function TemplatesCatalogPage() {
  const [templates, setTemplates] = useState<TemplateCardItem[]>([]);
  const [activeTab, setActiveTab] = useState<'Built-in' | 'Your firm' | 'Drafts'>('Built-in');
  const [selectedArea, setSelectedArea] = useState<string>('All');
  const [selectedBusinessType, setSelectedBusinessType] = useState<string>('All Business Sectors');
  const [selectedFramework, setSelectedFramework] = useState<string>('All Frameworks');
  const [searchQuery, setSearchQuery] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [draftingTemplate, setDraftingTemplate] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<TemplateCardItem | null>(null);

  // Interactive Custom Template Builder Modal state
  const [customTemplateModalOpen, setCustomTemplateModalOpen] = useState(false);
  const [newTplName, setNewTplName] = useState('');
  const [newTplLeadRef, setNewTplLeadRef] = useState('');
  const [newTplArea, setNewTplArea] = useState<string>('Cash & Cash Equivalents');
  const [newTplBusinessType, setNewTplBusinessType] = useState<string>('General Commercial');
  const [newTplFramework, setNewTplFramework] = useState<string>('ISA (UK)');
  const [newTplStandardRef, setNewTplStandardRef] = useState('ISA (UK) 500 / FRS 102');
  const [newTplDescription, setNewTplDescription] = useState('');
  const [newTplBindings, setNewTplBindings] = useState('Account 1010 - Operating Account, Account 1020 - Term Deposit');
  const [newTplProcedures, setNewTplProcedures] = useState<string[]>([
    'Inspect direct electronic confirmation certificate from financial institution without intermediary handling (ISA 505).',
    'Perform subsequent clearance test for reconciling items within 5 business days of reporting date.',
    'Foot and cross-cast closing schedule balance and agree to General Ledger nominal code without variance.',
  ]);
  const [procedureDraft, setProcedureDraft] = useState('');
  const [newTplScheduleRows, setNewTplScheduleRows] = useState<string[]>([
    'General Ledger Nominal Balance',
    'Bank Statement Closing Balance',
    'Less: Outstanding Cheques / Payments',
    'Add: Deposits / Lodgements in Transit',
    'Adjusted Balance',
    'Unreconciled Variance',
  ]);
  const [rowDraft, setRowDraft] = useState('');
  const [templateCreatedSuccess, setTemplateCreatedSuccess] = useState<string | null>(null);

  const handleOpenTemplateBuilder = () => {
    setNewTplName('Custom Multi-Bank & Treasury Lead Schedule');
    setNewTplLeadRef('B-15');
    setNewTplArea('Cash & Cash Equivalents');
    setNewTplBusinessType('General Commercial');
    setNewTplFramework('ISA (UK)');
    setNewTplStandardRef('ISA (UK) 500 / 505 / FRS 102');
    setNewTplDescription('Bespoke treasury and multi-currency bank account reconciliation schedule with automated tie-outs and foreign exchange rate verifications.');
    setNewTplBindings('Account 1010 Operating, Account 1020 USD Treasury, Account 1030 EUR Deposit');
    setNewTplProcedures([
      'Obtain and inspect direct electronic bank confirmation certificates (ISA 505).',
      'Verify exchange rates against Bank of England closing spot rates as of 30 September 2026.',
      'Test subsequent clearance of outstanding lodgements and unpresented payments within 5 working days.',
      'Agree trial balance nominal balances to statutory trial balance report without unadjusted difference.',
    ]);
    setNewTplScheduleRows([
      'Trial Balance Nominal Balance (GBP Equivalent)',
      'Direct Bank Confirmation Certificate Balance',
      'Less: Unpresented BACS / Direct Debits',
      'Add: Uncredited Card Settlements in Transit',
      'Adjusted Audited Treasury Balance',
      'Unreconciled Difference (Must be zero)',
    ]);
    setCustomTemplateModalOpen(true);
  };

  const handleSaveCustomTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTplName.trim()) return;

    const newCustomTemplate: TemplateCardItem = {
      id: `tpl_custom_${Date.now()}`,
      name: newTplName.trim(),
      area: newTplArea,
      businessType: newTplBusinessType as any,
      leadRef: newTplLeadRef.trim() || 'C-CUSTOM',
      standardRef: newTplStandardRef.trim() || 'ISA (UK) / FRS 102',
      framework: newTplFramework as any,
      tbBindings: newTplBindings.split(',').map((s) => s.trim()).filter(Boolean),
      description: newTplDescription.trim() || 'Custom bespoke methodology schedule configured by audit senior.',
      version: 'v1.0-firm',
      category: 'Your firm',
      icon: 'FileSpreadsheet',
      proceduresCount: newTplProcedures.length,
      checksCount: newTplScheduleRows.length,
      sampleProcedures: newTplProcedures,
      requiresPartnerSignOff: true,
      lastUpdated: 'Just now',
    };

    setTemplates((prev) => [newCustomTemplate, ...prev]);
    setActiveTab('Your firm');
    setCustomTemplateModalOpen(false);
    setTemplateCreatedSuccess(`Template "${newTplName}" created and added to Firm Custom Schedules!`);
    setPreviewTemplate(newCustomTemplate);
    setTimeout(() => setTemplateCreatedSuccess(null), 5000);
  };

  useEffect(() => {
    getTemplates().then(setTemplates);
  }, []);

  const tabs = [
    {
      id: 'Built-in',
      label: 'Built-in UK Standards',
      count: templates.filter((t) => t.category === 'Built-in').length,
    },
    {
      id: 'Your firm',
      label: 'Firm Custom Schedules',
      count: templates.filter((t) => t.category === 'Your firm').length,
    },
    {
      id: 'Drafts',
      label: 'AI Drafts & Specialized',
      count: templates.filter((t) => t.category === 'Drafts').length,
    },
  ];

  const filteredTemplates = templates.filter((t) => {
    if (t.category !== activeTab) return false;
    if (selectedArea !== 'All' && t.area !== selectedArea) return false;
    if (selectedFramework !== 'All Frameworks' && t.framework !== selectedFramework) return false;
    if (selectedBusinessType !== 'All Business Sectors') {
      const bType = t.businessType || 'General Commercial';
      if (bType !== selectedBusinessType) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = t.name.toLowerCase().includes(q);
      const matchDesc = t.description.toLowerCase().includes(q);
      const matchLead = t.leadRef?.toLowerCase().includes(q);
      const matchStd = t.standardRef?.toLowerCase().includes(q);
      const matchFramework = t.framework?.toLowerCase().includes(q);
      const matchBusiness = t.businessType?.toLowerCase().includes(q);
      const matchBindings = t.tbBindings?.some((b: string) => b.toLowerCase().includes(q));
      if (!matchName && !matchDesc && !matchLead && !matchStd && !matchFramework && !matchBusiness && !matchBindings) {
        return false;
      }
    }
    return true;
  });

  const handleAiDraft = () => {
    if (!aiPrompt.trim()) return;
    setDraftingTemplate(true);
    setTimeout(() => {
      const newDraft: TemplateCardItem = {
        id: `tpl_${Date.now()}`,
        name: aiPrompt.slice(0, 50) + ' (UK Specification)',
        area: selectedArea !== 'All' ? selectedArea : 'Emerging & Special Assets',
        businessType: selectedBusinessType !== 'All Business Sectors' ? (selectedBusinessType as any) : 'General Commercial',
        leadRef: 'C-AI',
        standardRef: 'FRS 102 / ISA (UK)',
        framework: 'FRS 102',
        tbBindings: ['TB Nominal Binding', 'Variance Analysis Line'],
        description: `Custom UK methodology schedule drafted by AI based on: "${aiPrompt}". Structured with UK statutory tie-outs and regulatory disclosure checklist.`,
        version: 'v0.1-draft',
        category: 'Drafts',
        icon: 'Sparkles',
        proceduresCount: 5,
        checksCount: 2,
        keyProcedures: [
          'Vouch supporting documentation against relevant UK statutory thresholds',
          'Reconcile schedule subtotal directly to Master Chart of Accounts',
          'Document professional judgment and substantive audit evidence obtained',
          'Verify required UK statutory disclosure notes are fully drafted',
        ],
      };
      setTemplates((prev) => [newDraft, ...prev]);
      setActiveTab('Drafts');
      setAiPrompt('');
      setDraftingTemplate(false);
    }, 800);
  };

  const getTemplateIcon = (iconName: string) => {
    switch (iconName) {
      case 'Scale':
        return <Scale className="w-5 h-5 text-[#1E4FD8]" />;
      case 'FileCheck2':
        return <FileCheck2 className="w-5 h-5 text-[#0B6B4D]" />;
      case 'Landmark':
        return <Landmark className="w-5 h-5 text-[#1E4FD8]" />;
      case 'Users':
        return <Users className="w-5 h-5 text-[#1E4FD8]" />;
      case 'Package':
        return <Package className="w-5 h-5 text-[#854D0E]" />;
      case 'Layers':
        return <Layers className="w-5 h-5 text-[#1E4FD8]" />;
      case 'TrendingUp':
        return <TrendingUp className="w-5 h-5 text-[#1E4FD8]" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-[#0B6B4D]" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-[#5B3FD0]" />;
      default:
        return <FileSpreadsheet className="w-5 h-5 text-[#1E4FD8]" />;
    }
  };

  const getFrameworkBadge = (framework?: string) => {
    switch (framework) {
      case 'ISA (UK)':
        return 'bg-[#E8F8F0] text-[#0B6B4D] border-[#B7EBD0]';
      case 'FRS 102':
        return 'bg-[#E8EEFD] text-[#1E4FD8] border-[#CADBFA]';
      case 'Charities SORP':
        return 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]';
      case 'SRA Rules':
        return 'bg-[#FEE2E2] text-[#991B1B] border-[#FCA5A5]';
      case 'LLP SORP':
        return 'bg-[#FFEDD5] text-[#9A3412] border-[#FDBA74]';
      case 'FCA Rules':
        return 'bg-[#E0E7FF] text-[#3730A3] border-[#A5B4FC]';
      case 'Companies Act 2006':
        return 'bg-[#FEF6E6] text-[#8C5800] border-[#FCE1B3]';
      case 'HMRC / UK Tax':
        return 'bg-[#F3F0FE] text-[#5B3FD0] border-[#DDD6FA]';
      default:
        return 'bg-[#F4F5F7] text-[#5B6676] border-[#E3E6EB]';
    }
  };

  const getBusinessBadge = (businessType?: string) => {
    switch (businessType) {
      case 'Charities & Non-Profit':
        return 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]';
      case 'Solicitors & Legal (SRA)':
        return 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]';
      case 'Real Estate & Property':
        return 'bg-[#F0F9FF] text-[#0369A1] border-[#BAE6FD]';
      case 'Construction & CIS':
        return 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]';
      case 'Tech & SaaS':
        return 'bg-[#F3F0FE] text-[#6D28D9] border-[#DDD6FA]';
      case 'Hospitality & Retail':
        return 'bg-[#FDF4FF] text-[#A21CAF] border-[#F5D0FE]';
      case 'Healthcare & Medical':
        return 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]';
      case 'FCA Regulated & FinTech':
        return 'bg-[#EEF2FF] text-[#4338CA] border-[#C7D2FE]';
      case 'LLPs & Partnerships':
        return 'bg-[#FFF7ED] text-[#C2410C] border-[#FFEDD5]';
      case 'Agriculture & Farming':
        return 'bg-[#F7FEE7] text-[#4D7C0F] border-[#D9F99D]';
      default:
        return 'bg-[#F4F5F7] text-[#5B6676] border-[#E3E6EB]';
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[#E8EEFD] text-[#1E4FD8]">
              United Kingdom Accounting & Audit Library
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#E8F8F0] text-[#0B6B4D]">
              FRS 102 &bull; Charities SORP &bull; SRA &bull; CIS &bull; FCA &bull; LLP SORP
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#FEF6E6] text-[#8C5800]">
              51 UK Standard Practice Templates
            </span>
          </div>
          <h1 className="text-[28px] font-semibold text-[#1B2430] tracking-tight">
            UK Standard Workpaper Templates (All Business Sectors)
          </h1>
          <p className="text-sm text-[#5B6676] mt-0.5">
            Complete methodology suite tailored for every UK business sector: General Trading, Charities, Solicitors (SRA), Real Estate & Landlords, Construction (CIS), Tech & SaaS, Hospitality, Healthcare, FCA Regulated, and LLPs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleOpenTemplateBuilder}
          >
            New custom template
          </Button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {templateCreatedSuccess && (
        <div className="p-4 rounded-[12px] bg-[#E2F4EC] border border-[#A7E5CB] text-[#0B6B4D] flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#0B6B4D] shrink-0" />
            <span className="text-sm font-semibold">{templateCreatedSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setTemplateCreatedSuccess(null)}
            className="text-[#0B6B4D] hover:text-[#084E38] p-1 rounded hover:bg-black/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* AI Box: UK Prompt Generator */}
      <div className="rounded-[14px] bg-[#F3F0FE] border border-[#DDD6FA] p-6 text-[#3F2A9E] flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#5B3FD0]/10 text-[#5B3FD0] shrink-0">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-[#3F2A9E]">
                Describe any UK business workpaper and AI drafts the template schema
              </h2>
              <p className="text-xs text-[#3F2A9E]/80 mt-0.5">
                Specify your UK industry (Charity, Solicitor, Construction, Tech, Property), standard reference, nominal bindings, and statutory tie-out checks.
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/70 text-[#5B3FD0] border border-[#DDD6FA] hidden md:inline-flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> AI Methodology Generator
          </span>
        </div>

        {/* Quick prompt suggestions across business kinds */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[#3F2A9E]/70 font-medium">Try Industry Prompt:</span>
          <button
            type="button"
            onClick={() => setAiPrompt('Draft an SRA Accounts Rules 2019 Rule 8.1 5-week client account reconciliation with 14-day rule check')}
            className="px-2.5 py-1 rounded-md bg-white border border-[#DDD6FA] text-[#3F2A9E] hover:border-[#5B3FD0] transition-colors"
          >
            SRA Client Money 5-Week Rec
          </button>
          <button
            type="button"
            onClick={() => setAiPrompt('Draft a Charities SORP FRS 102 Statement of Financial Activities (SOFA) restricted vs unrestricted fund accounting schedule')}
            className="px-2.5 py-1 rounded-md bg-white border border-[#DDD6FA] text-[#3F2A9E] hover:border-[#5B3FD0] transition-colors"
          >
            Charities SORP Fund Accounting
          </button>
          <button
            type="button"
            onClick={() => setAiPrompt('Draft an HMRC CIS Subcontractor Tax Deduction Suffered & Withheld monthly CIS300 reconciliation')}
            className="px-2.5 py-1 rounded-md bg-white border border-[#DDD6FA] text-[#3F2A9E] hover:border-[#5B3FD0] transition-colors"
          >
            Construction CIS300 Tax Schedule
          </button>
          <button
            type="button"
            onClick={() => setAiPrompt('Draft an FCA CASS 7 Segregated Client Money & CASS 6 Custody Asset daily reconciliation schedule')}
            className="px-2.5 py-1 rounded-md bg-white border border-[#DDD6FA] text-[#3F2A9E] hover:border-[#5B3FD0] transition-colors"
          >
            FCA CASS 7 Client Money Audit
          </button>
          <button
            type="button"
            onClick={() => setAiPrompt('Draft a Landlord & Tenant Act 1985 Section 21 Residential Service Charge trust fund expenditure audit')}
            className="px-2.5 py-1 rounded-md bg-white border border-[#DDD6FA] text-[#3F2A9E] hover:border-[#5B3FD0] transition-colors"
          >
            Property Service Charge (s21)
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="e.g., Draft an Employment (Allocation of Tips) Act 2023 Tronc scheme compliance verification schedule for hospitality..."
            className="flex-1 w-full min-h-[44px] px-4 py-2.5 bg-white border border-[#DDD6FA] rounded-[10px] text-sm text-[#1B2430] placeholder:text-[#5B6676]/70 focus-visible:outline-2 focus-visible:outline-[#5B3FD0] focus-visible:outline-offset-2"
          />

          <Button
            variant="ai"
            size="md"
            icon={<Sparkles className="w-4 h-4 text-[#5B3FD0]" />}
            onClick={handleAiDraft}
            disabled={draftingTemplate}
            className="w-full sm:w-auto shrink-0 bg-white"
          >
            {draftingTemplate ? 'Drafting UK schema...' : 'Draft template'}
          </Button>
        </div>
      </div>

      {/* Tabs, Search, and Multi-Level Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3E6EB] pb-2">
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={(id) => setActiveTab(id as any)}
          />

          <div className="relative flex items-center min-w-[260px]">
            <Search className="w-4 h-4 text-[#5B6676] absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, lead code, sector..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full min-h-[38px] pl-9 pr-3 text-xs bg-[#F4F5F7] border border-[#D5D9E0] rounded-[10px] text-[#1B2430] placeholder:text-[#5B6676] focus-visible:outline-2 focus-visible:outline-[#1E4FD8] focus-visible:outline-offset-2"
            />
          </div>
        </div>

        {/* Level 1: Business Sector / Industry Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[#1B2430] font-semibold uppercase tracking-wider shrink-0 flex items-center gap-1.5 pl-1">
            <Building2 className="w-3.5 h-3.5 text-[#1E4FD8]" /> Business Sector:
          </span>
          {UK_BUSINESS_TYPES.map((bType) => {
            const count =
              bType === 'All Business Sectors'
                ? templates.filter((t) => t.category === activeTab).length
                : templates.filter(
                    (t) =>
                      t.category === activeTab &&
                      (t.businessType === bType || (!t.businessType && bType === 'General Commercial'))
                  ).length;

            return (
              <button
                key={bType}
                onClick={() => setSelectedBusinessType(bType)}
                className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  selectedBusinessType === bType
                    ? 'bg-[#1E4FD8] text-white shadow-xs font-semibold'
                    : 'bg-white border border-[#E3E6EB] text-[#5B6676] hover:text-[#1B2430] hover:border-[#D5D9E0]'
                }`}
              >
                <span>{bType}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono-numbers ${
                    selectedBusinessType === bType ? 'bg-white/20 text-white' : 'bg-[#F4F5F7] text-[#5B6676]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Level 2: Framework Filter Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[#5B6676] font-semibold uppercase tracking-wider shrink-0 flex items-center gap-1 pl-1">
            <Filter className="w-3.5 h-3.5" /> Framework:
          </span>
          {UK_FRAMEWORKS.map((framework) => (
            <button
              key={framework}
              onClick={() => setSelectedFramework(framework)}
              className={`px-3 py-1 rounded-full font-medium whitespace-nowrap transition-colors ${
                selectedFramework === framework
                  ? 'bg-[#1B2430] text-white shadow-sm'
                  : 'bg-white border border-[#E3E6EB] text-[#5B6676] hover:text-[#1B2430] hover:border-[#D5D9E0]'
              }`}
            >
              {framework}
            </button>
          ))}
        </div>

        {/* Level 3: Area Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-[#5B6676] font-semibold uppercase tracking-wider shrink-0 flex items-center gap-1 pl-1 text-xs">
            <Briefcase className="w-3.5 h-3.5" /> Area:
          </span>
          {UK_CATEGORIES.map((area) => {
            const count =
              area === 'All'
                ? templates.filter((t) => t.category === activeTab).length
                : templates.filter((t) => t.category === activeTab && t.area === area).length;

            return (
              <button
                key={area}
                onClick={() => setSelectedArea(area)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  selectedArea === area
                    ? 'bg-[#5B6676] text-white shadow-sm'
                    : 'bg-white border border-[#E3E6EB] text-[#5B6676] hover:text-[#1B2430] hover:border-[#D5D9E0]'
                }`}
              >
                <span>{area}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono-numbers ${
                    selectedArea === area ? 'bg-white/20 text-white' : 'bg-[#F4F5F7] text-[#5B6676]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of UK Template Cards */}
      {filteredTemplates.length === 0 ? (
        <div className="bg-white border border-[#E3E6EB] rounded-[14px] p-12 text-center flex flex-col items-center justify-center">
          <BookOpen className="w-10 h-10 text-[#5B6676]/40 mb-3" />
          <h3 className="text-base font-semibold text-[#1B2430]">No templates match your filters</h3>
          <p className="text-xs text-[#5B6676] mt-1 max-w-md">
            Try resetting your sector, category or framework filter, or use the AI draft box above to generate a new custom template.
          </p>
          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedArea('All');
                setSelectedBusinessType('All Business Sectors');
                setSelectedFramework('All Frameworks');
                setSearchQuery('');
              }}
            >
              Reset all filters
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTemplates.map((tpl) => (
            <div
              key={tpl.id}
              onClick={() => setPreviewTemplate(tpl)}
              className="bg-white border border-[#E3E6EB] rounded-[14px] p-5 flex flex-col justify-between hover:border-[#1E4FD8]/60 hover:shadow-sm transition-all group cursor-pointer"
            >
              <div>
                {/* Top Row: Icon, Lead Ref, Version, Category */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-10 h-10 rounded-[10px] bg-[#F4F5F7] flex items-center justify-center shrink-0 group-hover:bg-[#E8EEFD] transition-colors">
                    {getTemplateIcon(tpl.icon)}
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-1.5">
                    {tpl.leadRef && (
                      <span className="text-[11px] font-mono-numbers font-semibold px-2 py-0.5 rounded bg-[#1B2430] text-white">
                        Lead {tpl.leadRef}
                      </span>
                    )}
                    <span className="text-[11px] font-mono-numbers text-[#5B6676] px-2 py-0.5 rounded bg-[#F4F5F7]">
                      {tpl.version}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#E8EEFD] text-[#1E4FD8]">
                      {tpl.category}
                    </span>
                  </div>
                </div>

                {/* Business Sector Tag & Statutory Framework Badge */}
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  {tpl.businessType && (
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getBusinessBadge(
                        tpl.businessType
                      )}`}
                    >
                      {tpl.businessType}
                    </span>
                  )}
                  {tpl.framework && (
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getFrameworkBadge(
                        tpl.framework
                      )}`}
                    >
                      {tpl.framework}
                    </span>
                  )}
                  {tpl.standardRef && (
                    <span className="text-[10px] font-mono-numbers text-[#5B6676] px-2 py-0.5 rounded bg-[#F4F5F7] border border-[#E3E6EB]">
                      {tpl.standardRef}
                    </span>
                  )}
                </div>

                {/* Name */}
                <h3 className="font-semibold text-base text-[#1B2430] group-hover:text-[#1E4FD8] transition-colors line-clamp-2">
                  {tpl.name}
                </h3>

                {/* Area */}
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#5B6676] mt-1 mb-2">
                  {tpl.area}
                </div>

                {/* Description */}
                <p className="text-xs text-[#5B6676] leading-relaxed line-clamp-3">
                  {tpl.description}
                </p>

                {/* Trial Balance Bindings chips */}
                {tpl.tbBindings && tpl.tbBindings.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {tpl.tbBindings.slice(0, 2).map((binding: string) => (
                      <span
                        key={binding}
                        className="text-[10px] font-mono-numbers text-[#1B2430] bg-[#F4F5F7] px-2 py-0.5 rounded border border-[#E3E6EB]"
                      >
                        TB: {binding}
                      </span>
                    ))}
                    {tpl.tbBindings.length > 2 && (
                      <span className="text-[10px] font-mono-numbers text-[#5B6676] bg-[#F4F5F7] px-1.5 py-0.5 rounded">
                        +{tpl.tbBindings.length - 2} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer: Procedures, Math Checks, Actions */}
              <div className="mt-5 pt-4 border-t border-[#E3E6EB]">
                <div className="flex items-center justify-between text-xs text-[#5B6676] mb-3 font-mono-numbers">
                  <span className="flex items-center gap-1">
                    <CheckSquare2 className="w-3.5 h-3.5 text-[#0B6B4D]" />
                    {tpl.proceduresCount} UK procedures
                  </span>
                  <span>{tpl.checksCount} math checks</span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewTemplate(tpl);
                    }}
                  >
                    Preview Spec
                  </Button>
                  <Link
                    href={`/engagements/eng_harlow_fy26/workpapers/${tpl.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full"
                  >
                    <Button variant="primary" size="sm" className="w-full text-xs">
                      Open Workpaper
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Methodology Note */}
      <div className="p-4 rounded-[12px] bg-white border border-[#E3E6EB] flex items-start gap-3 text-xs text-[#5B6676] mt-2">
        <Info className="w-4 h-4 text-[#1E4FD8] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-[#1B2430]">Comprehensive Multi-Sector UK Methodology:</strong> All 51 workpaper templates are pre-configured to comply with UK regulatory bodies and standards: FRS 102/105, Charities SORP, Solicitors Regulation Authority (SRA Accounts Rules 2019), HMRC Construction Industry Scheme (CIS), FCA Client Asset Sourcebook (CASS 7 / MIFIDPRU), Landlord & Tenant Act 1985 (Service Charges), and the LLP SORP. Each template features automated nominal ledger tie-outs, dual-level review procedures, and mathematical assertion reconciliation.
        </div>
      </div>

      {/* Slide-over Specification Preview Drawer / Modal */}
      {previewTemplate && (
        <div
          className="fixed inset-0 z-50 bg-[#1B2430]/40 backdrop-blur-xs flex justify-end transition-opacity"
          onClick={() => setPreviewTemplate(null)}
        >
          <div
            className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-[#E3E6EB] flex items-start justify-between gap-4 bg-[#F8F9FA]">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-[12px] bg-white border border-[#E3E6EB] flex items-center justify-center shrink-0">
                  {getTemplateIcon(previewTemplate.icon)}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    {previewTemplate.leadRef && (
                      <span className="text-xs font-mono-numbers font-semibold px-2 py-0.5 rounded bg-[#1B2430] text-white">
                        Lead Schedule {previewTemplate.leadRef}
                      </span>
                    )}
                    <span className="text-xs font-mono-numbers text-[#5B6676] px-2 py-0.5 rounded bg-white border border-[#E3E6EB]">
                      {previewTemplate.version}
                    </span>
                    {previewTemplate.businessType && (
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded border ${getBusinessBadge(
                          previewTemplate.businessType
                        )}`}
                      >
                        {previewTemplate.businessType}
                      </span>
                    )}
                    {previewTemplate.framework && (
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded border ${getFrameworkBadge(
                          previewTemplate.framework
                        )}`}
                      >
                        {previewTemplate.framework}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-semibold text-[#1B2430]">
                    {previewTemplate.name}
                  </h2>
                  <p className="text-xs font-medium text-[#5B6676] mt-0.5">
                    {previewTemplate.area} &bull; Standard: {previewTemplate.standardRef || 'General UK GAAP'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setPreviewTemplate(null)}
                className="p-2 text-[#5B6676] hover:text-[#1B2430] hover:bg-white rounded-lg transition-colors"
                title="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              {/* Objective & Description */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#5B6676] mb-2">
                  Audit Objective & Statutory Scope
                </h4>
                <div className="p-4 rounded-[10px] bg-[#F4F5F7] border border-[#E3E6EB] text-sm text-[#1B2430] leading-relaxed">
                  {previewTemplate.description}
                </div>
              </div>

              {/* Chart of Accounts & TB Bindings */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#5B6676] mb-2">
                  Trial Balance Mappings & Formula Integrations
                </h4>
                {previewTemplate.tbBindings && previewTemplate.tbBindings.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {previewTemplate.tbBindings.map((binding: string) => (
                      <div
                        key={binding}
                        className="flex items-center gap-2 p-2.5 rounded-[8px] bg-white border border-[#E3E6EB] text-xs font-mono-numbers text-[#1B2430]"
                      >
                        <span className="w-2 h-2 rounded-full bg-[#1E4FD8]" />
                        <span>{binding}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#5B6676]">
                    Calculated from overall trial balance figures or client-provided electronic records.
                  </p>
                )}
              </div>

              {/* UK Audit Procedures Checklist */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#5B6676]">
                    Mandatory UK Audit Procedures ({previewTemplate.proceduresCount})
                  </h4>
                  <span className="text-[11px] text-[#0B6B4D] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> FRC / ICAEW / SRA / Charity Commission Aligned
                  </span>
                </div>

                <div className="border border-[#E3E6EB] rounded-[10px] divide-y divide-[#E3E6EB] bg-white">
                  {previewTemplate.keyProcedures && previewTemplate.keyProcedures.length > 0 ? (
                    previewTemplate.keyProcedures.map((proc: string, idx: number) => (
                      <div key={idx} className="p-3.5 flex items-start gap-3">
                        <span className="w-5 h-5 rounded-full bg-[#E8EEFD] text-[#1E4FD8] text-[11px] font-mono-numbers font-semibold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <p className="text-xs text-[#1B2430] leading-relaxed">{proc}</p>
                          <span className="text-[10px] text-[#5B6676] mt-1 inline-block">
                            UK Statutory Assertion: Completeness &bull; Existence &bull; Accuracy &bull; Legal Compliance
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-xs text-[#5B6676]">
                      Standard analytical review, vouching of supporting documents, and management inquiry procedures.
                    </div>
                  )}
                </div>
              </div>

              {/* Mathematical Checks & Assertions */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#5B6676] mb-2">
                  Automated Mathematical & Tie-Out Checks ({previewTemplate.checksCount})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-[8px] bg-white border border-[#E3E6EB] flex flex-col gap-1">
                    <span className="text-xs font-semibold text-[#1B2430]">
                      General Ledger vs Sub-Ledger Tie
                    </span>
                    <span className="text-[11px] text-[#5B6676]">
                      Automated comparison of trial balance nominal balance to schedule total (tolerance: £0.00).
                    </span>
                  </div>
                  <div className="p-3 rounded-[8px] bg-white border border-[#E3E6EB] flex flex-col gap-1">
                    <span className="text-xs font-semibold text-[#1B2430]">
                      Statutory Disclosure Footing
                    </span>
                    <span className="text-[11px] text-[#5B6676]">
                      Cross-checks opening book balance plus additions less disposals against closing audited balance.
                    </span>
                  </div>
                </div>
              </div>

              {/* Sign-off Hierarchy */}
              <div className="p-4 rounded-[10px] bg-[#E8EEFD]/50 border border-[#CADBFA] flex items-center justify-between text-xs text-[#1B2430]">
                <div>
                  <span className="font-semibold block">Required Multi-Tier Sign-Off:</span>
                  <span className="text-[#5B6676] text-[11px]">
                    Preparer (Senior Associate) &rarr; Reviewer (Audit Manager) &rarr; Responsible Individual (RI Partner Lock)
                  </span>
                </div>
                <ShieldCheck className="w-5 h-5 text-[#1E4FD8] shrink-0" />
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-5 border-t border-[#E3E6EB] bg-[#F8F9FA] flex items-center justify-between gap-3">
              <Button
                variant="outline"
                size="md"
                onClick={() => setPreviewTemplate(null)}
              >
                Close Preview
              </Button>

              <div className="flex items-center gap-2">
                <Link href={`/engagements/eng_harlow_fy26/workpapers/${previewTemplate.id}`}>
                  <Button
                    variant="primary"
                    size="md"
                    icon={<ChevronRight className="w-4 h-4" />}
                  >
                    Open Workpaper ({previewTemplate.leadRef || 'Schedule'})
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM TEMPLATE BUILDER MODAL */}
      {customTemplateModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white rounded-[16px] border border-[#CBD2DC] max-w-3xl w-full max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#1B2430] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#1E4FD8] flex items-center justify-center">
                  <FileSpreadsheet className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-white">
                    Custom Template Builder (Firm Methodology Suite)
                  </h3>
                  <p className="text-xs text-[#CBD2DC]">
                    Configure bespoke lead schedules, nominal account bindings, and substantive procedures
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCustomTemplateModalOpen(false)}
                className="text-[#CBD2DC] hover:text-white cursor-pointer p-1 rounded hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleSaveCustomTemplate} className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
              {/* Basic Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#1B2430]">
                    Template Schedule Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newTplName}
                    onChange={(e) => setNewTplName(e.target.value)}
                    placeholder="e.g. Foreign Currency Bank Reconciliation (USD & EUR)"
                    className="px-3 py-2 text-xs border border-[#CBD2DC] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#1E4FD8]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#1B2430]">
                    Workpaper Lead Ref <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newTplLeadRef}
                    onChange={(e) => setNewTplLeadRef(e.target.value)}
                    placeholder="e.g. B-15"
                    className="px-3 py-2 text-xs border border-[#CBD2DC] rounded-[8px] font-mono focus:outline-none focus:ring-2 focus:ring-[#1E4FD8]"
                  />
                </div>
              </div>

              {/* Categorization & Framework */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#1B2430]">
                    Audit Area
                  </label>
                  <select
                    value={newTplArea}
                    onChange={(e) => setNewTplArea(e.target.value)}
                    className="px-3 py-2 text-xs border border-[#CBD2DC] rounded-[8px] bg-white focus:outline-none focus:ring-2 focus:ring-[#1E4FD8]"
                  >
                    {UK_CATEGORIES.filter((c) => c !== 'All').map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#1B2430]">
                    Industry Sector
                  </label>
                  <select
                    value={newTplBusinessType}
                    onChange={(e) => setNewTplBusinessType(e.target.value)}
                    className="px-3 py-2 text-xs border border-[#CBD2DC] rounded-[8px] bg-white focus:outline-none focus:ring-2 focus:ring-[#1E4FD8]"
                  >
                    {UK_BUSINESS_TYPES.filter((b) => b !== 'All Business Sectors').map((bType) => (
                      <option key={bType} value={bType}>
                        {bType}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#1B2430]">
                    Audit Framework
                  </label>
                  <select
                    value={newTplFramework}
                    onChange={(e) => setNewTplFramework(e.target.value)}
                    className="px-3 py-2 text-xs border border-[#CBD2DC] rounded-[8px] bg-white focus:outline-none focus:ring-2 focus:ring-[#1E4FD8]"
                  >
                    {UK_FRAMEWORKS.filter((f) => f !== 'All Frameworks').map((fw) => (
                      <option key={fw} value={fw}>
                        {fw}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#1B2430]">
                  Template Scope & Methodology Description
                </label>
                <textarea
                  rows={2}
                  value={newTplDescription}
                  onChange={(e) => setNewTplDescription(e.target.value)}
                  placeholder="Describe the scope, objectives, and statutory compliance rationale of this schedule..."
                  className="px-3 py-2 text-xs border border-[#CBD2DC] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#1E4FD8]"
                />
              </div>

              {/* Trial Balance Nominal Bindings */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#1B2430]">
                  General Ledger Trial Balance Nominal Bindings (Comma-separated)
                </label>
                <input
                  type="text"
                  value={newTplBindings}
                  onChange={(e) => setNewTplBindings(e.target.value)}
                  placeholder="e.g. Account 1010 Operating, Account 1020 USD Treasury"
                  className="px-3 py-2 text-xs border border-[#CBD2DC] rounded-[8px] font-mono focus:outline-none focus:ring-2 focus:ring-[#1E4FD8]"
                />
                <span className="text-[11px] text-[#5B6676]">
                  These nominal accounts will automatically tie into the engagement Trial Balance.
                </span>
              </div>

              {/* Substantive Procedures Builder */}
              <div className="flex flex-col gap-2 p-4 rounded-[10px] bg-[#F8F9FA] border border-[#E3E6EB]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#1B2430] uppercase tracking-wider">
                    Substantive Audit Checklist ({newTplProcedures.length} Procedures)
                  </label>
                  <span className="text-[11px] text-[#5B6676]">ISA 500 Substantive Evidence</span>
                </div>

                <div className="flex flex-col gap-2">
                  {newTplProcedures.map((proc, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-[8px] bg-white border border-[#CBD2DC] flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-2 flex-1">
                        <span className="w-5 h-5 rounded-full bg-[#E8EEFD] text-[#1E4FD8] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-[#1B2430] leading-relaxed">{proc}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setNewTplProcedures((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="text-[#9CA3AF] hover:text-[#DC2626] p-1 cursor-pointer"
                        title="Remove procedure"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add procedure draft */}
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={procedureDraft}
                    onChange={(e) => setProcedureDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && procedureDraft.trim()) {
                        e.preventDefault();
                        setNewTplProcedures((prev) => [...prev, procedureDraft.trim()]);
                        setProcedureDraft('');
                      }
                    }}
                    placeholder="Type new substantive procedure and press Enter..."
                    className="flex-1 px-3 py-1.5 text-xs border border-[#CBD2DC] rounded-[6px] bg-white focus:outline-none focus:ring-1 focus:ring-[#1E4FD8]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (procedureDraft.trim()) {
                        setNewTplProcedures((prev) => [...prev, procedureDraft.trim()]);
                        setProcedureDraft('');
                      }
                    }}
                    className="px-3 py-1.5 text-xs font-semibold bg-[#1E4FD8] text-white rounded-[6px] hover:bg-[#163BA3] cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Schedule Nominal Rows Builder */}
              <div className="flex flex-col gap-2 p-4 rounded-[10px] bg-[#F8F9FA] border border-[#E3E6EB]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#1B2430] uppercase tracking-wider">
                    Lead Schedule Rows ({newTplScheduleRows.length} Lines)
                  </label>
                  <span className="text-[11px] text-[#5B6676]">Mathematical Tie-Out Rows</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {newTplScheduleRows.map((rowName, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-[6px] bg-white border border-[#CBD2DC] flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="font-mono text-[11px] font-bold text-[#5B6676]">
                          R{idx + 1}:
                        </span>
                        <span className="text-[#1B2430] truncate">{rowName}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setNewTplScheduleRows((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="text-[#9CA3AF] hover:text-[#DC2626] p-0.5 cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add row draft */}
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={rowDraft}
                    onChange={(e) => setRowDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && rowDraft.trim()) {
                        e.preventDefault();
                        setNewTplScheduleRows((prev) => [...prev, rowDraft.trim()]);
                        setRowDraft('');
                      }
                    }}
                    placeholder="Add nominal row (e.g. 'Less: Bank Service Charges') and press Enter..."
                    className="flex-1 px-3 py-1.5 text-xs border border-[#CBD2DC] rounded-[6px] bg-white focus:outline-none focus:ring-1 focus:ring-[#1E4FD8]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (rowDraft.trim()) {
                        setNewTplScheduleRows((prev) => [...prev, rowDraft.trim()]);
                        setRowDraft('');
                      }
                    }}
                    className="px-3 py-1.5 text-xs font-semibold bg-[#1E4FD8] text-white rounded-[6px] hover:bg-[#163BA3] cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-2 flex items-center justify-between border-t border-[#E3E6EB]">
                <Button
                  variant="outline"
                  size="md"
                  type="button"
                  onClick={() => setCustomTemplateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  icon={<Check className="w-4 h-4" />}
                >
                  Save & Register Firm Template
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


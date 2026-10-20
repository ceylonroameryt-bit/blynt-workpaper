'use client';

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
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Stepper } from '@/components/ui/Stepper';
import { Field, Input, Select } from '@/components/ui/Field';
import { MOCK_CLIENTS, CURRENT_USER, TEAM_MEMBERS } from '@/lib/mock';
import { Framework } from '@/lib/types';

interface AuditAreaOption {
  id: string;
  name: string;
  selectedCount: number;
  totalCount: number;
  tag: 'From last year' | 'Auto-generated' | 'Recommended';
  checked: boolean;
}

export default function NewEngagementWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Client
  const [selectedClientId, setSelectedClientId] = useState(MOCK_CLIENTS[0].id);

  // Step 2: Period & Framework
  const [periodLabel, setPeriodLabel] = useState('FY 2026');
  const [yearEndDate, setYearEndDate] = useState('2026-09-30');
  const [framework, setFramework] = useState<Framework>('ISA');
  const [materiality, setMateriality] = useState('250,000.00');

  // Step 3: Workpapers (audit areas as checkable rows with counts & tags)
  const [auditAreas, setAuditAreas] = useState<AuditAreaOption[]>([
    {
      id: 'cash',
      name: 'Cash & Cash Equivalents (B-10 to B-14)',
      selectedCount: 5,
      totalCount: 5,
      tag: 'From last year',
      checked: true,
    },
    {
      id: 'ar',
      name: 'Trade & Other Receivables (C-01 to C-08)',
      selectedCount: 6,
      totalCount: 8,
      tag: 'Auto-generated',
      checked: true,
    },
    {
      id: 'inv',
      name: 'Inventory Valuation & Cutoff (D-01 to D-06)',
      selectedCount: 4,
      totalCount: 6,
      tag: 'From last year',
      checked: true,
    },
    {
      id: 'ppe',
      name: 'Property, Plant & Equipment (E-01 to E-05)',
      selectedCount: 5,
      totalCount: 5,
      tag: 'From last year',
      checked: true,
    },
    {
      id: 'ap',
      name: 'Trade Payables & Accruals (K-01 to K-06)',
      selectedCount: 5,
      totalCount: 6,
      tag: 'Recommended',
      checked: true,
    },
    {
      id: 'rev',
      name: 'Revenue Substantive Testing (Q-01 to Q-05)',
      selectedCount: 4,
      totalCount: 5,
      tag: 'Auto-generated',
      checked: true,
    },
    {
      id: 'tax',
      name: 'Corporate & Payroll Tax (T-01 to T-03)',
      selectedCount: 2,
      totalCount: 3,
      tag: 'Recommended',
      checked: true,
    },
    {
      id: 'comp',
      name: 'Audit Completion & Subsequent Events (Z-01 to Z-03)',
      selectedCount: 3,
      totalCount: 3,
      tag: 'Recommended',
      checked: true,
    },
  ]);

  // Toggles on summary
  const [rollForwardPriorYear, setRollForwardPriorYear] = useState(true);
  const [autoAssignTeam, setAutoAssignTeam] = useState(true);

  const selectedClient =
    MOCK_CLIENTS.find((c) => c.id === selectedClientId) || MOCK_CLIENTS[0];

  const totalSelectedWorkpapers = auditAreas
    .filter((a) => a.checked)
    .reduce((sum, a) => sum + a.selectedCount, 0);

  const toggleArea = (id: string) => {
    setAuditAreas((prev) =>
      prev.map((a) => (a.id === id ? { ...a, checked: !a.checked } : a))
    );
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Create engagement and route to overview
      router.push('/engagements/eng_harlow_fy26');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const steps = [
    { id: 1, title: 'Client' },
    { id: 2, title: 'Period & Framework' },
    { id: 3, title: 'Workpapers' },
    { id: 4, title: 'Review & Create' },
  ];

  const getTagBadge = (tag: AuditAreaOption['tag']) => {
    switch (tag) {
      case 'From last year':
        return 'bg-[#E8EEFD] text-[#1E4FD8]';
      case 'Auto-generated':
        // AI is always violet
        return 'bg-[#F3F0FE] text-[#3F2A9E] border border-[#DDD6FA]';
      case 'Recommended':
        return 'bg-[#E2F4EC] text-[#0B6B4D]';
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto">
      {/* Top Bar with back link */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E3E6EB]">
        <Link
          href="/clients"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5B6676] hover:text-[#1B2430] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to clients</span>
        </Link>
        <span className="text-xs text-[#5B6676]">Step {currentStep} of 4</span>
      </div>

      {/* Stepper Header */}
      <div className="bg-white border border-[#E3E6EB] rounded-[14px] p-6">
        <Stepper
          steps={steps}
          currentStep={currentStep}
          onStepClick={(step) => setCurrentStep(step)}
        />
      </div>

      {/* Wizard Content Layout: Left Form + Right Summary Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Interactive Step Body */}
        <div className="lg:col-span-8 bg-white border border-[#E3E6EB] rounded-[14px] p-6 flex flex-col justify-between min-h-[480px]">
          <div>
            {/* Step 1: Client Selection */}
            {currentStep === 1 && (
              <div className="flex flex-col gap-5">
                <div>
                  <h2 className="text-lg font-semibold text-[#1B2430]">
                    Select Client Entity
                  </h2>
                  <p className="text-xs text-[#5B6676] mt-0.5">
                    Choose an existing client organization or initialize a new company file.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  {MOCK_CLIENTS.map((client) => {
                    const isSelected = client.id === selectedClientId;
                    return (
                      <div
                        key={client.id}
                        onClick={() => setSelectedClientId(client.id)}
                        className={`p-4 rounded-[12px] border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'border-[#1E4FD8] bg-[#E8EEFD]/20 ring-1 ring-[#1E4FD8]'
                            : 'border-[#E3E6EB] hover:border-[#D5D9E0] bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-xs ${
                              isSelected
                                ? 'bg-[#1E4FD8] text-white'
                                : 'bg-[#F4F5F7] text-[#5B6676]'
                            }`}
                          >
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-[#1B2430]">
                              {client.name}
                            </div>
                            <div className="text-xs text-[#5B6676]">
                              {client.industry} • Year End: {client.yearEnd}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono-numbers px-2 py-0.5 bg-[#F4F5F7] rounded text-[#5B6676]">
                            {client.framework}
                          </span>
                          <input
                            type="radio"
                            name="selected-client"
                            checked={isSelected}
                            onChange={() => setSelectedClientId(client.id)}
                            className="w-4 h-4 text-[#1E4FD8] border-[#D5D9E0] focus:ring-[#1E4FD8]"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Period & Framework */}
            {currentStep === 2 && (
              <div className="flex flex-col gap-5">
                <div>
                  <h2 className="text-lg font-semibold text-[#1B2430]">
                    Period, Auditing Standard & Materiality
                  </h2>
                  <p className="text-xs text-[#5B6676] mt-0.5">
                    Configure the accounting period end, compliance standard, and benchmark parameters.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Engagement Period Label" htmlFor="period-label" required>
                    <Input
                      id="period-label"
                      type="text"
                      value={periodLabel}
                      onChange={(e) => setPeriodLabel(e.target.value)}
                      placeholder="e.g. FY 2026"
                    />
                  </Field>

                  <Field label="Year-End Date" htmlFor="period-date" required>
                    <Input
                      id="period-date"
                      type="date"
                      value={yearEndDate}
                      onChange={(e) => setYearEndDate(e.target.value)}
                    />
                  </Field>

                  <Field label="Auditing Standard Framework" htmlFor="framework-select" required>
                    <Select
                      id="framework-select"
                      value={framework}
                      onChange={(e) => setFramework(e.target.value as Framework)}
                    >
                      <option value="ISA">IAASB — International Standards on Auditing (ISA)</option>
                      <option value="US_GAAS">AICPA — US GAAS (Generally Accepted Auditing Standards)</option>
                      <option value="AICPA">AICPA — Review & Compilation Standards</option>
                    </Select>
                  </Field>

                  <Field
                    label="Planning Materiality (USD)"
                    htmlFor="materiality"
                    hint="5% of profit before tax or 0.5% of total revenue"
                    required
                  >
                    <Input
                      id="materiality"
                      type="text"
                      value={materiality}
                      onChange={(e) => setMateriality(e.target.value)}
                    />
                  </Field>
                </div>

                <div className="p-4 rounded-[12px] bg-[#F4F5F7] border border-[#E3E6EB] text-xs text-[#5B6676] flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#1E4FD8] shrink-0 mt-0.5" />
                  <span>
                    Performance materiality will automatically be set to 75% of planning materiality ($187,500.00), and clearly trivial threshold to 5% ($12,500.00) in accordance with ISA 320.
                  </span>
                </div>
              </div>
            )}

            {/* Step 3: Workpapers (audit areas with counts and tags) */}
            {currentStep === 3 && (
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-[#1B2430]">
                      Audit Areas & Workpaper Selection
                    </h2>
                    <p className="text-xs text-[#5B6676] mt-0.5">
                      Select templates to populate the engagement binder based on the client's risk profile.
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-[#E8EEFD] text-[#1E4FD8] rounded-full">
                    {totalSelectedWorkpapers} workpapers chosen
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {auditAreas.map((area) => (
                    <div
                      key={area.id}
                      onClick={() => toggleArea(area.id)}
                      className={`p-3.5 rounded-[12px] border transition-all cursor-pointer flex items-center justify-between ${
                        area.checked
                          ? 'border-[#1E4FD8]/40 bg-[#F8F9FA]'
                          : 'border-[#E3E6EB] bg-white opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={area.checked}
                          onChange={() => toggleArea(area.id)}
                          className="w-4 h-4 rounded text-[#1E4FD8] border-[#D5D9E0] focus:ring-[#1E4FD8]"
                        />
                        <span className="text-sm font-semibold text-[#1B2430]">
                          {area.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono-numbers text-[#5B6676]">
                          {area.selectedCount} of {area.totalCount}
                        </span>
                        <span
                          className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${getTagBadge(
                            area.tag
                          )}`}
                        >
                          {area.tag}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Review and Create */}
            {currentStep === 4 && (
              <div className="flex flex-col gap-5">
                <div>
                  <h2 className="text-lg font-semibold text-[#1B2430]">
                    Review & Confirm Engagement Initialization
                  </h2>
                  <p className="text-xs text-[#5B6676] mt-0.5">
                    Confirm configuration before generating lead schedules, master COA mappings, and binder index.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-[12px] border border-[#E3E6EB] bg-[#F8F9FA]">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5B6676]">
                      Client Legal Entity
                    </span>
                    <div className="text-base font-semibold text-[#1B2430] mt-1">
                      {selectedClient.name}
                    </div>
                    <div className="text-xs text-[#5B6676] mt-0.5">
                      {selectedClient.industry}
                    </div>
                  </div>

                  <div className="p-4 rounded-[12px] border border-[#E3E6EB] bg-[#F8F9FA]">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5B6676]">
                      Period & Standard
                    </span>
                    <div className="text-base font-semibold text-[#1B2430] mt-1">
                      {periodLabel} (Ends {yearEndDate})
                    </div>
                    <div className="text-xs text-[#5B6676] mt-0.5">
                      Standard: {framework} • Materiality: ${materiality}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-[12px] bg-[#E2F4EC] border border-transparent text-[#0B6B4D] flex items-center gap-3 text-xs font-medium">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>
                    Binder verified: 34 workpapers configured across 8 audit areas with standard tickmarks and ISA procedure checklists.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Stepper Navigation Buttons */}
          <div className="mt-8 pt-4 border-t border-[#E3E6EB] flex items-center justify-between">
            <Button
              variant="outline"
              size="md"
              disabled={currentStep === 1}
              onClick={handleBack}
              icon={<ChevronLeft className="w-4 h-4" />}
            >
              Back
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={handleNext}
              icon={
                currentStep === 4 ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )
              }
            >
              {currentStep === 4 ? 'Create engagement' : 'Continue'}
            </Button>
          </div>
        </div>

        {/* Right Summary Card */}
        <div className="lg:col-span-4 bg-white border border-[#E3E6EB] rounded-[14px] p-6 flex flex-col gap-5">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#5B6676]">
              Engagement Summary
            </span>
            <h3 className="text-lg font-semibold text-[#1B2430] mt-1">
              {selectedClient.name}
            </h3>
            <p className="text-xs text-[#5B6676] font-mono-numbers mt-0.5">
              {periodLabel} • {framework}
            </p>
          </div>

          <div className="p-3.5 rounded-[12px] bg-[#F4F5F7] border border-[#E3E6EB] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-[#1E4FD8]" />
              <span className="text-xs font-medium text-[#1B2430]">
                Workpapers Selected
              </span>
            </div>
            <span className="text-xs font-bold font-mono-numbers text-[#1E4FD8] bg-[#E8EEFD] px-2 py-0.5 rounded-full">
              {totalSelectedWorkpapers} active
            </span>
          </div>

          {/* Toggles */}
          <div className="flex flex-col gap-3 pt-2 border-t border-[#E3E6EB]">
            <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-[#1B2430]">
              <input
                type="checkbox"
                checked={rollForwardPriorYear}
                onChange={(e) => setRollForwardPriorYear(e.target.checked)}
                className="w-4 h-4 rounded text-[#1E4FD8] border-[#D5D9E0] focus:ring-[#1E4FD8] mt-0.5"
              />
              <div className="flex flex-col">
                <span className="font-semibold">Roll forward prior year</span>
                <span className="text-[#5B6676] text-[11px]">
                  Carry over unadjusted audit differences, fixed asset registers, and permanent notes.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-[#1B2430]">
              <input
                type="checkbox"
                checked={autoAssignTeam}
                onChange={(e) => setAutoAssignTeam(e.target.checked)}
                className="w-4 h-4 rounded text-[#1E4FD8] border-[#D5D9E0] focus:ring-[#1E4FD8] mt-0.5"
              />
              <div className="flex flex-col">
                <span className="font-semibold">Assign core audit team</span>
                <span className="text-[#5B6676] text-[11px]">
                  Auto-assign Sam Rivera (Manager) and Anika Kapoor (Preparer).
                </span>
              </div>
            </label>
          </div>

          {/* Team Preview */}
          <div className="pt-2 border-t border-[#E3E6EB]">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5B6676] block mb-2">
              Assigned Team Members
            </span>
            <div className="flex items-center gap-2">
              {TEAM_MEMBERS.map((m) => (
                <div key={m.id} className="relative group">
                  <div className="w-8 h-8 rounded-full bg-[#E8EEFD] text-[#1E4FD8] flex items-center justify-center font-bold text-xs ring-1 ring-white">
                    {m.initials}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-2 pt-4 border-t border-[#E3E6EB] flex flex-col gap-2">
            <Button
              variant="primary"
              size="md"
              className="w-full"
              onClick={() => router.push('/engagements/eng_harlow_fy26')}
            >
              Create engagement
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => router.push('/clients')}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

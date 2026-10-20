'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  FileSpreadsheet,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Search,
  Check,
  AlertTriangle,
  ChevronRight,
  FileCheck2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Tile } from '@/components/ui/Tile';
import { Stepper } from '@/components/ui/Stepper';
import { StatusPill } from '@/components/ui/StatusPill';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { getTrialBalance, getEngagement } from '@/lib/api';
import { TrialBalanceItem, EngagementSummary } from '@/lib/types';
import { formatMoney } from '@/lib/utils/format';
import { MOCK_ENGAGEMENT } from '@/lib/mock';

const MASTER_CATEGORIES = [
  'Cash & Cash Equivalents',
  'Trade & Other Receivables',
  'Inventory',
  'Prepayments & Accrued Income',
  'Property, Plant & Equipment',
  'Trade & Other Payables',
  'Accruals & Deferred Income',
  'Taxation Liabilities',
  'Payroll & Employee Liabilities',
  'Equity & Reserves',
  'Revenue',
  'Cost of Sales',
  'Operating Expenses',
  'Other Income / Expense',
];

export default function TrialBalanceMappingPage() {
  const params = useParams();
  const router = useRouter();
  const engagementId = (params?.id as string) || 'eng_harlow_fy26';

  const [currentStep, setCurrentStep] = useState(2); // Step 2: Map accounts
  const [tbItems, setTbItems] = useState<TrialBalanceItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'unmapped' | 'suggested' | 'confirmed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bannerVisible, setBannerVisible] = useState(true);
  const [acceptedBulk, setAcceptedBulk] = useState(false);

  useEffect(() => {
    getTrialBalance(engagementId).then(setTbItems);
  }, [engagementId]);

  // Totals calculations
  const totalDebits = 1482049050; // $14,820,490.50 in cents
  const totalCredits = 1482049050; // $14,820,490.50 in cents
  const difference = totalDebits - totalCredits; // 0

  const accountsNeedingCategory = tbItems.filter(
    (item) => item.status === 'Needs category'
  ).length;

  const aiSuggestedCount = tbItems.filter(
    (item) => item.status === 'AI suggested'
  ).length;

  // Handle bulk accept of 118 high-confidence mappings
  const handleBulkAccept = () => {
    setTbItems((prev) =>
      prev.map((item) =>
        item.status === 'AI suggested'
          ? { ...item, status: 'Confirmed' as const }
          : item
      )
    );
    setAcceptedBulk(true);
  };

  // Handle single confirm
  const handleConfirmSingle = (id: string) => {
    setTbItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'Confirmed' as const } : item
      )
    );
  };

  // Handle category change
  const handleCategoryChange = (id: string, newCategory: string) => {
    setTbItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              standardCategory: newCategory,
              status: 'Confirmed' as const,
              confidenceScore: 100,
            }
          : item
      )
    );
  };

  const filteredItems = useMemo(() => {
    return tbItems.filter((item) => {
      const matchesSearch =
        item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.accountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.standardCategory.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (filterStatus === 'unmapped') return item.status === 'Needs category';
      if (filterStatus === 'suggested') return item.status === 'AI suggested';
      if (filterStatus === 'confirmed') return item.status === 'Confirmed';
      return true;
    });
  }, [tbItems, searchQuery, filterStatus]);

  const steps = [
    { id: 1, title: 'Import' },
    { id: 2, title: 'Map Accounts' },
    { id: 3, title: 'Review & Post' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header and Stepper */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#5B6676] mb-1">
            <Link
              href={`/engagements/${engagementId}`}
              className="hover:text-[#1E4FD8] font-medium"
            >
              {MOCK_ENGAGEMENT.clientName}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#1B2430] font-semibold">Trial Balance</span>
          </div>
          <h1 className="text-[28px] font-semibold text-[#1B2430] tracking-tight">
            Trial Balance Mapping & COA Normalization
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            icon={<Upload className="w-4 h-4" />}
            onClick={() => alert('Re-import file: Upload revised TB CSV/XLSX to test variance auto-detection.')}
          >
            Re-import TB
          </Button>
          <Link href={`/engagements/${engagementId}/workpapers/wp_b10`}>
            <Button
              variant="primary"
              size="md"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Go to B-10 Workpaper
            </Button>
          </Link>
        </div>
      </div>

      {/* Stepper Card */}
      <div className="bg-white border border-[#E3E6EB] rounded-[14px] p-5">
        <Stepper
          steps={steps}
          currentStep={currentStep}
          onStepClick={(s) => setCurrentStep(s)}
        />
      </div>

      {/* Green Banner with Imported File */}
      {bannerVisible && (
        <div className="bg-[#E2F4EC] border border-[#0B6B4D]/20 rounded-[14px] p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#0B6B4D] text-white flex items-center justify-center shrink-0">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#0B6B4D] flex items-center gap-2">
                <span>File Imported: TB_Harlow_Finch_FY26_Final.xlsx</span>
                <span className="text-xs font-mono-numbers px-2 py-0.5 rounded-full bg-white/70 text-[#0B6B4D]">
                  142 accounts
                </span>
              </div>
              <p className="text-xs text-[#0B6B4D]/80 mt-0.5 font-mono-numbers">
                Uploaded 2 hours ago by Sam Rivera • Format: Excel 2016+ (XLSX) • SHA-256 Verified
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setBannerVisible(false)}
            className="text-xs font-medium text-[#0B6B4D] hover:underline shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Four Summary Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Tile
          title="Total debits"
          value={formatMoney(totalDebits)}
          subtitle="General Ledger Assets & Expenses"
        />
        <Tile
          title="Total credits"
          value={formatMoney(totalCredits)}
          subtitle="Liabilities, Equity & Revenues"
        />
        <Tile
          title="Difference"
          value={
            <span className="flex items-center gap-2">
              <span>{formatMoney(difference)}</span>
              <StatusPill status="Ties" size="sm" />
            </span>
          }
          subtitle="Balanced debit-credit ties"
        />
        <Tile
          title="Accounts needing a category"
          value={
            <span
              className={
                accountsNeedingCategory > 0 ? 'text-[#9A4A00]' : 'text-[#0B6B4D]'
              }
            >
              {accountsNeedingCategory}
            </span>
          }
          subtitle={
            accountsNeedingCategory > 0
              ? 'Action required for completion'
              : 'All 142 accounts mapped!'
          }
        />
      </div>

      {/* Violet Bulk Bar: "Accept 118 high-confidence" */}
      {!acceptedBulk && aiSuggestedCount > 0 && (
        <div className="bg-[#F3F0FE] border border-[#DDD6FA] rounded-[14px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#5B3FD0] text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#3F2A9E] flex items-center gap-2">
                <span>AI Automated Mapping Engine</span>
                <span className="text-[11px] font-mono-numbers px-2 py-0.5 rounded-full bg-white text-[#3F2A9E] border border-[#DDD6FA]">
                  &gt; 90% confidence
                </span>
              </div>
              <p className="text-xs text-[#3F2A9E]/80 mt-0.5">
                AI matched 118 accounts against the master chart of accounts using semantic similarity and transaction histories.
              </p>
            </div>
          </div>

          <Button
            variant="ai"
            size="md"
            icon={<Check className="w-4 h-4" />}
            onClick={handleBulkAccept}
            className="shrink-0"
          >
            Accept 118 high-confidence
          </Button>
        </div>
      )}

      {acceptedBulk && (
        <div className="bg-[#E2F4EC] border border-[#0B6B4D]/20 rounded-[14px] p-3.5 flex items-center gap-3 text-xs font-semibold text-[#0B6B4D]">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>
            Accepted 118 high-confidence mappings. Logged to immutable audit trail by Sam Rivera.
          </span>
        </div>
      )}

      {/* Account Mapping Grid */}
      <div className="bg-white border border-[#E3E6EB] rounded-[14px] overflow-hidden">
        {/* Filter Controls */}
        <div className="p-4 border-b border-[#E3E6EB] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                filterStatus === 'all'
                  ? 'bg-[#1E4FD8] text-white'
                  : 'bg-[#F4F5F7] text-[#5B6676] hover:bg-[#E8EBF0]'
              }`}
            >
              All Accounts ({tbItems.length})
            </button>
            <button
              onClick={() => setFilterStatus('unmapped')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                filterStatus === 'unmapped'
                  ? 'bg-[#9A4A00] text-white'
                  : 'bg-[#FFF1DC] text-[#9A4A00] hover:bg-[#ffe5c2]'
              }`}
            >
              Needs category ({accountsNeedingCategory})
            </button>
            <button
              onClick={() => setFilterStatus('suggested')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                filterStatus === 'suggested'
                  ? 'bg-[#5B3FD0] text-white'
                  : 'bg-[#F3F0FE] text-[#3F2A9E] hover:bg-[#eae3fc]'
              }`}
            >
              AI suggested ({aiSuggestedCount})
            </button>
            <button
              onClick={() => setFilterStatus('confirmed')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                filterStatus === 'confirmed'
                  ? 'bg-[#0B6B4D] text-white'
                  : 'bg-[#E2F4EC] text-[#0B6B4D] hover:bg-[#d0edd9]'
              }`}
            >
              Confirmed
            </button>
          </div>

          <div className="relative flex items-center min-w-[240px]">
            <Search className="w-4 h-4 text-[#5B6676] absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search code, account, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full min-h-[38px] pl-9 pr-3 text-xs bg-[#F4F5F7] border border-[#D5D9E0] rounded-[10px] text-[#1B2430] placeholder:text-[#5B6676] focus-visible:outline-2 focus-visible:outline-[#1E4FD8] focus-visible:outline-offset-2"
            />
          </div>
        </div>

        {/* Spreadsheet-Style Data Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm text-[#1B2430] border-collapse">
            <thead className="bg-[#F8F9FA] text-[#5B6676] text-[11px] font-semibold uppercase tracking-wider border-b border-[#E3E6EB]">
              <tr>
                <th scope="col" className="px-4 py-3 border-r border-[#E3E6EB] w-[90px]">
                  Code
                </th>
                <th scope="col" className="px-4 py-3 border-r border-[#E3E6EB]">
                  Account Name
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-right border-r border-[#E3E6EB] w-[140px]"
                >
                  Closing Balance
                </th>
                <th scope="col" className="px-4 py-3 border-r border-[#E3E6EB] w-[260px]">
                  Standard Category
                </th>
                <th scope="col" className="px-4 py-3 border-r border-[#E3E6EB] w-[160px]">
                  Confidence
                </th>
                <th scope="col" className="px-4 py-3 border-r border-[#E3E6EB] w-[130px]">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 text-right w-[100px]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E6EB]">
              {filteredItems.map((item, idx) => (
                <tr
                  key={item.id}
                  className={`hover:bg-[#F8F9FA]/80 transition-colors ${
                    item.status === 'Needs category' ? 'bg-[#FFF1DC]/10' : ''
                  }`}
                >
                  <td className="px-4 py-3 font-mono-numbers font-semibold text-xs text-[#1E4FD8] border-r border-[#E3E6EB]">
                    {item.code}
                  </td>

                  <td className="px-4 py-3 font-medium text-xs text-[#1B2430] border-r border-[#E3E6EB]">
                    {item.accountName}
                  </td>

                  <td className="px-4 py-3 font-mono-numbers text-xs text-right border-r border-[#E3E6EB] whitespace-nowrap">
                    {formatMoney(item.closingBalanceCents)}
                  </td>

                  <td className="px-4 py-2 border-r border-[#E3E6EB]">
                    <select
                      value={item.standardCategory}
                      onChange={(e) => handleCategoryChange(item.id, e.target.value)}
                      className={`w-full py-1.5 px-2.5 text-xs rounded-[8px] border transition-colors ${
                        item.status === 'Needs category'
                          ? 'border-[#9A4A00] bg-white text-[#9A4A00] font-semibold'
                          : 'border-[#D5D9E0] bg-white text-[#1B2430]'
                      }`}
                    >
                      <option value="Unassigned">-- Select Category --</option>
                      {MASTER_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="px-4 py-3 border-r border-[#E3E6EB]">
                    <div className="flex items-center gap-2">
                      <ProgressBar
                        value={item.confidenceScore}
                        size="sm"
                        showLabel
                      />
                    </div>
                  </td>

                  <td className="px-4 py-3 border-r border-[#E3E6EB] whitespace-nowrap">
                    <StatusPill status={item.status} size="sm" />
                  </td>

                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {item.status !== 'Confirmed' ? (
                      <button
                        onClick={() => handleConfirmSingle(item.id)}
                        className="text-xs font-semibold text-[#1E4FD8] hover:text-[#163BA3] px-2 py-1 rounded hover:bg-[#E8EEFD] transition-colors"
                      >
                        Confirm
                      </button>
                    ) : (
                      <span className="text-xs text-[#0B6B4D] font-medium flex items-center justify-end gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Tied</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-[#E3E6EB] bg-[#F8F9FA] flex items-center justify-between text-xs text-[#5B6676]">
          <span>
            Showing {filteredItems.length} of {tbItems.length} accounts
          </span>
          <span className="font-mono-numbers">
            Net Difference: $0.00 • ISA 500 Substantive Verification Active
          </span>
        </div>
      </div>
    </div>
  );
}

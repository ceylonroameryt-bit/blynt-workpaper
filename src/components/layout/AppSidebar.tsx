'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Building2,
  MessageSquare,
  FileDown,
  TableProperties,
  Scale,
  FileCheck2,
  Lock,
  FileSpreadsheet,
  BookOpen,
  Settings,
  ArrowUpRight,
  Plus,
  ChevronDown,
  Sliders,
} from 'lucide-react';
import { BlyntLogo } from '@/components/ui/BlyntLogo';
import { db } from '@/lib/server/db';

interface AppSidebarProps {
  currentEngagementId?: string;
  onMobileClose?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  currentEngagementId = 'eng_acme_fy26',
  onMobileClose,
}) => {
  const pathname = usePathname();
  const router = useRouter();

  const engagementBase = `/engagements/${currentEngagementId}`;

  // Find active client details
  const activeEngagement = db.engagements.find((e) => e.id === currentEngagementId);
  const activeClient =
    db.clients.find((c) => c.id === activeEngagement?.client_id) || db.clients[0];

  // Calculate live counts from data
  const openReviewNotesCount = db.comments.filter(
    (c) => c.type === 'review_note' && c.status === 'open'
  ).length;

  const mappingNeededCount = db.account_mappings.filter(
    (m) => m.engagement_id === currentEngagementId && m.status !== 'confirmed'
  ).length || 6;

  // Keyboard shortcut listener: N for New engagement
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === 'n' || e.key === 'N') &&
        !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
        router.push('/engagements/new');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  const isLinkActive = (href: string, exact = false) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      aria-label="Sidebar navigation"
      className="w-full lg:w-[264px] lg:min-h-screen bg-[#0B1B3D] text-white flex flex-col justify-between shrink-0 select-none pb-4"
    >
      <div className="flex flex-col">
        {/* Blynt Brand Logo */}
        <div className="p-5 pb-3">
          <Link
            href="/"
            onClick={onMobileClose}
            className="flex items-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7D6B] rounded-lg p-1"
          >
            <BlyntLogo variant="full" theme="dark" size="md" />
          </Link>
        </div>

        {/* Coral 'New engagement (N)' Action Button */}
        <div className="px-4 py-2">
          <Link
            href="/engagements/new"
            onClick={onMobileClose}
            className="w-full min-h-[44px] bg-[#FF7D6B] hover:bg-[#ff9485] text-[#0B1B3D] font-bold text-sm px-4 rounded-[10px] flex items-center justify-between shadow-sm transition-transform active:scale-[0.98] focus:outline-none focus-visible:ring-3 focus-visible:ring-white"
          >
            <span className="flex items-center gap-2">
              <Plus className="w-4 h-4 stroke-[2.5]" />
              New engagement
            </span>
            <kbd className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[#0B1B3D]/15 text-[#0B1B3D]">
              N
            </kbd>
          </Link>
        </div>

        {/* Current Engagement Card (Page 17 Spec) */}
        <div className="px-4 py-2.5">
          <div className="bg-[#102654] border border-[#E3E7EF]/20 rounded-[14px] p-3 text-left">
            <div className="flex items-start justify-between gap-1">
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-white truncate">
                  {activeClient.name}
                </span>
                <span className="text-[11px] text-[#A6B4D0] mt-0.5">
                  FY26 • Year end 31 Mar 2026
                </span>
                <span className="text-[10px] text-[#FF7D6B] font-medium mt-0.5 truncate">
                  {activeClient.company_type}
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                62%
              </span>
            </div>
            {/* Mini Progress Bar */}
            <div className="w-full bg-[#0B1B3D] h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all"
                style={{ width: '62%' }}
              />
            </div>
            <div className="text-[10px] text-[#A6B4D0] mt-1.5 flex items-center justify-between">
              <span>3 review notes open</span>
              <span className="text-[#FF7D6B] font-semibold">Fieldwork</span>
            </div>
          </div>
        </div>

        {/* Group: PRACTICE */}
        <div className="mt-3 flex flex-col">
          <div className="px-5 pb-1 text-[11px] font-bold uppercase tracking-wider text-[#7E8DA6]">
            Practice
          </div>
          <nav className="flex flex-col">
            <Link
              href="/"
              onClick={onMobileClose}
              aria-current={isLinkActive('/', true) ? 'page' : undefined}
              className={`relative flex items-center gap-3 px-5 py-2.5 text-xs font-medium transition-colors ${
                isLinkActive('/', true)
                  ? 'text-white bg-[#102654] font-semibold'
                  : 'text-[#A6B4D0] hover:text-white hover:bg-[#102654]/50'
              }`}
            >
              {isLinkActive('/', true) && (
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF7D6B] rounded-r-full" />
              )}
              <Home className="w-4 h-4 shrink-0 text-[#FF7D6B]" />
              <span>Practice home</span>
            </Link>

            <Link
              href="/clients"
              onClick={onMobileClose}
              aria-current={isLinkActive('/clients') ? 'page' : undefined}
              className={`relative flex items-center gap-3 px-5 py-2.5 text-xs font-medium transition-colors ${
                isLinkActive('/clients')
                  ? 'text-white bg-[#102654] font-semibold'
                  : 'text-[#A6B4D0] hover:text-white hover:bg-[#102654]/50'
              }`}
            >
              {isLinkActive('/clients') && (
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF7D6B] rounded-r-full" />
              )}
              <Building2 className="w-4 h-4 shrink-0" />
              <span>Clients</span>
            </Link>

            <Link
              href={`${engagementBase}/review`}
              onClick={onMobileClose}
              aria-current={isLinkActive(`${engagementBase}/review`) ? 'page' : undefined}
              className={`relative flex items-center justify-between px-5 py-2.5 text-xs font-medium transition-colors ${
                isLinkActive(`${engagementBase}/review`)
                  ? 'text-white bg-[#102654] font-semibold'
                  : 'text-[#A6B4D0] hover:text-white hover:bg-[#102654]/50'
              }`}
            >
              <div className="flex items-center gap-3">
                {isLinkActive(`${engagementBase}/review`) && (
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF7D6B] rounded-r-full" />
                )}
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span>Review notes</span>
              </div>
              {openReviewNotesCount > 0 && (
                <span className="text-[11px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-[#FFF4DB] text-[#6B4700]">
                  {openReviewNotesCount}
                </span>
              )}
            </Link>
          </nav>
        </div>

        {/* Group: THIS ENGAGEMENT */}
        <div className="mt-4 flex flex-col">
          <div className="px-5 pb-1 text-[11px] font-bold uppercase tracking-wider text-[#7E8DA6]">
            This engagement
          </div>
          <nav className="flex flex-col">
            <Link
              href={`${engagementBase}/import`}
              onClick={onMobileClose}
              aria-current={isLinkActive(`${engagementBase}/import`) ? 'page' : undefined}
              className={`relative flex items-center gap-3 px-5 py-2.5 text-xs font-medium transition-colors ${
                isLinkActive(`${engagementBase}/import`)
                  ? 'text-white bg-[#102654] font-semibold'
                  : 'text-[#A6B4D0] hover:text-white hover:bg-[#102654]/50'
              }`}
            >
              {isLinkActive(`${engagementBase}/import`) && (
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF7D6B] rounded-r-full" />
              )}
              <FileDown className="w-4 h-4 shrink-0" />
              <span>1 Import data</span>
            </Link>

            <Link
              href={`${engagementBase}/mapping`}
              onClick={onMobileClose}
              aria-current={isLinkActive(`${engagementBase}/mapping`) ? 'page' : undefined}
              className={`relative flex items-center justify-between px-5 py-2.5 text-xs font-medium transition-colors ${
                isLinkActive(`${engagementBase}/mapping`)
                  ? 'text-white bg-[#102654] font-semibold'
                  : 'text-[#A6B4D0] hover:text-white hover:bg-[#102654]/50'
              }`}
            >
              <div className="flex items-center gap-3">
                {isLinkActive(`${engagementBase}/mapping`) && (
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF7D6B] rounded-r-full" />
                )}
                <TableProperties className="w-4 h-4 shrink-0" />
                <span>2 Account mapping</span>
              </div>
              {mappingNeededCount > 0 && (
                <span className="text-[11px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-[#FFF1EE] text-[#A23A27]">
                  {mappingNeededCount}
                </span>
              )}
            </Link>

            <Link
              href={`${engagementBase}/trial-balance`}
              onClick={onMobileClose}
              aria-current={isLinkActive(`${engagementBase}/trial-balance`) ? 'page' : undefined}
              className={`relative flex items-center gap-3 px-5 py-2.5 text-xs font-medium transition-colors ${
                isLinkActive(`${engagementBase}/trial-balance`)
                  ? 'text-white bg-[#102654] font-semibold'
                  : 'text-[#A6B4D0] hover:text-white hover:bg-[#102654]/50'
              }`}
            >
              {isLinkActive(`${engagementBase}/trial-balance`) && (
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF7D6B] rounded-r-full" />
              )}
              <Scale className="w-4 h-4 shrink-0" />
              <span>3 Trial balance and leads</span>
            </Link>

            <Link
              href={`${engagementBase}/workpapers/wp_f10`}
              onClick={onMobileClose}
              aria-current={isLinkActive(`${engagementBase}/workpapers`) ? 'page' : undefined}
              className={`relative flex items-center gap-3 px-5 py-2.5 text-xs font-medium transition-colors ${
                isLinkActive(`${engagementBase}/workpapers`)
                  ? 'text-white bg-[#102654] font-semibold'
                  : 'text-[#A6B4D0] hover:text-white hover:bg-[#102654]/50'
              }`}
            >
              {isLinkActive(`${engagementBase}/workpapers`) && (
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF7D6B] rounded-r-full" />
              )}
              <FileCheck2 className="w-4 h-4 shrink-0" />
              <span>4 Working papers</span>
            </Link>

            <Link
              href={`${engagementBase}/sign-off`}
              onClick={onMobileClose}
              aria-current={isLinkActive(`${engagementBase}/sign-off`) ? 'page' : undefined}
              className={`relative flex items-center gap-3 px-5 py-2.5 text-xs font-medium transition-colors ${
                isLinkActive(`${engagementBase}/sign-off`)
                  ? 'text-white bg-[#102654] font-semibold'
                  : 'text-[#A6B4D0] hover:text-white hover:bg-[#102654]/50'
              }`}
            >
              {isLinkActive(`${engagementBase}/sign-off`) && (
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF7D6B] rounded-r-full" />
              )}
              <Lock className="w-4 h-4 shrink-0" />
              <span>5 Sign-off and lock</span>
            </Link>
          </nav>
        </div>

        {/* Group: LIBRARY */}
        <div className="mt-4 flex flex-col">
          <div className="px-5 pb-1 text-[11px] font-bold uppercase tracking-wider text-[#7E8DA6]">
            Library
          </div>
          <nav className="flex flex-col">
            <Link
              href="/library/templates"
              onClick={onMobileClose}
              aria-current={isLinkActive('/library/templates') ? 'page' : undefined}
              className={`relative flex items-center gap-3 px-5 py-2.5 text-xs font-medium transition-colors ${
                isLinkActive('/library/templates')
                  ? 'text-white bg-[#102654] font-semibold'
                  : 'text-[#A6B4D0] hover:text-white hover:bg-[#102654]/50'
              }`}
            >
              {isLinkActive('/library/templates') && (
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF7D6B] rounded-r-full" />
              )}
              <FileSpreadsheet className="w-4 h-4 shrink-0" />
              <span>Templates</span>
            </Link>

            <Link
              href="/library/chart-of-accounts"
              onClick={onMobileClose}
              aria-current={isLinkActive('/library/chart-of-accounts') ? 'page' : undefined}
              className={`relative flex items-center gap-3 px-5 py-2.5 text-xs font-medium transition-colors ${
                isLinkActive('/library/chart-of-accounts')
                  ? 'text-white bg-[#102654] font-semibold'
                  : 'text-[#A6B4D0] hover:text-white hover:bg-[#102654]/50'
              }`}
            >
              {isLinkActive('/library/chart-of-accounts') && (
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF7D6B] rounded-r-full" />
              )}
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>Blynt chart of accounts</span>
            </Link>
          </nav>
        </div>
      </div>

      {/* Bottom links */}
      <div className="mt-6 pt-4 border-t border-[#102654] px-4 flex flex-col gap-1.5">
        <Link
          href="/design-system"
          onClick={onMobileClose}
          className="flex items-center gap-2.5 px-2 py-2 text-xs text-[#A6B4D0] hover:text-white transition-colors rounded-lg hover:bg-[#102654]"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Settings &amp; accessibility</span>
        </Link>

        <a
          href="https://blynt.co.uk"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-2 py-2 text-xs text-[#A6B4D0] hover:text-[#FF7D6B] transition-colors rounded-lg hover:bg-[#102654]"
        >
          <span>Back to Blynt accounting</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </aside>
  );
};

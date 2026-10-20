'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  FileSpreadsheet,
  LayoutDashboard,
  Table2,
  FileCheck2,
  SlidersHorizontal,
  MessageSquare,
  Lock,
  ChevronDown,
  Sparkles,
  Briefcase,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { CURRENT_USER, MOCK_ENGAGEMENT } from '@/lib/mock';

interface AppSidebarProps {
  currentEngagementId?: string;
  onMobileClose?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  currentEngagementId = 'eng_harlow_fy26',
  onMobileClose,
}) => {
  const pathname = usePathname();

  const engagementBase = `/engagements/${currentEngagementId}`;

  const workspaceNav = [
    { label: 'Clients', href: '/clients', icon: Building2 },
    { label: 'Templates', href: '/templates', icon: FileSpreadsheet },
  ];

  const engagementNav = [
    {
      label: 'Overview',
      href: engagementBase,
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: 'Trial balance',
      href: `${engagementBase}/trial-balance`,
      icon: Table2,
    },
    {
      label: 'Workpapers',
      href: `${engagementBase}/workpapers/wp_b10`,
      icon: FileCheck2,
    },
    {
      label: 'Adjustments',
      href: `${engagementBase}/adjustments`,
      icon: SlidersHorizontal,
    },
    {
      label: 'Review notes',
      href: `${engagementBase}/review`,
      icon: MessageSquare,
      badge: 12,
      badgeColor: 'bg-[#FFF1DC] text-[#9A4A00]',
    },
    {
      label: 'Sign-off',
      href: `${engagementBase}/sign-off`,
      icon: Lock,
    },
  ];

  const isLinkActive = (href: string, exact = false) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-full lg:w-[248px] lg:min-h-screen flex flex-col justify-between shrink-0 p-4 select-none">
      <div className="flex flex-col gap-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 pt-1">
          <Link
            href="/clients"
            className="flex items-center gap-2.5 group"
            onClick={onMobileClose}
          >
            <div className="w-8 h-8 rounded-[9px] bg-[#1E4FD8] flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:bg-[#163BA3] transition-colors">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-base tracking-tight text-[#1B2430]">
                Workpapers
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#5B6676]">
                Audit Platform
              </span>
            </div>
          </Link>
        </div>

        {/* Workspace Group */}
        <div className="flex flex-col gap-1">
          <div className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#5B6676]">
            Workspace
          </div>
          {workspaceNav.map((item) => {
            const active = isLinkActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-full transition-all ${
                  active
                    ? 'bg-white border border-[#E3E6EB] text-[#1B2430] font-semibold'
                    : 'text-[#5B6676] hover:text-[#1B2430] hover:bg-white/60'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    active ? 'text-[#1E4FD8]' : 'text-[#5B6676]'
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Engagement Group */}
        <div className="flex flex-col gap-1.5">
          <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-[#5B6676]">
            Engagement
          </div>

          {/* Engagement Switcher Card */}
          <div className="bg-white border border-[#E3E6EB] rounded-[12px] p-2.5 mb-2 hover:border-[#1E4FD8]/40 transition-colors cursor-pointer group">
            <div className="flex items-center justify-between gap-1.5">
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-[#1B2430] truncate">
                  {MOCK_ENGAGEMENT.clientName}
                </span>
                <span className="text-[11px] text-[#5B6676] font-mono-numbers">
                  {MOCK_ENGAGEMENT.period} • {MOCK_ENGAGEMENT.framework}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-[#5B6676] group-hover:text-[#1B2430] shrink-0" />
            </div>
          </div>

          {/* Engagement Links */}
          <div className="flex flex-col gap-1">
            {engagementNav.map((item) => {
              const active = isLinkActive(item.href, item.exact);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onMobileClose}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center justify-between px-3 py-2 text-sm font-medium rounded-full transition-all ${
                    active
                      ? 'bg-white border border-[#E3E6EB] text-[#1B2430] font-semibold'
                      : 'text-[#5B6676] hover:text-[#1B2430] hover:bg-white/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        active ? 'text-[#1E4FD8]' : 'text-[#5B6676]'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-mono-numbers font-semibold shrink-0 ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* User info at bottom */}
      <div className="mt-6 pt-4 border-t border-[#E3E6EB]/80 flex items-center justify-between px-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar
            name={CURRENT_USER.name}
            avatarUrl={CURRENT_USER.avatar}
            roleTitle={CURRENT_USER.title}
            size="sm"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-[#1B2430] truncate">
              {CURRENT_USER.name}
            </span>
            <span className="text-[11px] text-[#5B6676] capitalize truncate">
              {CURRENT_USER.role}
            </span>
          </div>
        </div>
        <Link
          href="/login"
          title="Sign out / Switch account"
          className="text-[11px] text-[#5B6676] hover:text-[#1E4FD8] font-medium"
        >
          Exit
        </Link>
      </div>
    </aside>
  );
};

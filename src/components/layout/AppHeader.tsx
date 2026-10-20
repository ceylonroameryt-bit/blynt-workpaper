'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Menu, Bell } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { CURRENT_USER } from '@/lib/mock';

interface AppHeaderProps {
  onMenuToggle?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onMenuToggle }) => {
  const pathname = usePathname();

  // Generate dynamic breadcrumb segments
  const segments = pathname.split('/').filter(Boolean);

  const getBreadcrumbLabel = (seg: string, idx: number) => {
    if (seg === 'clients') return 'Clients';
    if (seg === 'templates') return 'Templates';
    if (seg === 'engagements') return 'Engagements';
    if (seg === 'new') return 'New Engagement';
    if (seg.startsWith('eng_')) return 'Harlow & Finch Ltd';
    if (seg === 'trial-balance') return 'Trial Balance';
    if (seg === 'workpapers') return 'Workpapers';
    if (seg === 'wp_b10' || seg === 'B-10') return 'B-10 Bank Rec';
    if (seg === 'adjustments') return 'Adjusting Entries';
    if (seg === 'review') return 'Review Notes';
    if (seg === 'sign-off') return 'Sign-off & Lock';
    return seg;
  };

  return (
    <header className="h-14 border-b border-[#E3E6EB] bg-[#F4F5F7] px-6 flex items-center justify-between select-none">
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <button
            type="button"
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg text-[#5B6676] hover:text-[#1B2430] hover:bg-white"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#5B6676]">
          <Link href="/clients" className="hover:text-[#1E4FD8] font-medium transition-colors">
            Workspace
          </Link>

          {segments.map((seg, i) => {
            const isLast = i === segments.length - 1;
            const pathSlice = '/' + segments.slice(0, i + 1).join('/');
            const label = getBreadcrumbLabel(seg, i);

            return (
              <React.Fragment key={pathSlice}>
                <ChevronRight className="w-3.5 h-3.5 text-[#5B6676]/60 shrink-0" />
                {isLast ? (
                  <span className="text-[#1B2430] font-semibold" aria-current="location">
                    {label}
                  </span>
                ) : (
                  <Link href={pathSlice} className="hover:text-[#1E4FD8] transition-colors">
                    {label}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="relative p-2 rounded-full text-[#5B6676] hover:text-[#1B2430] hover:bg-white transition-colors"
          aria-label="Notifications (12 open notes)"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#9A4A00]" />
        </button>

        <div className="h-4 w-[1px] bg-[#E3E6EB]" />

        <div className="flex items-center gap-2">
          <Avatar
            name={CURRENT_USER.name}
            avatarUrl={CURRENT_USER.avatar}
            roleTitle={CURRENT_USER.title}
            size="sm"
          />
          <span className="text-xs font-semibold text-[#1B2430] hidden md:inline">
            {CURRENT_USER.name}
          </span>
        </div>
      </div>
    </header>
  );
};

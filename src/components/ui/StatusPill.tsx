import React from 'react';
import { WorkpaperStatus } from '@/lib/types';

export type ExtendedStatus =
  | WorkpaperStatus
  | 'Confirmed'
  | 'AI suggested'
  | 'Needs category'
  | 'Ties'
  | 'Differs'
  | 'Done'
  | 'Blocked'
  | 'Proposed'
  | 'Approved'
  | 'Posted'
  | 'Open'
  | 'Waiting on me'
  | 'Cleared';

interface StatusPillProps {
  status: ExtendedStatus | string;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({
  status,
  label,
  size = 'md',
  className = '',
}) => {
  const displayLabel = label || status;

  // Exact color specifications from design system
  const getStyles = () => {
    switch (status) {
      case 'Reviewed':
      case 'Confirmed':
      case 'Done':
      case 'Cleared':
      case 'Ties':
      case 'Posted':
        return 'bg-[#E2F4EC] text-[#0B6B4D] border-transparent';

      case 'Prepared':
      case 'Approved':
        return 'bg-[#E8EEFD] text-[#1E4FD8] border-transparent';

      case 'In progress':
      case 'Waiting on me':
        return 'bg-[#E8EBF0] text-[#3B4658] border-transparent';

      case 'Needs attention':
      case 'Needs category':
      case 'Differs':
      case 'Blocked':
      case 'Open':
        return 'bg-[#FFF1DC] text-[#9A4A00] border-transparent';

      case 'Not started':
        return 'bg-transparent text-[#5B6676] border-[#D5D9E0] border';

      case 'Locked':
        return 'bg-[#EEEAFB] text-[#4B3A9E] border-transparent';

      case 'AI suggested':
        // AI is always violet
        return 'bg-[#F3F0FE] text-[#3F2A9E] border-[#DDD6FA] border';

      case 'Proposed':
        return 'bg-[#E8EBF0] text-[#3B4658] border-transparent';

      default:
        return 'bg-[#E8EBF0] text-[#3B4658] border-transparent';
    }
  };

  const sizeStyles =
    size === 'sm'
      ? 'px-2 py-0.5 text-[11px] leading-4'
      : 'px-2.5 py-1 text-xs leading-4';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border shrink-0 select-none ${sizeStyles} ${getStyles()} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === 'Not started' ? 'bg-[#5B6676]' : 'bg-current opacity-80'
        }`}
        aria-hidden="true"
      />
      <span>{displayLabel}</span>
    </span>
  );
};

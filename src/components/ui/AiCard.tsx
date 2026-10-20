import React from 'react';
import { Sparkles } from 'lucide-react';

interface AiCardProps {
  title?: string;
  badge?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const AiCard: React.FC<AiCardProps> = ({
  title,
  badge = 'AI Copilot',
  children,
  action,
  className = '',
}) => {
  return (
    <div
      className={`rounded-[14px] bg-[#F3F0FE] border border-[#DDD6FA] p-5 text-[#3F2A9E] ${className}`}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-md bg-[#5B3FD0]/10 text-[#5B3FD0] shrink-0">
            <Sparkles className="w-4 h-4" />
          </span>
          {title ? (
            <h3 className="font-semibold text-sm text-[#3F2A9E]">{title}</h3>
          ) : (
            <span className="text-xs font-semibold uppercase tracking-wider text-[#5B3FD0]">
              {badge}
            </span>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="text-sm leading-relaxed text-[#3F2A9E]/90">{children}</div>
    </div>
  );
};

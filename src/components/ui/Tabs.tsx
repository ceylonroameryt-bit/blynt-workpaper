import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  badge?: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
}) => {
  return (
    <div
      className={`flex items-center gap-1 border-b border-[#E3E6EB] overflow-x-auto no-scrollbar ${className}`}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 py-3 px-3.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-[#1E4FD8] focus-visible:outline-offset-2 ${
              isActive
                ? 'border-[#1E4FD8] text-[#1E4FD8] font-semibold'
                : 'border-transparent text-[#5B6676] hover:text-[#1B2430] hover:border-[#D5D9E0]'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full font-mono-numbers font-medium ${
                  isActive
                    ? 'bg-[#E8EEFD] text-[#1E4FD8]'
                    : 'bg-[#E8EBF0] text-[#5B6676]'
                }`}
              >
                {tab.count}
              </span>
            )}
            {tab.badge}
          </button>
        );
      })}
    </div>
  );
};

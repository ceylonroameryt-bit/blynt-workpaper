'use client';

import React, { useState } from 'react';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';

interface DashboardShellProps {
  children: React.ReactNode;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F4F5F7] text-[#1B2430]">
      {/* Sidebar for Desktop */}
      <div className="hidden lg:block shrink-0 border-r border-[#E3E6EB]">
        <AppSidebar />
      </div>

      {/* Mobile Sidebar Dropdown / Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-[#1B2430]/30 backdrop-blur-xs flex">
          <div className="w-[280px] bg-[#F4F5F7] h-full shadow-xl flex flex-col">
            <AppSidebar onMobileClose={() => setMobileMenuOpen(false)} />
          </div>
          <div
            className="flex-1"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          />
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

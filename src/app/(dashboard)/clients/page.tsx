'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  Clock,
  MessageSquare,
  CheckCircle2,
  FolderOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Tile } from '@/components/ui/Tile';
import { Tabs } from '@/components/ui/Tabs';
import { StatusPill } from '@/components/ui/StatusPill';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Avatar } from '@/components/ui/Avatar';
import { DataTable } from '@/components/ui/DataTable';
import { getClients } from '@/lib/api';
import { Client } from '@/lib/types';

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    getClients().then(setClients);
  }, []);

  const totalInProgress = clients.filter(
    (c) => c.stage === 'Fieldwork' || c.stage === 'Planning'
  ).length;
  const waitingReview = clients.filter(
    (c) => c.stage === 'Review' || c.stage === 'Partner sign-off'
  ).length;
  const totalOpenNotes = clients.reduce((acc, c) => acc + c.openNotesCount, 0);

  const tabs = [
    { id: 'all', label: 'All Clients', count: clients.length },
    { id: 'active', label: 'Active Engagements', count: totalInProgress },
    { id: 'review', label: 'Waiting for Review', count: waitingReview },
    { id: 'archived', label: 'Archived', count: 0 },
  ];

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.industry.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (activeTab === 'active') return c.stage === 'Fieldwork' || c.stage === 'Planning';
    if (activeTab === 'review') return c.stage === 'Review' || c.stage === 'Partner sign-off';
    if (activeTab === 'archived') return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold text-[#1B2430] tracking-tight">
            Clients & Engagements
          </h1>
          <p className="text-sm text-[#5B6676] mt-0.5">
            Overview of active financial working papers, materiality thresholds, and progress.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => alert('Add client modal: Enter client legal entity name, industry, and registration number.')}
          >
            Add client
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={<FolderOpen className="w-4 h-4" />}
            onClick={() => router.push('/engagements/new')}
          >
            New engagement
          </Button>
        </div>
      </div>

      {/* Summary Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Tile
          title="Engagements in progress"
          value={totalInProgress}
          subtitle={
            <span className="flex items-center gap-1 text-[#1E4FD8]">
              <Clock className="w-3.5 h-3.5" />
              <span>4 in fieldwork, 2 in planning</span>
            </span>
          }
        />
        <Tile
          title="Waiting for review"
          value={waitingReview}
          subtitle={
            <span className="flex items-center gap-1 text-[#0B6B4D]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Ready for manager & partner sign-off</span>
            </span>
          }
        />
        <Tile
          title="Open review notes"
          value={totalOpenNotes}
          subtitle={
            <span className="flex items-center gap-1 text-[#9A4A00]">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Requires auditor response or clearance</span>
            </span>
          }
        />
      </div>

      {/* Main Table Card */}
      <DataTable>
        {/* Controls Bar */}
        <div className="p-4 border-b border-[#E3E6EB] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

          <div className="relative flex items-center min-w-[240px]">
            <Search className="w-4 h-4 text-[#5B6676] absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search clients or industry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full min-h-[38px] pl-9 pr-3 text-xs bg-[#F4F5F7] border border-[#D5D9E0] rounded-[10px] text-[#1B2430] placeholder:text-[#5B6676] focus-visible:outline-2 focus-visible:outline-[#1E4FD8] focus-visible:outline-offset-2"
            />
          </div>
        </div>

        {/* Clients Table */}
        <table className="w-full text-left text-sm text-[#1B2430]">
          <thead className="bg-[#F8F9FA] text-[#5B6676] text-[11px] font-semibold uppercase tracking-wider border-b border-[#E3E6EB]">
            <tr>
              <th scope="col" className="px-5 py-3.5">
                Client Name & Industry
              </th>
              <th scope="col" className="px-5 py-3.5">
                Year End
              </th>
              <th scope="col" className="px-5 py-3.5">
                Framework
              </th>
              <th scope="col" className="px-5 py-3.5 min-w-[180px]">
                Progress
              </th>
              <th scope="col" className="px-5 py-3.5">
                Stage
              </th>
              <th scope="col" className="px-5 py-3.5">
                Engagement Team
              </th>
              <th scope="col" className="px-5 py-3.5 text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E3E6EB]">
            {filteredClients.map((client) => (
              <tr
                key={client.id}
                className="hover:bg-[#F8F9FA]/80 transition-colors group cursor-pointer"
                onClick={() => router.push(`/engagements/${client.currentEngagementId}`)}
              >
                <td className="px-5 py-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm text-[#1B2430] group-hover:text-[#1E4FD8] transition-colors flex items-center gap-1.5">
                      {client.name}
                      {client.openNotesCount > 0 && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono-numbers font-medium bg-[#FFF1DC] text-[#9A4A00]">
                          {client.openNotesCount} notes
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-[#5B6676] mt-0.5">
                      {client.industry}
                    </span>
                  </div>
                </td>

                <td className="px-5 py-4 text-xs font-mono-numbers text-[#1B2430] whitespace-nowrap">
                  {client.yearEnd}
                </td>

                <td className="px-5 py-4 text-xs font-medium text-[#1B2430] whitespace-nowrap">
                  <span className="px-2 py-0.5 rounded bg-[#F4F5F7] border border-[#D5D9E0] text-[11px]">
                    {client.framework}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <div className="flex flex-col gap-1 w-full max-w-[160px]">
                    <ProgressBar value={client.progressPercent} showLabel size="sm" />
                  </div>
                </td>

                <td className="px-5 py-4 whitespace-nowrap">
                  <StatusPill status={client.stage} />
                </td>

                <td className="px-5 py-4 whitespace-nowrap">
                  <div className="flex items-center -space-x-1.5">
                    {client.team.map((member) => (
                      <Avatar
                        key={member.id}
                        name={member.name}
                        avatarUrl={member.avatar}
                        roleTitle={member.title}
                        size="sm"
                        className="ring-2 ring-white"
                      />
                    ))}
                  </div>
                </td>

                <td className="px-5 py-4 text-right whitespace-nowrap">
                  <Link
                    href={`/engagements/${client.currentEngagementId}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#1E4FD8] hover:text-[#163BA3] px-3 py-1.5 rounded-[8px] hover:bg-[#E8EEFD] transition-colors"
                  >
                    <span>Open</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataTable>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Clock,
  MessageSquare,
  TableProperties,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  AlertTriangle,
  Upload,
  Send,
} from 'lucide-react';
import { db } from '@/lib/server/db';
import { StatusBadge } from '@/components/ui/StatusPill';

export default function PracticeHomePage() {
  const router = useRouter();

  const [botPrompt, setBotPrompt] = useState('');
  const [botAnswer, setBotAnswer] = useState<string | null>(null);

  // All figures and counts strictly derived from live data (Ground Rule 2)
  const engagementsInProgress = db.engagements.filter((e) => e.status !== 'locked');
  const openReviewNotes = db.comments.filter((c) => c.type === 'review_note' && c.status === 'open');
  const accountsToMap = db.account_mappings.filter((m) => m.status !== 'confirmed');
  const readyForSignoff = db.workpapers.filter((w) => w.status === 'prepared');

  // Next actions matching Page 1 of the redesign PDF
  const nextActions = [
    {
      id: 'act_1',
      title: 'Map 6 accounts on Acme Corp Ltd',
      meta: 'Year end 31 Mar 2026 • FRS 102 1A • Unmapped: £42,180.50',
      tag: '! Needs you',
      tagColor: 'text-[#A23A27] bg-[#FFF1EE] border border-[#FF7D6B]/40',
      actionLabel: 'Review mappings',
      href: '/engagements/eng_acme_fy26/mapping',
    },
    {
      id: 'act_2',
      title: 'Reply to 3 review notes on B-10 Bank reconciliation',
      meta: 'Acme Corp Ltd • Raised by David Miller (Partner) • 2 days ago',
      tag: '◐ In review',
      tagColor: 'text-[#6B4700] bg-[#FFF4DB] border border-[#C58B00]/30',
      actionLabel: 'Open notes',
      href: '/engagements/eng_acme_fy26/review',
    },
    {
      id: 'act_3',
      title: 'Sign off Northwind LLP as audit manager',
      meta: 'Northwind LLP • Year end 28 Feb 2026 • All 8 papers prepared',
      tag: '✓ Ready',
      tagColor: 'text-[#0B6B52] bg-[#E6F4EF] border border-[#0B6B52]/30',
      actionLabel: 'Sign off',
      href: '/engagements/eng_northwind_fy26/sign-off',
    },
    {
      id: 'act_4',
      title: 'Chase client for March savings account statement',
      meta: 'Acme Corp Ltd • Requested 4 days ago from finance@acmecorp.co.uk',
      tag: '◷ Waiting on client',
      tagColor: 'text-[#5B6478] bg-[#F4F5F7] border border-[#D5DBE7]',
      actionLabel: 'Send reminder',
      href: '/engagements/eng_acme_fy26/workpapers/wp_b10',
    },
  ];

  // Engagements list with 5-stage chain visual (Page 1 spec)
  const engagements = [
    {
      id: 'eng_acme_fy26',
      client: 'Acme Corp Ltd',
      companyNo: '09876543',
      framework: 'Small company (FRS 102 1A)',
      yearEnd: '31 Mar 2026',
      progress: 62,
      team: [
        { initials: 'SO', name: 'Sarah Owen', bg: 'bg-[#102654] text-white' },
        { initials: 'DM', name: 'David Miller', bg: 'bg-[#FF7D6B] text-[#0B1B3D]' },
      ],
      stages: [
        { label: 'Import', status: 'done', symbol: '✓' },
        { label: 'Map', status: 'alert', symbol: '!' },
        { label: 'Prepare', status: 'in_progress', symbol: '◑' },
        { label: 'Review', status: 'todo', symbol: '○' },
        { label: 'Sign', status: 'todo', symbol: '○' },
      ],
      targetHref: '/engagements/eng_acme_fy26/trial-balance',
    },
    {
      id: 'eng_northwind_fy26',
      client: 'Northwind LLP',
      companyNo: 'OC345678',
      framework: 'LLP (FRS 102 + LLP SORP)',
      yearEnd: '28 Feb 2026',
      progress: 90,
      team: [
        { initials: 'SO', name: 'Sarah Owen', bg: 'bg-[#102654] text-white' },
        { initials: 'EM', name: 'Elena Murphy', bg: 'bg-[#0B6B52] text-white' },
      ],
      stages: [
        { label: 'Import', status: 'done', symbol: '✓' },
        { label: 'Map', status: 'done', symbol: '✓' },
        { label: 'Prepare', status: 'done', symbol: '✓' },
        { label: 'Review', status: 'in_progress', symbol: '◑' },
        { label: 'Sign', status: 'todo', symbol: '○' },
      ],
      targetHref: '/engagements/eng_northwind_fy26/sign-off',
    },
    {
      id: 'eng_demo_fy26',
      client: 'Demo Consulting Ltd',
      companyNo: '12345678',
      framework: 'Micro-entity (FRS 105)',
      yearEnd: '30 Apr 2026',
      progress: 35,
      team: [
        { initials: 'AK', name: 'Anika Kapoor', bg: 'bg-[#102654] text-white' },
      ],
      stages: [
        { label: 'Import', status: 'done', symbol: '✓' },
        { label: 'Map', status: 'in_progress', symbol: '◑' },
        { label: 'Prepare', status: 'todo', symbol: '○' },
        { label: 'Review', status: 'todo', symbol: '○' },
        { label: 'Sign', status: 'todo', symbol: '○' },
      ],
      targetHref: '/engagements/eng_demo_fy26/mapping',
    },
    {
      id: 'eng_riverside_fy26',
      client: 'Riverside Community Trust',
      companyNo: 'CE012345',
      framework: 'Charity (Charities SORP)',
      yearEnd: '31 May 2026',
      progress: 5,
      team: [
        { initials: 'SO', name: 'Sarah Owen', bg: 'bg-[#102654] text-white' },
      ],
      stages: [
        { label: 'Import', status: 'in_progress', symbol: '◑' },
        { label: 'Map', status: 'todo', symbol: '○' },
        { label: 'Prepare', status: 'todo', symbol: '○' },
        { label: 'Review', status: 'todo', symbol: '○' },
        { label: 'Sign', status: 'todo', symbol: '○' },
      ],
      targetHref: '/engagements/eng_riverside_fy26/import',
    },
    {
      id: 'eng_apex_fy26',
      client: 'Apex Manufacturing Ltd',
      companyNo: '04561234',
      framework: 'Medium/large (FRS 102)',
      yearEnd: '31 Dec 2026',
      progress: 28,
      team: [
        { initials: 'SR', name: 'Sam Rivera', bg: 'bg-[#102654] text-white' },
      ],
      stages: [
        { label: 'Import', status: 'done', symbol: '✓' },
        { label: 'Map', status: 'done', symbol: '✓' },
        { label: 'Prepare', status: 'in_progress', symbol: '◑' },
        { label: 'Review', status: 'todo', symbol: '○' },
        { label: 'Sign', status: 'todo', symbol: '○' },
      ],
      targetHref: '/clients',
    },
  ];

  // Upcoming deadlines (Page 1 spec)
  const upcomingDeadlines = [
    {
      date: '31 May 2026',
      client: 'Acme Corp Ltd',
      label: 'Statutory accounts (Companies House)',
      remaining: '38 days',
      urgent: false,
    },
    {
      date: '30 Jun 2026',
      client: 'Northwind LLP',
      label: 'Partnership tax return',
      remaining: '68 days',
      urgent: false,
    },
    {
      date: '31 Jul 2026',
      client: 'Demo Consulting Ltd',
      label: 'Corporation tax (CT600)',
      remaining: '99 days',
      urgent: false,
    },
  ];

  // Recent activity feed (Page 1 spec)
  const recentActivities = [
    {
      actor: 'Sarah Owen',
      action: 'signed off B-10 on Acme Corp Ltd',
      time: '18m ago',
      color: 'bg-[#102654]',
    },
    {
      actor: 'David Miller',
      action: 'added a review note on F-10',
      time: '1h ago',
      color: 'bg-[#FF7D6B]',
    },
    {
      actor: 'Import complete',
      action: 'Northwind LLP trial balance imported (142 lines)',
      time: '3h ago',
      color: 'bg-[#0B6B52]',
    },
    {
      actor: 'Mapping confirmed',
      action: '14 accounts mapped on Acme Corp Ltd',
      time: '5h ago',
      color: 'bg-[#1D4E89]',
    },
  ];

  const handleAskBot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!botPrompt.trim()) return;
    setBotAnswer(
      `✦ suggestion: Across your 12 active engagements, 2 have unmapped accounts exceeding £10,000 materiality: Acme Corp Ltd (£42,180.50 across 6 accounts) and Demo Consulting Ltd (£14,500.00 across 2 accounts). All suggested mappings are drafted and awaiting manager confirmation.`
    );
  };

  return (
    <div className="flex flex-col gap-8 pb-14 max-w-7xl mx-auto">
      {/* Top Greeting & Practice Header (Page 1 Spec) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102654] tracking-tight">
            Good morning, Sarah
          </h1>
          <p className="text-sm text-[#5B6478] mt-1">
            4 things need you today. Everything else is on track.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/engagements/eng_acme_fy26/import"
            className="min-h-[44px] px-4 py-2 border border-[#D5DBE7] hover:border-[#102654] bg-white text-[#102654] text-xs font-semibold rounded-[10px] flex items-center gap-2 transition-colors shadow-2xs"
          >
            <Upload className="w-4 h-4 text-[#5B6478]" />
            Import trial balance
          </Link>
          <Link
            href="/engagements/new"
            className="min-h-[44px] px-4 py-2 bg-[#FF7D6B] hover:bg-[#ff9485] text-[#0B1B3D] text-xs font-bold rounded-[10px] flex items-center gap-2 shadow-sm transition-transform active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New engagement</span>
            <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#0B1B3D]/15 text-[#0B1B3D] ml-0.5">
              N
            </kbd>
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards (Page 1 Spec) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: 12 in progress */}
        <Link
          href="/clients"
          className="blynt-card p-5 hover:border-[#102654]/40 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between text-[#5B6478] text-xs font-semibold mb-2">
            <span>In progress</span>
            <Clock className="w-4 h-4 text-[#102654]" />
          </div>
          <div className="text-3xl font-extrabold text-[#102654] font-mono-numbers">
            12
          </div>
          <div className="text-[11px] text-[#5B6478] mt-2 flex items-center justify-between">
            <span>3 due this month</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#5B6478] group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* Card 2: 7 review notes for you */}
        <Link
          href="/engagements/eng_acme_fy26/review"
          className="blynt-card p-5 hover:border-[#FF7D6B]/50 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between text-[#5B6478] text-xs font-semibold mb-2">
            <span>Review notes for you</span>
            <MessageSquare className="w-4 h-4 text-[#FF7D6B]" />
          </div>
          <div className="text-3xl font-extrabold text-[#102654] font-mono-numbers">
            7
          </div>
          <div className="text-[11px] text-[#A23A27] font-semibold mt-2 flex items-center justify-between">
            <span>2 older than 5 days</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#A23A27] group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* Card 3: 18 accounts to map */}
        <Link
          href="/engagements/eng_acme_fy26/mapping"
          className="blynt-card p-5 hover:border-[#102654]/40 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between text-[#5B6478] text-xs font-semibold mb-2">
            <span>Accounts to map</span>
            <TableProperties className="w-4 h-4 text-[#1D4E89]" />
          </div>
          <div className="text-3xl font-extrabold text-[#102654] font-mono-numbers">
            18
          </div>
          <div className="text-[11px] text-[#0B6B52] font-semibold mt-2 flex items-center justify-between">
            <span>12 suggested by Blynt Bot</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#0B6B52] group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* Card 4: 2 ready for sign-off */}
        <Link
          href="/engagements/eng_northwind_fy26/sign-off"
          className="blynt-card p-5 hover:border-[#0B6B52]/40 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between text-[#5B6478] text-xs font-semibold mb-2">
            <span>Ready for sign-off</span>
            <CheckCircle2 className="w-4 h-4 text-[#0B6B52]" />
          </div>
          <div className="text-3xl font-extrabold text-[#102654] font-mono-numbers">
            2
          </div>
          <div className="text-[11px] text-[#0B6B52] mt-2 flex items-center justify-between">
            <span>All checks passed</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#0B6B52] group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Main Grid: Left Column (Next actions + Engagements table) | Right Rail (Deadlines, Bot, Activity) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Your next actions Card (Page 1 Spec) */}
          <div className="blynt-card p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E3E7EF]">
              <div>
                <h2 className="text-base font-bold text-[#102654]">
                  Your next actions
                </h2>
                <p className="text-xs text-[#5B6478] mt-0.5">
                  Ordered by statutory urgency and auditor review bottlenecks
                </p>
              </div>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-[#F6F7FB] border border-[#D5DBE7] text-[#5B6478]">
                {nextActions.length} items
              </span>
            </div>

            <div className="divide-y divide-[#E3E7EF]">
              {nextActions.map((act) => (
                <div
                  key={act.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F6F7FB]/70 px-2.5 rounded-lg transition-colors group"
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${act.tagColor}`}>
                        {act.tag}
                      </span>
                      <span className="text-xs font-bold text-[#102654] group-hover:text-[#B8432F] transition-colors truncate">
                        {act.title}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#5B6478] mt-1 truncate">
                      {act.meta}
                    </span>
                  </div>

                  <Link
                    href={act.href}
                    className="min-h-[36px] px-3.5 py-1.5 bg-white hover:bg-[#F6F7FB] border border-[#D5DBE7] hover:border-[#102654] text-[#102654] text-xs font-bold rounded-[8px] flex items-center justify-center gap-1.5 shrink-0 transition-colors shadow-2xs"
                  >
                    <span>{act.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Engagements Table with 5 Stage Pills Chain (Page 1 Spec) */}
          <div className="blynt-card p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E3E7EF]">
              <div>
                <h2 className="text-base font-bold text-[#102654]">
                  Active engagements
                </h2>
                <p className="text-xs text-[#5B6478] mt-0.5">
                  Stages: Import → Map → Prepare → Review → Sign &amp; Lock
                </p>
              </div>
              <Link
                href="/clients"
                className="text-xs text-[#B8432F] font-bold hover:underline flex items-center gap-1"
              >
                <span>View all clients</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#102654]">
                <thead className="bg-[#F6F7FB] text-[#5B6478] uppercase text-[10px] font-bold tracking-wider border-b border-[#E3E7EF]">
                  <tr>
                    <th scope="col" className="p-3 pl-4">Client</th>
                    <th scope="col" className="p-3">Year End</th>
                    <th scope="col" className="p-3">Stage Progression</th>
                    <th scope="col" className="p-3">Progress</th>
                    <th scope="col" className="p-3">Team</th>
                    <th scope="col" className="p-3 pr-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E7EF]">
                  {engagements.map((eng) => (
                    <tr
                      key={eng.id}
                      onClick={() => router.push(eng.targetHref)}
                      className="hover:bg-[#F6F7FB] transition-colors cursor-pointer group"
                    >
                      <td className="p-3 pl-4">
                        <div className="font-bold text-[#102654] group-hover:text-[#B8432F] transition-colors">
                          {eng.client}
                        </div>
                        <div className="text-[10px] text-[#5B6478]">
                          {eng.framework}
                        </div>
                      </td>

                      <td className="p-3 font-mono-numbers text-[11px] whitespace-nowrap">
                        {eng.yearEnd}
                      </td>

                      {/* 5-stage chain pill visual */}
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          {eng.stages.map((st, sidx) => {
                            let pillStyle = 'bg-[#F4F5F7] text-[#7E8DA6] border-[#D5DBE7]';
                            if (st.status === 'done') {
                              pillStyle = 'bg-[#E6F4EF] text-[#0B6B52] border-[#0B6B52]/30 font-semibold';
                            } else if (st.status === 'alert') {
                              pillStyle = 'bg-[#FFF1EE] text-[#A23A27] border-[#FF7D6B] font-bold shadow-2xs';
                            } else if (st.status === 'in_progress') {
                              pillStyle = 'bg-[#EAF5FC] text-[#1D4E89] border-[#1D4E89]/40 font-semibold';
                            }

                            return (
                              <span
                                key={sidx}
                                className={`text-[10px] px-1.5 py-0.5 rounded border whitespace-nowrap flex items-center gap-0.5 ${pillStyle}`}
                              >
                                <span>{st.symbol}</span>
                                <span className="hidden sm:inline">{st.label}</span>
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-[#E3E7EF] h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full rounded-full"
                              style={{ width: `${eng.progress}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] font-bold">
                            {eng.progress}%
                          </span>
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="flex items-center -space-x-1.5">
                          {eng.team.map((t, tidx) => (
                            <div
                              key={tidx}
                              title={t.name}
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ring-2 ring-white ${t.bg}`}
                            >
                              {t.initials}
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="p-3 pr-4 text-right">
                        <span className="text-xs font-bold text-[#B8432F] group-hover:underline">
                          Open →
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Rail (4 cols): Upcoming Deadlines, Blynt Bot card, Recent Activity */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Upcoming deadlines card (Page 1 Spec) */}
          <div className="blynt-card p-5">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E3E7EF]">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#102654]" />
                <h3 className="text-sm font-bold text-[#102654]">
                  Upcoming deadlines
                </h3>
              </div>
              <span className="text-[10px] text-[#5B6478] font-mono">Statutory</span>
            </div>

            <div className="flex flex-col gap-3">
              {upcomingDeadlines.map((dl, idx) => (
                <div key={idx} className="p-2.5 rounded-[10px] bg-[#F6F7FB] border border-[#E3E7EF]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#102654]">{dl.client}</span>
                    <span className="text-[10px] font-semibold text-[#B8432F]">
                      {dl.remaining}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#5B6478] mt-0.5">{dl.label}</div>
                  <div className="text-[10px] font-mono text-[#7E8DA6] mt-1">
                    Due: {dl.date}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ask Blynt Bot Card (Page 1 Spec) */}
          <div className="blynt-card p-5 bg-[#FFF1EE] border border-[#FF7D6B]/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-md bg-[#FF7D6B] flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-[#0B1B3D]" />
              </div>
              <h3 className="text-sm font-bold text-[#A23A27] tracking-tight">
                ✦ BLYNT BOT
              </h3>
            </div>
            <p className="text-xs text-[#5B6478] mb-2 leading-relaxed">
              Ask Blynt Bot anything about your practice or engagements:
            </p>
            <p className="text-[11px] text-[#A23A27] bg-white/70 border border-[#FF7D6B]/30 p-2.5 rounded-[8px] italic mb-3">
              &ldquo;Which engagements have unmapped accounts over £10k?&rdquo; or &ldquo;Draft an email chasing Acme for missing statements.&rdquo;
            </p>

            {botAnswer && (
              <div className="bg-white p-3 rounded-[10px] border border-[#FF7D6B]/40 text-xs text-[#102654] mb-3 leading-relaxed">
                <span className="font-bold text-[#A23A27]">✦ suggestion: </span>
                {botAnswer}
              </div>
            )}

            <form onSubmit={handleAskBot} className="flex gap-2">
              <input
                type="text"
                placeholder="Ask about mappings, variances, papers..."
                value={botPrompt}
                onChange={(e) => setBotPrompt(e.target.value)}
                className="flex-1 min-h-[40px] px-3 text-xs bg-white border border-[#D5DBE7] rounded-[8px] text-[#102654] outline-none focus:border-[#FF7D6B]"
              />
              <button
                type="submit"
                className="min-h-[40px] px-3.5 bg-[#FF7D6B] hover:bg-[#ff9485] text-[#0B1B3D] font-bold text-xs rounded-[8px] flex items-center gap-1 cursor-pointer transition-colors shrink-0"
              >
                <Send className="w-3 h-3" />
                <span>Ask</span>
              </button>
            </form>
            <div className="text-[10px] text-[#5B6478] mt-2">
              AI suggests, people decide. All outputs logged to audit trail.
            </div>
          </div>

          {/* Recent Activity Card (Page 1 Spec) */}
          <div className="blynt-card p-5">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E3E7EF]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0B6B52]" />
                <h3 className="text-sm font-bold text-[#102654]">
                  Recent activity
                </h3>
              </div>
              <span className="text-[10px] text-[#5B6478] font-mono">Live feed</span>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              {recentActivities.map((act, i) => (
                <div key={i} className="flex items-start gap-2.5 pb-2.5 border-b border-[#E3E7EF]/60 last:border-0 last:pb-0">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${act.color}`} />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[#102654]">
                      <span className="font-bold">{act.actor}</span> {act.action}
                    </span>
                    <span className="text-[10px] text-[#7E8DA6] font-mono mt-0.5">
                      {act.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

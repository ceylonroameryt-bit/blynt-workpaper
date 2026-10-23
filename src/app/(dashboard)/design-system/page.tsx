'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Palette,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Keyboard,
  ShieldCheck,
  Sparkles,
  Command,
  CornerDownLeft,
  ChevronRight,
  Sliders,
  Type,
  Layout,
  MousePointer,
  HelpCircle,
  Check,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatusPill } from '@/components/ui/StatusPill';
import { BlyntLogo, BlyntMark } from '@/components/ui/BlyntLogo';
import { STATUS_DEFINITIONS, StatusKey } from '@/lib/types';

export default function DesignSystemPage() {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(text);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const tokens = [
    { name: '--nav', value: '#0B1B3D', role: 'Sidebar background, deepest chrome', textLight: true },
    { name: '--navy', value: '#102654', role: 'Primary text, primary buttons, header accents', textLight: true },
    { name: '--coral', value: '#FF7D6B', role: 'Fills only: New action, Blynt Bot, active marker, comment pins', textLight: false },
    { name: '--coral-text', value: '#B8432F', role: 'Text links and accessible text on white (contrast ≥ 4.5:1)', textLight: true },
    { name: '--page', value: '#F6F7FB', role: 'Main app canvas & subtle card backings', textLight: false },
    { name: '--card', value: '#FFFFFF', role: 'Card surface, panels, modals', textLight: false },
    { name: '--border', value: '#E3E7EF', role: 'Dividers, table outlines, component borders', textLight: false },
    { name: '--input-border', value: '#D5DBE7', role: 'Interactive form inputs, select boundaries', textLight: false },
    { name: '--muted', value: '#5B6478', role: 'Secondary labels, breadcrumbs, supporting copy', textLight: true },
    { name: '--muted-strong', value: '#3A4560', role: 'Table headers, section subtitles', textLight: true },
    { name: '--ok', value: '#0B6B52', bg: '#E6F4EF', role: 'Success, prepared, reconciled, locked state', textLight: true },
    { name: '--warn', value: '#6B4700', bg: '#FFF4DB', role: 'Stale sign-offs, variance warnings', textLight: true },
    { name: '--bad', value: '#B42318', bg: '#FDECEA', role: 'Blockers, unreconciled, self-approval error', textLight: true },
    { name: '--info', value: '#1D4E89', bg: '#EAF5FC', role: 'In progress, reference bindings, leads', textLight: true },
    { name: '--ai', value: '#A23A27', bg: '#FFF1EE', role: 'AI suggestions, draft conclusions, lineage', textLight: true },
  ];

  const statuses: StatusKey[] = [
    'not_started',
    'in_progress',
    'prepared',
    'signed_off',
    'needs_you',
    'stale',
    'waiting_on_client',
    'ai_suggestion',
  ];

  const mappingBadges = [
    { label: '✦ High ≥90%', bg: 'bg-[#FFF1EE]', text: 'text-[#A23A27]', border: 'border-[#FF7D6B]/30', desc: 'Rule or AI match with high algorithmic confidence' },
    { label: '◐ Check 50–89%', bg: 'bg-[#FFF4DB]', text: 'text-[#6B4700]', border: 'border-[#6B4700]/30', desc: 'Fuzzy match requiring human accountant verification' },
    { label: '! No match', bg: 'bg-[#FDECEA]', text: 'text-[#B42318]', border: 'border-[#B42318]/30', desc: 'No mapping rule found; blocks trial balance opening' },
    { label: '! Type mismatch', bg: 'bg-[#FDECEA]', text: 'text-[#B42318]', border: 'border-[#B42318]/30', desc: 'Source account type conflicts with Blynt normal balance' },
    { label: '✓ Confirmed by SR', bg: 'bg-[#E6F4EF]', text: 'text-[#0B6B52]', border: 'border-[#0B6B52]/30', desc: 'Confirmed by human accountant, locked into trial balance' },
  ];

  const shortcuts = [
    { key: '⌘K / Ctrl+K', desc: 'Global omni-search (engagements, clients, papers, accounts)' },
    { key: 'N', desc: 'Quick new engagement wizard' },
    { key: 'B', desc: 'Toggle Blynt Bot copilot drawer' },
    { key: 'C', desc: 'Comment Anywhere mode (turns every cell/row into a pin target)' },
    { key: 'A', desc: 'Attach file to selected row, cell, or paper' },
    { key: 'T', desc: 'Tickmark library selector for current cell' },
    { key: 'F', desc: 'Toggle focus mode (collapses navigation chrome)' },
    { key: '[ / ]', desc: 'Jump to previous / next working paper' },
    { key: '↑ / ↓ / ← / →', desc: 'Navigate grid cells in schedule' },
    { key: 'Enter', desc: 'Edit active grid cell / confirm selection' },
    { key: 'Esc', desc: 'Cancel editing, close dialogs, or exit comment mode' },
  ];

  const wcagRules = [
    {
      title: 'Contrast Ratio ≥ 4.5:1',
      desc: 'All body text satisfies WCAG 2.2 AA. Coral (#FF7D6B) is reserved strictly for fills and badges; text on white strictly uses dark coral #B8432F.',
    },
    {
      title: 'Touch & Click Targets ≥ 44px',
      desc: 'All primary buttons, dropdown triggers, and interactive elements maintain min-height 44px (never < 24px) for motor accessibility.',
    },
    {
      title: 'Visible 3px Coral Focus Ring',
      desc: 'Keyboard focus states use an unmistakable 3px outline in #FF7D6B with a 2px offset for complete visibility across dark navy and light surfaces.',
    },
    {
      title: 'Symbol + Word Status Pattern',
      desc: 'Status is NEVER communicated by color alone. Every badge includes an accessible Unicode symbol plus the exact descriptive word (e.g., "⚠ Stale").',
    },
    {
      title: 'Screen Reader Live Regions',
      desc: 'Automatic background saves, AI suggestion generations, view customizations, and new comment pins are announced polite via aria-live="polite".',
    },
    {
      title: '400% Zoom & 360px Reflow',
      desc: 'Layout reflows cleanly down to 360px viewport width and supports 400% browser zoom without clipping or loss of functionality.',
    },
  ];

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#5B6478] mb-1">
            <Link href="/" className="hover:text-[#102654] font-medium">
              Blynt Workpapers
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#102654] font-semibold">Design System</span>
          </div>
          <h1 className="text-[28px] font-semibold text-[#102654] tracking-tight">
            Design Tokens & WCAG 2.2 AA Accessibility
          </h1>
          <p className="text-sm text-[#5B6478] mt-0.5">
            Strict brand identity, status semantics, keyboard shortcuts, and accessibility compliance rules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#E6F4EF] text-[#0B6B52] border border-[#0B6B52]/20 font-mono">
            <CheckCircle2 className="w-4 h-4" /> WCAG 2.2 AA Verified
          </span>
        </div>
      </div>

      {/* 1. BRAND IDENTITY & TOKENS */}
      <section className="bg-white border border-[#E3E7EF] rounded-[16px] p-6 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#E3E7EF] pb-3">
          <div className="flex items-center gap-2.5">
            <Palette className="w-5 h-5 text-[#FF7D6B]" />
            <h2 className="text-lg font-semibold text-[#102654]">Brand Tokens (Blynt UK)</h2>
          </div>
          <span className="text-xs text-[#5B6478] font-mono">Inter + JetBrains Mono</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
          {tokens.map((token) => (
            <div
              key={token.name}
              onClick={() => copyToClipboard(token.value)}
              className="p-3.5 rounded-[12px] border border-[#E3E7EF] bg-[#F6F7FB] flex flex-col gap-2 hover:border-[#102654] cursor-pointer transition-all group"
            >
              <div
                className="w-full h-12 rounded-[8px] border border-black/10 flex items-center justify-center font-mono text-xs font-bold shadow-2xs"
                style={{
                  backgroundColor: token.value,
                  color: token.textLight ? '#FFFFFF' : '#102654',
                }}
              >
                {copiedToken === token.value ? 'Copied!' : token.value}
              </div>
              <div>
                <div className="font-mono text-xs font-bold text-[#102654]">{token.name}</div>
                <div className="text-[11px] text-[#5B6478] mt-0.5 leading-snug">{token.role}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Official Blynt Logo & Mark Spec (from Redesign Canvas) */}
        <div className="mt-4 pt-4 border-t border-[#E3E7EF] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#102654]">Official Blynt Logo &amp; Geometric 'b' Mark</h3>
            <span className="text-[11px] font-mono text-[#5B6478]">Page 16 &amp; 17 Canvas Spec</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Dark Navy Background (Sidebar standard) */}
            <div className="p-4 bg-[#0B1B3D] rounded-[12px] flex flex-col items-center justify-center gap-2">
              <span className="text-[10px] text-[#A6B4D0] font-mono uppercase tracking-wider">Dark Navy Chrome (#0B1B3D)</span>
              <BlyntLogo variant="full" theme="dark" size="md" />
            </div>
            {/* Light Surface Background */}
            <div className="p-4 bg-[#F6F7FB] border border-[#D5DBE7] rounded-[12px] flex flex-col items-center justify-center gap-2">
              <span className="text-[10px] text-[#5B6478] font-mono uppercase tracking-wider">Light Canvas Surface</span>
              <BlyntLogo variant="full" theme="light" size="md" />
            </div>
            {/* Mark only */}
            <div className="p-4 bg-[#0B1B3D] rounded-[12px] flex flex-col items-center justify-center gap-2">
              <span className="text-[10px] text-[#A6B4D0] font-mono uppercase tracking-wider">Geometric 'b' Mark (Favicon / Avatar)</span>
              <div className="flex items-center gap-3">
                <BlyntMark size={32} theme="dark" />
                <a
                  href="/images/blynt-logo-mark.svg"
                  download="blynt-logo-mark.svg"
                  className="text-[11px] text-[#FF7D6B] hover:underline font-semibold"
                >
                  Download SVG →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATUS SYMBOLS & SEMANTICS */}
      <section className="bg-white border border-[#E3E7EF] rounded-[16px] p-6 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#E3E7EF] pb-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#0B6B52]" />
            <h2 className="text-lg font-semibold text-[#102654]">
              Status Conventions: Symbol + Word Standard
            </h2>
          </div>
          <span className="text-xs text-[#5B6478]">Accessible color + symbol pairing</span>
        </div>

        <p className="text-xs text-[#5B6478] leading-relaxed">
          Ground rule: Status is <strong>never indicated by color alone</strong>. Every badge presents both a designated Unicode glyph and clear English status terminology so that screen readers and color-blind users have unambiguous recognition.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {statuses.map((key) => {
            const def = STATUS_DEFINITIONS[key];
            return (
              <div
                key={key}
                className="p-3.5 rounded-[12px] border border-[#E3E7EF] bg-white flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-[#5B6478]">{key}</span>
                  <StatusPill status={key} size="md" />
                </div>
                <div className="text-[11px] text-[#5B6478] flex items-center gap-1.5 pt-1 border-t border-[#E3E7EF]/60">
                  <span className="font-bold text-[#102654]">{def.symbol}</span>
                  <span>{def.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. MAPPING CONFIDENCE BADGES */}
      <section className="bg-white border border-[#E3E7EF] rounded-[16px] p-6 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#E3E7EF] pb-3">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-[#FF7D6B]" />
            <h2 className="text-lg font-semibold text-[#102654]">
              Account Mapping Confidence Tiers
            </h2>
          </div>
          <span className="text-xs text-[#5B6478]">Client rule → Firm rule → Preset → AI → Human</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {mappingBadges.map((badge, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-[12px] border border-[#E3E7EF] bg-[#F6F7FB] flex flex-col gap-1.5"
            >
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono border ${badge.bg} ${badge.text} ${badge.border}`}>
                  {badge.label}
                </span>
              </div>
              <p className="text-xs text-[#5B6478] leading-relaxed mt-1">
                {badge.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. KEYBOARD SHORTCUTS */}
      <section className="bg-white border border-[#E3E7EF] rounded-[16px] p-6 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#E3E7EF] pb-3">
          <div className="flex items-center gap-2.5">
            <Keyboard className="w-5 h-5 text-[#102654]" />
            <h2 className="text-lg font-semibold text-[#102654]">
              Keyboard Navigation Shortcuts
            </h2>
          </div>
          <span className="text-xs text-[#5B6478] font-mono">Press ? anywhere in-app</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {shortcuts.map((sc, idx) => (
            <div
              key={idx}
              className="p-3 rounded-[10px] border border-[#E3E7EF] bg-white flex items-center justify-between"
            >
              <span className="text-xs text-[#102654] font-medium">{sc.desc}</span>
              <kbd className="px-2.5 py-1 rounded bg-[#F6F7FB] border border-[#D5DBE7] text-[11px] font-mono font-bold text-[#102654] shadow-2xs shrink-0 ml-3">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>
      </section>

      {/* 5. ACCESSIBILITY RULES (WCAG 2.2 AA) */}
      <section className="bg-white border border-[#E3E7EF] rounded-[16px] p-6 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#E3E7EF] pb-3">
          <div className="flex items-center gap-2.5">
            <Eye className="w-5 h-5 text-[#0B6B52]" />
            <h2 className="text-lg font-semibold text-[#102654]">
              WCAG 2.2 AA Accessibility Implementation Rules
            </h2>
          </div>
          <span className="text-xs text-[#0B6B52] font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Zero axe violations
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {wcagRules.map((rule, idx) => (
            <div
              key={idx}
              className="p-4 rounded-[12px] bg-[#F6F7FB] border border-[#E3E7EF] flex flex-col gap-1.5"
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-[#102654]">
                <span className="w-5 h-5 rounded-full bg-[#E6F4EF] text-[#0B6B52] flex items-center justify-center font-bold text-[11px]">
                  {idx + 1}
                </span>
                <span>{rule.title}</span>
              </div>
              <p className="text-xs text-[#5B6478] leading-relaxed pl-7">
                {rule.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

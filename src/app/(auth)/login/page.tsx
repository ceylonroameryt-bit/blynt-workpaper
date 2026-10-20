'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Field';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('sam.rivera@vanguard-audit.com');
  const [password, setPassword] = useState('••••••••••••');
  const [keepSignedIn, setKeepSignedIn] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/clients');
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white text-[#1B2430]">
      {/* Left Column: Auth Form */}
      <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-between p-8 sm:p-12 lg:p-16">
        <div>
          {/* Logo */}
          <Link href="/clients" className="flex items-center gap-2.5 mb-12">
            <div className="w-9 h-9 rounded-[10px] bg-[#1E4FD8] flex items-center justify-center text-white font-bold">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-lg tracking-tight text-[#1B2430]">
                Workpapers
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#5B6676]">
                Audit Platform
              </span>
            </div>
          </Link>

          <div className="max-w-[400px]">
            <h1 className="text-[28px] font-semibold text-[#1B2430] tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-[#5B6676] mt-2 mb-8">
              Sign in to access your audit engagements and working papers.
            </p>

            {/* Social / SSO Auth Buttons */}
            <div className="flex flex-col gap-3 mb-6">
              <button
                type="button"
                onClick={() => router.push('/clients')}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-[10px] border border-[#D5D9E0] bg-white text-sm font-medium text-[#1B2430] hover:bg-[#F4F5F7] flex items-center justify-center gap-3 transition-colors focus-visible:outline-2 focus-visible:outline-[#1E4FD8] focus-visible:outline-offset-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <button
                type="button"
                onClick={() => router.push('/clients')}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-[10px] border border-[#D5D9E0] bg-white text-sm font-medium text-[#1B2430] hover:bg-[#F4F5F7] flex items-center justify-center gap-3 transition-colors focus-visible:outline-2 focus-visible:outline-[#1E4FD8] focus-visible:outline-offset-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 23 23">
                  <path fill="#f35325" d="M1 1h10v10H1z" />
                  <path fill="#81bc06" d="M12 1h10v10H12z" />
                  <path fill="#05a6f0" d="M1 12h10v10H1z" />
                  <path fill="#ffba08" d="M12 12h10v10H12z" />
                </svg>
                <span>Continue with Microsoft</span>
              </button>
            </div>

            <div className="relative my-6 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E3E6EB]" />
              </div>
              <span className="relative bg-white px-3 text-xs uppercase tracking-wider text-[#5B6676]">
                or work email
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Field label="Work Email" htmlFor="login-email">
                <Input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@firm.com"
                />
              </Field>

              <Field label="Password" htmlFor="login-password">
                <Input
                  id="login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>

              <div className="flex items-center justify-between text-xs mt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-[#1B2430]">
                  <input
                    type="checkbox"
                    checked={keepSignedIn}
                    onChange={(e) => setKeepSignedIn(e.target.checked)}
                    className="w-4 h-4 rounded border-[#D5D9E0] text-[#1E4FD8] focus:ring-[#1E4FD8]"
                  />
                  <span>Keep me signed in</span>
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Password reset link sent to work email.');
                  }}
                  className="text-[#1E4FD8] hover:underline font-medium"
                >
                  Forgot password?
                </a>
              </div>

              <div className="mt-4">
                <Button type="submit" variant="primary" className="w-full" size="md">
                  Sign in
                </Button>
              </div>
            </form>

            <div className="mt-6 text-sm text-[#5B6676] text-center">
              Don’t have an account?{' '}
              <Link href="/signup" className="text-[#1E4FD8] font-semibold hover:underline">
                Create firm account
              </Link>
            </div>
          </div>
        </div>

        {/* Footer links */}
        <div className="mt-12 pt-6 border-t border-[#E3E6EB] flex items-center gap-6 text-xs text-[#5B6676]">
          <span>© 2026 Workpapers Inc.</span>
          <a href="#privacy" className="hover:text-[#1B2430]">
            Privacy Policy
          </a>
          <a href="#terms" className="hover:text-[#1B2430]">
            Terms of Service
          </a>
          <a href="#security" className="hover:text-[#1B2430]">
            Security & SOC 2
          </a>
        </div>
      </div>

      {/* Right Column: Soft Blue Panel with Preview Card */}
      <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 bg-[#E9EFFD] p-12 lg:p-16 flex-col justify-between border-l border-[#D5D9E0]/50">
        <div className="max-w-[560px]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-[#1E4FD8] text-xs font-semibold mb-6 border border-[#E3E6EB]">
            <Sparkles className="w-3.5 h-3.5 text-[#5B3FD0]" />
            <span>AI-Assisted Working Papers (ISA & GAAS Compliant)</span>
          </div>

          <h2 className="text-3xl xl:text-4xl font-semibold text-[#1B2430] tracking-tight leading-tight mb-6">
            Audit files that build themselves
          </h2>

          <div className="flex flex-col gap-4 text-sm text-[#5B6676] mb-10">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#0B6B4D] shrink-0 mt-0.5" />
              <span>
                <strong className="text-[#1B2430]">Automatic lead schedules & mappings</strong>:
                Trial balances are ingested and mapped to standard master chart of accounts in seconds.
              </span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#0B6B4D] shrink-0 mt-0.5" />
              <span>
                <strong className="text-[#1B2430]">Substantive tie-outs with full evidence lineage</strong>:
                Every formula, bank confirmation, and tickmark links directly to underlying PDFs.
              </span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#0B6B4D] shrink-0 mt-0.5" />
              <span>
                <strong className="text-[#1B2430]">Continuous review & multi-tier sign-off</strong>:
                Preparer, manager, and engagement partner approvals with immutable audit logs.
              </span>
            </div>
          </div>

          {/* Small Reconciliation Preview Card */}
          <div className="bg-white rounded-[14px] border border-[#E3E6EB] p-5">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E3E6EB]">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-[#1E4FD8]" />
                <span className="text-xs font-semibold text-[#1B2430]">
                  WP B-10 • Bank Reconciliation Preview
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#E2F4EC] text-[#0B6B4D]">
                Ties ($0.00)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs mb-3 font-mono-numbers">
              <div className="p-2.5 rounded-lg bg-[#F4F5F7]">
                <div className="text-[10px] uppercase font-sans font-semibold text-[#5B6676]">
                  General Ledger Balance
                </div>
                <div className="text-sm font-semibold text-[#1B2430] mt-0.5">$118,402.17</div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#F4F5F7]">
                <div className="text-[10px] uppercase font-sans font-semibold text-[#5B6676]">
                  Adjusted Bank Balance
                </div>
                <div className="text-sm font-semibold text-[#1B2430] mt-0.5">$118,402.17</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-[#5B6676] pt-1 border-t border-[#E3E6EB]/60">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#0B6B4D]" />
                <span>3 outstanding cheques verified</span>
              </span>
              <span className="font-mono-numbers">ISA 505 Agrees</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-[#5B6676] pt-6 flex items-center justify-between">
          <span>Trusted by top 50 accounting & audit networks worldwide</span>
          <span className="font-mono-numbers">ISO 27001 • SOC 2 Type II</span>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  CheckCircle2,
  Users,
  FileSpreadsheet,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select } from '@/components/ui/Field';

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('Sam Rivera (Test)');
  const [workEmail, setWorkEmail] = useState('sam.rivera.test@vanguard-audit.com');
  const [firmName, setFirmName] = useState('Vanguard & Partners LLP');
  const [role, setRole] = useState('manager');
  const [password, setPassword] = useState('SuperSecretAudit2026!');
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/clients');
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white text-[#1B2430]">
      {/* Left Column: Form */}
      <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-between p-8 sm:p-12 lg:p-16">
        <div>
          {/* Logo */}
          <Link href="/clients" className="flex items-center gap-2.5 mb-10">
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

          <div className="max-w-[420px]">
            <div className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E8EEFD] text-[#1E4FD8] mb-3">
              Step 1 of 2
            </div>

            <h1 className="text-[28px] font-semibold text-[#1B2430] tracking-tight">
              Create firm workspace
            </h1>
            <p className="text-sm text-[#5B6676] mt-1.5 mb-6">
              Start your 30-day firm trial. No credit card required.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Field label="Full Name" htmlFor="signup-name" required>
                <Input
                  id="signup-name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Sam Rivera (Test)"
                />
              </Field>

              <Field label="Work Email" htmlFor="signup-email" required>
                <Input
                  id="signup-email"
                  type="email"
                  required
                  value={workEmail}
                  onChange={(e) => setWorkEmail(e.target.value)}
                  placeholder="e.g. sam@firm.com"
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Firm Name" htmlFor="signup-firm" required>
                  <Input
                    id="signup-firm"
                    type="text"
                    required
                    value={firmName}
                    onChange={(e) => setFirmName(e.target.value)}
                  />
                </Field>

                <Field label="Your Role" htmlFor="signup-role" required>
                  <Select
                    id="signup-role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="manager">Audit Manager</option>
                    <option value="partner">Engagement Partner</option>
                    <option value="preparer">Senior Associate / Preparer</option>
                    <option value="quality">Quality Review Partner (EQR)</option>
                  </Select>
                </Field>
              </div>

              <Field
                label="Password"
                htmlFor="signup-password"
                hint="12+ characters with mixed case and numbers"
                required
              >
                <Input
                  id="signup-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>

              <div className="flex items-start gap-2.5 text-xs text-[#5B6676] mt-2">
                <input
                  id="signup-terms"
                  type="checkbox"
                  required
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-4 h-4 rounded border-[#D5D9E0] text-[#1E4FD8] focus:ring-[#1E4FD8] mt-0.5"
                />
                <label htmlFor="signup-terms" className="cursor-pointer select-none leading-relaxed">
                  I agree to the{' '}
                  <a href="#terms" className="text-[#1E4FD8] hover:underline">
                    Master Services Agreement
                  </a>{' '}
                  and confirm processing of audit engagement records under confidentiality.
                </label>
              </div>

              <div className="mt-4">
                <Button type="submit" variant="primary" className="w-full" size="md">
                  Create account
                </Button>
              </div>
            </form>

            <div className="mt-6 text-sm text-[#5B6676] text-center">
              Already have an account?{' '}
              <Link href="/login" className="text-[#1E4FD8] font-semibold hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-[#E3E6EB] flex items-center gap-6 text-xs text-[#5B6676]">
          <span>© 2026 Workpapers Inc.</span>
          <a href="#privacy" className="hover:text-[#1B2430]">
            Privacy Policy
          </a>
          <a href="#terms" className="hover:text-[#1B2430]">
            Terms
          </a>
        </div>
      </div>

      {/* Right Column: Three Setup Steps */}
      <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 bg-[#E9EFFD] p-12 lg:p-16 flex-col justify-between border-l border-[#D5D9E0]/50">
        <div className="max-w-[540px]">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#1E4FD8] mb-3 block">
            Rapid Deployment
          </span>

          <h2 className="text-3xl xl:text-4xl font-semibold text-[#1B2430] tracking-tight leading-tight mb-8">
            Get your audit team live in 3 steps
          </h2>

          <div className="flex flex-col gap-6">
            {/* Step 1 */}
            <div className="bg-white rounded-[14px] border border-[#E3E6EB] p-5 flex items-start gap-4">
              <div className="w-9 h-9 rounded-full bg-[#1E4FD8] text-white flex items-center justify-center font-bold text-sm shrink-0">
                1
              </div>
              <div>
                <h3 className="font-semibold text-base text-[#1B2430]">
                  Create firm account
                </h3>
                <p className="text-xs text-[#5B6676] mt-1 leading-relaxed">
                  Establish your organization’s dedicated, encrypted tenant with single sign-on (SAML/Okta/Azure AD) and audit trail logging.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white/80 rounded-[14px] border border-[#E3E6EB] p-5 flex items-start gap-4">
              <div className="w-9 h-9 rounded-full bg-[#E8EEFD] text-[#1E4FD8] flex items-center justify-center font-bold text-sm shrink-0">
                2
              </div>
              <div>
                <h3 className="font-semibold text-base text-[#1B2430]">
                  Invite team & assign roles
                </h3>
                <p className="text-xs text-[#5B6676] mt-1 leading-relaxed">
                  Add partners, managers, and associates. Configure segregation of duties so preparers cannot sign off on their own work.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white/80 rounded-[14px] border border-[#E3E6EB] p-5 flex items-start gap-4">
              <div className="w-9 h-9 rounded-full bg-[#E8EEFD] text-[#1E4FD8] flex items-center justify-center font-bold text-sm shrink-0">
                3
              </div>
              <div>
                <h3 className="font-semibold text-base text-[#1B2430]">
                  Import trial balance
                </h3>
                <p className="text-xs text-[#5B6676] mt-1 leading-relaxed">
                  Connect Xero, QuickBooks, SAP, NetSuite, or upload Excel. AI auto-categorizes accounts with confidence scores in real time.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-[#5B6676] pt-8 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#0B6B4D]" />
          <span>Compliant with AICPA, IAASB ISA, and PCAOB auditing standards</span>
        </div>
      </div>
    </div>
  );
}

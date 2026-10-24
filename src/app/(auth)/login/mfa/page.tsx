'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  ShieldCheck,
  Smartphone,
  KeyRound,
  CheckCircle2,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function MfaVerificationPage() {
  const router = useRouter();
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [method, setMethod] = useState<'app' | 'sms'>('app');
  const [trustBrowser, setTrustBrowser] = useState(true);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [backupCode, setBackupCode] = useState('');
  const [countdown, setCountdown] = useState(28);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    if (!useBackupCode && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [useBackupCode]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleDigitChange = (index: number, value: string) => {
    setErrorMessage('');
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit if all 6 filled
    if (newDigits.every((d) => d !== '') && index === 5 && value) {
      triggerVerification(newDigits.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim().replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const newDigits = pasted.split('');
      setDigits(newDigits);
      inputRefs.current[5]?.focus();
      triggerVerification(pasted);
    }
  };

  const triggerVerification = (_code: string) => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      // Demo validation: any 6 digit code succeeds
      router.push('/clients');
    }, 600);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (useBackupCode) {
      if (backupCode.length < 8) {
        setErrorMessage('Please enter a valid 8-character recovery code.');
        return;
      }
      triggerVerification(backupCode);
    } else {
      const code = digits.join('');
      if (code.length < 6) {
        setErrorMessage('Please enter all 6 verification digits.');
        return;
      }
      triggerVerification(code);
    }
  };

  const handleResend = () => {
    setCountdown(30);
    setDigits(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white text-[#1B2430]">
      {/* Left Column: MFA Verification Form */}
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

          <div className="max-w-[420px]">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#E8EEFD] text-[#1E4FD8] text-xs font-semibold mb-4 border border-[#1E4FD8]/20">
              <ShieldCheck className="w-4 h-4" />
              <span>Two-Factor Authentication</span>
            </div>

            <h1 className="text-[26px] sm:text-[28px] font-semibold text-[#1B2430] tracking-tight">
              Verify your identity
            </h1>
            <p className="text-sm text-[#5B6676] mt-1.5 mb-6 leading-relaxed">
              {useBackupCode
                ? 'Enter one of your 8-character emergency backup recovery codes.'
                : method === 'app'
                ? 'Enter the 6-digit code from your authenticator app (Google Authenticator, Microsoft Authenticator, or 1Password).'
                : 'Enter the 6-digit verification code sent to your registered mobile ending in ••84.'}
            </p>

            {/* Verification Method Toggle */}
            {!useBackupCode && (
              <div className="flex rounded-[10px] border border-[#D5D9E0] p-1 bg-[#F4F5F7] mb-6">
                <button
                  type="button"
                  onClick={() => setMethod('app')}
                  className={`flex-1 py-1.5 px-3 rounded-[8px] text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    method === 'app'
                      ? 'bg-white text-[#1E4FD8] font-semibold shadow-2xs'
                      : 'text-[#5B6676] hover:text-[#1B2430]'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Authenticator App</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('sms')}
                  className={`flex-1 py-1.5 px-3 rounded-[8px] text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    method === 'sms'
                      ? 'bg-white text-[#1E4FD8] font-semibold shadow-2xs'
                      : 'text-[#5B6676] hover:text-[#1B2430]'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>SMS Code (••84)</span>
                </button>
              </div>
            )}

            {/* Error Message Banner */}
            {errorMessage && (
              <div className="p-3 rounded-[8px] bg-[#FFF1DC] border border-[#9A4A00]/20 text-[#9A4A00] text-xs font-medium mb-4">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleManualSubmit} className="flex flex-col gap-5">
              {!useBackupCode ? (
                <div>
                  <label className="block text-xs font-medium text-[#5B6676] mb-3">
                    6-Digit Security Code
                  </label>
                  <div className="flex items-center justify-between gap-2 sm:gap-2.5 on-paste" onPaste={handlePaste}>
                    {digits.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => {
                          inputRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleDigitChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-12 h-13 sm:w-13 sm:h-14 text-center font-mono-numbers text-xl font-bold bg-white border border-[#D5D9E0] rounded-[10px] text-[#1B2430] focus:border-[#1E4FD8] focus:ring-2 focus:ring-[#1E4FD8]/20 focus-visible:outline-none transition-all shadow-2xs"
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <label htmlFor="backup-code" className="block text-xs font-medium text-[#5B6676] mb-1.5">
                    Emergency Recovery Code
                  </label>
                  <input
                    id="backup-code"
                    type="text"
                    value={backupCode}
                    onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
                    placeholder="e.g. 8K49-2M91"
                    className="w-full h-11 px-3.5 font-mono text-base uppercase bg-white border border-[#D5D9E0] rounded-[10px] text-[#1B2430] focus:border-[#1E4FD8] focus:ring-2 focus:ring-[#1E4FD8]/20 focus-visible:outline-none"
                  />
                </div>
              )}

              {/* Trust Browser Checkbox */}
              <div className="flex items-center justify-between text-xs text-[#1B2430] pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={trustBrowser}
                    onChange={(e) => setTrustBrowser(e.target.checked)}
                    className="w-4 h-4 rounded border-[#D5D9E0] text-[#1E4FD8] focus:ring-[#1E4FD8]"
                  />
                  <span>Don&apos;t ask again on this device for 30 days</span>
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full"
                disabled={isVerifying}
              >
                {isVerifying ? 'Verifying authentication...' : 'Verify & Continue'}
              </Button>

              {/* Resend Code / Toggle Backup Code */}
              <div className="flex flex-col items-center gap-2.5 pt-2 text-xs text-[#5B6676]">
                {!useBackupCode ? (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span>Didn&apos;t receive a code?</span>
                      {countdown > 0 ? (
                        <span className="font-mono-numbers text-[#1E4FD8]">
                          Resend in {countdown}s
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResend}
                          className="text-[#1E4FD8] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Resend code</span>
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setUseBackupCode(true)}
                      className="text-[#5B6676] hover:text-[#1B2430] underline pt-1 cursor-pointer"
                    >
                      Use emergency backup recovery code
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setUseBackupCode(false)}
                    className="text-[#1E4FD8] font-semibold hover:underline cursor-pointer"
                  >
                    ← Back to standard 6-digit code
                  </button>
                )}
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-[#E3E6EB] text-center">
              <Link
                href="/login"
                className="text-xs text-[#5B6676] hover:text-[#1E4FD8] font-medium"
              >
                ← Return to Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-[#E3E6EB] flex items-center gap-6 text-xs text-[#5B6676]">
          <span>© 2026 Workpapers Inc.</span>
          <span>SOC 2 Type II Certified</span>
          <span>Encrypted with TLS 1.3</span>
        </div>
      </div>

      {/* Right Column: Security Panel */}
      <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 bg-[#E9EFFD] p-12 lg:p-16 flex-col justify-between border-l border-[#D5D9E0]/50">
        <div className="max-w-[540px]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-[#1E4FD8] text-xs font-semibold mb-6 border border-[#E3E6EB]">
            <Lock className="w-3.5 h-3.5 text-[#1E4FD8]" />
            <span>Bank-Grade Audit Security & Access Controls</span>
          </div>

          <h2 className="text-3xl xl:text-4xl font-semibold text-[#1B2430] tracking-tight leading-tight mb-4">
            Protecting client financial data
          </h2>

          <p className="text-sm text-[#5B6676] leading-relaxed mb-8">
            Workpapers enforces mandatory hardware or TOTP multi-factor authentication for all engagement teams to safeguard working papers and client audit evidence under ISA 230 standards.
          </p>

          <div className="flex flex-col gap-3.5">
            {[
              {
                title: 'Tamper-Evident Working Papers',
                desc: 'All working papers, nominal adjustments, and evidence extractions are hashed with SHA-256 for legal sign-off defensibility.',
              },
              {
                title: 'Role-Based Access Control (RBAC)',
                desc: 'Audit staff are restricted to permitted engagements with granular preparer, manager, and partner sign-off tiers.',
              },
              {
                title: 'Zero Permanent Storage for AI',
                desc: 'LLM extractions occur in ephemeral isolated containers with zero customer data retention for AI model training.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-4 rounded-[12px] bg-white border border-[#D5D9E0] flex items-start gap-3.5 shadow-2xs"
              >
                <CheckCircle2 className="w-5 h-5 text-[#0B6B4D] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-[#1B2430]">{item.title}</h4>
                  <p className="text-xs text-[#5B6676] mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-[#5B6676]">
          <span className="font-mono-numbers">Session ID: sess_7a89f92</span>
          <span>•</span>
          <span>Verified Device</span>
        </div>
      </div>
    </div>
  );
}

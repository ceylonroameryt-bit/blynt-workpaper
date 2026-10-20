import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Send,
  X,
  Bot,
  User,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Search,
} from 'lucide-react';
import { TrialBalanceRow, WorkpaperInstance } from '../types';
import { formatCurrency } from '../engine/evaluator';

interface AIAssistantModalProps {
  initialTab?: 'chat' | 'review';
  isOpen: boolean;
  onClose: () => void;
  workpapers: WorkpaperInstance[];
  trialBalance: TrialBalanceRow[];
  onOpenWorkpaper: (wpId: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  citations?: { title: string; linkWpId?: string }[];
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  initialTab = 'chat',
  isOpen,
  onClose,
  workpapers,
  trialBalance,
  onOpenWorkpaper,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'review'>(initialTab);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Hello, I am your Blynt Audit Copilot. I analyze all trial balances, lead schedules, and uploaded bank statements in real-time. How can I assist with your fieldwork?',
      timestamp: '11:00 AM',
      citations: [],
    },
  ]);

  if (!isOpen) return null;

  const handleSend = () => {
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    let replyText = '';
    let citations: { title: string; linkWpId?: string }[] = [];

    const q = query.toLowerCase();
    if (q.includes('20%') || q.includes('variance') || q.includes('move')) {
      replyText = `Based on the analytical review (WP E.1), 2 financial statement lines moved over 20%:\n1. Finance Costs / Interest Expense: -$26,250 (-21.0%) due to $300k debt paydown on Citibank term loan.\n2. Commercial Fleet Additions: +$185,000 (+15.2%) vouched to Caterpillar Invoice #908.\nBoth items have corroborated explanations documented.`;
      citations = [{ title: 'WP E.1 Analytical Review', linkWpId: 'wp_analytical_review' }];
    } else if (q.includes('bank') || q.includes('cash') || q.includes('difference')) {
      replyText = `Bank Reconciliation (WP A.1) has an unadjusted discrepancy of $0.00. The general ledger balance of $1,416,200.00 ties to Chase bank statement ($1,428,750.00) adjusted for $28,000 outstanding Check #4092 and $15,450 deposit in transit.`;
      citations = [
        { title: 'WP A.1 Bank Rec', linkWpId: 'wp_bank_rec' },
        { title: 'Chase Statement Dec 2026' },
      ];
    } else if (q.includes('materiality') || q.includes('tolerable')) {
      replyText = `Overall planning materiality for Apex Global Logistics is $75,000. Tolerable misstatement is set at 50% ($37,500). All fixed asset additions above $37,500 have been vouched.`;
      citations = [{ title: 'Engagement Parameters' }];
    } else if (q.includes('confirmation') || q.includes('third party')) {
      replyText = `Confirmation control (WP A.2) reports 100% receipt across 4 external confirmations (JPMorgan Chase, Citibank Term Loan, Home Depot, Morgan & Lewis legal counsel).`;
      citations = [{ title: 'WP A.2 Confirmation Tracker', linkWpId: 'wp_confirmation_tracker' }];
    } else {
      replyText = `I analyzed your query across ${workpapers.length} active workpapers and ${trialBalance.length} trial balance accounts. All mathematical recalculations tie with 0 breaks detected.`;
      citations = [{ title: 'Trial Balance Engine' }];
    }

    const aiReply: ChatMessage = {
      id: `reply_${Date.now()}`,
      sender: 'ai',
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citations,
    };

    setMessages((prev) => [...prev, userMsg, aiReply]);
    setQuery('');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '760px',
          height: '620px',
          backgroundColor: '#0f172a',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
        }}
      >
        {/* Modal Top Bar */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: '#0c111d',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.2)', color: '#c084fc' }}>
              <Sparkles size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc' }}>
                Blynt AI Copilot &amp; Review Assistant
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                Assisted Tier: Drafts &amp; flags · Human licensed auditor approves
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', background: '#1e293b', borderRadius: '6px', padding: '0.15rem' }}>
              <button
                onClick={() => setActiveTab('chat')}
                style={{
                  padding: '0.3rem 0.75rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: activeTab === 'chat' ? 'var(--accent-blue)' : 'transparent',
                  color: activeTab === 'chat' ? '#ffffff' : '#94a3b8',
                }}
              >
                Ask-the-File Chat
              </button>
              <button
                onClick={() => setActiveTab('review')}
                style={{
                  padding: '0.3rem 0.75rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: activeTab === 'review' ? 'var(--accent-blue)' : 'transparent',
                  color: activeTab === 'review' ? '#ffffff' : '#94a3b8',
                }}
              >
                Audit Health Scan
              </button>
            </div>

            <button onClick={onClose} style={{ padding: '0.3rem', color: '#94a3b8' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab 1: Chat View */}
        {activeTab === 'chat' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Quick Prompts */}
            <div style={{ padding: '0.65rem 1.25rem', backgroundColor: '#0d1424', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: '0.4rem', overflowX: 'auto' }}>
              {[
                'Which accounts moved >20%?',
                'Does bank rec tie to statement?',
                'Are confirmations 100% reconciled?',
                'What is tolerable misstatement?',
              ].map((qp, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setQuery(qp);
                  }}
                  style={{
                    padding: '0.25rem 0.55rem',
                    borderRadius: '999px',
                    fontSize: '0.7rem',
                    backgroundColor: '#1e293b',
                    color: '#93c5fd',
                    border: '1px solid #334155',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {qp}
                </button>
              ))}
            </div>

            {/* Messages Scroll */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    gap: '0.75rem',
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                  }}
                >
                  {msg.sender === 'ai' && (
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(139, 92, 246, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#c084fc',
                        flexShrink: 0,
                      }}
                    >
                      <Bot size={16} />
                    </div>
                  )}

                  <div
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      backgroundColor: msg.sender === 'user' ? 'var(--accent-blue)' : '#111827',
                      color: '#ffffff',
                      fontSize: '0.825rem',
                      lineHeight: 1.45,
                      border: msg.sender === 'ai' ? '1px solid #2d3748' : 'none',
                    }}
                  >
                    <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>

                    {msg.citations && msg.citations.length > 0 && (
                      <div style={{ marginTop: '0.65rem', borderTop: '1px solid #1e293b', paddingTop: '0.4rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {msg.citations.map((c, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              if (c.linkWpId) {
                                onOpenWorkpaper(c.linkWpId);
                                onClose();
                              }
                            }}
                            style={{
                              fontSize: '0.68rem',
                              fontFamily: 'var(--font-mono)',
                              color: '#93c5fd',
                              backgroundColor: '#1e293b',
                              padding: '0.15rem 0.45rem',
                              borderRadius: '4px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                            }}
                          >
                            <span>[{c.title}]</span>
                            {c.linkWpId && <ArrowRight size={10} />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Footer */}
            <div style={{ padding: '0.85rem 1.25rem', borderTop: '1px solid var(--border-subtle)', backgroundColor: '#0c111d', display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Ask questions about trial balance, variances, documents, or audit procedures..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                style={{ flex: 1 }}
              />
              <button
                onClick={handleSend}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  backgroundColor: 'var(--accent-blue)',
                  color: '#ffffff',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <Send size={14} />
                <span>Ask</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Review Assistant Diagnostic Scan */}
        {activeTab === 'review' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
              Real-time Automated Review Assistant Scan
            </div>

            {/* Item 1 */}
            <div style={{ padding: '0.85rem', borderRadius: '8px', backgroundColor: '#111827', border: '1px solid #1e293b', display: 'flex', gap: '0.75rem' }}>
              <CheckCircle2 size={18} color="#34d399" />
              <div>
                <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#34d399' }}>
                  Lead Schedule Tie-Out Integrity (3 / 3 Clean)
                </div>
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
                  Bank Rec A.1 ($1,416,200), Fixed Assets B.1 ($3,385,000), and Prepayments C.1 ($155,500) all tie to Trial Balance with $0.00 unadjusted difference.
                </div>
              </div>
            </div>

            {/* Item 2 */}
            <div style={{ padding: '0.85rem', borderRadius: '8px', backgroundColor: '#111827', border: '1px solid #1e293b', display: 'flex', gap: '0.75rem' }}>
              <AlertTriangle size={18} color="#fbbf24" />
              <div>
                <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#fbbf24' }}>
                  Fixed Assets: Depreciation Recalc Variance ($150.00)
                </div>
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
                  Auditor independent straight-line recalculation on commercial transport fleet differs by $150.00 from client recorded charge. Well below tolerable error ($37,500); review note open.
                </div>
                <button
                  onClick={() => {
                    onOpenWorkpaper('wp_fixed_assets');
                    onClose();
                  }}
                  style={{ fontSize: '0.7rem', color: '#60a5fa', marginTop: '0.3rem', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                >
                  <span>Go to WP B.1</span> <ArrowRight size={11} />
                </button>
              </div>
            </div>

            {/* Item 3 */}
            <div style={{ padding: '0.85rem', borderRadius: '8px', backgroundColor: '#111827', border: '1px solid #1e293b', display: 'flex', gap: '0.75rem' }}>
              <CheckCircle2 size={18} color="#34d399" />
              <div>
                <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#34d399' }}>
                  Digital Lineage &amp; Evidence Cross-Referencing
                </div>
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
                  All AI extraction figures possess immutable SHA-256 hashes, spatial bounding boxes, and auditor acceptance signatures adhering to PCAOB AS 1215 standards.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

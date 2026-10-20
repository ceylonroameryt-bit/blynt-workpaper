import React, { useState } from 'react';
import {
  FileText,
  X,
  Maximize2,
  Minimize2,
  Check,
  MousePointerClick,
  Sparkles,
  ShieldCheck,
  Hash,
  Clock,
  Layers,
} from 'lucide-react';
import { BoundingBox, DocumentItem, Tickmark, TickmarkType } from '../types';

interface SplitScreenViewerProps {
  documents: DocumentItem[];
  activeDocumentId: string;
  onSelectDocument: (docId: string) => void;
  selectedTickmark: Tickmark | null;
  onPlaceTickmark: (docId: string, markType: TickmarkType, label: string, box: BoundingBox) => void;
  onClose: () => void;
}

export const SplitScreenViewer: React.FC<SplitScreenViewerProps> = ({
  documents,
  activeDocumentId,
  onSelectDocument,
  selectedTickmark,
  onPlaceTickmark,
  onClose,
}) => {
  const currentDoc = documents.find((d) => d.id === activeDocumentId) || documents[0];
  const [selectedBox, setSelectedBox] = useState<BoundingBox | null>(
    selectedTickmark?.boundingBox || currentDoc?.annotations?.[0]?.box || null
  );

  return (
    <div
      style={{
        width: '460px',
        borderLeft: '1px solid var(--border-subtle)',
        backgroundColor: '#0a0e17',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        boxShadow: '-4px 0 15px rgba(0, 0, 0, 0.4)',
        zIndex: 40,
      }}
    >
      {/* Viewer Header */}
      <div
        style={{
          padding: '0.75rem 1rem',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: '#0f172a',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={16} color="#60a5fa" />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
            Evidence & Document Viewer
          </span>
        </div>

        <button
          onClick={onClose}
          style={{ padding: '0.25rem', borderRadius: '4px', color: '#94a3b8' }}
          title="Close split viewer"
        >
          <X size={16} />
        </button>
      </div>

      {/* Document Selector & Hash pill */}
      <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-subtle)', backgroundColor: '#0d1322' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <select
            value={currentDoc.id}
            onChange={(e) => {
              onSelectDocument(e.target.value);
              const found = documents.find((d) => d.id === e.target.value);
              if (found && found.annotations?.[0]) setSelectedBox(found.annotations[0].box);
            }}
            style={{ flex: 1, fontSize: '0.78rem', padding: '0.35rem 0.6rem' }}
          >
            {documents.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.fileName} ({doc.category})
              </option>
            ))}
          </select>
        </div>

        {/* SHA-256 Hash badge (Pillar 1: Source artifact & version) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.65rem',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={currentDoc.fileHash}
        >
          <Hash size={11} color="#64748b" />
          <span>SHA-256: {currentDoc.fileHash.slice(0, 24)}...</span>
        </div>
      </div>

      {/* Document Canvas / Scanned preview container */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '6px',
            color: '#0f172a',
            padding: '1.25rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
            position: 'relative',
            minHeight: '440px',
            fontFamily: "'Segoe UI', Helvetica, Arial, sans-serif",
            fontSize: '0.8rem',
            lineHeight: 1.4,
          }}
        >
          {/* Mock Document Render */}
          {currentDoc.id === 'doc_chase_dec26' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1e3a8a' }}>JPMorgan Chase Bank, N.A.</div>
                  <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Commercial Banking Division · NY, NY 10017</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>ACCOUNT STATEMENT</div>
                  <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Period: Dec 1, 2026 - Dec 31, 2026</div>
                </div>
              </div>

              <div style={{ marginBottom: '1rem', fontSize: '0.75rem' }}>
                <div><strong>Client:</strong> Apex Global Logistics Inc.</div>
                <div><strong>Account Number:</strong> *******9081 (Commercial Operating)</div>
              </div>

              {/* Box 1: Ending Balance Highlight */}
              <div
                onClick={() => setSelectedBox(currentDoc.annotations?.[0].box || null)}
                style={{
                  padding: '0.65rem',
                  backgroundColor: '#f8fafc',
                  border: '2px solid #3b82f6',
                  borderRadius: '4px',
                  marginBottom: '1rem',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#1e40af' }}>
                  STATEMENT CLOSING BALANCE (DEC 31, 2026)
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>
                  $1,428,750.00
                </div>
                <span
                  style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '8px',
                    background: '#3b82f6',
                    color: '#fff',
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    padding: '0.1rem 0.35rem',
                    borderRadius: '3px',
                  }}
                >
                  ✓ OCR EXTRACTED
                </span>
              </div>

              {/* Transactions snippet */}
              <div style={{ fontSize: '0.7rem' }}>
                <div style={{ fontWeight: 700, borderBottom: '1px solid #cbd5e1', paddingBottom: '0.2rem', marginBottom: '0.3rem' }}>
                  Subsequent Clearing Transactions (January 2027 Excerpt)
                </div>
                <table style={{ width: '100%', fontSize: '0.68rem', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr
                      onClick={() => setSelectedBox(currentDoc.annotations?.[1].box || null)}
                      style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', background: 'rgba(59, 130, 246, 0.08)' }}
                    >
                      <td style={{ padding: '0.2rem' }}>01/02/2027</td>
                      <td>Deposit in Transit (DEP-8831)</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#059669' }}>+$15,450.00</td>
                    </tr>
                    <tr
                      onClick={() => setSelectedBox(currentDoc.annotations?.[2].box || null)}
                      style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', background: 'rgba(239, 68, 68, 0.08)' }}
                    >
                      <td style={{ padding: '0.2rem' }}>01/04/2027</td>
                      <td>Cheque Paid #4092 Midwest Fuel</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>-$28,000.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {currentDoc.id === 'doc_cat_invoice' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #ea580c', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#ea580c' }}>CATERPILLAR FINANCIAL</div>
                  <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Commercial Equipment Sales &amp; Leasing</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800 }}>COMMERCIAL INVOICE</div>
                  <div style={{ fontSize: '0.65rem' }}>Inv #: CAT-2026-908</div>
                  <div style={{ fontSize: '0.65rem' }}>Date: Sept 15, 2026</div>
                </div>
              </div>

              <div style={{ fontSize: '0.75rem', marginBottom: '0.75rem' }}>
                <div><strong>Bill To:</strong> Apex Global Logistics Inc.</div>
                <div><strong>Equipment:</strong> 2026 Freightliner Cascadia Heavy Hauler 72" Sleeper</div>
                <div><strong>VIN / Tag:</strong> 1FTFW1ED4MFA19283 / Asset #TRK-2026-08</div>
              </div>

              <div
                onClick={() => setSelectedBox(currentDoc.annotations?.[0].box || null)}
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#fffbeb',
                  border: '2px solid #f59e0b',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginTop: '1rem',
                }}
              >
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#b45309' }}>TOTAL CAPITALIZED INVOICE AMOUNT</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#78350f', fontFamily: 'monospace' }}>
                  $185,000.00
                </div>
                <div style={{ fontSize: '0.65rem', color: '#92400e', marginTop: '0.2rem' }}>
                  Purchase Order #PO-4481 · Signed Delivery Receipt Attached
                </div>
              </div>
            </div>
          )}

          {currentDoc.id === 'doc_travelers_policy' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #dc2626', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#dc2626' }}>TRAVELERS INSURANCE</div>
                <div style={{ textAlign: 'right', fontSize: '0.7rem' }}>Policy #TRV-8821</div>
              </div>
              <div style={{ fontSize: '0.75rem', marginBottom: '1rem' }}>
                <div><strong>Insured:</strong> Apex Global Logistics Inc.</div>
                <div><strong>Coverage Period:</strong> July 1, 2026 to June 30, 2027 (12 Months)</div>
                <div><strong>Scope:</strong> Commercial Fleet Comprehensive &amp; Collision</div>
              </div>
              <div
                onClick={() => setSelectedBox(currentDoc.annotations?.[0].box || null)}
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#fef2f2',
                  border: '2px solid #dc2626',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#991b1b' }}>ANNUAL PAID PREMIUM</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#7f1d1d', fontFamily: 'monospace' }}>
                  $144,000.00
                </div>
                <div style={{ fontSize: '0.65rem', color: '#991b1b' }}>$12,000.00 / month amortisation rate</div>
              </div>
            </div>
          )}

          {currentDoc.id === 'doc_bank_confirmation' && (
            <div>
              <div style={{ borderBottom: '2px solid #1e3a8a', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e3a8a' }}>STANDARD FORM TO CONFIRM ACCOUNT BALANCE</div>
                <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Financial Institution Confirmation · AICPA / ISA Approved Standard</div>
              </div>
              <div style={{ fontSize: '0.72rem', marginBottom: '0.75rem' }}>
                <div><strong>Auditor:</strong> Blynt Audit &amp; Assurance LLP</div>
                <div><strong>Customer:</strong> Apex Global Logistics Inc.</div>
                <div><strong>As of Date:</strong> December 31, 2026</div>
              </div>
              <div
                onClick={() => setSelectedBox(currentDoc.annotations?.[0].box || null)}
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#eff6ff',
                  border: '2px solid #3b82f6',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#1d4ed8' }}>CONFIRMED OPERATING ACCOUNT BALANCE</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e3a8a', fontFamily: 'monospace' }}>
                  $1,428,750.00
                </div>
                <div style={{ fontSize: '0.65rem', color: '#1e40af' }}>Direct electronic confirmation received without exception.</div>
              </div>
            </div>
          )}
        </div>

        {/* 1-Click Interactive Tick-mark Bar */}
        <div className="glass-panel" style={{ padding: '0.85rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <MousePointerClick size={14} color="#60a5fa" />
            <span>Place Tick-Mark on Current Workpaper</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem' }}>
            <button
              onClick={() => onPlaceTickmark(currentDoc.id, 'agrees_to_bank_statement', '✓ BS', selectedBox || { page: 1, x: 50, y: 50, width: 20, height: 10 })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.35rem 0.5rem',
                borderRadius: '4px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                fontSize: '0.72rem',
                fontWeight: 600,
              }}
            >
              <span>✓ BS</span>
              <span>Agrees to Bank Stmt</span>
            </button>

            <button
              onClick={() => onPlaceTickmark(currentDoc.id, 'invoiced_and_vouched', '✓ IN', selectedBox || { page: 1, x: 50, y: 50, width: 20, height: 10 })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.35rem 0.5rem',
                borderRadius: '4px',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                color: '#a5b4fc',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                fontSize: '0.72rem',
                fontWeight: 600,
              }}
            >
              <span>✓ IN</span>
              <span>Vouched to Invoice</span>
            </button>

            <button
              onClick={() => onPlaceTickmark(currentDoc.id, 'calculation_checked', '✓ CA', selectedBox || { page: 1, x: 50, y: 50, width: 20, height: 10 })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.35rem 0.5rem',
                borderRadius: '4px',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                color: '#fbbf24',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                fontSize: '0.72rem',
                fontWeight: 600,
              }}
            >
              <span>✓ CA</span>
              <span>Calculation Checked</span>
            </button>

            <button
              onClick={() => onPlaceTickmark(currentDoc.id, 'confirmed_independent', '✓ CF', selectedBox || { page: 1, x: 50, y: 50, width: 20, height: 10 })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.35rem 0.5rem',
                borderRadius: '4px',
                backgroundColor: 'rgba(139, 92, 246, 0.15)',
                color: '#c084fc',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                fontSize: '0.72rem',
                fontWeight: 600,
              }}
            >
              <span>✓ CF</span>
              <span>Third-Party Confirmed</span>
            </button>
          </div>
        </div>

        {/* Spatial Coordinates details (Pillar 2) */}
        {selectedBox && (
          <div
            style={{
              padding: '0.65rem 0.85rem',
              borderRadius: '6px',
              backgroundColor: '#0d1424',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.7rem',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <div style={{ color: '#93c5fd', fontWeight: 700, marginBottom: '0.2rem' }}>
              Spatial Coordinates (PCAOB Pillar 2)
            </div>
            <div>Page: {selectedBox.page} · X: {selectedBox.x}% · Y: {selectedBox.y}% · W: {selectedBox.width}% · H: {selectedBox.height}%</div>
          </div>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { FileText, Download, Eye, ExternalLink, Hash, Clock, ShieldCheck } from 'lucide-react';
import { DocumentItem } from '../types';

interface DocumentsVaultViewProps {
  documents: DocumentItem[];
  onOpenSplitViewer: (docId: string) => void;
}

export const DocumentsVaultView: React.FC<DocumentsVaultViewProps> = ({
  documents,
  onOpenSplitViewer,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge badge-blue">Document Vault &amp; Object Storage</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Section 7 &amp; 8: S3/R2 Storage &amp; Evidence Repository
            </span>
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginTop: '0.35rem' }}>
            Audit Evidence Documents &amp; Source Files
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Immutable evidentiary store with SHA-256 cryptographic hashes, OCR text extractions, and cell bounding-box annotations.
          </p>
        </div>
      </div>

      {/* Documents Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="glass-panel"
            style={{
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ padding: '0.4rem', borderRadius: '6px', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
                    <FileText size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f8fafc' }}>
                      {doc.fileName}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {doc.category} · {doc.fileSize}
                    </div>
                  </div>
                </div>

                <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>
                  Verified
                </span>
              </div>

              {/* Hash */}
              <div
                style={{
                  marginTop: '0.75rem',
                  padding: '0.4rem 0.6rem',
                  borderRadius: '4px',
                  backgroundColor: '#0d1424',
                  fontSize: '0.68rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-secondary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                SHA-256: {doc.fileHash}
              </div>

              {/* Annotations */}
              <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#cbd5e1' }}>
                <strong style={{ color: '#93c5fd' }}>{doc.annotations?.length || 0} Spatial Annotations:</strong>
                <ul style={{ paddingLeft: '1.2rem', marginTop: '0.25rem', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  {doc.annotations?.map((a) => (
                    <li key={a.id}>{a.label}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
              </span>

              <button
                onClick={() => onOpenSplitViewer(doc.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  backgroundColor: 'var(--accent-blue)',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                <Eye size={13} />
                <span>Open in Viewer</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

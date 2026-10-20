import React, { useState } from 'react';
import {
  MessageSquareWarning,
  CheckCircle2,
  Clock,
  Send,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { ReviewNote, UserProfile, WorkpaperInstance } from '../types';

interface ReviewNotesViewProps {
  notes: ReviewNote[];
  workpapers: WorkpaperInstance[];
  currentUser: UserProfile;
  onClearNote: (noteId: string, explanation: string) => void;
  onAddNote: (workpaperId: string, ref: string, text: string) => void;
  onOpenWorkpaper: (workpaperId: string) => void;
}

export const ReviewNotesView: React.FC<ReviewNotesViewProps> = ({
  notes,
  workpapers,
  currentUser,
  onClearNote,
  onAddNote,
  onOpenWorkpaper,
}) => {
  const [filter, setFilter] = useState<'all' | 'open' | 'cleared'>('all');
  const [targetWpId, setTargetWpId] = useState(workpapers[0]?.id || '');
  const [noteText, setNoteText] = useState('');
  const [clearExplanations, setClearExplanations] = useState<Record<string, string>>({});

  const filteredNotes = notes.filter((n) => {
    if (filter === 'open') return n.status === 'Open';
    if (filter === 'cleared') return n.status === 'Cleared';
    return true;
  });

  const handlePost = () => {
    if (!noteText.trim()) return;
    const targetWp = workpapers.find((w) => w.id === targetWpId) || workpapers[0];
    onAddNote(targetWp.id, targetWp.refCode, noteText);
    setNoteText('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
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
            <span className="badge badge-amber">Review &amp; Clearance Inbox</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Section 4: Review notes inbox
            </span>
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginTop: '0.35rem' }}>
            Central Review Notes Inbox
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Reviewers raise points across any workpaper or cell; preparers provide resolution explanations and clear them one by one.
          </p>
        </div>
      </div>

      {/* New Note Form */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.75rem' }}>
          Raise New Review Note
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <select
            value={targetWpId}
            onChange={(e) => setTargetWpId(e.target.value)}
            style={{ width: '280px', fontSize: '0.8rem' }}
          >
            {workpapers.map((wp) => (
              <option key={wp.id} value={wp.id}>
                WP {wp.refCode} - {wp.title.slice(0, 30)}...
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Type review note instruction, missing evidence inquiry, or calculation check..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            style={{ flex: 1 }}
          />

          <button
            onClick={handlePost}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              backgroundColor: 'var(--accent-amber)',
              color: '#000000',
              fontWeight: 700,
              fontSize: '0.8rem',
            }}
          >
            <Send size={14} />
            <span>Post Note</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => setFilter('all')}
          style={{
            padding: '0.35rem 0.75rem',
            borderRadius: '6px',
            fontSize: '0.78rem',
            fontWeight: 600,
            backgroundColor: filter === 'all' ? '#1e293b' : 'transparent',
            color: filter === 'all' ? '#60a5fa' : 'var(--text-muted)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          All Notes ({notes.length})
        </button>
        <button
          onClick={() => setFilter('open')}
          style={{
            padding: '0.35rem 0.75rem',
            borderRadius: '6px',
            fontSize: '0.78rem',
            fontWeight: 600,
            backgroundColor: filter === 'open' ? '#1e293b' : 'transparent',
            color: filter === 'open' ? '#f87171' : 'var(--text-muted)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          Open Notes ({notes.filter((n) => n.status === 'Open').length})
        </button>
        <button
          onClick={() => setFilter('cleared')}
          style={{
            padding: '0.35rem 0.75rem',
            borderRadius: '6px',
            fontSize: '0.78rem',
            fontWeight: 600,
            backgroundColor: filter === 'cleared' ? '#1e293b' : 'transparent',
            color: filter === 'cleared' ? '#34d399' : 'var(--text-muted)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          Cleared ({notes.filter((n) => n.status === 'Cleared').length})
        </button>
      </div>

      {/* Notes List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {filteredNotes.map((note) => {
          const isOpen = note.status === 'Open';
          return (
            <div
              key={note.id}
              className="glass-panel"
              style={{
                padding: '1.15rem',
                borderLeft: `4px solid ${isOpen ? '#f59e0b' : '#10b981'}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <button
                    onClick={() => onOpenWorkpaper(note.workpaperId)}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#93c5fd',
                      backgroundColor: '#1e293b',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      textDecoration: 'underline',
                    }}
                  >
                    WP {note.workpaperRef}
                  </button>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Posted by <strong>{note.authorName}</strong> ({note.authorRole.toUpperCase()}) on {new Date(note.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <span className={`badge ${isOpen ? 'badge-amber' : 'badge-green'}`}>
                  {note.status}
                </span>
              </div>

              <div style={{ fontSize: '0.875rem', color: '#f1f5f9', lineHeight: 1.4 }}>
                {note.text}
              </div>

              {/* Clearance Section */}
              {isOpen ? (
                <div
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.75rem',
                    backgroundColor: '#0d1424',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem',
                  }}
                >
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Preparer Clearance Explanation:
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      placeholder="Enter how this point was addressed or verified..."
                      value={clearExplanations[note.id] || ''}
                      onChange={(e) =>
                        setClearExplanations({ ...clearExplanations, [note.id]: e.target.value })
                      }
                      style={{ flex: 1 }}
                    />
                    <button
                      onClick={() => {
                        const expl = clearExplanations[note.id] || 'Verified and resolved.';
                        onClearNote(note.id, expl);
                      }}
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: '6px',
                        backgroundColor: 'var(--accent-green)',
                        color: '#ffffff',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      Clear Note
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    marginTop: '0.4rem',
                    padding: '0.6rem 0.85rem',
                    backgroundColor: 'rgba(16, 185, 129, 0.08)',
                    borderRadius: '6px',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    fontSize: '0.78rem',
                    color: '#cbd5e1',
                  }}
                >
                  <div style={{ color: '#34d399', fontWeight: 700, marginBottom: '0.2rem' }}>
                    ✓ Cleared by {note.clearedBy} on {note.clearedAt ? new Date(note.clearedAt).toLocaleDateString() : ''}
                  </div>
                  <div>"{note.clearedExplanation}"</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

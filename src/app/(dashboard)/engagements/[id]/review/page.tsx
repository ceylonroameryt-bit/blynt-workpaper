'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  MessageSquare,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Send,
  Check,
  Search,
  Filter,
  AlertCircle,
  FileSpreadsheet,
  ChevronRight,
  UserCheck,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatusPill } from '@/components/ui/StatusPill';
import { Tabs } from '@/components/ui/Tabs';
import { Avatar } from '@/components/ui/Avatar';
import { getReviewNotes } from '@/lib/api';
import { ReviewNoteItem, UserProfile } from '@/lib/types';
import { MOCK_ENGAGEMENT, CURRENT_USER } from '@/lib/mock';

function parseAuthor(author: any) {
  if (!author) return { name: 'Auditor', title: 'Team Member', avatar: '' };
  if (typeof author === 'string') return { name: author, title: 'Auditor', avatar: '' };
  return {
    name: author.name || 'Auditor',
    title: author.title || author.role || 'Team Member',
    avatar: author.avatar || '',
  };
}

export default function ReviewNotesHubPage() {
  const params = useParams();
  const router = useRouter();
  const engagementId = (params?.id as string) || 'eng_harlow_fy26';

  const [notes, setNotes] = useState<ReviewNoteItem[]>([]);
  const [activeTab, setActiveTab] = useState<'open' | 'waiting' | 'cleared' | 'all'>('open');
  const [selectedNoteId, setSelectedNoteId] = useState<string>('rn_01');
  const [replyInput, setReplyInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    getReviewNotes(engagementId).then((data) => {
      setNotes(data);
      if (data.length > 0 && !data.some((d) => d.id === selectedNoteId)) {
        setSelectedNoteId(data[0].id);
      }
    });
  }, [engagementId, selectedNoteId]);

  const openCount = notes.filter((n) => n.status === 'Open' || n.status === 'open').length;
  const waitingCount = notes.filter((n) => n.status === 'Waiting on me' || n.status === 'Waiting on client').length;
  const clearedCount = notes.filter((n) => n.status === 'Cleared' || n.status === 'Resolved' || n.status === 'resolved').length;

  const tabs = [
    { id: 'open', label: 'Open', count: openCount },
    { id: 'waiting', label: 'Waiting on client / me', count: waitingCount },
    { id: 'cleared', label: 'Cleared', count: clearedCount },
    { id: 'all', label: 'All Notes', count: notes.length },
  ];

  const filteredNotes = notes.filter((n) => {
    const title = n.workpaperTitle || n.workpaperName || '';
    const body = n.content || n.text || '';
    const matchesSearch =
      n.workpaperRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      body.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'open') return n.status === 'Open' || n.status === 'open';
    if (activeTab === 'waiting') return n.status === 'Waiting on me' || n.status === 'Waiting on client';
    if (activeTab === 'cleared') return n.status === 'Cleared' || n.status === 'Resolved' || n.status === 'resolved';
    return true;
  });

  const selectedNote = notes.find((n) => n.id === selectedNoteId) || filteredNotes[0] || notes[0];

  const handleSendReply = () => {
    if (!replyInput.trim() || !selectedNote) return;
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id === selectedNote.id) {
          const replies = n.replies || [];
          return {
            ...n,
            replies: [
              ...replies,
              {
                id: `rep_${Date.now()}`,
                author: CURRENT_USER,
                content: replyInput,
                text: replyInput,
                createdAt: 'Just now',
              },
            ],
          };
        }
        return n;
      })
    );
    setReplyInput('');
  };

  const handleClearNote = () => {
    if (!selectedNote) return;
    setNotes((prev) =>
      prev.map((n) => (n.id === selectedNote.id ? { ...n, status: 'Resolved' as const } : n))
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#5B6478] mb-1">
            <Link href={`/engagements/${engagementId}`} className="hover:text-[#102654] font-medium">
              {MOCK_ENGAGEMENT.clientName}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#102654] font-semibold">Review Notes</span>
          </div>
          <h1 className="text-[28px] font-semibold text-[#102654] tracking-tight">
            Review Notes & Comments Hub
          </h1>
          <p className="text-sm text-[#5B6478] mt-0.5">
            {openCount > 0
              ? `! ${openCount} open review notes currently block partner sign-off.`
              : '✓ All review notes are resolved and sign-off unblocked.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/engagements/${engagementId}/sign-off`}>
            <Button
              variant="outline"
              size="md"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Sign-off checklist
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Split: Left Notes List + Right Selected Thread */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left List of Notes */}
        <div className="lg:col-span-5 bg-white border border-[#E3E7EF] rounded-[16px] overflow-hidden flex flex-col shadow-xs">
          {/* Tabs & Search */}
          <div className="p-4 border-b border-[#E3E7EF] flex flex-col gap-3">
            <Tabs
              tabs={tabs}
              activeTab={activeTab}
              onChange={(t) => setActiveTab(t as any)}
            />

            <div className="relative flex items-center w-full">
              <Search className="w-4 h-4 text-[#5B6478] absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search notes by ref, title, text..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full min-h-[44px] pl-9 pr-3 text-xs bg-[#F6F7FB] border border-[#D5DBE7] rounded-[10px] text-[#102654] placeholder:text-[#5B6478] focus-visible:outline-2 focus-visible:outline-[#FF7D6B] focus-visible:outline-offset-2"
              />
            </div>
          </div>

          <div className="divide-y divide-[#E3E7EF] overflow-y-auto max-h-[640px]">
            {filteredNotes.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#5B6478]">
                No review notes matching your selection.
              </div>
            ) : (
              filteredNotes.map((note) => {
                const isSelected = note.id === selectedNote?.id;
                const authorInfo = parseAuthor(note.author);

                return (
                  <div
                    key={note.id}
                    onClick={() => setSelectedNoteId(note.id)}
                    className={`p-4 transition-colors cursor-pointer flex flex-col gap-2 ${
                      isSelected
                        ? 'bg-[#FFF1EE]/40 border-l-4 border-l-[#FF7D6B]'
                        : 'hover:bg-[#F6F7FB]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#102654] bg-[#EAF5FC] px-2 py-0.5 rounded">
                        {note.workpaperRef}
                      </span>
                      <StatusPill status={note.status} size="sm" />
                    </div>

                    <div className="text-xs font-semibold text-[#102654]">
                      {note.workpaperTitle || note.workpaperName}
                    </div>

                    <p className="text-xs text-[#5B6478] line-clamp-2 leading-relaxed">
                      {note.content || note.text}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-[#5B6478] pt-1">
                      <div className="flex items-center gap-1.5">
                        <Avatar name={authorInfo.name} size="sm" />
                        <span>{authorInfo.name}</span>
                      </div>
                      <span className="font-mono">{note.createdAt}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Selected Thread Detail */}
        {selectedNote && (
          <div className="lg:col-span-7 bg-white border border-[#E3E7EF] rounded-[16px] p-6 flex flex-col gap-5 shadow-xs">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-[#E3E7EF]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm font-bold text-[#102654] px-2.5 py-0.5 rounded bg-[#EAF5FC]">
                    {selectedNote.workpaperRef}
                  </span>
                  <StatusPill status={selectedNote.status} />
                </div>
                <h2 className="text-lg font-semibold text-[#102654]">
                  {selectedNote.workpaperTitle || selectedNote.workpaperName}
                </h2>
                {selectedNote.cellRef && (
                  <div className="text-xs text-[#5B6478] mt-0.5 font-mono">
                    Anchor Target: cell <span className="font-semibold text-[#102654]">{selectedNote.cellRef}</span>
                  </div>
                )}
              </div>

              {/* "Go to cell" link */}
              <Link
                href={`/engagements/${engagementId}/workpapers/${selectedNote.workpaperId || 'wp_f10'}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B8432F] hover:text-[#912D1C] px-3 py-2 rounded-[10px] bg-[#FFF1EE] hover:bg-[#FFE3DE] transition-colors shrink-0"
              >
                <span>Open in workpaper</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Original Note Message */}
            {(() => {
              const origAuthor = parseAuthor(selectedNote.author);
              return (
                <div className="p-4 rounded-[12px] bg-[#F6F7FB] border border-[#E3E7EF] flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar name={origAuthor.name} avatarUrl={origAuthor.avatar} size="sm" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-[#102654]">
                            {origAuthor.name}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#5B6478]">
                          {origAuthor.title}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-[#5B6478]">
                      {selectedNote.createdAt}
                    </span>
                  </div>

                  <p className="text-xs text-[#102654] leading-relaxed mt-1">
                    {selectedNote.content || selectedNote.text}
                  </p>
                </div>
              );
            })()}

            {/* Thread Replies */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5B6478]">
                Responses ({(selectedNote.replies || []).length})
              </span>

              {(selectedNote.replies || []).length === 0 ? (
                <div className="p-4 rounded-[10px] bg-[#F6F7FB] text-xs text-[#5B6478] text-center border border-dashed border-[#D5DBE7]">
                  No replies yet. Awaiting response.
                </div>
              ) : (
                (selectedNote.replies || []).map((reply) => {
                  const replyAuthor = parseAuthor(reply.author);
                  return (
                    <div
                      key={reply.id}
                      className="p-3.5 rounded-[12px] bg-[#EAF5FC]/50 border border-[#1D4E89]/20 flex flex-col gap-2 ml-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar name={replyAuthor.name} avatarUrl={replyAuthor.avatar} size="sm" />
                          <div>
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#102654]">
                              <span>{replyAuthor.name}</span>
                            </div>
                            <div className="text-[10px] text-[#5B6676]">
                              {replyAuthor.title}
                            </div>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono text-[#5B6478]">
                          {reply.createdAt}
                        </span>
                      </div>
                      <p className="text-xs text-[#102654] leading-relaxed">
                        {reply.content || reply.text}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Reply Box and Action Buttons */}
            <div className="pt-3 border-t border-[#E3E7EF] flex flex-col gap-3">
              <label htmlFor="review-reply-input" className="text-xs font-semibold uppercase tracking-wider text-[#5B6478]">
                Post Auditor Response
              </label>
              <textarea
                id="review-reply-input"
                rows={3}
                value={replyInput}
                onChange={(e) => setReplyInput(e.target.value)}
                placeholder="Provide explanation, reference attached vouching support, or propose next steps..."
                className="w-full p-3 text-xs border border-[#D5DBE7] rounded-[10px] bg-white text-[#102654] focus-visible:outline-2 focus-visible:outline-[#FF7D6B] focus-visible:outline-offset-2"
              />

              <div className="flex items-center justify-between">
                {selectedNote.status !== 'Resolved' && selectedNote.status !== 'Cleared' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Check className="w-3.5 h-3.5 text-[#0B6B52]" />}
                    onClick={handleClearNote}
                  >
                    Resolve review note
                  </Button>
                ) : (
                  <span className="text-xs font-semibold text-[#0B6B52] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Resolved & sign-off unblocked</span>
                  </span>
                )}

                <Button
                  variant="primary"
                  size="sm"
                  icon={<Send className="w-3.5 h-3.5" />}
                  onClick={handleSendReply}
                >
                  Send reply
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

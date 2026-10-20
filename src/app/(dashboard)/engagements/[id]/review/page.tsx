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
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatusPill } from '@/components/ui/StatusPill';
import { Tabs } from '@/components/ui/Tabs';
import { Avatar } from '@/components/ui/Avatar';
import { getReviewNotes } from '@/lib/api';
import { ReviewNoteItem } from '@/lib/types';
import { MOCK_ENGAGEMENT, CURRENT_USER } from '@/lib/mock';

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
  }, [engagementId]);

  const openCount = notes.filter((n) => n.status === 'Open').length;
  const waitingCount = notes.filter((n) => n.status === 'Waiting on me').length;
  const clearedCount = notes.filter((n) => n.status === 'Cleared').length;

  const tabs = [
    { id: 'open', label: 'Open', count: openCount },
    { id: 'waiting', label: 'Waiting on me', count: waitingCount },
    { id: 'cleared', label: 'Cleared', count: clearedCount },
    { id: 'all', label: 'All Notes', count: notes.length },
  ];

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.workpaperRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.workpaperTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'open') return n.status === 'Open';
    if (activeTab === 'waiting') return n.status === 'Waiting on me';
    if (activeTab === 'cleared') return n.status === 'Cleared';
    return true;
  });

  const selectedNote = notes.find((n) => n.id === selectedNoteId) || notes[0];

  const handleSendReply = () => {
    if (!replyInput.trim() || !selectedNote) return;
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id === selectedNote.id) {
          return {
            ...n,
            replies: [
              ...n.replies,
              {
                id: `rep_${Date.now()}`,
                author: CURRENT_USER,
                content: replyInput,
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
      prev.map((n) => (n.id === selectedNote.id ? { ...n, status: 'Cleared' as const } : n))
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#5B6676] mb-1">
            <Link href={`/engagements/${engagementId}`} className="hover:text-[#1E4FD8] font-medium">
              {MOCK_ENGAGEMENT.clientName}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#1B2430] font-semibold">Review Notes</span>
          </div>
          <h1 className="text-[28px] font-semibold text-[#1B2430] tracking-tight">
            Review Notes & Coaching Points
          </h1>
          <p className="text-sm text-[#5B6676] mt-0.5">
            12 open review points block partner final sign-off.
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
        <div className="lg:col-span-5 bg-white border border-[#E3E6EB] rounded-[14px] overflow-hidden flex flex-col">
          {/* Tabs & Search */}
          <div className="p-4 border-b border-[#E3E6EB] flex flex-col gap-3">
            <Tabs
              tabs={tabs}
              activeTab={activeTab}
              onChange={(t) => setActiveTab(t as any)}
            />

            <div className="relative flex items-center w-full">
              <Search className="w-4 h-4 text-[#5B6676] absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search notes by ref, title, text..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full min-h-[38px] pl-9 pr-3 text-xs bg-[#F4F5F7] border border-[#D5D9E0] rounded-[10px] text-[#1B2430] placeholder:text-[#5B6676] focus-visible:outline-2 focus-visible:outline-[#1E4FD8] focus-visible:outline-offset-2"
              />
            </div>
          </div>

          <div className="divide-y divide-[#E3E6EB] overflow-y-auto max-h-[640px]">
            {filteredNotes.map((note) => {
              const isSelected = note.id === selectedNote?.id;

              return (
                <div
                  key={note.id}
                  onClick={() => setSelectedNoteId(note.id)}
                  className={`p-4 transition-colors cursor-pointer flex flex-col gap-2 ${
                    isSelected ? 'bg-[#E8EEFD]/30 border-l-4 border-l-[#1E4FD8]' : 'hover:bg-[#F8F9FA]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono-numbers font-bold text-xs text-[#1E4FD8]">
                      {note.workpaperRef}
                    </span>
                    <StatusPill status={note.status} size="sm" />
                  </div>

                  <div className="text-xs font-semibold text-[#1B2430]">
                    {note.workpaperTitle}
                  </div>

                  <p className="text-xs text-[#5B6676] line-clamp-2 leading-relaxed">
                    {note.content}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-[#5B6676] pt-1">
                    <div className="flex items-center gap-1.5">
                      <Avatar name={note.author.name} size="sm" />
                      <span>{note.author.name}</span>
                    </div>
                    <span className="font-mono-numbers">{note.createdAt}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Selected Thread Detail */}
        {selectedNote && (
          <div className="lg:col-span-7 bg-white border border-[#E3E6EB] rounded-[14px] p-6 flex flex-col gap-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-[#E3E6EB]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono-numbers text-sm font-bold text-[#1E4FD8] px-2 py-0.5 rounded bg-[#E8EEFD]">
                    {selectedNote.workpaperRef}
                  </span>
                  <StatusPill status={selectedNote.status} />
                </div>
                <h2 className="text-lg font-semibold text-[#1B2430]">
                  {selectedNote.workpaperTitle}
                </h2>
                {selectedNote.cellRef && (
                  <div className="text-xs text-[#5B6676] mt-0.5 font-mono-numbers">
                    Cell Target: {selectedNote.cellRef}
                  </div>
                )}
              </div>

              {/* "Go to cell" link */}
              <Link
                href={`/engagements/${engagementId}/workpapers/wp_b10`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E4FD8] hover:text-[#163BA3] px-3 py-1.5 rounded-[8px] bg-[#E8EEFD] hover:bg-[#d8e4fb] transition-colors shrink-0"
              >
                <span>Go to cell in editor</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Original Note Message */}
            <div className="p-4 rounded-[12px] bg-[#F8F9FA] border border-[#E3E6EB] flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar name={selectedNote.author.name} avatarUrl={selectedNote.author.avatar} size="sm" />
                  <div>
                    <div className="text-xs font-semibold text-[#1B2430]">
                      {selectedNote.author.name}
                    </div>
                    <div className="text-[11px] text-[#5B6676]">
                      {selectedNote.author.title}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-mono-numbers text-[#5B6676]">
                  {selectedNote.createdAt}
                </span>
              </div>

              <p className="text-xs text-[#1B2430] leading-relaxed mt-1">
                {selectedNote.content}
              </p>
            </div>

            {/* Thread Replies */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5B6676]">
                Responses ({selectedNote.replies.length})
              </span>

              {selectedNote.replies.length === 0 ? (
                <div className="p-4 rounded-[10px] bg-[#F8F9FA] text-xs text-[#5B6676] text-center">
                  No replies yet. Awaiting preparer response.
                </div>
              ) : (
                selectedNote.replies.map((reply) => (
                  <div
                    key={reply.id}
                    className="p-3.5 rounded-[12px] bg-[#E8EEFD]/30 border border-[#1E4FD8]/20 flex flex-col gap-2 ml-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar name={reply.author.name} avatarUrl={reply.author.avatar} size="sm" />
                        <div>
                          <div className="text-xs font-semibold text-[#1E4FD8]">
                            {reply.author.name}
                          </div>
                          <div className="text-[10px] text-[#5B6676]">
                            {reply.author.title}
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono-numbers text-[#5B6676]">
                        {reply.createdAt}
                      </span>
                    </div>
                    <p className="text-xs text-[#1B2430] leading-relaxed">
                      {reply.content}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Reply Box and Action Buttons */}
            <div className="pt-3 border-t border-[#E3E6EB] flex flex-col gap-3">
              <label htmlFor="review-reply-input" className="text-xs font-semibold uppercase tracking-wider text-[#5B6676]">
                Post Auditor Response
              </label>
              <textarea
                id="review-reply-input"
                rows={3}
                value={replyInput}
                onChange={(e) => setReplyInput(e.target.value)}
                placeholder="Provide explanation, reference attached vouching support, or propose next steps..."
                className="w-full p-3 text-xs border border-[#D5D9E0] rounded-[10px] bg-white text-[#1B2430] focus-visible:outline-2 focus-visible:outline-[#1E4FD8] focus-visible:outline-offset-2"
              />

              <div className="flex items-center justify-between">
                {selectedNote.status !== 'Cleared' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Check className="w-3.5 h-3.5 text-[#0B6B4D]" />}
                    onClick={handleClearNote}
                  >
                    Mark as cleared
                  </Button>
                ) : (
                  <span className="text-xs font-semibold text-[#0B6B4D] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Cleared and archived</span>
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
